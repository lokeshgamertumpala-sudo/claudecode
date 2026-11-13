import { useMemo } from 'react'
import { Mesh, Group, BoxGeometry, CylinderGeometry, ConeGeometry, SphereGeometry, MeshStandardMaterial, MeshPhongMaterial, Vector3 } from 'three'

export default function SpacecraftModel({ specs }) {
  const { dryMass, propellantMass, engineCount, thrustPerEngine, tankMaterial, structureMaterial } = specs

  const spacecraft = useMemo(() => {
    const group = new Group()

    const bodyMaterial = new MeshStandardMaterial({
      color: tankMaterial.includes('Al') ? 0x888888 : 0x2a2a2a,
      metalness: 0.8,
      roughness: 0.2,
    })

    const engineMaterial = new MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1,
    })

    const nozzleMaterial = new MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3,
    })

    const accentMaterial = new MeshStandardMaterial({
      color: 0x00d4ff,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.3,
    })

    const solarMaterial = new MeshStandardMaterial({
      color: 0x1a3a5c,
      metalness: 0.3,
      roughness: 0.1,
    })

    const bodyHeight = Math.max(4, dryMass / 500)
    const bodyRadius = Math.max(1.5, Math.pow(propellantMass / 2000, 1/3))

    const body = new Mesh(
      new CylinderGeometry(bodyRadius * 0.9, bodyRadius, bodyHeight, 16),
      bodyMaterial
    )
    body.position.y = bodyHeight / 2
    body.castShadow = true
    body.receiveShadow = true
    group.add(body)

    const noseCone = new Mesh(
      new ConeGeometry(bodyRadius * 0.9, bodyHeight * 0.4, 16),
      bodyMaterial
    )
    noseCone.position.y = bodyHeight + bodyHeight * 0.2
    noseCone.castShadow = true
    group.add(noseCone)

    const tankHeight = bodyHeight * 0.7
    const tank = new Mesh(
      new CylinderGeometry(bodyRadius * 0.85, bodyRadius * 0.85, tankHeight, 16),
      new MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8,
      })
    )
    tank.position.y = tankHeight / 2 + bodyHeight * 0.1
    group.add(tank)

    for (let i = 0; i < engineCount; i++) {
      const angle = (i / engineCount) * Math.PI * 2
      const radius = bodyRadius * 0.8

      const engineGroup = new Group()

      const engineBody = new Mesh(
        new CylinderGeometry(0.4, 0.5, 1.2, 8),
        engineMaterial
      )
      engineBody.position.y = -0.6
      engineBody.castShadow = true
      engineGroup.add(engineBody)

      const nozzle = new Mesh(
        new ConeGeometry(0.5, 0.8, 8),
        nozzleMaterial
      )
      nozzle.position.y = -1.4
      engineGroup.add(nozzle)

      const glow = new Mesh(
        new ConeGeometry(0.3, 0.6, 8),
        accentMaterial
      )
      glow.position.y = -1.7
      engineGroup.add(glow)

      engineGroup.position.set(
        Math.cos(angle) * radius,
        -bodyHeight * 0.05,
        Math.sin(angle) * radius
      )
      engineGroup.rotation.x = Math.PI
      group.add(engineGroup)
    }

    const solarPanelWidth = Math.max(6, dryMass / 200)
    for (let side = -1; side <= 1; side += 2) {
      const panel = new Mesh(
        new BoxGeometry(solarPanelWidth, 0.1, 3),
        solarMaterial
      )
      panel.position.set(side * (bodyRadius + solarPanelWidth / 2 + 0.5), bodyHeight * 0.4, 0)
      panel.castShadow = true
      group.add(panel)

      const panel2 = new Mesh(
        new BoxGeometry(solarPanelWidth, 0.1, 3),
        solarMaterial
      )
      panel2.position.set(side * (bodyRadius + solarPanelWidth / 2 + 0.5), bodyHeight * 0.4, 0)
      panel2.rotation.y = Math.PI / 2
      group.add(panel2)
    }

    const antenna = new Mesh(
      new CylinderGeometry(0.05, 0.05, 3, 8),
      new MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
    )
    antenna.position.set(0, bodyHeight + bodyHeight * 0.4 + 1.5, bodyRadius * 0.8)
    group.add(antenna)

    const dish = new Mesh(
      new SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5),
      new MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2, side: 2 })
    )
    dish.position.set(0, bodyHeight + bodyHeight * 0.4 + 3, bodyRadius * 0.8)
    dish.rotation.x = -Math.PI / 2
    group.add(dish)

    const rcsCount = 12
    for (let i = 0; i < rcsCount; i++) {
      const angle = (i / rcsCount) * Math.PI * 2
      const height = bodyHeight * (0.2 + (i % 3) * 0.25)
      const rcs = new Mesh(
        new CylinderGeometry(0.1, 0.1, 0.3, 6),
        new MeshStandardMaterial({ color: 0xff4466, metalness: 0.5, roughness: 0.3, emissive: 0xff4466, emissiveIntensity: 0.5 })
      )
      rcs.position.set(
        Math.cos(angle) * bodyRadius * 1.05,
        height,
        Math.sin(angle) * bodyRadius * 1.05
      )
      rcs.lookAt(new Vector3(0, height, 0))
      group.add(rcs)
    }

    return group
  }, [dryMass, propellantMass, engineCount, thrustPerEngine, tankMaterial, structureMaterial])

  return <group>{spacecraft}</group>
}