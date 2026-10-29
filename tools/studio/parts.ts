// Procedural CGI auto parts used to render the hero film and the category / product stills.
import * as THREE from 'three'

export const ACCENT = 0xff4b1f

// ---------- materials ----------
export const mat = {
  steel: (rough = 0.3, color = 0xb9bdc3) =>
    new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough }),
  castIron: () => new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 0.85, roughness: 0.62 }),
  darkZinc: () => new THREE.MeshStandardMaterial({ color: 0x4a4d54, metalness: 0.6, roughness: 0.42 }),
  alu: (rough = 0.38) => new THREE.MeshPhysicalMaterial({ color: 0xc8cbcf, metalness: 0.75, roughness: rough }),
  chrome: () => new THREE.MeshPhysicalMaterial({ color: 0xe8eaee, metalness: 1, roughness: 0.06 }),
  accentPaint: (rough = 0.32) =>
    new THREE.MeshPhysicalMaterial({ color: ACCENT, metalness: 0.15, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.08 }),
  blackPlastic: (rough = 0.55) => new THREE.MeshPhysicalMaterial({ color: 0x141518, metalness: 0, roughness: rough, clearcoat: 0.2 }),
  glossBlack: () => new THREE.MeshPhysicalMaterial({ color: 0x0b0c0e, metalness: 0.1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
  ceramic: () => new THREE.MeshPhysicalMaterial({ color: 0xf2f0ea, metalness: 0, roughness: 0.18, clearcoat: 0.8 }),
  paint: (color = 0x24272c) =>
    new THREE.MeshPhysicalMaterial({ color, metalness: 0.6, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xc27a4a, metalness: 1, roughness: 0.35 }),
}

// ---------- textures ----------
function canvasTex(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, color = false) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(c)
  if (color) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Concentric machining marks — mapped onto shapes whose UVs equal their XY coordinates. */
export function radialBrushTex(radius: number) {
  const t = canvasTex(1024, (g, s) => {
    g.fillStyle = '#7a7a7a'
    g.fillRect(0, 0, s, s)
    for (let r = 2; r < s / 2; r += 1.3) {
      const v = 95 + Math.random() * 70
      g.strokeStyle = `rgb(${v},${v},${v})`
      g.lineWidth = 1 + Math.random() * 1.2
      g.beginPath()
      g.arc(s / 2, s / 2, r, 0, Math.PI * 2)
      g.stroke()
    }
  })
  t.repeat.set(1 / (2 * radius), 1 / (2 * radius))
  t.offset.set(0.5, 0.5)
  return t
}

/** Radial heat gradient for the hot brake disc. */
export function heatTex(radius: number, inner: number) {
  const t = canvasTex(
    512,
    (g, s) => {
      const grd = g.createRadialGradient(s / 2, s / 2, (s / 2) * (inner / radius), s / 2, s / 2, s / 2)
      grd.addColorStop(0, '#000')
      grd.addColorStop(0.35, '#1a0500')
      grd.addColorStop(0.7, '#ff4a10')
      grd.addColorStop(0.9, '#ffb060')
      grd.addColorStop(1, '#ff7020')
      g.fillStyle = grd
      g.fillRect(0, 0, s, s)
    },
    true,
  )
  t.repeat.set(1 / (2 * radius), 1 / (2 * radius))
  t.offset.set(0.5, 0.5)
  return t
}

export function noiseTex(scale = 1) {
  const t = canvasTex(512, (g, s) => {
    const img = g.createImageData(s, s)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + Math.random() * 60
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(scale, scale)
  return t
}

// ---------- helpers ----------
const TAU = Math.PI * 2

/** Lathe from [radius, height] pairs, axis = Y. */
export function lathe(profile: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  )
}

function ring(r: number, segs = 64) {
  const p = new THREE.Path()
  p.absarc(0, 0, r, 0, TAU, true)
  return p
}

function holeAt(x: number, y: number, r: number) {
  const p = new THREE.Path()
  p.absarc(x, y, r, 0, TAU, true)
  return p
}

function extrude(shape: THREE.Shape, depth: number, bevel = 0.02, curveSegments = 48) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments,
  })
  return g
}

function mesh(g: THREE.BufferGeometry, m: THREE.Material) {
  const o = new THREE.Mesh(g, m)
  o.castShadow = true
  o.receiveShadow = true
  return o
}

