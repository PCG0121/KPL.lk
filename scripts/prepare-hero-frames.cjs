const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const source = process.argv[2];
  if (!source) throw new Error('Pass the source frame directory as the first argument.');
  const files = (await fs.readdir(source)).filter(name => /\.(png|jpe?g)$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length < 2) throw new Error('At least two frames are required.');
  const output = path.join(process.cwd(), 'public', 'hero-sequence-v4');
  const first = await sharp(path.join(source, files[0])).metadata();
  await fs.mkdir(output, { recursive: true });
  let sourceBytes = 0;
  let desktopBytes = 0;
  let mobileBytes = 0;
  for (const [index, file] of files.entries()) {
    const input = path.join(source, file);
    const metadata = await sharp(input).metadata();
    if (metadata.width !== first.width || metadata.height !== first.height) throw new Error(`Inconsistent dimensions for ${file}.`);
    sourceBytes += (await fs.stat(input)).size;
    const name = String(index + 1).padStart(2, '0');
    const desktop = await sharp(input).webp({ quality: 94, effort: 6, smartSubsample: true }).toFile(path.join(output, `${name}.webp`));
    const mobile = await sharp(input).webp({ quality: 90, effort: 6, smartSubsample: true }).toFile(path.join(output, `${name}-mobile.webp`));
    desktopBytes += desktop.size;
    mobileBytes += mobile.size;
  }
  const report = { frames: files.length, sourceBytes, desktopBytes, mobileBytes, desktopDimensions: [first.width, first.height], mobileDimensions: [first.width, first.height], desktopQuality: 94, mobileQuality: 90, assetVersion: 4 };
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
