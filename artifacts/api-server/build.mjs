import * as esbuild from 'esbuild';
import pinoPlugin from 'esbuild-plugin-pino';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: './dist/index.mjs',
  format: 'esm',
  external: ['pg', 'decimal.js'],
  sourcemap: true,
  plugins: [pinoPlugin()],
  logLevel: 'info',
});
