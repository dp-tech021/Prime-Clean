import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist-public');
const entries = ['index.html', 'styles.css', 'app.js', 'public-content.mjs', 'public-content-config.json', '_headers', 'data', 'media'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
console.log(`OK: site público preparado em dist-public com ${entries.length} entradas permitidas.`);