// ---------- brake disc + caliper ----------
export function brakeDisc(opts: { caliper?: boolean; heat?: boolean } = {}) {
  const group = new THREE.Group()
  const R = 1.6
  const r = 0.95
  const rough = radialBrushTex(R)
  const face = new THREE.MeshPhysicalMaterial({
    color: 0xbfc3c8,
    metalness: 1,
    roughness: 0.42,
    roughnessMap: rough,
    clearcoat: 0.15,
  })
  let heatMat: THREE.MeshPhysicalMaterial | null = null
  if (opts.heat) {
    face.emissiveMap = heatTex(R, r)
    face.emissive = new THREE.Color(0xffffff)
    face.emissiveIntensity = 0
    heatMat = face
  }
  const ringShape = new THREE.Shape()
  ringShape.absarc(0, 0, R, 0, TAU, false)
  ringShape.holes.push(ring(r))
  // drilled cross holes, staggered in three rows
  const rows = [1.13, 1.29, 1.45]
  for (let i = 0; i < 18; i++) {
    rows.forEach((rr, k) => {
      const a = (i / 18) * TAU + k * 0.105
      ringShape.holes.push(holeAt(Math.cos(a) * rr, Math.sin(a) * rr, 0.043))
    })
  }
  const plateGeo = extrude(ringShape, 0.11, 0.012, 64)
  const front = mesh(plateGeo, face)
  front.position.z = 0.27
  const back = mesh(plateGeo, face)
  group.add(front, back)

  // cooling vanes between the friction plates
  const vaneMat = mat.castIron()
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * TAU
    const v = mesh(new THREE.BoxGeometry(0.62, 0.05, 0.16), vaneMat)
    v.position.set(Math.cos(a) * 1.28, Math.sin(a) * 1.28, 0.195)
    v.rotation.z = a + 0.35
    group.add(v)
  }

  // hat
  const hatMat = new THREE.MeshPhysicalMaterial({ color: 0x4a4e55, metalness: 0.95, roughness: 0.36, roughnessMap: radialBrushTex(0.9) })
  const wall = mesh(lathe([[0.97, 0.12], [0.93, 0.18], [0.9, 0.4], [0.88, 0.7], [0.86, 0.74]], 96), hatMat)
  wall.rotation.x = Math.PI / 2
  wall.position.z = 0.38
  wall.material.side = THREE.DoubleSide
  const top = new THREE.Shape()
  top.absarc(0, 0, 0.9, 0, TAU, false)
  top.holes.push(ring(0.33))
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3
    top.holes.push(holeAt(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.075))
  }
  const topMesh = mesh(extrude(top, 0.06, 0.015), hatMat)
  topMesh.position.z = 1.05
  group.add(wall, topMesh)

  let caliper: THREE.Group | null = null
  if (opts.caliper) {
    caliper = new THREE.Group()
    const cm = mat.accentPaint(0.22)
    const sector = (r0: number, r1: number, a0: number, a1: number) => {
      const s = new THREE.Shape()
      s.absarc(0, 0, r1, a0, a1, false)
      s.absarc(0, 0, r0, a1, a0, true)
      s.closePath()
      return s
    }
    const a0 = Math.PI * 0.12
    const a1 = Math.PI * 0.42
    const frontBody = mesh(extrude(sector(1.18, 1.86, a0, a1), 0.3, 0.08), cm)
    frontBody.position.z = 0.5
    const backBody = mesh(extrude(sector(1.18, 1.86, a0, a1), 0.3, 0.08), cm)
    backBody.position.z = -0.42
    const bridge = mesh(extrude(sector(1.7, 1.86, a0 + 0.05, a1 - 0.05), 1.22, 0.06), cm)
    bridge.position.z = -0.42
    caliper.add(frontBody, backBody, bridge)
    // pistons visible as round bumps + bolts
    const boltMat = mat.chrome()
    for (const f of [0.25, 0.75]) {
      const a = a0 + (a1 - a0) * f
      const bump = mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.08, 48), cm)
      bump.rotation.x = Math.PI / 2
      bump.position.set(Math.cos(a) * 1.52, Math.sin(a) * 1.52, 0.9)
      const bolt = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), boltMat)
      bolt.rotation.x = Math.PI / 2
      bolt.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.9)
      caliper.add(bump, bolt)
    }
  }

  const rotor = new THREE.Group()
  rotor.add(group)
  return { rotor, caliper, heatMat }
}

