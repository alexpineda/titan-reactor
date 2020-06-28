// Decoding/rendering of bw's sprites.
// Current implementation decodes the sprite every time
// before it is rendered, to simplify player color handling
// and tileset-specific palette colors.
//
// Grp buffers are currently not validated, passing invalid
// sprite data may result in exceptions during render() calls.

export class Grp {
  constructor(buf) {
    this._buf = buf
  }

  // Decodes into a 32-bit rgba surface.
  decode(frame, palette) {
    const frameCount = this._buf.readUInt16LE(0)
    if (frame >= frameCount) {
      return null
    }

    const header = this._buf.slice(6 + frame * 8, 6 + (frame + 1) * 8)
    const frameOffset = header.readUInt32LE(4) & ~0x80000000
    const x = header.readUInt8(0)
    const y = header.readUInt8(1)
    let frameWidth = header.readUInt8(2)
    // Not actually sure about this, but my notes say so?
    if (header.readUInt32LE(4) & 0x80000000) {
      frameWidth = frameWidth + 0x100
    }
    const frameHeight = header.readUInt8(3)

    const lineOffsets = this._buf.slice(frameOffset)
    const out = new Buffer(frameWidth * frameHeight * 4)
    let outPos = 0
    for (let y = 0; y < frameHeight; y++) {
      const lineData = this._buf.slice(frameOffset + lineOffsets.readUInt16LE(y * 2))
      const lineEnd = outPos + 4 * frameWidth
      let pos = 0
      while (outPos < lineEnd) {
        const val = lineData[pos]
        if (val & 0x80) {
          // Transparent
          const amount = val & ~0x80
          out.fill(0x00, outPos, outPos + amount * 4)
          outPos = outPos + amount * 4
          pos = pos + 1
        } else if (val & 0x40) {
          // Repeat single color
          const amount = val & ~0x40
          const color = lineData[pos + 1]
          for (let i = 0; i < amount; i++) {
            out[outPos + 0] = palette[color * 4 + 0]
            out[outPos + 1] = palette[color * 4 + 1]
            out[outPos + 2] = palette[color * 4 + 2]
            out[outPos + 3] = 0xff
            outPos = outPos + 4
          }
          pos = pos + 2
        } else {
          // Just copy colors
          const amount = val
          for (let i = 0; i < amount; i++) {
            const color = lineData[pos + 1 + i]
            out[outPos + 0] = palette[color * 4 + 0]
            out[outPos + 1] = palette[color * 4 + 1]
            out[outPos + 2] = palette[color * 4 + 2]
            out[outPos + 3] = 0xff
            outPos = outPos + 4
          }
          pos = pos + 1 + amount
        }
      }
    }
    return { data: out, x, y, w: frameWidth, h: frameHeight }
  }

  render(frame, palette, surface, surfX, surfY, surfW, surfH, scaleX, scaleY) {
    const floor = Math.floor

    if (!this._buf) {
      return
    }
    const img = this.decode(frame, palette)
    if (!img) {
      return
    }
    let w = floor(img.w * scaleX)
    let h = floor(img.h * scaleY)
    let x = floor(surfX + (img.x - (this._buf.readUInt16LE(2) / 2)) * scaleX)
    let y = floor(surfY + (img.y - (this._buf.readUInt16LE(4) / 2)) * scaleY)
    if (x < 0) {
      w = w + x
      x = 0
    }
    if (y < 0) {
      h = h + y
      y = 0
    }
    if (x + w > surfW) {
      w = surfW - x
    }
    if (y + h > surfH) {
      h = surfH - y
    }

    const value = (x, y, offset) => {
      const x1 = floor((x / w) * img.w)
      const x2 = floor(((x + 0.5) / w) * img.w)
      const y1 = floor((y / h) * img.h)
      const y2 = floor(((y + 0.5) / h) * img.h)
      const a = img.data[(y1 * img.w + x1) * 4 + offset]
      const b = img.data[(y2 * img.w + x1) * 4 + offset]
      const c = img.data[(y1 * img.w + x2) * 4 + offset]
      const d = img.data[(y2 * img.w + x2) * 4 + offset]
      return (a + b + c + d) / 4
    }

    let pos = (y * surfW + x) * 3
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const red = value(j, i, 0)
        const green = value(j, i, 1)
        const blue = value(j, i, 2)
        const alpha = value(j, i, 3) / 255
        surface[pos + 0] = (red * alpha) + (surface[pos + 0] * (1.0 - alpha))
        surface[pos + 1] = (green * alpha) + (surface[pos + 1] * (1.0 - alpha))
        surface[pos + 2] = (blue * alpha) + (surface[pos + 2] * (1.0 - alpha))
        pos = pos + 3
      }
      pos = pos + (surfW - w) * 3
    }
  }
}

// Mostly just a id -> key -> Grp mapping which shares
// buffers when several ids have the same key.
// Supports setting/getting by unit or sprite id.
export default class GrpGroup {
  constructor(units, sprites) {
    this._grps = new Map()
    this._units = units
    this._sprites = sprites
  }

  // Always returns a Grp, but if unitId was not
  // added, the Grp is empty.
  async unit(unitId, readCb) {
    return this._getGrp(this._units[unitId], readCb)
  }

  async sprite(spriteId, readCb) {
    return this._getGrp(this._sprites[spriteId], readCb)
  }

  async _getGrp(key, readCb) {
    if (key === undefined) {
      throw Error('Invalid grp')
    }

    const value = this._grps.get(key)
    if (value !== undefined) {
      return value
    } else {
      const grp = new Grp(await readCb('unit/' + key))
      this._grps.set(key, grp)
      return grp
    }
  }
}

