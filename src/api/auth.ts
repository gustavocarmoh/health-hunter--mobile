import { httpClient } from './client'
import { TokenStorage } from './tokenStorage'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    rank: string
    xp: number
  }
}

export interface MeResponse {
  id: string
  email: string
  name: string
  role: string
  rank_level: string
  xp: number
  coins: number
  stat_points_available: number
  strength: number
  intel: number
  vitality: number
  sense: number
  agility: number
  avatar_url?: string | null
  bio?: string
}

const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/login', data)
    const { access_token, refresh_token } = response.data
    await TokenStorage.setTokens(access_token, refresh_token)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/register', data)
    const { access_token, refresh_token } = response.data
    await TokenStorage.setTokens(access_token, refresh_token)
    return response.data
  },

  async getMe(): Promise<MeResponse> {
    const response = await httpClient.get<MeResponse>('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    const refreshToken = await TokenStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await httpClient.post('/auth/logout', { refresh_token: refreshToken })
      } catch {
        // Ignora erros ao fazer logout no servidor
      }
    }
    await TokenStorage.clearTokens()
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/refresh-token', {
      refresh_token: refreshToken,
    })
    const { access_token, refresh_token: newRefreshToken } = response.data
    await TokenStorage.setTokens(access_token, newRefreshToken)
    return response.data
  },
}

export default authApi
