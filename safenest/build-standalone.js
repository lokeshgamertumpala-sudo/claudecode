const esbuild = require('esbuild');

try {
  esbuild.buildSync({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    outfile: 'dist/standalone-bundle.js',
    format: 'iife',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') }
  });
  console.log('Successfully bundled standalone-bundle.js (IIFE format)');
} catch (err) {
  console.error('Esbuild failed:', err);
  process.exit(1);
}