// ---------- gears ----------
export function gearGeometry(N: number, m: number, width: number, opts: { hole?: number; windows?: number; sharp?: boolean } = {}) {
  const rp = (m * N) / 2
  const ra = rp + m
  const rf = rp - 1.25 * m
  const s = new THREE.Shape()
  const per = 20
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < per; k++) {
      const frac = k / per
      const d = Math.abs(frac - 0.5)
      let h: number
      const tip = opts.sharp ? 0.06 : 0.12
      const root = opts.sharp ? 0.38 : 0.31
      if (d < tip) h = 1
      else if (d > root) h = 0
      else h = Math.pow((root - d) / (root - tip), opts.sharp ? 0.6 : 0.85)
      const a = ((i + frac) / N) * TAU
      const rr = rf + (ra - rf) * h
      if (i === 0 && k === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
      else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
  }
  s.closePath()
  if (opts.hole) s.holes.push(ring(opts.hole))
  if (opts.windows) {
    const wr = (rf + (opts.hole ?? 0)) / 2
    const wsize = (rf - (opts.hole ?? 0)) * 0.28
    for (let i = 0; i < opts.windows; i++) {
      const a = (i / opts.windows) * TAU
      s.holes.push(holeAt(Math.cos(a) * wr, Math.sin(a) * wr, wsize))
    }
  }
  const g = extrude(s, width, Math.min(0.03, m * 0.18), 12)
  g.translate(0, 0, -width / 2)
  return { geometry: g, rp }
}

export function gearSet() {
  const group = new THREE.Group()
  const m = 0.11
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0xc4c8cd,
    metalness: 0.7,
    roughness: 0.32,
    roughnessMap: noiseTex(3),
  })
  const dark = mat.darkZinc()
  const A = gearGeometry(32, m, 0.5, { hole: 0.32, windows: 6 })
  const B = gearGeometry(18, m, 0.62, { hole: 0.18 })
  const C = gearGeometry(24, m, 0.4, { hole: 0.22, windows: 5 })
  const ga = mesh(A.geometry, steel)
  const gb = mesh(B.geometry, steel)
  const gc = mesh(C.geometry, dark)
  const dAB = A.rp + B.rp
  const dBC = B.rp + C.rp
  const angBC = -0.9
  gb.position.set(dAB, 0, 0.05)
  gc.position.set(dAB + Math.cos(angBC) * dBC, Math.sin(angBC) * dBC, -0.02)
  const shaftMat = mat.chrome()
  for (const g of [ga, gb, gc]) {
    const sh = mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 48), shaftMat)
    sh.rotation.x = Math.PI / 2
    sh.position.copy(g.position)
    group.add(sh)
    const hub = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.75, 48), dark)
    hub.rotation.x = Math.PI / 2
    hub.position.copy(g.position)
    group.add(hub)
  }
  group.add(ga, gb, gc)
  // phase so that teeth mesh
  const update = (t: number) => {
    const w = 0.35
    ga.rotation.z = w * t
    gb.rotation.z = -w * t * (32 / 18) + Math.PI / 18
    gc.rotation.z = w * t * (32 / 24) + 0.11
  }
  update(0)
  return { group, update }
}

// ---------- coil spring + damper ----------
export function springStrut(springColor: number = ACCENT) {
  const group = new THREE.Group()
  const turns = 6.5
  const H = 3.2
  const Rc = 0.62
  class Helix extends THREE.Curve<THREE.Vector3> {
    getPoint(u: number, target = new THREE.Vector3()) {
      const a = u * turns * TAU
      // ground ends: compress pitch near the extremities
      const e = 0.07
      let y: number
      if (u < e) y = (u / e) * 0.12
      else if (u > 1 - e) y = H - ((1 - u) / e) * 0.12
      else y = 0.12 + ((u - e) / (1 - 2 * e)) * (H - 0.24)
      return target.set(Math.cos(a) * Rc, y - H / 2, Math.sin(a) * Rc)
    }
  }
  const springMat = new THREE.MeshPhysicalMaterial({
    color: springColor,
    metalness: 0.2,
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  })
  group.add(mesh(new THREE.TubeGeometry(new Helix(), 900, 0.1, 24, false), springMat))
  const body = mesh(lathe([[0, -2.6], [0.3, -2.6], [0.32, -2.5], [0.32, -0.3], [0.2, -0.2], [0, -0.2]]), mat.glossBlack())
  const rod = mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 48), mat.chrome())
  rod.position.y = 0.8
  const seatProfile: [number, number][] = [[0.25, -0.05], [0.82, -0.05], [0.86, 0], [0.82, 0.05], [0.25, 0.05]]
  const seatLow = mesh(lathe(seatProfile), mat.darkZinc())
  seatLow.position.y = -H / 2 - 0.05
  const seatHigh = mesh(lathe(seatProfile), mat.darkZinc())
  seatHigh.position.y = H / 2 + 0.05
  const mount = mesh(lathe([[0, 0], [0.55, 0], [0.62, 0.12], [0.45, 0.32], [0.18, 0.36], [0, 0.36]]), mat.blackPlastic(0.7))
  mount.position.y = H / 2 + 0.1
  const eye = mesh(new THREE.TorusGeometry(0.22, 0.08, 24, 48), mat.darkZinc())
  eye.position.y = -2.85
  group.add(body, rod, seatLow, seatHigh, mount, eye)
  return group
}

