const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { manifestNs } = require('./manifest');

const version = process.argv[2];
if (version === undefined) {
  console.error('\n❌ Usage: npm run set-plugin-version -- <VERSION>\n');
  process.exit(1);
}

const productionPath = path.resolve(__dirname, `../../dist/${manifestNs}.sdPlugin/manifest.json`);
const developmentPath = path.resolve(__dirname, `../../dist/dev.${manifestNs}.sdPlugin/manifest.json`);
const manifestPath = existsSync(productionPath) ? productionPath : developmentPath;

if (!existsSync(manifestPath)) {
  console.error('❌ Could not find manifest.json in the production or development output.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.Version = version;
writeFileSync(manifestPath, `${JSON.stringify(manifest, undefined, 2)}\n`);
console.info(`✅ Version ${version} set in ${path.relative(process.cwd(), manifestPath)}`);
