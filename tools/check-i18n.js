// Comprueba que todas las claves data-i18n del HTML/JS existen en cada idioma.
// Uso: node tools/check-i18n.js        (lista claves que faltan o sobran)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const pages = ['index.html', 'atleta/index.html', 'academy/index.html', 'surf-trip/index.html', 'assets/js/site.js'];
const es = {};
for (const p of pages) {
  const src = fs.readFileSync(path.join(root, p), 'utf8');
  for (const m of src.matchAll(/data-i18n(?:-content|-placeholder)?="([a-z0-9.]+)"/g)) es[m[1]] = 1;
  for (const m of src.matchAll(/data-wa(?:="|', ')([a-z0-9]+)/g)) es['wa.' + m[1]] = 1;
  for (const m of src.matchAll(/\bt\('([a-z0-9.]*[a-z0-9])'/g)) es[m[1]] = 1;
  for (const m of src.matchAll(/key: '([a-z0-9.]+)'/g)) es[m[1]] = 1;
}
let bad = 0;
for (const f of fs.readdirSync(path.join(root, 'assets/i18n'))) {
  const d = JSON.parse(fs.readFileSync(path.join(root, 'assets/i18n', f), 'utf8'));
  const missing = Object.keys(es).filter((k) => !(k in d));
  const extra = Object.keys(d).filter((k) => !(k in es));
  console.log(f, '-', Object.keys(d).length, 'claves', missing.length ? '\n  FALTAN: ' + missing.join(', ') : '', extra.length ? '\n  SOBRAN: ' + extra.join(', ') : '');
  bad += missing.length;
}
console.log(Object.keys(es).length, 'claves en el HTML.', bad ? 'Hay claves sin traducir.' : 'Todo traducido.');
process.exit(bad ? 1 : 0);
