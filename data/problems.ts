export type Problem = {
  slug: string;
  title: string;
  description: string;
  commonCauses: string[];
  checkSteps: string[];
  recommendedProductSlugs: string[];
};

export const problems: Problem[] = [
  {
    slug: "engine-wont-start",
    title: "Engine Won't Start",
    description: "Small gasoline engines often fail to start because of fuel, ignition or air intake issues.",
    commonCauses: ["Dirty carburetor", "Old spark plug", "Blocked air filter", "Cracked fuel hose"],
    checkSteps: ["Check spark plug condition", "Confirm fuel reaches the carburetor", "Clean or replace air filter", "Inspect stop switch wiring"],
    recommendedProductSlugs: ["168f-standard-repair-kit", "carburetor-troubleshooting-kit", "168f-basic-maintenance-kit"]
  },
  {
    slug: "pull-starter-broken",
    title: "Pull Starter Broken",
    description: "The rope, spring or recoil housing can fail after frequent use or rough handling.",
    commonCauses: ["Broken pull rope", "Weak recoil spring", "Damaged starter pawl"],
    checkSteps: ["Inspect rope and handle", "Check recoil spring return", "Match mounting hole pattern before ordering"],
    recommendedProductSlugs: ["pull-start-replacement-kit", "168f-standard-repair-kit"]
  },
  {
    slug: "water-pump-not-suction",
    title: "Water Pump Not Suction",
    description: "Weak suction can be caused by air leaks, seal wear, clogged screens or incorrect priming.",
    commonCauses: ["Worn mechanical seal", "Clogged filter screen", "Loose inlet connector", "Pump not primed"],
    checkSteps: ["Prime the pump head", "Inspect inlet connector", "Check mechanical seal", "Clean filter screen"],
    recommendedProductSlugs: ["2-inch-water-pump-standard-repair-kit", "2-inch-water-pump-seal-kit"]
  },
  {
    slug: "water-pump-leaking",
    title: "Water Pump Leaking",
    description: "Leakage usually comes from pump gaskets, O-rings or the mechanical seal.",
    commonCauses: ["Worn pump gasket", "Damaged O-ring", "Mechanical seal failure"],
    checkSteps: ["Locate the leak point", "Check pump head bolts", "Replace seal and gasket as a set"],
    recommendedProductSlugs: ["2-inch-water-pump-seal-kit", "3-inch-water-pump-seal-kit"]
  },
  {
    slug: "generator-no-voltage",
    title: "Generator No Voltage",
    description: "No voltage can be related to AVR, carbon brushes, wiring or rotor/stator problems.",
    commonCauses: ["AVR failure", "Worn carbon brush", "Loose wiring", "Incorrect switch connection"],
    checkSteps: ["Confirm generator model", "Check AVR plug type", "Inspect carbon brush", "Ask before buying electrical parts"],
    recommendedProductSlugs: ["3kw-generator-electrical-addon-kit"]
  },
  {
    slug: "engine-runs-rough",
    title: "Engine Runs Rough",
    description: "Rough running often points to fuel delivery, air filtration or carburetor adjustment problems.",
    commonCauses: ["Dirty carburetor", "Blocked air filter", "Poor fuel flow"],
    checkSteps: ["Clean carburetor", "Replace air filter", "Check fuel hose and gasket sealing"],
    recommendedProductSlugs: ["carburetor-troubleshooting-kit", "annual-small-engine-maintenance-kit"]
  }
];

export function getProblem(slug: string) {
  return problems.find((problem) => problem.slug === slug);
}
