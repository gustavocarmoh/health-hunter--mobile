import axios, { AxiosInstance, AxiosError } from 'axios'
import { TokenStorage } from './tokenStorage'
import { authHandler } from './authHandler'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.35:3000'

console.log('🌐 API URL:', API_URL)

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    onSuccess: (token: string) => void
    onError: (error: AxiosError) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor de request — adiciona Bearer token
    this.client.interceptors.request.use(
      async (config) => {
        console.log('🔐 Request interceptor:', config.method?.toUpperCase(), config.url)
        const token = await TokenStorage.getAccessToken()
        console.log('🔐 Token retrieved:', !!token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log('🔐 Request ready to send')
        return config
      },
      (error) => {
        console.error('🔐 Request interceptor error:', error)
        return Promise.reject(error)
      },
    )

    // Interceptor de response — trata 401 com refresh
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ Response:', response.status, response.config.method?.toUpperCase(), response.config.url)
        return response
      },
      async (error: AxiosError) => {
        // Silenciar erros 409 (Conflict) - são tratados pela aplicação
        if (error.response?.status !== 409) {
          console.error('❌ Response error:', error.message, error.response?.status, error.config?.url)
        }
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Fila a requisição enquanto refresh está em progresso
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                onSuccess: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                  resolve(this.client(originalRequest))
                },
                onError: (err) => reject(err),
              })
            })
          }

          this.isRefreshing = true
          originalRequest._retry = true

          try {
            const refreshToken = await TokenStorage.getRefreshToken()
            if (!refreshToken) {
              await this.handleLogout()
              return Promise.reject(error)
            }

            const response = await this.client.post('/auth/refresh-token', {
              refresh_token: refreshToken,
            })

            const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data

            await TokenStorage.setTokens(newAccessToken, newRefreshToken)

            // Processa fila de requisições
            this.failedQueue.forEach((prom) => prom.onSuccess(newAccessToken))
            this.failedQueue = []

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.onError(refreshError as AxiosError))
            this.failedQueue = []

            await this.handleLogout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      },
    )
  }

  private async handleLogout(): Promise<void> {
    await authHandler.handleUnauthorized()
  }

  getInstance(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()
export const httpClient = apiClient.getInstance()
