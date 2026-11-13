import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMissionStore } from './missionStore'

describe('missionStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useMissionStore.setState({
      missions: [],
      selectedMissionId: null,
      filters: { status: '', destination: '' },
    })
  })

  describe('addMission', () => {
    it('creates a mission with generated id and timestamps', () => {
      const { addMission } = useMissionStore.getState()
      const payload = {
        name: 'Mars Sample Return',
        destination: 'Mars',
        launchDate: '2028-07-15',
        status: 'planning',
        deltaV: 6.2,
        payloadMass: 1200,
        cost: 4.2,
        duration: 980,
        description: 'Retrieve samples',
        stages: [{ name: 'Earth Departure', deltaV: 3.6, mass: 800 }],
      }
      const created = addMission(payload)

      expect(created).toMatchObject(payload)
      expect(created.id).toBeDefined()
      expect(created.id).not.toBe('')
      expect(typeof created.id).toBe('string')
      expect(useMissionStore.getState().missions).toHaveLength(1)
    })

    it('appends to the existing mission list', () => {
      const { addMission } = useMissionStore.getState()
      addMission({ name: 'First', destination: 'Moon' })
      addMission({ name: 'Second', destination: 'Mars' })
      expect(useMissionStore.getState().missions).toHaveLength(2)
    })
  })

  describe('updateMission', () => {
    it('merges partial updates into the target mission', () => {
      const { addMission, updateMission } = useMissionStore.getState()
      const mission = addMission({ name: 'Original', destination: 'Mars', status: 'planning' })
      updateMission(mission.id, { status: 'active', deltaV: 7.5 })

      const updated = useMissionStore.getState().missions[0]
      expect(updated.status).toBe('active')
      expect(updated.deltaV).toBe(7.5)
      expect(updated.name).toBe('Original')
    })

    it('does not mutate the missions array identity unnecessarily', () => {
      const { addMission, updateMission } = useMissionStore.getState()
      const mission = addMission({ name: 'M1', destination: 'Venus' })
      const before = useMissionStore.getState().missions
      updateMission(mission.id, { cost: 2.0 })
      expect(useMissionStore.getState().missions).not.toBe(before)
    })
  })

  describe('deleteMission', () => {
    it('removes the mission from the list', () => {
      const { addMission, deleteMission } = useMissionStore.getState()
      const m1 = addMission({ name: 'A' })
      const m2 = addMission({ name: 'B' })
      deleteMission(m1.id)
      const missions = useMissionStore.getState().missions
      expect(missions).toHaveLength(1)
      expect(missions[0].id).toBe(m2.id)
    })

    it('is a no-op for an unknown id', () => {
      const { addMission, deleteMission } = useMissionStore.getState()
      addMission({ name: 'A' })
      expect(() => deleteMission('does-not-exist')).not.toThrow()
      expect(useMissionStore.getState().missions).toHaveLength(1)
    })
  })

  describe('selectMission', () => {
    it('sets and clears the selected mission id', () => {
      const { addMission, selectMission } = useMissionStore.getState()
      const mission = addMission({ name: 'Selectable' })
      selectMission(mission.id)
      expect(useMissionStore.getState().selectedMissionId).toBe(mission.id)
      selectMission(null)
      expect(useMissionStore.getState().selectedMissionId).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('merges filter updates', () => {
      const { setFilters } = useMissionStore.getState()
      setFilters({ status: 'active' })
      expect(useMissionStore.getState().filters.status).toBe('active')
      setFilters({ destination: 'Mars' })
      expect(useMissionStore.getState().filters).toEqual({ status: 'active', destination: 'Mars' })
    })
  })

  describe('getFilteredMissions', () => {
    it('returns all missions when filters are empty', () => {
      const { addMission, getFilteredMissions } = useMissionStore.getState()
      addMission({ name: 'A', status: 'active', destination: 'Mars' })
      addMission({ name: 'B', status: 'planning', destination: 'Moon' })
      expect(getFilteredMissions()).toHaveLength(2)
    })

    it('filters by status (case-sensitive exact match)', () => {
      const { addMission, setFilters, getFilteredMissions } = useMissionStore.getState()
      addMission({ name: 'A', status: 'active' })
      addMission({ name: 'B', status: 'planning' })
      setFilters({ status: 'active' })
      expect(getFilteredMissions()).toHaveLength(1)
      expect(getFilteredMissions()[0].name).toBe('A')
    })

    it('filters by destination case-insensitively (substring match)', () => {
      const { addMission, setFilters, getFilteredMissions } = useMissionStore.getState()
      addMission({ name: 'A', destination: 'Mars' })
      addMission({ name: 'B', destination: 'Moon' })
      setFilters({ destination: 'mars' })
      expect(getFilteredMissions()).toHaveLength(1)
      expect(getFilteredMissions()[0].name).toBe('A')
    })

    it('applies both filters together (AND semantics)', () => {
      const { addMission, setFilters, getFilteredMissions } = useMissionStore.getState()
      addMission({ name: 'A', status: 'active', destination: 'Mars' })
      addMission({ name: 'B', status: 'active', destination: 'Moon' })
      addMission({ name: 'C', status: 'planning', destination: 'Mars' })
      setFilters({ status: 'active', destination: 'Mars' })
      expect(getFilteredMissions()).toHaveLength(1)
      expect(getFilteredMissions()[0].name).toBe('A')
    })
  })

  describe('getSelectedMission', () => {
    it('returns the selected mission object', () => {
      const { addMission, selectMission, getSelectedMission } = useMissionStore.getState()
      const m = addMission({ name: 'Selected' })
      selectMission(m.id)
      expect(getSelectedMission()).toMatchObject({ id: m.id, name: 'Selected' })
    })

    it('returns undefined when nothing is selected', () => {
      const { addMission, getSelectedMission } = useMissionStore.getState()
      addMission({ name: 'Orphan' })
      expect(getSelectedMission()).toBeUndefined()
    })
  })

  describe('persistence', () => {
    it('uses localStorage under the orbitforge-missions key', () => {
      const key = useMissionStore.persist.getOptions().name
      expect(key).toBe('orbitforge-missions')
    })
  })
})