import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await files(path));
    else if (['.js', '.html', '.css', '.map'].includes(extname(entry.name))) output.push(path);
  }
  return output;
}

const findings = [];
for (const path of await files(fileURLToPath(new URL('../dist', import.meta.url)))) {
  const source = await readFile(path, 'utf8');
  if (/sb_secret_[A-Za-z0-9_-]{20,}/.test(source)) findings.push(`${path}: chave sb_secret detectada`);
  for (const match of source.matchAll(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url').toString());
      if (payload.role === 'service_role') findings.push(`${path}: JWT service_role detectado`);
    } catch { /* não é um JWT decodificável */ }
  }
}
if (findings.length) { console.error(findings.join('\n')); process.exitCode = 1; }
else console.log('OK: o build não contém chave secreta nem JWT service_role.');
