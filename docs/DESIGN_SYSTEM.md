# Design System — Seara Minha Receita

> **Versão:** 1.0.0  
> **Origem:** Auditoria direta em produção de `https://www.seara.com.br/minha-receita/` e subpáginas (`/receitas-e-materias/churrasco/`, `/todas-as-receitas/`, `/receita/.../`, `/?s=...`) nos viewports Desktop (`1920 × 897 px`) e Mobile (`390 × 844 px`).  
> **Escopo deste documento:** Especificação técnica completa para construção do aplicativo Seara Minha Receita, separando rigorosamente o que foi **observado no site atual** das **extensões padronizadas recomendadas** para acessibilidade (WCAG AA), consistência e cobertura de estados interativos.

---

## 1. Visão Geral, Identidade Visual & Princípios de Design

### 1.1 Posicionamento Editorial Culinário

O **Seara Minha Receita** combina a energia vibrante da marca Seara com uma linguagem editorial gastronômica limpa e apetitosa. A interface funciona como vitrine fotográfica:

- **Fotografia como protagonista:** Imagens de pratos em alta definição (`object-fit: cover`, cantos `8px` ou `16px`) ocupam grande área visual, com títulos e metadados posicionados abaixo da foto em cards padrão ou sobre gradientes escuros calibrados nos destaques.
- **Identidade cromática quente e apetitosa:** A navegação principal e pontos de conversão da marca ancoram-se no **Laranja Seara** (`#FF5B0D` no header e `#FF5300` em busca, newsletter e rodapé) e no **Terracota Editorial** (`#CE5032` em H1, CTAs em pílula e badges de categoria), equilibrados por amplo respiro branco (`#FFFFFF`) e superfícies creme acolhedoras (`#FAF5F3`) em menus, autocomplete e drawers.
- **Tipografia geométrica amigável:** Toda a interface ativa é renderizada exclusivamente em **`Lufga`** (pesos `300` a `700`), conferindo leitura moderna, arredondada e legível tanto em títulos editoriais quanto em listas de ingredientes.

### 1.2 Princípios de Design & Regras de Do / Don't

| Pilar | Do (Faça) | Don't (Não faça) |
| :--- | :--- | :--- |
| **1. Clareza Editorial** | Use superfícies brancas (`#FFFFFF`) e creme (`#FAF5F3`) para dar respiro ao redor das fotografias de receitas e matérias. | Não adote fundos escuros ou roxos fora do bloco editorial Seara Gourmet ou de overlays sobre fotos. |
| **2. Hierarquia & Tipografia** | Aplique `Lufga` com classes utilitárias ou classes semânticas explícitas (`.mr-section-title`), respeitando `@layer base`. | Não estilize seletores de tag nua (`h2 { color: #000; font-size: 24px }`) fora de escopo editorial, evitando colisão de cascata. |
| **3. Contraste & Acessibilidade** | Garanta contraste mínimo **WCAG AA (`>= 4.5:1` texto normal; `>= 3.0:1` texto grande/UI)** usando variantes escurecidas (`#B03D1F`, `#C73E00`) para texto pequeno e foco visível via `:focus-visible`. | Não use texto pequeno branco sobre `#FF5300`/`#FF5B0D`/`#FA6D01`, texto preto sobre `#A70030` (`2.69:1`), nem `outline: none` global em elementos focáveis. |
| **4. Fotografia & Proporção** | Preserve proporções consistentes (`16:9`, `3:2`, `4:3`) com `aspect-ratio` explícito, `object-fit: cover` e zoom sutil `scale(1.1)` em `0.3s`. | Não use alturas fixas rígidas sem controle de proporção nem remova o gradiente escuro quando houver texto branco sobre foto. |
| **5. Feedback Imediato** | Ofereça resposta síncrona e não bloqueante para cada ação (skeletons shimmer, toast WCAG AA, checkboxes de ingredientes, empty states acionáveis). | Não deixe botões sem handler (como `#float_cep-button` no site) nem renderize separadores órfãos (`•`) quando metadados estiverem vazios. |

### 1.3 Conflitos Reais do Legado no Site (NÃO Replicar no App)

A auditoria do bundle em produção revelou 4 falhas estruturais no site atual que devem ser **explicitamente descartadas** na arquitetura do aplicativo:

1. **Poluição de `:root` pelo sistema legado `--eko-*`:** O CSS do site carrega **524 custom properties**, das quais **459 pertencem ao Design System legado `--eko-*`** (paleta roxa `#7E40BF` / verde `#069336` / amarelo `#FFDF3F` e fonte `Inter` que sequer carrega — `status: "unloaded"`). Nenhum componente ativo da home do Minha Receita usa essa paleta roxa (exceto a barra de progresso `.hero-swiper .swiper-progress-fill` com `rgb(120, 50, 233)`, a pílula roxa `h1.text-white.text-sm` vista em `/todas-as-receitas/` e a classe utilitária `.text-[#7832E9]` presente no bundle `tailwind-output.css`). **Regra:** O aplicativo deve usar exclusivamente os tokens `--mr-*` definidos na Seção 8.
2. **Colisão de cascata em `<h2>`:** Uma regra global de tema define `h2 { font-size: 24px; font-weight: 500; color: rgb(0, 0, 0) }`, sobrescrevendo classes Tailwind como `.text-white`, `.text-sm`, `.font-bold` e `.text-[#CE5032]`. Isso causa:
   - Títulos de seção (`Churrasco`, `Matérias Minha Receita`) renderizados em preto `#000000` em vez de terracota `#CE5032`.
   - Rótulos das 9 pílulas de categoria na home renderizados em `24px` preto `#000000` (em vez de `14px` branco), quebrando em duas linhas e gerando contraste crítico `2.69:1` na pílula `CORDEIRO` (`#A70030`).
   - Título do card hero `"Pirarucu de Casaca"` em `/todas-as-receitas/` renderizado em preto `#000000` sobre fundo fotográfico escuro.
3. **Remoção global de anel de foco:** `style.css` declara `button:focus, input:focus, optgroup:focus, select:focus, textarea:focus { outline: none }` e `a:active, a:hover { outline: 0px }`, tornando a navegação por teclado invisível fora dos modais OneTrust e `.emr-button`.
4. **Recursos quebrados ou desconectados em `/minha-receita/`:**
   - **Newsletter (`#new-footer-newsletter`):** `footer.js` não é enfileirado nessa rota e o DOM usa `form.newsletter__form-content` enquanto `scripts.min.js` associa `jQuery Validate` a `.new-newsletter-form`, travando o formulário no Passo 1 sem validação nem avanço.
   - **Botão e Modal de CEP (`#float_cep-button` / `.modal-buy-product`):** Os `<template>` existem no DOM, mas há `0` regras CSS e `0` event listeners JS na rota `/minha-receita/`, deixando um ícone SVG cru de `28.5 × 30.5 px` órfão abaixo do rodapé.
   - **Separador `"•"` órfão em `/todas-as-receitas/`:** Cards sem rendimento e sem tempo de preparo renderizam um ponto central solitário `"•"`.

---

## 2. Design Tokens — Paleta de Cores

### 2.1 Tokens Ativos Observados vs. Tokens Legados Descartados

- **Observados ativos no tema (`:root` Seara):** `--laranja: #ff5300`, `--laranja-seara: #ff6720`, `--laranja-escuro: #fa4616`, `--amarelo-claro: #fdda25`, `--amarelo-escuro: #ff8f1c`, `--dourado: #e0bb6e`, mais `--gradient-seara-gourmet-*` e 3 ícones SVG em `data:image/svg+xml`.
- **Observados ativos no DOM/Tailwind sem custom property:** `#FF5B0D` (fundo `#header`), `#CE5032` (terracota editorial), `#B03D1F` / `#B84528` (hover terracota), `#E55A1A` (hover laranja), `#FA6D01` (`a.category-badge` na receita interna), `#FAF5F3` (superfície creme de dropdown/autocomplete/drawer), `#666666`, `#6B7280`, `#3F3E3D`, `#503C3C`, `#575757`, `#8E8E8E`, `#E12D2D`, `#FFCAC9`, `#F03838`, `#8A1F1B`, `#F3F4F6`, `#E5E7EB`, `#F6E4DC`.
- **Descartados (`--eko-*`):** 459 tokens legados (`--eko-color-purple-*`, `--eko-color-green-*`, `--eko-color-gray-*`) não pertencem à identidade Seara Minha Receita e não devem ser importados.

### 2.2 Tabela Completa de Tokens de Cor (`--mr-*`)

> **Legenda de Status:** **Observado** = cor extraída do DOM/CSS real do site; **Recomendado (App)** = extensão/ajuste para completude semântica e conformidade WCAG AA (`>= 4.5:1` texto normal).