// ---------- piston + connecting rod ----------
export function pistonRod() {
  const group = new THREE.Group()
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xcdd0d4, metalness: 0.75, roughness: 0.3, roughnessMap: noiseTex(4) })
  const R = 0.82
  const prof: [number, number][] = [[0, 1.0], [0.5, 1.02], [R - 0.02, 0.99], [R, 0.96]]
  // ring grooves
  const grooves = [0.86, 0.72, 0.58]
  let y = 0.96
  for (const gy of grooves) {
    prof.push([R, gy + 0.04], [R - 0.05, gy + 0.035], [R - 0.05, gy - 0.025], [R, gy - 0.03])
    y = gy - 0.03
  }
  prof.push([R, y - 0.02], [R - 0.01, -0.35], [R - 0.06, -0.42], [R - 0.12, -0.42])
  const piston = mesh(lathe(prof, 128), alu)
  // rings
  const ringMat = mat.steel(0.2, 0x8d9096)
  grooves.forEach((gy) => {
    const r = mesh(new THREE.TorusGeometry(R - 0.035, 0.028, 12, 128), ringMat)
    r.rotation.x = Math.PI / 2
    r.position.y = gy + 0.005
    group.add(r)
  })
  const pin = mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.7, 48), mat.chrome())
  pin.rotation.z = Math.PI / 2
  pin.position.y = 0.05
  // connecting rod
  const rodShape = new THREE.Shape()
  rodShape.absarc(0, 0, 0.36, Math.PI * 0.15, Math.PI * 0.85, true)
  rodShape.lineTo(-0.62, -2.15)
  rodShape.absarc(0, -2.6, 0.78, Math.PI * 0.62, Math.PI * 0.38, true)
  rodShape.lineTo(0.62, -2.15)
  rodShape.lineTo(Math.cos(Math.PI * 0.15) * 0.36, Math.sin(Math.PI * 0.15) * 0.36)
  rodShape.holes.push(holeAt(0, 0, 0.2))
  rodShape.holes.push(holeAt(0, -2.6, 0.5))
  const rodMat = new THREE.MeshPhysicalMaterial({ color: 0x9a9ea4, metalness: 0.65, roughness: 0.4, roughnessMap: noiseTex(2) })
  const rodGeo = extrude(rodShape, 0.32, 0.05, 32)
  rodGeo.translate(0, 0, -0.16)
  const rod = mesh(rodGeo, rodMat)
  rod.rotation.y = Math.PI / 2
  rod.position.y = 0.05
  const bearing = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 64, 1, true), mat.copper())
  bearing.rotation.z = Math.PI / 2
  bearing.position.y = -2.55
  for (const s of [-1, 1]) {
    const bolt = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), mat.chrome())
    bolt.position.set(0, -3.25, s * 0.55)
    group.add(bolt)
  }
  group.add(piston, pin, rod, bearing)
  return group
}

// ---------- headlight projector ----------
export function headlight() {
  const group = new THREE.Group()
  const housing = mesh(lathe([[0, -0.6], [1.15, -0.6], [1.25, -0.4], [1.25, 0.3], [1.15, 0.36], [1.05, 0.36]], 128), mat.glossBlack())
  housing.rotation.x = Math.PI / 2
  const bowlPts: [number, number][] = []
  for (let i = 0; i <= 24; i++) {
    const r = 0.3 + (i / 24) * 0.75
    bowlPts.push([r, -0.55 + Math.pow(r / 1.05, 2) * 0.85])
  }
  const bowl = mesh(lathe(bowlPts, 128), mat.chrome())
  bowl.material.side = THREE.DoubleSide
  bowl.rotation.x = Math.PI / 2
  const lens = mesh(
    new THREE.SphereGeometry(0.52, 96, 48, 0, TAU, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.6, ior: 1.52, clearcoat: 1 }),
  )
  lens.rotation.x = Math.PI / 2
  lens.position.z = 0.32
  const lensRing = mesh(new THREE.TorusGeometry(0.54, 0.05, 24, 96), mat.chrome())
  lensRing.position.z = 0.32
  const drl = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.035, 24, 160),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xdfe9ff, emissiveIntensity: 1.8 }),
  )
  drl.position.z = 0.3
  const drlBase = mesh(new THREE.TorusGeometry(0.88, 0.07, 24, 160), mat.glossBlack())
  drlBase.position.z = 0.22
  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 48),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xf4f7ff, emissiveIntensity: 1.2 }),
  )
  led.position.z = -0.35
  group.add(housing, bowl, lens, lensRing, drl, drlBase, led)
  return group
}

