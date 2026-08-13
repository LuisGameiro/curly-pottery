// Rebuild public/favicon.ico from the real brand logo (Curly Logo Final 1.png),
// which is already the app's #fde372 yellow. Also updates the PWA icons.
//   node favicon-logo.mjs --inspect  -> print logo analysis (no changes)
//   node favicon-logo.mjs            -> rebuild icons
import fs from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'

// ---------- PNG codec ----------
let crcTable = null
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++)
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function parsePNG(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47)
    throw new Error('not a PNG')
  let off = 8
  const meta = {
    width: 0,
    height: 0,
    bitDepth: 0,
    colorType: 0,
    plte: null,
    trns: null,
    idat: [],
  }
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      meta.width = data.readUInt32BE(0)
      meta.height = data.readUInt32BE(4)
      meta.bitDepth = data[8]
      meta.colorType = data[9]
    } else if (type === 'PLTE') meta.plte = data
    else if (type === 'tRNS') meta.trns = data
    else if (type === 'IDAT') meta.idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  meta.raw = inflateSync(Buffer.concat(meta.idat))
  return meta
}

function unfilter(raw, bytesPerRow, height, bpp) {
  const out = Buffer.alloc(height * bytesPerRow)
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]
    const rowStart = y * bytesPerRow
    for (let x = 0; x < bytesPerRow; x++) {
      let v = raw[pos++]
      const a = x >= bpp ? out[rowStart + x - bpp] : 0
      const b = y > 0 ? out[rowStart - bytesPerRow + x] : 0
      const c = x >= bpp && y > 0 ? out[rowStart - bytesPerRow + x - bpp] : 0
      switch (filter) {
        case 0:
          break
        case 1:
          v = (v + a) & 0xff
          break
        case 2:
          v = (v + b) & 0xff
          break
        case 3:
          v = (v + ((a + b) >> 1)) & 0xff
          break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a),
            pb = Math.abs(p - b),
            pc = Math.abs(p - c)
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
          v = (v + pr) & 0xff
          break
        }
      }
      out[rowStart + x] = v
    }
  }
  return out
}

function decodePNG(buf) {
  const m = parsePNG(buf)
  const { width: w, height: h, bitDepth, colorType } = m
  const channels = [0, 1, 3, 1, 2, 0, 4][colorType]
  if (channels === undefined)
    throw new Error('unsupported colorType ' + colorType)
  const bpp = Math.max(1, Math.ceil((channels * bitDepth) / 8))
  const bytesPerRow = Math.ceil((w * channels * bitDepth) / 8)
  const rows = unfilter(m.raw, bytesPerRow, h, bpp)
  const rgba = Buffer.alloc(w * h * 4)
  const scale = (v) =>
    bitDepth === 16
      ? v >> 8
      : bitDepth < 8
        ? Math.round((v * 255) / ((1 << bitDepth) - 1))
        : v
  let bitPos = 0
  for (let y = 0; y < h; y++) {
    const rowStart = y * bytesPerRow
    for (let x = 0; x < w; x++) {
      const s = []
      for (let c = 0; c < channels; c++) {
        let val = 0
        for (let b = 0; b < bitDepth; b++) {
          val =
            (val << 1) |
            ((rows[rowStart + (bitPos >> 3)] >> (7 - (bitPos & 7))) & 1)
          bitPos++
        }
        s.push(val)
      }
      let R = 0,
        G = 0,
        B = 0,
        A = 255
      switch (colorType) {
        case 0:
          R = G = B = scale(s[0])
          break
        case 2:
          R = scale(s[0])
          G = scale(s[1])
          B = scale(s[2])
          break
        case 3: {
          const idx = scale(s[0])
          const po = idx * 3
          R = m.plte[po]
          G = m.plte[po + 1]
          B = m.plte[po + 2]
          if (m.trns && m.trns[idx] !== undefined) A = m.trns[idx]
          break
        }
        case 4:
          R = G = B = scale(s[0])
          A = scale(s[1])
          break
        case 6:
          R = scale(s[0])
          G = scale(s[1])
          B = scale(s[2])
          A = scale(s[3])
          break
      }
      const o = (y * w + x) * 4
      rgba[o] = R
      rgba[o + 1] = G
      rgba[o + 2] = B
      rgba[o + 3] = A
    }
  }
  return { width: w, height: h, rgba }
}

function encodePNG(width, height, rgba, filter = 0) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = filter
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(td))
    return Buffer.concat([len, td, crc])
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function writeICO(path, entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)
  const dir = Buffer.alloc(entries.length * 16)
  let offset = 6 + entries.length * 16
  entries.forEach((e, i) => {
    dir[i * 16] = e.w >= 256 ? 0 : e.w
    dir[i * 16 + 1] = e.h >= 256 ? 0 : e.h
    dir[i * 16 + 2] = 0
    dir[i * 16 + 3] = 0
    dir.writeUInt16LE(1, i * 16 + 4)
    dir.writeUInt16LE(32, i * 16 + 6)
    dir.writeUInt32LE(e.data.length, i * 16 + 8)
    dir.writeUInt32LE(offset, i * 16 + 12)
    offset += e.data.length
  })
  fs.writeFileSync(
    path,
    Buffer.concat([header, dir, ...entries.map((e) => e.data)]),
  )
}