| Token CSS (`--mr-*`) | Origem / Status | Hex | RGB / RGBA | Uso Principal (Site / App) | Diagnóstico WCAG AA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--mr-brand-orange` | Observado (`--laranja`) | `#FF5300` | `rgb(255, 83, 0)` | Fundo busca `#emr-input-search`, card newsletter, `.footer__alert`, faixa superior footer, títulos footer, botões OneTrust banner | `#000` sobre `#FF5300` = **`6.49:1`** (PASSA AA). `#FFF` sobre `#FF5300` = **`3.24:1`** (PASSA apenas UI/texto grande `>= 18.67px` bold ou `>= 24px`; FALHA texto `14px`). |
| `--mr-header-bg` | Observado (`#header`) | `#FF5B0D` | `rgb(255, 91, 13)` | Fundo da barra de navegação fixa desktop (`72px`) e mobile (`68px`) | `#FFF` sobre `#FF5B0D` = **`3.11:1`** (FALHA AA texto `14px`; PASSA UI/grande). `#1F1F1F` sobre `#FF5B0D` = **`5.30:1`** (PASSA AA). |
| `--mr-brand-orange-bright` | Observado (`--laranja-seara`) | `#FF6720` | `rgb(255, 103, 32)` | Coração `.favorited`, link hover em categorias, `.top-menu` do drawer mobile, botão `Fazer Login` modal | `#FFF` sobre `#FF6720` = **`2.91:1`** (FALHA AA e UI). `#FF6720` sobre `#FFF` = **`2.91:1`** (FALHA). Usar apenas em ícones/acentos com suporte ou substituir por `--mr-terracotta-hover`. |
| `--mr-brand-orange-hover` | Observado (`hover:bg-[#e55a1a]`) | `#E55A1A` | `rgb(229, 90, 26)` | Hover de botões `#FF6720` e `.emr-favorite-modal-close` | Melhor que `#FF6720`, mas ainda abaixo de `4.5:1` com branco. |
| `--mr-brand-orange-deep` | Observado (`--laranja-escuro` / `#E54B00`) | `#FA4616` | `rgb(250, 70, 22)` | Variação profunda Seara (`#E54B00` no `.main-menu-nav` mobile dá `3.93:1` com branco) | `#FFF` sobre `#FA4616` = **`3.53:1`** (PASSA apenas grande/UI). |
| `--mr-brand-orange-aa` | Recomendado (App) | `#C73E00` | `rgb(199, 62, 0)` | Fundo laranja acessível para botões/nav/badges com texto pequeno `#FFFFFF` (`12px–16px`) | `#FFF` sobre `#C73E00` = **`5.10:1`** (PASSA AA normal); `#C73E00` sobre `#FFF` = **`5.10:1`**. |
| `--mr-terracotta` | Observado (`#CE5032`) | `#CE5032` | `rgb(206, 80, 50)` | H1 principal (`36px`), CTAs pill (`TODAS AS RECEITAS`), paginação ativa, setas marcas, badges de categoria nos cards | `#FFF` sobre `#CE5032` = **`4.36:1`** e `#CE5032` sobre `#FFF` = **`4.36:1`** (PASSA texto grande `>= 18.67px` bold / H1 `36px`; FALHA texto normal `12px–14px` por `0.14`). |
| `--mr-terracotta-hover` | Observado (`#B03D1F`) | `#B03D1F` | `rgb(176, 61, 31)` | Hover dos botões CTA `#CE5032`; recomendado no app como cor padrão de badges `12px` e texto pequeno terracota | `#FFF` sobre `#B03D1F` = **`5.94:1`** (PASSA AA). `#B03D1F` sobre `#FFF` = **`5.94:1`** e sobre `#FAF5F3` = **`5.50:1`** (PASSA AA). |
| `--mr-terracotta-active` | Recomendado (App) | `#963218` | `rgb(150, 50, 24)` | Estado `:active` de botões CTA terracota | `#FFF` sobre `#963218` = **`7.59:1`** (PASSA AAA). |
| `--mr-terracotta-hover-alt` *(fora de `tokens.css`)* | Observado — Diagnóstico (`#B84528` / `#B8441E`) | `#B84528` | `rgb(184, 69, 40)` | Alternativa hover no bundle e setas marcas (`#B8441E`); padronizada no app em `--mr-terracotta-hover` | `#FFF` sobre `#B84528` = **`5.36:1`** (PASSA AA). |
| `--mr-recipe-badge-orange` *(fora de `tokens.css`)* | Observado — Diagnóstico (`a.category-badge`) | `#FA6D01` | `rgb(250, 109, 1)` | Pílula da categoria acima do `H1` na página interna de receita (`14px`) | `#FFF` sobre `#FA6D01` = **`2.90:1`** (FALHA crítico). No app, substituir por `--mr-cat-*-aa` ou `--mr-terracotta-hover` (`#B03D1F`). |
| `--mr-amber-btn` | Observado (`.emr-button`) | `#D97706` | `rgb(217, 119, 6)` | Botão utilitário `.emr-button` do plugin EMR (hover `#B45309`, ring `#F59E0B`) | `#FFF` sobre `#D97706` = **`3.19:1`** (FALHA texto normal); hover `#B45309` = **`5.02:1`** (PASSA AA). |
| `--mr-amber-btn-hover` | Observado (`.emr-button:hover`) | `#B45309` | `rgb(180, 83, 9)` | Estado `:hover` de `.emr-button` | `#FFF` sobre `#B45309` = **`5.02:1`** (PASSA AA). |
| `--mr-yellow-light` | Observado (`--amarelo-claro`) | `#FDDA25` | `rgb(253, 218, 37)` | Raios do sol Seara, título newsletter, destaque gráfico | `#000` sobre `#FDDA25` = **`15.23:1`** (PASSA AAA). Nunca usar texto branco. |
| `--mr-yellow-dark` | Observado (`--amarelo-escuro`) | `#FF8F1C` | `rgb(255, 143, 28)` | Barra de progresso ativa do Hero e acentos solares | `#000` sobre `#FF8F1C` = **`9.20:1`** (PASSA AAA). |
| `--mr-gold-gourmet` | Observado (`--dourado`) | `#E0BB6E` | `rgb(224, 187, 110)` | Detalhes e variante editorial Seara Gourmet (`#252525` fundo) | `#E0BB6E` sobre `#252525` = **`8.40:1`** (PASSA AAA). |
| `--mr-surface-default` | Observado (`.bg-white`) | `#FFFFFF` | `rgb(255, 255, 255)` | Fundo da página, cards, botões newsletter, modal, rodapé inferior | Superfície base (`21.00:1` com `#000`). |
| `--mr-surface-cream` | Observado (`rgb(250,245,243)`) | `#FAF5F3` | `rgb(250, 245, 243)` | Fundo do dropdown `Categorias`, autocomplete `.results-list` / `.results-error`, drawer mobile | `#3F3E3D` sobre `#FAF5F3` = **`9.87:1`**; `#503C3C` = **`9.46:1`**; `#575757` = **`6.68:1`** (PASSA AA/AAA). |
| `--mr-surface-subtle` | Observado (`.emr-button-secondary:hover`) | `#F9FAFB` | `rgb(249, 250, 251)` | Hover de botão secundário e superfície leve alternativa | `#374151` sobre `#F9FAFB` = **`9.86:1`** (PASSA AAA). |
| `--mr-surface-muted` | Observado / Recomendado | `#F3F4F6` | `rgb(243, 244, 246)` | Base de Skeletons (`--mr-skeleton-base`) e superfícies neutras desabilitadas | `#1F1F1F` sobre `#F3F4F6` = **`14.98:1`**. |
| `--mr-surface-dark-gourmet` | Observado (`.footer__alert` Gourmet) | `#252525` | `rgb(37, 37, 37)` | Variante Seara Gourmet para footer alert e superfícies premium (`#1F1F1F` hover) | `#FFFFFF` sobre `#252525` = **`15.33:1`** (PASSA AAA). |
| `--mr-text-strong` | Observado (`#000000`) | `#000000` | `rgb(0, 0, 0)` | Texto base `html`/`body` no site, links do rodapé, botões sociais | **`21.00:1`** sobre `#FFFFFF` (PASSA AAA). |
| `--mr-text-primary` | Observado / Recomendado | `#1F1F1F` | `rgb(31, 31, 31)` | Texto principal editorial recomendado no app (títulos em fundo claro, modais, empty states) | **`16.48:1`** sobre `#FFFFFF`; **`15.24:1`** sobre `#FAF5F3` (PASSA AAA). |
| `--mr-text-heading-modal` | Observado (`#333333`) | `#333333` | `rgb(51, 51, 51)` | Títulos de modais (`.emr-favorite-modal-title`) | **`12.63:1`** sobre `#FFFFFF` (PASSA AAA). |
| `--mr-text-control` | Observado (`.emr-button-secondary`) | `#374151` | `rgb(55, 65, 81)` | Texto de botões secundários e labels de formulários no app | **`10.31:1`** sobre `#FFFFFF`; **`9.86:1`** sobre `#F9FAFB` (PASSA AAA). |
| `--mr-text-dropdown` | Observado (`.nav-links a`) | `#3F3E3D` | `rgb(63, 62, 61)` | Links do menu `Categorias` (`#575757` no autocomplete) | **`9.87:1`** sobre `#FAF5F3`; **`10.67:1`** sobre `#FFFFFF` (PASSA AAA). |
| `--mr-text-drawer` | Observado (`#header-mobile-menu`) | `#503C3C` | `rgb(80, 60, 60)` | Itens de categorias no drawer mobile | **`9.46:1`** sobre `#FAF5F3` (PASSA AAA). |
| `--mr-text-secondary` | Observado (`#666666`) | `#666666` | `rgb(102, 102, 102)` | Títulos `h3.recipe-title`, `p.materia-title`, ingredientes, modo de preparo, mensagem modal | **`5.74:1`** sobre `#FFFFFF` (PASSA AA normal). |
| `--mr-text-muted` | Observado (`.text-gray-500`) | `#6B7280` | `rgb(107, 114, 128)` | Metadados dos cards (`3 a 4 • 50 min`, datas), `"Compartilhe:"`, `Cancelar` modal e placeholder AA no app | **`4.83:1`** sobre `#FFFFFF` (PASSA AA normal); como fundo de botão branco = **`4.83:1`**. |
| `--mr-text-placeholder` *(fora de `tokens.css`)* | Observado — Diagnóstico (inputs newsletter) | `#8E8E8E` | `rgb(142, 142, 142)` | Placeholder observado na newsletter (`16px`) | **`3.28:1`** sobre `#FFFFFF` (FALHA AA para texto informativo). No app, substituído por `--mr-text-muted` (`#6B7280`). |
| `--mr-text-inverse` | Observado (`#FFFFFF`) | `#FFFFFF` | `rgb(255, 255, 255)` | Texto em header, Hero, cards destaque, botões CTA, newsletter subtítulo, footer laranja | Depende do fundo (ver coluna de diagnóstico de cada superfície). |
| `--mr-text-inverse-soft` | Observado (`.text-white/90`) | `rgba(255, 255, 255, 0.9)` | `rgba(255, 255, 255, 0.9)` | Descrição do slide no Hero sobre gradiente escuro | PASSA AA sobre overlay `rgba(0,0,0,0.6–0.8)`. |
| `--mr-border-subtle` | Observado (`.border-gray-100`) | `#F3F4F6` | `rgb(243, 244, 246)` | Divisor `.recipe-meta` nos cards padrão | Uso estrutural/decorativo. |
| `--mr-border-default` | Observado (Tailwind reset) | `#E5E7EB` | `rgb(229, 231, 235)` | Borda padrão de inputs, divisores horizontais e cards neutros | Uso estrutural. |
| `--mr-border-strong` | Recomendado (App) | `#9CA3AF` | `rgb(156, 163, 175)` | Borda no estado `:hover` de inputs e controles de formulário | Uso estrutural/UI. |
| `--mr-border-warm` | Observado (drawer mobile) | `#FAA96B` | `rgb(250, 169, 107)` | Divisor `1px solid` entre categorias no drawer mobile `#header-mobile-menu` | Uso estrutural em superfícies `#FAF5F3`. |
| `--mr-scrollbar-thumb` | Observado (autocomplete) | `#FFBFA1` | `rgb(255, 191, 161)` | Thumb (`8px`) da barra de rolagem do autocomplete e menus `#FAF5F3` | Uso decorativo. |
| `--mr-heart-outline-fill` | Observado (SVG favoritar) | `#F6E4DC` | `rgb(246, 228, 220)` | Preenchimento interno suave do contorno do ícone coração antes de favoritar | Apenas decorativo dentro do SVG com borda/traço escuro `#000`/`#333` ou sobre círculo `#FFF`. |
| `--mr-success-bg` | Recomendado (App) | `#EDF9F1` | `rgb(237, 249, 241)` | Fundo de `toast.success` e alerts de sucesso | Par com `--mr-success-text` (`#134E2E`) = **`9.00:1`** (PASSA AAA). |
| `--mr-success-border` | Recomendado (App) | `#2E8555` | `rgb(46, 133, 85)` | Borda e ícone de `toast.success` e estado válido de formulário | `#2E8555` sobre `#EDF9F1` = **`4.22:1`** (PASSA UI non-text `>= 3.0:1`). |
| `--mr-success-text` | Recomendado (App) | `#134E2E` | `rgb(19, 78, 46)` | Texto principal de feedbacks positivos | **`9.00:1`** sobre `#EDF9F1` (PASSA AAA). |
| `--mr-error-bg` | Recomendado (App) | `#FEF1F1` | `rgb(254, 241, 241)` | Fundo de `toast.error` e banner inline de erro de formulário | Par com `--mr-error-text` (`#8A1F1B`) = **`8.32:1`** (PASSA AAA). |
| `--mr-error-border` | Recomendado (App) | `#D92D20` | `rgb(217, 45, 32)` | Borda e ícone de `toast.error` e borda de input inválido | **`4.39:1`** sobre `#FEF1F1` (PASSA UI `>= 3.0:1`). |
| `--mr-error-brand-red` | Observado (`footer.css` `.has-error`) | `#E12D2D` | `rgb(225, 45, 45)` | Labels e ícones SVG em erro na newsletter (`footer.css`) | `#E12D2D` sobre `#FFFFFF` = **`4.55:1`** (PASSA AA normal). |
| `--mr-error-surface-legacy` *(fora de `tokens.css`)* | Observado — Diagnóstico (`.form-group.error`) | `#FFCAC9` | `rgb(255, 202, 201)` | Fundo de container checkbox em erro (`style.css` com borda `#F03838`); substituído por `--mr-error-bg` no app | Par com `#8A1F1B` = **`6.34:1`** (PASSA AA). |
| `--mr-error-text` | Observado (`style.css` error span) | `#8A1F1B` | `rgb(138, 31, 27)` | Texto de erro em checkboxes (`style.css`), inputs inválidos e `toast.error` | **`8.32:1`** sobre `#FEF1F1`; **`6.34:1`** sobre `#FFCAC9` (PASSA AA/AAA). |
| `--mr-warning-bg` | Recomendado (App) | `#FFF8EB` | `rgb(255, 248, 235)` | Fundo de `toast.warning` e alertas de atenção | Par com `--mr-warning-text` (`#78350F`) = **`8.59:1`** (PASSA AAA). |
| `--mr-warning-border` | Observado / Recomendado | `#D97706` | `rgb(217, 119, 6)` | Borda de `toast.warning` e acento âmbar | `#D97706` sobre `#FFF8EB` = **`3.02:1`** (PASSA UI `>= 3.0:1`). |
| `--mr-warning-icon` | Recomendado (App) | `#B45309` | `rgb(180, 83, 9)` | Ícone de `toast.warning` | **`4.75:1`** sobre `#FFF8EB` (PASSA AA normal e UI). |
| `--mr-warning-text` | Recomendado (App) | `#78350F` | `rgb(120, 53, 15)` | Texto principal de `toast.warning` | **`8.59:1`** sobre `#FFF8EB` (PASSA AAA). |
| `--mr-info-bg` | Recomendado (App) | `#FAF5F3` | `rgb(250, 245, 243)` | Fundo de `toast.info` (creme oficial Seara) | Par com `--mr-info-text` (`#3F3E3D`) = **`9.87:1`** (PASSA AAA). |
| `--mr-info-border` | Recomendado (App) | `#CE5032` | `rgb(206, 80, 50)` | Borda e ícone de `toast.info` | `#CE5032` sobre `#FAF5F3` = **`4.03:1`** (PASSA UI `>= 3.0:1`). |
| `--mr-info-text` | Recomendado (App) | `#3F3E3D` | `rgb(63, 62, 61)` | Texto principal de `toast.info` | **`9.87:1`** sobre `#FAF5F3` (PASSA AAA). |

> **Escopo de exportação para `tokens.css` (Seção 8.2):** Os 4 identificadores marcados como `*(fora de tokens.css)*` (`--mr-terracotta-hover-alt`, `--mr-recipe-badge-orange`, `--mr-text-placeholder`, `--mr-error-surface-legacy`) documentam comportamentos de diagnóstico do site atual e são omitidos intencionalmente do `:root` de produção para evitar propagação de cores com baixo contraste ou redundantes.
>
> **Nota sobre cores de terceiros observadas (não converter em tokens do app):**  
> - **OneTrust LGPD:** texto `#696969` (`5.49:1` no branco), links/filtro `#3860BE` (`5.86:1`), botões do modal `#346E4A` (`6.04:1` com branco), botão fechar `#555555` (`7.46:1`), switch inativo `#767676` com borda `#DDDDDD`, sombra modal `#999999`.  
> - **Audima:** botão `#accessibility-menu` em `#D0D0D7` com ícone `#000000` e anel `#FFFFFF`.  
> - **Roxo residual (`#7832E9` / `rgb(120, 50, 233)`):** presente na regra `.hero-swiper .swiper-progress-fill` e como utilitário `.text-[#7832E9]` em `tailwind-output.css` (enquanto a pílula roxa `"Todas as Receitas"` em `/todas-as-receitas/` usa `h1.text-white.text-sm`).

---

### 2.3 Cores Temáticas das 9 Categorias de Receitas

No site atual, devido à regra global `h2 { color: #000000; font-size: 24px }`, os rótulos das 9 pílulas de categoria são renderizados em preto (`#000000`), embora as classes HTML declarem `.text-white.text-sm`. Abaixo estão as cores reais e as versões recomendadas para o aplicativo com texto `#FFFFFF` em **WCAG AA (`>= 4.5:1`)**:

