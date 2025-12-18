# 🚀 Como Acessar o Dashboard

## Opção 1: Executar Localmente (Desenvolvimento)

### Passo 1: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
cd linkedin-SCRAP
npm install
```

ou se você usa pnpm:

```bash
cd linkedin-SCRAP
pnpm install
```

### Passo 2: Iniciar o Servidor de Desenvolvimento

```bash
npm start
```

ou

```bash
npm run dev
```

### Passo 3: Acessar o Dashboard

Após iniciar o servidor, o dashboard estará disponível em:

**http://localhost:8080**

O Vite mostrará no terminal a URL exata quando o servidor iniciar.

---

## Opção 2: Acessar via Skip (Produção)

Se o projeto está publicado no Skip:

1. Acesse o link fornecido pelo Skip (exemplo: `https://linkedin-reputacao-monitor-0e5d6.goskip.app/`)
2. O dashboard será carregado automaticamente na rota `/`

---

## 📍 Rotas Disponíveis

Após acessar, você terá as seguintes páginas disponíveis:

- **`/`** - Dashboard principal (página inicial)
- **`/clients`** - Gerenciamento de Clientes
- **`/feed`** - Feed de Reputação
- **`/analysis`** - Análise Competitiva
- **`/alerts`** - Central de Alertas
- **`/settings`** - Configurações

---

## 🔧 Solução de Problemas

### Erro: "Cannot find module"

Execute novamente: `npm install`

### Porta 8080 já está em uso

O Vite tentará usar outra porta automaticamente. Verifique o terminal para ver qual porta foi atribuída.

### Página em branco

1. Verifique o console do navegador (F12) para erros
2. Certifique-se de que todas as dependências foram instaladas
3. Tente limpar o cache: `npm run build` e depois `npm start`

---

## 📝 Notas Importantes

- O projeto usa **Vite** como servidor de desenvolvimento
- A porta padrão é **8080** (configurada em `vite.config.ts`)
- O dashboard carrega dados mockados inicialmente
- Para usar APIs reais, configure as chaves em `/settings`
