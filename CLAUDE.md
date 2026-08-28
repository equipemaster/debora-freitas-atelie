# CLAUDE.md — Débora Freitas Ateliê · Editor de Vídeo

> Documento-guia do projeto. Serve como fonte de verdade para arquitetura, identidade
> visual, modelo de dados, convenções e roadmap. Atualize-o sempre que uma decisão
> estrutural mudar. Escrito em PT-BR; código e identificadores em inglês.

---

## 1. Visão geral

Aplicativo **web** de **edição de vídeo profissional**, no espírito do CapCut, porém
**dedicado a um ateliê de alta costura** — a marca **Débora Freitas Ateliê**.

O objetivo não é competir com editores genéricos, e sim entregar um fluxo curto e
guiado para o ateliê produzir vídeos com acabamento editorial a partir de gravações
de provas, desfiles, bastidores e croquis, sempre dentro da identidade da marca.

### Casos de uso (todos priorizados pela cliente)

| # | Caso de uso | O que o app precisa entregar |
|---|-------------|------------------------------|
| 1 | **Vídeos para redes sociais** | Reels/Stories 9:16 e 1:1, legendas, música, template de marca (abertura/encerramento com logo), exportação rápida. |
| 2 | **Apresentação para clientes** | Vídeos de looks/provas organizados por cliente e coleção, link de revisão, comentários com marcação de tempo e aprovação. |
| 3 | **Catálogo / lookbook** | Montagem de fotos + clipes curtos, transições, cartelas com ficha técnica da peça (tecido, bordado, medidas). |
| 4 | **Portfólio / making-of** | Vídeos mais longos do processo: croqui → modelagem → prova → peça final. Requer render mais pesado (fase posterior). |

### Princípios

- **Didático acima de tudo.** Toda tela tem estado vazio explicativo, cada ícone tem
  rótulo/tooltip, e existe um **Modo Assistido** (assistente passo a passo) além do
  **Modo Avançado**. Nada de jargão de edição sem explicação.
- **Edição semi-automática por perguntas.** O caminho padrão não é "monte a timeline
  do zero": o app agrupa os clipes por **cena/take**, pergunta *"qual take você quer
  usar nesta cena?"* (comparando miniaturas lado a lado) e *"qual música?"*, e então
  **monta o vídeo sozinho** — ordem, cortes no tempo da batida, abertura/encerramento
  da marca. O resultado é editável depois no Modo Avançado. Ver seção 7.
- **PT-BR em toda a interface.** Strings centralizadas em `src/lib/i18n`.
- **Identidade da marca é lei.** Paleta, tipografia e templates de abertura/
  encerramento são aplicados por padrão a todo projeto novo.
- **Client-first.** O editor roda no navegador; o servidor entra só onde é
  inevitável (render pesado, transcrição, acesso público a links de revisão).

---

## 2. Identidade visual

Cores da marca definidas pela cliente: **preto e branco**. Sem cor de acento.
Hierarquia se faz por **peso tipográfico, escala, filetes de 1px e inversão**
(preenchimento preto / texto branco).

### Tokens de cor

| Token | Hex | Uso |
|-------|-----|-----|
| `--paper` | `#FAFAF8` | Fundo das telas de gestão (branco quente) |
| `--ink` | `#0A0A0A` | Texto principal, preenchimentos |
| `--ink-pure` | `#000000` | Contraste máximo, logo |
| `--white-pure` | `#FFFFFF` | Texto sobre preto, superfícies elevadas |
| `--surface-editor` | `#0F0F0F` | Fundo do workspace do editor (modo "câmara escura") |
| `--gray-900` | `#141414` | |
| `--gray-800` | `#1F1F1F` | Painéis do editor |
| `--gray-700` | `#2E2E2E` | Bordas no modo escuro |
| `--gray-500` | `#6B6B6B` | Texto secundário |
| `--gray-300` | `#C9C7C2` | Ícones desabilitados |
| `--gray-200` | `#E4E2DD` | Filetes/divisores no modo claro |
| `--gray-100` | `#F1EFEA` | Fundo de blocos, hover |
| `--danger` | `#B4231F` | **Exceção documentada ao P&B**: só para erro/ação destrutiva, sempre com ícone + texto, nunca decorativo. |

