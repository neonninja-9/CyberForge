import './App.css'

/* ════════════════════════════════════════════════════════════
   CyberChef — Modular Data Transformation Tool
   Layout: 3-column  →  Operations | Recipe | I/O
   ════════════════════════════════════════════════════════════ */

// ─── Placeholder operation categories ──────────────────────
const OPERATION_CATEGORIES = [
  {
    name: 'Encoding',
    icon: '⟨⟩',
    ops: ['Base64 Encode', 'Base64 Decode', 'URL Encode', 'URL Decode', 'HTML Entity Encode'],
  },
  {
    name: 'Encryption',
    icon: '🔐',
    ops: ['AES Encrypt', 'AES Decrypt', 'DES Encrypt', 'Triple DES', 'RC4'],
  },
  {
    name: 'Hashing',
    icon: '#',
    ops: ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'HMAC'],
  },
  {
    name: 'Data Format',
    icon: '{}',
    ops: ['JSON Beautify', 'JSON Minify', 'XML Beautify', 'CSV to JSON', 'YAML to JSON'],
  },
  {
    name: 'Utilities',
    icon: '⚙',
    ops: ['Reverse', 'To Upper Case', 'To Lower Case', 'Find / Replace', 'Remove Whitespace'],
  },
]

// ─── Placeholder recipe steps ──────────────────────────────
const PLACEHOLDER_RECIPE = [
  { id: 1, name: 'Base64 Decode', enabled: true },
  { id: 2, name: 'JSON Beautify', enabled: true },
  { id: 3, name: 'SHA-256', enabled: false },
]


/* ╔══════════════════════════════════════════════════════════╗
   ║  TOP BAR                                                ║
   ╚══════════════════════════════════════════════════════════╝ */
function TopBar() {
  return (
    <header className="h-12 flex items-center justify-between px-5 border-b border-border-default bg-bg-surface shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white text-xs font-bold shadow-md">
          C
        </div>
        <h1 className="text-sm font-semibold text-text-primary tracking-tight">
          CyberChef
        </h1>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
          v0.1
        </span>
      </div>

      {/* Actions */}
      <nav className="flex items-center gap-3">
        <button
          id="btn-save"
          className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          💾 Save
        </button>
        <button
          id="btn-load"
          className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          📂 Load
        </button>
        <button
          id="btn-clear"
          className="text-xs px-3 py-1 rounded-md bg-rose-500/10 text-accent-rose border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          ✕ Clear
        </button>
      </nav>
    </header>
  )
}


/* ╔══════════════════════════════════════════════════════════╗
   ║  LEFT SIDEBAR — Operations Picker                      ║
   ╚══════════════════════════════════════════════════════════╝ */
function OperationsSidebar() {
  return (
    <aside
      id="sidebar-operations"
      className="w-[260px] shrink-0 border-r border-border-default bg-bg-surface flex flex-col overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 border-b border-border-subtle">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none">
            🔍
          </span>
          <input
            id="input-search-ops"
            type="text"
            placeholder="Search operations…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
          />
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {OPERATION_CATEGORIES.map((cat) => (
          <CategoryGroup key={cat.name} category={cat} />
        ))}
      </div>

      {/* Footer count */}
      <div className="p-3 border-t border-border-subtle text-center">
        <span className="text-[10px] text-text-muted font-mono">
          {OPERATION_CATEGORIES.reduce((sum, c) => sum + c.ops.length, 0)} operations available
        </span>
      </div>
    </aside>
  )
}

