import { useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  Save,
  Key,
  Globe,
  Bell,
  Database,
  FileText,
  Download,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Wifi,
  Target,
  Plus,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Client } from '@/types'

const apiSchema = z.object({
  apify: z.string().min(5, 'Token Apify muito curto'),
  anthropic: z.string().min(5, 'Chave API Claude muito curta'),
  telegramBot: z.string().min(5, 'Token do Bot Telegram muito curto'),
  supabaseUrl: z.string().url('URL Supabase inválida'),
  supabaseKey: z.string().min(5, 'Chave Supabase muito curta'),
})

export default function Settings() {
  const {
    settings,
    clients,
    updateSettings,
    updateClient,
    addClient,
    removeClient,
    testTelegramConnection,
    testApifyConnection,
    testClaudeConnection,
    testSupabaseConnection,
  } = useAppStore()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [testingStatus, setTestingStatus] = useState<Record<string, boolean>>(
    {},
  )

  // Monitoring State
  const ownClient = clients.find((c) => c.type === 'own')
  const competitors = clients.filter((c) => c.type === 'competitor')
  const [newCompetitorName, setNewCompetitorName] = useState('')

  const apiForm = useForm<z.infer<typeof apiSchema>>({
    resolver: zodResolver(apiSchema),
    defaultValues: settings.apiKeys,
  })

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const onSaveApi = (values: z.infer<typeof apiSchema>) => {
    setIsSaving(true)
    setTimeout(() => {
      updateSettings({ apiKeys: values })
      setIsSaving(false)
    }, 1000)
  }

  const handleTest = async (
    service: 'telegram' | 'apify' | 'claude' | 'supabase',
    testFn: () => Promise<boolean>,
  ) => {
    setTestingStatus((prev) => ({ ...prev, [service]: true }))
    await testFn()
    setTestingStatus((prev) => ({ ...prev, [service]: false }))
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: 'Exportação Iniciada',
      description: `Gerando relatório em ${format.toUpperCase()}... O download iniciará em breve.`,
    })
  }

  const handleUpdateOwnClient = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('brandName') as HTMLInputElement)
      .value
    const url = (form.elements.namedItem('brandUrl') as HTMLInputElement).value
    const industry = (
      form.elements.namedItem('brandIndustry') as HTMLInputElement
    ).value

    if (ownClient) {
      updateClient(ownClient.id, { name, url, industry })
    }
  }

  const handleAddCompetitor = () => {
    if (!newCompetitorName) return
    addClient({
      name: newCompetitorName,
      url: `https://linkedin.com/company/${newCompetitorName.toLowerCase().replace(/\s/g, '-')}`,
      type: 'competitor',
      industry: ownClient?.industry || 'Outros',
    })
    setNewCompetitorName('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie integrações, notificações e preferências do sistema.
        </p>
      </div>
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monitoring" className="gap-2">
            <Target className="h-4 w-4" /> Monitoramento
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Key className="h-4 w-4" /> Integrações API
          </TabsTrigger>
          <TabsTrigger value="platforms" className="gap-2">
            <Globe className="h-4 w-4" /> Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" /> Sistema & Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Marca Principal</CardTitle>
              <CardDescription>
                Defina a empresa foco do monitoramento (Você).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateOwnClient} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Nome da Empresa</Label>
                    <Input
                      id="brandName"
                      defaultValue={ownClient?.name}
                      placeholder="Ex: Grupo Plaenge"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandIndustry">Setor de Atuação</Label>
                    <Input
                      id="brandIndustry"
                      defaultValue={ownClient?.industry}
                      placeholder="Ex: Construção Civil"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="brandUrl">URL Principal (LinkedIn)</Label>
                    <Input
                      id="brandUrl"
                      defaultValue={ownClient?.url}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Atualizar Marca</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gestão de Concorrentes</CardTitle>
              <CardDescription>
                Adicione empresas para comparação direta nos gráficos de
                análise.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Nome do Concorrente"
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                />
                <Button onClick={handleAddCompetitor}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
              <div className="border rounded-md divide-y">
                {competitors.length > 0 ? (
                  competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {comp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {comp.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeClient(comp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum concorrente cadastrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de Acesso</CardTitle>
              <CardDescription>
                Gerencie com segurança as credenciais dos serviços integrados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form
                  onSubmit={apiForm.handleSubmit(onSaveApi)}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <FormField
                        control={apiForm.control}
                        name="apify"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apify Token</FormLabel>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <FormControl>
                                  <Input
                                    type={
                                      showSecrets.apify ? 'text' : 'password'
                                    }
                                    placeholder="apify_api_..."
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => toggleSecret('apify')}
                                >
                                  {showSecrets.apify ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleTest('apify', testApifyConnection)
                                }
                                disabled={testingStatus.apify}
                              >
                                {testingStatus.apify ? (
                                  <Wifi className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Testar'
                                )}
                              </Button>
                            </div>
                            <FormDescription>
                              Usado para autenticar o scraper do LinkedIn.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={apiForm.control}
                        name="anthropic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Claude API Key</FormLabel>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <FormControl>
                                  <Input
                                    type={
                                      showSecrets.anthropic
                                        ? 'text'
                                        : 'password'
                                    }
                                    placeholder="sk-ant-..."
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => toggleSecret('anthropic')}
                                >
                                  {showSecrets.anthropic ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleTest('claude', testClaudeConnection)
                                }
                                disabled={testingStatus.claude}
                              >
                                {testingStatus.claude ? (
                                  <Wifi className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Testar'
                                )}
                              </Button>
                            </div>
                            <FormDescription>
                              Necessário para análise de sentimento.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={apiForm.control}
                        name="telegramBot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telegram Bot Token</FormLabel>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <FormControl>
                                  <Input
                                    type={
                                      showSecrets.telegramBot
                                        ? 'text'
                                        : 'password'
                                    }
                                    placeholder="123456:ABC-..."
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => toggleSecret('telegramBot')}
                                >
                                  {showSecrets.telegramBot ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleTest('telegram', testTelegramConnection)
                                }
                                disabled={testingStatus.telegram}
                              >
                                {testingStatus.telegram ? (
                                  <Wifi className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Testar'
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={apiForm.control}
                        name="supabaseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supabase URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://xyz.supabase.co"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={apiForm.control}
                        name="supabaseKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supabase Anon Key</FormLabel>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <FormControl>
                                  <Input
                                    type={
                                      showSecrets.supabaseKey
                                        ? 'text'
                                        : 'password'
                                    }
                                    placeholder="eyJ..."
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => toggleSecret('supabaseKey')}
                                >
                                  {showSecrets.supabaseKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleTest('supabase', testSupabaseConnection)
                                }
                                disabled={testingStatus.supabase}
                              >
                                {testingStatus.supabase ? (
                                  <Wifi className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Testar'
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}{' '}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>Plataformas Monitoradas</CardTitle>
              <CardDescription>
                Ative ou desative o monitoramento para redes específicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    id: 'linkedin',
                    label: 'LinkedIn',
                    icon: Linkedin,
                    desc: 'Coleta de posts corporativos e engajamento.',
                  },
                  {
                    id: 'instagram',
                    label: 'Instagram',
                    icon: Instagram,
                    desc: 'Monitoramento de hashtags e menções.',
                  },
                  {
                    id: 'facebook',
                    label: 'Facebook',
                    icon: Facebook,
                    desc: 'Análise de páginas públicas e grupos.',
                  },
                  {
                    id: 'twitter',
                    label: 'X (Twitter)',
                    icon: Twitter,
                    desc: 'Rastreamento de tweets e trends.',
                  },
                  {
                    id: 'youtube',
                    label: 'YouTube',
                    icon: Youtube,
                    desc: 'Comentários em vídeos do canal.',
                  },
                ].map((platform) => (
                  <div
                    key={platform.id}
                    className="flex flex-col space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <platform.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{platform.label}</span>
                      </div>
                      <Switch
                        checked={
                          settings.platforms[
                            platform.id as keyof typeof settings.platforms
                          ]
                        }
                        onCheckedChange={(checked) =>
                          updateSettings({
                            platforms: {
                              ...settings.platforms,
                              [platform.id]: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {platform.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Alertas</CardTitle>
              <CardDescription>
                Personalize como e quando você recebe notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Telegram Chat ID</Label>
                  <Input
                    value={settings.notifications.telegramChatId}
                    onChange={(e) =>
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          telegramChatId: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: 123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    Envie /start para o seu bot para obter este ID.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Gatilhos de Notificação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sentimento Negativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertar quando um post com score &lt; -0.3 for
                        detectado.
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnNegative}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            alertOnNegative: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Atividade Concorrente</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertar sobre novos posts de empresas concorrentes.
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnCompetitor}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            alertOnCompetitor: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Pico de Engajamento</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar se um post exceder a média de likes em 50%.
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.alertOnSpike}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            alertOnSpike: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Sistema & Dados</CardTitle>
              <CardDescription>
                Preferências de scraping e gerenciamento de dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Frequência de Coleta Automática</Label>
                  <Select
                    defaultValue={settings.scraping.frequency}
                    onValueChange={(val: any) =>
                      updateSettings({
                        scraping: { ...settings.scraping, frequency: val },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente (00:00)</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retenção de Dados (Dias)</Label>
                  <Input
                    type="number"
                    value={settings.scraping.retentionDays}
                    onChange={(e) =>
                      updateSettings({
                        scraping: {
                          ...settings.scraping,
                          retentionDays: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Dados mais antigos que este período serão arquivados.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Exportação de Dados</h3>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleExport('csv')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="mr-2 h-4 w-4" /> Exportar Relatório PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