- Telas de **gestão** (painel, clientes, coleções, marca): fundo `--paper`, texto `--ink`.
- **Editor**: fundo `--surface-editor`, texto `--white-pure` — contraste ajuda no
  julgamento de cor do vídeo.

### Tipografia

| Papel | Fonte | Observações |
|-------|-------|-------------|
| Display / títulos | **Cormorant Garamond** (serifada) | Caixa alta com tracking generoso nos rótulos de seção, ecoando o logotipo. |
| Interface / corpo | **Inter** | Pesos 400/500/600. Números tabulares no editor (timecodes). |
| Mono (timecode, dados técnicos) | **Geist Mono** ou `ui-monospace` | |

Fontes carregadas via `next/font` (self-host, sem FOUT).

### Layout

- Muito espaço em branco, grade de 8px, filetes de 1px `--gray-200`.
- Cabeçalhos editoriais grandes; rótulos de seção em versalete/caixa alta.
- Respeita `prefers-reduced-motion`. Animações via Framer Motion, discretas.

### Logo

Arquivo enviado é branco sobre transparente ("DÉBORA DF FREITAS · ATELIÊ"). Guardar
em `brand` bucket. Precisamos de **versão preta** para fundo claro — solicitar à
cliente ou derivar. Marca d'água/abertura usam a versão que contrasta com o vídeo.

---

## 3. Stack técnica

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript strict** | SSR para gestão, ilha client para o editor, rotas de API para render/links. |
| Estilo | **Tailwind CSS v4** (config CSS-first) + **shadcn/ui** (Radix) | Sistema de design consistente e acessível; tokens P&B em `styles/tokens.css`. |
| Estado do editor | **Zustand** (`editorStore`, `playbackStore`) | Store previsível, fácil de serializar para autosave. |
| Estado de servidor | **TanStack Query** | Cache/revalidação das consultas Supabase. |
| Validação | **Zod** | Schema do JSON da timeline + parsing de tipos do Supabase. |
| Banco / Auth / Storage / Realtime | **Supabase** (Postgres + RLS) | Requisito da cliente. Tipos via `supabase gen types`. |
| Animação | **Framer Motion** | |
| Testes | **Vitest** (lógica de engine/model) + **Playwright** (fluxos críticos) | |
| Gerenciador de pacotes | **pnpm** | |
| Hospedagem | **Vercel** (a confirmar) | Combina com Next.js; Edge Functions ficam no Supabase. |

### Motor de edição no navegador

- **Preview / composição:** compositor próprio desenhando o frame atual em
  `OffscreenCanvas` (WebGL2, com caminho WebGPU quando disponível). Vídeo decodificado
  via `HTMLVideoElement` para scrubbing e via **WebCodecs `VideoDecoder`** quando for
  preciso precisão de frame. Áudio pela **Web Audio API** (grafo de `AudioContext`,
  ganho, ducking).
- **Relógio:** clock central em `lib/editor/engine/clock.ts` sincroniza vídeo, áudio
  e playhead.
- **Modelo da timeline:** faixas (`video` / `text` / `overlay` / `audio`), cada clipe
  `{ assetId, inPoint, outPoint, start, duration, transform, effects[], transition }`.
  Fonte de verdade = **JSONB `projects.timeline`** (com `timeline_version`), salvo por
  autosave com debounce. Sem normalizar em tabelas por enquanto.
