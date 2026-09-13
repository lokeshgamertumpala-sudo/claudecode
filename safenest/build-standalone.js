const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

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

  // Fix dist/index.html script path so it can be opened directly or statically
  const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distHtmlPath)) {
    let content = fs.readFileSync(distHtmlPath, 'utf8');
    content = content.replace('./dist/standalone-bundle.js', './standalone-bundle.js');
    fs.writeFileSync(distHtmlPath, content, 'utf8');
    console.log('Patched dist/index.html script path to ./standalone-bundle.js');
  }
} catch (err) {
  console.error('Esbuild failed:', err);
  process.exit(1);
}