function resizeBilinear(src, sw, sh, dw, dh) {
  const out = Buffer.alloc(dw * dh * 4)
  for (let y = 0; y < dh; y++) {
    const fy = ((y + 0.5) * sh) / dh - 0.5
    const y0 = Math.max(0, Math.floor(fy))
    const y1 = Math.min(sh - 1, y0 + 1)
    const wy = fy - y0
    for (let x = 0; x < dw; x++) {
      const fx = ((x + 0.5) * sw) / dw - 0.5
      const x0 = Math.max(0, Math.floor(fx))
      const x1 = Math.min(sw - 1, x0 + 1)
      const wx = fx - x0
      for (let c = 0; c < 4; c++) {
        const p00 = src[(y0 * sw + x0) * 4 + c]
        const p10 = src[(y0 * sw + x1) * 4 + c]
        const p01 = src[(y1 * sw + x0) * 4 + c]
        const p11 = src[(y1 * sw + x1) * 4 + c]
        const top = p00 * (1 - wx) + p10 * wx
        const bot = p01 * (1 - wx) + p11 * wx
        out[(y * dw + x) * 4 + c] = Math.round(top * (1 - wy) + bot * wy)
      }
    }
  }
  return out
}

function topColors(rgba, w, h, n = 5) {
  const counts = new Map()
  for (let i = 0; i < w * h; i++) {
    const a = rgba[i * 4 + 3]
    if (a === 0) continue
    const k = (rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2]
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  const total = [...counts.values()].reduce((s, v) => s + v, 0)
  return [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)
    .map(
      ([k, c]) =>
        `#${k.toString(16).padStart(6, '0')} ${((100 * c) / total).toFixed(1)}%`,
    )
}

// ---------- analysis ----------
const LOGO = 'public/Curly Logo Final 1.png'
const img = decodePNG(fs.readFileSync(LOGO))
const { width: W, height: H, rgba } = img

let opaque = 0,
  semi = 0,
  trans = 0
for (let i = 0; i < W * H; i++) {
  const a = rgba[i * 4 + 3]
  if (a === 255) opaque++
  else if (a === 0) trans++
  else semi++
}
console.log(
  `logo ${W}x${H}  alpha: opaque=${opaque} semi=${semi} trans=${trans}`,
)
const corner = (x, y) => {
  const o = (y * W + x) * 4
  return [rgba[o], rgba[o + 1], rgba[o + 2], rgba[o + 3]]
}
console.log(
  'corners TL,TR,BL,BR:',
  JSON.stringify([
    corner(0, 0),
    corner(W - 1, 0),
    corner(0, H - 1),
    corner(W - 1, H - 1),
  ]),
)

// background = median corner color (use alpha too)
const cs = [
  corner(0, 0),
  corner(W - 1, 0),
  corner(0, H - 1),
  corner(W - 1, H - 1),
]
const bg = cs.map((_, ci) =>
  Math.round(cs.map((c) => c[ci]).sort((a, b) => a - b)[1]),
)

// content bbox: pixels that are actually visible (alpha above noise)
let minX = W,
  minY = H,
  maxX = -1,
  maxY = -1
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4
    const a = rgba[o + 3]
    if (a <= 32) continue
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
}
console.log(
  `bg = #${bg[0].toString(16).padStart(2, '0')}${bg[1].toString(16).padStart(2, '0')}${bg[2].toString(16).padStart(2, '0')} a=${bg[3]}`,
)
console.log(
  `content bbox: x ${minX}..${maxX}  y ${minY}..${maxY}  (${maxX - minX + 1}x${maxY - minY + 1})`,
)