- **Exportação (render):**
  1. **MVP — `@ffmpeg/ffmpeg` (WASM) em Web Worker.** Monta o filtergraph a partir da
     timeline. Aceitável para ≤ ~2 min em 1080p. 100% client-side.
  2. **Fase 3 — WebCodecs `VideoEncoder` + `mp4-muxer`.** Codifica os frames do canvas
     em tempo quase real, muxa o áudio. Muito mais rápido, usa GPU.
  3. **Fase 5 — render no servidor** (container ffmpeg acionado por Edge Function +
     tabela de fila `renders`) para making-of longo e 4K.
- **Templates de marca:** presets JSON (abertura com revelação do logo, lower-thirds,
  cartela de título, cartela final com contato). Renderizados pelo mesmo compositor.

---

## 4. Arquitetura

```
Navegador (Next.js client island)
  ├─ Editor: Zustand + compositor Canvas/WebGL + Web Audio + Worker de export
  ├─ Gestão: Server Components + TanStack Query → Supabase JS (anon key, RLS)
  └─ Upload direto → Supabase Storage (URLs assinadas)

Next.js server (Route Handlers)
  ├─ /api/renders            → cria job, retorna progresso (fase 5: enfileira)
  └─ auth/session helpers    → @supabase/ssr

Supabase
  ├─ Postgres + RLS (tudo escopado por org_id)
  ├─ Storage: media / thumbnails / renders / brand  (todos privados)
  ├─ Edge Functions:
  │    ├─ review-access   → valida token do link e devolve URLs assinadas (service role)
  │    ├─ request-render  → (fase 5) dispara worker de render
  │    └─ transcribe      → (fase 3) legendas automáticas
  └─ Realtime: (fase 5) colaboração e status de render
```

Acesso público (cliente revisando um vídeo) **nunca** usa RLS aberta: passa sempre
pela Edge Function `review-access`, que valida o `token` e responde com URLs
assinadas + payload somente-leitura.

---

## 5. Modelo de dados (Postgres / Supabase)

Todas as tabelas de domínio têm `org_id uuid not null` e `created_at timestamptz default now()`.
Uma organização = o ateliê (multi-org fica preparado no schema, ativado depois).

| Tabela | Campos principais |
|--------|-------------------|
| `organizations` | `id`, `name`, `brand_kit_id` |
| `profiles` | `id` → `auth.users`, `org_id`, `full_name`, `role` (`owner`\|`editor`\|`assistant`\|`viewer`), `onboarding_state jsonb` |
| `brand_kits` | `id`, `org_id`, `logo_light_path`, `logo_dark_path`, `palette jsonb`, `fonts jsonb`, `intro_template jsonb`, `outro_template jsonb` |
| `clients` | `id`, `org_id`, `name`, `contact jsonb`, `notes` |
| `collections` | `id`, `org_id`, `name`, `season`, `year`, `description`, `cover_path` |
| `projects` | `id`, `org_id`, `title`, `kind` (`social`\|`client_presentation`\|`lookbook`\|`making_of`), `client_id?`, `collection_id?`, `status` (`draft`\|`in_review`\|`approved`\|`exported`), `aspect_ratio`, `resolution`, `timeline jsonb`, `timeline_version int`, `wizard_answers jsonb` (respostas de take/música do assistente — reaberto e editável), `duration_ms`, `thumbnail_path`, `created_by`, `updated_at` |
| `media_assets` | `id`, `org_id`, `project_id?`, `kind` (`video`\|`image`\|`audio`), `scene_tag text?` (agrupa takes da mesma cena; sugerido por nome do arquivo/horário, editável), `take_number int?`, `storage_path`, `poster_path`, `width`, `height`, `duration_ms`, `size_bytes`, `checksum`, `created_by` |
| `templates` | `id`, `org_id?` (null = embutido), `name`, `kind`, `preview_path`, `data jsonb` |
| `renders` | `id`, `project_id`, `requested_by`, `status` (`queued`\|`processing`\|`done`\|`error`), `progress`, `output_path`, `engine` (`ffmpeg_wasm`\|`webcodecs`\|`server`), `error_text`, `started_at`, `finished_at` |
| `review_links` | `id`, `project_id`, `token` (aleatório, único), `expires_at`, `allow_comments bool`, `created_by` |
| `comments` | `id`, `project_id`, `review_link_id?`, `author_name`, `body`, `timecode_ms?`, `resolved bool`, `created_at` |
| `approvals` | `id`, `project_id`, `review_link_id?`, `decision` (`approved`\|`changes_requested`), `note`, `decided_by_name` |
| `activity_log` | `id`, `org_id`, `actor`, `entity`, `entity_id`, `action`, `meta jsonb` |

