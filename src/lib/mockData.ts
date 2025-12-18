// Dados mock para visualizações de sentimento

export interface ClientSentimentData {
  clientId: string
  clientName: string
  data: Array<{
    date: string
    sentiment: number
    volume: number
  }>
}

export interface HeatmapDataPoint {
  date: string
  clientId: string
  sentiment: number
  volume: number
}

export const mockClientNames = [
  'Grupo Plaenge',
  'Vanguard',
  'A.Yoshii Engenharia',
]

export const mockClientsData: ClientSentimentData[] = [
  {
    clientId: '1',
    clientName: 'Grupo Plaenge',
    data: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 86400000)
        .toISOString()
        .split('T')[0]
      return {
        date,
        sentiment:
          Math.sin((i / 30) * Math.PI * 2) * 0.4 + (Math.random() - 0.5) * 0.3,
        volume: Math.floor(Math.random() * 20) + 5,
      }
    }),
  },
  {
    clientId: '2',
    clientName: 'Vanguard',
    data: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 86400000)
        .toISOString()
        .split('T')[0]
      return {
        date,
        sentiment:
          Math.sin((i / 30) * Math.PI * 2 + Math.PI / 3) * 0.5 +
          (Math.random() - 0.5) * 0.2,
        volume: Math.floor(Math.random() * 15) + 3,
      }
    }),
  },
  {
    clientId: '3',
    clientName: 'A.Yoshii Engenharia',
    data: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 86400000)
        .toISOString()
        .split('T')[0]
      return {
        date,
        sentiment:
          Math.sin((i / 30) * Math.PI * 2 - Math.PI / 3) * 0.3 +
          (Math.random() - 0.5) * 0.4,
        volume: Math.floor(Math.random() * 18) + 4,
      }
    }),
  },
]

export const mockHeatmapData: HeatmapDataPoint[] = []
const clients = ['1', '2', '3']
const clientNames = ['Grupo Plaenge', 'Vanguard', 'A.Yoshii Engenharia']

Array.from({ length: 30 }).forEach((_, dayIndex) => {
  const date = new Date(Date.now() - (29 - dayIndex) * 86400000)
    .toISOString()
    .split('T')[0]

  clients.forEach((clientId, clientIndex) => {
    mockHeatmapData.push({
      date,
      clientId,
      sentiment:
        Math.sin((dayIndex / 30) * Math.PI * 2 + (clientIndex * Math.PI) / 3) *
          0.4 +
        (Math.random() - 0.5) * 0.3,
      volume: Math.floor(Math.random() * 20) + 3,
    })
  })
})