// ---------- cooling fan + radiator ----------
export function coolingFan() {
  const group = new THREE.Group()
  const bladeMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1c20, metalness: 0.1, roughness: 0.45, side: THREE.DoubleSide, clearcoat: 0.3 })
  const fan = new THREE.Group()
  const nB = 7
  for (let b = 0; b < nB; b++) {
    const g = new THREE.PlaneGeometry(1, 1, 24, 12)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + 0.5 // radial 0..1
      const v = p.getY(i) // chord -0.5..0.5
      const r = 0.36 + u * 1.12
      const chord = 0.55 + u * 0.35
      const sweep = u * u * 0.35
      const a = (b / nB) * TAU + (v * chord) / r + sweep
      const z = v * chord * 0.55 * (1 - u * 0.35)
      p.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, z)
    }
    g.computeVertexNormals()
    fan.add(mesh(g, bladeMat))
  }
  const hub = mesh(lathe([[0, 0.25], [0.3, 0.24], [0.4, 0.15], [0.42, -0.2], [0, -0.2]]), mat.blackPlastic(0.4))
  hub.rotation.x = Math.PI / 2
  const cap = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 48), mat.accentPaint())
  cap.rotation.x = Math.PI / 2
  cap.position.z = 0.27
  fan.add(hub, cap)
  const shroud = mesh(new THREE.TorusGeometry(1.56, 0.06, 16, 160), mat.blackPlastic(0.5))
  const shroudBody = mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.45, 160, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x15161a, roughness: 0.6, side: THREE.DoubleSide }))
  shroudBody.rotation.x = Math.PI / 2
  shroudBody.position.z = -0.2
  // radiator core behind
  const finMat = mat.alu(0.45)
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 3.6, 0.3), finMat, 150)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 150; i++) {
    m4.makeTranslation(-2 + (i / 149) * 4, 0, -0.75)
    fins.setMatrixAt(i, m4)
  }
  fins.castShadow = fins.receiveShadow = true
  const tubes = new THREE.InstancedMesh(new THREE.BoxGeometry(4.05, 0.04, 0.26), mat.alu(0.3), 28)
  for (let i = 0; i < 28; i++) {
    m4.makeTranslation(0, -1.75 + (i / 27) * 3.5, -0.75)
    tubes.setMatrixAt(i, m4)
  }
  const tankMat = mat.blackPlastic(0.65)
  for (const s of [-1, 1]) {
    const tank = mesh(new THREE.BoxGeometry(0.28, 3.8, 0.45), tankMat)
    tank.position.set(s * 2.15, 0, -0.75)
    group.add(tank)
  }
  group.add(fan, shroud, shroudBody, fins, tubes)
  return { group, fan }
}

// ---------- steering wheel ----------
export function steeringWheel() {
  const group = new THREE.Group()
  const leather = new THREE.MeshPhysicalMaterial({ color: 0x17181b, roughness: 0.62, roughnessMap: noiseTex(8), sheen: 0.4, sheenColor: new THREE.Color(0x444444) })
  const rim = mesh(new THREE.TorusGeometry(1.45, 0.14, 48, 220), leather)
  const stitch = mesh(new THREE.TorusGeometry(1.45, 0.142, 8, 220, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.6 }))
  stitch.rotation.z = Math.PI * 0.25
  stitch.scale.set(1, 1, 0.12)
  const hub = mesh(lathe([[0, 0.25], [0.45, 0.24], [0.58, 0.12], [0.6, -0.15], [0, -0.15]]), mat.blackPlastic(0.35))
  hub.rotation.x = Math.PI / 2
  const badge = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 64), mat.alu(0.25))
  badge.rotation.x = Math.PI / 2
  badge.position.z = 0.27
  const spokeMat = mat.alu(0.3)
  for (const a of [0, Math.PI, -Math.PI / 2]) {
    const s = new THREE.Shape()
    s.moveTo(0.5, -0.16)
    s.lineTo(1.36, -0.12)
    s.lineTo(1.36, 0.12)
    s.lineTo(0.5, 0.2)
    s.closePath()
    const sp = mesh(extrude(s, 0.1, 0.04), a === -Math.PI / 2 ? mat.blackPlastic(0.4) : spokeMat)
    sp.rotation.z = a
    sp.position.z = -0.05
    group.add(sp)
  }
  const column = mesh(new THREE.CylinderGeometry(0.3, 0.38, 1.4, 48), mat.blackPlastic(0.6))
  column.rotation.x = Math.PI / 2
  column.position.z = -0.85
  group.add(rim, stitch, hub, badge, column)
  return group
}

