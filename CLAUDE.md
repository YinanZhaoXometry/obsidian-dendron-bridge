# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dendron Bridge is an Obsidian plugin for exploring, navigating, and managing hierarchical notes using Dendron-like dot-separated naming (e.g., `project.tasks.todo`). Originally forked from [obsidian-dendron-tree](https://github.com/levirs565/obsidian-dendron-tree).

## Development Commands

- `pnpm dev` — Start Vite in watch mode (development). Create a `.env` file with `OBSIDIAN_PLUGIN_DIR=/path/to/vault/.obsidian/plugins/dendron-bridge` for live reload to your vault.
- `pnpm build` — Type-check with `tsc -noEmit -skipLibCheck`, then bundle with Vite in production mode
- `pnpm test` — Run Jest tests (ts-jest preset, two projects: `engine` for node env, `ui` for jsdom)
- `pnpm format` — Format code with Prettier
- `pnpm format:check` — Check formatting with Prettier
- `pnpm version` — Bump version in manifest.json and versions.json

To deploy to a local vault for testing, set `OBSIDIAN_PLUGIN_DIR` in `.env` and run `pnpm dev`.

## Architecture

### Directory Structure

```
src/
├── main.ts                # 插件入口 DendronBridgePlugin
├── view.tsx               # 侧边栏视图容器 DendronBridgeView（挂载 React）
├── path.ts                # 路径解析工具
├── pathExclusion.ts       # 路径排除匹配
├── supportedExtensions.ts # 插件支持的文件扩展名白名单
├── icons.ts               # Lucide 图标注册 + activity bar 图标名
├── iconModal.ts           # 图标选择弹窗
├── utils.ts               # 通用工具函数
├── obsidian-ex.d.ts       # Obsidian 私有 API 类型扩展
├── types/
│   └── settings.ts        # 框架无关的设置 + vault 类型定义
├── settings/              # Settings Tab 拆分实现
│   ├── index.ts           # 导出 DEFAULT_SETTINGS / DendronBridgeSettingTab / DendronBridgePluginSettings
│   ├── defaults.ts        # 默认设置值
│   ├── settingTab.ts      # 主 SettingTab（标签页容器）
│   ├── generalTab.ts      # 通用设置页
│   ├── vaultsTab.ts       # Vault 管理页
│   ├── propertiesTab.ts   # Frontmatter 属性页
│   ├── lookupTab.ts       # Lookup 模糊搜索设置页
│   └── experimentalTab.ts # 实验性功能页
├── state/
│   └── store.ts           # 框架无关的 Observable<T> 状态（引擎与 UI 的桥梁）
├── engine/                # 核心数据引擎（纯内存，无 UI 依赖）
├── ui/                    # React UI 层
│   ├── components/        # React 组件（App.tsx、NoteItem.tsx）
│   ├── context/           # React Context（PluginContext、StoreContext）
│   ├── hooks/             # 自定义 React Hooks（useNoteActions）
│   └── icon.tsx           # 图标渲染组件
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
| `ref.ts` | Ref 类型定义 + 解析工具（subpath、anchor、range） |

### State Management (`src/state/store.ts`)

自定义 `Observable<T>` 类（无框架依赖）作为引擎与 UI 的唯一桥梁：
- `activeFile` — 当前打开文件
- `dendronBridgeVaultList` — vault 列表（驱动整棵树重渲染）
- `selectedNotes` — 当前选中节点

React 层通过 `StoreProvider`（`src/ui/context/StoreContext.tsx`）订阅 Observable，并通过 `useStore()` hook 消费状态；`showVaultPath` 作为 derived 值在 `StoreProvider` 中用 `useMemo` 计算。

### UI Layer (`src/ui/`)

- `DendronBridgeView` (`ItemView`, `src/view.tsx`): Obsidian 侧边栏叶子，用 `createRoot` 挂载 React 树
- `PluginContext`: 向子树注入插件实例
- `StoreProvider` + `useStore()`: 订阅 Observable，向子树提供响应式状态
- `App.tsx`: 渲染全部 vault 的根节点列表，通过 `ref` 暴露 `focusTo` / `collapseAllButTop`
- `NoteItem.tsx`: 递归渲染单个 Note（展开/折叠/高亮）

### Settings Layer (`src/settings/`)

拆分为多个子标签页，各自独立维护。`src/types/settings.ts` 保存框架无关的类型定义（`VaultConfig`、`DendronBridgePluginSettings` 等），避免引擎依赖 Obsidian UI。

### Commands (`src/commands/`)

每个文件导出一个工厂函数，返回 Obsidian `Command` 对象，在 `main.ts` 统一注册：
`lookupNote / createNewNote / renameNote / moveNote / openParentNote / collapseAll / generateId / exportNotes`

### Modal Layer (`src/modal/`)

- `addVaultModal.ts` — 添加 vault 弹窗
- `confirmationModal.ts` — 通用确认弹窗
- `folderSuggester.ts` — 文件夹路径输入补全
- `invalidRootModal.ts` — 非法 vault 根路径提示
- `renameNoteModal.ts` — 重命名 note 弹窗
- `selectVaultModal.ts` — vault 选择弹窗

### Lookup Subsystem (`src/modal/lookup/`)

| Class | Responsibility |
|---|---|
| `LookupModal` | SuggestModal 入口，协调下面三个类 |
| `LookupSuggestionManager` | Fuse.js 模糊搜索 + 排除路径过滤 |
| `LookupRenderer` | 渲染搜索结果项（路径 + 描述） |
| `LookupActionHandler` | 选中后执行打开/创建操作 |
| `lookupTypes.ts` | Lookup 相关类型定义 |
| `lookupUtils.ts` | Lookup 工具函数 |

### Optional Modules

**`CustomResolver`** (default off): 通过 CodeMirror `ViewPlugin` + `MarkdownPreviewRenderer` postProcessor 覆盖 wikilink/embed 的编辑器实时渲染和预览渲染；覆盖 `openLinkText` 和 `onLinkHover`。

**`CustomGraph`** (default off, experimental): 覆盖图谱 `dataEngine.render` 和节点 `getDisplayText`，让节点显示 Dendron 层级路径。

### Data Flow

```
Vault 文件事件（create/delete/rename/resolve）
  → DendronBridgePlugin 事件处理
  → DendronBridgeWorkspace → DendronBridgeVault → NoteTree 更新
  → updateNoteStore() → dendronBridgeVaultList.set(...)
  → Observable 通知订阅者 → StoreProvider（React）→ App → NoteItem 重渲染
