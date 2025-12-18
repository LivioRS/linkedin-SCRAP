/**
 * Módulos de monitoramento para diferentes plataformas sociais
 */

import { scrapeLinkedIn, ApifyScrapeResult } from '../api/apify'
import { analyzeSentiment, AnalyzeContentParams } from '../api/claude'
import { sendAlert, TelegramConfig } from '../api/telegram'
import { Post, Client } from '@/types'

export type Platform =
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'youtube'

export interface PlatformScraper {
  scrape: (
    client: Client,
    config: any,
  ) => Promise<{ success: boolean; posts: Post[]; error?: string }>
}

export interface PlatformConfig {
  platform: Platform
  apiKey?: string
  accessToken?: string
  taskId?: string
  enabled: boolean
}

/**
 * Módulo de monitoramento do LinkedIn
 */
export class LinkedInMonitor implements PlatformScraper {
  async scrape(
    client: Client,
    config: { apifyApiKey: string; apifyTaskId?: string },
  ): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      const result = await scrapeLinkedIn(
        {
          apiKey: config.apifyApiKey,
          taskId: config.apifyTaskId,
        },
        client.url,
        {
          maxPosts: 50,
          maxComments: 10,
        },
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          posts: [],
          error: result.error,
        }
      }

      // Converter dados do Apify para formato interno
      const posts: Post[] = result.data.map((item: any, index: number) => ({
        id: `linkedin-${client.id}-${index}`,
        clientId: client.id,
        content: item.text || item.content || '',
        likes: item.likes || 0,
        comments: item.comments || 0,
        shares: item.shares || 0,
        views: item.views || 0,
        sentimentScore: 0, // Será preenchido pela análise
        sentimentExplanation: '',
        postedAt: item.postedAt || item.createdAt || new Date().toISOString(),
        url: item.url || item.link || '#',
      }))

      return { success: true, posts }
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}

/**
 * Módulo de monitoramento do Instagram
 */
export class InstagramMonitor implements PlatformScraper {
  async scrape(
    client: Client,
    config: { apifyApiKey: string; apifyTaskId?: string },
  ): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      // Usar Apify com actor específico do Instagram
      const result = await scrapeLinkedIn(
        {
          apiKey: config.apifyApiKey,
          actorId: 'apify/instagram-scraper',
          taskId: config.apifyTaskId,
        },
        client.url,
        {
          maxPosts: 30,
          maxComments: 5,
        },
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          posts: [],
          error: result.error,
        }
      }

      const posts: Post[] = result.data.map((item: any, index: number) => ({
        id: `instagram-${client.id}-${index}`,
        clientId: client.id,
        content: item.caption || item.text || '',
        likes: item.likesCount || item.likes || 0,
        comments: item.commentsCount || item.comments || 0,
        shares: 0, // Instagram não tem shares
        views: item.viewsCount || item.views || 0,
        sentimentScore: 0,
        sentimentExplanation: '',
        postedAt: item.timestamp || item.createdAt || new Date().toISOString(),
        url: item.url || item.shortCode || '#',
      }))

      return { success: true, posts }
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}

/**
 * Módulo de monitoramento do Facebook
 */
export class FacebookMonitor implements PlatformScraper {
  async scrape(
    client: Client,
    config: { apifyApiKey: string; accessToken?: string },
  ): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      // Usar Apify com actor específico do Facebook
      const result = await scrapeLinkedIn(
        {
          apiKey: config.apifyApiKey,
          actorId: 'apify/facebook-scraper',
        },
        client.url,
        {
          maxPosts: 30,
        },
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          posts: [],
          error: result.error,
        }
      }

      const posts: Post[] = result.data.map((item: any, index: number) => ({
        id: `facebook-${client.id}-${index}`,
        clientId: client.id,
        content: item.text || item.message || '',
        likes: item.likesCount || item.likes || 0,
        comments: item.commentsCount || item.comments || 0,
        shares: item.sharesCount || item.shares || 0,
        views: 0,
        sentimentScore: 0,
        sentimentExplanation: '',
        postedAt:
          item.createdTime || item.timestamp || new Date().toISOString(),
        url: item.postUrl || item.url || '#',
      }))

      return { success: true, posts }
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}

/**
 * Módulo de monitoramento do X (Twitter)
 */
