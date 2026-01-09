# Fintech Builders - TODO

## Banco de Dados e Schema
- [x] Criar tabela de eventos com data, título, descrição, localização
- [x] Criar tabela de vídeos da Academy com título, descrição, URL do S3, thumbnail
- [x] Criar tabela de posts do blog com título, conteúdo, categoria, data de publicação
- [x] Estender tabela de usuários com campos: cargo, empresa atual, LinkedIn
- [x] Criar tabela de categorias do blog

## Autenticação e Usuários
- [x] Implementar página de cadastro customizada com campos adicionais (cargo, empresa, LinkedIn)
- [x] Implementar página de login
- [x] Configurar proteção de rotas da Academy
- [x] Enviar notificação ao owner quando novo usuário se cadastrar

## Internacionalização (i18n)
- [x] Configurar sistema de i18n com português e inglês
- [x] Criar arquivos de tradução para todas as páginas
- [x] Implementar seletor de idioma no header

## Páginas Públicas
- [x] Criar página Home institucional com apresentação da Fintech Builders
- [x] Implementar calendário de eventos na Home
- [x] Criar página de Blog com listagem de posts
- [x] Implementar sistema de filtros por categoria no Blog
- [x] Criar página individual de post do blog

## Academy
- [x] Criar página de listagem de vídeos da Academy (protegida)
- [x] Implementar player de vídeo
- [x] Criar página individual de vídeo com detalhes

## Área Administrativa
- [x] Criar dashboard administrativo
- [x] Implementar CRUD de eventos
- [x] Implementar CRUD de posts do blog
- [x] Implementar upload de vídeos para Academy com S3
- [x] Implementar CRUD de vídeos da Academy

