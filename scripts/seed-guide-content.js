// Fill the seeded repair guides with real content and publish them.
// Re-runnable: upserts content by slug.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GUIDES = [
  {
    slug: "why-small-engine-wont-start",
    title: "Why Your Small Engine Won't Start (168F / GX160)",
    excerpt: "The 4 things to check — fuel, spark, air and the kill switch — and the exact repair kits that fix each one.",
    seoTitle: "Small Engine Won't Start? 168F / GX160 No-Start Fixes",
    seoDescription: "Step-by-step diagnosis for a small gasoline engine that won't start: fuel, spark, air filter and stop switch, plus the repair kits that fix it.",
    content: `A 168F or GX160-style engine that cranks but won't start almost always comes down to one of four things: fuel, spark, air, or the kill switch. Work through them in order — most no-starts are solved in under an hour.

1. FUEL
Make sure there is fresh fuel in the tank and the fuel valve is open. Stale fuel that has sat for a few months is the single most common cause. Drain old fuel, refill with fresh, and check that fuel actually reaches the carburetor by loosening the carburetor drain screw.
Fix: clean or rebuild the carburetor with a carburetor repair kit.

2. SPARK
Remove the spark plug, reconnect the cap, ground the plug body against the engine and pull the starter. You should see a strong blue spark. A weak yellow spark or no spark means a fouled plug, a bad ignition coil, or a shorted stop switch.
Fix: replace the spark plug first (cheap and fast). If there is still no spark, check the stop-switch wiring before replacing the ignition coil.

3. AIR
A clogged air filter starves the engine. Pull the filter element and hold it up to the light — if it is dark and oily, the engine cannot breathe.
Fix: clean or replace the air filter. Include one in your annual maintenance kit.

4. KILL / STOP SWITCH
A stop switch stuck in the OFF position, or a frayed wire shorting to the frame, will kill the spark even when everything else is good. Disconnect the stop-switch wire and try to start — if it fires, the switch or wiring is the culprit.

STILL WON'T START?
If you have confirmed fresh fuel, good spark and clean air and it still won't fire, the carburetor jets are likely varnished and need a full rebuild. Send us a photo of your engine on WhatsApp and we'll match the exact repair kit for your model.`
  },
  {
    slug: "generator-maintenance-checklist",
    title: "Portable Generator Maintenance Checklist (2–5 kW)",
    excerpt: "Seasonal service steps that keep a 168F / 188F-powered generator reliable, plus the spare parts to stock.",
    seoTitle: "Portable Generator Maintenance Checklist — 2kW to 5kW",
    seoDescription: "Seasonal maintenance checklist for portable gasoline generators: oil, air filter, spark plug, carburetor and electrical checks, with the spare parts to stock.",
    content: `A portable generator that is serviced on schedule lasts for years and starts on the first pull. Use this checklist every season, or every 100 running hours, whichever comes first.

EVERY USE
- Check the engine oil level on a flat surface.
- Look for fuel leaks around the carburetor and tank.
- Make sure the air vents are clear of dust and debris.

EVERY 100 HOURS / SEASONALLY
1. Change the engine oil while the engine is warm. Old oil is the number-one cause of premature engine wear.
2. Clean or replace the air filter. A dirty filter makes the engine run rich and lose power.
3. Replace the spark plug and set the gap to spec.
4. Clean the carburetor bowl and check for varnish from stale fuel.
5. Inspect the carbon brushes if the generator output is weak or unstable.

BEFORE LONG STORAGE
- Drain the fuel or run the engine dry to prevent the carburetor from gumming up.
- Add a small amount of oil through the spark-plug hole and pull the starter slowly to coat the cylinder.

SPARE PARTS TO STOCK
Air filter, spark plug, carburetor repair kit, recoil starter, and an AVR for your model. Keeping these on hand means a customer's generator is back in service the same day.

Need a maintenance kit matched to your generator? Send us the model on WhatsApp and we'll put together the right parts.`
  },
  {
    slug: "replace-recoil-starter",
    title: "How to Replace a Recoil (Pull) Starter",
    excerpt: "A 15-minute job: rope, spring or full recoil assembly replacement for 168F / GX160-style engines.",
    seoTitle: "How to Replace a Recoil Pull Starter on a Small Engine",
    seoDescription: "Step-by-step guide to replacing a broken recoil pull starter, rope or spring on a 168F / GX160-style small engine in about 15 minutes.",
    content: `A broken pull starter is one of the fastest small-engine repairs. Whether the rope snapped, the spring won't rewind, or the pawls won't engage, you can be back running in about 15 minutes.

TOOLS
Socket wrench set, screwdriver and work gloves (the recoil spring is under tension).

DECIDE: REPAIR OR REPLACE
- Just the rope is broken → replace the rope.
- Spring won't rewind the rope, or pawls don't grab → replace the whole recoil assembly. It is faster and more reliable than rebuilding.

STEPS
1. Remove the three or four bolts holding the recoil housing to the engine.
2. Lift off the old recoil unit.
3. IMPORTANT: match the new unit to the old one — bolt-hole pattern, diameter and pawl style must be the same. This is the number-one reason a replacement "doesn't fit," so compare them side by side before ordering.
4. Fit the new recoil assembly and start the bolts by hand.
5. Tighten evenly in a cross pattern.
6. Test by pulling slowly first, then with a normal pull.

SAFETY
Always wear gloves — a recoil spring that lets go can cut your hand. Never disassemble a wound spring unless you know how to control it.

Not sure which recoil fits your engine? Send a photo of the old unit and the engine model on WhatsApp and we'll confirm the correct part.`
  },
  {
    slug: "fix-leaking-water-pump",
    title: "Fixing a Leaking Gasoline Water Pump (2\" / 3\")",
    excerpt: "Where the leak comes from, what to replace, and why you should never delay a mechanical-seal leak.",
    seoTitle: "Fix a Leaking Gasoline Water Pump — 2 inch / 3 inch Seal Kit",
    seoDescription: "Diagnose and fix a leaking 2-inch or 3-inch gasoline water pump: mechanical seal, casing gasket and O-rings, with the seal kit that repairs it.",
    content: `A leaking gasoline water pump is usually a simple seal or gasket job — but where the water comes from tells you which part to replace. Find the leak point first.

LEAK BETWEEN THE PUMP BODY AND THE ENGINE
This is a failed mechanical seal behind the impeller. Do not delay this repair — a failed seal lets water travel down the shaft and into the engine, which can destroy the engine.
Fix: replace the mechanical seal with a pump seal kit.

LEAK AROUND THE PUMP COVER / CASING
This is a worn casing gasket or O-ring.
Fix: replace the casing gasket and O-rings as a set, and torque the cover bolts evenly so the new gasket seats flat.

LEAK AT THE HOSE CONNECTORS
This is a loose coupling or a damaged connector gasket.
Fix: replace the connector gaskets and re-tighten the camlock or threaded couplings.

REPLACE AS A SET
Always replace the seal, gasket and O-rings together. Reusing an old O-ring next to a new seal is the most common reason a pump leaks again a week later.

STEPS
1. Drain the pump and remove the pump cover bolts.
2. Lift off the cover and impeller.
3. Pull the old mechanical seal and clean the seat.
4. Press in the new seal, fit new gaskets and O-rings, and reassemble.
5. Prime the pump with water before the first start.

Tell us your pump size (2 inch or 3 inch) and body series on WhatsApp and we'll send the matching seal kit.`
  }
];

async function main() {
  let updated = 0;
  for (const g of GUIDES) {
    await prisma.repairGuide.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        excerpt: g.excerpt,
        content: g.content,
        seoTitle: g.seoTitle,
        seoDescription: g.seoDescription,
        status: "PUBLISHED"
      },
      create: {
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        content: g.content,
        seoTitle: g.seoTitle,
        seoDescription: g.seoDescription,
        status: "PUBLISHED"
      }
    });
    updated += 1;
  }
  const published = await prisma.repairGuide.count({ where: { status: "PUBLISHED" } });
  console.log(`Upserted ${updated} guides. Published total: ${published}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
