import { useState, useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Search, Eye, Calendar, Filter, Download } from 'lucide-react'
import { SentimentBadge } from '@/components/SentimentBadge'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

const VEHICLES = [
  'InfoMoney',
  'Folha de Curitiba',
  'Money Times',
  'Bing News',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'Twitter',
  'YouTube',
]

const REGIONS = ['Corporativo', 'Regional', 'Nacional', 'Internacional']

const CATEGORIES = [
  'Operacional',
  'Financeiro',
  'Marketing',
  'RH',
  'Sustentabilidade',
  'Inovação',
]

const URGENCY_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

const URGENCY_COLORS = {
  baixa: 'text-green-600 bg-green-50',
  media: 'text-yellow-600 bg-yellow-50',
  alta: 'text-red-600 bg-red-50',
}

export default function Tracker() {
  const { posts, clients } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('90')

  // Calcular data de corte baseada no período selecionado
  const cutoffDate = useMemo(() => {
    const days = parseInt(periodFilter)
    return subDays(new Date(), days)
  }, [periodFilter])

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const postDate = new Date(post.postedAt)
        const matchesPeriod = postDate >= cutoffDate

        const matchesSearch =
          (post.title || post.content)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          clients
            .find((c) => c.id === post.clientId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase())

        const matchesSentiment =
          sentimentFilter === 'all'
            ? true
            : sentimentFilter === 'positive'
              ? post.sentimentScore > 0.3
              : sentimentFilter === 'negative'
                ? post.sentimentScore < -0.3
                : post.sentimentScore >= -0.3 && post.sentimentScore <= 0.3

        const matchesVehicle =
          vehicleFilter === 'all' || post.vehicle === vehicleFilter

        const matchesCategory =
          categoryFilter === 'all' || post.category === categoryFilter

        const matchesUrgency =
          urgencyFilter === 'all' || post.urgency === urgencyFilter

        return (
          matchesPeriod &&
          matchesSearch &&
          matchesSentiment &&
          matchesVehicle &&
          matchesCategory &&
          matchesUrgency
        )
      })
      .sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      )
  }, [
    posts,
    clients,
    searchTerm,
    sentimentFilter,
    vehicleFilter,
    categoryFilter,
    urgencyFilter,
    periodFilter,
    cutoffDate,
  ])

  const getSentimentLabel = (score: number): string => {
    if (score > 0.3) return 'positivo'
    if (score < -0.3) return 'negativo'
    return 'neutro'
  }

  const getUrgency = (post: any): 'baixa' | 'media' | 'alta' => {
    if (post.urgency) return post.urgency
    // Calcular urgência baseada no sentimento e engajamento
    if (post.sentimentScore < -0.5 || post.likes > 1000) return 'alta'
    if (post.sentimentScore < -0.3 || post.likes > 500) return 'media'
    return 'baixa'
  }

  const getCategory = (post: any): string => {
    return post.category || 'Operacional'
  }

  const getVehicle = (post: any): string => {
    return post.vehicle || 'LinkedIn'
  }

  const getRegion = (post: any): string => {
    return post.region || 'Corporativo'
  }

  const getTitle = (post: any): string => {
    if (post.title) return post.title
    // Gerar título a partir do conteúdo
    const client = clients.find((c) => c.id === post.clientId)
    const clientName = client?.name || 'Empresa'
    const contentPreview = post.content.substring(0, 50)
    return `${clientName}: ${contentPreview}...`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-planin">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Tracker de Posts
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe e monitore todos os posts coletados em formato de tabela.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-planin space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filtros
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Sentimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="positive">Positivo</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
              <SelectItem value="negative">Negativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {VEHICLES.map((vehicle) => (
                <SelectItem key={vehicle} value={vehicle}>
                  {vehicle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground pt-2">
          Mostrando <strong>{filteredPosts.length}</strong> post(s) dos últimos{' '}
          {periodFilter} dias
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-planin overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Título</TableHead>
                <TableHead className="font-semibold">Veículo</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Região</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Sentimento</TableHead>
                <TableHead className="font-semibold">Urgência</TableHead>
                <TableHead className="font-semibold text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-muted-foreground/20 mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        Nenhum post encontrado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tente ajustar os filtros para encontrar posts.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => {
                  const urgency = getUrgency(post)
                  const category = getCategory(post)
                  const vehicle = getVehicle(post)
                  const region = getRegion(post)
                  const title = getTitle(post)

                  return (
                    <TableRow
                      key={post.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="truncate" title={title}>
                          {title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{vehicle}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(post.postedAt), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{region}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            getSentimentLabel(post.sentimentScore) ===
                            'positivo'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : getSentimentLabel(post.sentimentScore) ===
                                  'negativo'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {getSentimentLabel(post.sentimentScore)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            URGENCY_COLORS[urgency]
                          }`}
                        >
                          {URGENCY_LABELS[urgency]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle className="text-primary">
                                Detalhes do Post
                              </SheetTitle>
                              <SheetDescription>
                                Informações completas sobre este post.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-8 space-y-6">
                              <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                  Título
                                </h4>
                                <p className="text-base font-medium">{title}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                  Conteúdo
                                </h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {post.content}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                    Veículo
                                  </h4>
                                  <p className="text-sm">{vehicle}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                    Data
                                  </h4>
                                  <p className="text-sm">
                                    {format(
                                      new Date(post.postedAt),
                                      "dd/MM/yyyy 'às' HH:mm",
                                      { locale: ptBR },
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                    Região
                                  </h4>
                                  <p className="text-sm">{region}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                    Categoria
                                  </h4>
                                  <Badge variant="outline">{category}</Badge>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                  Sentimento
                                </h4>
                                <SentimentBadge score={post.sentimentScore} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                  Engajamento
                                </h4>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Curtidas:
                                    </span>{' '}
                                    <span className="font-medium">
                                      {post.likes}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Comentários:
                                    </span>{' '}
                                    <span className="font-medium">
                                      {post.comments}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Compartilhamentos:
                                    </span>{' '}
                                    <span className="font-medium">
                                      {post.shares}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Visualizações:
                                    </span>{' '}
                                    <span className="font-medium">
                                      {post.views}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                  Análise IA
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {post.sentimentExplanation}
                                </p>
                              </div>
                              <div>
                                {post.url && post.url !== '#' ? (
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    Ver post original →
                                  </a>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Link não disponível
                                  </span>
                                )}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
