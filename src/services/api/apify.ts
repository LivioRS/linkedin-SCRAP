/**
 * Serviço de integração com Apify para coleta de dados
 */

export interface ApifyConfig {
  apiKey: string
  actorId?: string
  taskId?: string
}

export interface ApifyScrapeResult {
  success: boolean
  data?: any[]
  error?: string
  itemsCollected?: number
  durationMs?: number
}

export interface LinkedInPost {
  id: string
  text: string
  url: string
  author: string
  likes: number
  comments: number
  shares: number
  views?: number
  postedAt: string
}

/**
 * Executa scraping do LinkedIn usando Apify
 */
export async function scrapeLinkedIn(
  config: ApifyConfig,
  companyUrl: string,
  options?: {
    maxPosts?: number
    maxComments?: number
  },
): Promise<ApifyScrapeResult> {
  try {
    const { apiKey, actorId = 'apify/linkedin-scraper', taskId } = config
    const { maxPosts = 50, maxComments = 10 } = options || {}

    if (!apiKey) {
      throw new Error('API Key do Apify não configurada')
    }

    // Se tiver taskId, usar task existente
    if (taskId) {
      const runResponse = await fetch(
        `https://api.apify.com/v2/actor-tasks/${taskId}/runs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            startUrls: [{ url: companyUrl }],
            maxPosts,
            maxComments,
          }),
        },
      )

      if (!runResponse.ok) {
        const error = await runResponse.json()
        throw new Error(error.message || 'Erro ao executar task do Apify')
      }

      const runData = await runResponse.json()
      const runId = runData.data.id

      // Aguardar conclusão do run
      let status = 'RUNNING'
      let attempts = 0
      const maxAttempts = 60 // 5 minutos máximo

      while (status === 'RUNNING' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)) // Aguardar 5s

        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        )

        const statusData = await statusResponse.json()
        status = statusData.data.status

        attempts++
      }

      if (status !== 'SUCCEEDED') {
        throw new Error(`Scraping falhou com status: ${status}`)
      }

      // Buscar resultados
      const resultsResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )

      const results = await resultsResponse.json()

      return {
        success: true,
        data: results,
        itemsCollected: results.length,
        durationMs: attempts * 5000,
      }
    }

    // Usar actor diretamente
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          startUrls: [{ url: companyUrl }],
          maxPosts,
          maxComments,
        }),
      },
    )

    if (!runResponse.ok) {
      const error = await runResponse.json()
      throw new Error(error.message || 'Erro ao executar actor do Apify')
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Aguardar conclusão
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )

      const statusData = await statusResponse.json()
      status = statusData.data.status
      attempts++
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Scraping falhou com status: ${status}`)
    }

    // Buscar resultados
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    )

    const results = await resultsResponse.json()

    return {
      success: true,
      data: results,
      itemsCollected: results.length,
      durationMs: attempts * 5000,
    }
  } catch (error) {
    console.error('Erro no scraping do Apify:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro desconhecido no Apify',
    }
  }
}

/**
 * Valida a API Key do Apify
 */
export async function validateApifyKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.apify.com/v2/users/me', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok
  } catch {
    return false
  }
}