| Categoria | Token Base Observado | Hex Observado | RGB Observado | Contraste Atual (`#000` sobre Hex) | Contraste com `#FFF` (no Hex Original) | Token Seguro AA (`--mr-cat-*-aa`) para Texto `#FFF` (`>= 4.5:1`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Aves** | `--mr-cat-aves` | `#F35935` | `rgb(243, 89, 53)` | `6.29:1` (PASSA) | `3.34:1` (FALHA normal) | **`#C83E1D`** (`5.04:1` com `#FFF`) |
| **Peixes e Frutos do Mar** | `--mr-cat-peixes` | `#2C7AA8` | `rgb(44, 122, 168)` | `4.46:1` (FALHA `14px`) | **`4.71:1`** (PASSA) | **`#2C7AA8`** (manter original com texto `#FFF`) |
| **Carne Suína** | `--mr-cat-suina` | `#E72667` | `rgb(231, 38, 103)` | `4.87:1` (PASSA) | `4.31:1` (FALHA normal) | **`#B8144C`** (`6.48:1` com `#FFF`) |
| **Bovinos** | `--mr-cat-bovinos` | `#E82A2C` | `rgb(232, 42, 44)` | `4.80:1` (PASSA) | `4.38:1` (FALHA normal) | **`#C41C1E`** (`5.95:1` com `#FFF`) |
| **Cordeiro** | `--mr-cat-cordeiro` | `#A70030` | `rgb(167, 0, 48)` | **`2.69:1`** (FALHA crítico) | **`7.82:1`** (PASSA) | **`#A70030`** (manter original com texto `#FFF`) |
| **Frios e Embutidos** | `--mr-cat-frios` | `#CE6933` | `rgb(206, 105, 51)` | `5.69:1` (PASSA) | `3.69:1` (FALHA normal) | **`#A84F1E`** (`5.52:1` com `#FFF`) |
| **100% Vegetal** | `--mr-cat-vegetal` | `#A0B340` | `rgb(160, 179, 64)` | `9.02:1` (PASSA) | `2.33:1` (FALHA crítico) | **`#5C6E18`** (`5.68:1` com `#FFF`; ou manter `#A0B340` **somente** com texto `#1F1F1F`) |
| **Doces, Bolos e Sobremesas** | `--mr-cat-doces` | `#B352AF` | `rgb(179, 82, 175)` | `4.74:1` (PASSA) | `4.43:1` (FALHA normal) | **`#8E378B`** (`6.84:1` com `#FFF`) |
| **Pães e Massas** | `--mr-cat-paes` | `#946932` | `rgb(148, 105, 50)` | `4.33:1` (FALHA `14px`) | **`4.85:1`** (PASSA) | **`#946932`** (manter original com `#FFF`) ou **`#7D5726`** (`6.44:1`) |

**Regra de Contraste Seguro para Categorias no App:**
- **Padrão preferencial:** Texto `#FFFFFF` (`12px–14px`, `font-weight: 700`) sobre os tokens `--mr-cat-*-aa` (todos garantem `>= 4.71:1`).
- **Se optar pelas cores originais exatas** em `Aves`, `Suína`, `Bovinos`, `Frios`, `100% Vegetal` e `Doces`, **nunca use texto branco sobre elas**: utilize texto escuro `#1F1F1F` ou `#000000` (e obrigatoriamente `#FFFFFF` sobre `Peixes`, `Cordeiro` e `Pães e Massas`). Nunca misture texto `#000000` sobre `#A70030`.

---

### 2.4 Gradientes e Overlays

| Token CSS (`--mr-overlay-*` / `--mr-gradient-*`) | Valor CSS Completo Observado | Onde é Aplicado | Diretriz para o Aplicativo |
| :--- | :--- | :--- | :--- |
| `--mr-overlay-hero` | `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))` | Camada sobre fotografia do Hero Home (`700px` desktop / `500px` mobile) | Obrigatório sempre que houver texto `#FFFFFF` ou `rgba(255,255,255,0.9)` sobre foto full-bleed. |
| `--mr-overlay-card` | `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%)` | Overlay inferior de cards destaque (`.featured-card .recipe-content`, `.featured-materia .materia-content`) | Mantém topo da foto luminoso/limpo e garante leitura do título branco nos 40% inferiores. |
| `--mr-overlay-newsletter` | `linear-gradient(to top, rgba(190, 72, 16, 0.29), rgba(190, 72, 16, 0.29))` | Tinge a foto de fundo de `section#new-footer-newsletter` | Camada de atmosfera quente (`#BE4810` a 29%) atrás do card central `#FF5300`. |
| `--mr-overlay-cta-warm` | `linear-gradient(rgba(80, 60, 60, 0), rgba(80, 60, 60, 0.6))` | `.image-text-cta--container::after` (`style.css`) | Alternativa editorial marrom-quente sobre banners com CTA. |
| `--mr-overlay-modal-backdrop` | `rgba(0, 0, 0, 0.5)` | `#emr-favorite-modal`, `.header-search-overlay.active`, `.onetrust-pc-dark-filter` | Backdrop único padronizado para modais, drawers parciais e busca (sem `backdrop-filter`). |
| `--mr-gradient-search-banner` | `radial-gradient(circle, rgb(254, 147, 0), rgb(241, 64, 0))` | `#banner.search-banner` em busca global `/?s=...` | Mantido como fundo editorial de banners de busca/empty state institucional. |
| `--mr-gradient-hero-progress` | **Observado:** `linear-gradient(90deg, rgb(120, 50, 233), rgb(206, 80, 50))`<br>**App (`tokens.css`):** `linear-gradient(90deg, #ff8f1c, #ce5032)` | `.hero-swiper .swiper-progress-fill` | No app, substitui `#7832E9` (resquício EKO) por `#FF8F1C -> #CE5032` para coerência 100% Seara. |
| `--mr-gradient-salsicha-bg` *(fora de `tokens.css`)* | `linear-gradient(rgb(247, 224, 211), rgb(250, 245, 243))` | `.home-salsicha` wrapper/newsletter (tema específico do tema Seara) | Referência sazonal fora do `tokens.css` base do app. |
| `--mr-gradient-gourmet-border` *(fora de `tokens.css`)* | `linear-gradient(#2b2b2b, #2b2b2b) padding-box, linear-gradient(90deg, #ffd277, #77530a, #ffd277) border-box` | Bordas da linha premium Seara Gourmet | Aplicar apenas em contextos explícitos da linha **Seara Gourmet**. |
| `--mr-gradient-gourmet-text` *(fora de `tokens.css`)* | `linear-gradient(90deg, rgb(255, 210, 119) 6.73%, rgb(229, 198, 130) 22.6%, rgb(228, 182, 94) 38.46%, rgb(241, 210, 134) 55%, rgb(237, 205, 139) 68.27%, rgb(255, 210, 119) 83.17%, rgb(224, 187, 110) 99%)` | Títulos e destaques da linha Seara Gourmet (`footer.css`) | Sempre sobre fundo escuro `#252525` ou `#2B2B2B` (`background-clip: text`); fora do `tokens.css` base. |

---

## 3. Tipografia & Fontes

### 3.1 Família Tipográfica e Carregamento

- **Família principal obrigatória:** `'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Evidência real de carregamento (`document.fonts`):**
  - No site em produção, `@font-face` declara 16 variações de `Lufga` em `.ttf` (`font-display: swap`, pesos `200` a `900`, `normal` e `italic`).
  - As únicas faces efetivamente carregadas (`status: "loaded"`) são **`Lufga` pesos `300` (Light), `400` (Regular), `500` (Medium), `600` (SemiBold) e `700` (Bold)** em estilo `normal`.
  - **Otimização recomendada para o app:** Carregar em `.woff2` (com fallback `.ttf`) apenas os **5 pesos realmente utilizados (`300`, `400`, `500`, `600`, `700`)** com `font-display: swap`. **Não importar** `Inter`, `Hero New`, `Figtree` ou `Catamaran` (todas constam como `unloaded` no site e provêm do legado `--eko-*` ou widgets externos).
- **Reset de `body` no app:** No site, `body` herda `font-weight: 700` do tema (`html` tem `400`), forçando componentes sem peso explícito a ficarem em negrito. No aplicativo, defina **`body { font-weight: 400; font-size: 16px; line-height: 24px; color: var(--mr-text-primary); }`**.

### 3.2 Escala Tipográfica Completa (Desktop e Mobile)

| Token (`--mr-text-*`) | Elemento / Contexto | Desktop (`>= 768px` / `1024px`) | Mobile (`390px`) | `font-weight` | `letter-spacing` | `text-transform` | Cor Recomendada (App) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display-h1`** | H1 principal da Home (`h1.title-h1`) | `36px / 40px` (`2.25rem / 2.5rem`) | `28px / 34px` *(rec. app)* | `700` | `normal` | `none` | `#CE5032` (`--mr-terracotta`) |
| **`hero-title`** | Headline Hero Home & H1 Receita Interna | `30px / 36px` (`1.875rem / 2.25rem`) | `24px / 30px` (`text-2xl` no Hero) | `600` (Hero) / `700` (Receita) | `normal` | `none` | `#FFFFFF` (`--mr-text-inverse`) |
| **`recipe-section-h2`** | H2 de Seções Home (`Churrasco`, `Matérias`), H1 Categoria (`/receitas-e-materias/.../`), Título Card Destaque, `Receitas relacionadas` | `24px / 32px` (`1.5rem / 2rem`) | `22px / 28px` *(rec. app — seção)* / `24px / 32px` *(card destaque `.text-2xl`)* | `700` *(site `h2` cai em `500` por cascata)* | `normal` | `none` | `#CE5032` (seção) / `#FFFFFF` (card destaque sobre gradiente) |
| **`editorial-h2`** | H2 `"Ingredientes"` na página interna de receita | `28px / 32px` (`1.75rem / 2rem`) | `24px / 30px` *(rec. app)* | `500` | `normal` | `none` | `#666666` (ou `#1F1F1F` no app) |
| **`editorial-h3`** | H3 `"Modo de preparo"` na página interna de receita | `26px / 32px` (`1.625rem / 2rem`) | `22px / 28px` *(rec. app)* | `500` | `normal` | `none` | `#666666` (ou `#1F1F1F` no app) |
| **`newsletter-title`** | H2 `"Fique por dentro"` | `24px / 48px` (`1.5rem / 3rem`) | `24px / 36px` *(rec. app)* | `500` | `normal` | `none` | `#000000` (`6.49:1` sobre `#FF5300`) |
| **`newsletter-subtitle`** | Subtítulo da newsletter | `22px / 28px` (`1.375rem / 1.75rem`) | `18px / 24px` *(rec. app)* | `500` | `normal` | `none` | `#FFFFFF` *(usar `18px` bold/semibold ou `#1F1F1F` se menor)* |
| **`hero-desc`** | Parágrafo descritivo do Hero | `18px / 28px` (`1.125rem / 1.75rem`) | `16px / 24px` (`text-base`) | `400` | `normal` | `none` | `rgba(255, 255, 255, 0.9)` |
| **`card-title`** | Títulos de cards padrão (`h3.recipe-title`, `p.materia-title`) | `18px / 28px` (`1.125rem / 1.75rem`) | `18px / 28px` (`text-lg`) | `700` | `normal` | `none` | `#666666` (`5.74:1`) ou `#1F1F1F` |
| **`rating-legend`** | Legenda avaliação `.kksr-legend` (`5/5 - (1 voto)`) | `19.2px / 28.8px` (`1.2rem`) | `16px / 24px` *(rec. app)* | `700` | `normal` | `none` | `#000000` |
| **`body-md`** | Corpo de texto, ingredientes `<li>`, modo de preparo `<ol>`, paginação `.page-numbers`, botões newsletter/modal, inputs newsletter | `16px / 24px` (`1rem / 1.5rem`) | `16px / 24px` | `400` (texto) / `600–700` (botões) | `normal` | `none` | `#666666` (receita) / `#1F1F1F` (app geral) |
| **`nav-ui`** | Links header desktop, input de busca, dropdown `Categorias`, botão CTA pill, drawer itens mobile, títulos/links rodapé | `14px / 20–21px` (`0.875rem`) | `14px / 20px` *(observado: drawer `14px` `700`; sub-barra `12px` `600`)* | `600` (nav/busca) / `700` (CTA/drawer) / `400` (footer links) | `normal` | `none` / `uppercase` (CTAs) | `#FFFFFF` (CTA `#B03D1F`/`#CE5032`), `#3F3E3D` (dropdown), `#503C3C` (drawer) |
| **`badge-meta`** | Badges de categoria nos cards, pílula `RECEITA` do Hero, metadados `.recipe-meta` (`3 a 4 • 50 min`) | `12px / 16px` (`0.75rem / 1rem`) | `12px / 16px` (`text-xs`) | `700` (badges/meta) / `400` (Hero badge) | `0.3px` (`0.025em` em `.receitas-categoria`) | `uppercase` (badges) / `none` (meta) | `#B03D1F` (badge AA sobre `#FFF`, substitui `#CE5032` `4.36:1`) / `#6B7280` (meta `4.83:1`) |
| **`pill-category`** | Pílulas das 9 categorias na Home (`AVES`, `CORDEIRO`, etc.) | **Observado:** `24px / 20px` `500` `#000` *(bug cascata)*<br>**App (Corrigido):** `14px / 18px` | `12px / 16px` *(rec. app)* | `700` | `0.025em` (`0.35px`) | `uppercase` | `#FFFFFF` sobre `--mr-cat-*-aa` (`>= 4.71:1`) |

### 3.3 Diretrizes para Evitar a Colisão de Cascata `h2`

1. **Isolar resets em `@layer base`:** Qualquer estilo padrão para `h1`–`h6` deve viver dentro de `@layer base` (ou módulo CSS anterior às utilidades) para que classes como `.text-white`, `.text-sm` ou `.text-[#CE5032]` nunca sejam sobrescritas.
2. **Não acoplar estilo visual à tag semântica:** Em componentes reutilizáveis (pílulas de categoria, cards destaque, títulos de seção), aplique classes dedicadas (`.mr-section-title`, `.mr-category-pill__label`, `.mr-card-featured__title`) definindo explicitamente `font-size`, `font-weight`, `line-height` e `color`.
3. **Escopo restrito para texto longo:** Se houver estilização automática de `h2`/`h3` para artigos ou matérias importadas via CMS, confine-a estritamente à classe wrapper `.mr-prose h2` / `.mr-article-content h2`.

---

## 4. Espaçamento, Grid, Layout & Responsividade

### 4.1 Escala Base de Espaçamento (4px / 8px)

Baseada nos espaçamentos reais extraídos do Tailwind e das folhas de estilo da Seara (`4px` nas pílulas, `8px` em gaps compactos, `12px` em botões/divisores, `16px` em grids/cards, `20px` no Hero, `24px` em grids de subpáginas/alertas, `28px` no footer social, `32px` em seções/rodapé, `48px` em CTAs e margens de receita):

| Token | Valor | Rem | Usos Observados e Recomendados |
| :--- | :--- | :--- | :--- |
| `--mr-space-1` | `4px` | `0.25rem` | Padding interno de pílulas (`p-1`), micro espaçamento |
| `--mr-space-2` | `8px` | `0.5rem` | `gap-2`, `mb-2`, `px-2`, `py-2`, padding horizontal de busca/botões pill vertical, gap entre botões de paginação |
| `--mr-space-3` | `12px` | `0.75rem` | `pt-3` em `.recipe-meta`, `py-3` em botões newsletter, `margin: 12px 8px` em bullets do Hero |
| `--mr-space-4` | `16px` | `1rem` | `gap-4` nos grids Home, `p-4` nos cards destaque, padding lateral do header (`px-4`), `margin` de `.footer__alert-text` |
| `--mr-space-5` | `20px` | `1.25rem` | `gap` da paginação do Hero (`20px`), padding horizontal de botões modais (`10px 20px`) e `.category-badge` (`12px 20px`) |
| `--mr-space-6` | `24px` | `1.5rem` | `gap` de `.receitas-grid` em subpáginas (`24px`), `mb-6` em cabeçalhos de seção, `gap` de `.footer__alert`, posição de toasts desktop |
| `--mr-space-7` | `28px` | `1.75rem` | Padding vertical e `row-gap` de `.footer__social-nav` (`28px 16px`) |
| `--mr-space-8` | `32px` | `2rem` | `mb-8` entre blocos, `row-gap` em `.footer__nav`, padding horizontal de `.results-error` |
| `--mr-space-12` | `48px` | `3rem` | `mt-12` acima de `TODAS AS RECEITAS`, `padding-right` em `.modo-preparo`, `gap-y` em listagens mobile |
| `--mr-space-16` | `64px` | `4rem` | Margem inferior de seções em subpáginas (`.receitas-categoria.mb-16`) e coluna-gap aproximado do footer (`60.96px` / `3.81rem`) |

### 4.2 Containers (`max-width`)

| Contexto / Classe | Valor Observado | Largura Útil (`1920px`) | Token Padronizado (App) |
| :--- | :--- | :--- | :--- |
| **Header Topbar** (`header .wrap`) | `1478px` (`padding: 0 16px`) | `1478px` | `--mr-container-header: 1478px` |
| **Wrap Global Seara** (`.wrap`) | `1440px` | — | `--mr-container-wrap: 1440px` |
| **Wide EMR** (`.emr-container2` / `.max-w-7xl`) | `1280px` (`80rem`) | — | `--mr-container-wide: 1280px` |
| **Footer** (`.footer__social-nav`, `.footer__second-row`) | `1200px` (`75rem`) | `1200px` | `--mr-container-footer: 1200px` |
| **Hero Conteúdo Interno** (`.max-w-6xl`) | `1152px` (`72rem`) | `1152px` | `--mr-container-hero: 1152px` |
| **Conteúdo Principal** (`.emr-container` / `.max-w-5xl`) | `1024px` (`64rem`) | **`928px`** (com `48px` padding lateral) | `--mr-container-content: 1024px` |
| **Bloco Editorial Restrito** (`.max-w-2xl`) | `672px` (`42rem`) | — | `--mr-container-prose: 672px` |
| **Card Newsletter** (`.newsletter__container`) | `640px` (`40rem`) | `640px` (interno form `480px`) | `--mr-container-newsletter: 640px` |
| **Modal Preferências / Padrão** | `575px` (OneTrust) / `400px` (Favoritos) | `575px` / `400px` | `--mr-modal-sm: 400px` / `--mr-modal-md: 575px` |

### 4.3 Sistemas de Grid e Seções

1. **Grid de Receitas na Home (`.featured-row`):**
   - `grid-template-columns: 1fr` (mobile) → `repeat(2, 1fr)` (`md: 768px`) → `repeat(3, 1fr)` (`lg: 1024px`), `gap: 16px`, `margin-bottom: 32px`.
   - Em `1920px` (`928px` úteis): 3 colunas de `298.66px`. Linha 1 (`389px` altura) traz 1 card destaque (`.featured-card.md:col-span-2`, `613.33px`) + 1 card padrão (`298.66px`). Linha 2 (`417px` altura) traz 3 cards padrão (`298.66px`).
2. **Grid de Receitas em Subpáginas (`.receitas-grid`):**
   - 3 colunas em desktop (`293.33px` cada em `928px`, `gap: 24px`); em mobile (`390px`), empilha em 1 coluna (`358px`, `gap: 48px 24px`).
3. **Grid de Matérias (`.materias-grid`):**
   - `grid-template-columns: 1fr` → `repeat(2, 1fr)` → `repeat(4, 1fr)`, `gap: 16px`, `margin-bottom: 32px`.
   - Em `1920px` (`928px` úteis): 4 colunas de `220px`. Linha 1: 1 card destaque (`.featured-materia.md:col-span-2`, `456 × 352 px`) + 2 cards padrão (`220px`). Linha 2: 4 cards padrão (`220 × 316 px`).
4. **Grid de Categorias em Destaque (Home):**
   - Desktop: 3 colunas × 3 linhas (9 categorias). Cada item mede `293.33 × 60 px` com pílula de `80%` de largura (`234.66px`) sobreposta na base (`margin-bottom: -16px`).
5. **Paginação Hero (`.hero-swiper .swiper-pagination-custom`):**
   - `grid-template-columns: repeat(3, 1fr)`, `gap: 20px`, bullets de `162.67 × 105 px`.
6. **Rodapé (`.footer`):**
   - Faixa superior (`.footer__social-nav`): `1200 × 160 px`, `padding: 28px 16px`, `row-gap: 28px`, exibindo 4 ícones sociais à esquerda, logo Seara central (`155 × 104 px`) e link `Trabalhe conosco` à direita.
   - Faixa inferior (`.footer__second-row`): `1200 × 340 px`, dividindo `.footer__alert` (`328 × 340 px`, fundo `#FF5300`) à esquerda e `.footer__nav` (`770 × 340 px`, 4 colunas em desktop `177.58px 114.63px 158.67px 155.73px`, `gap: 32px 60.96px`; base mobile `repeat(2, auto)`) à direita.

### 4.4 Todos os Breakpoints `@media` Reais & Comportamento Desktop vs. Mobile (`390px`)

- **Sistema Tailwind (`tailwind-output.css` — adotado como referência primária do app):**
  - `sm`: `(min-width: 640px)`
  - `md`: `(min-width: 768px)`
  - `lg`: `(min-width: 1024px)`
  - `xl`: `(min-width: 1280px)`
  - `2xl`: `(min-width: 1536px)`
- **Breakpoints reais adicionais presentes no tema Seara (`style.css`, `header-emr.css`, `footer.css`):**
  - `min-width`: `375px`, `400px`, `414px`, `768px` (`48rem`), `792px`, `992px` (`62rem`), `1060px`, `1080px`, `1200px`, `1440px`.
  - `max-width`: `315px`, `317px`, `320px`, `414px`, `480px`, `498px`, `659px`, `767px`, `768px`, `792px`, `980px`, `991px`, `992px`, `1023px`, `1024px`, `1026px`, `1059px`, `1200px`.
  - Ranges compostos: `(min-width: 320px) and (max-width: 374px)`, `(min-width: 375px) and (max-width: 419px)`, `(min-width: 992px) and (max-width: 1199px)`.
- **Breakpoints OneTrust (`#onetrust-style`):** `max-width: 425px / 476px / 530px / 600px / 896px`, `min-width: 425px..550px`, `426px..896px` (+ `orientation: landscape`), `min-width: 550px / 769px / 890px / 1024px / 1280px`, `897px..1023px`.
- **Media features:** `(hover: hover)` e `(hover: hover) and (prefers-reduced-motion)`.

**Diferenças Comportamentais Desktop (`1920px`) vs. Mobile (`390 × 844 px`):**

| Elemento | Desktop (`>= 1200px` / `1920px`) | Mobile (`390 × 844 px`, sem overflow horizontal) |
| :--- | :--- | :--- |
| **Header Altura & Logos** | `72px` altura; exibe Logo Minha Receita (`160 × 52.73px`) + Logo Seara. | `68px` altura (`#header-inner: 358px`); oculta `.emr-logo` Seara em `<= 768px` (`@media (max-width: 768px)`), mantendo Logo MR + `#header-hamburguer` (`26.89 × 68px`). |
| **Navegação Principal** | Links horizontais (`Categorias ∨`, `Receitas`, `Matérias`, `Livros de Receitas`) + dropdown hover (`300 × 500px`). | Menu colapsado no hambúrguer; abre drawer full-screen `#header-mobile-menu.active` (`390 × 844px`). |
| **Barra de Busca** | Inline `688.83 × 48px`, `border-radius: 8px`; autocomplete abre dropdown abaixo com overlay `rgba(0,0,0,0.5)`. | Pill compacta `123.45 × 48px` (`border-radius: 100px`, `margin: 0 8px`); ao clicar/focar em `< 1200px` expande para modal `100vw × 100vh` sobre fundo `#FAF5F3`. |
| **Hero Home** | `700px` altura (`aspect ~2.73:1`), headline `30px`, descrição `18px`, 3 barras de paginação lado a lado. | `500px` altura (`h-[500px]`), headline `24px`, descrição `16px`. |
| **Carrossel Marcas** | 5 logos visíveis simultaneamente; setas com `.swiper-button-lock { display: none }`. | 2 logos por slide; setas `.marcas-button-prev/next` (`32 × 32px`) e 4 bullets abaixo ficam visíveis e ativos. |
| **Grids de Receitas** | 3 colunas (`.featured-card` ocupa 2 colunas). | 1 coluna (`358px` largura, `gap: 48px 24px`); `.featured-card` mede `358 × 352 px`. |

---

## 5. Formas, Bordas, Raios, Sombras, Elevação, Z-index & Movimento

### 5.1 Escala de `border-radius` e Espessuras de Borda

| Token (App) | Valor Real | Onde foi Observado no Site / Uso Recomendado no App |
| :--- | :--- | :--- |
| `--mr-radius-none` | `0px` | `#header`, `#onetrust-banner-sdk`, `.footer__alert` (base) |
| `--mr-radius-2xs` | `2px` | Botões OneTrust (`2.5px` no container `#onetrust-pc-sdk`) |
| `--mr-radius-xs` | `4px` | Topo de `.results-list` (`4px 4px 19px 19px`), `--mr-skeleton` linhas de texto |
| `--mr-radius-sm` | `6px` | `.emr-button`, `.emr-button-secondary`, `.emr-favorite-modal-close` (`Cancelar`/`Fazer Login`) |
| `--mr-radius-md` | `8px` | Input de busca desktop (`#emr-input-search`), imagens e cards `.recipe-card`/`.materia-card`, `.recipe-content`, dropdown `Categorias` (`0 0 8px 8px`), `.emr-card` |
| `--mr-radius-lg` | `12px` | `.emr-favorite-modal-content`, Toasts padronizados do aplicativo |
| `--mr-radius-xl` | `16px` | Imagens das pílulas de categoria (`.rounded-2xl`), banner Seara Gourmet, inputs da newsletter (`0 0 16px 16px`) |
| `--mr-radius-2xl` | `24px` | Botões `Voltar`/`Próximo` da newsletter (`24px`), base de `.results-error` (`0 0 24px 24px`), modals amplos |
| `--mr-radius-3xl` | `32px` | Container principal da newsletter (`.newsletter__container`) |
| `--mr-radius-full` | `9999px` | Botões CTA pill, badge `RECEITA`, pílulas de categoria, `a.category-badge`, `.emr-favorite-btn` (`50%`), setas marcas (`50%`), paginação (`.page-numbers`, `99%`), botões sociais (`32 × 32px`), busca mobile (`100px`) |

**Espessuras de Borda (`--mr-border-*`):**
- `0px`: padrão de cards e CTAs preenchidos.
- `1px solid`: divisor de metadados `.border-gray-100` (`#F3F4F6`), paginação `.page-numbers` (`#CE5032`), divisores drawer mobile (`#FAA96B`), botões outline e toasts.
- `2px solid`: borda `#FFFFFF` em `#emr-input-search` e `.newsletter__container`, e anel `:focus-visible`.

### 5.2 Sombras e Elevação (`box-shadow`)

| Token (App) | Valor CSS Exato | Origem / Uso |
| :--- | :--- | :--- |
| `--mr-shadow-sm` | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)` | Utilitário `.shadow` (cards interativos sutis / dropdowns leves) |
| `--mr-shadow-fav` | `0 2px 8px 0 rgba(0, 0, 0, 0.1)` | Botão circular `.emr-favorite-btn` sobre fotos |
| `--mr-shadow-nav` | `0 2px 8px 0 rgba(0, 0, 0, 0.15)` | Setas `.marcas-button-prev` / `.marcas-button-next` |
| `--mr-shadow-card` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | `.shadow-md` / `.emr-card` |
| `--mr-shadow-badge` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | Badge `RECEITA` do Hero (`.shadow-lg`) |
| `--mr-shadow-toast` | `0 10px 30px 0 rgba(0, 0, 0, 0.15)` | Recomendado para sistema de Toasts do app e dropdowns flutuantes |
| `--mr-shadow-banner` | `0 0 18px 0 rgba(0, 0, 0, 0.2)` | Banner inferior OneTrust (`#onetrust-banner-sdk`) |
| `--mr-shadow-modal` | `0 10px 30px 0 rgba(0, 0, 0, 0.3)` | Modal `.emr-favorite-modal-content` (e padrão de modais do app) |
| `--mr-shadow-ring-white` | `0 0 0 3px #FFFFFF` | Botão Audima (`#accessibility-menu`) sobre fundos variáveis |