export class TwitterMonitor implements PlatformScraper {
  async scrape(
    client: Client,
    config: { apifyApiKey: string; accessToken?: string },
  ): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      // Usar Apify com actor específico do Twitter/X
      const result = await scrapeLinkedIn(
        {
          apiKey: config.apifyApiKey,
          actorId: 'apify/twitter-scraper',
        },
        client.url,
        {
          maxPosts: 50,
        },
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          posts: [],
          error: result.error,
        }
      }

      const posts: Post[] = result.data.map((item: any, index: number) => ({
        id: `twitter-${client.id}-${index}`,
        clientId: client.id,
        content: item.text || item.fullText || '',
        likes: item.likesCount || item.favoriteCount || 0,
        comments: item.repliesCount || item.replyCount || 0,
        shares: item.retweetsCount || item.retweetCount || 0,
        views: item.viewsCount || item.views || 0,
        sentimentScore: 0,
        sentimentExplanation: '',
        postedAt: item.createdAt || item.timestamp || new Date().toISOString(),
        url: item.url || item.tweetUrl || '#',
      }))

      return { success: true, posts }
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}

/**
 * Módulo de monitoramento do YouTube
 */
export class YouTubeMonitor implements PlatformScraper {
  async scrape(
    client: Client,
    config: { apifyApiKey: string; apiKey?: string },
  ): Promise<{ success: boolean; posts: Post[]; error?: string }> {
    try {
      // Usar Apify com actor específico do YouTube
      const result = await scrapeLinkedIn(
        {
          apiKey: config.apifyApiKey,
          actorId: 'apify/youtube-scraper',
        },
        client.url,
        {
          maxPosts: 20,
        },
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          posts: [],
          error: result.error,
        }
      }

      const posts: Post[] = result.data.map((item: any, index: number) => ({
        id: `youtube-${client.id}-${index}`,
        clientId: client.id,
        content: item.title || item.description || '',
        likes: item.likesCount || item.likes || 0,
        comments: item.commentsCount || item.comments || 0,
        shares: 0,
        views: item.viewCount || item.views || 0,
        sentimentScore: 0,
        sentimentExplanation: '',
        postedAt:
          item.publishedAt || item.uploadDate || new Date().toISOString(),
        url: item.url || item.videoUrl || '#',
      }))

      return { success: true, posts }
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}

/**
 * Factory para obter o monitor correto baseado na plataforma
 */
export function getPlatformMonitor(platform: Platform): PlatformScraper {
  switch (platform) {
    case 'linkedin':
      return new LinkedInMonitor()
    case 'instagram':
      return new InstagramMonitor()
    case 'facebook':
      return new FacebookMonitor()
    case 'twitter':
      return new TwitterMonitor()
    case 'youtube':
      return new YouTubeMonitor()
    default:
      throw new Error(`Plataforma não suportada: ${platform}`)
  }
}

/**
 * Processa posts coletados: analisa sentimento e envia alertas se necessário
 */
export async function processPosts(
  posts: Post[],
  config: {
    claudeApiKey: string
    claudeModel?: string
    telegramConfig?: TelegramConfig
    alertThreshold?: number
  },
): Promise<Post[]> {
  const {
    claudeApiKey,
    claudeModel,
    telegramConfig,
    alertThreshold = -0.3,
  } = config

  const processedPosts: Post[] = []

  for (const post of posts) {
    try {
      // Analisar sentimento
      const analysis = await analyzeSentiment(
        { apiKey: claudeApiKey, model: claudeModel },
        {
          content: post.content,
          platform: 'LinkedIn',
          metadata: {
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            views: post.views,
          },
        },
      )

      const processedPost: Post = {
        ...post,
        sentimentScore: analysis.sentimentScore,
        sentimentExplanation: analysis.sentimentExplanation,
      }

      processedPosts.push(processedPost)

      // Enviar alerta se necessário
      if (telegramConfig && processedPost.sentimentScore < alertThreshold) {
        await sendAlert(telegramConfig, {
          type: 'sentiment_drop',
          severity: processedPost.sentimentScore < -0.6 ? 'high' : 'medium',
          title: 'Queda de Sentimento Detectada',
          message: `Post com sentimento negativo detectado (score: ${processedPost.sentimentScore.toFixed(2)})`,
          url: processedPost.url,
        })
      }

      // Aguardar um pouco para evitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Erro ao processar post ${post.id}:`, error)
      // Adicionar post mesmo com erro, mas sem análise
      processedPosts.push(post)
    }
  }

  return processedPosts
}