### RLS (padrão)

```sql
-- leitura/escrita só dentro da própria organização
using ( org_id in (select org_id from profiles where id = auth.uid()) )
-- operações destrutivas exigem role in ('owner','editor')
```

`comments`/`approvals` vindos de link público **não** são inseridos direto pelo
cliente: entram pela Edge Function `review-access` com service role, após validar o token.

### Storage buckets (todos privados, acesso por URL assinada)

`media/` · `thumbnails/` · `renders/` · `brand/`
Convenção de caminho: `{org_id}/{project_id}/{asset_id}.{ext}`.

---

## 6. Estrutura de pastas

```
debora-freitas-atelie/
├─ CLAUDE.md                     ← este arquivo
├─ README.md
├─ .env.local.example
├─ package.json  tsconfig.json  next.config.ts
├─ supabase/
│  ├─ migrations/                ← SQL versionado
│  ├─ functions/review-access/   ← + request-render/, transcribe/ (fases seguintes)
│  └─ seed.sql                   ← templates embutidos, org demo
└─ src/
   ├─ app/
   │  ├─ (marketing)/page.tsx
   │  ├─ (app)/
   │  │  ├─ layout.tsx
   │  │  ├─ painel/               ← dashboard
   │  │  ├─ projetos/
   │  │  │  ├─ page.tsx
   │  │  │  └─ [id]/editor/page.tsx
   │  │  ├─ clientes/  colecoes/  modelos/
   │  │  └─ marca/                ← brand kit
   │  ├─ review/[token]/page.tsx  ← revisão do cliente (público)
   │  └─ api/renders/route.ts
   ├─ components/
   │  ├─ ui/                      ← shadcn
   │  ├─ editor/{Timeline,Preview,Inspector,MediaBin,Toolbar,GuidedMode}/
   │  └─ brand/
   ├─ lib/
   │  ├─ supabase/{client,server,middleware}.ts
   │  ├─ editor/
   │  │  ├─ engine/               ← compositor, clock, audio-graph
   │  │  ├─ export/               ← ffmpeg-wasm.worker.ts, webcodecs-encoder.ts
   │  │  ├─ model/                ← tipos + schema Zod da timeline
   │  │  └─ templates/            ← presets de abertura/encerramento/cartelas
   │  └─ i18n/                    ← strings pt-BR
   ├─ hooks/   stores/   styles/
   └─ types/                      ← database.types.ts (gerado)
```

---

## 7. Fluxos principais

### Modo Assistido — edição semi-automática por perguntas (padrão para quem chega)

O assistente não pede para "montar uma timeline": ele faz perguntas objetivas e monta
o vídeo. Passo a passo:

1. **Projeto** — escolher caso de uso (redes / cliente / lookbook / making-of),
   cliente e coleção. O formato (9:16, 1:1, 16:9) já vem sugerido pelo caso de uso.
2. **Mídia** — importar todos os clipes/fotos da gravação de uma vez (arrastar e
   soltar). O app agrupa automaticamente por **cena** (`scene_tag`, sugerido por
   nome de arquivo/horário de gravação, sempre reagrupável à mão) e detecta quando
   há **mais de um take** da mesma cena.
3. **"Qual take?"** — para cada cena com mais de um take, o assistente mostra as
   miniaturas lado a lado (com duração e um preview de 1 clique) e pergunta
   **qual take usar**. Uma cena por vez, com opção "usar os dois" para trechos que
   se complementam. Respostas ficam em `projects.wizard_answers` e são reabríveis.