### 5.3 Arquitetura de Camadas (`z-index`)

**Mapa real observado no site:** `1` (carrosséis `.hero-swiper`/`.marcas-swiper`, `.footer__alert`) → `2` (`.main-submenu`, `.emr-search-overlay`, `#header-mobile-menu`, `.footer__alert-text`) → `3` (`.emr-close-search`, `.header-search-modal.active`) → `10` (`.emr-favorite-btn`, setas carrossel, paginação Hero/Marcas) → `20` (conteúdo Hero `.z-20`) → `30` (`header#header`) → `999` (`.floatwhatsapp`) → `5000` (`.vue-notification-group` não usado) → `9999` (`#emr-favorite-modal`) → `10000000` (`#audimaWidget`) → `2147483645–2147483647` (OneTrust banner/backdrop/modal e `#accessibility-menu`).

**Escala nomeada e limpa recomendada para o aplicativo (eliminando colisões de `z-index: 2` entre busca/drawer e header `z-index: 30`):**

| Token CSS | Valor | Camada / Elementos |
| :--- | :--- | :--- |
| `--mr-z-base` | `1` | Carrosséis, wrappers base, `.footer__alert` |
| `--mr-z-overlay-content` | `2` | Gradientes e texto sobre foto nos cards destaque |
| `--mr-z-card-control` | `10` | `.emr-favorite-btn`, setas de carrossel, paginação interna |
| `--mr-z-hero-content` | `20` | Texto, badge e barras de progresso do Hero |
| `--mr-z-header` | `30` | Barra fixa superior `#header` |
| `--mr-z-dropdown` | `40` | Dropdown `Categorias` desktop e menus suspensos |
| `--mr-z-search-overlay` | `50` | Backdrop e resultados de busca (`header-search-overlay` / `header-search-modal`) |
| `--mr-z-drawer` | `60` | Drawer mobile `#header-mobile-menu` |
| `--mr-z-floating` | `100` | Botões flutuantes do app (WhatsApp, voltar ao topo) |
| `--mr-z-modal-backdrop` | `1000` | Backdrop escurecido `rgba(0,0,0,0.5)` |
| `--mr-z-modal` | `1010` | Conteúdo de modais (`role="dialog"`) — ou `9999` se coexistir com legado |
| `--mr-z-toast` | `10000` | Container global de Toasts (acima de modais do app, abaixo de widgets legais `2147483645+`) |

