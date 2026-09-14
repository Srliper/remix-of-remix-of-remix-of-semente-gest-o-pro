# Splash Screen “A Evolução da Semente”

## Objetivo
Criar uma abertura cinematográfica de aproximadamente 3,2 segundos antes do conteúdo atual, cobrindo login e demais páginas sem alterar seus fluxos.

## Implementação
- Adicionar `framer-motion` ao projeto.
- Criar `SplashScreen.tsx` com quatro fases sincronizadas:
  1. semente terracota surgindo e pulsando;
  2. transformação em broto verde com crescimento orgânico e partículas douradas;
  3. revelação escalonada de “Brechó A Semente” e bounce final;
  4. saída com fade, expansão e desfoque.
- Integrar a splash no contêiner raiz equivalente ao `App.tsx` deste projeto, usando `AnimatePresence`, estado local e temporizador de 3200 ms.
- Manter o aplicativo renderizado por trás durante a saída para produzir a transição simultânea solicitada.
- Respeitar preferência de movimento reduzido sem impedir o acesso ao aplicativo.

## Detalhes técnicos
- Overlay `fixed inset-0 z-50`.
- Movimentos principais com mola (`stiffness: 100`, `damping: 15`).
- Cores da animação registradas como tokens semânticos no sistema visual.
- Partículas determinísticas para evitar diferenças entre renderizações.
- Validação visual no login em viewport desktop e móvel, além de checagem de erros no navegador.
