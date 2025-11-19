const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'phase_two_data.json');
const raw = fs.readFileSync(dataPath, 'utf8');
let json;
try {
  json = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(1);
}

const consortia = json?.gmesAndAfricaPhase2?.consortia ?? [];

function extractLocations(entry) {
  const cons = entry.consortium ?? entry;
  const explicit = [];
  if (cons.locations && typeof cons.locations === 'object' && !Array.isArray(cons.locations)) {
    Object.values(cons.locations).forEach(v => {
      if (Array.isArray(v)) v.forEach(x => { if (x) explicit.push(String(x).trim()); });
    });
  } else if (Array.isArray(cons.locations)) {
    cons.locations.forEach(x => { if (x) explicit.push(String(x).trim()); });
  }
  const regionalCountries = [];
  try {
    if (cons.regional_coverage && typeof cons.regional_coverage === 'object') {
      Object.values(cons.regional_coverage).forEach(regionBlock => {
        if (!regionBlock) return;
        const countries = regionBlock.countries ?? regionBlock.countries_list ?? [];
        countries.forEach(countryEntry => {
          const countryName = countryEntry?.name ?? countryEntry?.country ?? undefined;
          if (countryName) regionalCountries.push(String(countryName).trim());
        });
      });
    }
  } catch (e) {}

  const merged = explicit.concat(regionalCountries).filter(Boolean).map(s=>String(s).trim());
  // dedupe case-insensitive
  const seen = new Set();
  const dedup = [];
  merged.forEach(m => {
    const key = m.toLowerCase();
    if (!seen.has(key)) { seen.add(key); dedup.push(m); }
  });
  return dedup;
}

consortia.forEach((entry, i) => {
  const title = entry.project_title ?? entry.name ?? `Consortium ${i+1}`;
  const locs = extractLocations(entry);
  console.log(`\n=== ${title} ===`);
  if (locs.length === 0) console.log('Locations: (none)'); else console.log('Locations:', locs.join(', '));
});

