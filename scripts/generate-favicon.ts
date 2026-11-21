import fs from 'node:fs';

const width = 16;
const height = 16;
const bmpHeaderSize = 40;
const pixelDataSize = width * height * 4;
const maskSize = Math.ceil(width / 32) * 4 * height;
const imageSize = bmpHeaderSize + pixelDataSize + maskSize;

const buf = Buffer.alloc(22 + imageSize);
// ICO Header
buf.writeUInt16LE(0, 0); // reserved
buf.writeUInt16LE(1, 2); // type 1=icon
buf.writeUInt16LE(1, 4); // count=1

// Directory Entry
buf.writeUInt8(width, 6);
buf.writeUInt8(height, 7);
buf.writeUInt8(0, 8); // color count
buf.writeUInt8(0, 9); // reserved
buf.writeUInt16LE(1, 10); // color planes
buf.writeUInt16LE(32, 12); // bpp
buf.writeUInt32LE(imageSize, 14); // image size
buf.writeUInt32LE(22, 18); // offset

// BMP Header
const bmpOffset = 22;
buf.writeUInt32LE(40, bmpOffset);
buf.writeInt32LE(width, bmpOffset + 4);
buf.writeInt32LE(height * 2, bmpOffset + 8);
buf.writeUInt16LE(1, bmpOffset + 12);
buf.writeUInt16LE(32, bmpOffset + 14);
buf.writeUInt32LE(0, bmpOffset + 16);
buf.writeUInt32LE(pixelDataSize + maskSize, bmpOffset + 20);
buf.writeInt32LE(0, bmpOffset + 24);
buf.writeInt32LE(0, bmpOffset + 28);
buf.writeUInt32LE(0, bmpOffset + 32);
buf.writeUInt32LE(0, bmpOffset + 36);

// Fill pixels with blue (#0284c7)
const pixelsOffset = bmpOffset + 40;
for (let i = 0; i < width * height; i++) {
  const p = pixelsOffset + i * 4;
  buf.writeUInt8(0xc7, p);     // B
  buf.writeUInt8(0x84, p + 1); // G
  buf.writeUInt8(0x02, p + 2); // R
  buf.writeUInt8(0xff, p + 3); // A
}

fs.writeFileSync('public/favicon.ico', buf);
console.log('Created public/favicon.ico successfully');