4. **"Qual música?"** — biblioteca da marca ou upload; preview com faixa já
   sincronizada à duração estimada do corte. Pergunta também o clima (ex.: "elegante
   e lenta" / "energética") para sugerir o corte no tempo da batida.
5. **Marca e texto** — cartelas de título, legendas automáticas (fase 3) e ficha
   técnica da peça; abertura/encerramento da marca entram sozinhos, sem pergunta.
6. **Montagem automática** — com as respostas dos passos 3–5, o app gera a
   `timeline` inteira (ordem das cenas, cortes no tempo da música, ducking do áudio
   original, aplicação do template de marca) e mostra o preview pronto.
7. **Ajuste fino (opcional)** — o resultado abre no **Modo Avançado**, onde qualquer
   corte/ordem/take pode ser trocado manualmente sem refazer o assistente.
8. **Exportar** — resolução + formato, barra de progresso, download e/ou gerar
   link de revisão.

Cada passo tem texto curto de ajuda e só libera o próximo quando o mínimo está feito.
`profiles.onboarding_state` guarda o progresso e dispensa a ajuda quando dominado.
A lógica de montagem automática vive em `lib/editor/model/auto-assembly.ts` (pura,
testável: `wizard_answers` + `media_assets` → `timeline`).

### Apresentação para o cliente

`Projeto → Gerar link de revisão` cria `review_links.token`. A página
`/review/[token]` (sem login) mostra o vídeo (URLs assinadas via Edge Function),
aceita comentários com marcação de tempo e um botão **Aprovar / Pedir ajustes**,
que grava em `approvals` e move `projects.status`.

---

## 8. Convenções de código

- **TypeScript strict**, sem `any`. Tipos do banco gerados: `pnpm gen:types`.
- **Server Components por padrão**; `"use client"` só nas ilhas interativas (editor).
- **Zod** valida todo JSON de timeline na entrada/saída e todo payload de API.
- **i18n:** nenhuma string PT-BR solta em componente — tudo em `src/lib/i18n`.
- **Acessibilidade:** editor navegável por teclado, ARIA em controles custom,
  foco visível, `prefers-reduced-motion` respeitado.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`…), descrição em PT ok.
- **Nomes:** arquivos de componente em `PascalCase`, hooks `useX`, stores `xStore`.
- **Migrations:** uma migration por mudança, nome `NNNN_descricao.sql`, nunca editar
  migration já aplicada.
- **Segredos:** só service role no servidor; nunca no bundle client.

---

## 9. Setup e comandos

```bash
pnpm install
cp .env.local.example .env.local     # preencher chaves do Supabase
pnpm supabase start                  # stack local (Docker)
pnpm supabase db push                # aplica migrations
pnpm gen:types                       # types/database.types.ts
pnpm dev                             # http://localhost:3000
pnpm test        pnpm test:e2e
pnpm lint        pnpm typecheck
```

### Variáveis de ambiente (`.env.local`)

| Var | Escopo | Descrição |
|-----|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | chave anônima (RLS ativa) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Edge Functions / rotas de API |
| `NEXT_PUBLIC_APP_URL` | client | base para montar links de revisão |

---

## 10. Roadmap

| Fase | Entrega |
|------|---------|
| **0 · Fundação** | Scaffold Next.js, projeto Supabase + migrations, auth, sistema de design P&B, i18n, tela de Marca (brand kit). |
| **1 · Biblioteca** | Upload para Storage, thumbnails, organização por cliente/coleção, CRUD de projetos, painel. |
| **2 · Editor base (Modo Assistido)** | Agrupamento por cena/take, assistente de perguntas ("qual take?"/"qual música?"), montagem automática da timeline, Modo Avançado para ajuste fino, abertura/encerramento da marca, **export ffmpeg.wasm** (1080p; 9:16, 1:1, 16:9). |
| **3 · Editor avançado** | Múltiplas faixas, transições, keyframes de transform, filtros/LUTs P&B, ducking de áudio, legendas automáticas (Edge Function `transcribe`), **export WebCodecs**. |
| **4 · Cliente** | Links de revisão, comentários com timecode, aprovação, lookbook com ficha técnica. |
| **5 · Escala** | Render no servidor (making-of longo / 4K), versionamento de projeto, colaboração em tempo real, templates compartilhados. |

---

## 11. Decisões

### Resolvidas

1. **Export do MVP:** `ffmpeg.wasm`.
2. **Backend:** Supabase. **Projeto próprio e isolado** (não reaproveita o projeto
   `gestao-de-projetos-resitrat`, que é produção ativa de outro sistema na mesma
   organização `equipemaster's Org` e colidiria de nome em `public.projects`/
   `public.clients`/`public.activity_log`). **A cliente vai criar o projeto Supabase
   manualmente e repassar URL + chaves** — ver pendência na seção 11.
