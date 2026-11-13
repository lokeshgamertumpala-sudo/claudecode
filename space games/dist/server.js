// server/index.js
import express4 from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import crypto2 from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// server/routes/missions.js
import express from "express";
import { v4 as uuidv4 } from "uuid";

// server/middleware/auth.js
import crypto from "crypto";
var JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
var verifyToken = (token) => {
  const parts = String(token).split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, body, signature] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid signature");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
    throw new Error("Token expired");
  }
  return payload;
};
var authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing bearer token",
      requestId: req.requestId
    });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message,
      requestId: req.requestId
    });
  }
};
var optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = void 0;
    }
  }
  next();
};

// server/routes/missions.js
var router = express.Router();
var missions = [
  {
    id: "1",
    name: "Mars Sample Return",
    destination: "Mars",
    launchDate: "2028-07-15",
    status: "planning",
    deltaV: 6.2,
    payloadMass: 1200,
    cost: 4.2,
    duration: 980,
    description: "Retrieve samples collected by Perseverance rover",
    stages: [
      { name: "Earth Departure", deltaV: 3.6, mass: 800 },
      { name: "Mars Orbit Insertion", deltaV: 1.4, mass: 300 },
      { name: "Descent & Ascent", deltaV: 1.2, mass: 100 }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Europa Clipper",
    destination: "Jupiter",
    launchDate: "2024-10-10",
    status: "active",
    deltaV: 8.9,
    payloadMass: 2500,
    cost: 5,
    duration: 2100,
    description: "Investigate Europa habitability",
    stages: [
      { name: "Earth Departure", deltaV: 6.2, mass: 1800 },
      { name: "Jupiter Orbit Insertion", deltaV: 2.7, mass: 700 }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "3",
    name: "Artemis III",
    destination: "Moon",
    launchDate: "2025-09-01",
    status: "planning",
    deltaV: 4.1,
    payloadMass: 45e3,
    cost: 7.5,
    duration: 30,
    description: "Return humans to lunar surface",
    stages: [
      { name: "TLI", deltaV: 3.2, mass: 3e4 },
      { name: "LOI", deltaV: 0.9, mass: 15e3 }
    ],
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z"
  }
];
var validateMission = (req, res, next) => {
  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, stages } = req.body;
  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.push("Name must be at least 3 characters");
  }
  if (!destination || typeof destination !== "string") {
    errors.push("Destination is required");
  }
  if (launchDate && isNaN(Date.parse(launchDate))) {
    errors.push("Invalid launch date format");
  }
  if (status && !["planning", "active", "completed", "cancelled"].includes(status)) {
    errors.push("Invalid status");
  }
  if (deltaV !== void 0 && (typeof deltaV !== "number" || deltaV < 0)) {
    errors.push("Delta-V must be a positive number");
  }
  if (payloadMass !== void 0 && (typeof payloadMass !== "number" || payloadMass < 0)) {
    errors.push("Payload mass must be a positive number");
  }
  if (cost !== void 0 && (typeof cost !== "number" || cost < 0)) {
    errors.push("Cost must be a positive number");
  }
  if (duration !== void 0 && (typeof duration !== "number" || duration < 0)) {
    errors.push("Duration must be a positive number");
  }
  if (stages && !Array.isArray(stages)) {
    errors.push("Stages must be an array");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
      requestId: req.requestId
    });
  }
  next();
};
router.get("/", optionalAuth, (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    destination,
    search,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;
  let filtered = [...missions];
  if (status) {
    filtered = filtered.filter((m) => m.status === status);
  }
  if (destination) {
    filtered = filtered.filter((m) => m.destination.toLowerCase().includes(destination.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (m) => m.name.toLowerCase().includes(s) || m.description?.toLowerCase().includes(s)
    );
  }
  filtered.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const order = sortOrder === "asc" ? 1 : -1;
    if (aVal < bVal) return -1 * order;
    if (aVal > bVal) return 1 * order;
    return 0;
  });
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);
  res.json({
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum)
    }
  });
});
router.get("/:id", optionalAuth, (req, res) => {
  const mission = missions.find((m) => m.id === req.params.id);
  if (!mission) {
    return res.status(404).json({ error: "Mission not found", requestId: req.requestId });
  }
  res.json(mission);
});
router.post("/", authenticate, validateMission, (req, res) => {
  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, description, stages } = req.body;
  const mission = {
    id: uuidv4(),
    name: name.trim(),
    destination,
    launchDate: launchDate || null,
    status: status || "planning",
    deltaV: deltaV || 0,
    payloadMass: payloadMass || 0,
    cost: cost || 0,
    duration: duration || 0,
    description: description || "",
    stages: stages || [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user?.sub || "anonymous"
  };
  missions.push(mission);
  res.status(201).json(mission);
});
router.put("/:id", authenticate, validateMission, (req, res) => {
  const index = missions.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Mission not found", requestId: req.requestId });
  }
  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, description, stages } = req.body;
  missions[index] = {
    ...missions[index],
    name: name.trim(),
    destination,
    launchDate: launchDate || null,
    status: status || missions[index].status,
    deltaV: deltaV ?? missions[index].deltaV,
    payloadMass: payloadMass ?? missions[index].payloadMass,
    cost: cost ?? missions[index].cost,
    duration: duration ?? missions[index].duration,
    description: description ?? missions[index].description,
    stages: stages ?? missions[index].stages,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: req.user?.sub || "anonymous"
  };
  res.json(missions[index]);
});
router.patch("/:id", authenticate, (req, res) => {
  const index = missions.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Mission not found", requestId: req.requestId });
  }
  const allowedFields = ["name", "destination", "launchDate", "status", "deltaV", "payloadMass", "cost", "duration", "description", "stages"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== void 0) {
      updates[field] = req.body[field];
    }
  }
  if (updates.name && typeof updates.name === "string" && updates.name.trim().length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters", requestId: req.requestId });
  }
  if (updates.status && !["planning", "active", "completed", "cancelled"].includes(updates.status)) {
    return res.status(400).json({ error: "Invalid status", requestId: req.requestId });
  }
  missions[index] = {
    ...missions[index],
    ...updates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: req.user?.sub || "anonymous"
  };
  res.json(missions[index]);
});
router.delete("/:id", authenticate, (req, res) => {
  const index = missions.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Mission not found", requestId: req.requestId });
  }
  missions.splice(index, 1);
  res.status(204).send();
});
router.post("/:id/duplicate", authenticate, (req, res) => {
  const mission = missions.find((m) => m.id === req.params.id);
  if (!mission) {
    return res.status(404).json({ error: "Mission not found", requestId: req.requestId });
  }
  const duplicated = {
    ...mission,
    id: uuidv4(),
    name: `${mission.name} (Copy)`,
    status: "planning",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user?.sub || "anonymous"
  };
  missions.push(duplicated);
  res.status(201).json(duplicated);
});
router.get("/stats/summary", optionalAuth, (req, res) => {
  const total = missions.length;
  const byStatus = missions.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const byDestination = missions.reduce((acc, m) => {
    acc[m.destination] = (acc[m.destination] || 0) + 1;
    return acc;
  }, {});
  const totalCost = missions.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalDeltaV = missions.reduce((sum, m) => sum + (m.deltaV || 0), 0);
  res.json({
    total,
    byStatus,
    byDestination,
    totalCost: Number(totalCost.toFixed(2)),
    avgDeltaV: Number((totalDeltaV / total || 0).toFixed(2))
  });
});
var missions_default = router;