// ---------- alternator ----------
export function alternator() {
  const group = new THREE.Group()
  const cast = new THREE.MeshPhysicalMaterial({ color: 0xbcc0c5, metalness: 1, roughness: 0.5, roughnessMap: noiseTex(5) })
  const body = mesh(lathe([[0, -0.75], [0.8, -0.75], [0.95, -0.62], [0.98, 0.5], [0.9, 0.62], [0.55, 0.66], [0, 0.66]], 96), cast)
  group.add(body)
  // ventilation slots — dark recessed boxes around the case
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 })
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU
    for (const y of [-0.38, 0.25]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.22), slotMat)
      s.position.set(Math.cos(a) * 0.93, y, Math.sin(a) * 0.93)
      s.rotation.y = -a
      group.add(s)
    }
  }
  const fanProfile: [number, number][] = [[0.2, 0.66], [0.72, 0.66], [0.72, 0.74], [0.2, 0.74]]
  group.add(mesh(lathe(fanProfile), mat.darkZinc()))
  const pulleyProf: [number, number][] = [[0.1, 0.74], [0.38, 0.74]]
  for (let i = 0; i < 6; i++) {
    const y0 = 0.76 + i * 0.07
    pulleyProf.push([0.42, y0], [0.36, y0 + 0.035])
  }
  pulleyProf.push([0.42, 1.18], [0.38, 1.22], [0.1, 1.22])
  group.add(mesh(lathe(pulleyProf), mat.steel(0.22)))
  const nut = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 6), mat.chrome())
  nut.position.y = 1.27
  group.add(nut)
  // mounting ears
  for (const a of [0.4, Math.PI - 0.4]) {
    const ear = mesh(new THREE.BoxGeometry(0.55, 0.28, 0.3), cast)
    ear.position.set(Math.cos(a) * 1.05, -0.2, Math.sin(a) * 1.05)
    ear.rotation.y = -a
    const boss = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.32, 32), cast)
    boss.rotation.z = Math.PI / 2
    boss.rotation.y = -a
    boss.position.set(Math.cos(a) * 1.3, -0.2, Math.sin(a) * 1.3)
    group.add(ear, boss)
  }
  const terminal = mesh(new THREE.BoxGeometry(0.35, 0.22, 0.25), mat.blackPlastic())
  terminal.position.set(0, -0.82, 0.45)
  group.add(terminal)
  return group
}

// ---------- starter motor ----------
export function starter() {
  const group = new THREE.Group()
  const motor = mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.0, 96), mat.glossBlack())
  motor.rotation.z = Math.PI / 2
  const endcap = mesh(lathe([[0, 0], [0.62, 0], [0.58, 0.18], [0.3, 0.26], [0, 0.26]]), mat.alu(0.4))
  endcap.rotation.z = Math.PI / 2
  endcap.position.x = -1.0
  const nose = mesh(lathe([[0, 0], [0.66, 0], [0.7, 0.3], [0.45, 0.9], [0.3, 1.05], [0, 1.05]]), mat.alu(0.45))
  nose.rotation.z = -Math.PI / 2
  nose.position.x = 1.0
  const sol = mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.1, 64), mat.steel(0.3, 0xb0b4ba))
  sol.rotation.z = Math.PI / 2
  sol.position.set(0.55, 0.88, 0)
  const solCap = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 64), mat.blackPlastic(0.4))
  solCap.rotation.z = Math.PI / 2
  solCap.position.set(-0.05, 0.88, 0)
  const pinion = mesh(gearGeometry(10, 0.07, 0.35, { hole: 0.06 }).geometry, mat.steel(0.25))
  pinion.rotation.y = Math.PI / 2
  pinion.position.x = 2.1
  const band = mesh(new THREE.CylinderGeometry(0.635, 0.635, 0.12, 96), mat.accentPaint())
  band.rotation.z = Math.PI / 2
  band.position.x = -0.6
  group.add(motor, endcap, nose, sol, solCap, pinion, band)
  return group
}

