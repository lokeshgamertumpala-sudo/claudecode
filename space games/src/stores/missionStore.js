import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const initialMissions = [
  {
    id: '1',
    name: 'Mars Sample Return',
    destination: 'Mars',
    launchDate: '2028-07-15',
    status: 'planning',
    deltaV: 6.2,
    payloadMass: 1200,
    cost: 4.2,
    duration: 980,
    description: 'Retrieve samples collected by Perseverance rover',
    stages: [
      { name: 'Earth Departure', deltaV: 3.6, mass: 800 },
      { name: 'Mars Orbit Insertion', deltaV: 1.4, mass: 300 },
      { name: 'Descent & Ascent', deltaV: 1.2, mass: 100 },
    ],
  },
  {
    id: '2',
    name: 'Europa Clipper',
    destination: 'Jupiter',
    launchDate: '2024-10-10',
    status: 'active',
    deltaV: 8.9,
    payloadMass: 2500,
    cost: 5.0,
    duration: 2100,
    description: 'Investigate Europa habitability',
    stages: [
      { name: 'Earth Departure', deltaV: 6.2, mass: 1800 },
      { name: 'Jupiter Orbit Insertion', deltaV: 2.7, mass: 700 },
    ],
  },
  {
    id: '3',
    name: 'Artemis III',
    destination: 'Moon',
    launchDate: '2025-09-01',
    status: 'active',
    deltaV: 4.1,
    payloadMass: 45000,
    cost: 7.5,
    duration: 30,
    description: 'Return humans to lunar surface',
    stages: [
      { name: 'TLI Burn', deltaV: 3.2, mass: 40000 },
      { name: 'LOI Burn', deltaV: 0.9, mass: 5000 },
    ],
  },
]

export const useMissionStore = create(
  persist(
    (set, get) => ({
      missions: initialMissions,
      selectedMissionId: null,
      filters: { status: '', destination: '' },

      addMission: (mission) => set(state => ({
        missions: [...state.missions, { ...mission, id: uuidv4() }]
      })),

      updateMission: (id, updates) => set(state => ({
        missions: state.missions.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      deleteMission: (id) => set(state => ({
        missions: state.missions.filter(m => m.id !== id),
        selectedMissionId: state.selectedMissionId === id ? null : state.selectedMissionId
      })),

      selectMission: (id) => set({ selectedMissionId: id }),

      setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),

      getSelectedMission: () => {
        const { missions, selectedMissionId } = get()
        return missions.find(m => m.id === selectedMissionId)
      },

      getFilteredMissions: () => {
        const { missions, filters } = get()
        return missions.filter(m =>
          (!filters.status || m.status === filters.status) &&
          (!filters.destination || m.destination.toLowerCase().includes(filters.destination.toLowerCase()))
        )
      },
    }),
    { name: 'orbitforge-missions' }
  )
)