(function () {
  function createPalette() {
    const levels = [0, 51, 102, 153, 204, 255];
    const palette = [];
    for (let r = 0; r < 6; r += 1) {
      for (let g = 0; g < 6; g += 1) {
        for (let b = 0; b < 6; b += 1) {
          palette.push(levels[r], levels[g], levels[b]);
        }
      }
    }
    while (palette.length < 256 * 3) {
      palette.push(0, 0, 0);
    }
    return palette;
  }

  const palette = createPalette();

  function quantizeIndex(r, g, b) {
    const r6 = Math.round(r / 51);
    const g6 = Math.round(g / 51);
    const b6 = Math.round(b / 51);
    return r6 * 36 + g6 * 6 + b6;
  }

  function writeByte(arr, value) {
    arr.push(value & 0xff);
  }

  function writeShort(arr, value) {
    writeByte(arr, value);
    writeByte(arr, value >> 8);
  }

  function writeString(arr, str) {
    for (let i = 0; i < str.length; i += 1) {
      writeByte(arr, str.charCodeAt(i));
    }
  }

  function lzwEncode(minCodeSize, indices) {
    const clearCode = 1 << minCodeSize;
    const endCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let nextCode = endCode + 1;

    let dict = new Map();
    for (let i = 0; i < clearCode; i += 1) {
      dict.set(i.toString(), i);
    }

    const output = [];
    let cur = indices[0].toString();

    const writeCode = (() => {
      let curByte = 0;
      let curBits = 0;
      const bytes = [];

      const flushBits = (code) => {
        curByte |= code << curBits;
        curBits += codeSize;
        while (curBits >= 8) {
          bytes.push(curByte & 0xff);
          curByte >>= 8;
          curBits -= 8;
        }
      };

      const finish = () => {
        if (curBits > 0) {
          bytes.push(curByte & 0xff);
          curByte = 0;
          curBits = 0;
        }
      };

      return { flushBits, finish, bytes };
    })();

    writeCode.flushBits(clearCode);

    for (let i = 1; i < indices.length; i += 1) {
      const k = indices[i];
      const next = `${cur},${k}`;
      if (dict.has(next)) {
        cur = next;
      } else {
        writeCode.flushBits(dict.get(cur));
        if (nextCode < 4096) {
          dict.set(next, nextCode);
          nextCode += 1;
          if (nextCode === (1 << codeSize) && codeSize < 12) {
            codeSize += 1;
          }
        } else {
          writeCode.flushBits(clearCode);
          dict = new Map();
          for (let j = 0; j < clearCode; j += 1) {
            dict.set(j.toString(), j);
          }
          codeSize = minCodeSize + 1;
          nextCode = endCode + 1;
        }
        cur = k.toString();
      }
    }

    writeCode.flushBits(dict.get(cur));
    writeCode.flushBits(endCode);
    writeCode.finish();

    return writeCode.bytes;
  }

  function encodeGif(frames, width, height, delayCs) {
    const data = [];
    writeString(data, "GIF89a");
    writeShort(data, width);
    writeShort(data, height);

    const gctFlag = 1 << 7;
    const colorRes = 7 << 4;
    const sortFlag = 0;
    const gctSize = 7; // 2^(7+1) = 256 colors
    writeByte(data, gctFlag | colorRes | sortFlag | gctSize);
    writeByte(data, 0);
    writeByte(data, 0);

    for (let i = 0; i < 256 * 3; i += 1) {
      writeByte(data, palette[i]);
    }

    for (let f = 0; f < frames.length; f += 1) {
      writeByte(data, 0x21);
      writeByte(data, 0xf9);
      writeByte(data, 4);
      writeByte(data, 0x04);
      writeShort(data, delayCs);
      writeByte(data, 0);
      writeByte(data, 0);

      writeByte(data, 0x2c);
      writeShort(data, 0);
      writeShort(data, 0);
      writeShort(data, width);
      writeShort(data, height);
      writeByte(data, 0);

      const minCodeSize = 8;
      writeByte(data, minCodeSize);
      const lzwData = lzwEncode(minCodeSize, frames[f]);
      let offset = 0;
      while (offset < lzwData.length) {
        const blockSize = Math.min(255, lzwData.length - offset);
        writeByte(data, blockSize);
        for (let i = 0; i < blockSize; i += 1) {
          writeByte(data, lzwData[offset + i]);
        }
        offset += blockSize;
      }
      writeByte(data, 0);
    }

    writeByte(data, 0x3b);
    return new Blob([new Uint8Array(data)], { type: "image/gif" });
  }

  function imageDataToIndexed(imageData, width, height) {
    const out = new Uint8Array(width * height);
    const data = imageData.data;
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      out[p] = quantizeIndex(r, g, b);
    }
    return out;
  }

  window.drawdleGif = {
    encodeGif,
    imageDataToIndexed,
  };
})();
