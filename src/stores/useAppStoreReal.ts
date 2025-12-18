/**
 * Funções auxiliares para usar APIs reais no store
 */

import { ApiConfig } from '@/types'
import { getPlatformMonitor, processPosts } from '@/services/platforms'
import { sendAlert } from '@/services/api/telegram'

/**
 * Carrega configurações da API do localStorage
 */
export function getApiConfig(): ApiConfig {
  const saved = localStorage.getItem('apiConfig')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Erro ao carregar configurações:', e)
    }
  }
  return {}
}

/**
 * Executa scraping real usando as APIs configuradas
 */
export async function performRealScrape(clientId: string) {
  const config = getApiConfig()

  if (!config.apifyApiKey) {
    throw new Error('API Key do Apify não configurada')
  }

  // Aqui você precisaria buscar o cliente do store
  // Por enquanto, retornamos um exemplo
  return {
    success: false,
    error: 'Função precisa ser integrada com o store',
  }
}

/**
 * Envia alerta real para o Telegram se configurado
 */
export async function sendRealAlert(alert: {
  type: 'sentiment_drop' | 'engagement_spike' | 'competitor_move'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  clientName?: string
  url?: string
}): Promise<{ success: boolean; error?: string }> {
  const config = getApiConfig()

  if (!config.telegramBotToken || !config.telegramChatId) {
    return {
      success: false,
      error: 'Telegram não configurado',
    }
  }

  return sendAlert(
    {
      botToken: config.telegramBotToken,
      chatId: config.telegramChatId,
    },
    alert,
  )
}