3. **Região do Supabase:** `sa-east-1` (São Paulo) — a mais próxima de Aparecida de
   Goiânia/GO disponível (Supabase não tem datacenter em Goiás).
4. **Código-fonte:** GitHub, sob a conta/organização **`equipemaster`**.
5. **Deploy:** Vercel conectado ao repositório do GitHub (build automático a cada
   push na branch principal) — a confirmar se `equipemaster` já tem conta Vercel.
6. **Edição semi-automática:** o Modo Assistido pergunta **take** (quando há mais de
   uma gravação da mesma cena) e **música**, e monta a timeline sozinho — ver seção 7.

### Ainda em aberto

1. **Repositório GitHub:** este ambiente não tem `gh` CLI instalado nem conector
   GitHub disponível — não consigo criar o repositório sozinho. **Ação da sua
   parte:** criar um repositório vazio em `github.com/equipemaster/`
   (proposta de nome: `debora-freitas-atelie`, **privado** por padrão) e me passar a
   URL — eu conecto o remoto local e faço o primeiro push.
2. **Projeto Supabase:** você vai criar manualmente (região São Paulo/`sa-east-1`,
   organização `equipemaster's Org` ou outra dedicada) e me repassar
   `NEXT_PUBLIC_SUPABASE_URL`, a chave publicável (anon/publishable) e a
   `service_role` key (esta última nunca deve ir para o repositório — só
   `.env.local`, que fica no `.gitignore`). Até lá, sigo o scaffold do app com
   variáveis de ambiente de exemplo, sem banco real.
2. **Legendas automáticas:** provedor de transcrição não definido (Whisper/OpenAI?
   modelo local?). Nenhum provedor de LLM foi escolhido ainda.
3. **Versão preta do logo:** o arquivo enviado é branco sobre transparente; vou
   derivar uma versão preta automaticamente (inversão) até receber a arte oficial
   da cliente. Fontes exatas da marca (Cormorant/Inter são proposta nossa).
4. **Multi-organização** agora ou só schema preparado (schema já vem preparado).
5. **Biblioteca de música** — licenciada por nós ou só upload da cliente.
6. **Detecção de cena/take:** por enquanto, agrupamento sugerido por nome de
   arquivo/horário de gravação (heurística simples). Análise de conteúdo do vídeo
   (visão computacional) fica como melhoria futura, fora do MVP.

---

## 12. Estado atual

- [x] Requisitos coletados (cores: preto e branco; 4 casos de uso priorizados;
      edição semi-automática por take/música).
- [x] `CLAUDE.md` (este documento).
- [x] Infra decidida: Supabase (`sa-east-1`, projeto isolado), GitHub (`equipemaster`), Vercel.
- [ ] Repositório GitHub criado (pendente: você cria e me passa a URL) e primeiro push.
- [ ] Projeto Supabase criado (pendente: você cria e me passa URL + chaves) + migrations aplicadas.
- [ ] Fase 0 — Fundação (scaffold Next.js) — em andamento.
