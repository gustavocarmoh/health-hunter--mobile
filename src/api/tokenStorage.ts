import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const ACCESS_TOKEN_KEY = 'solo-leveling:accessToken'
const REFRESH_TOKEN_KEY = 'solo-leveling:refreshToken'

// Tokens ficam no Keychain (iOS) / Keystore (Android) via SecureStore.
// Na web o SecureStore não existe, então cai para AsyncStorage.
const useSecure = Platform.OS !== 'web'

// SecureStore só aceita chaves com [A-Za-z0-9._-]
const secureKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '.')

async function getItem(key: string): Promise<string | null> {
  if (!useSecure) return AsyncStorage.getItem(key)
  const secure = await SecureStore.getItemAsync(secureKey(key))
  if (secure) return secure
  // Migração: tokens gravados por versões antigas em AsyncStorage
  const legacy = await AsyncStorage.getItem(key)
  if (legacy) {
    await SecureStore.setItemAsync(secureKey(key), legacy)
    await AsyncStorage.removeItem(key)
  }
  return legacy
}

async function setItem(key: string, value: string): Promise<void> {
  if (!useSecure) return AsyncStorage.setItem(key, value)
  await SecureStore.setItemAsync(secureKey(key), value)
}

async function removeItem(key: string): Promise<void> {
  if (!useSecure) return AsyncStorage.removeItem(key)
  await SecureStore.deleteItemAsync(secureKey(key))
  await AsyncStorage.removeItem(key)
}

export class TokenStorage {
  static async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY)
  }

  static async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY)
  }

  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([setItem(ACCESS_TOKEN_KEY, accessToken), setItem(REFRESH_TOKEN_KEY, refreshToken)])
  }

  static async clearTokens(): Promise<void> {
    await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)])
  }

  static async setAccessToken(token: string): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, token)
  }
}
