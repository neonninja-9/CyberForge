import { useState, useEffect } from 'react'
import { Plus, GripVertical, Trash2, Play, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { api } from '../lib/api'
import './Pipelines.css'

const availableAlgos = {
  'Symmetric': ['AES-256', 'Blowfish', 'ChaCha20', '3DES'],
  'Hash': ['SHA-256', 'MD5', 'SHA-512', 'HMAC-SHA256'],
  'Encoding': ['Base64', 'Hex Encode', 'URL Encode', 'UTF-8'],
  'Classical': ['Caesar Cipher', 'Vigenère', 'ROT13', 'Atbash'],
}

const initialSteps = [
  { id: 1, name: 'AES-256-CBC', params: 'Key: 256-bit • Mode: CBC • IV: Auto', expanded: false },
  { id: 2, name: 'SHA-256', params: 'Output: Hex', expanded: false },
  { id: 3, name: 'Base64 Encode', params: 'Standard encoding', expanded: false },
]

export default function Pipelines() {
  const [steps, setSteps] = useState(initialSteps)
  const [input, setInput] = useState('Hello, CryptoForge!')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [drawerSearch, setDrawerSearch] = useState('')

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const addStep = (name) => {
    setSteps(prev => [...prev, { id: Date.now(), name, params: 'Default parameters', expanded: false }])
  }

  const removeStep = (id) => {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  const handleRun = async () => {
    setIsRunning(true)
    setRunError('')
    setOutput('')
    try {
      const result = await api.executePipeline({
        steps: steps.map(s => ({ algorithm_id: s.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_'), params: {} })),
        input,
        output_format: 'hex',
      })
      setOutput(result.final_output || JSON.stringify(result, null, 2))
    } catch (err) {
      setRunError(err.message)
    }
    setIsRunning(false)
  }

  return (
    <div className="pipelines-page" id="pipelines-page">
      <PanelGroup direction={isMobile ? "vertical" : "horizontal"} className="pipelines-layout-panels">
        {/* Left Drawer - Available Algorithms */}
        <Panel defaultSize={20} minSize={15}>
          <aside className="pipeline-drawer" id="algo-drawer" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="card-flat card-sm">
              <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-base)' }}>Available Algorithms</h4>
              <div style={{ position: 'relative', marginBottom: 'var(--space-base)' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-steel)' }} />
                <input
                  className="input-search"
                  style={{ width: '100%', fontSize: '13px', paddingLeft: 36, height: 36 }}
                  placeholder="Search..."
                  value={drawerSearch}
                  onChange={e => setDrawerSearch(e.target.value)}
                />
              </div>
              {Object.entries(availableAlgos).map(([cat, algos]) => (
                <div key={cat} className="drawer-category">
                  <div className="text-caption-bold drawer-cat-label">{cat}</div>
                  {algos
                    .filter(a => a.toLowerCase().includes(drawerSearch.toLowerCase()))
                    .map(algo => (
                      <button key={algo} className="drawer-algo-btn" onClick={() => addStep(algo)}>
                        <span className="text-body-sm">{algo}</span>
                        <Plus size={14} />
                      </button>
                    ))
                  }
                </div>
              ))}
            </div>
          </aside>
        </Panel>

        <PanelResizeHandle className="resize-handle">
          <div className="resize-handle-inner">
            <GripVertical size={14} />
          </div>
        </PanelResizeHandle>

        {/* Center - Pipeline */}
        <Panel defaultSize={55} minSize={30}>
          <main className="pipeline-center" id="pipeline-center" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="pipeline-header">
              <h2 className="text-heading-sm">My Encryption Pipeline</h2>
              <div className="flex gap-md">
                <span className="badge badge-primary">{steps.length} Steps</span>
                <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>~0.4s execution</span>
              </div>
            </div>

            {/* Input */}
            <div className="card-flat card-sm">
              <label className="label">Pipeline Input</label>
              <textarea
                className="textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter your input text..."
                style={{ minHeight: 80 }}
                id="pipeline-input"
              />
            </div>

            {/* Steps */}
            <div className="pipeline-steps" id="pipeline-steps">
              {steps.map((step, i) => (
                <div key={step.id}>
                  <div className="pipeline-step card-flat card-sm">
                    <div className="pipeline-step-header">
                      <div className="flex gap-md" style={{ alignItems: 'center' }}>
                        <GripVertical size={16} className="drag-handle" />
                        <span className="pipeline-step-num">{i + 1}</span>
                        <div>
                          <div className="text-body-bold">{step.name}</div>
                          <div className="text-caption" style={{ color: 'var(--color-steel)' }}>{step.params}</div>
                        </div>
                      </div>
                      <div className="flex gap-xs">
                        <button className="btn-icon" onClick={() => {
                          setSteps(prev => prev.map(s => s.id === step.id ? {...s, expanded: !s.expanded} : s))
                        }}>
                          {step.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button className="btn-icon" onClick={() => removeStep(step.id)} title="Remove step">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {step.expanded && (
                      <div className="pipeline-step-config animate-fade-in">
                        <div className="grid-2" style={{ marginTop: 'var(--space-base)' }}>
                          <div>
                            <label className="label">Parameter 1</label>
                            <select className="select"><option>Default</option></select>
                          </div>
                          <div>
                            <label className="label">Parameter 2</label>
                            <select className="select"><option>Auto</option></select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="pipeline-connector">
                      <div className="pipeline-connector-line" />
                      <span className="text-caption text-mono pipeline-preview">→ data flows</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Step */}
              <button className="pipeline-add-step" onClick={() => addStep('New Algorithm')} id="add-step-btn">
                <Plus size={20} />
                <span>Add Step</span>
              </button>
            </div>

            {/* Run */}
            <button
              className={`btn btn-cta btn-lg btn-full ${isRunning ? 'encrypting' : ''}`}
              onClick={handleRun}
              disabled={isRunning || steps.length === 0}
              id="run-pipeline-btn"
            >
              {isRunning ? 'Running Pipeline...' : <><Play size={18} /> Run Pipeline</>}
            </button>

            {/* Error */}
            {runError && (
              <div className="lab-error animate-fade-in-up" style={{ marginTop: 'var(--space-md)' }}>
                <div className="text-subtitle-lg" style={{ color: 'var(--color-critical)', marginBottom: 'var(--space-sm)' }}>
                  Pipeline Error
                </div>
                <div className="code-block" style={{ borderColor: 'var(--color-critical)' }}>
                  <code style={{ color: 'var(--color-critical)' }}>{runError}</code>
                </div>
              </div>
            )}

            {/* Output */}
            {output && (
              <div className="lab-output animate-fade-in-up" id="pipeline-output">
                <span className="text-subtitle-lg" style={{ marginBottom: 'var(--space-md)', display: 'block' }}>Pipeline Output</span>
                <div className="code-block">
                  <code style={{ wordBreak: 'break-all' }}>{output}</code>
                </div>
              </div>
            )}
          </main>
        </Panel>

        <PanelResizeHandle className="resize-handle">
          <div className="resize-handle-inner">
            <GripVertical size={14} />
          </div>
        </PanelResizeHandle>

        {/* Right - Summary */}
        <Panel defaultSize={25} minSize={20}>
          <aside className="pipeline-summary" id="pipeline-summary" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="card-flat card-sm">
              <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-lg)' }}>Pipeline Summary</h4>
              <div className="summary-stat">
                <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>Total Steps</span>
                <span className="text-heading-sm">{steps.length}</span>
              </div>
              <div className="summary-stat">
                <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>Est. Time</span>
                <span className="text-heading-sm">0.4s</span>
              </div>
              <div className="summary-stat">
                <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>Data Flow</span>
                <div className="text-caption text-mono" style={{ color: 'var(--color-primary)' }}>
                  {steps.map(s => s.name.split('-')[0].split(' ')[0]).join(' → ')}
                </div>
              </div>
            </div>
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  )
}
