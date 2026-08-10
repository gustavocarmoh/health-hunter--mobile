# Solo Leveling Lifestyle — Mobile App

Aplicativo mobile gamificado de fitness e saúde, construído com **React Native + Expo** integrado a backend **NestJS**, com suporte a **AI Mentor em tempo real** (Google Gemini + SSE streaming).

## 📱 Características

- **Autenticação segura** com JWT + refresh token automático
- **Gamificação**: rankings, challenges, achievements, guilds, seasons
- **AI Mentor**: chat em tempo real com IA (streaming SSE)
- **Persistência**: tokens e dados salvos localmente
- **Error handling robusto**: mensagens amigáveis, timeout, session expiration
- **Design futurista**: tema escuro com paleta cyberpunk (púrpura, ciano)
- **Responsive**: suporta iOS, Android, e Web

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Backend rodando: http://localhost:3000 (ver [INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md))

### Setup
```bash
# 1. Clonar / navegar para projeto
cd sololevelinglifestylemobile

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Editar EXPO_PUBLIC_API_URL se necessário

# 4. Verificar tipos
npm run typecheck

# 5. Rodar
npm start
# iOS: pressionar 'i'
# Android: pressionar 'a'
# Web: pressionar 'w'
```

**Ver [QUICKSTART.md](./QUICKSTART.md) para detalhes completos.**

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── api/                  # HTTP clients + error handling
│   ├── client.ts        # Axios instance com interceptors
│   ├── auth.ts          # Autenticação (login, register, refresh)
│   ├── ai.ts            # AI Chat (SSE streaming)
│   ├── hunters.ts       # Perfil do usuário
│   ├── activities.ts    # Log de atividades
│   ├── leaderboards.ts  # Rankings
│   ├── challenges.ts    # Desafios
│   ├── events.ts        # Eventos
│   ├── guilds.ts        # Guildas
│   ├── store.ts         # Loja de itens
│   ├── seasons.ts       # Temporadas
│   ├── errors.ts        # Mapeador de erros HTTP
│   ├── authHandler.ts   # Gerenciador de logout
│   └── tokenStorage.ts  # Wrapper AsyncStorage
│
├── screens/             # React Native screens
│   ├── SplashScreen.tsx
│   ├── LandingScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── MissionsScreen.tsx
│   ├── RankingScreen.tsx
│   ├── AchievementsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── EventsScreen.tsx
│   ├── ChallengesScreen.tsx
│   ├── FeedScreen.tsx
│   ├── GuildScreen.tsx
│   ├── GuildBrowseScreen.tsx
│   └── AiChatScreen.tsx
│
├── ui/                  # Componentes reutilizáveis
│   ├── ChatBubble.tsx
│   ├── PressableScale.tsx
│   ├── PrimaryButton.tsx
│   ├── Typography.tsx
│   ├── Icons.tsx
│   ├── Toast.tsx
│   ├── BootstrapErrorBanner.tsx
│   └── ...
│
├── navigation/          # React Navigation
│   ├── RootNavigator.tsx
│   ├── MainTabs.tsx
│   └── types.ts
│
├── state/               # Context API (global state)
│   ├── AppStateContext.tsx
│   ├── types.ts
│   ├── data.ts
│   └── stateConfig.ts   # Vocabulário fixo (ranks, categorias, etc)
│
├── theme/               # Tema e cores
│   ├── ThemeContext.tsx
│   └── colors.ts
│
├── audio/               # Sons e háptica
│   ├── xpChime.ts
│   └── haptics.ts
│
└── App.tsx
```

### Data Flow

1. **Autenticação**: Login → `authApi.login()` → `TokenStorage` → `AppState` → `Navigation.reset(Main)`
2. **API Requests**: Screen → API client → `httpClient` (axios) → Backend
3. **Token Refresh**: 401 response → interceptor → `authApi.refresh()` → retry request
4. **Logout**: Sessão expirada → `authHandler.handleUnauthorized()` → `Navigation.reset(Landing)`
5. **Error Handling**: Erro → `getErrorMessage()` → `showToast('erro', 'error')`
6. **AI Chat**: Mensagem → `aiApi.chat(SSE)` → chunks → `setState` incremental → FlatList

## 🔐 Segurança

- **Tokens**: Guardados em AsyncStorage criptografada (plataforma específica)
- **Headers**: Authorization: Bearer <token> em todas as requisições
- **Refresh**: Automático no 401, com fila de requisições durante refresh
- **Validação**: Client-side (email, length), Server-side (sempre)
- **HTTPS**: Recomendado em produção (verificar certificado SSL)

## 🎯 Endpoints Integrados

### Autenticação
- `POST /auth/register` — Registrar nova conta
- `POST /auth/login` — Login (retorna access_token + refresh_token)
- `POST /auth/refresh-token` — Renovar token expirado
- `GET /auth/me` — Validar token + obter dados do usuário

### AI Chat
- `POST /ai/chat` — Enviar mensagem (retorna SSE stream)
- `GET /ai/conversations` — Listar conversas do usuário
- `GET /ai/conversations/:id` — Histórico de conversa
- `DELETE /ai/conversations/:id` — Deletar conversa (LGPD)

### Hunters
- `GET /hunters/profile` — Obter perfil
- `PATCH /hunters/profile` — Atualizar perfil
- `DELETE /hunters/profile` — Deletar conta

### Atividades
- `POST /activities/log` — Log de atividade
- `GET /activities/history` — Histórico
- `GET /activities/summary` — Resumo (semana/mês)

### Outros
- **Leaderboards**: `GET /leaderboards/{global|regional|local}`
- **Challenges**: `GET/POST/PATCH /challenges`
- **Events**: `GET/POST /events`
- **Guilds**: `GET/POST /guilds`
- **Store**: `GET/POST /store/{items|inventory}`
- **Seasons**: `GET /seasons/{current|:id|archived}`

## 🧪 Testes

### Manual (Recomendado para MVP)
Ver [TESTING.md](./TESTING.md) — 6 fluxos completos documentados:
1. Registro → Login → Main
2. AI Chat conversa em streaming
3. Conexão perdida (airplane mode)
4. Session expiration (401 handling)
5. Validação de entrada
6. Timeout (10s)

### Automático (Futuro)
```bash
# Detox (E2E)
npm run test:e2e

