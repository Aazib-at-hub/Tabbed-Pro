## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---

## 🛠️ Implemented Architecture & System Overview

Tabbed Pro has evolved into a full-stack SaaS platform featuring authentication, database persistence, Express backend API, and a multi-provider LLM engine with real-time SSE streaming.

### 🔐 1. Authentication & Onboarding Flow

- **Auth Context (`src/lib/auth-context.tsx`)**: Manages session state, login, signup, password resets, email verification, and profile sync.
- **Auth Views (`src/routes/auth.*.tsx`)**: Complete responsive UI for Login, Signup, Password Reset, and Email Verification.
- **4-Step User Onboarding Wizard (`src/routes/onboarding.tsx`)**: Collects user role, primary AI domain, preferred platforms (ChatGPT, Claude, Gemini), and output preference to build a custom `AIProfile`.
- **Protected Route Guard (`src/components/protected-route.tsx`)**: Enforces authentication and routes non-onboarded users directly to `/onboarding`.

### 🗄️ 2. Backend & Database Persistence

- **Prisma PostgreSQL Schema (`prisma/schema.prisma`)**:
  - `User`, `AIProfile`, `Prompt`, `PromptScore`, `PromptInsight`, `Folder`, `Template`, `Workspace`, `WorkspaceMember`.
- **Express API Server (`src/server/server.ts` & `src/server/api-routes.ts`)**:
  - REST endpoints for User Profiles, Folders CRUD, Prompts CRUD, Templates, and Analytics.
- **Unified API Client (`src/lib/api-client.ts`)**: Single import abstraction layer with seamless fallback to localStorage database engine (`src/lib/db.ts`).

### 🤖 3. Real LLM AI Engine (LLM Abstraction Layer)

- **Multi-Provider Adapter Architecture (`src/server/llm/`)**:
  - `OpenAIAdapter`: `gpt-4o` evaluation & SSE streaming.
  - `AnthropicAdapter`: `claude-3-5-sonnet` evaluation & SSE streaming.
  - `GeminiAdapter`: `gemini-1.5-flash` evaluation & SSE streaming.
  - `MockLLMAdapter`: Offline simulation fallback with token-by-token SSE streaming.
- **SSE Streaming Endpoint (`POST /api/llm/optimize/stream`)**: Real-time token streaming over Server-Sent Events.
- **Live LLM Prompt Evaluation Endpoint (`POST /api/llm/analyze`)**: Evaluates raw prompts across 8 dimensions (Clarity, Context, Specificity, Constraints, Role, Output Format, Examples, Completeness).
- **Dynamic AI Profile Context Injection (`src/server/llm/optimizer-prompt.ts`)**: Seamlessly injects user's profession, stack, and guidelines into prompt optimization requests.
