# TFT Companion Overlay para Mac — Proximos Passos

## Progresso Atual

### Concluido

- [x] **1. Registrar no Riot Developer Portal** — conta criada
- [x] **2. Escolher a Stack** — Tauri v2 + React 19 + TypeScript + Rust
- [x] **3. Criar o CLAUDE.md** — briefing permanente do projeto
- [x] **4. Scaffold com Claude Code** — estrutura completa do projeto
  - Tauri v2 com multi-window (dashboard + overlay)
  - React 19, Zustand, Tailwind, i18next
  - Design tokens inspirados no universo LoL
  - Tipos TypeScript imutaveis (readonly)
- [x] **5. Implementar Conexao LCU** — modulo Rust completo
  - Lockfile discovery (3 paths macOS)
  - REST client com self-signed cert
  - WebSocket WAMP 1.0 para eventos real-time
  - Reconnect com exponential backoff (1s→30s)
  - File watcher para lockfile (notify crate)
- [x] **6. Overlay "Hello World"** — janela transparente funcionando
  - Always-on-top, click-through, decorations off
  - CompTracker, RollOdds, GoldTracker components
  - Toggle via botao no dashboard
- [x] **7. Buscar Data Dragon** — cache Rust em disco
  - Fetch de campeoes/itens/traits do set atual
  - Dual locale (pt_BR + en_US) no startup
  - Cache em `app_data_dir/ddragon/`
  - Verificacao de nova versao a cada 30 min
  - Filtragem por set via prefix `TFT{N}_`
- [x] **8a. Deteccao automatica de partida** — auto show/hide overlay
  - LCU gameflow events (ChampSelect, InProgress)
  - Deteccao TFT via queue ID (1090, 1100, 1130, 1160)
  - Auto-show overlay ao entrar em partida TFT
  - Auto-hide ao sair da partida
  - Toggle "overlay automatico" no dashboard
- [x] **8b. Overlay com dados reais DDragon** — substituiu mocks
  - ChampionIcon com imagens DDragon reais + fallback
  - Sample comp deterministica a partir dos campeoes do set
  - useOverlayData() hook com source: 'preview' | 'live'
  - Loading/error states no overlay
  - Badge "Preview" para dados de exemplo
  - i18n completo (pt-BR + en-US)
- [x] **8c. Tracker de economia** — controle manual de nivel
  - Global shortcuts `[` / `]` para incrementar/decrementar nivel
  - Player level store (Zustand) com clamp 1-10
  - Tabela XP por nivel (xp-table.ts)
  - LevelControl component no overlay
  - Game session events (reset level on game start)
- [x] **8d. Composicoes meta (tier list)** — comps reais no overlay
  - Modulo Rust `metacomps/` (types, client, cache, events, manager)
  - Fallback JSON bundled com 5 comps exemplo (include_str!)
  - Cadeia de fallback: remoto → cache disco → bundled
  - Refresh automatico a cada 30 min
  - 3 Tauri commands (get_meta_comps, get_meta_comps_version, refresh_meta_comps)
  - Frontend: store, hook, enrich utility (mapeia IDs → dados DDragon)
  - TierList component renderiza ate 5 comps com CompTracker
  - useOverlayData retorna `comps[]` em vez de `comp` singular
- [x] **8e. Sugestao de itens por campeao** — itens DDragon inline
  - OverlayItem type + campo opcional em OverlayChampion
  - enrichMetaComps resolve coreItems → OverlayItem[] via DDragon
  - ItemIcon component (14px, borda gold, fallback letra)
  - Itens renderizados inline nas pills dos campeoes no CompTracker
  - Backward-compatible (items opcional, funciona sem parametro)
- [x] **9. Testes** — cobertura >90%
  - 133 testes TypeScript (17 arquivos de teste)
  - 24 testes Rust (inline nos modulos)
  - 93.61% cobertura de statements
  - Testes para: utilities, stores, constants, components overlay/dashboard
- [x] **10. Build e Distribuicao** — auto-updater + CI/CD
  - tauri-plugin-updater + tauri-plugin-process (Rust + npm)
  - Chave de assinatura gerada (pubkey no tauri.conf.json)
  - GitHub Releases como endpoint do updater
  - UpdateBanner component no dashboard
  - updater-store (Zustand) + use-updater hook
  - GitHub Actions: ci.yml (PR/main) + release.yml (tags v*)
  - Matrix build: aarch64-apple-darwin + x86_64-apple-darwin
  - Code signing/notarizacao Apple: opcional via GitHub Secrets
  - Repo: git@github.com:GuiRCosta/tft.git
- [x] **11. URL do JSON remoto** (parcial)
  - URL atualizada em `client.rs`: `GuiRCosta/tft/main/meta-comps.json`
  - Pendente: criar o arquivo `meta-comps.json` no repo

---

### Pendente

- [ ] **11b. Publicar meta-comps.json no repo** ← PROXIMO
  - Criar `meta-comps.json` na raiz do repo GitHub com dados reais
  - Opcional: GitHub Action para atualizar comps periodicamente
- [ ] **12. Apple Developer ID + Notarizacao**
  - Obter Apple Developer ID ($99/ano)
  - Exportar certificado .p12, configurar GitHub Secrets
  - Ativar signing + notarizacao nos workflows
- [ ] **13. Primeira release**
  - Push para GitHub + criar tag v0.1.0
  - Configurar TAURI_SIGNING_PRIVATE_KEY no GitHub Secrets
  - Testar pipeline de release completo

---

## Arquitetura Atual

```
src-tauri/src/
  lcu/           — Conexao LCU (lockfile, credentials, REST, WebSocket, manager, session, game_tracker)
  ddragon/       — Data Dragon (client, cache, filter, types, events, manager)
  metacomps/     — Meta Comps (client, cache, types, events, error, manager)
  lib.rs         — Tauri commands + state management + setup

src-tauri/data/
  meta-comps-fallback.json  — Fallback bundled (5 comps)

src/
  components/
    overlay/           — OverlayApp, TierList, CompTracker, RollOdds, LevelControl, GoldTracker, ChampionIcon, ItemIcon
    dashboard/         — UpdateBanner
  hooks/               — use-lcu-events, use-ddragon, use-meta-comps, use-auto-overlay, use-overlay-data,
                         use-connection-status, use-level-shortcuts, use-game-session-events, use-updater
  stores/              — game-store, ddragon-store, player-level-store, meta-comps-store, updater-store (Zustand)
  shared/
    types/             — champion, composition, game-state, lcu-events, ddragon, meta-comps
    utils/             — ddragon-lookup, sample-comp, enrich-comps
    design/            — tokens
    constants/         — roll-odds, item-recipes, xp-table
    i18n/              — pt-BR, en-US
```
