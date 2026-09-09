---
name: landing-page-hero
description: Design high-converting, modern SaaS landing pages, compelling hero sections, social proof grids, feature value pillars, pricing matrices, and CTA conversion funnels.
---

# Landing Page Hero Skill

This skill guides the design, copywriting structure, visual hierarchy, and implementation of high-converting landing pages.

## Anatomy of a High-Converting SaaS Landing Page

### 1. The Above-The-Fold Hero Section
- **Badge / Social Proof Pill**: "🚀 Announcing Version 2.0 • 10,000+ developers onboard"
- **Headline (H1)**: Clear value proposition solving a specific pain point (e.g., "Ship production-grade apps 10x faster").
- **Sub-headline**: 1-2 sentences expanding on how it works without fluff.
- **Dual CTA**:
  - Primary CTA: High-contrast button ("Start Free Trial", "Get Started Free").
  - Secondary CTA: Low-friction button ("Book a Demo", "Watch 2-min Walkthrough").
- **Visual Asset**: High-resolution interactive product screenshot or 3D device mockup with glow backdrop.

### 2. Trust & Social Proof Bar
- Monochrome logos of recognizable companies or customer quote badges.
- Metric counter: "99.99% Uptime", "50M+ API requests daily", "4.9/5 Rating".

### 3. Feature Bento Grid
- Visual 3x2 or 4-panel bento grid highlighting core capabilities with subtle borders, icons, and micro-illustrations.

### 4. Interactive Pricing Table
- Toggle for Monthly / Annual (with "Save 20%" badge).
- Highlight "Most Popular" or "Pro" tier with gradient border or elevated badge.
- Clear feature comparison checklist with green checkmarks.

### 5. FAQ & Final Urgency CTA
- Accordion FAQ addressing top 5 buying objections (security, migration, refunds).
- Bottom hero banner with direct CTA to close the conversion loop.

## High-Conversion Hero Template (Tailwind)

```html
<section class="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28 bg-zinc-950 text-white">
  <!-- Subtle background glow -->
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="container mx-auto px-4 max-w-5xl text-center relative z-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      Next Generation Developer Platform
    </div>

    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
      Turn your code into <span class="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">effortless design</span>
    </h1>

    <p class="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Transform complex architectures into stunning, accessible user interfaces with zero friction.
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#get-started" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition shadow-lg shadow-white/10">
        Get Started Free
      </a>
      <a href="#demo" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-800 transition">
        View Live Demo ->
      </a>
    </div>
  </div>
</section>
```

## Invocation Examples
- `/landing-page-hero Create a sleek dark-mode hero section for an AI developer tool`
- "Design a feature bento grid and 3-tier pricing matrix for our SaaS product."
- "Write copy and structure a high-converting landing page for a mobile app."