// server/routes/simulation.js
import express2 from "express";
var router2 = express2.Router();
router2.get("/health", (req, res) => {
  res.json({ status: "ok", service: "simulation", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
router2.post("/run", (req, res) => {
  const { spacecraft, trajectory, environment } = req.body;
  if (!spacecraft || !trajectory) {
    return res.status(400).json({
      error: "Spacecraft and trajectory parameters required",
      requestId: req.requestId
    });
  }
  const { dryMass, propellantMass, engineIsp, engineCount, thrustPerEngine } = spacecraft;
  const { deltaVBudget, margin } = trajectory;
  if (dryMass === void 0 || propellantMass === void 0 || engineIsp === void 0 || engineCount === void 0 || thrustPerEngine === void 0) {
    return res.status(400).json({
      error: "Missing required spacecraft fields",
      required: ["dryMass", "propellantMass", "engineIsp", "engineCount", "thrustPerEngine"],
      requestId: req.requestId
    });
  }
  const totalMass = dryMass + propellantMass;
  const totalThrust = engineCount * thrustPerEngine;
  const g0 = 9.81;
  const twr = totalThrust * 1e3 / (totalMass * g0);
  const deltaV = engineIsp * g0 * Math.log(totalMass / dryMass);
  const burnTime = propellantMass * engineIsp * g0 / totalThrust;
  const payloadFraction = dryMass / totalMass;
  const costEstimate = (dryMass * 25e3 + propellantMass * 5e3) / 1e9;
  const deltaVMargin = deltaVBudget > 0 ? (deltaV - deltaVBudget) / deltaVBudget * 100 : 0;
  const results = {
    totalMass,
    totalThrust,
    twr: Math.max(0, twr),
    deltaV: Math.max(0, deltaV),
    burnTime: Math.max(0, burnTime),
    payloadFraction: Math.max(0, Math.min(1, payloadFraction)),
    costEstimate: Math.max(0, costEstimate),
    deltaVMargin,
    commsMargin: spacecraft.commsPower > 100 ? "Adequate" : "Marginal",
    feasibility: deltaV >= deltaVBudget * (1 - margin) ? "Feasible" : "Infeasible",
    warnings: []
  };
  if (twr < 1.2) results.warnings.push("Low thrust-to-weight ratio for launch");
  if (results.deltaVMargin < -5) results.warnings.push("Insufficient delta-V margin");
  if (dryMass > propellantMass) results.warnings.push("Dry mass exceeds propellant mass");
  res.json(results);
});
router2.get("/presets", (req, res) => {
  const presets = {
    "trans-lunar": {
      name: "Trans-Lunar Injection",
      spacecraft: { dryMass: 8e3, propellantMass: 3e3, engineIsp: 450, engineCount: 1, thrustPerEngine: 450 },
      trajectory: { deltaVBudget: 3.2, margin: 0.15, transferType: "Hohmann" }
    },
    "deep-space-low-thrust": {
      name: "Deep Space Low-Thrust",
      spacecraft: { dryMass: 3e3, propellantMass: 1500, engineIsp: 3e3, engineCount: 4, thrustPerEngine: 0.5 },
      trajectory: { deltaVBudget: 4.2, margin: 0.2, transferType: "Low-thrust" }
    },
    "lunar-crew": {
      name: "Lunar Crewed Mission",
      spacecraft: { dryMass: 25e3, propellantMass: 2e4, engineIsp: 450, engineCount: 1, thrustPerEngine: 1100 },
      trajectory: { deltaVBudget: 4.1, margin: 0.1, transferType: "Hohmann" }
    },
    "jupiter-probe": {
      name: "Jupiter Orbiter",
      spacecraft: { dryMass: 1500, propellantMass: 3e3, engineIsp: 320, engineCount: 1, thrustPerEngine: 450 },
      trajectory: { deltaVBudget: 9.5, margin: 0.2, transferType: "Gravity Assist" }
    }
  };
  res.json(presets);
});
var simulation_default = router2;

// server/routes/ai.js
import express3 from "express";
var router3 = express3.Router();
var knowledgeBase = {
  "delta-v optimization": {
    response: `**Delta-V Optimization Strategies:**

1. **Trajectory Selection**: Choose optimal transfer type for your mission:
   - **Hohmann**: Minimum energy, longest transfer time
   - **Bi-elliptic**: Saves \u0394V for large radius ratios (>11.94), but longer
   - **Low-thrust spiral**: Continuous thrust, significantly lower \u0394V but requires high Isp
   - **Gravity assist**: Use planetary flybys to reduce \u0394V

2. **Launch Window Optimization**:
   - Use porkchop plots to find optimal departure/arrival dates
   - For Mars: ~26 month synodic period, Type I/II transfers
   - For outer planets: Gravity assist sequences critical

3. **Staging Optimization**:
   - Optimal mass ratio per stage: e^(-\u0394V/Isp/g0)
   - Typical 2-3 stages for chemical, single stage for electric
   - Drop tanks when empty to reduce dry mass

4. **Propulsion Technology**:
   - Chemical: Isp 300-450s, high thrust
   - Nuclear thermal: Isp 800-1000s, moderate thrust
   - Electric (Hall/ion): Isp 1500-3000s, very low thrust
   - Consider hybrid architectures`,
    tags: ["trajectory", "propulsion", "optimization"]
  },
  "mass reduction": {
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
    tags: ["mass", "structure", "optimization"]
  },
  "radiation hardening": {
    response: `**Radiation Hardening for Deep Space:**

**Environment Models:**
- **Earth orbit**: AP-8/AE-8 trapped radiation belts
- **Jupiter**: Extreme radiation - Europa receives ~5.4 Sv/day unshielded
- **Solar particle events**: Up to 1000 MeV protons, sporadic
- **Galactic cosmic rays**: High energy, isotropic, ~0.5 mSv/day

**Shielding Approaches:**
1. **Material selection** (areal density g/cm\xB2):
   - Aluminum: Baseline, 10 g/cm\xB2 = ~10 mm
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
    tags: ["radiation", "shielding", "environment"]
  },
  "thermal control": {
    response: `**Spacecraft Thermal Control Systems:**

**Passive Systems:**
- **MLI blankets**: 10-30 layers, 0.5-1 mm thick, \u03B5<0.03
- **Surface coatings**: White paint (\u03B1/\u03B5\u22480.2/0.8), OSR (\u03B1/\u03B5\u22480.1/0.8)
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
3. Uncertainty margins: \xB15-10\xB0C typical`,
    tags: ["thermal", "control", "systems"]
  },
  "communications": {
    response: `**Deep Space Communications:**

**Link Budget Equation:**
Pr = Pt + Gt + Gr - Lfs - Latm - Lpoint - Lpol - Limpl

Where:
- Pt = Transmit power (dBW)
- Gt, Gr = Antenna gains (dBi)
- Lfs = Free space loss = 20log10(4\u03C0R/\u03BB)
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
    tags: ["communications", "link-budget", "dsn"]
  },
  "launch vehicles": {
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
| Ariane 64 | 21.6 | 11.5 | 5.2 | Operational | \u20AC115M |
| H3-24 | 19.7 | 8.0 | 4.1 | Development | ~$50M |

**Mission Design Implications:**
- **Falcon 9**: Most science missions, lunar CLPS
- **Falcon Heavy**: Large Mars missions, outer planets direct
- **SLS**: Crewed lunar (Artemis), large outer planet flagships
- **Starship**: Game-changer for mass/volume constrained designs
- **Rideshare**: ESPA Grande (300 kg), ESPA (180 kg) for smallsats`,
    tags: ["launch", "vehicles", "capabilities"]
  }
};
router3.post("/chat", async (req, res) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }
  const lowerMessage = message.toLowerCase();
  let response = null;
  let matchedTopic = null;
  for (const [topic, data] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(topic) || data.tags.some((tag) => lowerMessage.includes(tag))) {
      response = data.response;
      matchedTopic = topic;
      break;
    }
  }
  if (!response) {
    const topics = Object.keys(knowledgeBase).map((t) => `\u2022 ${t}`).join("\n");
    response = `I can help with these space engineering topics:

${topics}

Ask me about any of these, or try a specific question like "How do I optimize delta-V for a Mars mission?"`;
  }
  await new Promise((r) => setTimeout(r, 500));
  res.json({
    response,
    topic: matchedTopic,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    suggestions: matchedTopic ? knowledgeBase[matchedTopic].tags : Object.keys(knowledgeBase)
  });
});
router3.get("/topics", (req, res) => {
  const topics = Object.entries(knowledgeBase).map(([key, data]) => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " "),
    tags: data.tags
  }));
  res.json({ topics });
});
var ai_default = router3;

// server/index.js
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express4();
var PORT = process.env.PORT || 3001;
var NODE_ENV = process.env.NODE_ENV || "development";
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production" ? void 0 : false,
  crossOriginEmbedderPolicy: NODE_ENV === "production",
  hsts: NODE_ENV === "production" ? { maxAge: 31536e3, includeSubDomains: true, preload: true } : false
}));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev", {
  skip: (req) => req.path === "/api/health"
}));
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1e3,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});
var strictLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 30,
  message: { error: "Rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);
app.use("/api/ai", strictLimiter);
app.use(express4.json({ limit: "10mb" }));
app.use(express4.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || (NODE_ENV === "production" ? false : "*"),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use((req, res, next) => {
  req.requestId = crypto2.randomUUID();
  req.startTime = Date.now();
  next();
});
var API_VERSION = "v1";
var apiRouter = express4.Router();
apiRouter.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV,
    node: process.version,
    platform: process.platform
  };
  try {
    health.checks = {
      memory: health.memory.heapUsed < 500 * 1024 * 1024 ? "healthy" : "degraded",
      uptime: health.uptime > 0 ? "healthy" : "unhealthy"
    };
    res.json(health);
  } catch (error) {
    health.status = "degraded";
    health.checks = { database: "unhealthy" };
    res.status(503).json(health);
  }
});
apiRouter.use("/missions", missions_default);
apiRouter.use("/simulation", simulation_default);
apiRouter.use("/ai", ai_default);
app.use(`/api/${API_VERSION}`, apiRouter);
app.use("/api/missions", missions_default);
app.use("/api/simulation", simulation_default);
app.use("/api/ai", ai_default);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString(), version: "1.0.0" });
});
app.use(express4.static(join(__dirname, "../dist")));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      error: "API endpoint not found",
      path: req.path,
      method: req.method,
      requestId: req.requestId
    });
  }
  res.sendFile(join(__dirname, "../dist/index.html"));
});
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.requestId} ${req.method} ${req.path}:`, err);
  const isDev = NODE_ENV !== "production";
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.details || err.message,
      requestId: req.requestId
    });
  }
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message,
      requestId: req.requestId
    });
  }
  if (err.code === "ENOENT") {
    return res.status(404).json({
      error: "Not Found",
      requestId: req.requestId
    });
  }
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: isDev ? err.message : "An unexpected error occurred",
    requestId: req.requestId,
    ...isDev && { stack: err.stack }
  });
});
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });
});
var server;
var shutdown = async (signal) => {
  console.log(`
${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 1e4);
  } else {
    process.exit(0);
  }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("UNCAUGHT_EXCEPTION");
});
server = app.listen(PORT, () => {
  console.log(`\u{1F680} ORBITFORGE AI Server running on http://localhost:${PORT}`);
  console.log(`\u{1F4E1} API v${API_VERSION} available at http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`\u{1F527} Environment: ${NODE_ENV}`);
  console.log(`\u{1F4CA} Health check: http://localhost:${PORT}/api/${API_VERSION}/health`);
});
var server_default = app;
export {
  server_default as default
};