function CategoryGroup({ category }) {
  return (
    <details className="group" open>
      <summary className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:bg-bg-hover cursor-pointer transition-colors list-none select-none">
        <span className="w-5 text-center opacity-70 text-[11px]">{category.icon}</span>
        <span className="flex-1">{category.name}</span>
        <svg
          className="w-3 h-3 text-text-muted transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      <ul className="mt-0.5 ml-5 space-y-px">
        {category.ops.map((op) => (
          <li key={op}>
            <button className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-accent-blue/8 transition-colors cursor-pointer">
              {op}
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}


/* ╔══════════════════════════════════════════════════════════╗
   ║  CENTER — Recipe Area                                   ║
   ╚══════════════════════════════════════════════════════════╝ */
function RecipePanel() {
  return (
    <section
      id="panel-recipe"
      className="flex-1 min-w-[280px] border-r border-border-default flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-60">🧪</span>
          <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
            Recipe
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
            {PLACEHOLDER_RECIPE.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            id="btn-bake"
            className="text-[11px] font-medium px-3 py-1 rounded-md bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-accent-blue/20"
          >
            ▶ Bake
          </button>
          <button
            id="btn-clear-recipe"
            className="text-[11px] px-2 py-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {PLACEHOLDER_RECIPE.map((step, i) => (
          <RecipeStep key={step.id} step={step} index={i} />
        ))}

        {/* Drop zone hint */}
        <div className="mt-2 border-2 border-dashed border-border-subtle rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-text-muted opacity-60">
          <span className="text-lg">＋</span>
          <span className="text-[10px] font-mono">Drag operations here</span>
        </div>
      </div>
    </section>
  )
}

function RecipeStep({ step, index }) {
  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
        step.enabled
          ? 'bg-bg-elevated border-border-default hover:border-accent-blue/30'
          : 'bg-bg-elevated/50 border-border-subtle opacity-50'
      }`}
    >
      {/* Drag handle */}
      <span className="text-text-muted text-[10px] cursor-grab select-none">⠿</span>

      {/* Step number */}
      <span className="w-5 h-5 rounded-full bg-accent-indigo/15 text-accent-indigo text-[10px] font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </span>

      {/* Name */}
      <span className={`flex-1 text-xs font-medium ${step.enabled ? 'text-text-primary' : 'text-text-muted line-through'}`}>
        {step.name}
      </span>

      {/* Toggle */}
      <button
        className={`w-7 h-4 rounded-full transition-colors cursor-pointer relative ${
          step.enabled ? 'bg-accent-emerald' : 'bg-border-default'
        }`}
        title={step.enabled ? 'Disable step' : 'Enable step'}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
            step.enabled ? 'left-3.5' : 'left-0.5'
          }`}
        />
      </button>

      {/* Remove */}
      <button className="text-text-muted hover:text-accent-rose text-[11px] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
        ✕
      </button>
    </div>
  )
}


/* ╔══════════════════════════════════════════════════════════╗
   ║  RIGHT — Input / Output Panels                         ║
   ╚══════════════════════════════════════════════════════════╝ */
function IOPanel() {
  return (
    <section id="panel-io" className="flex-1 min-w-[320px] flex flex-col overflow-hidden">
      {/* Input */}
      <div className="flex-1 flex flex-col border-b border-border-default overflow-hidden">
        <PanelHeader
          id="header-input"
          title="Input"
          icon="📥"
          accentColor="text-accent-blue"
          badgeBg="bg-accent-blue/10"
          badgeBorder="border-accent-blue/20"
          badgeText="UTF-8"
        />
        <div className="flex-1 p-3 overflow-auto">
          <textarea
            id="textarea-input"
            placeholder="Paste your input data here…"
            spellCheck={false}
            className="w-full h-full resize-none bg-bg-elevated rounded-lg border border-border-subtle p-3 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/40 focus:ring-1 focus:ring-accent-blue/20 transition-all"
          />
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PanelHeader
          id="header-output"
          title="Output"
          icon="📤"
          accentColor="text-accent-emerald"
          badgeBg="bg-accent-emerald/10"
          badgeBorder="border-accent-emerald/20"
          badgeText="Result"
        />
        <div className="flex-1 p-3 overflow-auto">
          <div
            id="output-display"
            className="w-full h-full bg-bg-elevated rounded-lg border border-border-subtle p-3 text-xs font-mono text-text-muted"
          >
            <span className="opacity-40 italic">Output will appear here after baking…</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PanelHeader({ id, title, icon, accentColor, badgeBg, badgeBorder, badgeText }) {
  return (
    <div
      id={id}
      className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-bg-surface shrink-0"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs opacity-60">{icon}</span>
        <h2 className={`text-xs font-semibold tracking-wide uppercase ${accentColor}`}>
          {title}
        </h2>
      </div>
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${badgeBg} ${accentColor} border ${badgeBorder}`}>
        {badgeText}
      </span>
    </div>
  )
}


/* ╔══════════════════════════════════════════════════════════╗
   ║  ROOT — App                                             ║
   ╚══════════════════════════════════════════════════════════╝ */
export default function App() {
  return (
    <div className="h-full flex flex-col bg-bg-base">
      <TopBar />

      <main className="flex-1 flex overflow-hidden">
        <OperationsSidebar />
        <RecipePanel />
        <IOPanel />
      </main>
    </div>
  )
}
