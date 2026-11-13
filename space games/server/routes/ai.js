import express from 'express'

const router = express.Router()

const knowledgeBase = {
  'delta-v optimization': {
    response: `**Delta-V Optimization Strategies:**

1. **Trajectory Selection**: Choose optimal transfer type for your mission:
   - **Hohmann**: Minimum energy, longest transfer time
   - **Bi-elliptic**: Saves ΔV for large radius ratios (>11.94), but longer
   - **Low-thrust spiral**: Continuous thrust, significantly lower ΔV but requires high Isp
   - **Gravity assist**: Use planetary flybys to reduce ΔV

2. **Launch Window Optimization**:
   - Use porkchop plots to find optimal departure/arrival dates
   - For Mars: ~26 month synodic period, Type I/II transfers
   - For outer planets: Gravity assist sequences critical

3. **Staging Optimization**:
   - Optimal mass ratio per stage: e^(-ΔV/Isp/g0)
   - Typical 2-3 stages for chemical, single stage for electric
   - Drop tanks when empty to reduce dry mass

4. **Propulsion Technology**:
   - Chemical: Isp 300-450s, high thrust
   - Nuclear thermal: Isp 800-1000s, moderate thrust
   - Electric (Hall/ion): Isp 1500-3000s, very low thrust
   - Consider hybrid architectures`,
    tags: ['trajectory', 'propulsion', 'optimization']
  },
  'mass reduction': {
    response: `**Spacecraft Mass Reduction Techniques:**

**Structure (20-30% savings potential):**
- Carbon fiber composites vs aluminum: -30-40% structural mass
- Integrated tank/structure design: -15-20%
- Additive manufacturing for complex geometries: -10-15%
- Topology optimization: -10-20%

**Propulsion (10-20% savings):**
- Composite overwrapped pressure vessels (COPVs): -40% tank mass
- Integrated propulsion modules: -15%
- Electric propulsion for stationkeeping: -50% propellant vs chemical

**Avionics & Power (5-15% savings):**
- COTS components with rad-tolerant design: -30% avionics mass
- Advanced solar arrays (multi-junction, deployable): -25% power system mass
- Lithium-sulfur batteries: -40% vs Li-ion

**Systems Engineering:**
- Mass growth allowance: 10-20% for early phases, 3-5% for CDR
- Requirements scrubbing: Remove unnecessary margins
- Multi-functional structures (structure + thermal + radiation)`,
    tags: ['mass', 'structure', 'optimization']
  },
  'radiation hardening': {
    response: `**Radiation Hardening for Deep Space:**

**Environment Models:**
- **Earth orbit**: AP-8/AE-8 trapped radiation belts
- **Jupiter**: Extreme radiation - Europa receives ~5.4 Sv/day unshielded
- **Solar particle events**: Up to 1000 MeV protons, sporadic
- **Galactic cosmic rays**: High energy, isotropic, ~0.5 mSv/day

**Shielding Approaches:**
1. **Material selection** (areal density g/cm²):
   - Aluminum: Baseline, 10 g/cm² = ~10 mm
   - Tantalum: 2.5x Al effectiveness per mass
   - Polyethylene: Best for neutrons, hydrogen-rich
   - Water/logistics: Dual-use shielding

2. **Architecture:**
   - **Vault**: Centralized shielding for sensitive electronics
   - **Distributed**: Component-level spot shielding
   - **Storm shelter**: Crew refuge for SPEs

3. **Design margins:**
   - Total Ionizing Dose (TID): Design to 2x predicted
   - Single Event Effects (SEE): Rate prediction + hardening
   - Displacement Damage Dose (DDD): Solar cell degradation`,
    tags: ['radiation', 'shielding', 'environment']
  },
  'thermal control': {
    response: `**Spacecraft Thermal Control Systems:**

**Passive Systems:**
- **MLI blankets**: 10-30 layers, 0.5-1 mm thick, ε<0.03
- **Surface coatings**: White paint (α/ε≈0.2/0.8), OSR (α/ε≈0.1/0.8)
- **Thermal straps**: Flexible conductive links
- **Heat pipes**: Two-phase, high conductivity, no power
- **Phase change materials**: Latent heat storage

**Active Systems:**
- **Fluid loops**: Pumped single/two-phase, 100-10000 W capacity
- **Thermoelectric coolers**: Spot cooling, low efficiency
- **Cryocoolers**: For IR detectors, 50-150 K
- **Heaters**: Survival (rh), operational (oh), decontamination

**Environment Cases:**
- **Hot case**: Max solar flux + max internal dissipation
- **Cold case**: Min solar flux (eclipse) + min dissipation
- **Transient**: Eclipse entry/exit, maneuver heating

**Design Process:**
1. Thermal math model (TMM) with 50-500 nodes
2. Correlation with TVAC test data
3. Uncertainty margins: ±5-10°C typical`,
    tags: ['thermal', 'control', 'systems']
  },
  'communications': {
    response: `**Deep Space Communications:**

**Link Budget Equation:**
Pr = Pt + Gt + Gr - Lfs - Latm - Lpoint - Lpol - Limpl

Where:
- Pt = Transmit power (dBW)
- Gt, Gr = Antenna gains (dBi)
- Lfs = Free space loss = 20log10(4πR/λ)
- Latm = Atmospheric attenuation
- Lpoint = Pointing loss
- Lpol = Polarization loss
- Limpl = Implementation loss (2-3 dB)

**Frequency Bands:**
- **S-band** (2-4 GHz): TT&C, near-Earth, 2-10 m antennas
- **X-band** (8-12 GHz): Primary deep space, 34-70 m DSN
- **Ka-band** (26-40 GHz): High data rate, 4x X-band capacity
- **Optical**: 10-100x RF, but weather/cloud limited

**DSN Capabilities:**
- 34m BWG: X-up/Ka-down, 150 Mbps at Mars
- 70m: X-up/X-down, 6 Mbps at Neptune
- Arraying: Combine multiple antennas for +3-6 dB

**Coding & Modulation:**
- Turbo/LDPC codes: 1-2 dB gain over convolutional
- BPSK/QPSK/8PSK/16APSK/32APSK adaptive
- CCSDS standards for interoperability`,
    tags: ['communications', 'link-budget', 'dsn']
  },
  'launch vehicles': {
    response: `**Current Launch Vehicle Capabilities (to LEO/GTO/TLI):**

| Vehicle | LEO (t) | GTO (t) | TLI (t) | Status | Cost/Launch |
|---------|---------|---------|---------|--------|-------------|
| Falcon 9 | 22.8 | 8.3 | 4.0 | Operational | $67M |
| Falcon Heavy | 63.8 | 26.7 | 16.8 | Operational | $97M |
| Atlas V 551 | 18.8 | 8.9 | 4.7 | Retiring | $153M |
| Delta IV Heavy | 28.4 | 14.2 | 7.5 | Retiring | $350M |
| Vulcan VC6 | 27.2 | 14.4 | 7.8 | Development | ~$100M |
| SLS Block 1 | 95 | - | 27 | Operational | ~$2B |
| SLS Block 1B | 105 | - | 42 | Development | ~$2B |
| Starship | 150+ | - | 100+ | Development | <$10M target |
| New Glenn | 45 | 13 | 7 | Development | ~$68M |
| Ariane 64 | 21.6 | 11.5 | 5.2 | Operational | €115M |
| H3-24 | 19.7 | 8.0 | 4.1 | Development | ~$50M |

**Mission Design Implications:**
- **Falcon 9**: Most science missions, lunar CLPS
- **Falcon Heavy**: Large Mars missions, outer planets direct
- **SLS**: Crewed lunar (Artemis), large outer planet flagships
- **Starship**: Game-changer for mass/volume constrained designs
- **Rideshare**: ESPA Grande (300 kg), ESPA (180 kg) for smallsats`,
    tags: ['launch', 'vehicles', 'capabilities']
  },
}

router.post('/chat', async (req, res) => {
  const { message, context } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message required' })
  }

  const lowerMessage = message.toLowerCase()
  let response = null
  let matchedTopic = null

  for (const [topic, data] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(topic) || data.tags.some(tag => lowerMessage.includes(tag))) {
      response = data.response
      matchedTopic = topic
      break
    }
  }

  if (!response) {
    const topics = Object.keys(knowledgeBase).map(t => `• ${t}`).join('\n')
    response = `I can help with these space engineering topics:\n\n${topics}\n\nAsk me about any of these, or try a specific question like "How do I optimize delta-V for a Mars mission?"`
  }

  await new Promise(r => setTimeout(r, 500))

  res.json({
    response,
    topic: matchedTopic,
    timestamp: new Date().toISOString(),
    suggestions: matchedTopic ? knowledgeBase[matchedTopic].tags : Object.keys(knowledgeBase),
  })
})

router.get('/topics', (req, res) => {
  const topics = Object.entries(knowledgeBase).map(([key, data]) => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
    tags: data.tags,
  }))
  res.json({ topics })
})

export default router