# Jest (Unit)
npm run test

# TypeScript
npm run typecheck
```

## 🎨 Design & UI

### Paleta de Cores
| Nome | Valor | Uso |
|------|-------|-----|
| bg0 | #05050F | Fundo principal |
| bg1 | #0F0F23 | Fundo secundário |
| border | #1A1A3E | Bordas |
| text | #E8E8FF | Texto principal |
| muted | #9A9AC0 | Texto secundário |
| accent-purple | #7C3AED | Botões, highlights |
| accent-cyan | #00F5FF | Alternativa |
| accent-amber | #FBBF24 | XP, rewards |
| error | #EF4444 | Erros, alerts |
| success | #22C55E | Sucesso |

### Tipografia
- **Display**: Orbitron (headers, títulos)
- **Body**: Rajdhani (texto, labels)

### Componentes Principais
- `PrimaryButton` — CTA principal
- `PressableScale` — Touch feedback (scale 0.85x)
- `ChatBubble` — User/assistant messages
- `Toast` — Notificações (auto-dismiss 2.2s)
- `Icons` — SVG custom (SoundOn, Eye, etc)

## 📊 Estado Global (AppStateContext)

```ts
interface AppState {
  // User
  user: UserState (name, xp, level, rank, coins)
  
  // Progress
  missions: Mission[]
  achievements: Achievement[]
  
  // Social
  ranking: RankingEntry[]
  guild: Guild
  guildMembers: GuildMember[]
  events: EventItem[]
  challenges: ChallengeItem[]
  
  // Settings
  soundEnabled: boolean
  hapticsEnabled: boolean
  notificationsEnabled: boolean
  
  // UI
  toast: Toast | null
  confetti: ConfettiState
  onboarding: { shown, step }
  
  // Persistence
  avatarUri: string | null
  streakFreezes: number
  streakProtected: boolean
}
```

## 🚨 Error Handling

Todos os erros HTTP são mapeados para mensagens amigáveis:

```
Timeout (10s) → "Conexão expirou. Verifique sua internet..."
Network error → "Erro de conexão. Verifique sua internet."
400 Bad Request → "Dados inválidos. Verifique os campos."
401 Unauthorized → "Sessão expirada. Faça login novamente."
403 Forbidden → "Você não tem permissão para essa ação."
404 Not Found → "Recurso não encontrado."
409 Conflict → "Conflito de dados. Tente novamente."
5xx Server Error → "Erro no servidor. Tente novamente em alguns momentos."
```

Toast aparece no topo (red #EF4444 + ❌), auto-dismiss em 2.2s.

## 📦 Dependências Principais

```json
{
  "expo": "^57.0.0",
  "react-native": "^0.76.5",
  "react-navigation": "^6.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "axios": "^1.x",
  "@google/generative-ai": "^0.x"
}
```

## 🔧 Scripts

```bash
npm start          # Iniciar Expo (iOS/Android/Web)
npm run typecheck  # Verificar tipos TypeScript
npm run build:ios  # Build para iOS (requer Xcode)
npm run build:android # Build para Android
```