### 5.4 Movimento, Curvas & Durações

- **Curva padrão de interface (`--mr-ease-standard`):** `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind `transition-colors` e `transition-transform`).
- **Durações padrão:**
  - `--mr-duration-fast: 150ms` — micro-respostas de botões e ícones.
  - `--mr-duration-normal: 200ms` — transições de cor/borda (`duration-200`), header fixo (`0.2s ease-in-out`), fade do body (`0.2s ease-in`), entrada de toast.
  - `--mr-duration-slow: 300ms` — zoom de imagens em cards (`group-hover:scale-110` para `scale(1.1)`), escala do botão favoritar (`scale(1.1)`), entrada de modal (`scale(0.8) -> scale(1)`), transições do Hero e estrelas de avaliação.
  - `--mr-duration-hero-fade: 1000ms` — transição `swiper-fade` entre slides do Hero.
  - `--mr-duration-shimmer: 1500ms` — ciclo linear de skeletons (`infinite linear`, recomendado no app).
- **Redução de movimento (`prefers-reduced-motion`):**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Iconografia & Fotografia / Mídia

### 6.1 Iconografia

- **Linguagem visual:** Ícones SVG inline ou em `data:image/svg+xml`, combinando **outline arredondado** para controles de interface (coração favoritar, lupa de busca, ícone de conta/usuário, chevron de menu, sacola de produto) e **filled** para redes sociais, setas de carrossel, estrelas de avaliação e widgets externos.
- **Inventário exato de tamanhos e cores:**
  - **Coração Favoritar (`.emr-favorite-btn`):** Ícone `25 × 25 px` (`viewBox="0 0 512 512"`) centralizado em botão `40 × 40 px` (`#FFFFFF`). Inativo: contorno escuro com fill `#F6E4DC`. Ativo (`.favorited`): preenchido sólido `#FF6720`.
  - **Busca (Header):** Botão `32 × 32 px` com lupa branca `stroke` fino (`#FFFFFF`). Fechar busca (`.close-search`): `24 × 24 px` com 2 barras `#FFFFFF` de `20 × 2 px` rotacionadas `±45deg`.
  - **Conta (Header):** Área clicável `44 × 45 px` (`padding: 0 8px`) com ícone de usuário em contorno fino `#FFFFFF`.
  - **Chevron Navegação (`--arrow-symbol-white` / `--slick-arrow`):** `24 × 24 px` (`viewBox="0 0 32 32"`) nos menus e `48 × 48 px` em carrosséis slick; setas do carrossel de marcas dentro de círculos `32 × 32 px` (`#CE5032`).
  - **Ícones de Receita Interna:** `Rendimento` e `Preparo` em círculos laranja (`gap: 8px`, bloco `40px` altura); 5 estrelas `kk-star-ratings` de `24 × 24 px` (`padding-right: 5px`); ícones sociais de compartilhamento `16 × 16 px` (`#FFFFFF`) dentro de círculos `32 × 32 px` (`#000000`).
  - **Redes Sociais Rodapé:** Facebook `14 × 25 px`, TikTok `24 × 28 px`, YouTube `24 × 17 px`, LinkedIn `24 × 24 px` em `#FFFFFF`.
  - **Ícones Input Newsletter:** `24 × 24 px` em `::before` (usuário, telefone, calendário, pino de localização, envelope) — cinza/neutro padrão e `#E12D2D` em `.has-error`.
  - **Flutuantes Terceiros:** Cookie (`50 × 50 px`), Audima Acessibilidade (`50 × 50 px`), Audima Tab (`52 × 62 px`), WhatsApp (`60 × 60 px`), Fechar OneTrust (`44 × 44 px`).

### 6.2 Fotografia, Proporções (`aspect-ratio`) & Tratamento de Mídia

No site atual, todas as imagens computam `aspectRatio: "auto"` e dependem de alturas fixas (`h-48`, `h-36`, `h-[22rem]`, `h-[60px]`) com `<picture>` WebP e `object-fit: cover` (exceto logos e pílulas com `object-fit: fill`). Para o aplicativo, adote `aspect-ratio` explícito mantendo as proporções reais observadas:

| Tipo de Mídia | Dimensões Reais (Desktop `1920px`) | Proporção Real | `aspect-ratio` Padronizado (App) | Cantos, Overlay & Hover |
| :--- | :--- | :--- | :--- | :--- |
| **Logo Header (`Minha Receita`)** | `160 × 52.73 px` | `3.03 : 1` | `auto` (`max-width: 160px`, `padding: 8px 0`) | `object-fit: contain`, versão negativa branca |
| **Hero Home** | `1908 × 700 px` *(mobile `h-[500px]`)* | `2.73 : 1` (desktop) | `19 / 7` desktop (`max-h: 700px`), `4 / 5` ou `500px` mobile | Full-bleed `object-cover` + `--mr-overlay-hero` |
| **Hero Receita Interna** | `1908 × 384 px` | `4.97 : 1` | `min-height: 384px` full-bleed | Foto escurecida de fundo + foto principal central em destaque |
| **Card Receita Destaque** | `613.33 × 352 px` | `1.74 : 1` | **`16 / 9`** | `border-radius: 8px`, `object-cover`, `--mr-overlay-card`, `group-hover:scale(1.1)` (`0.3s`) |
| **Card Receita Padrão** | `298.66 × 192 px` | `1.56 : 1` | **`3 / 2`** | `border-radius: 8px`, `object-cover`, sem overlay, `group-hover:scale(1.1)` (`0.3s`), `.emr-favorite-btn` topo direito |
| **Card Matéria Destaque** | `456 × 352 px` | `1.30 : 1` | **`4 / 3`** | `border-radius: 8px`, `object-cover`, `--mr-overlay-card`, `group-hover:scale(1.1)` (`0.3s`) |
| **Card Matéria Padrão** | `220 × 144 px` | `1.53 : 1` | **`3 / 2`** | `border-radius: 8px`, `object-cover`, sem overlay, `group-hover:scale(1.1)` (`0.3s`) |
| **Banner Pílula Categoria** | `293.33 × 60 px` | `4.89 : 1` | **`5 / 1`** (mín. `60px` altura) | `border-radius: 16px`, `object-cover`, pílula `w-4/5` centralizada na borda inferior (`-mb-4`) |

---

## 7. Especificação Completa de Componentes

### 7.1 Botões (`Buttons`)

#### A. Inventário de Variantes Observadas

