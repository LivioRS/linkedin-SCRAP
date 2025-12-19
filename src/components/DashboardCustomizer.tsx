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
import { Settings, Grid, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

export function DashboardCustomizer() {
  const {
    widgets,
    toggleWidget,
    resetDashboard,
    moveWidgetUp,
    moveWidgetDown,
  } = useDashboard()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" /> Personalizar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-primary" /> Personalizar Workspace
          </DialogTitle>
          <DialogDescription>
            Escolha quais widgets aparecem e organize a ordem de exibição.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label>Widgets Disponíveis</Label>
            <Button variant="outline" size="sm" onClick={resetDashboard}>
              Restaurar Padrão
            </Button>
          </div>
          <div className="space-y-3">
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    {widget.visible ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>

                  <div>
                    <p
                      className={`font-medium ${!widget.visible && 'text-muted-foreground line-through'}`}
                    >
                      {widget.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {widget.type === 'kpi' && 'Indicador Chave'}
                      {widget.type === 'chart' && 'Gráfico Visual'}
                      {widget.type === 'table' && 'Tabela de Dados'}
                      {widget.type === 'list' && 'Lista'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => moveWidgetUp(index)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === widgets.length - 1}
                    onClick={() => moveWidgetDown(index)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1"></div>
                  <Switch
                    checked={widget.visible}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