// ---------- crankshaft sensor ----------
export function sensor() {
  const group = new THREE.Group()
  const body = mesh(lathe([[0, -1.4], [0.2, -1.4], [0.24, -1.35], [0.24, 0], [0.32, 0.05], [0.32, 0.3], [0, 0.3]]), mat.blackPlastic(0.45))
  const flange = new THREE.Shape()
  flange.absarc(0, 0, 0.4, Math.PI / 2, -Math.PI / 2, false)
  flange.lineTo(1.0, -0.3)
  flange.absarc(1.0, 0, 0.3, -Math.PI / 2, Math.PI / 2, false)
  flange.closePath()
  flange.holes.push(holeAt(1.0, 0, 0.13))
  const fl = mesh(extrude(flange, 0.1, 0.03), mat.blackPlastic(0.45))
  fl.rotation.x = -Math.PI / 2
  fl.position.y = 0.0
  const sleeve = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.14, 32, 1, true), mat.steel(0.25))
  sleeve.position.set(1.0, 0.03, 0)
  const conn = mesh(new THREE.BoxGeometry(0.5, 0.55, 0.62), mat.blackPlastic(0.45))
  conn.position.set(-0.2, 0.55, 0)
  const o = mesh(new THREE.TorusGeometry(0.235, 0.035, 12, 64), new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.5 }))
  o.rotation.x = Math.PI / 2
  o.position.y = -0.15
  const tip = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), mat.steel(0.3))
  tip.position.y = -1.41
  group.add(body, fl, sleeve, conn, o, tip)
  return group
}

// ---------- timing chain tensioner ----------
export function tensioner() {
  const group = new THREE.Group()
  const hex = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 6), mat.steel(0.3, 0xa9adb3))
  hex.rotation.z = Math.PI / 2
  const body = mesh(lathe([[0, -0.2], [0.4, -0.2], [0.4, 1.6], [0.36, 1.65], [0, 1.65]]), mat.steel(0.35, 0xb5b9be))
  body.rotation.z = -Math.PI / 2
  body.position.x = 0.15
  const thread = mesh(lathe(Array.from({ length: 20 }, (_, i) => [i % 2 ? 0.42 : 0.38, i * 0.03] as [number, number])), mat.steel(0.3))
  thread.rotation.z = -Math.PI / 2
  thread.position.x = 0.2
  const plunger = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 48), mat.chrome())
  plunger.rotation.z = Math.PI / 2
  plunger.position.x = 2.1
  const tip = mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, TAU, 0, Math.PI / 2), mat.chrome())
  tip.rotation.z = -Math.PI / 2
  tip.position.x = 2.55
  const washer = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 64), mat.copper())
  washer.rotation.z = Math.PI / 2
  washer.position.x = 0.21
  const cap = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), mat.accentPaint())
  cap.rotation.z = Math.PI / 2
  cap.position.x = -0.22
  group.add(hex, body, thread, plunger, tip, washer, cap)
  return group
}

// ---------- chain sprocket ----------
export function sprocket() {
  const group = new THREE.Group()
  const g = gearGeometry(22, 0.13, 0.22, { hole: 0.3, sharp: true })
  const s = mesh(g.geometry, new THREE.MeshPhysicalMaterial({ color: 0xc0c4c9, metalness: 1, roughness: 0.28, roughnessMap: radialBrushTex(1.6) }))
  const hub = mesh(lathe([[0.3, -0.3], [0.62, -0.3], [0.62, 0.3], [0.3, 0.3]]), mat.steel(0.3, 0x9da1a7))
  hub.rotation.x = Math.PI / 2
  const key = mesh(new THREE.BoxGeometry(0.1, 0.1, 0.62), mat.darkZinc())
  key.position.y = 0.32
  group.add(s, hub, key)
  return group
}

// ---------- oil filter + spark plug (maintenance) ----------
export function oilFilter() {
  const group = new THREE.Group()
  const can = mesh(lathe([[0, 1.3], [0.55, 1.3], [0.66, 1.2], [0.68, 0.0], [0.62, -0.08], [0, -0.08]], 128), mat.accentPaint(0.35))
  const flutes = mesh(
    lathe(Array.from({ length: 2 }, (_, i) => [0.7, 1.05 + i * 0.25] as [number, number])),
    mat.glossBlack(),
  )
  const base = mesh(lathe([[0, -0.08], [0.62, -0.08], [0.62, -0.18], [0.5, -0.24], [0.3, -0.24], [0, -0.24]]), mat.steel(0.3))
  const band = mesh(new THREE.CylinderGeometry(0.685, 0.685, 0.5, 128, 1, true), mat.glossBlack())
  band.position.y = 0.45
  group.add(can, flutes, base, band)
  return group
}

