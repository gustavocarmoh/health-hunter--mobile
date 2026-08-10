import { httpClient } from './client'

export interface StoreItem {
  id: string
  name: string
  description: string
  price_coins: number
  price_xp?: number
  icon_url?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type: 'cosmetic' | 'consumable' | 'equipment'
  is_available: boolean
}

export interface InventoryItem {
  id: string
  item_id: string
  name: string
  quantity: number
  purchased_at: string
  type: 'cosmetic' | 'consumable' | 'equipment'
}

const storeApi = {
  async getItems(): Promise<StoreItem[]> {
    const response = await httpClient.get<StoreItem[]>('/store/items')
    return response.data
  },

  async getItem(id: string): Promise<StoreItem> {
    const response = await httpClient.get<StoreItem>(`/store/items/${id}`)
    return response.data
  },

  async getInventory(): Promise<InventoryItem[]> {
    const response = await httpClient.get<InventoryItem[]>('/store/inventory')
    return response.data
  },

  async purchase(itemId: string): Promise<{
    message: string
    coins_remaining: number
    item: InventoryItem
  }> {
    const response = await httpClient.post<{
      message: string
      coins_remaining: number
      item: InventoryItem
    }>('/store/purchase', { item_id: itemId })
    return response.data
  },

  async useItem(inventoryItemId: string): Promise<{ message: string }> {
    const response = await httpClient.post<{ message: string }>(
      `/store/inventory/${inventoryItemId}/use`,
      {},
    )
    return response.data
  },
}

export default storeApi
