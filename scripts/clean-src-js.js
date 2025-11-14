import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rimrafJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      rimrafJs(full);
    } else if (e.isFile() && full.endsWith('.js')) {
      // skip node_modules
      if (!full.includes(path.sep + 'node_modules' + path.sep)) {
        try {
          fs.unlinkSync(full);
          console.log('deleted', full);
        } catch (err) {
          console.error('failed to delete', full, err.message);
        }
      }
    }
  }
}

const root = path.join(__dirname, '..', 'src');
if (fs.existsSync(root)) {
  rimrafJs(root);
} else {
  console.error('src directory not found');
}
