# TFT Companion Overlay para macOS

## Sobre o Projeto

App de overlay para Teamfight Tactics (TFT) no macOS que exibe dados em tempo real
durante partidas para ajudar jogadores a subir de elo.
Tudo em conformidade com as politicas da Riot Games.

## Stack

- Framework: Tauri v2 (Rust backend)
- Frontend: React + TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- APIs: Riot Games API, LCU API, Data Dragon
- Testes: Vitest + Playwright
- Linting: ESLint + Prettier

## Regras de Compliance (Riot Games)

- NUNCA gerar codigo que modifique arquivos do jogo
- NUNCA gerar codigo que automatize acoes do jogador
- NUNCA gerar codigo que leia memoria do processo do jogo
- Apenas ler dados via LCU API (local) e Riot API (remota)
- Overlay deve ser uma janela separada, sem injecao no cliente

## Arquitetura

```
src/
  main/              # Backend Rust (Tauri commands)
    lcu-connector    # Conexao com League Client
    riot-api         # Chamadas a Riot API
    data-engine      # Processamento de dados
  renderer/          # Frontend React
    components/
      overlay/       # Componentes do overlay in-game
      dashboard/     # Componentes do app principal
    hooks/           # Custom React hooks
    stores/          # Estado global (Zustand)
    styles/          # CSS/Tailwind
    App.tsx
  shared/            # Tipos e utilidades compartilhadas
    types/
      champion.ts
      item.ts
      composition.ts
      game-state.ts
    constants/
      roll-odds.ts
      item-recipes.ts
assets/              # Icones, imagens
data/                # Dados estaticos (Data Dragon cache)
tests/               # Testes
```

## Convencoes de Codigo

- TypeScript strict mode
- Componentes React como funcoes com hooks
- Nomes de arquivos em kebab-case
- Nomes de componentes em PascalCase
- Commits em portugues no formato: "feat: adiciona tracker de ouro"
- Comentarios em codigo em portugues
- Imutabilidade sempre (nunca mutar objetos)
- Funcoes pequenas (<50 linhas)
- Arquivos focados (<800 linhas)

## Variaveis de Ambiente

- RIOT_API_KEY -> Chave da Riot Games API
- NODE_ENV -> development | production
- VITE_DEV_SERVER_URL -> URL do dev server (desenvolvimento)

## Comandos Uteis

- `npm run dev` -> Inicia em modo desenvolvimento
- `npm run build` -> Builda pra producao
- `npm test` -> Roda testes
- `npm run lint` -> Verifica codigo
- `npm run tauri dev` -> Inicia app Tauri em dev
- `npm run tauri:build` -> Build do app Tauri
- `npm run tauri:build:aarch64` -> Build Apple Silicon
- `npm run tauri:build:x86_64` -> Build Intel Mac

## Build e Distribuicao

### Auto-updater
- Plugin: tauri-plugin-updater + tauri-plugin-process
- Endpoint: GitHub Releases (latest.json gerado pelo tauri-action)
- Chave publica: configurada em tauri.conf.json
- Chave privada: ~/.tauri/tft-overlay.key (GitHub Secret: TAURI_SIGNING_PRIVATE_KEY)

### CI/CD
- CI: `.github/workflows/ci.yml` (push main / PRs)
- Release: `.github/workflows/release.yml` (tag v* / dispatch manual)
- Matrix: aarch64-apple-darwin + x86_64-apple-darwin
- Code signing/notarizacao Apple: opcional via GitHub Secrets

### GitHub Secrets necessarios
- TAURI_SIGNING_PRIVATE_KEY (obrigatorio para releases)
- TAURI_SIGNING_PRIVATE_KEY_PASSWORD (pode ser vazio)
- APPLE_CERTIFICATE (quando tiver Developer ID)
- APPLE_CERTIFICATE_PASSWORD
- APPLE_SIGNING_IDENTITY
- APPLE_ID (para notarizacao)
- APPLE_PASSWORD (app-specific password)
- APPLE_TEAM_ID

## Design System

- Tema escuro inspirado no universo LoL
- Cores de custo dos campeoes: 1-cinza, 2-verde, 3-azul, 4-roxo, 5-dourado
- Overlay: semi-transparente, minimalista, nao intrusivo
- Font principal: Inter
- Font mono: JetBrains Mono
