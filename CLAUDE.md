# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dendron Bridge is an Obsidian plugin for exploring, navigating, and managing hierarchical notes using Dendron-like dot-separated naming (e.g., `project.tasks.todo`). Originally forked from [obsidian-dendron-tree](https://github.com/levirs565/obsidian-dendron-tree).

## Development Commands

- `npm run dev` — Start esbuild in watch mode (development). Create a `.env` file with `OBSIDIAN_PLUGIN_DIR=/path/to/vault/.obsidian/plugins/dendron-bridge` for live reload to your vault.
- `npm run build` — Type-check with `tsc -noEmit -skipLibCheck`, then bundle with esbuild in production mode
- `npm test` — Run Jest tests (ts-jest preset, node environment)
- `npm run format` — Format code with Prettier
- `npm run format:check` — Check formatting with Prettier
- `npm run version` — Bump version in manifest.json and versions.json

To deploy to a local vault for testing:
1. Copy `scripts/build.config.template` to `scripts/build.config`
2. Edit `build.config` with your vault path
3. Run `scripts/build.bat`

## Architecture

### Directory Structure

```
src/
├── main.ts                # 插件入口 DendronBridgePlugin
├── settings.ts            # 配置接口 + Settings Tab UI
├── store.ts               # Svelte 全局状态（响应式桥梁）
├── view.ts                # 侧边栏视图容器 DendronBridgeView
├── path.ts                # 路径解析工具
├── pathExclusion.ts       # 路径排除匹配
├── engine/                # 核心数据引擎（纯内存，无 UI 依赖）
├── components/            # Svelte UI 组件
├── commands/              # 命令工厂函数
├── modal/                 # Obsidian 弹窗（含 lookup/ 子系统）
├── custom-resolver/       # 可选：覆盖 wikilink/embed 渲染
└── custom-graph/          # 可选：覆盖图谱节点展示
```

### Core Data Engine (`src/engine/`)

| Class | Responsibility |
|---|---|
| `Note` | 树节点：name、children、file、metadata；`getPath()` 返回点分路径 |
| `NoteTree` | Note 树；`addFile / getFromFileName / deleteByFileName / flatten` |
| `DendronBridgeVault` | 单个 vault：持有 NoteTree，处理文件 CRUD、frontmatter 生成、isSecret 权限 |
| `DendronBridgeWorkspace` | 多 vault 容器；跨 vault ref 解析（`resolveRef`） |
| `NoteFinder` | 跨 vault 查找 note（用于 rename/move） |
| `NoteRenamer` | 重命名 note 并更新所有反向链接 |

### State Management (`src/store.ts`)

Svelte store 作为引擎与 UI 的唯一桥梁：
- `plugin` — 插件实例
- `activeFile` — 当前打开文件
- `dendronBridgeVaultList` — vault 列表（驱动整棵树重渲染）
- `selectedNotes` — 当前选中节点
- `showVaultPath` — derived，vault > 1 时为 true

### UI Layer

- `DendronBridgeView` (`ItemView`): Obsidian 侧边栏叶子，挂载 Svelte 根组件
- `MainComponent.svelte`: 订阅 store，渲染 vault 列表
- `NoteComponent.svelte`: 递归渲染单个 Note（展开/折叠/高亮）

### Commands (`src/commands/`)

每个文件导出一个工厂函数，返回 Obsidian `Command` 对象，在 `main.ts` 统一注册：
`lookupNote / createNewNote / renameNote / moveNote / openParentNote / collapseAll / generateId / exportNotes`

### Lookup Subsystem (`src/modal/lookup/`)

| Class | Responsibility |
|---|---|
| `LookupModal` | SuggestModal 入口，协调下面三个类 |
| `LookupSuggestionManager` | Fuse.js 模糊搜索 + 排除路径过滤 |
| `LookupRenderer` | 渲染搜索结果项（路径 + 描述） |
| `LookupActionHandler` | 选中后执行打开/创建操作 |

### Optional Modules

**`CustomResolver`** (default off): 通过 CodeMirror `ViewPlugin` + `MarkdownPreviewRenderer` postProcessor 覆盖 wikilink/embed 的编辑器实时渲染和预览渲染；覆盖 `openLinkText` 和 `onLinkHover`。

**`CustomGraph`** (default off, experimental): 覆盖图谱 `dataEngine.render` 和节点 `getDisplayText`，让节点显示 Dendron 层级路径。

### Data Flow

```
Vault 文件事件（create/delete/rename/resolve）
  → DendronBridgePlugin 事件处理
  → DendronBridgeWorkspace → DendronBridgeVault → NoteTree 更新
  → updateNoteStore() → dendronBridgeVaultList.set(...)
  → Svelte 响应式 → MainComponent → NoteComponent 重渲染
```

## Build System

- **Bundler**: esbuild with Svelte plugin (`esbuild-svelte` + `svelte-preprocess`)
- **Entry**: `./src/main.ts`, output: `main.js` (CommonJS, ES2018 target)
- **External**: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node builtins
- **Source maps**: Inline in dev, disabled in production

## Testing

- **Framework**: Jest with ts-jest preset
- **Mocks**: `__mocks__/obsidian.ts` and `__mocks__/nanoid.ts` mock Obsidian API and nanoid
- **Test files**: `src/path.test.ts`, `tests/note.test.ts`

## Code Style

- **Indentation**: Tabs (4 spaces width)
- **Line endings**: LF
- **Charset**: UTF-8
- **Formatting**: Prettier (check with `npm run format:check`)
- **Linting**: ESLint with TypeScript parser

## Key Dependencies

- `obsidian` — Obsidian plugin API
- `svelte` — UI framework for sidebar view
- `fuse.js` — Fuzzy search for lookup modal
- `nanoid` — ID generation
- `@codemirror/*` — Editor integration
- `github-slugger` — Slug generation

## Release Process

GitHub Actions workflow (`.github/workflows/release.yaml`) triggers on tag push, builds the plugin, and creates a draft GitHub release with `main.js`, `manifest.json`, and `styles.css`.
