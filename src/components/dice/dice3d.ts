import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
//  3D DICE ENGINE  — Production Grade with Clean WebGL Disposal
// ─────────────────────────────────────────────────────────────

// Helper for comprehensive, recursive GPU memory cleanup
export function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
      if (obj.geometry) {
        obj.geometry.dispose()
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => {
            if ('map' in mat && mat.map && mat.map instanceof THREE.Texture) {
              mat.map.dispose()
            }
            mat.dispose()
          })
        } else {
          if ('map' in obj.material && obj.material.map && obj.material.map instanceof THREE.Texture) {
            obj.material.map.dispose()
          }
          obj.material.dispose()
        }
      }
    }
  })
}

// ── Skins ────────────────────────────────────────────────────

export type DiceSkin = {
  id: string
  name: string
  body: number        // base die color
  emissive: number    // inner glow
  edge: number        // wireframe edge color
  numeral: string     // CSS color for the printed number
  trail: number       // particle color (used by effect system)
  roughness: number
  metalness: number
}

export const DICE_SKINS: DiceSkin[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    body: 0x1a1420,
    emissive: 0x3d1e6b,
    edge: 0xc9963d,
    numeral: '#e4d9c4',
    trail: 0x9b7ec8,
    roughness: 0.35,
    metalness: 0.65,
  },
  {
    id: 'bone',
    name: 'Bone',
    body: 0xe8dfc4,
    emissive: 0x3d2a0a,
    edge: 0xb03232,
    numeral: '#1a0a00',
    trail: 0xd4b896,
    roughness: 0.85,
    metalness: 0.05,
  },
  {
    id: 'bloodstone',
    name: 'Bloodstone',
    body: 0x2d0a0a,
    emissive: 0x6b0000,
    edge: 0xff3a3a,
    numeral: '#ffbaba',
    trail: 0xcc2222,
    roughness: 0.2,
    metalness: 0.8,
  },
  {
    id: 'arcane',
    name: 'Arcane Crystal',
    body: 0x0a1a3d,
    emissive: 0x1a3d6b,
    edge: 0x44ccff,
    numeral: '#aaeeff',
    trail: 0x22aaff,
    roughness: 0.05,
    metalness: 0.9,
  },
  {
    id: 'forest',
    name: 'Forest Stone',
    body: 0x1a2e12,
    emissive: 0x0a2200,
    edge: 0x7dc45a,
    numeral: '#d4f5c2',
    trail: 0x4a9a2a,
    roughness: 0.7,
    metalness: 0.2,
  },
  // ── New Requested Dice Skins ──
  {
    id: 'ancient-oak',
    name: 'Ancient Oak / Carved Wood',
    body: 0x2d1a0e,        // Warm dark mahogany/walnut
    emissive: 0x421c05,    // Subtle amber grain emissive
    edge: 0xd4af37,        // Brass/gold edge
    numeral: '#f5ecd5',     // Carved cream numerals
    trail: 0xb5803c,       // Amber wood trail
    roughness: 0.92,       // High roughness
    metalness: 0.08,       // Low metalness
  },
  {
    id: 'deep-galaxy',
    name: 'Deep Galaxy / Nebula',
    body: 0x050414,        // Deep cosmic midnight blue/black
    emissive: 0x7b1fa2,    // Cosmic magenta/purple nebula emissive
    edge: 0x00e5ff,        // Star-white/cyan edge
    numeral: '#e0f7fa',     // Radiant stellar numerals
    trail: 0xba68c8,       // Stellar purple/cyan trail
    roughness: 0.12,       // Low roughness
    metalness: 0.88,       // High metalness
  },
  {
    id: 'eldritch-void',
    name: 'Eldritch / Void Purple',
    body: 0x120024,        // Deep void purple body
    emissive: 0x8a2be2,    // Neon violet glow
    edge: 0xdfb15b,        // Occult gold edge
    numeral: '#e9d5ff',     // Glowing lilac numerals
    trail: 0xa855f7,       // Void purple trail
    roughness: 0.28,
    metalness: 0.72,
  },
  {
    id: 'celestial-holy',
    name: 'Celestial / Holy Gold',
    body: 0xf4eedb,        // Ivory/marble body
    emissive: 0xd4a017,    // Radiant warm gold emissive
    edge: 0xffd700,        // Bright gold edge
    numeral: '#8a5a00',     // Amber/gold numerals
    trail: 0xffe066,       // Golden halo trail
    roughness: 0.3,
    metalness: 0.5,
  },
  {
    id: 'frostfire-glacial',
    name: 'Frostfire / Glacial',
    body: 0x0c2538,        // Deep ice blue body
    emissive: 0x00b4d8,    // Bright cyan emissive
    edge: 0xe0f7fa,        // Frosty white edge
    numeral: '#64dfdf',     // Crisp cyan numerals
    trail: 0x48cae4,       // Glacial trail
    roughness: 0.15,
    metalness: 0.85,
  },
]

