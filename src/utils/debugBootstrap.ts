// Debug script to troubleshoot bootstrap issues
import { httpClient } from '../api/client'
import { TokenStorage } from '../api/tokenStorage'

export async function debugBootstrap() {
  console.log('🔍 DEBUG BOOTSTRAP START')

  try {
    // 1. Check token
    const token = await TokenStorage.getAccessToken()
    console.log('📋 Token exists:', !!token)
    if (token) {
      console.log('   Token preview:', token.substring(0, 50) + '...')
    }

    // 2. Test basic connectivity
    console.log('\n🌐 Testing connectivity...')
    try {
      const profileRes = await httpClient.get('/hunters/profile')
      console.log('✅ GET /hunters/profile → 200')
      console.log('   User:', profileRes.data.name)
    } catch (err: any) {
      console.error('❌ GET /hunters/profile failed')
      console.error('   Status:', err.response?.status)
      console.error('   Error:', err.message)
    }

    // 3. Test friends
    console.log('\n👥 Testing friends...')
    try {
      const friendsRes = await httpClient.get('/hunters/friends', {
        params: { page: 1, limit: 10 }
      })
      console.log('✅ GET /hunters/friends → 200')
      console.log('   Friends count:', friendsRes.data.friends?.length || 0)
    } catch (err: any) {
      console.error('❌ GET /hunters/friends failed')
      console.error('   Status:', err.response?.status)
      console.error('   Error:', err.message)
    }

    // 4. Test guilds
    console.log('\n🏰 Testing guilds...')
    try {
      const guildsRes = await httpClient.get('/guilds', {
        params: { page: 1, limit: 20 }
      })
      console.log('✅ GET /guilds → 200')
      console.log('   Guilds count:', guildsRes.data.guilds?.length || 0)
    } catch (err: any) {
      console.error('❌ GET /guilds failed')
      console.error('   Status:', err.response?.status)
      console.error('   Error:', err.message)
    }

    // 5. Test achievements
    console.log('\n🏆 Testing achievements...')
    try {
      const achievementsRes = await httpClient.get('/achievements/mine')
      console.log('✅ GET /achievements/mine → 200')
      console.log('   Achievements count:', achievementsRes.data.achievements?.length || 0)
    } catch (err: any) {
      console.error('❌ GET /achievements/mine failed')
      console.error('   Status:', err.response?.status)
      console.error('   Error:', err.message)
    }

    console.log('\n🔍 DEBUG BOOTSTRAP END')
  } catch (error) {
    console.error('🚨 Unexpected error:', error)
  }
}