export function sparkPlug() {
  const group = new THREE.Group()
  const ins = mesh(lathe([[0, 2.2], [0.1, 2.2], [0.12, 2.0], [0.2, 1.95], [0.2, 1.9], [0.17, 1.85], [0.2, 1.8], [0.17, 1.75], [0.2, 1.7], [0.17, 1.65], [0.2, 1.6], [0.22, 1.2], [0.25, 1.1], [0, 1.1]], 64), mat.ceramic())
  const term = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 24), mat.steel(0.2))
  term.position.y = 2.3
  const hex = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 6), mat.chrome())
  hex.position.y = 0.88
  const thr: [number, number][] = [[0, 0.65]]
  for (let i = 0; i < 18; i++) thr.push([i % 2 ? 0.3 : 0.26, 0.65 - i * 0.04])
  thr.push([0, -0.05])
  const thread = mesh(lathe(thr, 64), mat.steel(0.22, 0xd0d3d7))
  const ground = mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), mat.steel(0.3))
  ground.position.set(0.2, -0.13, 0)
  group.add(ins, term, hex, thread, ground)
  return group
}

// ---------- body panel (hood) ----------
/** Hood silhouette as an alpha mask: wider, curved front edge; narrower rear edge; rounded corners. */
function hoodMask() {
  const t = canvasTex(1024, (g, s) => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, s, s)
    g.fillStyle = '#fff'
    const p = (x: number, y: number): [number, number] => [(x / 5 + 0.5) * s, (0.5 - y / 3.6) * s]
    g.beginPath()
    g.moveTo(...p(-1.95, 1.7))
    g.quadraticCurveTo(...p(0, 1.78), ...p(1.95, 1.7))
    g.quadraticCurveTo(...p(2.25, 1.65), ...p(2.3, 1.2))
    g.lineTo(...p(2.42, -1.35))
    g.quadraticCurveTo(...p(2.4, -1.7), ...p(1.9, -1.72))
    g.quadraticCurveTo(...p(0, -1.95), ...p(-1.9, -1.72))
    g.quadraticCurveTo(...p(-2.4, -1.7), ...p(-2.42, -1.35))
    g.lineTo(...p(-2.3, 1.2))
    g.quadraticCurveTo(...p(-2.25, 1.65), ...p(-1.95, 1.7))
    g.fill()
  })
  t.anisotropy = 1
  return t
}

export function bodyPanel(color = 0x22252a, outline = false) {
  const g = new THREE.PlaneGeometry(5, 3.6, 220, 160)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    let z = -0.22 * (x / 2.5) ** 2 * 2.2 - 0.12 * (y / 1.8) ** 2
    const ax = Math.abs(x)
    // twin character lines
    z += 0.075 * Math.max(0, 1 - Math.abs(ax - 0.95) / 0.42) ** 2
    // central power dome
    z += 0.05 * (1 - THREE.MathUtils.smoothstep(ax, 0.35, 0.8)) * THREE.MathUtils.smoothstep(y, -1.8, 0.6)
    p.setZ(i, z)
  }
  g.computeVertexNormals()
  const m = mat.paint(color)
  if (outline) {
    m.alphaMap = hoodMask()
    m.alphaTest = 0.5
    m.side = THREE.DoubleSide
  }
  return mesh(g, m)
}

// ---------- door mirror (body parts) ----------
export function doorMirror(color = 0x454a53) {
  const group = new THREE.Group()
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.35, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03 })
  // housing: a rounded lathe shell, squashed into a wing-mirror capsule
  const shell = mesh(lathe([[0, -0.62], [0.55, -0.6], [0.85, -0.45], [0.98, -0.1], [1.0, 0.1], [0.98, 0.18], [0, 0.2]], 128), paint)
  shell.rotation.x = Math.PI / 2
  shell.scale.set(1.35, 1, 0.82)
  const glassFrame = mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.06, 128), mat.glossBlack())
  glassFrame.rotation.x = Math.PI / 2
  glassFrame.scale.set(1.35, 1, 0.82)
  glassFrame.position.z = 0.22
  const glass = mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.02, 128), new THREE.MeshPhysicalMaterial({ color: 0x9aa3ad, metalness: 1, roughness: 0.02 }))
  glass.rotation.x = Math.PI / 2
  glass.scale.set(1.35, 1, 0.8)
  glass.position.z = 0.25
  const repeater = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.06, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: ACCENT, emissiveIntensity: 1.6 }),
  )
  repeater.position.set(0, -0.73, -0.2)
  const armShape = new THREE.Shape()
  armShape.moveTo(-0.3, 0)
  armShape.lineTo(0.3, 0)
  armShape.lineTo(0.5, -1.0)
  armShape.lineTo(-0.5, -1.0)
  armShape.closePath()
  const arm = mesh(extrude(armShape, 0.5, 0.08), mat.glossBlack())
  arm.position.set(-0.75, -0.55, -0.55)
  const base = mesh(new THREE.BoxGeometry(1.5, 0.3, 0.9), mat.glossBlack())
  base.position.set(-0.75, -1.65, -0.3)
  group.add(shell, glassFrame, glass, repeater, arm, base)
  return group
}
