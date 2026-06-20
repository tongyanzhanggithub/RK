// One-off restyle: drop amber CTA accent → unify on brand blue (#2B6CF6).
// - Solid amber buttons (bg-safety + px-* + text-ink)  → bg-brand + text-white
// - Tint badges/alerts (bg-safety/NN)                  → bg-brand/NN (keep dark text)
// - hover:bg-amber-400                                 → hover:bg-[#1c54bf] (darker blue)
// - any *-safety color utility                         → *-brand
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const exts = new Set([".tsx", ".ts"]);
const skip = new Set(["node_modules", ".next", ".git", "scripts"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

let filesChanged = 0;
for (const f of walk(root)) {
  let src = fs.readFileSync(f, "utf8");
  if (!/safety|amber-400/.test(src)) continue;
  const lines = src.split("\n");
  let mod = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!/bg-safety|amber-400|-safety/.test(l)) continue;
    let nl = l;
    // amber button hover → darker blue
    nl = nl.replace(/hover:bg-amber-400/g, "hover:bg-[#1c54bf]");
    // is this line a SOLID amber surface (not a /NN tint)?
    const solid = /bg-safety(?=["'`\s])/.test(nl);
    const isSolidButton = solid && /\bpx-/.test(nl) && /\btext-ink\b/.test(nl);
    const isSolidAdjacent = /bg-safety\s+text-ink/.test(nl);
    if (isSolidButton || isSolidAdjacent) {
      nl = nl.replace(/\btext-ink\b/g, "text-white");
    }
    // repoint every *-safety color utility (bg/text/border/ring/from/to/...) → *-brand
    nl = nl.replace(/\b(bg|text|border|ring|from|via|to|fill|stroke|divide|outline|decoration|placeholder|caret|accent)-safety\b/g, "$1-brand");
    if (nl !== l) { lines[i] = nl; mod = true; }
  }
  if (mod) {
    fs.writeFileSync(f, lines.join("\n"));
    filesChanged++;
    console.log("updated", path.relative(root, f));
  }
}
console.log("files changed:", filesChanged);
