import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Play, Copy, RefreshCw, CheckCircle, Code2, BarChart3, BookOpen, GripVertical, ArrowLeft, Search } from 'lucide-react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { api } from '../lib/api'
import './Lab.css'

/* ─── Algorithm Picker (shown when no algorithmId is in the URL) ─── */
function AlgorithmPicker() {
  const [algorithms, setAlgorithms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAlgorithms()
      .then(data => { setAlgorithms(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = algorithms.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const categoryBadgeClass = {
    'Symmetric': 'badge-symmetric',
    'Asymmetric': 'badge-asymmetric',
    'Hash Functions': 'badge-hash',
    'Key Exchange': 'badge-key-exchange',
    'Digital Signatures': 'badge-critical',
    'Classical Ciphers': 'badge-classical',
    'Math Functions': 'badge-primary',
    'Encoding': 'badge-success',
  }

  return (
    <div className="lab-picker" id="lab-picker">
      <div className="lab-picker-header">
        <h1 className="text-heading-lg">Choose an Algorithm</h1>
        <p className="text-body" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-sm)' }}>
          Select an algorithm to open the interactive lab playground.
        </p>
      </div>

      <div className="lab-picker-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="input-search"
          placeholder="Search algorithms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="lab-search"
          style={{ width: '100%' }}
        />
      </div>

      {loading && <p style={{ color: 'var(--color-steel)', textAlign: 'center' }}>Loading algorithms...</p>}

      <div className="lab-picker-grid" id="lab-picker-grid">
        {!loading && filtered.map((algo, i) => (
          <Link
            to={`/lab/${algo.id}`}
            key={algo.id}
            className="card lab-picker-card animate-fade-in-up"
            style={{ animationDelay: `${i * 0.03}s`, textDecoration: 'none', color: 'inherit' }}
          >
            <h3 className="text-heading-sm">{algo.name}</h3>
            <div className="flex gap-md" style={{ alignItems: 'center' }}>
              <span className={`badge ${categoryBadgeClass[algo.category] || ''}`}>{algo.category}</span>
              <span className="text-mono text-caption" style={{ color: 'var(--color-steel)' }}>{algo.complexity}</span>
            </div>
            <div className="difficulty-dots" style={{ marginTop: 'var(--space-xs)' }}>
              {[1,2,3,4,5].map(d => (
                <span key={d} className={`difficulty-dot ${d <= algo.difficulty ? 'filled' : ''}`} />
              ))}
            </div>
            <p className="text-body-sm" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-xs)' }}>
              {algo.description}
            </p>
          </Link>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="explore-empty" style={{ gridColumn: '1 / -1' }}>
            <p className="text-body" style={{ color: 'var(--color-steel)' }}>No algorithms match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}


/* ─── Dynamic parameter builder from algorithm metadata ─── */
function buildParamFields(parameters) {
  return parameters.map(p => {
    switch (p) {
      case 'key_size':
        return { name: 'key_size', label: 'Key Size', type: 'select', options: ['128', '192', '256'], default: '256' }
      case 'mode':
        return { name: 'mode', label: 'Mode', type: 'select', options: ['ECB', 'CBC', 'CTR', 'GCM'], default: 'CBC' }
      case 'output_format':
        return null // handled by output format tabs
      case 'shift':
        return { name: 'shift', label: 'Shift Value', type: 'number', default: '3' }
      case 'key':
        return { name: 'key', label: 'Key', type: 'text', default: '' }
      case 'key1':
        return { name: 'key1', label: 'Key 1', type: 'text', default: '' }
      case 'key2':
        return { name: 'key2', label: 'Key 2', type: 'text', default: '' }
      case 'a':
        return { name: 'a', label: 'Coefficient a', type: 'number', default: '5' }
      case 'b':
        return { name: 'b', label: 'Coefficient b', type: 'number', default: '8' }
      case 'bits':
        return { name: 'bits', label: 'Key Bits', type: 'select', options: ['1024', '2048', '4096'], default: '2048' }
      case 'p':
        return { name: 'p', label: 'Prime p', type: 'number', default: '23' }
      case 'g':
        return { name: 'g', label: 'Generator g', type: 'number', default: '5' }
      case 'private_key':
        return { name: 'private_key', label: 'Private Key', type: 'number', default: '6' }
      default:
        return { name: p, label: p.charAt(0).toUpperCase() + p.slice(1), type: 'text', default: '' }
    }
  }).filter(Boolean)
}


/* ─── Main Lab Component ─── */
export default function Lab() {
  const { algorithmId } = useParams()
  const navigate = useNavigate()

  // Algorithm metadata
  const [algo, setAlgo] = useState(null)
  const [algoLoading, setAlgoLoading] = useState(true)
  const [algoError, setAlgoError] = useState(null)

  // Source code
  const [sourceCode, setSourceCode] = useState('')

  // Lab state
  const [plaintext, setPlaintext] = useState('Hello, CryptoForge! This is a test message.')
  const [params, setParams] = useState({})
  const [output, setOutput] = useState('')
  const [outputFormat, setOutputFormat] = useState('hex')
  const [activeTab, setActiveTab] = useState('how')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [execError, setExecError] = useState(null)

  // Fetch algorithm details
  useEffect(() => {
    if (!algorithmId) return

    setAlgoLoading(true)
    setAlgoError(null)
    setOutput('')
    setExecError(null)
    setActiveTab('how')

    api.getAlgorithm(algorithmId)
      .then(data => {
        setAlgo(data)
        // Initialize params with defaults
        const fields = buildParamFields(data.parameters || [])
        const defaults = {}
        fields.forEach(f => { defaults[f.name] = f.default })
        setParams(defaults)
        setAlgoLoading(false)
      })
      .catch(err => {
        setAlgoError(err.message)
        setAlgoLoading(false)
      })

    // Fetch source code
    api.getAlgorithmCode(algorithmId)
      .then(data => setSourceCode(data.code || '# Source not available'))
      .catch(() => setSourceCode('# Source code could not be loaded'))
  }, [algorithmId])

  // If no algorithmId, show picker (AFTER all hooks)
  if (!algorithmId) {
    return <AlgorithmPicker />
  }


  const handleExecute = async () => {
    setIsEncrypting(true)
    setExecError(null)
    setOutput('')
    try {
      const result = await api.executeAlgorithm(algorithmId, {
        input: plaintext,
        params,
        output_format: outputFormat,
      })
      // Extract meaningful output from the result
      const res = result.result || result
      const outputVal = res.ciphertext || res.hash || res.hmac || res.output || JSON.stringify(res, null, 2)
      setOutput(typeof outputVal === 'string' ? outputVal : JSON.stringify(outputVal, null, 2))
    } catch (err) {
      setExecError(err.message)
    }
    setIsEncrypting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateParam = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }))
  }

  // Loading state
  if (algoLoading) {
    return (
      <div className="lab-page" id="lab-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} className="spin" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-lg)' }} />
          <p className="text-body" style={{ color: 'var(--color-steel)' }}>Loading algorithm...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (algoError) {
    return (
      <div className="lab-page" id="lab-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 className="text-heading-sm" style={{ marginBottom: 'var(--space-md)' }}>Algorithm Not Found</h2>
          <p className="text-body" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xl)' }}>
            Could not load "{algorithmId}". {algoError}
          </p>
          <Link to="/lab" className="btn btn-primary">← Browse Algorithms</Link>
        </div>
      </div>
    )
  }

  const paramFields = buildParamFields(algo.parameters || [])

  const categoryBadgeClass = {
    'Symmetric': 'badge-symmetric',
    'Asymmetric': 'badge-asymmetric',
    'Hash Functions': 'badge-hash',
    'Key Exchange': 'badge-key-exchange',
    'Digital Signatures': 'badge-critical',
    'Classical Ciphers': 'badge-classical',
    'Math Functions': 'badge-primary',
    'Encoding': 'badge-success',
  }

  return (
    <div className="lab-page" id="lab-page">
      <PanelGroup direction="horizontal" className="lab-layout-panels">
        {/* Left Panel - Algorithm Info */}
        <Panel defaultSize={25} minSize={20}>
          <aside className="lab-info" id="lab-info-panel" style={{ height: '100%', overflowY: 'auto', paddingRight: 'var(--space-md)' }}>
            <div className="card-flat card-sm">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/lab')}
                style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
              >
                <ArrowLeft size={14} /> All Algorithms
              </button>

              <h2 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
                {algo.name}
              </h2>
              <div className="flex gap-md" style={{ marginBottom: 'var(--space-sm)' }}>
                <span className={`badge ${categoryBadgeClass[algo.category] || ''}`}>{algo.category}</span>
                <div className="difficulty-dots">
                  {[1,2,3,4,5].map(d => (
                    <span key={d} className={`difficulty-dot ${d <= algo.difficulty ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
              <p className="text-body-sm" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-lg)' }}>
                {algo.description}
              </p>

              <div className="pill-tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                <button className={`pill-tab ${activeTab === 'how' ? 'active' : ''}`} onClick={() => setActiveTab('how')}>
                  <BookOpen size={14} /> How It Works
                </button>
                <button className={`pill-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
                  <Code2 size={14} /> Source Code
                </button>
                <button className={`pill-tab ${activeTab === 'complexity' ? 'active' : ''}`} onClick={() => setActiveTab('complexity')}>
                  <BarChart3 size={14} /> Complexity
                </button>
              </div>

              {activeTab === 'how' && (
                <div className="algo-how-section">
                  <div className="algo-step">
                    <div className="algo-step-num">1</div>
                    <div>
                      <div className="text-body-sm-bold">Input</div>
                      <div className="text-caption" style={{ color: 'var(--color-steel)' }}>
                        User provides plaintext and configuration parameters.
                      </div>
                    </div>
                  </div>
                  <div className="algo-step">
                    <div className="algo-step-num">2</div>
                    <div>
                      <div className="text-body-sm-bold">Process</div>
                      <div className="text-caption" style={{ color: 'var(--color-steel)' }}>
                        The {algo.name} algorithm processes the input using configured parameters.
                      </div>
                    </div>
                  </div>
                  <div className="algo-step">
                    <div className="algo-step-num">3</div>
                    <div>
                      <div className="text-body-sm-bold">Complexity</div>
                      <div className="text-caption" style={{ color: 'var(--color-steel)' }}>
                        Runtime complexity: <strong>{algo.complexity}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="algo-step">
                    <div className="algo-step-num">4</div>
                    <div>
                      <div className="text-body-sm-bold">Output</div>
                      <div className="text-caption" style={{ color: 'var(--color-steel)' }}>
                        The result is returned in the selected output format.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="code-block" style={{ fontSize: '12px', maxHeight: 400, overflow: 'auto' }}>
                  <code style={{ whiteSpace: 'pre-wrap' }}>{sourceCode}</code>
                </div>
              )}

              {activeTab === 'complexity' && (
                <div className="algo-complexity">
                  <div className="complexity-row">
                    <span className="text-body-sm">Complexity</span>
                    <span className="text-mono text-body-sm-bold">{algo.complexity}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Category</span>
                    <span className="text-mono text-body-sm-bold">{algo.category}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Difficulty</span>
                    <span className="text-mono text-body-sm-bold">{algo.difficulty} / 5</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Parameters</span>
                    <span className="text-mono text-body-sm-bold">{algo.parameters.length || 'None'}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </Panel>

        <PanelResizeHandle className="resize-handle">
          <div className="resize-handle-inner">
            <GripVertical size={14} />
          </div>
        </PanelResizeHandle>

        {/* Center Panel - Playground */}
        <Panel defaultSize={50} minSize={30}>
          <main className="lab-playground" id="lab-playground" style={{ height: '100%', overflowY: 'auto', padding: '0 var(--space-md)' }}>
            <div className="card-flat card-sm">
              <label className="label">Input</label>
              <textarea
                className="textarea"
                value={plaintext}
                onChange={e => setPlaintext(e.target.value)}
                placeholder="Enter your input text here..."
                id="plaintext-input"
              />
              <div className="text-caption" style={{ color: 'var(--color-steel)', textAlign: 'right', marginTop: 'var(--space-xs)' }}>
                {plaintext.length} chars
              </div>
            </div>

            {/* Dynamic Configuration */}
            {paramFields.length > 0 && (
              <div className="card-flat card-sm lab-params" id="lab-params">
                <div className="text-subtitle-lg" style={{ marginBottom: 'var(--space-base)' }}>Configuration</div>
                <div className="grid-2">
                  {paramFields.map(field => (
                    <div key={field.name}>
                      <label className="label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          className="select"
                          value={params[field.name] || field.default}
                          onChange={e => updateParam(field.name, e.target.value)}
                        >
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          className="input"
                          type="number"
                          value={params[field.name] || field.default}
                          onChange={e => updateParam(field.name, e.target.value)}
                          placeholder={field.label}
                        />
                      ) : (
                        <input
                          className="input"
                          type="text"
                          value={params[field.name] || field.default}
                          onChange={e => updateParam(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`btn btn-cta btn-lg btn-full ${isEncrypting ? 'encrypting' : ''}`}
              onClick={handleExecute}
              disabled={isEncrypting}
              id="encrypt-btn"
            >
              {isEncrypting ? (
                <><RefreshCw size={18} className="spin" /> Processing...</>
              ) : (
                <><Play size={18} /> Execute {algo.name} →</>
              )}
            </button>

            {execError && (
              <div className="lab-error animate-fade-in-up" id="error-section">
                <div className="text-subtitle-lg" style={{ color: 'var(--color-critical)', marginBottom: 'var(--space-sm)' }}>
                  Execution Error
                </div>
                <div className="code-block" style={{ borderColor: 'var(--color-critical)' }}>
                  <code style={{ color: 'var(--color-critical)' }}>{execError}</code>
                </div>
              </div>
            )}

            {output && (
              <div className="lab-output animate-fade-in-up" id="output-section">
                <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                  <span className="text-subtitle-lg">Output</span>
                  <div className="flex gap-xs">
                    <div className="pill-tabs">
                      {['hex', 'base64', 'raw'].map(fmt => (
                        <button key={fmt} className={`pill-tab ${outputFormat === fmt ? 'active' : ''}`} onClick={() => setOutputFormat(fmt)}>
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button className="btn-icon" onClick={handleCopy} title="Copy output" id="copy-output">
                      {copied ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="code-block">
                  <code style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{output}</code>
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

        {/* Right Panel - Details & Info */}
        <Panel defaultSize={25} minSize={20}>
          <aside className="lab-viz" id="lab-viz-panel" style={{ height: '100%', overflowY: 'auto', paddingLeft: 'var(--space-md)' }}>
            <div className="card-flat card-sm">
              <div className="flex gap-md" style={{ marginBottom: 'var(--space-xl)', alignItems: 'center' }}>
                <h4 className="text-subtitle-lg">Algorithm Details</h4>
                <span className="viz-pulse" />
              </div>

              <div className="lab-detail-rows">
                <div className="lab-detail-row">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Name</span>
                  <span className="text-body-sm-bold">{algo.name}</span>
                </div>
                <div className="lab-detail-row">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Category</span>
                  <span className={`badge badge-sm ${categoryBadgeClass[algo.category] || ''}`}>{algo.category}</span>
                </div>
                <div className="lab-detail-row">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Complexity</span>
                  <span className="text-mono text-body-sm-bold">{algo.complexity}</span>
                </div>
                <div className="lab-detail-row">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Difficulty</span>
                  <div className="difficulty-dots">
                    {[1,2,3,4,5].map(d => (
                      <span key={d} className={`difficulty-dot ${d <= algo.difficulty ? 'filled' : ''}`} />
                    ))}
                  </div>
                </div>
                <div className="lab-detail-row">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Parameters</span>
                  <span className="text-body-sm">{algo.parameters.length > 0 ? algo.parameters.join(', ') : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-flat card-sm" style={{ marginTop: 'var(--space-xl)' }}>
              <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-base)' }}>Quick Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <Link to="/explore" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start' }}>
                  ← Back to Explore
                </Link>
                <Link to="/pipelines" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start' }}>
                  Use in Pipeline →
                </Link>
              </div>
            </div>
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  )
}
