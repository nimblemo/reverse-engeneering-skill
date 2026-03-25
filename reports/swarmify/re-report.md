---
status: "exploration"
context:
  project_name: "swarmify"
  repo_url: "https://github.com/muqsitnawaz/swarmify"
  nb_id: "f4fe8809-ac2b-4bf2-8e29-c88bdfee9306"
  output_dir: "c:\WORK\RaD\reverse-engeneering\reports\swarmify"
  sources_dir: "c:\WORK\RaD\reverse-engeneering\sources\swarmify"
  base_plan: "c:\WORK\RaD\reverse-engeneering\research-plan.md"
  max_sources: "50"
  lang_comm: "Russian"
  lang_doc: "English"
created: "2026-03-25"
---

# Reverse Engineering Report: swarmify

### Step 1 Project overview

#### 1.1 Project Brief
Swarmify is a multi-agent coding framework that enables developers to orchestrate a team of specialized AI models (Claude, Codex, Gemini, Cursor) directly within their IDE. It aims to overcome the limitations of single AI agents by allowing parallel task execution across different parts of a project, such as research, implementation, and debugging. The system utilizes human-in-the-loop approval gates for agent plans and leverages the Model Context Protocol (MCP) for cross-platform agent orchestration.

#### 1.2 Project Structure
```text
swarmify/
├── agents-mcp/                # MCP server for agent orchestration
│   ├── src/                   # Core MCP logic (agents, api, server)
│   ├── scripts/               # Build and lifecycle scripts
│   └── tests/                 # E2E testing framework
├── extension/                 # VS Code and Cursor extension
│   ├── src/                   # VS Code-specific implementations and core logic
│   ├── ui/                    # Webview UIs (Dashboard, MD Editor) built with React+Vite
│   └── mcp/                   # Native notification MCP server
├── prompts/                   # Version-controlled slash-command prompts
│   ├── claude/                # Claude-specific markdown prompts
│   ├── codex/                 # Codex-specific prompts
│   └── gemini/                # Gemini-specific TOML prompts
├── web/                       # Next.js marketing and landing page
├── oauth-worker/              # Cloudflare Worker for OAuth handling
├── AGENTS.md                  # Project-level agent definitions
├── package.json               # Monorepo configuration
└── README.md                  # Main documentation
```

#### 1.3 Technology Stack
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Languages** | TypeScript, Python 3.12 | Primary development languages. |
| **Package Manager** | Bun | Default runner and manager for JS/TS. |
| **Protocol** | Model Context Protocol (MCP) | SDK for agent spawning and orchestration. |
| **IDE Integration** | VS Code Extension API | Deep integration with VS Code and Cursor. |
| **Frontend (UI)** | React 19, Tailwind CSS v4, Radix UI| Used for extension webviews and landing page. |
| **Build Tools** | Vite, Next.js | Bundlers for UI components and web. |
| **Database/Storage** | sql.js (Wasm SQLite), Supabase/Postgres| Local (for Cursor DB) and remote persistence. |
| **Backend Framework**| FastAPI (Python) | For cloud-hosted services. |
| **Video Production** | Remotion | Programmatic video generation for promos. |

#### 1.4 Project Type
Open-source multi-agent coding framework and monorepo consisting of a VS Code extension, an MCP server (Node.js library), and a set of version-controlled prompt workflows. It is designed as a suite of local developer tools rather than a centralized SaaS.
