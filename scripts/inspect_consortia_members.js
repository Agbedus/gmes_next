const fs = require('fs');
const path = require('path');

function parsePartnerString(p) {
  if (!p) return { name: undefined, country: undefined };
  const m = String(p).trim();
  const parenMatch = m.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const country = parenMatch[1].trim();
    const name = m.slice(0, parenMatch.index).replace(/[,:;]$/,'').trim();
    return { name: name || m, country: country || undefined };
  }
  const commaParts = m.split(',');
  if (commaParts.length > 1) {
    const last = commaParts[commaParts.length - 1].trim();
    if (/^[A-Za-z '\-()]+$/.test(last)) {
      const name = commaParts.slice(0, -1).join(',').trim();
      return { name: name || m, country: last };
    }
  }
  return { name: m };
}

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

consortia.forEach((entry, idx) => {
  const cons = entry.consortium ?? entry;
  const title = entry.project_title ?? entry.name ?? cons.project_title ?? `Consortium ${idx+1}`;
  const regionalMembers = [];

  try {
    if (cons.regional_coverage && typeof cons.regional_coverage === 'object') {
      Object.values(cons.regional_coverage).forEach(regionBlock => {
        if (!regionBlock) return;
        const countries = regionBlock.countries ?? regionBlock.countries_list ?? [];
        countries.forEach(countryEntry => {
          const countryName = countryEntry?.name ?? countryEntry?.country ?? undefined;
          const partnersList = countryEntry?.partners ?? [];
          if (Array.isArray(partnersList)) {
            partnersList.forEach(p => {
              if (typeof p === 'string') {
                const parsed = parsePartnerString(p);
                regionalMembers.push({ name: parsed.name, country: countryName ?? parsed.country });
              } else if (p && typeof p === 'object') {
                const pname = p.name ?? p.partner ?? undefined;
                regionalMembers.push({ name: String(pname ?? '').trim() || undefined, country: countryName });
              }
            });
          }
        });
      });
    }
  } catch (e) {
    // ignore
  }

  const partnersFromStrings = Array.isArray(cons.partners) ? cons.partners.map(parsePartnerString).map(p=>({name:p.name, country:p.country})) : [];
  const primary = regionalMembers.length > 0 ? regionalMembers : partnersFromStrings;
  const secondary = primary === regionalMembers ? partnersFromStrings : regionalMembers;

  const merged = [];
  const seen = new Set();
  primary.concat(secondary).forEach(m => {
    const key = (m.name ?? '').toLowerCase().replace(/\s+/g,' ').trim();
    if (!key) return;
    if (!seen.has(key)) { seen.add(key); merged.push(m); }
    else {
      const idx = merged.findIndex(mm => (String(mm.name ?? '').toLowerCase().replace(/\s+/g,' ').trim()) === key);
      if (idx > -1 && !merged[idx].country && m.country) merged[idx].country = m.country;
    }
  });

  console.log('\n=== ' + title + ' ===');
  console.log('Members count:', merged.length);
  merged.forEach(m => console.log('-', (m.name||'').replace(/\n/g,' '), m.country ? `(${m.country})` : ''));
});

