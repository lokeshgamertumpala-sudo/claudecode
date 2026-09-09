---
name: ui-wireframe
description: Generate rapid UI wireframes, ASCII/text layout diagrams, interactive HTML/Tailwind prototypes, and component structural mockups before writing production code.
---

# UI Wireframe Skill

This skill guides the rapid conceptualization, spatial layout, information architecture, and low/mid-fidelity wireframing of digital interfaces.

## Wireframing Formats

### 1. ASCII / Markdown Structural Layout
Rapidly visualize screen real estate, sidebars, grids, and primary action zones without writing frontend code:

```text
+-----------------------------------------------------------------------+
|  [Logo]   Search...                          (Notifications) [Avatar] |
+-----------+-----------------------------------------------------------+
| Dashboard |  Page Title: Team Projects              [+ New Project]   |
| Analytics |  -------------------------------------------------------  |
| Settings  |  [Filter: All] [Status: Active v]        (Sort: Date v)   |
|           |                                                           |
|           |  +--------------------+ +--------------------+            |
|           |  | Mobile App Redesign| | Marketing Campaign |            |
|           |  | Progress: [====--] | | Progress: [=======]|            |
|           |  | 4 Members  Due Oct | | 8 Members  Due Nov |            |
|           |  +--------------------+ +--------------------+            |
+-----------+-----------------------------------------------------------+
```

### 2. Rapid Interactive HTML/Tailwind Prototype
Generate a single-file HTML or React component mockup with dummy data, placeholder avatars, and gray-box containers to validate user flows and layout hierarchies with stakeholders.

## Wireframing Process

1. **User Goal & Core Task**:
   - What is the primary user goal on this screen?
   - What is the primary Call to Action (CTA)?
2. **Information Hierarchy**:
   - Tier 1: Primary action & core metric / data table.
   - Tier 2: Filters, search, secondary actions.
   - Tier 3: Metadata, breadcrumbs, supplementary links.
3. **Layout Selection**:
   - Determine whether a sidebar navigation, top bar, multi-column dashboard, or single-column reading flow best fits the content density.

## Invocation Examples
- `/ui-wireframe Create an ASCII wireframe layout for a project management kanban board`
- "Generate a standalone HTML/Tailwind prototype of a customer support ticketing dashboard."
- "Mock up the layout hierarchy for a mobile banking transaction detail screen."
