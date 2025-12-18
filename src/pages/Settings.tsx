import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, Save, TestTube } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { validateApifyKey } from '@/services/api/apify'
import { validateClaudeKey } from '@/services/api/claude'
import { validateTelegramConfig, getBotInfo } from '@/services/api/telegram'
import { ApiConfig } from '@/types'

export default function Settings() {
  const [config, setConfig] = useState<ApiConfig>({
    apifyApiKey: '',
    apifyTaskId: '',
    claudeApiKey: '',
    claudeModel: 'claude-sonnet-4-20250514',
    telegramBotToken: '',
    telegramChatId: '',
  })

  const [validations, setValidations] = useState<{
    apify?: boolean
    claude?: boolean
    telegram?: boolean
  }>({})

  const [testing, setTesting] = useState<{
    apify?: boolean
    claude?: boolean
    telegram?: boolean
  }>({})

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Carregar configurações salvas do localStorage
    const saved = localStorage.getItem('apiConfig')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar configurações:', e)
      }
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Salvar no localStorage (em produção, salvaria em um backend)
      localStorage.setItem('apiConfig', JSON.stringify(config))
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram salvas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const testApify = async () => {
    if (!config.apifyApiKey) {
      toast({
        title: 'API Key necessária',
        description: 'Por favor, insira a API Key do Apify.',
        variant: 'destructive',
      })
      return
    }

    setTesting((prev) => ({ ...prev, apify: true }))
    try {
      const isValid = await validateApifyKey(config.apifyApiKey)
      setValidations((prev) => ({ ...prev, apify: isValid }))
      if (isValid) {
        toast({
          title: 'Apify validado',
          description: 'A API Key do Apify está válida.',
        })
      } else {
        toast({
          title: 'Apify inválido',
          description: 'A API Key do Apify não é válida.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setValidations((prev) => ({ ...prev, apify: false }))
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a API Key do Apify.',
        variant: 'destructive',
      })
    } finally {
      setTesting((prev) => ({ ...prev, apify: false }))
    }
  }

  const testClaude = async () => {
    if (!config.claudeApiKey) {
      toast({
        title: 'API Key necessária',
        description: 'Por favor, insira a API Key do Claude.',
        variant: 'destructive',
      })
      return
    }

    setTesting((prev) => ({ ...prev, claude: true }))
    try {
      const isValid = await validateClaudeKey(config.claudeApiKey)
      setValidations((prev) => ({ ...prev, claude: isValid }))
      if (isValid) {
        toast({
          title: 'Claude validado',
          description: 'A API Key do Claude está válida.',
        })
      } else {
        toast({
          title: 'Claude inválido',
          description: 'A API Key do Claude não é válida.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setValidations((prev) => ({ ...prev, claude: false }))
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar a API Key do Claude.',
        variant: 'destructive',
      })
    } finally {
      setTesting((prev) => ({ ...prev, claude: false }))
    }
  }

  const testTelegram = async () => {
    if (!config.telegramBotToken || !config.telegramChatId) {
      toast({
        title: 'Configuração necessária',
        description: 'Por favor, insira o Bot Token e Chat ID do Telegram.',
        variant: 'destructive',
      })
      return
    }

    setTesting((prev) => ({ ...prev, telegram: true }))
    try {
      const result = await validateTelegramConfig({
        botToken: config.telegramBotToken,
        chatId: config.telegramChatId,
      })

      setValidations((prev) => ({ ...prev, telegram: result.valid }))

      if (result.valid) {
        const botInfo = await getBotInfo(config.telegramBotToken)
        toast({
          title: 'Telegram validado',
          description: `Bot conectado: ${botInfo.data?.username || 'N/A'}`,
        })
      } else {
        toast({
          title: 'Telegram inválido',
          description: result.error || 'Não foi possível validar o Telegram.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setValidations((prev) => ({ ...prev, telegram: false }))
      toast({
        title: 'Erro ao testar',
        description: 'Não foi possível validar o Telegram.',
        variant: 'destructive',
      })
    } finally {
      setTesting((prev) => ({ ...prev, telegram: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure as integrações com APIs externas e serviços.
        </p>
      </div>

      {/* Apify Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Apify - Coleta de Dados</CardTitle>
          <CardDescription>
            Configure a API do Apify para coleta automática de dados das redes
            sociais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apifyApiKey">API Key do Apify</Label>
            <div className="flex gap-2">
              <Input
                id="apifyApiKey"
                type="password"
                value={config.apifyApiKey}
                onChange={(e) =>
                  setConfig({ ...config, apifyApiKey: e.target.value })
                }
                placeholder="apify_api_..."
              />
              <Button
                variant="outline"
                onClick={testApify}
                disabled={testing.apify}
              >
                {testing.apify ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validations.apify !== undefined && (
              <Alert>
                {validations.apify ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {validations.apify
                    ? 'API Key válida'
                    : 'API Key inválida ou erro na conexão'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apifyTaskId">Task ID (Opcional)</Label>
            <Input
              id="apifyTaskId"
              value={config.apifyTaskId}
              onChange={(e) =>
                setConfig({ ...config, apifyTaskId: e.target.value })
              }
              placeholder="Deixe vazio para usar actor padrão"
            />
            <p className="text-sm text-muted-foreground">
              Se você tem uma task configurada no Apify, insira o ID aqui.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Claude Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Claude (Anthropic) - Análise de Sentimento</CardTitle>
          <CardDescription>
            Configure a API do Claude para análise automática de sentimento e
            contexto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claudeApiKey">API Key do Claude</Label>
            <div className="flex gap-2">
              <Input
                id="claudeApiKey"
                type="password"
                value={config.claudeApiKey}
                onChange={(e) =>
                  setConfig({ ...config, claudeApiKey: e.target.value })
                }
                placeholder="sk-ant-..."
              />
              <Button
                variant="outline"
                onClick={testClaude}
                disabled={testing.claude}
              >
                {testing.claude ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validations.claude !== undefined && (
              <Alert>
                {validations.claude ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {validations.claude
                    ? 'API Key válida'
                    : 'API Key inválida ou erro na conexão'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="claudeModel">Modelo</Label>
            <Select
              value={config.claudeModel}
              onValueChange={(value) =>
                setConfig({ ...config, claudeModel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4-20250514">
                  Claude Sonnet 4
                </SelectItem>
                <SelectItem value="claude-3-5-sonnet-20241022">
                  Claude 3.5 Sonnet
                </SelectItem>
                <SelectItem value="claude-3-opus-20240229">
                  Claude 3 Opus
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Telegram - Notificações</CardTitle>
          <CardDescription>
            Configure o bot do Telegram para receber alertas automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramBotToken">Bot Token</Label>
            <div className="flex gap-2">
              <Input
                id="telegramBotToken"
                type="password"
                value={config.telegramBotToken}
                onChange={(e) =>
                  setConfig({ ...config, telegramBotToken: e.target.value })
                }
                placeholder="123456789:ABCdef..."
              />
              <Button
                variant="outline"
                onClick={testTelegram}
                disabled={testing.telegram}
              >
                {testing.telegram ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validations.telegram !== undefined && (
              <Alert>
                {validations.telegram ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {validations.telegram
                    ? 'Telegram configurado corretamente'
                    : 'Erro na configuração do Telegram'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegramChatId">Chat ID</Label>
            <Input
              id="telegramChatId"
              value={config.telegramChatId}
              onChange={(e) =>
                setConfig({ ...config, telegramChatId: e.target.value })
              }
              placeholder="123456789 ou @username"
            />
            <p className="text-sm text-muted-foreground">
              Use @userinfobot no Telegram para obter seu Chat ID.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

