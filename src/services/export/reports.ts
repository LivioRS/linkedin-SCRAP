/**
 * Serviços de exportação de relatórios em PDF e CSV
 */

import { Client, Post, DailyMetric, Alert } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ReportData {
  clients: Client[]
  posts: Post[]
  metrics: DailyMetric[]
  alerts: Alert[]
  period: {
    start: Date
    end: Date
  }
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: ReportData, filename?: string): void {
  const { clients, posts, metrics, alerts } = data

  // Criar CSV de Posts
  const postsCSV = [
    [
      'ID',
      'Cliente',
      'Conteúdo',
      'Curtidas',
      'Comentários',
      'Compartilhamentos',
      'Visualizações',
      'Score Sentimento',
      'Data',
    ],
    ...posts.map((post) => {
      const client = clients.find((c) => c.id === post.clientId)
      return [
        post.id,
        client?.name || 'N/A',
        `"${post.content.replace(/"/g, '""')}"`, // Escapar aspas
        post.likes.toString(),
        post.comments.toString(),
        post.shares.toString(),
        post.views.toString(),
        post.sentimentScore.toFixed(2),
        format(new Date(post.postedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  // Criar CSV de Métricas
  const metricsCSV = [
    ['Data', 'Cliente', 'Score Sentimento', 'Taxa Engajamento', 'Posts'],
    ...metrics.map((metric) => {
      const client = clients.find((c) => c.id === metric.clientId)
      return [
        metric.date,
        client?.name || 'N/A',
        metric.sentimentScore.toFixed(2),
        (metric.engagementRate * 100).toFixed(2) + '%',
        metric.postsCount.toString(),
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  // Criar CSV de Alertas
  const alertsCSV = [
    ['ID', 'Tipo', 'Mensagem', 'Severidade', 'Data'],
    ...alerts.map((alert) => [
      alert.id,
      alert.type,
      `"${alert.message.replace(/"/g, '""')}"`,
      alert.severity,
      format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]),
  ]
    .map((row) => row.join(','))
    .join('\n')

  // Combinar todos os CSVs
  const fullCSV =
    `RELATÓRIO DE MONITORAMENTO\nPeríodo: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}\n\n` +
    `=== POSTS ===\n${postsCSV}\n\n` +
    `=== MÉTRICAS ===\n${metricsCSV}\n\n` +
    `=== ALERTAS ===\n${alertsCSV}`

  // Criar blob e fazer download
  const blob = new Blob(['\ufeff' + fullCSV], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `relatorio-${format(new Date(), 'yyyy-MM-dd')}.csv`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Gera HTML para PDF
 */
function generateReportHTML(data: ReportData): string {
  const { clients, posts, metrics, alerts } = data
  const ownClient = clients.find((c) => c.type === 'own')

  // Calcular métricas agregadas
  const avgSentiment =
    metrics.reduce((acc, m) => acc + m.sentimentScore, 0) / metrics.length || 0
  const totalPosts = posts.length
  const totalAlerts = alerts.length

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Monitoramento</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 10px;
    }
    h2 {
      color: #0066cc;
      margin-top: 30px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 5px;
    }
    .summary {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 15px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 32px;
      font-weight: bold;
      color: #0066cc;
    }
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #0066cc;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .sentiment-positive {
      color: #28a745;
      font-weight: bold;
    }
    .sentiment-negative {
      color: #dc3545;
      font-weight: bold;
    }
    .sentiment-neutral {
      color: #6c757d;
    }
    .alert-high {
      background-color: #fee;
      color: #c33;
    }
    .alert-medium {
      background-color: #ffeaa7;
      color: #d63031;
    }
    .alert-low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Relatório de Monitoramento de Reputação</h1>
  
  <div class="summary">
    <h3>Resumo Executivo</h3>
    <p><strong>Período:</strong> ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}</p>
    ${ownClient ? `<p><strong>Cliente Principal:</strong> ${ownClient.name}</p>` : ''}
    
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${avgSentiment.toFixed(2)}</div>
        <div class="summary-label">Sentimento Médio</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${totalPosts}</div>
        <div class="summary-label">Posts Analisados</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${totalAlerts}</div>
        <div class="summary-label">Alertas Gerados</div>
      </div>
    </div>
  </div>

  <h2>Posts Analisados</h2>
  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Conteúdo</th>
        <th>Engajamento</th>
        <th>Sentimento</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${posts
        .slice(0, 50)
        .map((post) => {
          const client = clients.find((c) => c.id === post.clientId)
          const sentimentClass =
            post.sentimentScore > 0.3
              ? 'sentiment-positive'
              : post.sentimentScore < -0.3
                ? 'sentiment-negative'
                : 'sentiment-neutral'
          return `
        <tr>
          <td>${client?.name || 'N/A'}</td>
          <td>${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</td>
          <td>👍 ${post.likes} 💬 ${post.comments} 🔄 ${post.shares}</td>
          <td class="${sentimentClass}">${post.sentimentScore.toFixed(2)}</td>
          <td>${format(new Date(post.postedAt), 'dd/MM/yyyy', { locale: ptBR })}</td>
        </tr>
      `
        })
        .join('')}
    </tbody>
  </table>

  <h2>Métricas Diárias</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Cliente</th>
        <th>Sentimento</th>
        <th>Engajamento</th>
        <th>Posts</th>
      </tr>
    </thead>
    <tbody>
      ${metrics
        .slice(0, 30)
        .map((metric) => {
          const client = clients.find((c) => c.id === metric.clientId)
          return `
        <tr>
          <td>${format(new Date(metric.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
          <td>${client?.name || 'N/A'}</td>
          <td>${metric.sentimentScore.toFixed(2)}</td>
          <td>${(metric.engagementRate * 100).toFixed(2)}%</td>
          <td>${metric.postsCount}</td>
        </tr>
      `
        })
        .join('')}
    </tbody>
  </table>

  ${
    alerts.length > 0
      ? `
  <h2>Alertas</h2>
  <table>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Mensagem</th>
        <th>Severidade</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${alerts
        .map((alert) => {
          const alertClass = `alert-${alert.severity}`
          return `
        <tr class="${alertClass}">
          <td>${alert.type.replace('_', ' ').toUpperCase()}</td>
          <td>${alert.message}</td>
          <td>${alert.severity.toUpperCase()}</td>
          <td>${format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
        </tr>
      `
        })
        .join('')}
    </tbody>
  </table>
  `
      : ''
  }

  <div class="footer">
    <p>Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
    <p>Sistema de Monitoramento de Reputação</p>
  </div>
</body>
</html>
  `
}

/**
 * Exporta relatório para PDF usando jsPDF ou window.print
 */
export async function exportToPDF(
  data: ReportData,
  filename?: string,
): Promise<void> {
  const html = generateReportHTML(data)

  // Criar uma nova janela para imprimir
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o PDF')
    return
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Aguardar carregamento e imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Fechar após impressão (opcional)
      // printWindow.close()
    }, 250)
  }
}

/**
 * Exporta apenas posts para CSV
 */
export function exportPostsToCSV(
  posts: Post[],
  clients: Client[],
  filename?: string,
): void {
  const csv = [
    [
      'ID',
      'Cliente',
      'Conteúdo',
      'Curtidas',
      'Comentários',
      'Compartilhamentos',
      'Visualizações',
      'Score Sentimento',
      'Data',
    ],
    ...posts.map((post) => {
      const client = clients.find((c) => c.id === post.clientId)
      return [
        post.id,
        client?.name || 'N/A',
        `"${post.content.replace(/"/g, '""')}"`,
        post.likes.toString(),
        post.comments.toString(),
        post.shares.toString(),
        post.views.toString(),
        post.sentimentScore.toFixed(2),
        format(new Date(post.postedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `posts-${format(new Date(), 'yyyy-MM-dd')}.csv`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
