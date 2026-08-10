import { TokenStorage } from './tokenStorage'

type OnUnauthorizedCallback = () => void

class AuthHandler {
  private onUnauthorizedCallbacks: OnUnauthorizedCallback[] = []

  registerOnUnauthorized(callback: OnUnauthorizedCallback) {
    this.onUnauthorizedCallbacks.push(callback)
  }

  async handleUnauthorized() {
    await TokenStorage.clearTokens()
    this.onUnauthorizedCallbacks.forEach((cb) => cb())
  }
}

export const authHandler = new AuthHandler()