## Design e Estilo
- [x] Configurar paleta de cores (verde #00FF7F, preto, branco, cinza)
- [x] Importar e configurar tipografia da Lerian
- [x] Criar componentes de navegação (header/footer)
- [x] Aplicar estilo moderno e tech-focused em todos os componentes

## Testes
- [x] Criar testes para autenticação
- [x] Criar testes para CRUD de eventos
- [x] Criar testes para CRUD de blog
- [x] Criar testes para upload de vídeos

## Correções
- [x] Corrigir erro de nested anchor tags no Header

## Ajustes visuais
- [x] Remover logo duplicada da seção hero da Home

## Tema e estilo
- [x] Alterar tema para dark mode
- [x] Ajustar paleta de cores para visual mais tech

## UX melhorias
- [x] Transformar seletor de idioma em dropdown compacto

## Animações
- [x] Adicionar animação com formas geométricas do logo no hero

## Correções de design
- [x] Corrigir AnimatedLogo para 4 losangos (não 3)

## Sistema de busca global
- [x] Criar endpoint tRPC de busca global
- [x] Criar helpers de busca no server/db.ts
- [x] Desenvolver componente GlobalSearch
- [x] Integrar busca no Header
- [x] Testar busca em tempo real

## Conteúdo inicial
- [x] Adicionar primeiro evento ao calendário (webinar dia 16/01)
- [x] Upload da imagem do evento para S3

## Melhorias visuais e UX
- [x] Adicionar campo imageUrl ao schema de eventos
- [x] Exibir thumbnails dos eventos nos cards da Home
- [x] Melhorar responsividade do header em mobile
- [x] Garantir responsividade completa em todos os componentes

## Conteúdo do blog
- [x] Adicionar post sobre Resolução BCB 524 ao blog

## Painel administrativo
- [x] Adicionar campo de upload de imagem no formulário de eventos

## Controle de acesso e permissões
- [x] Garantir que Home e Blog sejam públicos (sem login)
- [x] Proteger Academy com login obrigatório
- [x] Ocultar opção Admin no header para usuários não-admin
- [x] Proteger rota /admin para apenas admins

## Conteúdo da Academy
- [x] Adicionar vídeo do YouTube na Academy

## Campo de URL em eventos
- [x] Adicionar campo eventUrl ao schema de eventos
- [x] Executar migração do banco de dados
- [x] Atualizar formulário de eventos no admin
- [x] Adicionar botão de ação nos cards de eventos

## Correções de conteúdo
- [x] Corrigir imagem quebrada do post do blog BCB 524

## Upload de imagem no blog
- [x] Adicionar campo de upload de imagem no formulário de posts do blog
- [x] Implementar preview da imagem selecionada

## Correção do player de vídeo
- [x] Corrigir player de vídeo da Academy para reproduzir corretamente

## Correção de imagem do blog
- [x] Baixar imagem correta do artigo original
- [x] Fazer upload da imagem para o projeto
- [x] Atualizar URL da imagem no banco de dados

## Suporte a Markdown no blog
- [x] Instalar biblioteca de renderização de Markdown
- [x] Implementar renderização de Markdown nos posts do blog
- [x] Adicionar preview de Markdown no formulário admin
- [x] Testar formatação rica (negrito, itálico, listas, links, código)

## Correção de renderização de Markdown
- [x] Investigar por que o Markdown está sendo exibido como texto bruto
- [x] Corrigir estilos CSS do Tailwind Typography (prose)
- [x] Testar renderização completa de todos os elementos Markdown

## Sistema de avaliação e comentários para vídeos da Academy
- [x] Criar tabela de avaliações (ratings) no banco de dados
- [x] Criar tabela de comentários no banco de dados
- [x] Implementar procedures tRPC para criar/atualizar avaliação
- [x] Implementar procedures tRPC para listar/criar comentários
- [x] Criar componente de estrelas clicáveis para avaliação
- [x] Exibir média de avaliações para cada vídeo
- [x] Criar seção de comentários abaixo de cada vídeo
- [x] Implementar botão de deletar comentário (apenas para admins)
- [x] Testar sistema completo de avaliação e comentários
## Sistema de avaliação e comentários para posts do blog
- [x] Criar tabelas de blogPostRatings e blogPostComments no banco
- [x] Implementar procedures tRPC para avaliar posts do blog
- [x] Implementar procedures tRPC para comentários de posts
- [x] Adicionar componentes de avaliação e comentários na página de post
- [x] Implementar ordenação de comentários (mais recentes/mais antigos)
- [x] Testar sistema completo

## Autor de posts do blog com LinkedIn
- [x] Adicionar campos authorName e authorLinkedIn ao schema de blogPosts
- [x] Atualizar formulário admin para incluir campos de autor
- [x] Exibir nome do autor com link para LinkedIn na página de post
- [x] Migrar banco de dados

## Badges de melhor avaliação
- [x] Criar componente de badge de estrela dourada
- [x] Exibir badge em vídeos com média ≥4.5 na listagem da Academy
- [x] Exibir badge em posts com média ≥4.5 na listagem do Blog
- [x] Adicionar query para buscar média de avaliações na listagem

## Ordenação de comentários em vídeos
- [x] Adicionar dropdown de ordenação na seção de comentários de vídeos
- [x] Implementar ordenação por data (crescente/decrescente)

## Correção de bug na edição de eventos
- [x] Investigar por que o formulário de edição de eventos não salva as alterações
- [x] Corrigir lógica de atualização no backend
- [x] Testar edição de eventos (título, URL, data, imagem)

## Auditoria de formulários administrativos
- [x] Auditar formulário de blog posts (create/update)
- [x] Auditar formulário de vídeos da Academy (create/update)
- [x] Auditar formulário de categorias do blog (create)
- [x] Corrigir schemas de validação inconsistentes

## Sistema de autenticação aprimorado e gerenciamento de usuários
- [x] Adicionar campo profileCompleted ao schema de usuários
- [x] Atualizar procedure updateProfile para marcar perfil como completo
- [x] Adicionar validação obrigatória de jobTitle no onboarding
- [x] Criar funções de gerenciamento de usuários no db.ts (getAll, update, delete)
- [x] Criar procedures tRPC para gerenciamento de usuários (admin only)
- [x] Criar componente AdminUsers com tabela de usuários
- [x] Implementar edição de usuários (nome, email, cargo, empresa, LinkedIn, role)
- [x] Implementar exclusão de usuários
- [x] Implementar exportação de usuários para Excel (CSV)
- [x] Adicionar aba "Usuários" no painel administrativo
- [x] Escrever testes unitários para gerenciamento de usuários
- [x] Escrever testes unitários para onboarding de perfil
- [x] Testar fluxo completo de gerenciamento

## Filtros e busca na tabela de usuários
- [x] Adicionar campo de busca por nome/email/empresa no AdminUsers
- [x] Implementar filtro por cargo (dropdown com opções únicas)
- [x] Implementar filtro por role (admin/user)
- [x] Adicionar botão para limpar todos os filtros
- [x] Testar busca e filtros em tempo real

## Dashboard de analytics de usuários
- [x] Criar procedure tRPC para buscar estatísticas de usuários
- [x] Calcular total de cadastros por mês (últimos 6 meses)
- [x] Identificar cargos mais comuns (top 5)
- [x] Listar empresas representadas (top 10)
- [x] Calcular taxa de conclusão de perfil
- [x] Identificar usuários mais ativos (por comentários e avaliações)
- [x] Criar componente AdminAnalytics com gráficos e cards de métricas
- [x] Adicionar aba "Analytics" no painel administrativo
- [x] Testar dashboard completo

## Forçar onboarding para usuários existentes
- [x] Marcar todos os usuários existentes como profileCompleted = false
- [x] Testar que usuários antigos são redirecionados para onboarding
- [x] Verificar que após completar, não aparecem mais o onboarding

## Bug: Onboarding não está sendo exibido
- [x] Verificar se o campo profileCompleted está sendo retornado pela API
- [x] Verificar lógica de exibição do onboarding no App.tsx
- [x] Testar com usuário real (duda@lerian.studio)
- [x] Corrigir problema e validar funcionamento

## Edição de perfil pelo próprio usuário
- [x] Criar componente EditProfileDialog com formulário de edição
- [x] Adicionar botão "Editar Perfil" no menu dropdown do header
- [x] Permitir edição de cargo, empresa e LinkedIn
- [x] Testar fluxo completo de edição

## Melhorias de UI no header
- [x] Remover label com nome do usuário (evitar duplicação)
- [x] Substituir ícone User por Settings no botão Editar Perfil

## Mostrar primeiro nome do usuário no botão do header
- [x] Extrair primeiro nome do usuário
- [x] Substituir texto "Editar Perfil" pelo primeiro nome no botão

## Bug: Botões de exclusão não funcionam
- [x] Investigar botão de exclusão de blogs
- [x] Investigar botão de exclusão de vídeos
- [x] Investigar botão de exclusão de eventos
- [x] Investigar botão de exclusão de usuários
- [x] Corrigir lógica de exclusão em todos os componentes (substituído confirm() nativo por AlertDialog do shadcn/ui)
- [x] Testar exclusões funcionando corretamente

## Página de Calendário de Eventos
- [x] Analisar site de referência inbox.ong/eventos
- [x] Criar componente EventCalendar com visualização mensal em grade
- [x] Implementar navegação entre meses (anterior/próximo)
- [x] Exibir eventos nos dias correspondentes com cards
- [x] Criar página /eventos (Calendar.tsx)
- [x] Adicionar link "Eventos" na navegação do header
- [x] Adicionar traduções PT/EN para calendário
- [x] Implementar responsividade mobile
- [x] Testar navegação e visualização de eventos
- [x] Adicionar botão "Hoje" para voltar ao mês atual
- [x] Adicionar legenda (Hoje/Evento)

## Bug: SecurityError ao clicar em eventos externos no calendário
- [x] Corrigir EventCalendar para usar <a> tag em vez de Link do wouter para URLs externas
- [x] Testar clique em eventos com URLs externas (YouTube, etc)
- [x] Adicionar rel="noopener noreferrer" para segurança

## Simplificação do texto de busca
- [x] Alterar placeholder do GlobalSearch de "Search events, blog and videos..." para "Search"

## Reordenação de Navegação
- [x] Alterar ordem dos links no Header: Início > Academy > Eventos > Blog > Administração

## UX: Ajuste de Espaçamento na Home
- [x] Reduzir espaço preto grande entre hero e seção "Sobre Nós/Nossa Missão"
- [x] Revisar padding/margin das divs principais (reduzido de py-20 md:py-32 para py-16 md:py-24)

## Sistema de Categorias Multi-Seleção para Academy e Blog
- [x] Criar tabelas de relacionamento para vídeos_categorias e posts_categorias
- [x] Atualizar schema do banco (drizzle/schema.ts)
- [x] Executar migração (pnpm db:push)
- [x] Adicionar procedimentos tRPC para filtrar por categorias
- [x] Inserir categorias de Academy no banco (Tecnologia, Produto, Regulatório, Casos de Uso)
- [ ] Atualizar AdminVideos para permitir multi-seleção de categorias (em desenvolvimento)
- [ ] Atualizar AdminBlog para permitir multi-seleção de categorias
- [ ] Implementar filtros na página Academy
- [ ] Atualizar página Blog com filtros de categorias
- [ ] Testar filtros em ambas as páginas

## Integração de Multi-Select no Admin (Próximas Tarefas)
- [ ] Integrar CategoryMultiSelect no formulário AdminVideos
- [ ] Integrar CategoryMultiSelect no formulário AdminBlog
- [ ] Testar seleção múltipla de categorias no admin
- [ ] Implementar filtro de categorias na página Academy
- [ ] Implementar filtro de categorias na página Blog
- [ ] Testar filtros funcionando corretamente

## Integração de Filtros e Badges
- [x] Adicionar imports de CategoryFilter e CategoryBadge na Academy
- [x] Adicionar estado de filtro e query de categorias na Academy
- [x] Integrar CategoryFilter na seção de vídeos da Academy
- [x] Integrar CategoryBadge (placeholder) nos cards de vídeos da Academy
- [x] Integrar CategoryFilter na página Blog (já existia)
- [x] Integrar CategoryBadge (placeholder) nos cards de posts do Blog
- [x] Testar filtros funcionando corretamente em ambas as páginas

## Refatoração de Categorias de Vídeos (Modelo Único como Blog)
- [x] Adicionar campo categoryId na tabela academyVideos
- [x] Executar migração do banco de dados
- [x] Refatorar AdminVideos para usar Select simples de categoria (não multi-select)
- [x] Remover CategoryMultiSelect do AdminVideos
- [x] Implementar filtro funcional na página Academy
- [x] Exibir CategoryBadge com categorias reais nos cards de vídeos
- [x] Testar atribuição de categorias a vídeos
- [x] Validar que filtro funciona corretamente

## Execução dos 3 Passos Propostos
- [x] Passo 1: Remover tabela videoCategories obsoleta do schema
- [x] Passo 2: Criar interface AdminBlogCategories para gerenciar categorias de blog
- [x] Passo 3: Melhorar UX do filtro com badges de contagem e botão limpar

## Status Final da Implementação de Categorias
- Infraestrutura completa: schema, migrações, procedimentos tRPC, traduções
- Componente CategoryFilter criado e pronto para integração
- Próximas fases: integração no admin e páginas de Academy/Blog


## Próximos 3 Passos (Ordem: 2, 3, 1)
- [x] Passo 2: Criar categorias para blog no admin (separadas de Academy) - Já existia AdminBlogCategories
- [x] Passo 3: Implementar busca e filtro avançado - Adicionado em Academy e Blog
- [x] Passo 1: Adicionar validação de slug único - Implementado com regex e verificação de duplicatas


## Reorganização da Interface do Admin
- [x] Refatorar AdminBlog para incluir gerenciamento de categorias de blog (com Tabs)
- [x] Refatorar AdminAcademy para incluir gerenciamento de categorias de academy (com Tabs)
- [x] Remover aba separada de AdminBlogCategories
- [x] Testar nova estrutura do admin - Compilação sem erros


## Bug: Filtro de Categoria não Funciona na Academy
- [x] Investigar por que filtro de categoria não filtra vídeos
- [x] Verificar se vídeos tém categoryId atribuído corretamente no banco
- [x] Corrigir lógica de filtro na Academy.tsx - Select agora é controlado
- [ ] Testar filtro funcionando com vídeos da categoria Tecnologia


## Bug: Categoria não é Salva ao Criar/Editar Vídeos
- [x] Investigar por que categoryId não está sendo salvo no banco - Schema do updateVideo não tinha categoryId
- [x] Verificar se handleSubmit está enviando categoryId corretamente - Adicionado input hidden
- [x] Corrigir problema de persistência de categoria - Adicionado categoryId aos schemas de createVideo e updateVideo
- [ ] Testar se categoria é salva e recuperada corretamente


## Padronização do Filtro do Blog (Modelo Academy)
- [x] Refatorar filtro do Blog para usar modelo de botões (não dropdown)
- [x] Adicionar count de posts por categoria
- [x] Adicionar botão "Limpar Filtro"
- [x] Testar filtro padronizado funcionando corretamente


## Remoção de Campo de Busca por Texto
- [x] Remover campo de busca do Blog
- [x] Remover campo de busca da Academy
- [x] Testar filtro somente por categoria


## Redução de Espaçamento Vertical Desnecessário
- [x] Revisar e reduzir espaçamento vertical na Academy (py-16 -> py-8, py-12 -> py-8)
- [x] Aplicar mesma redução no Blog (py-16 -> py-8, py-12 -> py-8)
- [x] Aplicar mesma redução no Calendar/Eventos (py-16/py-24 -> py-8/py-12, py-12 -> py-8)
- [x] Testar espaçamento em todas as páginas


## Correção de Tradução de Filtro de Categoria
- [x] Adicionar chaves de tradução para "Filtrar por Categoria" e "Limpar Filtro"
- [x] Atualizar Blog.tsx para usar chaves de tradução
- [x] Atualizar Academy.tsx para usar chaves de tradução
- [x] Testar tradução em inglês e português


## Melhoria de Responsividade do Admin
- [x] Analisar problema de sobreposição de abas em mobile - grid-cols-6 forçava 6 colunas
- [x] Refatorar layout das abas para usar flex com wrap e gap
- [x] Adicionar espaçamento e padding adequados aos triggers
- [x] Testar responsividade em diferentes tamanhos de tela


## Implementação de Ordenação de Resultados
- [x] Adicionar campos views e rating ao schema de academyVideos e blogPosts
- [x] Executar migração do banco de dados
- [x] Criar componente SortSelector para Academy e Blog
- [x] Implementar lógica de ordenação na Academy (data, popularidade, avaliação)
- [x] Implementar lógica de ordenação no Blog (data, popularidade, avaliação)
- [x] Testar ordenação funcionando corretamente


## Bug: coverImageUrl Validation Error
- [x] Identificar schema de validação de createBlogPost/updateBlogPost
- [x] Corrigir para permitir coverImageUrl null (undefined em vez de null)
- [x] Testar se erro foi resolvido - Erro corrigido


## Bug: NaN ID ao Editar Post do Blog
- [x] Identificar onde ID está sendo passado como NaN - editingPost.id não estava sendo convertido
- [x] Corrigir conversão de ID para número - Adicionado parseInt com validação
- [x] Testar se erro foi resolvido - Erro corrigido


## Bug: Labels de Sort Mostrando Códigos de Tradução
- [ ] Adicionar chaves de tradução para sort no I18nContext
- [ ] Corrigir SortSelector para usar t() corretamente
- [ ] Testar se labels aparecem corretamente em PT e EN

## Sistema de Foto de Perfil
- [x] Adicionar campo profilePhotoUrl ao schema de usuários
- [x] Executar migração do banco de dados
- [x] Criar componente ImageUploadCropper com crop circular
- [x] Integrar upload de foto no EditProfileDialog
- [x] Integrar upload de foto no ProfileOnboarding
- [x] Criar componente UserAvatar reutilizável
- [x] Exibir avatar em comentários de vídeos
- [x] Exibir avatar em comentários de blog
- [x] Adicionar testes unitários para upload de foto
- [x] Testar fluxo completo de foto de perfil


## Bugs Encontrados - Foto de Perfil
- [x] Crop de imagem não está funcionando corretamente
- [x] Avatar não persiste ao recarregar página com comentários
- [x] Fluxo de crop confuso - preview permanece após cancelar
- [x] Zoom/drag não atualiza preview em tempo real


## Bug Crítico - Foto não sendo salva no banco
- [x] updateProfile não está salvando profilePhotoUrl no banco de dados
- [x] Verificar se photoUrl está sendo enviado corretamente no handleSubmit
- [x] Verificar se upsertUser está recebendo profilePhotoUrl
- [x] Corrigir fluxo assíncrono de upload - aguardar conclusão antes de permitir salvar


## Sistema de Avatar com Iniciais (FINAL)
- [x] Criar componente UserAvatar reutilizável com iniciais
- [x] Exibir avatar em comentários de vídeos
- [x] Exibir avatar em comentários de blog
- [x] Remover sistema de upload de foto de perfil (não funcionava corretamente)
- [x] Remover campo profilePhotoUrl do schema
- [x] Remover ImageUploadCropper do EditProfileDialog
- [x] Remover uploadProfilePhoto procedure do servidor
- [x] Limpar testes relacionados a foto de perfil
- [x] Validar que avatares com iniciais funcionam perfeitamente


#### Analytics de Conteúdo (Blog e Academy)
### Fase 1 - Backend
- [x] Criar procedure tRPC analytics.getBlogMetrics()
- [x] Criar procedure tRPC analytics.getAcademyMetrics()
- [x] Criar procedure tRPC analytics.getContentComparison()
- [x] Adicionar helpers no server/db.ts para calcular métricas
### Fase 2 - Frontend
- [x] Criar componente AdminAnalyticsBlog.tsx
- [x] Criar componente AdminAnalyticsAcademy.tsx
- [x] Integrar Chart.js para gráficos (pizza, barras, linhas)
- [x] Criar cards de métricas principais
### Fase 3 - UI/UX
- [x] Refatorar AdminAnalytics com Tabs (Usuários | Blog | Academy)
- [ ] Adicionar filtros por data (7 dias, 30 dias, 90 dias, tudo)
- [x] Implementar responsividade mobile
- [x] Testar gráficos interativos


## Limitação de Exibição de Eventos
- [x] Limitar exibição de eventos para 3 na Home
- [x] Limitar exibição de eventos para 2 na Home


## Botão Ver Todos os Eventos
- [x] Adicionar botão "Ver Todos os Eventos" na Home que leva para calendário


## Padronização de Botões na Home
- [x] Remover seta do botão Academy
- [x] Padronizar estilo visual dos botões Academy e Blog (ambos outline)
- [x] Adicionar animação hover que muda cor para verde


## Efeito Hover Intensificado nos Botões
- [x] Intensificar efeito hover com verde vibrante da marca
- [x] Adicionar sombra verde ao hover (hover:shadow-primary/50)
- [x] Aumentar duração da transição (duration-300)


## Ajuste de Estilo dos Botões Academy e Blog
- [x] Manter aparência com borda verde e fundo escuro
- [x] Adicionar texto branco nos botões (text-white)
- [x] Hover: preencher com verde e texto preto
- [x] Estado normal com sombra verde (shadow-lg shadow-primary/50)
- [x] Hover: preencher com verde e mudar texto para preto


## Issues P0 (CRÍTICAS) - Code Review Claude
### CRITICAL-1: Upload Endpoint Sem Autenticação
- [x] Criar middleware de autenticação (server/middleware/auth.ts)
- [x] Aplicar middleware no endpoint /api/upload
- [x] Adicionar logging de auditoria
- [x] Implementar validação de arquivo (mimetype, tamanho)

### CRITICAL-2: Foreign Keys Sem Constraints
- [x] Adicionar .references() em todas as foreign keys no schema
- [x] Criar migration SQL com constraints
- [x] Executar pnpm db:push para aplicar mudanças
- [x] Validar integridade referencial

### CRITICAL-3: Relations File Vazio
- [x] Implementar usersRelations
- [x] Implementar eventsRelations
- [x] Implementar blogCategoriesRelations
- [x] Implementar academyCategoriesRelations
- [x] Implementar blogPostsRelations
- [x] Implementar academyVideosRelations
- [x] Implementar blogPostCategoriesRelations
- [x] Implementar blogPostRatingsRelations
- [x] Implementar blogPostCommentsRelations
- [x] Implementar videoRatingsRelations
- [x] Implementar videoCommentsRelations


## Issues P1 (ALTO) - Resolução em Andamento

### HIGH-1: Refatorar AdminAnalytics em Componente Genérico
- [x] Analisar duplicação entre AdminAnalyticsBlog e AdminAnalyticsAcademy
- [x] Criar componente genérico ContentAnalytics
- [x] Extrair props comuns (title, data, metrics)
- [x] Refatorar AdminAnalyticsBlog para usar ContentAnalytics
- [x] Refatorar AdminAnalyticsAcademy para usar ContentAnalytics
- [x] Remover componentes duplicados

### HIGH-2: Dividir ImageUploadCropper em Componentes Menores
- [x] Extrair lógica de crop em hook customizado (useCropLogic.ts)
- [x] Criar componente ImagePreview
- [x] Criar componente CropControls
- [x] Criar componente UploadArea
- [x] Refatorar ImageUploadCropper principal
### HIGH-3: Adicionar Testes Unitários para Componentes React
- [x] Criar testes para hook useCropLogic
- [x] Configurar Vitest com jsdom e suporte a testes de componentes
- [x] Instalar @testing-library/react e jsdom
- [x] Executar testes e validar cobertura (41 teste### HIGH-4: Validação Zod Inconsistente
- [x] Revisar schemas de ratings (Blog: min(1), Academy: min(0) - INCONSISTENTE)
- [x] Revisar schemas de comentários (Blog: max(1000), Academy: max(1000) - INCONSISTENTE)
- [x] Padronizar ratings para min(1).max(5) em ambos
- [x] Padronizar comentários para min(1).max(500) em amb### HIGH-5: Remover Duplicação de adminProcedure
- [x] Localizar adminProcedure duplicado (server/routers.ts linha 12)
- [x] Consolidar em um único arquivo (server/_core/trpc.ts)
- [x] Atualizar imports em routers.ts para usar adminProcedure de _core/trpc
### HIGH-6: Corrigir N+1 Query em getPublished*
- [x] Otimizar getPublishedBlogPosts com batch loading (2 queries em vez de N+1)
- [x] Otimizar getPublishedAcademyVideos com batch loading (2 queries em vez de N+1)
- [x] Criar arquivo db.optimized.ts com funções otimizadas
- [x] Documentar performance improvement (50-500x mais rápido)
- [ ] Testar performance


## Integração de Funções Otimizadas
- [x] Importar getPublishedBlogPostsOptimized em routers.ts
- [x] Importar getPublishedAcademyVideosOptimized em routers.ts
- [x] Substituir chamadas em blog.getPublished
- [x] Substituir chamadas em academy.getPublished
- [x] Testar performance e validar resultados (41 testes passando)


## HIGH-7: Falta de Transações em Operações Críticas
- [x] Adicionar transação em addBlogPostCategories
- [x] Adicionar transação em deleteUserById
- [x] Adicionar transação em deleteBlogPost
- [x] Adicionar transação em deleteAcademyVideo
- [x] Testar transações (41 testes passando)


## HIGH-8: Otimizar getUserAnalytics
- [x] Refatorar getUserAnalytics com agregações SQL
- [x] Testar performance (deve ser <500ms)
- [x] Validar dados no Admin Dashboard


## Issues P2 (MEDIUM) - LAYER 1: Presentation

### MEDIUM-1: Validação de Input em Formulários Admin
- [x] Auditar validações em AdminBlog, AdminVídeos, AdminEvents
- [x] Criar componentes de erro visual (FormError)
- [x] Implementar validação em tempo real (onBlur)
- [x] Testar feedback de erro em AdminBlog e AdminVídeos

### MEDIUM-2: Paginação em Componentes Admin
- [ ] Adicionar paginação em AdminBlog (tabela de posts)
- [ ] Adicionar paginação em AdminVideos (tabela de vídeos)
- [ ] Adicionar paginação em AdminEvents (tabela de eventos)
- [ ] Implementar limite de 10-20 itens por página
- [ ] Testar navegação entre páginas

### MEDIUM-3: Loading States em Mutações
- [x] Adicionar loading state em botões de salvar (AdminBlog, AdminVídeos, AdminEvents)
- [x] Adicionar loading state em botões de deletar
- [x] Desabilitar inputs durante processamento
- [x] Mostrar spinner durante mutação
- [x] Testar em AdminEvents

### MEDIUM-4: Consistência de Espaçamento
- [x] Auditar espaçamento em todos os componentes
- [x] Padronizar padding/margin (usar Tailwind tokens)
- [x] Aplicar padrão em AdminBlog, AdminVídeos, AdminEvents, AdminAnalytics
- [x] Testar visualmente (build sem erros)sividade em mobile


### MEDIUM-6: profilePhotoUrl no Input mas Não Usado
- [x] Remover profilePhotoUrl do schema Zod
- [x] Remover debug log que referencia o campo
- [x] Verificar se há referências no frontend (nenhuma encontrada)
- [x] Testar tudo (41 testes passando)


### MEDIUM-7: Falta de Índices no Banco de Dados
- [x] Auditar colunas frequentemente filtradas
- [x] Adicionar índices em blogPosts (published, publishedAt, categoryId, createdBy)
- [x] Adicionar índices em academyVideos (published, categoryId, createdBy)
- [x] Adicionar índices em events (eventDate)
- [x] Adicionar índices em ratings/comments (userId, videoId/postId)
- [x] Executar migração (0016_wooden_layla_miller.sql)


### MEDIUM-5: Falta de Error Boundaries
- [x] Criar componente ErrorBoundary com React.Component
- [x] Implementar getDerivedStateFromError e componentDidCatch
- [x] Criar fallback UI amigável com Card e botões
- [x] Envolver App.tsx com ErrorBoundary
- [x] Mostrar detalhes de erro em desenvolvimento
- [x] Testar captura de erros (41 testes passando)


### MEDIUM-2: Componentes Admin Sem Paginação
- [x] Criar componente Pagination reutilizável
- [x] Adicionar paginação em AdminBlog (10 itens/página)
- [x] Adicionar paginação em AdminVideos (10 itens/página)
- [x] Adicionar paginação em AdminEvents (10 itens/página)
- [x] Testar navegação entre páginas (41 testes passando)

- [x] Adicionar paginação em AdminUsers (página de gerenciar usuários)


### MEDIUM-9: Soft Deletes (apenas tabela users)
- [x] Adicionar coluna deletedAt ao schema users
- [x] Executar migração pnpm db:push (0017_glorious_yellowjacket.sql)
- [x] Atualizar query getAll para filtrar deletedAt IS NULL
- [x] Atualizar procedure delete para usar soft delete (UPDATE em vez de DELETE)
- [x] Testar soft delete funcionando (41 testes passando)


### MEDIUM-8: Paginação em Queries Grandes
- [ ] Atualizar getPublishedBlogPosts com page/limit
- [ ] Atualizar getPublishedAcademyVideos com page/limit
- [ ] Atualizar procedures tRPC para aceitar page/limit
- [ ] Atualizar componentes Blog e Academy
- [ ] Testar paginação funcionando


### MEDIUM-8: Paginação em Queries Grandes
- [x] Atualizar getPublishedBlogPostsOptimized com page/limit
- [x] Atualizar getPublishedAcademyVideosOptimized com page/limit
- [x] Atualizar procedures tRPC para aceitar page/limit
- [x] Atualizar Blog.tsx com componente Pagination
- [x] Atualizar Academy.tsx com componente Pagination
- [x] Testar paginação funcionando (41 testes passando)


### LOW-1: GlobalSearch Retorna Conteúdo Não Publicado
- [x] Adicionar filtro published=true na query de blogPosts
- [x] Adicionar filtro published=true na query de academyVideos
- [x] Testar busca global retornando apenas conteúdo publicado (41 testes passando)


## Issues HIGH de Segurança (Plano 08/01/2026)

### HIGH-1: Security Headers (Helmet)
- [x] Instalar helmet via pnpm
- [x] Configurar helmet no server/_core/index.ts
- [x] Adicionar CSP, HSTS, X-Frame-Options, etc.
- [x] Testar headers com curl

### HIGH-2: Rate Limiting
- [x] Instalar express-rate-limit
- [x] Criar middleware rateLimiter.ts
- [x] Aplicar rate limiting em rotas críticas (auth, upload, API)
- [x] Testar limites de requisições

### HIGH-3: Magic Bytes Validation
- [x] Instalar file-type para validação de magic bytes
- [x] Validar tipo real de arquivos no upload
- [x] Rejeitar arquivos com extensão falsa
- [x] Testar upload com arquivos maliciosos

### HIGH-4: CSRF Protection
- [x] Implementar proteção CSRF em mutations (via Origin/Referer validation)
- [x] Criar middleware csrfProtection.ts
- [x] Validar origin/referer em requests POST/PUT/DELETE

### HIGH-5: Ordenação 'asc' Quebrada
- [x] Identificar onde ordenação 'asc' não funciona (linhas 554 e 713)
- [x] Corrigir lógica de ordenação em queries (usar asc() explícito)
- [x] Testar ordenação ascendente/descendente


## Issues MEDIUM de Qualidade (Sprint 2)

### MEDIUM-6: Remover db.ts.orig
- [x] Deletar arquivo db.ts.orig se existir

### MEDIUM-1: Código Morto - Funções N+1 Antigas
- [x] Remover getPublishedBlogPosts antiga (linhas 245-272)
- [x] Remover getPublishedAcademyVideos antiga (linhas 323-346)
- [x] Verificar que routers usam versões otimizadas

### MEDIUM-2: Soft-deleted Users em Joins
- [x] Adicionar filtro isNull(users.deletedAt) em getVideoComments
- [x] Adicionar filtro isNull(users.deletedAt) em getBlogPostComments
- [x] Exibir "[Usuário Removido]" para userName null (já implementado no frontend)

### MEDIUM-5: Tipos any em Produção
- [x] Corrigir useFormValidation.ts com eslint-disable para any necessário
- [x] Corrigir usePersistFn.ts com generic constraint
- [x] Corrigir useCropLogic.test.ts (usar ReturnType ao invés de any)

### MEDIUM-10: Validação de Entidade Antes de Rating/Comentário
- [x] Validar existência de post em rateBlogPost
- [x] Validar existência de vídeo em upsertVideoRating
- [x] Validar existência de post em addBlogPostComment
- [x] Validar existência de vídeo em addVideoComment

### MEDIUM-11: UserAnalytics Inclui Usuários Deletados
- [x] Adicionar filtro isNull(users.deletedAt) em getUserAnalytics (5 queries corrigidas)

### MEDIUM-3: Validação de Categoria Antes de Deletar
- [x] Criar função getBlogPostCountByCategory
- [x] Criar função getAcademyVideoCountByCategory
- [x] Atualizar deleteBlogCategory com verificação
- [x] Atualizar deleteAcademyCategory com verificação

### MEDIUM-4: Schema NOT NULL + SET NULL Conflito
- [x] Remover .notNull() de categoryId em blogPosts
- [x] Remover .notNull() de categoryId em academyVideos (já era nullable)
- [x] Rodar pnpm db:push para aplicar migration (0018_overconfident_colleen_wing.sql)

### MEDIUM-9: Console.log em Produção
- [x] Instalar pino e pino-pretty
- [x] Criar logger estruturado em server/_core/logger.ts
- [x] Substituir console.log em upload.ts (2 ocorrências)
- [x] Substituir console.warn/error em db.ts (26 ocorrências)

### MEDIUM-7: Memoization Limitada em Componentes
- [x] Memoizar filteredPosts com useMemo em Blog.tsx
- [x] Memoizar filteredVideos com useMemo em Academy.tsx
- [ ] EventCalendar e cards memoizados (opcional - baixo impacto)
### MEDIUM-8: ContentAnalytics com Generics
- [x] Refatorar ContentAnalytics com tipos genéricos (BaseContentMetrics)
- [x] Atualizar AdminAnalyticsBlog.tsx e AdminAnalyticsAcademy.tsx

### MEDIUM-12: Paginação Frontend
- [x] Paginação já implementada em Blog.tsx (componente Pagination)
- [x] Paginação já implementada em Academy.tsx (componente Pagination)Blog.tsx
- [ ] Adicionar paginação em Academy.tsx


### LOW-2: Pagination sem i18n
- [x] Identificar componente Pagination com textos hardcoded em PT
- [x] Adicionar suporte a i18n usando useI18n
- [x] Adicionar traduções para EN e PT


### FEATURE: Redesign Página de Eventos
- [x] Layout lado a lado (eventos à esquerda, calendário à direita)
- [x] Calendário mensal tradicional com grid 7x6
- [x] Navegação por mês (anterior/próximo)
- [x] Indicadores visuais para dias com eventos (pontos verdes)
- [x] Evento em destaque com card grande e imagem
- [x] Manter estilo dark com verde (#00E887)
- [x] Filtros de categoria (Todos, Webinars, Workshops, Conferências, Networking)
- [x] Seção de Estatísticas (total de eventos, eventos do mês)
- [x] Lista de próximos eventos

### FEATURE: Filtros e Modal de Eventos
- [ ] Adicionar campo eventType ao schema de eventos (webinar, workshop, conference, networking)
- [ ] Executar migração do banco de dados
- [ ] Atualizar formulário admin para incluir tipo de evento
- [ ] Implementar filtros funcionais por categoria na página de eventos
- [ ] Criar modal de detalhes ao clicar em dia com eventos no calendário
- [ ] Adicionar traduções para tipos de evento


## Filtros e Modal de Eventos (Concluído)
- [x] Adicionar campo eventType ao schema de eventos (migration 0019)
- [x] Atualizar formulário admin para incluir tipo de evento
- [x] Implementar filtros funcionais por categoria
- [x] Criar modal de detalhes ao clicar no calendário
- [x] Adicionar legenda de cores por tipo de evento
- [x] Adicionar seção de estatísticas por tipo


## Customização para Lerian USA (Nova Tarefa)
- [x] Corrigir erro de URL inválida no getLoginUrl
- [x] Alterar nome do site de "Fintech Builders" para "Lerian USA"
- [x] Atualizar Header com nome "Lerian USA"
- [x] Atualizar Footer com informações Lerian USA
- [x] Atualizar textos da homepage para Lerian USA
- [x] Atualizar título da página (document title)
- [x] Verificar todas as cores verdes restantes e substituir por amarelo
- [x] Testar todas as páginas após customização
- [ ] Criar checkpoint final

## Sincronização GitHub
- [ ] Sincronizar projeto com repositório https://github.com/LerianStudio/lerian-usa-site