| Variante / Seletor | Uso Real | Dimensões & Padding | Raio & Borda | Tipografia | Cores (`bg / text`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CTA Pill Terracota** (`a.bg-[#CE5032].rounded-full`) | `TODAS AS RECEITAS`, `MAIS RECEITAS CHURRASCO`, `VER TODAS AS MATÉRIAS` | Altura `36px` (largura `167–224px`), `padding: 8px 16px` | `9999px`; `0px` | `Lufga`, `14px/20px`, `700`, `uppercase` | `#CE5032` / `#FFFFFF` *(App AA: `#B03D1F` para `14px` ou `18px+` bold em `#CE5032`)* |
| **Plugin Primary** (`.emr-button`) | Ações do plugin EMR | `inline-flex`, `padding: 8px 16px` | `6px`; `0px` | `Lufga` | `#D97706` / `#FFFFFF` |
| **Plugin Secondary** (`.emr-button-secondary`) | Ação secundária EMR | `inline-flex`, `padding: 8px 16px` | `6px`; `1px solid #E5E7EB` | `Lufga` | `#FFFFFF` / `#374151` |
| **Newsletter Nav** (`.newsletter__form-button-item`) | `Voltar` (`116 × 48px`) e `Próximo` (`132 × 48px`) | Altura `48px`, `padding: 12px 16px` | `24px`; `0px` | `Lufga`, `16px/24px`, `600` | `#FFFFFF` / `#FF5300` *(App AA: texto `#C73E00`)* |
| **Modal Favoritar — Cancelar / Login** (`.emr-favorite-modal-close`) | `Cancelar` (`109.72 × 44px`), `Fazer Login` (`125.94 × 44px`) | Altura `44px`, `padding: 10px 20px` | `6px`; `0px` | `Lufga`, `16px`, `700` | `Cancelar`: `#6B7280` / `#FFFFFF`<br>`Login`: `#FF6720` / `#FFFFFF` *(App AA: `#C73E00` ou `#B03D1F`)* |
| **Botão Favoritar** (`.emr-favorite-btn`) | Topo direito de fotos/cards de receita | `40 × 40 px`, `padding: 0px` | `50%`; `0px`; `--mr-shadow-fav` | SVG coração `25 × 25 px` | `#FFFFFF` / contorno escuro + fill `#F6E4DC` |
| **Setas Carrossel Marcas** (`.marcas-button-*`) | Navegação horizontal de marcas (mobile `390px`) | `32 × 32 px` | `50%`; `0px`; `--mr-shadow-nav` | Seta `#FFFFFF` | `#CE5032` / `#FFFFFF` |
| **Paginação Circular** (`.page-numbers`) | Paginação em `/todas-as-receitas/` (`1`, `2`, `3`, `…`, `143`, `❯`) | `30 × 30 px` (`gap: 8px`) | `99%` (`9999px`); `1px solid #CE5032` | `Lufga`, `16px/24px`, `500` | Ativo: `#CE5032` / `#FFFFFF`; Link: `#FFFFFF` / `#CE5032` |
| **Botões Sociais** (`.share-section a.social-button`) | Facebook, X, WhatsApp na receita interna | `32 × 32 px` | `9999px`; `0px` | SVG `16 × 16 px` | `#000000` / `#FFFFFF` |
| **Icon Buttons Header** | Lupa (`32 × 32px`), Fechar busca (`24 × 24px`), Conta (`44 × 45px`), Hambúrguer (`26.89 × 68px`) | Conforme slot | `0px` (ou `9999px` recomendado no app) | SVG branco | `transparent` / `#FFFFFF` |
| **OneTrust Banner / Modal** | Banner: `Definições` (outline `#FF5300`), `Rejeitar`/`Aceitar` (`#FF5300`), Fechar (`44 × 44px`). Modal: `#346E4A` | Banner: `41.61px` alt; Modal: `38–40.41px` alt | `2px`; `1px solid` | `13.008px` (`600`) / `12–14.4px` (`700`) | `#FF5300` ou `#FFFFFF` (banner); `#346E4A` / `#FFFFFF` (modal) |
| **Sistema Tema Seara** (`.btn--*`) | Botões institucionais em `style.css` (não usados na home) | Variável | Variável | `Lufga` | `--orange`, `--stroke--orange`, `--red`, `--stroke--red`, `--gray`, `--stroke--gray`, `--transparent` |
| **Flutuantes Terceiros** | Cookie (`50 × 50px`), WhatsApp (`60 × 60px`), Audima (`50 × 50px` / `52 × 62px`) | `50–60 px` | `50%` | SVG / imagem | `#FF5300`, verde WhatsApp, `#D0D0D7` |

#### B. Matriz Completa de Estados de Botões (Observado vs. Padrão Unificado do App)

| Variante | `default` | `:hover` | `:focus-visible` | `:active` | `:disabled` | `.loading` / `.favorited` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CTA Pill Terracota** | **Site:** `#CE5032` / `#FFF`<br>**App AA:** `#B03D1F` (ou `#CE5032` se `>= 18.67px` bold) | **Site:** `#B03D1F` / `#B84528`<br>**App:** `#963218` + `translateY(-1px)` | **Site:** `outline: 0` *(bug)*<br>**App:** `outline: 2px solid #B03D1F; outline-offset: 2px` | `scale(0.98)` | **Site:** N/D<br>**App:** `opacity: 0.5; pointer-events: none; cursor: not-allowed` | `.loading`: spinner `16px` inline + `pointer-events: none` |
| **Plugin Primary (`.emr-button`)** | `#D97706` / `#FFF` | `#B45309` | Ring `2px` `#F59E0B` + offset `2px` `#FFF` | `#92400E` + `scale(0.98)` | `opacity: 0.5; cursor: not-allowed` | Spinner branco inline |
| **Plugin Secondary** | `#FFF` / `#374151`, borda `#E5E7EB` | `#F9FAFB` | Ring `2px` `#F59E0B` + offset `2px` `#FFF` | `#F3F4F6` | `opacity: 0.5; cursor: not-allowed` | Spinner `#374151` inline |
| **Newsletter (`Voltar`/`Próximo`)** | `#FFF` / `#FF5300` *(App AA: `#C73E00`)* | **Site (Laranja):** sem regra (`Gourmet`: `#1F1F1F`)<br>**App:** `#FAF5F3` | **Site:** `outline: none` *(bug)*<br>**App:** `outline: 2px solid #FFFFFF; outline-offset: 2px` | `scale(0.98)` | **Site:** N/D<br>**App:** `opacity: 0.55; cursor: not-allowed` | `.button-loader-spinner` (no tema Gourmet) |
| **Botão Favoritar (`.emr-favorite-btn`)** | `40×40px`, `#FFF`, coração `#F6E4DC` | `scale(1.1)`, `#FFF` (`0.3s`) | **Site:** `outline: none`<br>**App:** `outline: 2px solid #B03D1F; outline-offset: 2px` | `scale(0.95)` *(app)* | `opacity: 0.5; cursor: not-allowed` | **`.loading`:** `opacity: 0.6`<br>**`.favorited`:** SVG fill `#FF6720` |
| **Setas Carrossel (`.marcas-button-*`)** | `#CE5032` / `#FFF` | `#B8441E`, `scale(1.1)` (`0.3s`) | `outline: 2px solid #B03D1F; outline-offset: 2px` | `scale(0.95)` | `.swiper-button-disabled`: `opacity: 0.35`; `.swiper-button-lock`: `display: none` | N/A |
| **Paginação (`.page-numbers`)** | Link: `#FFF` / `#CE5032`, borda `#CE5032` | `#CE5032` / `#FFF` | `outline: 2px solid #B03D1F; outline-offset: 2px` | `scale(0.95)` | `pointer-events: none; opacity: 0.4` | `.current`: `#CE5032` / `#FFF`, `aria-current="page"` |
| **Botões Sociais (`.social-button`)** | `#000000` / `#FFF` | `#1F2937` (`hover:bg-gray-800`, `0.2s`) | `outline: 2px solid #B03D1F; outline-offset: 2px` | `scale(0.95)` | N/A | N/A |
| **Header Icon Buttons** | `transparent` / `#FFF` | `bg: rgba(255,255,255,0.14)` *(rec. app)* | **Site:** `outline: none`<br>**App:** `outline: 2px solid #FFFFFF; outline-offset: 2px` | `rgba(255,255,255,0.22)` | N/A | Busca ativa exibe `.close-search` (`X`) |
| **OneTrust Banner / Modal** | Banner: `#FF5300` / `#FFF` (ou outline); Modal: `#346E4A` / `#FFF` | `opacity: 0.9` | `outline: 2px solid #000000` | `opacity: 0.85` | N/A | N/A |

---

### 7.2 Popups, Modais, Drawers & Overlays

| Componente / Seletor | Disparo | Backdrop & `z-index` | Dimensões, Raio, Padding & Sombra | Fechamento & Comportamento |
| :--- | :--- | :--- | :--- | :--- |
| **Banner Cookies LGPD** (`#onetrust-banner-sdk`) | Automático ao carregar sem consentimento | Sem backdrop; `position: fixed; bottom: 0; z-index: 2147483645` | `100%` largura × `70.61px`; `bg: #FFFFFF`; `border-radius: 0px`; `box-shadow: 0 0 18px rgba(0,0,0,0.2)` | Botão `X` (`44 × 44px`, `#555555`); ao fechar/aceitar ativa `#ot-sdk-btn-floating` (`50 × 50px`, `z: 2147483646`). |
| **Modal Preferências LGPD** (`#onetrust-pc-sdk`) | Clique em `Definições de cookies` ou botão flutuante | `.onetrust-pc-dark-filter`: `rgba(0,0,0,0.5)`, sem blur, `z: 2147483646` | `max-width: 575px` (`575 × 717.59px`); `bg: #FFFFFF`; `border-radius: 2.5px`; `box-shadow: 0 2px 10px -3px #999999`; `z: 2147483647` | Botão `#close-pc-btn-handler` (`44 × 44px`); entrada `.ot-fade-in`; foco visível `outline: 2px solid #000`. |
| **Modal Login-Gate Favoritar** (`#emr-favorite-modal.show`) | Clique em `.emr-favorite-btn` deslogado | `rgba(0, 0, 0, 0.5)`, sem blur, `z: 9999` | `.emr-favorite-modal-content`: `width: 90%; max-width: 400px` (`400 × 209px`); `padding: 30px`; `border-radius: 12px`; `bg: #FFFFFF`; `box-shadow: 0 10px 30px rgba(0,0,0,0.3)` | **Sem botão `X` no topo.** Fecha por `Cancelar` ou navega para `/minha-conta/` via `Fazer Login`. Transição `scale(0.8) -> scale(1)` em `0.3s`. |
| **Overlay + Autocomplete Busca** (`.header-search-overlay`, `#emr-search-results`) | Foco/clique e digitação em `#emr-input-search` | Desktop: `rgba(0, 0, 0, 0.5)`, `z: 2`<br>Mobile: `100vw × 100vh` sobre `#FAF5F3` | Desktop: `688.83 × 48px` (`border-radius: 22px 22px 0 0`) + `.results-list` (`max-height: 500px`, `bg: #FAF5F3`, `border-radius: 4px 4px 19px 19px`, `margin-top: 8px`, scrollbar `8px` `#FFBFA1`). | Botão `.close-search` (`24 × 24px`, `X` branco); exibe até 8 links `50px` (`#575757`, `14px`, `700`) + `"Ver mais resultados para \"...\""`. Sem resultados: `.results-error`. |
| **Dropdown `"Categorias"` Desktop** (`.main-submenu.sub-menu`) | `:hover` sobre `#menu-item-31068` | Sem backdrop; `position: absolute; z: 2` | **Coluna única vertical:** `300 × 500px` (`top: 70px; left: 531px`); `bg: #FAF5F3`; `border-radius: 0 0 8px 8px`; `padding: 16px 0 16px 16px`; `overflow-y: auto` (11 categorias). | Mouseleave fecha. Hover em item: `::before` `#FF5300`, texto `#FFFFFF`, ícone `#FAF5F3` (`8px`), chevron branco. |
| **Drawer Mobile Full-Screen** (`#header-mobile-menu.active`) | Clique em `#header-hamburguer` (`< 992px` / `390px`) | Tela cheia (`100%`, sem backdrop separado); `z: 2` | `390 × 844px`, `bg: #FAF5F3`. Composto por `.top-menu` (`56px`, `#FF6720`, 4 ícones sociais + `X`), `.main-menu-nav` (`53px`, `#E54B00`, 3 links `12px`), `.categories-menu-nav` (`747px`, itens `54px` com `border-bottom: 1px solid #FAA96B`). | Botão `.close-menu` (`24 × 24px`, branco `#FFFFFF`) no canto superior direito. |
| **Tooltips** | Hover em `#ot-sdk-btn-floating` | Sem backdrop | Pseudo-elementos `::before` / `::after` | Animação `opacity: 0 -> 1`, `translate(0.5em, -50%) scale(1)` em `0.3s`. Demais botões do site usam apenas `title` nativo HTML. |

**Notas Factuais de Diagnóstico (Site):**
- **`#float_cep-button` e `.modal-buy-product`:** Estão presentes no HTML do rodapé com 5 tags `<template>` (`--cep`, `--product`, `--cep-change`, `--not-found`, `--fallback-retailers`), mas são **completamente inoperantes em `/minha-receita/`** (`0` regras CSS e `0` handlers JS carregados). **Não replicar código morto no app;** caso o app inclua seletor de CEP/Onde Comprar, implementá-lo usando o padrão unificado de modal abaixo.
- **Modais inexistentes no site:** Não há modal de login/cadastro inline (redireciona para `/minha-conta/`) nem modal de compartilhamento (os 3 ícones abrem URLs externas em nova aba).

#### Padrão Unificado de Modal para o Aplicativo (Extensão Recomendada)

- **Atributos obrigatórios:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`.
- **Container & Backdrop:** Backdrop `rgba(0, 0, 0, 0.5)` (`--mr-z-modal-backdrop: 1000`); card `width: calc(100% - 32px); max-width: 440px` (`--mr-modal-md: 575px` para preferências), `background: #FFFFFF`, `border-radius: 12px`, `padding: 24px` (mobile) / `30px` (desktop), `box-shadow: var(--mr-shadow-modal)`.
- **Controles obrigatórios:** Botão fechar `X` (`44 × 44 px` touch target, `aria-label="Fechar"`) no canto superior direito (corrigindo a ausência em `#emr-favorite-modal`), focus trap dentro do modal, fechamento por `Escape` e clique no backdrop, e botões com contraste AA (`Cancelar` em `#4B5563` ou outline `#374151`, ação primária em `#B03D1F` / `#C73E00`).

---

### 7.3 Toasts, Notificações, Alerts & Validações

#### A. Separação Factual do que Existe no Site

1. **Observado ao vivo:**
   - **Alerta institucional fixo do rodapé (`.footer__alert`):** Card `328 × 340 px`, fundo `#FF5300` (`#252525` em Seara Gourmet), texto `#FFFFFF` (`14px / 20px`), `gap: 24px`, com curvatura superior direita aplicada pelo SVG `.footer__alert-shape` (visível a partir de `1200px`).
   - **Feedback vazio do autocomplete (`.results-error`):** `"Nenhum resultado para o(s) termo(s) pesquisado(s)."` em caixa `#FAF5F3`, texto `#000000` (`16px`, `700`), `padding: 16px 32px`, `border-radius: 0 0 24px 24px`.
   - **Gate de favoritos (`#emr-favorite-modal.show`):** Dispara modal síncrono (`"OPA..."`), não toast. (O template HTML oculto contém estado `"Pronto! Esta receita foi adicionada à sua lista de favoritos."`, também em modal.)
2. **Presente apenas no CSS / Não disparado em `/minha-receita/`:**
   - **Erros de formulário (`style.css` e `footer.css`):** `.form-group.error .group-checkbox--container` (`bg: #FFCAC9`, `border: 1px solid #F03838`, `span: #8A1F1B`), `.has-error.checkbox` (`color: #E12D2D; bg: #FFFFFF`), `.has-error:not(.checkbox) label` (`#E12D2D` + ícones SVG `#E12D2D`), `.newsletter__form-message-title.success` (Gourmet `#E5C682` + ícone `#FFE600`). Não dispararam ao vivo em `/minha-receita/` devido à ausência de `footer.js` e à incompatibilidade `.newsletter__form-content` vs `.new-newsletter-form` (enquanto em `/?s=...` o Swiper inicializa normalmente).
   - **Toasts Vue (`.vue-notification-group` / `.vue-notification`):** Definidos em `<style>` inline com `z-index: 5000` (`.vue-notification` `#44A4FC`, `.warn` `#FFB648`, `.error` `#E54D42`, `.success` `#68CD86`), pertencentes a widget terceiro e **não disparados** por nenhuma ação do Minha Receita.
3. **Ausente no site:** Zero regras CSS ou JS para `SweetAlert` (`swal`), `Toastify` (`toastify`), ou toasts ao copiar link / favoritar / avaliar receita.

#### B. Extensão Padronizada Completa — Sistema de Toasts para o Aplicativo

Para feedback não bloqueante (favoritar receita autenticado, copiar link, avaliação salva, erro de rede, aviso de conexão), adote o sistema abaixo em conformidade **WCAG AA**:

| Variante | Background | Borda (`1px solid`) | Texto (`>= 4.5:1`) | Ícone (`20 × 20px`) | ARIA (`role` / `aria-live`) | Duração & Uso no App |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`toast.success`** | `#EDF9F1` | `#2E8555` | `#134E2E` (**`9.00:1`**) | `#2E8555` (Check Circle) | `role="status"` / `aria-live="polite"` | `4000ms` — Receita favoritada, link copiado, avaliação enviada, cadastro salvo |
| **`toast.error`** | `#FEF1F1` | `#D92D20` | `#8A1F1B` (**`8.32:1`**) | `#D92D20` (Alert Circle) | `role="alert"` / `aria-live="assertive"` | `6000ms` (ou persistente se crítico) — Falha de rede, erro ao salvar favorito/formulário |
| **`toast.warning`** | `#FFF8EB` | `#D97706` | `#78350F` (**`8.59:1`**) | `#B45309` (Alert Triangle) | `role="alert"` / `aria-live="assertive"` | `5000ms` — Sessão expirando, conexão instável, limite de itens |
| **`toast.info`** | `#FAF5F3` | `#CE5032` | `#3F3E3D` (**`9.87:1`**) | `#CE5032` (Info Circle) | `role="status"` / `aria-live="polite"` | `4000ms` — Dica de filtro, receita adicionada ao livro |

- **Anatomia e Dimensões:** `min-width: 300px; max-width: 420px; padding: 12px 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); display: flex; align-items: flex-start; gap: 12px; font-family: 'Lufga', sans-serif; font-size: 14px; line-height: 20px; font-weight: 500`. Inclui botão fechar `32 × 32 px` (área clicável expandida / ícone `16 × 16 px`) com `:focus-visible { outline: 2px solid #B03D1F; outline-offset: 2px }`.
- **Posicionamento e Empilhamento:**
  - **Desktop (`>= 768px`):** `position: fixed; bottom: 24px; right: 24px; z-index: 10000`.
  - **Mobile (`< 768px`):** `position: fixed; bottom: 16px; left: 16px; right: 16px; z-index: 10000` (`min-width: 0; max-width: 100%`).
  - **Empilhamento:** Máximo de **3 toasts simultâneos** em pilha vertical (`display: flex; flex-direction: column-reverse; gap: 12px`); toasts excedentes substituem o mais antigo.
- **Comportamento & Movimento:** Pausa contagem de auto-dismiss no `:hover` e `:focus-within`; entrada `translateY(12px) -> 0` + `opacity: 0 -> 1` em `200ms cubic-bezier(0.4, 0, 0.2, 1)` (desativada sob `prefers-reduced-motion: reduce`).

---

### 7.4 Formulários & Inputs

#### A. Inventário Observado

1. **Busca Desktop (`#emr-input-search`):** `688.83 × 48 px`, `bg: #FF5300`, `border: 2px solid #FFFFFF`, `border-radius: 8px`, `padding: 0 40px 0 8px` (`.active`: `0 40px`), texto `14px/21px` `600` `#FFFFFF`, `::selection` `#FF5300` sobre `#FFFFFF`. Autofill no CSS usa `box-shadow: #B2B2B2 0 0 0 1000px inset` (substituir no app para preservar legibilidade).
2. **Busca Mobile (`#header-search-bar`):** Container pill `123.45 × 48 px`, `border-radius: 100px`, `margin: 0 8px`; expande em `< 1200px` para modal `100vw × 100vh` sobre `#FAF5F3`.
3. **Campos da Newsletter (5 passos Swiper em `#new-footer-newsletter`):**
   - Inputs (`name`, `phone`, `birthday`, `email`) e `<select name="state">` (`"Seu estado"` + 27 UFs): `448 × 44 px`, `padding: 0 0 0 56px` (ícone `24 × 24 px` à esquerda), `bg: #FFFFFF`, `border: 0`, `border-radius: 0 0 16px 16px`, texto `16px` `#8E8E8E`. O `<label>` fica acoplado no topo formando um bloco branco arredondado único.
   - 3 Checkboxes (`16 × 16 px` no Passo 5): `aceite_politica_privacidade` (`required`), `aceite_seguranca_newsletter` (`required`), `aceite_promo_newsletter` (opcional).
   - Regras de validação jQuery presentes em `scripts.min.js` (para `.new-newsletter-form`): `lettersonly`, `minlength: 2` (`name`), `minlength: 15` (`phone`), `validDateOfBirth >= 18` (`birthday`), `customEmail` (`email`), `required`.
4. **Selects e Filtros em Listagens:** Inexistentes (`0`) dentro de `<main>` em `/todas-as-receitas/` e `/receitas-e-materias/churrasco/`.

#### B. Estados Padronizados de Inputs & Controles para o Aplicativo

| Estado | Superfície & Borda | Texto & Label | Ícone / Mensagem Inline | Acessibilidade |
| :--- | :--- | :--- | :--- | :--- |
| **`default`** | `#FFFFFF`, borda `1px solid #E5E7EB`, `border-radius: 8px`, altura `44px` (`48px` busca) | Texto `#1F1F1F`; placeholder `#6B7280` (`4.83:1`, substitui `#8E8E8E`); label `14px` `600` `#374151` | Texto auxiliar opcional `12px` `#6B7280` | `<label for>` explícito |
| **`hover`** | Borda `1px solid #9CA3AF` | Mantido | — | — |
| **`focus-visible`** | Borda `2px solid #B03D1F` + ring `0 0 0 3px rgba(176, 61, 31, 0.18)` (em busca laranja: `outline: 2px solid #FFFFFF; outline-offset: 2px`) | `#1F1F1F` (ou `#FFFFFF` em busca) | **Remover** `outline: none` global e **não usar** `#B2B2B2` no `:-webkit-autofill` | Foco visível garantido `>= 3:1` |
| **`error`** | Fundo `#FEF1F1` (ou `#FFFFFF` em card laranja), borda `1.5px solid #D92D20` | Label e ícone `#8A1F1B` (ou `#E12D2D` sobre branco) | Mensagem inline `12px / 16px` `600` `#8A1F1B` abaixo do campo (`gap: 4px`) | `aria-invalid="true"`, `aria-describedby="campo-erro"`, `role="alert"` na mensagem |
| **`success`** | `#FFFFFF`, borda `1.5px solid #2E8555` | Label `#134E2E` | Ícone check `#2E8555` à direita (`20 × 20px`) | — |
| **`disabled`** | Fundo `#F3F4F6`, borda `1px solid #E5E7EB` | Texto e label `#6B7280`, `opacity: 0.7` | `cursor: not-allowed` | Atributo `disabled` ou `aria-disabled="true"` |

---

### 7.5 Navegação & Subpáginas

1. **Header Fixo (`header#header`):**
   - Desktop: `72px`, `#FF5B0D`, container `.wrap.custom-wrap` (`max-width: 1478px`, `padding: 0 16px`). Ordem: Logo MR (`160 × 52.73px`) → Logo Seara → Menu horizontal (`Categorias ∨`, `Receitas`, `Matérias`, `Livros de Receitas`) → Busca (`688.83 × 48px`) → Conta (`/minha-conta/`, `44 × 45px`).
   - Mobile (`390px`): `68px`, `#FF5B0D`, `#header-inner` (`358px`). Oculta Logo Seara em `<= 768px` (`@media (max-width: 768px)`); exibe Logo MR → `#header-hamburguer` (`26.89 × 68px`) → Busca pill (`123.45 × 48px`) → Conta.
   - **Nota WCAG:** Os links e busca brancos sobre `#FF5B0D` (`3.11:1`) e `#FF5300` (`3.24:1`) ficam abaixo de `4.5:1`. No app, considere escurecer o header/input para `#C73E00` (`5.10:1`) ou adotar texto `>= 18.67px` bold (`font-weight: 700`).
2. **Drawer Mobile (`#header-mobile-menu.active`):** Full-screen `390 × 844 px`, `#FAF5F3`, com `.top-menu` (`56px`, `#FF6720`, 4 ícones sociais + `X` `24 × 24px`), `.main-menu-nav` (`53px`, `#E54B00`, 3 links `12px` `600` brancos) e `.categories-menu-nav` rolável (`54px` por linha, `border-bottom: 1px solid #FAA96B`, texto `14px` `700` `#503C3C`).
3. **Paginação Circular (`.page-numbers` em `/todas-as-receitas/`):** Lista flexbox centralizada (`gap: 8px`), itens circulares `30 × 30 px` (`border-radius: 9999px`, `1px solid #CE5032`). Ativo: `#CE5032` / `#FFFFFF` (`aria-current="page"`); inativos: `#FFFFFF` / `#CE5032`, hover `#CE5032` / `#FFFFFF`. *(App: ampliar área de toque mobile para `36 × 36 px` ou `40 × 40 px` e usar `#B03D1F` para conformidade AA `5.94:1`.)*
4. **Footer (`footer.footer`):** `500px` desktop dividido em faixa superior (`160px`, `#FF5300`, sociais + logo Seara `155 × 104 px` + `Trabalhe conosco`) e faixa inferior (`340px`, `#FFFFFF`, `.footer__alert` `328 × 340 px` `#FF5300` com `.footer__alert-shape` curvo à esquerda + `.footer__nav` 4 colunas `Nossas Linhas`, `Institucional`, `Contato`, `Jurídico` à direita).
5. **Subpáginas (`/receitas-e-materias/churrasco/` e `/todas-as-receitas/`):** Hero `600px` + carrossel horizontal de ícones de categorias (`330px`) + banner Seara Gourmet + grid 3 colunas (`928px`, `gap: 24px`).
6. **Extensões Recomendadas para Navegação no App:**
   - **Breadcrumbs** (ausentes no site): `Início > [Categoria] > [Receita]` em `14px`, `#6B7280`, último item `#1F1F1F` `600`, separador `/` ou chevron `14px`, com `<nav aria-label="Breadcrumb">`.
   - **Barra de Filtros e Ordenação** em `/todas-as-receitas/` e categorias: chips de filtro rápido (ex.: Tempo de preparo, Porções, Linha Seara) + `<select>` de ordenação (`Mais recentes`, `Melhor avaliadas`, `Menor tempo`), todos com `height: 40px`, `border-radius: 9999px` (chips) / `8px` (select).

---

### 7.6 Cards, Detalhe de Receita, Empty States & Skeletons

#### A. Anatomia dos Cards

| Card | Dimensões & Grid | Mídia & Hover | Conteúdo & Metadados |
| :--- | :--- | :--- | :--- |
| **Receita Destaque** (`.featured-card`) | Desktop: `613.33 × 389 px` (`col-span-2`)<br>Mobile: `358 × 352 px` | Foto `352px` altura (`16/9` no app), `rounded-lg` (`8px`), `group-hover:scale-110` (`0.3s`), `.emr-favorite-btn` (`40 × 40px`) | Sobreposto com `--mr-overlay-card` + `padding: 16px`: badge categoria (`#FFFFFF` pill com texto `#B03D1F` recomendado no app para legibilidade sobre foto), título `24px/32px` `700` `#FFFFFF` (`line-clamp-3`), linha divisória fina e meta branca (`3 a 4 • 40 min`). |
| **Receita Padrão** (`.small-card` / `.receita-item`) | Home: `298.66 × 389 px`<br>Subpágina: `293.33 × 333–417 px` | Foto `192px` altura (`3/2` no app), `rounded-lg` (`8px`), `group-hover:scale-110`, `.emr-favorite-btn` (`40 × 40px`) | Abaixo da foto (`py-4`): categoria `12px/16px` `700` uppercase `#CE5032` (App AA: `#B03D1F`, hover `#FF6720`), `h3.recipe-title` `18px/28px` `700` `#666666` (`line-clamp-3`), divisor `1px solid #F3F4F6`, `.recipe-meta` `12px` `700` `#6B7280` (`pt-3`). **App:** só renderizar `"•"` se ambos rendimento e tempo existirem. |
| **Matéria Destaque** (`.featured-materia`) | `456 × 352 px` (`col-span-2` em 4 col) | `456 × 352 px` (`4/3`), `rounded-lg` (`8px`), `group-hover:scale-110` | `--mr-overlay-card`, data (`17. SET`), título `24px/32px` `700` `#FFFFFF` (`line-clamp-3`) + resumo. Sem botão de favoritar. |
| **Matéria Padrão** (`.small-materia`) | `220 × 316 px` | `220 × 144 px` (`3/2`), `rounded-lg` (`8px`), `group-hover:scale-110` | Abaixo da foto: data `12px` `#6B7280`, categoria `12px` uppercase `#B03D1F`/`#CE5032`, título `18px/28px` `700` `#666666` (`line-clamp-3`). Sem botão de favoritar. |

#### B. Página Interna de Receita (`/receita/.../`)

- **Estrutura observada:**
  1. **Hero (`1908 × 384 px`):** Imagem full-bleed escura, selo de marca (`50.05 × 40 px` em pill branca no topo direito), `a.category-badge` (`109.44 × 40 px`, `#FA6D01` no site — corrigir para AA no app), `h1` (`30px/36px`, `700`, `#FFFFFF`), `.rendimento` e `.tempo-preparo` (`40px`, `gap: 8px` com ícones circulares laranja; sem tag de dificuldade).
  2. **Foto Principal & Áudio:** Foto centralizada com `.emr-favorite-btn` (`40 × 40 px`) + player inline Audima abaixo.
  3. **Corpo da Receita (`.content.my-8`, `928px`):** Duas colunas assimétricas (títulos à esquerda `384px`, `padding-left: 112px`; listas à direita `480px`): `h2` `"Ingredientes"` (`28px/32px` `500` `#666666`) + `<ul>` (`16px/24px` `400` `#666666`), divisor horizontal, `h3` `"Modo de preparo"` (`26px/32px` `500`) + `<ol>` simples (`padding-right: 48px`) com subtítulos em itálico. Sem tabela nutricional nem produtos relacionados na página auditada.
  4. **Compartilhamento, Avaliação & Relacionadas:** `.share-section` (`"Compartilhe:"` + 3 botões circulares `32 × 32 px` `#000000`: Facebook, X, WhatsApp), `.kk-star-ratings` (`"5/5 - (1 voto)"`, `19.2px` `700` + 5 estrelas `24 × 24 px`), link `"Ver mais: [Categoria]"` (`14px` `#CE5032`), `h4` `"Receitas relacionadas"` (`24px/32px` `700` `#CE5032`) + grid 3 colunas + CTA pill.
- **Melhorias obrigatórias para o aplicativo:**
  - Adicionar **checkboxes interativos** (`20 × 20 px`, raio `4px`, checked `#B03D1F`) nos itens de Ingredientes com riscado visual ao marcar.
  - Adicionar botões **Copiar Link** (disparando `toast.success("Link copiado!")`) e **Imprimir** (`window.print()`) na `.share-section`.
  - Substituir `a.category-badge` `#FA6D01` (`2.90:1`) por token seguro AA (`#B03D1F` `5.94:1` ou cor AA da categoria).

#### C. Empty States (Observado vs. Acionável Recomendado)

- **Observado no site:**
  1. Busca global (`/?s=xyz987inexistente`): Banner `#banner.search-banner` (`244px` altura, `radial-gradient(circle, rgb(254, 147, 0), rgb(241, 64, 0))`), `h1` branco `24px/32px` `"Nenhum resultado encontrado para: \"...\""`, sem ilustração, sem sugestões e sem CTA de saída.
  2. Autocomplete (`.results-error`): `"Nenhum resultado para o(s) termo(s) pesquisado(s)."` em caixa `#FAF5F3`, `padding: 16px 32px`, `border-radius: 0 0 24px 24px`, `16px` `700` `#000000`.
- **Especificação Acionável Recomendada (App):**
  - Container centralizado `max-width: 480px; margin: 0 auto; padding: 48px 24px; text-align: center`.
  - Ícone editorial `48 × 48 px` em `#CE5032` dentro de círculo `80 × 80 px` `#FAF5F3`.
  - Título `20px / 28px` `700` `#1F1F1F`; descrição `14px / 20px` `400` `#666666`; e pelo menos 1 CTA pill primário (`"Limpar busca"` / `"Explorar todas as receitas"`, `#B03D1F` / `#FFFFFF`) mais links rápidos de categorias populares.

#### D. Skeletons de Carregamento (Extensão Padronizada para o App)

*(O site atual não possui skeletons — utiliza apenas `.emr-favorite-btn.loading { opacity: 0.6 }` e `.button-loader-spinner` restrito ao tema Gourmet.)*

- **Tokens e Animação:**
  - `--mr-skeleton-base: #F3F4F6`
  - `--mr-skeleton-highlight: #FAF5F3`
  - Gradiente `linear-gradient(90deg, #F3F4F6 0%, #FAF5F3 50%, #F3F4F6 100%)` com `background-size: 200% 100%` e `animation: mr-shimmer 1.5s infinite linear` (ou pulso estático sob `prefers-reduced-motion: reduce`).
- **Anatomia do Skeleton de Card de Receita Padrão:**
  1. Bloco de mídia: `width: 100%; aspect-ratio: 3 / 2; border-radius: 8px`.
  2. Categoria: `width: 80px; height: 12px; border-radius: 4px; margin-top: 16px`.
  3. Título (2 linhas): linha 1 `width: 100%; height: 18px; border-radius: 4px; margin-top: 8px`; linha 2 `width: 75%; height: 18px; border-radius: 4px; margin-top: 8px`.
  4. Divisor `1px solid #F3F4F6` (`margin-top: 16px`) + linha de meta `width: 110px; height: 12px; border-radius: 4px; margin-top: 12px`.
- **Skeleton de Card Destaque:** Bloco único `aspect-ratio: 16 / 9` (`4 / 3` para matéria destaque), `border-radius: 8px`, com barras internas posicionadas na base (`padding: 16px`).

---

## 8. Acessibilidade (a11y) & Guia de Implementação para o Aplicativo

### 8.1 Resumo de Correções Críticas WCAG AA

1. **Remover `outline: none` global em foco:** Garantir anel `:focus-visible` de `2px solid` com `outline-offset: 2px` em todos os links, botões, cards clicáveis, inputs e controles (`#B03D1F` em fundos claros; `#FFFFFF` em fundos laranja/escuros).
2. **Corrigir contraste das 9 pílulas de categoria:** Eliminar a regra `h2` preta (`24px`, `#000000`) e aplicar `#FFFFFF` em `12px–14px` `700` sobre os tokens escurecidos `--mr-cat-*-aa` (ex.: `Cordeiro` `#A70030` passa de `2.69:1` para **`7.82:1`**; `100% Vegetal` usa `#5C6E18` = **`5.68:1`**).
3. **Corrigir textos pequenos sobre laranja/terracota:**
   - Badges `12px` sobre `#FFFFFF` e botões pill `14px` com texto `#FFFFFF`: usar `#B03D1F` (**`5.94:1`**) no lugar de `#CE5032` (`4.36:1`) e `#FF6720` (`2.91:1`).
   - Pílula `a.category-badge` na página interna de receita (`#FA6D01`, `2.90:1`): migrar para `#B03D1F` (`5.94:1`) ou `--mr-cat-*-aa`.
   - Nav links/botões `14px` sobre fundo laranja `#FF5B0D` (`3.11:1`) ou `#FF5300` (`3.24:1`): usar `#C73E00` (**`5.10:1`**) para superfícies com texto branco pequeno, ou elevar tamanho/peso conforme critério de texto grande (`>= 18.67px` bold).
4. **Corrigir contraste de placeholders e card hero de listagem:** Usar `#6B7280` (`4.83:1`) em placeholders sobre branco (em vez de `#8E8E8E` `3.28:1`) e restaurar `#FFFFFF` + `--mr-overlay-hero` no título `"Pirarucu de Casaca"` em `/todas-as-receitas/`.
5. **Tocar/clicar em mobile:** Garantir área mínima interativa `40 × 40 px` a `44 × 44 px` (inclusive nos círculos de paginação `.page-numbers` e botão fechar toasts/modais).

### 8.2 Arquivo Unificado `tokens.css` (Pronto para Copiar)

> Livre de tokens legados `--eko-*`, sem seletores destrutivos e 100% válido em CSS puro.

```css
:root {
  /* === MARCA SEARA & EDITORIAL MINHA RECEITA === */
  --mr-brand-orange: #ff5300;
  --mr-header-bg: #ff5b0d;
  --mr-brand-orange-bright: #ff6720;
  --mr-brand-orange-hover: #e55a1a;
  --mr-brand-orange-deep: #fa4616;
  --mr-brand-orange-aa: #c73e00;
  --mr-terracotta: #ce5032;
  --mr-terracotta-hover: #b03d1f;
  --mr-terracotta-active: #963218;
  --mr-amber-btn: #d97706;
  --mr-amber-btn-hover: #b45309;
  --mr-yellow-light: #fdda25;
  --mr-yellow-dark: #ff8f1c;
  --mr-gold-gourmet: #e0bb6e;

  /* === SUPERFÍCIES & BORDAS === */
  --mr-surface-default: #ffffff;
  --mr-surface-cream: #faf5f3;
  --mr-surface-subtle: #f9fafb;
  --mr-surface-muted: #f3f4f6;
  --mr-surface-dark-gourmet: #252525;
  --mr-border-subtle: #f3f4f6;
  --mr-border-default: #e5e7eb;
  --mr-border-strong: #9ca3af;
  --mr-border-warm: #faa96b;
  --mr-scrollbar-thumb: #ffbfa1;
  --mr-heart-outline-fill: #f6e4dc;

  /* === TIPOGRAFIA & TEXTOS === */
  --mr-font-sans: 'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --mr-text-strong: #000000;
  --mr-text-primary: #1f1f1f;
  --mr-text-heading-modal: #333333;
  --mr-text-control: #374151;
  --mr-text-dropdown: #3f3e3d;
  --mr-text-drawer: #503c3c;
  --mr-text-secondary: #666666;
  --mr-text-muted: #6b7280;
  --mr-text-inverse: #ffffff;
  --mr-text-inverse-soft: rgba(255, 255, 255, 0.9);

  /* === CATEGORIAS (CORES OBSERVADAS & VERSÕES AA PARA TEXTO #FFFFFF) === */
  --mr-cat-aves: #f35935;
  --mr-cat-aves-aa: #c83e1d;
  --mr-cat-peixes: #2c7aa8;
  --mr-cat-peixes-aa: #2c7aa8;
  --mr-cat-suina: #e72667;
  --mr-cat-suina-aa: #b8144c;
  --mr-cat-bovinos: #e82a2c;
  --mr-cat-bovinos-aa: #c41c1e;
  --mr-cat-cordeiro: #a70030;
  --mr-cat-cordeiro-aa: #a70030;
  --mr-cat-frios: #ce6933;
  --mr-cat-frios-aa: #a84f1e;
  --mr-cat-vegetal: #a0b340;
  --mr-cat-vegetal-aa: #5c6e18;
  --mr-cat-doces: #b352af;
  --mr-cat-doces-aa: #8e378b;
  --mr-cat-paes: #946932;
  --mr-cat-paes-aa: #7d5726;

  /* === SEMÂNTICA, VALIDAÇÕES & TOASTS (WCAG AA) === */
  --mr-success-bg: #edf9f1;
  --mr-success-border: #2e8555;
  --mr-success-text: #134e2e;
  --mr-error-bg: #fef1f1;
  --mr-error-border: #d92d20;
  --mr-error-brand-red: #e12d2d;
  --mr-error-text: #8a1f1b;
  --mr-warning-bg: #fff8eb;
  --mr-warning-border: #d97706;
  --mr-warning-icon: #b45309;
  --mr-warning-text: #78350f;
  --mr-info-bg: #faf5f3;
  --mr-info-border: #ce5032;
  --mr-info-text: #3f3e3d;

  /* === GRADIENTES & OVERLAYS === */
  --mr-overlay-hero: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
  --mr-overlay-card: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%);
  --mr-overlay-newsletter: linear-gradient(to top, rgba(190, 72, 16, 0.29), rgba(190, 72, 16, 0.29));
  --mr-overlay-cta-warm: linear-gradient(rgba(80, 60, 60, 0), rgba(80, 60, 60, 0.6));
  --mr-overlay-modal-backdrop: rgba(0, 0, 0, 0.5);
  --mr-gradient-search-banner: radial-gradient(circle, rgb(254, 147, 0), rgb(241, 64, 0));
  --mr-gradient-hero-progress: linear-gradient(90deg, #ff8f1c, #ce5032);

  /* === SKELETONS === */
  --mr-skeleton-base: #f3f4f6;
  --mr-skeleton-highlight: #faf5f3;

  /* === ESPAÇAMENTOS & CONTAINERS === */
  --mr-space-1: 4px;
  --mr-space-2: 8px;
  --mr-space-3: 12px;
  --mr-space-4: 16px;
  --mr-space-5: 20px;
  --mr-space-6: 24px;
  --mr-space-7: 28px;
  --mr-space-8: 32px;
  --mr-space-12: 48px;
  --mr-space-16: 64px;

  --mr-container-header: 1478px;
  --mr-container-wrap: 1440px;
  --mr-container-wide: 1280px;
  --mr-container-footer: 1200px;
  --mr-container-hero: 1152px;
  --mr-container-content: 1024px;
  --mr-container-prose: 672px;
  --mr-container-newsletter: 640px;
  --mr-modal-sm: 400px;
  --mr-modal-md: 575px;

  /* === RAIOS & SOMBRAS === */
  --mr-radius-none: 0px;
  --mr-radius-2xs: 2px;
  --mr-radius-xs: 4px;
  --mr-radius-sm: 6px;
  --mr-radius-md: 8px;
  --mr-radius-lg: 12px;
  --mr-radius-xl: 16px;
  --mr-radius-2xl: 24px;
  --mr-radius-3xl: 32px;
  --mr-radius-full: 9999px;

  --mr-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --mr-shadow-fav: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  --mr-shadow-nav: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  --mr-shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --mr-shadow-badge: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --mr-shadow-toast: 0 10px 30px 0 rgba(0, 0, 0, 0.15);
  --mr-shadow-banner: 0 0 18px 0 rgba(0, 0, 0, 0.2);
  --mr-shadow-modal: 0 10px 30px 0 rgba(0, 0, 0, 0.3);
  --mr-shadow-ring-white: 0 0 0 3px #ffffff;

  /* === CAMADAS Z-INDEX === */
  --mr-z-base: 1;
  --mr-z-overlay-content: 2;
  --mr-z-card-control: 10;
  --mr-z-hero-content: 20;
  --mr-z-header: 30;
  --mr-z-dropdown: 40;
  --mr-z-search-overlay: 50;
  --mr-z-drawer: 60;
  --mr-z-floating: 100;
  --mr-z-modal-backdrop: 1000;
  --mr-z-modal: 1010;
  --mr-z-toast: 10000;

  /* === MOVIMENTO === */
  --mr-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --mr-duration-fast: 150ms;
  --mr-duration-normal: 200ms;
  --mr-duration-slow: 300ms;
  --mr-duration-hero-fade: 1000ms;
  --mr-duration-shimmer: 1500ms;
}

/* === BASE LIMPA & FOCO ACESSÍVEL === */
body {
  font-family: var(--mr-font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: var(--mr-text-primary);
  background-color: var(--mr-surface-default);
}

:is(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--mr-terracotta-hover);
  outline-offset: 2px;
}

.mr-surface-dark :is(a, button, input, select, textarea):focus-visible,
.mr-header :is(a, button, input):focus-visible {
  outline-color: var(--mr-text-inverse);
}

/* === SKELETON SHIMMER === */
@keyframes mr-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.mr-skeleton {
  background: linear-gradient(
    90deg,
    var(--mr-skeleton-base) 0%,
    var(--mr-skeleton-highlight) 50%,
    var(--mr-skeleton-base) 100%
  );
  background-size: 200% 100%;
  animation: mr-shimmer var(--mr-duration-shimmer) infinite linear;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 8.3 Checklist Prático de Revisão de UI (Devs & Agentes)

- [ ] **Fontes:** `Lufga` carregada apenas nos pesos `300–700`; zero referências a `Inter` ou `--eko-*`.
- [ ] **Cascata CSS:** Nenhuma regra global em tag nua (`h2`, `h3`) sobrescreve cores ou tamanhos de componentes/utilitários.
- [ ] **Contraste WCAG AA:** Todo texto `12px–16px` atinge `>= 4.5:1` (pílulas de categoria, badges `#B03D1F`, toasts, labels de erro, placeholders `#6B7280`).
- [ ] **Foco & Teclado:** Todo controle interativo possui `:focus-visible` visível (`2px solid`, `offset 2px`), modais têm botão `X` + fechamento por `Esc` + focus trap, e dropdown/drawer operam por teclado.
- [ ] **Estados completos:** Botões cobrem `default`, `:hover`, `:focus-visible`, `:active`, `:disabled` e `loading`; listas carregam via Skeletons shimmer; buscas sem resultado exibem Empty State acionável.
- [ ] **Feedbacks:** Ações assíncronas (favoritar, copiar link, salvar, erros de rede) disparam Toast padronizado (`role="status"` / `role="alert"`) respeitando `prefers-reduced-motion`.
- [ ] **Dados & Mídia:** Imagens usam `aspect-ratio` (`16/9`, `3/2`, `4/3`) + `object-fit: cover`; separadores `"•"` em cards só são renderizados quando há dois metadados válidos; zero overflow horizontal em `390px`.
