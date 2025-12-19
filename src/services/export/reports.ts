import { Client, Post, DailyMetric, Alert } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ReportData {
  clients: Client[]
  posts: Post[]
  metrics: DailyMetric[]
  alerts: Alert[]
  period: { start: Date; end: Date }
}

export function exportToCSV(data: ReportData, filename?: string): void {
  const { clients, posts, metrics, alerts } = data

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
      const content = post.content ? post.content.replace(/"/g, '""') : ''
      return [
        post.id,
        client?.name || 'N/A',
        `"${content}"`,
        (post.likes || 0).toString(),
        (post.comments || 0).toString(),
        (post.shares || 0).toString(),
        (post.views || 0).toString(),
        (post.sentimentScore || 0).toFixed(2),
        post.postedAt
          ? format(new Date(post.postedAt), 'dd/MM/yyyy HH:mm', {
              locale: ptBR,
            })
          : 'N/A',
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const metricsCSV = [
    ['Data', 'Cliente', 'Score Sentimento', 'Taxa Engajamento', 'Posts'],
    ...metrics.map((metric) => {
      const client = clients.find((c) => c.id === metric.clientId)
      return [
        metric.date,
        client?.name || 'N/A',
        (metric.sentimentScore || 0).toFixed(2),
        ((metric.engagementRate || 0) * 100).toFixed(2) + '%',
        (metric.postsCount || 0).toString(),
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const alertsCSV = [
    ['ID', 'Tipo', 'Mensagem', 'Severidade', 'Data'],
    ...alerts.map((alert) => {
      const message = alert.message ? alert.message.replace(/"/g, '""') : ''
      return [
        alert.id,
        alert.type,
        `"${message}"`,
        alert.severity,
        alert.createdAt
          ? format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm', {
              locale: ptBR,
            })
          : 'N/A',
      ]
    }),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const fullCSV = `RELATÓRIO PLANIN - MONITORAMENTO DE REPUTAÇÃO\nGerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}\nPeríodo: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}\n\n=== POSTS ===\n${postsCSV}\n\n=== MÉTRICAS ===\n${metricsCSV}\n\n=== ALERTAS ===\n${alertsCSV}`

  const blob = new Blob(['\ufeff' + fullCSV], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `planin-report-${format(new Date(), 'yyyy-MM-dd')}.csv`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function generateReportHTML(data: ReportData): string {
  const { clients, posts, metrics, alerts } = data
  const ownClient = clients.find((c) => c.type === 'own')
  const ownMetrics = metrics.filter((m) => m.clientId === ownClient?.id)

  const avgSentiment =
    ownMetrics.length > 0
      ? ownMetrics.reduce((acc, m) => acc + (m.sentimentScore || 0), 0) /
        ownMetrics.length
      : 0

  const totalPosts = posts.length
  const totalAlerts = alerts.length

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório PLANIN</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 40px; color: #1f2937; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 800; color: #7c3aed; }
    h1 { color: #111827; font-size: 24px; margin: 0; }
    h2 { color: #4b5563; font-size: 18px; margin-top: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .summary { background: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 16px; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 36px; font-weight: 800; color: #7c3aed; }
    .summary-label { font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
    th { background-color: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
    tr:last-child td { border-bottom: none; }
    .sentiment-positive { color: #059669; font-weight: 600; background: #d1fae5; padding: 2px 8px; border-radius: 99px; font-size: 12px; }
    .sentiment-negative { color: #dc2626; font-weight: 600; background: #fee2e2; padding: 2px 8px; border-radius: 99px; font-size: 12px; }
    .sentiment-neutral { color: #4b5563; background: #f3f4f6; padding: 2px 8px; border-radius: 99px; font-size: 12px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PLANIN</div>
    <div style="text-align: right;">
      <h1>Relatório de Monitoramento</h1>
      <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
    </div>
  </div>
  
  <div class="summary">
    <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">RESUMO EXECUTIVO</div>
    <div>Período: ${format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}</div>
    ${ownClient ? `<div>Marca Principal: <strong>${ownClient.name}</strong></div>` : ''}
    
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${avgSentiment.toFixed(2)}</div>
        <div class="summary-label">Sentimento Médio</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${totalPosts}</div>
        <div class="summary-label">Posts Coletados</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${totalAlerts}</div>
        <div class="summary-label">Alertas</div>
      </div>
    </div>
  </div>

  <h2>Últimas Publicações (Top 20)</h2>
  <table>
    <thead><tr><th>Cliente</th><th style="width: 40%;">Conteúdo</th><th>Engajamento</th><th>Sentimento</th><th>Data</th></tr></thead>
    <tbody>
      ${posts
        .slice(0, 20)
        .map((post) => {
          const client = clients.find((c) => c.id === post.clientId)
          const sentimentClass =
            post.sentimentScore > 0.3
              ? 'sentiment-positive'
              : post.sentimentScore < -0.3
                ? 'sentiment-negative'
                : 'sentiment-neutral'
          return `<tr>
            <td style="font-weight: 500;">${client?.name || 'N/A'}</td>
            <td>${(post.content || '').substring(0, 120)}${(post.content || '').length > 120 ? '...' : ''}</td>
            <td>👍 ${post.likes || 0} <span style="color: #9ca3af;">|</span> 💬 ${post.comments || 0}</td>
            <td><span class="${sentimentClass}">${(post.sentimentScore || 0).toFixed(2)}</span></td>
            <td>${post.postedAt ? format(new Date(post.postedAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</td>
          </tr>`
        })
        .join('')}
    </tbody>
  </table>

  <h2>Métricas Diárias</h2>
  <table>
    <thead><tr><th>Data</th><th>Cliente</th><th>Sentimento</th><th>Engajamento</th><th>Posts</th></tr></thead>
    <tbody>
      ${metrics
        .slice(0, 15)
        .map((metric) => {
          const client = clients.find((c) => c.id === metric.clientId)
          return `<tr>
            <td>${metric.date ? format(new Date(metric.date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</td>
            <td>${client?.name || 'N/A'}</td>
            <td>${(metric.sentimentScore || 0).toFixed(2)}</td>
            <td>${((metric.engagementRate || 0) * 100).toFixed(2)}%</td>
            <td>${metric.postsCount || 0}</td>
          </tr>`
        })
        .join('')}
    </tbody>
  </table>

  ${
    alerts.length > 0
      ? `
  <h2>Alertas do Sistema</h2>
  <table>
    <thead><tr><th>Tipo</th><th>Mensagem</th><th>Severidade</th><th>Data</th></tr></thead>
    <tbody>
      ${alerts
        .slice(0, 10)
        .map(
          (alert) => `
        <tr>
          <td style="text-transform: capitalize;">${alert.type.replace('_', ' ')}</td>
          <td>${alert.message}</td>
          <td style="text-transform: uppercase; font-size: 11px; font-weight: 700;">${alert.severity}</td>
          <td>${alert.createdAt ? format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>`
      : ''
  }

  <div class="footer">
    <p>Este relatório contém informações confidenciais de monitoramento da PLANIN.</p>
  </div>
</body>
</html>`
}

export async function exportToPDF(
  data: ReportData,
  filename?: string,
): Promise<void> {
  const html = generateReportHTML(data)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o PDF')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Optional: printWindow.close()
    }, 500)
  }
}
