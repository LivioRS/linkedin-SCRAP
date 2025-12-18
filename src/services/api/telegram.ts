export interface TelegramConfig {
  botToken: string
  chatId: string
}

export interface TelegramMessage {
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disableNotification?: boolean
}

export interface AlertMessage {
  type: 'sentiment_drop' | 'engagement_spike' | 'competitor_move' | 'custom'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  clientName?: string
  url?: string
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  message: TelegramMessage,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { botToken, chatId } = config
    if (!botToken || !chatId) {
      throw new Error('Bot Token ou Chat ID do Telegram não configurados')
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.text,
        parse_mode: message.parseMode,
        disable_notification: message.disableNotification,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        error.description || 'Erro ao enviar mensagem para Telegram',
      )
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar mensagem para Telegram:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido no Telegram',
    }
  }
}

export async function sendAlert(
  config: TelegramConfig,
  alert: AlertMessage,
): Promise<{ success: boolean; error?: string }> {
  const { type, severity, title, message, clientName, url } = alert

  const typeEmojis: Record<string, string> = {
    sentiment_drop: '📉',
    engagement_spike: '⚡',
    competitor_move: '🔔',
    custom: '📢',
  }

  const severityEmojis: Record<string, string> = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  }

  const emoji = typeEmojis[type] || '📢'
  const severityEmoji = severityEmojis[severity] || ''

  let formattedMessage = `${emoji} <b>${title}</b>\n\n`
  formattedMessage += `${severityEmoji} <b>Severidade:</b> ${severity.toUpperCase()}\n\n`
  formattedMessage += `${message}\n`

  if (clientName) formattedMessage += `\n<b>Cliente:</b> ${clientName}`
  if (url) formattedMessage += `\n\n🔗 <a href="${url}">Ver detalhes</a>`

  return sendTelegramMessage(config, {
    text: formattedMessage,
    parseMode: 'HTML',
    disableNotification: severity === 'low',
  })
}

export async function validateTelegramConfig(
  config: TelegramConfig,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const { botToken, chatId } = config
    if (!botToken || !chatId) {
      return { valid: false, error: 'Bot Token ou Chat ID não configurados' }
    }

    const testMessage: TelegramMessage = {
      text: '✅ Teste de conexão - Sistema de Monitoramento',
      parseMode: 'HTML',
    }

    const result = await sendTelegramMessage(config, testMessage)

    if (!result.success) {
      return {
        valid: false,
        error: result.error || 'Erro ao validar configuração',
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
