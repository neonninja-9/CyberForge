import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Play, Copy, RefreshCw, CheckCircle, Code2, BarChart3, BookOpen, GripVertical } from 'lucide-react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import './Lab.css'

const aesSteps = [
  { num: 1, title: 'Key Expansion', desc: 'The 256-bit key is expanded into 15 round keys using the Rijndael key schedule.' },
  { num: 2, title: 'Initial Round', desc: 'AddRoundKey — XOR plaintext block with the first round key.' },
  { num: 3, title: 'Main Rounds (14×)', desc: 'SubBytes → ShiftRows → MixColumns → AddRoundKey repeated for 14 rounds.' },
  { num: 4, title: 'Final Round', desc: 'SubBytes → ShiftRows → AddRoundKey (no MixColumns in the final round).' },
  { num: 5, title: 'Output', desc: '128-bit encrypted ciphertext block is produced.' },
]

const vizSteps = ['Plaintext', 'Key XOR', 'SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey', 'Output']

export default function Lab() {
  const { algorithmId } = useParams()
  const [plaintext, setPlaintext] = useState('Hello, CryptoForge! This is a test message.')
  const [keySize, setKeySize] = useState('256')
  const [mode, setMode] = useState('CBC')
  const [output, setOutput] = useState('')
  const [outputFormat, setOutputFormat] = useState('hex')
  const [activeTab, setActiveTab] = useState('how')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [activeVizStep, setActiveVizStep] = useState(3)
  const [copied, setCopied] = useState(false)

  const handleEncrypt = async () => {
    setIsEncrypting(true)
    // Simulate encryption with animation
    for (let i = 0; i < vizSteps.length; i++) {
      setActiveVizStep(i)
      await new Promise(r => setTimeout(r, 200))
    }
    setOutput('4a2f8c9d1e3b7a5f0d6c8e2b9a4f1c7d3e5b8a0f2c6d9e1b4a7c0f3d6e8b2a5c1d4f7e0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4')
    setIsEncrypting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="lab-page" id="lab-page">
      <PanelGroup direction="horizontal" className="lab-layout-panels">
        {/* Left Panel - Algorithm Info */}
        <Panel defaultSize={25} minSize={20}>
          <aside className="lab-info" id="lab-info-panel" style={{ height: '100%', overflowY: 'auto', paddingRight: 'var(--space-md)' }}>
            <div className="card-flat card-sm">
              <h2 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
                AES-256-CBC
              </h2>
              <div className="flex gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
                <span className="badge badge-symmetric">Symmetric</span>
                <div className="difficulty-dots">
                  {[1,2,3,4,5].map(d => (
                    <span key={d} className={`difficulty-dot ${d <= 4 ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>

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
                <div className="algo-steps">
                  {aesSteps.map(step => (
                    <div className="algo-step" key={step.num}>
                      <div className="algo-step-num">{step.num}</div>
                      <div>
                        <div className="text-body-sm-bold">{step.title}</div>
                        <div className="text-caption" style={{ color: 'var(--color-steel)' }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'code' && (
                <div className="code-block" style={{ fontSize: '12px' }}>
                  <code>{`from cryptography.hazmat.primitives.ciphers import (
    Cipher, algorithms, modes
)
import os

def encrypt_aes_cbc(plaintext, key):
    iv = os.urandom(16)
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv)
    )
    encryptor = cipher.encryptor()
    # PKCS7 padding
    pad_len = 16 - (len(plaintext) % 16)
    padded = plaintext + bytes([pad_len] * pad_len)
    ct = encryptor.update(padded) + encryptor.finalize()
    return iv + ct`}</code>
                </div>
              )}

              {activeTab === 'complexity' && (
                <div className="algo-complexity">
                  <div className="complexity-row">
                    <span className="text-body-sm">Time Complexity</span>
                    <span className="text-mono text-body-sm-bold">O(1) per block</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Space Complexity</span>
                    <span className="text-mono text-body-sm-bold">O(1)</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Key Schedule</span>
                    <span className="text-mono text-body-sm-bold">O(n)</span>
                  </div>
                  <div className="complexity-row">
                    <span className="text-body-sm">Rounds (256-bit)</span>
                    <span className="text-mono text-body-sm-bold">14</span>
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
              <label className="label">Your Plaintext</label>
              <textarea
                className="textarea"
                value={plaintext}
                onChange={e => setPlaintext(e.target.value)}
                placeholder="Enter your plaintext here..."
                id="plaintext-input"
              />
              <div className="text-caption" style={{ color: 'var(--color-steel)', textAlign: 'right', marginTop: 'var(--space-xs)' }}>
                {plaintext.length} / 256 chars
              </div>
            </div>

            <div className="card-flat card-sm lab-params" id="lab-params">
              <div className="text-subtitle-lg" style={{ marginBottom: 'var(--space-base)' }}>Configuration</div>
              <div className="grid-2">
                <div>
                  <label className="label">Key Size</label>
                  <select className="select" value={keySize} onChange={e => setKeySize(e.target.value)} id="key-size">
                    <option value="128">128-bit</option>
                    <option value="192">192-bit</option>
                    <option value="256">256-bit</option>
                  </select>
                </div>
                <div>
                  <label className="label">Mode</label>
                  <select className="select" value={mode} onChange={e => setMode(e.target.value)} id="mode-select">
                    <option value="ECB">ECB</option>
                    <option value="CBC">CBC</option>
                    <option value="CTR">CTR</option>
                    <option value="GCM">GCM</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-base)' }}>
                <label className="label">Encryption Key</label>
                <div className="flex gap-md">
                  <input className="input" placeholder="Auto-generated 256-bit key" readOnly id="key-input" />
                  <button className="btn btn-ghost btn-sm" id="generate-key">
                    <RefreshCw size={14} /> Generate
                  </button>
                </div>
              </div>
            </div>

            <button
              className={`btn btn-cta btn-lg btn-full ${isEncrypting ? 'encrypting' : ''}`}
              onClick={handleEncrypt}
              disabled={isEncrypting}
              id="encrypt-btn"
            >
              {isEncrypting ? (
                <><RefreshCw size={18} className="spin" /> Encrypting...</>
              ) : (
                <><Play size={18} /> Encrypt →</>
              )}
            </button>

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

        {/* Right Panel - Visualization */}
        <Panel defaultSize={25} minSize={20}>
          <aside className="lab-viz" id="lab-viz-panel" style={{ height: '100%', overflowY: 'auto', paddingLeft: 'var(--space-md)' }}>
            <div className="card-flat card-sm">
              <div className="flex gap-md" style={{ marginBottom: 'var(--space-xl)', alignItems: 'center' }}>
                <h4 className="text-subtitle-lg">Live Visualization</h4>
                <span className="viz-pulse" />
              </div>
              <div className="text-caption" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-lg)' }}>
                Round {Math.min(activeVizStep + 1, 7)} of 14
              </div>
              <div className="viz-steps">
                {vizSteps.map((step, i) => (
                  <div key={i} className={`viz-step ${i === activeVizStep ? 'active' : ''} ${i < activeVizStep ? 'done' : ''}`}>
                    <div className="viz-step-dot" />
                    <span className="text-body-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  )
}
