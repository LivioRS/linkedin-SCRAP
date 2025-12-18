import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useDashboard } from '@/hooks/useDashboard'
import { Settings, Grid, Eye, EyeOff } from 'lucide-react'
import { DashboardWidget } from '@/types'

export function DashboardCustomizer() {
  const {
    widgets,
    updateWidget,
    toggleWidget,
    resetDashboard,
  } = useDashboard()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Personalizar Dashboard
          </DialogTitle>
          <DialogDescription>
            Escolha quais widgets aparecem no seu dashboard principal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Widgets Disponíveis</Label>
            <Button variant="outline" size="sm" onClick={resetDashboard}>
              Restaurar Padrão
            </Button>
          </div>

          <div className="space-y-3">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {widget.visible ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{widget.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {widget.type === 'kpi' && 'Indicador Chave'}
                      {widget.type === 'chart' && 'Gráfico'}
                      {widget.type === 'table' && 'Tabela'}
                      {widget.type === 'list' && 'Lista'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={widget.visible}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setOpen(false)}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

