const fs = require('fs');
const path = require('path');

function normalize(s) {
  if (!s && s !== 0) return '';
  return String(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

const repoRoot = path.resolve(__dirname, '..');
const isoMapPath = path.join(repoRoot, 'src', 'data', 'country_iso_map.json');
const phaseOnePath = path.join(repoRoot, 'src', 'data', 'phase_one_data.json');
const phaseTwoPath = path.join(repoRoot, 'src', 'data', 'phase_two_data.json');

const isoMap = loadJson(isoMapPath);
// build normalized key map
const normIsoMap = {};
for (const k of Object.keys(isoMap)) {
  normIsoMap[normalize(k)] = isoMap[k];
}

function addIsoToFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // preserve potential leading comments by trying to find the first '{' for JSON start
  const idx = raw.indexOf('{');
  const jsonText = raw.slice(idx);
  const data = JSON.parse(jsonText);

  // find consortia arrays (support both structures)
  function processConsortia(obj) {
    if (!obj) return;
    if (!Array.isArray(obj)) return;
    for (const c of obj) {
      if (Array.isArray(c.members)) {
        for (const m of c.members) {
          if (m && typeof m === 'object') {
            const countryRaw = m.country ?? m.countryName ?? m.Country ?? '';
            const key = normalize(countryRaw);
            if (key && normIsoMap[key]) {
              m.iso_a2 = normIsoMap[key].iso_a2;
              m.iso_a3 = normIsoMap[key].iso_a3;
            } else {
              // try some heuristics: strip parentheticals like 'Kenya (Lead)'
              const cleaned = normalize(countryRaw.replace(/\([^)]*\)/g, ''));
              if (cleaned && normIsoMap[cleaned]) {
                m.iso_a2 = normIsoMap[cleaned].iso_a2;
                m.iso_a3 = normIsoMap[cleaned].iso_a3;
              }
            }
          }
        }
      }
    }
  }

  // traverse to find arrays named consortia
  function walk(o) {
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      if (k.toLowerCase().includes('consort')) {
        processConsortia(o[k]);
      }
      if (typeof o[k] === 'object') walk(o[k]);
    }
  }

  walk(data);

  // write back with same leading comment if any
  let out = JSON.stringify(data, null, 2) + '\n';
  if (idx > 0) {
    out = raw.slice(0, idx) + out;
  }
  fs.writeFileSync(filePath, out, 'utf8');
  console.log('Updated', filePath);
}

addIsoToFile(phaseOnePath);
addIsoToFile(phaseTwoPath);
console.log('Done');

