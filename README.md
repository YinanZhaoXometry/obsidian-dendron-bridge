# Dendron Bridge

> 继承 Dendron 的优良传统，以生产力优先。

Dendron 将笔记管理从"找文件"变成"想路径"——用 `project.tasks.todo` 这样的层级命名，让知识的组织和检索快到无需思考。Dendron Bridge 把这套理念带进 Obsidian，让你在享受 Obsidian 生态的同时，不丢失 Dendron 最核心的效率体验。

**为什么叫 Bridge？** 因为它是连接 Dendron 思维方式和 Obsidian 生态的桥梁。

![Dendron Bridge with several open levels of the hierarchy](images/StructuredTree.png)

## 核心理念

- **层级命名，路径即结构** — 用 `.` 分隔的命名替代文件夹，`project.tasks.todo` 既是文件名也是知识结构
- **Lookup 优先，键盘驱动** — 模糊搜索快速定位或创建笔记，双手不离键盘
- **自动属性，减少重复劳动** — 新建笔记自动生成 ID、标题、创建时间等 frontmatter
- **多 Vault 隔离** — 每个 Vault 独立配置，支持标记为"私密"避免混入搜索

## Features

- Browse notes using a hierarchical naming scheme with customizable separator
- Lookup with fuzzy search
- Automatic frontmatter generation for new files
- Multi-vault support
- Custom resolver and renderer for links and embeds
- Built-in renaming modal
- Exclude paths like `archive.*`
- Support for all file types (Canvas support is experimental)

## Usage

### File Tree

Open the sidebar via the ribbon icon or the command "Open Dendron Bridge".

The hierarchy separator defaults to `.` and can be changed in settings.

A note with an orange circle indicates no corresponding file exists.

![A note with a missing file](images/MissingFile.png)

Right-click (desktop) or long-press (mobile) a note to access:

- **Create Current Note** — create a file for a placeholder note
- **Create New Note** — open Lookup with the note's path prefilled
- **Delete Note** — delete the note file
- **Rename Note** — open the renaming modal

### Lookup

![Lookup modal with fuzzy search](images/LookupModalFuzzy.png)

Run "Dendron Bridge: Lookup note" to open or create notes with fuzzy search. Input a non-existing path to see a "Create New" option.

![Create new note via Lookup](images/LookupModalNew.png)

### Renaming

![Renaming Modal](images/RenamingModal.png)

Use "Dendron Bridge: Rename note" or right-click a note and select "Rename Note".

### Auto-generate Properties

![Property settings](images/PropertySettings.png)

Automatically generate ID, title, description, created date, and tags when creating new notes. Keys for title and description are customizable.

### Multi Vault

Add or remove vaults in plugin settings. Each vault can have its own property generation settings. Vaults can be marked as "secret" to exclude notes from lookup searches.

### Custom Resolver (Disabled by Default)

Overrides wikilink and embed rendering to use Dendron-style behavior.

### Excluded Paths

Demote certain paths (e.g., `archive.*`) in lookup results.

## Development

本项目使用 [pnpm](https://pnpm.io/) 作为包管理器。若尚未安装，可通过以下方式安装：

```bash
npm install -g pnpm
```

常用命令：

```bash
pnpm dev      # Watch mode — set OBSIDIAN_PLUGIN_DIR in .env for live reload
pnpm build    # Production build
pnpm test     # Run tests
pnpm format   # Format with Prettier
```

For live reload during development, create a `.env` file:

```
OBSIDIAN_PLUGIN_DIR=/path/to/your/vault/.obsidian/plugins/dendron-bridge
```

See `.env.example` for reference.

## Attribution

- [levirs565](https://github.com/levirs565/) — original [obsidian-dendron-tree](https://github.com/levirs565/obsidian-dendron-tree)
- [Rudtrack](https://github.com/Rudtrack) — continued development as [dendron-bridge](https://github.com/Rudtrack/dendron-bridge)
- [Dobrovolsky Bohdan](https://github.com/dobrovolsky) — inspiration from [Structured](https://github.com/dobrovolsky/obsidian-structure)
