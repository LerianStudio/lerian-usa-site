# Análise do Calendário de Referência (inbox.ong/eventos)

## Layout e Estrutura

### Cabeçalho
- Título "Agenda" com subtítulo "Tudo que está por vir"
- Filtros: Mês (dropdown), País (dropdown), Tags (dropdown)
- Legenda de tipos: Evento, Feriado, Jogo

### Grade do Calendário
- Layout em grid 7 colunas (Dom-Sab)
- Cada célula representa um dia do mês
- Dias com eventos mostram cards dentro da célula
- Cards de eventos contêm:
  - Nome do evento
  - Localização (cidade, país)
  - Múltiplos eventos podem aparecer no mesmo dia

### Características Visuais
- Fundo azul/turquesa (#2B7A8B aproximadamente)
- Cards de eventos com fundo semi-transparente
- Bordas arredondadas nas células
- Números dos dias no canto superior esquerdo
- Eventos empilhados verticalmente quando há múltiplos no mesmo dia

## Adaptação para Fintech Builders

### Manter:
- Grid mensal 7x5/6 (semanas)
- Dropdown de seleção de mês
- Cards de eventos dentro das células
- Múltiplos eventos por dia

### Adaptar:
- Cores: usar paleta verde (#10b981) da Fintech Builders
- Fundo: manter dark theme consistente
- Remover filtros de país/tags (não aplicável inicialmente)
- Simplificar para focar apenas em eventos
- Adicionar navegação anterior/próximo mês com botões
