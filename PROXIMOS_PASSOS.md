# TFT Companion Overlay para Mac -- Proximos Passos

## 1. Registrar no Riot Developer Portal

- Criar conta em: https://developer.riotgames.com
- Solicitar **Production API Key** (a chave de desenvolvimento tem rate limit baixo)
- Ler e aceitar os **Terms of Service** da API
- O processo de aprovacao da Production Key pode levar semanas
- Preparar uma descricao clara do projeto para a submissao

## 2. Escolher a Stack

Comparar trade-offs entre as opcoes:

| Opcao | Framework | Pros | Contras |
|-------|-----------|------|---------|
| **A - Nativo** | Swift + SwiftUI + AppKit | Performance nativa, melhor integracao macOS, overlay estavel | Curva de aprendizado Swift, nao portavel para Windows |
| **B - Cross-platform** | Electron + React + TypeScript | JS/TS acessivel, futuro port Windows, ecossistema npm | Maior consumo RAM (~150MB+), micro-stutters no overlay |
| **C - Hibrida** | Tauri v2 + React + Rust | Leve (~10-20MB), boa performance, seguro, multiplataforma | Curva de aprendizado Rust, ecossistema Tauri amadurecendo |

## 3. Criar o CLAUDE.md

Criar o arquivo `CLAUDE.md` na raiz do projeto com o briefing permanente do projeto, incluindo:

- Descricao do projeto
- Stack escolhida
- Regras de compliance da Riot Games
- Arquitetura de pastas
- Convencoes de codigo
- Variaveis de ambiente
- Comandos uteis

## 4. Scaffold com Claude Code

Usar Claude Code para gerar toda a estrutura inicial do projeto:

- Estrutura de pastas completa (`src/main/`, `src/renderer/`, `src/shared/`)
- Configuracao de Tailwind, Zustand, Vitest, ESLint, Prettier
- `package.json` com todos os scripts necessarios
- Arquivos placeholder para cada modulo da arquitetura
- Configuracao da janela overlay transparente para macOS

## 5. Implementar Conexao LCU

Criar o modulo `lcu-connector.ts` que:

- Encontra o lockfile do League Client no macOS
- Extrai porta e token das credenciais
- Estabelece conexao HTTPS com certificado self-signed
- Conecta via WebSocket para eventos em tempo real
- Inclui reconexao automatica e tratamento de erros

## 6. Overlay "Hello World"

Criar janela overlay basica funcionando sobre o jogo:

- Janela transparente, always-on-top, click-through
- Visivel em fullscreen/borderless
- Toggle interatividade (Cmd+Shift+T)
- Mostrar/esconder (Cmd+Shift+H)
- Testar renderizacao sobre outros apps

## 7. Buscar Data Dragon

Cachear dados do set atual do TFT:

- Campeoes: `/cdn/{version}/data/pt_BR/tft-champion.json`
- Itens: `/cdn/{version}/data/pt_BR/tft-item.json`
- Traits: `/cdn/{version}/data/pt_BR/tft-trait.json`
- Imagens de campeoes e itens
- Auto-update quando novo patch for detectado

## 8. Iterar Features do MVP

Adicionar features do MVP (v0.1) uma a uma:

- [ ] Deteccao automatica de partida em andamento
- [ ] Exibir composicoes meta (tier list) como overlay
- [ ] Sugestao de itens por campeao
- [ ] Tracker de economia (ouro, nivel, XP)
- [ ] Mostrar probabilidades de roll por nivel
