import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import ffmpegPath from 'ffmpeg-static';

const inputPath = path.resolve(process.cwd(), 'docs/video/breathewise_walkthrough.webm');
const outputPath = path.resolve(process.cwd(), 'docs/video/breathewise_walkthrough.mp4');

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

console.log(`Starting conversion:`);
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`Using FFmpeg at: ${ffmpegPath}`);

try {
  execSync(
    `"${ffmpegPath}" -y -i "${inputPath}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -movflags +faststart "${outputPath}"`,
    { stdio: 'inherit' }
  );

  const stats = fs.statSync(outputPath);
  console.log(`\n========================================`);
  console.log(`Successfully Converted to MP4!`);
  console.log(`File: ${outputPath}`);
  console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`========================================\n`);
} catch (err) {
  console.error('Error during ffmpeg conversion:', err);
  process.exit(1);
}