// ── Roll Effects ─────────────────────────────────────────────

export type RollEffect = {
  id: string
  name: string
  /** Called once at throw start — sets up the effect state */
  init: (ctx: EffectContext) => void
  /** Called every animation frame during the throw (t = 0→1) */
  frame: (ctx: EffectContext, t: number) => void
  /** Called when the die settles */
  done: (ctx: EffectContext) => void
}

export type EffectContext = {
  scene: THREE.Scene
  skin: DiceSkin
  /** The gust particle system (always present) */
  particles: THREE.Points
  particleVelocities: { vx: number; vy: number; vz: number }[]
  /** Scratch space for the effect to store its own objects */
  data: Record<string, unknown>
}

export const ROLL_EFFECTS: RollEffect[] = [
  // 1. Gust — the original wind trail
  {
    id: 'gust',
    name: 'Gust',
    init({ particles, skin }) {
      ;(particles.material as THREE.PointsMaterial).color.setHex(skin.trail)
      ;(particles.material as THREE.PointsMaterial).size = 0.06
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      if (t < 0.15) pmat.opacity = (t / 0.15) * 0.7
      else if (t < 0.6) pmat.opacity = 0.7
      else pmat.opacity = Math.max(0, (1 - (t - 0.6) / 0.4) * 0.7)

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleVelocities.length; i++) {
        arr[i * 3] += particleVelocities[i].vx * (1 - t * 0.5)
        arr[i * 3 + 1] += particleVelocities[i].vy
        arr[i * 3 + 2] += particleVelocities[i].vz
        if (arr[i * 3] > 5) arr[i * 3] = -5
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // 2. Ember — upward rising sparks that scatter then fade
  {
    id: 'ember',
    name: 'Ember',
    init({ particles, skin }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(skin.trail)
      pmat.size = 0.05
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 6
        arr[i * 3 + 1] = -2.5 + Math.random() * -1
        arr[i * 3 + 2] = (Math.random() - 0.5) * 2
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.opacity = t < 0.5 ? t * 1.2 : Math.max(0, 1 - (t - 0.5) * 2)

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleVelocities.length; i++) {
        arr[i * 3] += particleVelocities[i].vx * 0.02 * (1 - t)
        arr[i * 3 + 1] += 0.04 + Math.random() * 0.02
        arr[i * 3 + 2] += particleVelocities[i].vz * 0.01
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // 3. Starfield — tiny stars that orbit around the die path
  {
    id: 'starfield',
    name: 'Starfield',
    init({ particles, skin }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(skin.edge)
      pmat.size = 0.04
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        const theta = Math.random() * Math.PI * 2
        const r = 1.5 + Math.random() * 2.5
        arr[i * 3] = Math.cos(theta) * r - 2
        arr[i * 3 + 1] = Math.sin(theta) * r
        arr[i * 3 + 2] = (Math.random() - 0.5) * 3
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.opacity = t < 0.2 ? t * 3 : t > 0.8 ? Math.max(0, (1 - t) * 5) : 0.6

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const dieX = THREE.MathUtils.lerp(-4.5, 0, Math.min(t * 1.3, 1))
      for (let i = 0; i < particleVelocities.length; i++) {
        const dx = arr[i * 3] - dieX
        const dy = arr[i * 3 + 1]
        const angle = 0.03
        arr[i * 3] = dieX + dx * Math.cos(angle) - dy * Math.sin(angle)
        arr[i * 3 + 1] = dx * Math.sin(angle) + dy * Math.cos(angle)
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // 4. Shadow Burst — particles explode outward from center on landing
  {
    id: 'shadowburst',
    name: 'Shadow Burst',
    init({ particles, skin }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(skin.emissive)
      pmat.size = 0.08
      pmat.opacity = 0
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 0.2
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.2
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      if (t < 0.75) {
        pmat.opacity = 0
        return
      }
      const bt = (t - 0.75) / 0.25
      pmat.opacity = bt < 0.4 ? bt * 2.5 : Math.max(0, 1 - (bt - 0.4) * 1.67)

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleVelocities.length; i++) {
        arr[i * 3] += particleVelocities[i].vx * 0.15
        arr[i * 3 + 1] += particleVelocities[i].vy * 0.15
        arr[i * 3 + 2] += particleVelocities[i].vz * 0.15
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // 5. Storm — chaotic swirling particles throughout the whole throw
  {
    id: 'storm',
    name: 'Storm',
    init({ particles, skin }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(skin.trail)
      pmat.size = 0.05
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 8
        arr[i * 3 + 1] = (Math.random() - 0.5) * 5
        arr[i * 3 + 2] = (Math.random() - 0.5) * 3
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.opacity = 0.4 + Math.sin(t * 60) * 0.15

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleVelocities.length; i++) {
        arr[i * 3] += particleVelocities[i].vx * 0.5 * (Math.random() - 0.3)
        arr[i * 3 + 1] += particleVelocities[i].vy * 2 + (Math.random() - 0.5) * 0.08
        arr[i * 3 + 2] += particleVelocities[i].vz + (Math.random() - 0.5) * 0.06
        if (arr[i * 3] > 4) arr[i * 3] = -4
        if (arr[i * 3] < -4) arr[i * 3] = 4
        if (arr[i * 3 + 1] > 2.5) arr[i * 3 + 1] = -2.5
        if (arr[i * 3 + 1] < -2.5) arr[i * 3 + 1] = 2.5
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // ── 6. Celestial Halo (New) ──
  {
    id: 'celestial-halo',
    name: 'Celestial Halo',
    init({ particles }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(0xffd700)
      pmat.size = 0.075
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        const angle = (i / (arr.length / 3)) * Math.PI * 2
        const r = 1.0 + Math.random() * 0.4
        arr[i * 3] = Math.cos(angle) * r
        arr[i * 3 + 1] = Math.sin(angle) * r
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      }
      posAttr.needsUpdate = true
    },
    frame({ particles }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.opacity = t < 0.25 ? t * 4 * 0.85 : Math.max(0, (1 - t) * 1.15 * 0.85)

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const dieX = THREE.MathUtils.lerp(-4.5, 0, Math.min(t * 1.3, 1))
      for (let i = 0; i < arr.length / 3; i++) {
        const curX = arr[i * 3] - dieX
        const curY = arr[i * 3 + 1]
        const rotSpeed = 0.08 * (1 + t)
        const expansion = 1 + 0.015 * (1 - t)
        arr[i * 3] = dieX + (curX * Math.cos(rotSpeed) - curY * Math.sin(rotSpeed)) * expansion
        arr[i * 3 + 1] = (curX * Math.sin(rotSpeed) + curY * Math.cos(rotSpeed)) * expansion
        arr[i * 3 + 2] += (Math.random() - 0.5) * 0.02
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // ── 7. Glacial Shards (New) ──
  {
    id: 'glacial-shards',
    name: 'Glacial Shards',
    init({ particles }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(0x54e4ff)
      pmat.size = 0.065
      pmat.opacity = 0
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 0.2
        arr[i * 3 + 1] = -0.5 + (Math.random() - 0.5) * 0.2
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      if (t < 0.7) {
        pmat.opacity = 0
        return
      }
      const impactT = (t - 0.7) / 0.3
      pmat.opacity = impactT < 0.3 ? impactT * 3.3 : Math.max(0, 1 - (impactT - 0.3) * 1.42)

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleVelocities.length; i++) {
        arr[i * 3] += particleVelocities[i].vx * 0.25 * (1 - impactT * 0.4)
        arr[i * 3 + 1] += (Math.abs(particleVelocities[i].vy) * 0.25 + 0.04) * (1 - impactT)
        arr[i * 3 + 2] += particleVelocities[i].vz * 0.25
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // ── 8. Dragonfire (New) ──
  {
    id: 'dragonfire',
    name: 'Dragonfire',
    init({ particles }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(0xff4500)
      pmat.size = 0.08
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = -4.5 + (Math.random() - 0.5) * 1.5
        arr[i * 3 + 1] = (Math.random() - 0.5) * 1.5
        arr[i * 3 + 2] = (Math.random() - 0.5) * 1.5
      }
      posAttr.needsUpdate = true
    },
    frame({ particles, particleVelocities }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      if (t < 0.8) {
        pmat.color.setHex(0xff3300)
        pmat.opacity = 0.5 + Math.sin(t * 30) * 0.3
      } else {
        // Impact burst flame
        pmat.color.setHex(0xffcc00)
        pmat.opacity = Math.max(0, (1 - (t - 0.8) / 0.2) * 0.95)
      }

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const dieX = THREE.MathUtils.lerp(-4.5, 0, Math.min(t * 1.3, 1))
      for (let i = 0; i < particleVelocities.length; i++) {
        if (t < 0.8) {
          arr[i * 3] += (dieX - arr[i * 3]) * 0.08 + particleVelocities[i].vx * 0.02
          arr[i * 3 + 1] += 0.03 + (Math.random() - 0.5) * 0.04
          arr[i * 3 + 2] += particleVelocities[i].vz * 0.04
        } else {
          arr[i * 3] += particleVelocities[i].vx * 0.3
          arr[i * 3 + 1] += Math.abs(particleVelocities[i].vy) * 0.35 + 0.02
          arr[i * 3 + 2] += particleVelocities[i].vz * 0.3
        }
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // ── 9. Lightning Arc (New) ──
  {
    id: 'lightning-arc',
    name: 'Lightning Arc',
    init({ particles }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(0x7df9ff)
      pmat.size = 0.06
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 6
        arr[i * 3 + 1] = (Math.random() - 0.5) * 3
        arr[i * 3 + 2] = (Math.random() - 0.5) * 2
      }
      posAttr.needsUpdate = true
    },
    frame({ particles }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      // Jittery electric flicker
      const isFlicker = Math.random() > 0.35
      pmat.opacity = isFlicker ? (t < 0.85 ? 0.85 : (1 - t) * 5) : 0.15

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const dieX = THREE.MathUtils.lerp(-4.5, 0, Math.min(t * 1.3, 1))
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3] = dieX + (Math.random() - 0.5) * 2.2
        arr[i * 3 + 1] += (Math.random() - 0.5) * 0.35
        arr[i * 3 + 2] += (Math.random() - 0.5) * 0.35
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },

  // ── 10. Necrotic Mist (New) ──
  {
    id: 'necrotic-mist',
    name: 'Necrotic Mist',
    init({ particles }) {
      const pmat = particles.material as THREE.PointsMaterial
      pmat.color.setHex(0x4ade80)
      pmat.size = 0.09
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        const theta = Math.random() * Math.PI * 2
        const r = 0.5 + Math.random() * 2.2
        arr[i * 3] = Math.cos(theta) * r
        arr[i * 3 + 1] = (Math.random() - 0.5) * 1.8
        arr[i * 3 + 2] = Math.sin(theta) * r
      }
      posAttr.needsUpdate = true
    },
    frame({ particles }, t) {
      const pmat = particles.material as THREE.PointsMaterial
      // Sickly emerald & violet pulse
      const wave = Math.sin(t * 15)
      pmat.color.setHex(wave > 0 ? 0x22c55e : 0x9333ea)
      pmat.opacity = t < 0.2 ? t * 3.5 : t > 0.8 ? Math.max(0, (1 - t) * 4) : 0.65

      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      const dieX = THREE.MathUtils.lerp(-4.5, 0, Math.min(t * 1.3, 1))
      for (let i = 0; i < arr.length / 3; i++) {
        const dx = arr[i * 3] - dieX
        const dz = arr[i * 3 + 2]
        const spin = 0.04
        arr[i * 3] = dieX + (dx * Math.cos(spin) - dz * Math.sin(spin))
        arr[i * 3 + 2] = dx * Math.sin(spin) + dz * Math.cos(spin)
        arr[i * 3 + 1] += (Math.sin(t * 10 + i) * 0.01)
      }
      posAttr.needsUpdate = true
    },
    done({ particles }) {
      ;(particles.material as THREE.PointsMaterial).opacity = 0
    },
  },
]

// ── Engine ───────────────────────────────────────────────────

type ThrowOptions = {
  sides: number
  displayValue: number
  skin?: DiceSkin
  effect?: RollEffect
  onDone?: () => void
}

export class DiceEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer | null = null
  private die: THREE.Group | null = null
  private faceMaterials: THREE.MeshBasicMaterial[] = []
  private activeTextures: THREE.CanvasTexture[] = []
  private particles: THREE.Points | null = null
  private velocities: { vx: number; vy: number; vz: number }[] = []
  private rafId = 0
  private rolling = false
  private idleActive = false
  private isDisposed = false
  private canvas: HTMLCanvasElement
  private skin: DiceSkin
  private effect: RollEffect

  constructor(canvas: HTMLCanvasElement, skin: DiceSkin = DICE_SKINS[0], effect: RollEffect = ROLL_EFFECTS[0]) {
    this.canvas = canvas
    this.skin = skin
    this.effect = effect

    const w = canvas.clientWidth || 400
    const h = canvas.clientHeight || 260

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    this.camera.position.set(0, 0, 6)

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(w, h, false)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)

    this.scene.add(new THREE.AmbientLight(0x9b7ec8, 0.55))
    const key = new THREE.DirectionalLight(0xffe8c0, 1.3)
    key.position.set(3, 5, 5)
    this.scene.add(key)
    const rim = new THREE.DirectionalLight(0x7b3f6e, 0.6)
    rim.position.set(-4, -2, -3)
    this.scene.add(rim)

    const count = 90
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2
      this.velocities.push({
        vx: 0.08 + Math.random() * 0.22,
        vy: (Math.random() - 0.5) * 0.04,
        vz: (Math.random() - 0.5) * 0.02,
      })
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pmat = new THREE.PointsMaterial({
      color: skin.trail,
      size: 0.06,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.particles = new THREE.Points(geo, pmat)
    this.scene.add(this.particles)

    this.render()
  }

  setSkin(skin: DiceSkin) {
    this.skin = skin
  }

  setEffect(effect: RollEffect) {
    this.effect = effect
  }

  /** Trigger a quick preview of the effect */
  triggerEffectPreview(effect: RollEffect) {
    this.setEffect(effect)
    if (this.isDisposed || this.rolling) return
    const ctx = this.effectContext()
    if (!ctx) return
    effect.init(ctx)
    let start = performance.now()
    const duration = 1000
    const frame = (now: number) => {
      if (this.isDisposed || this.rolling) return
      const t = Math.min((now - start) / duration, 1)
      effect.frame(ctx, t)
      this.render()
      if (t < 1) {
        requestAnimationFrame(frame)
      } else {
        effect.done(ctx)
        this.render()
      }
    }
    requestAnimationFrame(frame)
  }

  /** Trigger a quick preview roll of a die with the current skin */
  previewRoll(skin?: DiceSkin) {
    if (skin) this.setSkin(skin)
    this.throw({
      sides: 20,
      displayValue: 20,
      skin: this.skin,
      effect: this.effect,
    })
  }

  private effectContext(): EffectContext | null {
    if (!this.particles) return null
    return {
      scene: this.scene,
      skin: this.skin,
      particles: this.particles,
      particleVelocities: this.velocities,
      data: {},
    }
  }

  resize() {
    if (this.isDisposed || !this.renderer) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (w === 0 || h === 0) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.render()
  }

  private render() {
    if (this.isDisposed || !this.renderer) return
    const gl = this.renderer.getContext()
    if (!gl || gl.isContextLost()) return
    this.renderer.render(this.scene, this.camera)
  }

  private cleanupActiveDie() {
    if (this.die) {
      this.scene.remove(this.die)
      disposeHierarchy(this.die)
      this.die = null
    }

    this.activeTextures.forEach((tex) => tex.dispose())
    this.activeTextures = []

    this.faceMaterials.forEach((mat) => {
      if (mat.map) mat.map.dispose()
      mat.dispose()
    })
    this.faceMaterials = []
  }

  private buildDie(sides: number, _value: number): THREE.Group {
    const group = new THREE.Group()
    const r = 1.25

    let geo: THREE.BufferGeometry
    switch (sides) {
      case 4:   geo = new THREE.TetrahedronGeometry(r * 1.15); break
      case 6:   geo = new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4); break
      case 8:   geo = new THREE.OctahedronGeometry(r * 1.15); break
      case 10:  geo = new THREE.ConeGeometry(r, r * 1.9, 10); break
      case 12:  geo = new THREE.DodecahedronGeometry(r * 1.05); break
      case 20:  geo = new THREE.IcosahedronGeometry(r * 1.1); break
      case 100: geo = new THREE.SphereGeometry(r * 1.05, 16, 12); break
      default:  geo = new THREE.IcosahedronGeometry(r * 1.1)
    }

    const mat = new THREE.MeshStandardMaterial({
      color: this.skin.body,
      roughness: this.skin.roughness,
      metalness: this.skin.metalness,
      emissive: this.skin.emissive,
      emissiveIntensity: 0.18,
      flatShading: sides !== 100,
    })
    const solid = new THREE.Mesh(geo, mat)
    group.add(solid)

    const edges = new THREE.EdgesGeometry(geo)
    const lineMat = new THREE.LineBasicMaterial({
      color: this.skin.edge,
      transparent: true,
      opacity: 0.35,
    })
    group.add(new THREE.LineSegments(edges, lineMat))

    this.addFaceNumerals(group, geo, r, '?')
    return group
  }

  private addFaceNumerals(group: THREE.Group, geo: THREE.BufferGeometry, r: number, text: string) {
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const index = geo.getIndex()
    const triangles: number[][] = []
    if (index) {
      for (let i = 0; i < index.count; i += 3)
        triangles.push([index.getX(i), index.getX(i + 1), index.getX(i + 2)])
    } else {
      for (let i = 0; i < posAttr.count; i += 3) triangles.push([i, i + 1, i + 2])
    }

    const faces: { center: THREE.Vector3; normal: THREE.Vector3 }[] = []
    const used = new Set<number>()
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3()
    const nrm = new THREE.Vector3(), edge1 = new THREE.Vector3(), edge2 = new THREE.Vector3()

    const triNormal = (t: number[]) => {
      vA.fromBufferAttribute(posAttr, t[0])
      vB.fromBufferAttribute(posAttr, t[1])
      vC.fromBufferAttribute(posAttr, t[2])
      edge1.subVectors(vB, vA)
      edge2.subVectors(vC, vA)
      return nrm.crossVectors(edge1, edge2).normalize().clone()
    }

    for (let i = 0; i < triangles.length; i++) {
      if (used.has(i)) continue
      const n1 = triNormal(triangles[i])
      const group2: number[] = [i]
      used.add(i)
      for (let jdx = i + 1; jdx < triangles.length; jdx++) {
        if (used.has(jdx)) continue
        const n2 = triNormal(triangles[jdx])
        if (n1.dot(n2) > 0.999) { group2.push(jdx); used.add(jdx) }
      }
      const center = new THREE.Vector3()
      let count = 0
      for (const ti of group2) {
        for (const vi of triangles[ti]) {
          vA.fromBufferAttribute(posAttr, vi)
          center.add(vA); count++
        }
      }
      center.divideScalar(count)
      if (n1.dot(center) < 0) n1.negate()
      faces.push({ center, normal: n1 })
    }

    const maxFaces = 40
    const step = faces.length > maxFaces ? Math.ceil(faces.length / maxFaces) : 1
    const tex = this.makeNumberTexture(text)
    this.activeTextures.push(tex)
    this.faceMaterials = []
    const PLANE_FORWARD = new THREE.Vector3(0, 0, 1)
    for (let i = 0; i < faces.length; i += step) {
      const { center, normal } = faces[i]
      const planeSize = r * 0.9
      const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.FrontSide })
      this.faceMaterials.push(faceMat)
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), faceMat)
      plane.position.copy(center).addScaledVector(normal, 0.02)
      plane.quaternion.setFromUnitVectors(PLANE_FORWARD, normal.clone().normalize())
      group.add(plane)
    }
  }

  private makeNumberTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 128, 128)
    ctx.font = `bold ${text.length > 2 ? 56 : 76}px Cinzel, serif`
    ctx.fillStyle = this.skin.numeral
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#c9963d'
    ctx.shadowBlur = 12
    ctx.fillText(text, 64, 70)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  throw({ sides, displayValue, skin, effect, onDone }: ThrowOptions) {
    if (this.isDisposed) return
    if (skin) this.setSkin(skin)
    if (effect) this.setEffect(effect)

    this.rolling = true
    this.idleActive = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }

    // Clean up previous die and texture allocations before throwing anew
    this.cleanupActiveDie()

    this.die = this.buildDie(sides, displayValue)
    this.scene.add(this.die)

    const ctx = this.effectContext()
    if (ctx) {
      this.effect.init(ctx)
    }

    const start = performance.now()
    const duration = 1500
    const spin = {
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 10,
    }
    const rest = {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
      z: 0,
    }

    let revealed = false
    const revealAt = 0.82

    const frame = (now: number) => {
      if (this.isDisposed) return
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)

      if (!revealed && t >= revealAt) {
        revealed = true
        const numberTex = this.makeNumberTexture(String(displayValue))
        this.activeTextures.push(numberTex)
        for (const m of this.faceMaterials) {
          m.map = numberTex
          m.needsUpdate = true
        }
      }

      if (this.die) {
        if (t < 0.82) {
          const speed = (1 - t) * (1 - t)
          this.die.rotation.x += spin.x * speed * 0.05
          this.die.rotation.y += spin.y * speed * 0.05
          this.die.rotation.z += spin.z * speed * 0.04
        } else {
          const s = (t - 0.82) / 0.18
          const es = 1 - Math.pow(1 - s, 2)
          this.die.rotation.x += (rest.x - this.die.rotation.x) * es * 0.35
          this.die.rotation.y += (rest.y - this.die.rotation.y) * es * 0.35
          this.die.rotation.z += (rest.z - this.die.rotation.z) * es * 0.35
        }
        this.die.position.x = THREE.MathUtils.lerp(-4.5, 0, Math.min(ease * 1.3, 1))
        this.die.position.y = Math.sin(t * Math.PI) * 1.1 * (1 - t * 0.4)
        const scale = 0.6 + ease * 0.4
        this.die.scale.setScalar(scale)
      }

      if (ctx) {
        this.effect.frame(ctx, t)
      }
      this.render()

      if (t < 1) {
        this.rafId = requestAnimationFrame(frame)
      } else {
        this.rolling = false
        if (ctx) {
          this.effect.done(ctx)
        }
        this.startIdle()
        onDone?.()
      }
    }

    this.rafId = requestAnimationFrame(frame)
  }

  private startIdle() {
    if (this.isDisposed) return
    this.idleActive = true
    const spin = () => {
      if (!this.idleActive || this.isDisposed) return
      if (this.die) {
        this.die.rotation.y += 0.004
        this.die.rotation.x += 0.0015
      }
      this.render()
      this.rafId = requestAnimationFrame(spin)
    }
    this.rafId = requestAnimationFrame(spin)
  }

  dispose() {
    this.isDisposed = true
    this.idleActive = false
    this.rolling = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }

    // 1. Clean up active die & face materials
    this.cleanupActiveDie()

    // 2. Clean up particles & scene hierarchies
    if (this.particles) {
      this.scene.remove(this.particles)
      disposeHierarchy(this.particles)
      this.particles = null
    }

    disposeHierarchy(this.scene)

    // 3. Dispose renderer safely (no forceContextLoss to prevent React 18 / StrictMode re-mount breaks)
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
  }
}
