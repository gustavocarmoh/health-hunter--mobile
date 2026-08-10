import { httpClient } from './client'

const huntersApi = {
  async allocateStat(attribute: string): Promise<{ stats: Record<string, number> }> {
    const response = await httpClient.post<{ stats: Record<string, number> }>(
      '/hunters/stats/allocate',
      { attribute }
    )
    return response.data
  },
}

export default huntersApi