// ASCII previews at favicon-ish sizes
function ascii(w, h) {
  const sc = resizeBilinear(rgba, W, H, w, h)
  const char = (o) => {
    const r = sc[o],
      g = sc[o + 1],
      b = sc[o + 2],
      a = sc[o + 3]
    if (a < 128) return ' '
    if (b > 140 && b > r + 60) return 'B' // blue
    if (r > 230 && g > 200 && b < 180) return 'Y' // yellow
    if (r + g + b > 700) return '.' // near-white bg
    if (r + g + b < 240) return '#' // black
    return 'o'
  }
  let s = ''
  for (let y = 0; y < h; y++) {
    let row = ''
    for (let x = 0; x < w; x++) row += char((y * w + x) * 4)
    s += row + '\n'
  }
  return s
}
if (process.argv.includes('--inspect')) {
  const cropW0 = maxX - minX + 1
  const cropH0 = maxY - minY + 1
  const crop0 = Buffer.alloc(cropW0 * cropH0 * 4)
  for (let y = 0; y < cropH0; y++)
    rgba.copy(
      crop0,
      y * cropW0 * 4,
      ((minY + y) * W + minX) * 4,
      ((minY + y) * W + minX) * 4 + cropW0 * 4,
    )
  console.log(
    `content bbox: x ${minX}..${maxX}  y ${minY}..${maxY}  (${cropW0}x${cropH0})`,
  )
  console.log('\n--- logo ASCII @ 60x38 ---\n' + ascii(60, 38))
  const sc = resizeBilinear(crop0, cropW0, cropH0, 16, 16)
  const char = (o) => {
    const r = sc[o],
      g = sc[o + 1],
      b = sc[o + 2],
      a = sc[o + 3]
    if (a < 128) return ' '
    if (b > 140 && b > r + 60) return 'B'
    if (r > 230 && g > 200 && b < 180) return 'Y'
    if (r + g + b > 700) return '.'
    if (r + g + b < 240) return '#'
    return 'o'
  }
  let s = ''
  for (let y = 0; y < 16; y++) {
    let row = ''
    for (let x = 0; x < 16; x++) row += char((y * 16 + x) * 4)
    s += row + '\n'
  }
  console.log('\n--- favicon preview (cropped content @ 16x16) ---\n' + s)
  process.exit(0)
}

// ---------- build ----------
const cropW = maxX - minX + 1
const cropH = maxY - minY + 1
const crop = Buffer.alloc(cropW * cropH * 4)
for (let y = 0; y < cropH; y++)
  rgba.copy(
    crop,
    y * cropW * 4,
    ((minY + y) * W + minX) * 4,
    ((minY + y) * W + minX) * 4 + cropW * 4,
  )

const padOpaque = bg[3] >= 250
const pad = padOpaque ? [bg[0], bg[1], bg[2], 255] : [0, 0, 0, 0]

function squareWithLogo(size, marginFrac = 0.05) {
  const margin = Math.max(1, Math.round(size * marginFrac))
  const avail = size - margin * 2
  const scale = Math.min(avail / cropW, avail / cropH)
  const dw = Math.max(1, Math.round(cropW * scale))
  const dh = Math.max(1, Math.round(cropH * scale))
  const sc = resizeBilinear(crop, cropW, cropH, dw, dh)
  const canvas = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = pad[0]
    canvas[i * 4 + 1] = pad[1]
    canvas[i * 4 + 2] = pad[2]
    canvas[i * 4 + 3] = pad[3]
  }
  const ox = Math.round((size - dw) / 2)
  const oy = Math.round((size - dh) / 2)
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const s = (y * dw + x) * 4
      const d = ((oy + y) * size + ox + x) * 4
      const sa = sc[s + 3]
      if (sa === 0) continue
      if (sa === 255) {
        canvas[d] = sc[s]
        canvas[d + 1] = sc[s + 1]
        canvas[d + 2] = sc[s + 2]
        canvas[d + 3] = 255
      } else {
        const f = sa / 255
        canvas[d] = Math.round(sc[s] * f + canvas[d] * (1 - f))
        canvas[d + 1] = Math.round(sc[s + 1] * f + canvas[d + 1] * (1 - f))
        canvas[d + 2] = Math.round(sc[s + 2] * f + canvas[d + 2] * (1 - f))
        canvas[d + 3] = 255
      }
    }
  }
  return canvas
}

console.log(
  `\nBuilding favicon from logo crop ${cropW}x${cropH}, pad=#${pad[0].toString(16).padStart(2, '0')}${pad[1].toString(16).padStart(2, '0')}${pad[2].toString(16).padStart(2, '0')} (a=${pad[3]})`,
)
const icoSizes = [16, 32, 48, 256]
const entries = icoSizes.map((s) => ({
  w: s,
  h: s,
  data: encodePNG(s, s, squareWithLogo(s)),
}))
writeICO('public/favicon.ico', entries)
console.log(
  'wrote public/favicon.ico:',
  entries.map((e) => `${e.w}x${e.h}`).join(', '),
)

for (const size of [192, 512]) {
  fs.writeFileSync(
    `public/icon-${size}x${size}.png`,
    encodePNG(size, size, squareWithLogo(size)),
  )
  console.log(`wrote public/icon-${size}x${size}.png`)
}

// verify
for (const [p, data] of [
  ['public/favicon.ico (16px)', entries[0].data],
  ['public/icon-192x192.png', fs.readFileSync('public/icon-192x192.png')],
  ['public/icon-512x512.png', fs.readFileSync('public/icon-512x512.png')],
]) {
  const d = decodePNG(data)
  console.log(
    `  ${p}: ${d.width}x${d.height} colors: ${topColors(d.rgba, d.width, d.height, 3).join(', ')}`,
  )
}
