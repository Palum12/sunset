import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const outputDirectory = process.argv[2] ?? 'dist';

process.env.BASE_PATH ??= './';
process.env.VITE_SOURCE_HTML_MODE = 'built';

await build({
  root: projectRoot,
  build: {
    emptyOutDir: true,
    outDir: outputDirectory,
  },
});

await writeFile(resolve(projectRoot, outputDirectory, '.nojekyll'), '');
