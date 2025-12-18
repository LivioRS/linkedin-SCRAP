export interface ClaudeConfig {
  apiKey: string
  model?: string
}

export interface SentimentAnalysis {
  sentimentScore: number
  sentimentExplanation: string
  positive: number
  neutral: number
  negative: number
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
    ? `Métricas de engajamento:
- Curtidas: ${metadata.likes || 0}
- Comentários: ${metadata.comments || 0}
- Compartilhamentos: ${metadata.shares || 0}
${metadata.views ? `- Visualizações: ${metadata.views}` : ''}`
    : ''
}
Forneça uma análise detalhada respondendo em JSON puro com a seguinte estrutura EXATA:
{
  "sentimentScore": <número de -1 a 1>,
  "sentimentExplanation": "<explicação detalhada do sentimento em português>",
  "positive": <porcentagem 0-100>,
  "neutral": <porcentagem 0-100>,
  "negative": <porcentagem 0-100>,
  "themes": ["<tema1>", "<tema2>"],
  "riskLevel": "<low, medium, high>",
  "recommendations": ["<recomendação1>"]
}
Responda APENAS com o JSON.`

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
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erro na API do Claude')
    }

    const data = await response.json()
    const contentText = data.content[0].text
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
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    })
    return response.status !== 401
  } catch {
    return false
  }
}
