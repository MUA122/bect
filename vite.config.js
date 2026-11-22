import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';

// Vite copies public/ into the build output. The original is an authoring input
// kept beside the generated edition. Only the extracted edition is published.
export default defineConfig({
  plugins: [{
    name: 'exclude-company-profile-source',
    apply: 'build',
    async writeBundle({ dir }) {
      if (!dir || path.resolve(dir) === path.resolve('public')) return;
      const sourceCopy = path.join(dir, 'company-profile', 'BECT — Company Profile.pdf');
      await unlink(sourceCopy).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    },
  }],
});
