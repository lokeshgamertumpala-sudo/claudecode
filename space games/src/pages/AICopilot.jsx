import { useState } from 'react'
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const suggestions = [
  'Optimize delta-V for Mars transfer',
  'Reduce spacecraft dry mass by 15%',
  'Analyze radiation shielding options',
  'Compare Hohmann vs bi-elliptic transfer',
  'Design lunar gateway resupply mission',
  'Calculate optimal launch window for Europa',
]

const aiResponses = {
  'optimize': 'For Mars transfer optimization, consider a **Type II trajectory** with a 260-day transfer. This reduces delta-V by ~0.8 km/s compared to Type I. Key parameters: C3 = 12.5 km²/s², arrival V∞ = 2.65 km/s. Recommend mid-course correction at 30% trajectory.',
  'mass': 'Mass reduction strategies: 1) Switch to **Carbon Composite** structure (-18% dry mass), 2) Use **integrated propellant tanks** (-12%), 3) **Miniaturize avionics** with COTS components (-8%), 4) **Remove redundancy** on non-critical systems (-5%). Combined potential: ~35% dry mass reduction.',
  'radiation': 'Radiation analysis for Jupiter mission: **Total dose ~150 krad** behind 10mm Al. Recommendations: 1) **Tantalum shielding** (2mm) reduces to 45 krad, 2) **Rad-hard electronics** rated to 100 krad, 3) **Vault architecture** for critical components, 4) **Orbit selection** to minimize time in radiation belts.',
  'transfer': '**Hohmann**: 258 days, ΔV=5.6 km/s. **Bi-elliptic**: 2.1 years, ΔV=5.1 km/s (saves 0.5 km/s but +500 days). **Low-thrust spiral**: 400 days, ΔV=4.2 km/s (requires 0.1N continuous thrust). For chemical propulsion, Hohmann is optimal. For electric, low-thrust wins.',
  'lunar': 'Lunar Gateway resupply: **NRHO orbit** (9:2 resonance). ΔV budget: TLI=3.1, NRHO insertion=0.4, rendezvous=0.1 km/s. Cargo: 5000kg (water, food, science). Use **CLPS lander** for surface delivery. Launch on **Falcon Heavy** or **SLS Block 1B**.',
  'europa': 'Europa Clipper optimal window: **Oct 2024** (backup 2025). Jupiter arrival: **April 2030**. Requires **Venus-Earth-Earth gravity assist** (VEEGA). ΔV=6.2 km/s. Radiation-hardened vault essential. 44 flybys planned. Power: **solar arrays** at 5.2 AU (600W).',
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '🚀 **ORBITFORGE AI Copilot** online. I can help with mission design, trajectory optimization, spacecraft engineering, and orbital mechanics. What would you like to explore?', timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = { id: Date.now(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    const query = input
    setInput('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    let response = aiResponses.optimize
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('mass') || lowerQuery.includes('weight')) response = aiResponses.mass
    else if (lowerQuery.includes('radiation') || lowerQuery.includes('shield')) response = aiResponses.radiation
    else if (lowerQuery.includes('transfer') || lowerQuery.includes('hohmann') || lowerQuery.includes('bi-elliptic')) response = aiResponses.transfer
    else if (lowerQuery.includes('lunar') || lowerQuery.includes('gateway') || lowerQuery.includes('moon')) response = aiResponses.lunar
    else if (lowerQuery.includes('europa') || lowerQuery.includes('jupiter') || lowerQuery.includes('clipper')) response = aiResponses.europa

    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response, timestamp: new Date() }])
    setIsLoading(false)
  }

  const handleSuggestion = (suggestion) => {
    setInput(suggestion)
    handleSend()
  }

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            AI Mission Copilot
          </h1>
          <p className="text-muted-foreground mt-1">Intelligent assistance for mission design and engineering analysis</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Sparkles className="w-4 h-4" />
            <span>Suggestions:</span>
            <div className="flex flex-wrap gap-2 ml-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="btn-ghost btn-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6" role="log" aria-live="polite">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {msg.role === 'user' ? <Zap className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary text-foreground rounded-tl-none prose prose-sm dark:prose-invert max-w-none'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 hover:bg-secondary/50 rounded text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={copiedId === msg.id ? 'Copied!' : 'Copy'}
                      >
                        {copiedId === msg.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-secondary/30">
          <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about trajectories, propulsion, orbital mechanics..."
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}