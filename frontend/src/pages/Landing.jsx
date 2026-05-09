import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Eye, Layers, Trophy, ArrowRight, Zap, Lock, Shield, Cpu, Activity, Database } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import './Landing.css'

const floatingSymbols = ['AES', '🔐', 'SHA', '⊕', 'RSA', '01', 'π', '∑', 'CBC', '🔑', 'HMAC', '∞']

const algorithms = [
  "AES-256-CBC", "RSA-2048", "SHA-256", "Blowfish", "ChaCha20", "HMAC", "PBKDF2", "Argon2", "Bcrypt", "Scrypt", "ROT13", "Base64"
]

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="landing" id="landing-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          {floatingSymbols.map((sym, i) => (
            <motion.span
              key={i}
              className="hero-symbol"
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, -20, 0],
                opacity: [0, 0.8, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 6 + (i % 4),
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
              style={{
                left: `${8 + (i * 7.5) % 85}%`,
                top: `${10 + (i * 13) % 70}%`,
                fontSize: `${14 + (i % 4) * 8}px`,
              }}
            >
              {sym}
            </motion.span>
          ))}
          <div className="hero-glow"></div>
        </div>
        
        <motion.div 
          className="hero-content container"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="badge badge-primary hero-badge">v2.0 Now Live</div>
            <h1 className="text-hero hero-title">
              Master Cryptography<br />
              <span className="text-gradient">Through Play</span>
            </h1>
            <p className="hero-subtitle">
              The gamified lab where algorithms come alive.
              Build complex pipelines, visualize encryption, and level up your security skills.
            </p>
            <div className="hero-ctas">
              <Link to="/explore" className="btn btn-primary btn-lg btn-glow">
                Start Forging <ArrowRight size={18} />
              </Link>
              <a href="#showcase" className="btn btn-secondary btn-lg hero-btn-secondary">
                See How It Works
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...algorithms, ...algorithms].map((algo, i) => (
            <span key={i} className="marquee-item">
              <Cpu size={14} className="marquee-icon" /> {algo}
            </span>
          ))}
        </div>
      </div>

      {/* Showcase Sections */}
      <div id="showcase" className="showcase-wrapper">
        
        {/* Showcase 1: The Lab */}
        <section className="section showcase-section">
          <div className="container grid-2 align-center">
            <motion.div 
              className="showcase-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="feature-icon"><Eye size={28} /></div>
              <h2 className="text-display">Interactive Crypto Lab</h2>
              <p className="text-subtitle-md showcase-desc">
                Stop reading about encryption and start seeing it. Our interactive lab lets you 
                visualize every transformation, block mode, and padding scheme in real-time. 
                Type plaintext and instantly see the ciphertext morph before your eyes.
              </p>
              <ul className="showcase-list">
                <li><Zap size={16}/> Real-time execution of AES, RSA, and more</li>
                <li><Zap size={16}/> Step-by-step cryptographic breakdowns</li>
                <li><Zap size={16}/> Instant base64 and hex encodings</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="showcase-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-panel mockup-window">
                <div className="mockup-header">
                  <span className="dot bg-critical"></span>
                  <span className="dot bg-warning"></span>
                  <span className="dot bg-success"></span>
                  <span className="mockup-title">Lab / AES-256</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-line">Input: "Hello World"</div>
                  <div className="mockup-line accent">Encrypting (CBC Mode)...</div>
                  <div className="mockup-line">IV: 4f8a9e2...</div>
                  <div className="mockup-line success">Output: 8a4b2c1f9d...</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Showcase 2: Pipelines */}
        <section className="section showcase-section bg-darker">
          <div className="container grid-2 align-center reversed-desktop">
            <motion.div 
              className="showcase-text"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="feature-icon"><Layers size={28} /></div>
              <h2 className="text-display">Build Complex Pipelines</h2>
              <p className="text-subtitle-md showcase-desc">
                Why stop at one algorithm? Chain multiple operations together just like CyberChef. 
                Base64 decode, decrypt with AES, and hash the result—all in a single visual pipeline.
              </p>
              <Link to="/pipelines" className="btn btn-ghost mt-4">
                Try the Builder <ArrowRight size={16} />
              </Link>
            </motion.div>
            
            <motion.div 
              className="showcase-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="pipeline-mockup">
                <motion.div className="node" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Database size={16}/> Base64 Decode
                </motion.div>
                <div className="connector"></div>
                <motion.div className="node node-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}>
                  <Lock size={16}/> AES-256 Decrypt
                </motion.div>
                <div className="connector"></div>
                <motion.div className="node" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.4 }}>
                  <Activity size={16}/> SHA-256 Hash
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Showcase 3: Gamification */}
        <section className="section showcase-section">
          <div className="container grid-2 align-center">
            <motion.div 
              className="showcase-text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="feature-icon"><Trophy size={28} /></div>
              <h2 className="text-display">Gamified Learning</h2>
              <p className="text-subtitle-md showcase-desc">
                Put your knowledge to the test in the Challenge Arena. Solve cryptographic puzzles, 
                crack weak ciphers, and earn XP to level up your profile.
              </p>
              <div className="xp-bar-container mt-4">
                <div className="flex-between mb-2">
                  <span className="text-body-sm-bold">Level 12 Cryptographer</span>
                  <span className="text-caption">2,450 / 3,000 XP</span>
                </div>
                <div className="progress-bar">
                  <motion.div 
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="showcase-visual grid-2 gap-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {['Caesar\'s Secret', 'Padding Oracle', 'Key Collision', 'Base64 Madness'].map((title, i) => (
                <motion.div 
                  key={i} 
                  className="card card-sm glass-card"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="badge badge-warning mb-2">+150 XP</div>
                  <h4 className="text-body-bold">{title}</h4>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>

      {/* Stats Banner */}
      <section className="stats-banner" id="stats-banner">
        <div className="container flex-center" style={{ gap: 'var(--space-section)' }}>
          <StatCounter icon={<Zap size={24} />} end={12847} label="Algorithms Executed" suffix="+" />
          <StatCounter icon={<Shield size={24} />} end={45} label="Available Ciphers" suffix="+" />
          <StatCounter icon={<Lock size={24} />} end={2100} label="Active Learners" suffix="+" />
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section" id="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display" style={{ marginBottom: 'var(--space-base)' }}>
              Ready to start forging?
            </h2>
            <p className="text-subtitle-md" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xxl)', maxWidth: '600px', margin: '0 auto var(--space-xxl)' }}>
              Join thousands of university students mastering cryptography the fun way. 
              Open source, completely free, and infinitely hackable.
            </p>
            <Link to="/auth" className="btn btn-cta btn-lg btn-glow" id="cta-signup">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function StatCounter({ icon, end, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 2000;
          const startTime = performance.now();
          
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            setCount(Math.floor(easeProgress * end));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div className="stat-item" ref={nodeRef}>
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-text">
        <span className="stat-number">{count.toLocaleString()}{suffix}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}