```

## Build System

- **Bundler**: Vite with `@vitejs/plugin-react`
- **Package manager**: pnpm
- **Entry**: `./src/main.ts`, output: `main.js` (CJS, ES2018 target)
- **External**: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node builtins
- **Source maps**: Inline in dev (`--mode development`), disabled in production
- **Dev output**: `OBSIDIAN_PLUGIN_DIR` from `.env` (falls back to `./build`)
- **Prod output**: repo root (`.`)

## Testing

- **Framework**: Jest with ts-jest preset
- **Two projects**:
  - `engine` — `testEnvironment: node`, matches `**/*.test.ts`
  - `ui` — `testEnvironment: jsdom`, matches `**/*.test.tsx`, uses `@testing-library/react`
- **Mocks**: `__mocks__/obsidian.ts` and `__mocks__/nanoid.ts`
- **Test files**: `src/path.test.ts`, `src/pathExclusion.test.ts`, `src/engine/noteRenamer.test.ts`, `src/engine/ref.test.ts`, `src/ui/components/NoteItem.test.tsx`

## Code Style

- **Indentation**: Tabs (4 spaces width)
- **Line endings**: LF
- **Charset**: UTF-8
- **Formatting**: Prettier (check with `pnpm format:check`)
- **Linting**: ESLint with TypeScript parser

## Key Dependencies

- `obsidian` — Obsidian plugin API
- `react` / `react-dom` — UI framework for sidebar view
- `react-icons` — Icon components
- `fuse.js` — Fuzzy search for lookup modal
- `nanoid` — ID generation
- `@codemirror/*` — Editor integration
- `github-slugger` — Slug generation

## Release Process

GitHub Actions workflow (`.github/workflows/release.yaml`) triggers on tag push, builds the plugin, and creates a draft GitHub release with `main.js`, `manifest.json`, and `styles.css`.
