/**
 * Serviço de integração com Claude (Anthropic) para análise de sentimento
 */

export interface ClaudeConfig {
  apiKey: string
  model?: string
}

export interface SentimentAnalysis {
  sentimentScore: number // -1 a 1
  sentimentExplanation: string
  positive: number // 0-100
  neutral: number // 0-100
  negative: number // 0-100
  themes: string[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations?: string[]
}

export interface AnalyzeContentParams {
  content: string
  author?: string
  platform?: string
  metadata?: {
    likes?: number
    comments?: number
    shares?: number
    views?: number
  }
}

/**
 * Analisa o sentimento de um conteúdo usando Claude
 */
export async function analyzeSentiment(
  config: ClaudeConfig,
  params: AnalyzeContentParams,
): Promise<SentimentAnalysis> {
  try {
    const { apiKey, model = 'claude-sonnet-4-20250514' } = config
    const { content, author, platform = 'LinkedIn', metadata } = params

    if (!apiKey) {
      throw new Error('API Key do Claude não configurada')
    }

    const prompt = `Você é um especialista em análise de sentimento e reputação online.

Analise o seguinte conteúdo do ${platform}${author ? ` publicado por ${author}` : ''}:

"${content}"

${
  metadata
    ? `
Métricas de engajamento:
- Curtidas: ${metadata.likes || 0}
- Comentários: ${metadata.comments || 0}
- Compartilhamentos: ${metadata.shares || 0}
${metadata.views ? `- Visualizações: ${metadata.views}` : ''}
`
    : ''
}

Forneça uma análise detalhada respondendo em JSON puro (sem markdown, sem blocos de código) com a seguinte estrutura EXATA:

{
  "sentimentScore": <número de -1 a 1, onde -1 é muito negativo e 1 é muito positivo>,
  "sentimentExplanation": "<explicação detalhada do sentimento em português>",
  "positive": <porcentagem de 0 a 100>,
  "neutral": <porcentagem de 0 a 100>,
  "negative": <porcentagem de 0 a 100>,
  "themes": ["<tema1>", "<tema2>", "<tema3>"],
  "riskLevel": "<low, medium ou high>",
  "recommendations": ["<recomendação1>", "<recomendação2>"]
}

Critérios:
- sentimentScore: -1 (muito negativo) a 1 (muito positivo)
- positive + neutral + negative deve somar 100
- riskLevel: low (score > 0.3), medium (-0.3 a 0.3), high (< -0.3)
- themes: principais temas/tópicos identificados no conteúdo
- recommendations: ações práticas para melhorar ou manter a reputação (se aplicável)

Responda APENAS com o JSON, sem texto adicional.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erro na API do Claude')
    }

    const data = await response.json()
    const contentText = data.content[0].text

    // Extrair JSON da resposta
    const jsonMatch = contentText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Resposta do Claude não contém JSON válido')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return {
      sentimentScore: analysis.sentimentScore || 0,
      sentimentExplanation:
        analysis.sentimentExplanation || 'Análise não disponível',
      positive: analysis.positive || 0,
      neutral: analysis.neutral || 0,
      negative: analysis.negative || 0,
      themes: analysis.themes || [],
      riskLevel: analysis.riskLevel || 'medium',
      recommendations: analysis.recommendations || [],
    }
  } catch (error) {
    console.error('Erro na análise do Claude:', error)
    throw error instanceof Error
      ? error
      : new Error('Erro desconhecido na análise do Claude')
  }
}

/**
 * Analisa múltiplos conteúdos em batch
 */
export async function analyzeBatch(
  config: ClaudeConfig,
  contents: AnalyzeContentParams[],
): Promise<SentimentAnalysis[]> {
  const results: SentimentAnalysis[] = []

  // Processar em lotes para evitar rate limits
  const batchSize = 5
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((content) => analyzeSentiment(config, content)),
    )
    results.push(...batchResults)

    // Aguardar entre lotes para evitar rate limits
    if (i + batchSize < contents.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Valida a API Key do Claude
 */
export async function validateClaudeKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    })

    // Se retornar erro de autenticação, a chave é inválida
    // Se retornar outro erro (como validação), a chave é válida
    return response.status !== 401
  } catch {
    return false
  }
}
