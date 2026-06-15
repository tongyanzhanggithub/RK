export type DiagnosticResult = {
  cause: string;
  action: string;
  productSlugs?: string[];
};

export type DiagnosticOption = {
  label: string;
  next?: DiagnosticNode;
  result?: DiagnosticResult;
};

export type DiagnosticNode = {
  question: string;
  hint?: string;
  options: DiagnosticOption[];
};

export type RepairStep = {
  title: string;
  detail?: string;
  image?: string;
};

export type Problem = {
  slug: string;
  title: string;
  description: string;
  commonCauses: string[];
  checkSteps: string[];
  recommendedProductSlugs: string[];
  difficulty: "easy" | "moderate" | "advanced";
  timeEstimate: string;
  toolsNeeded: string[];
  /** YouTube watch/share/shorts URL — embedded on the problem detail page. */
  videoUrl?: string;
  /** Engine model slugs this symptom commonly affects (for cross-linking). */
  affectedModels?: string[];
  /** Interactive question-and-answer diagnostic flow. */
  decisionTree?: DiagnosticNode;
  /** Richer step-by-step repair with optional per-step images. */
  repairSteps?: RepairStep[];
};

export const problems: Problem[] = [
  {
    slug: "engine-wont-start",
    title: "Engine Won't Start",
    description: "Small gasoline engines often fail to start because of fuel, ignition or air intake issues.",
    commonCauses: ["Dirty carburetor", "Old spark plug", "Blocked air filter", "Cracked fuel hose"],
    checkSteps: ["Check spark plug condition", "Confirm fuel reaches the carburetor", "Clean or replace air filter", "Inspect stop switch wiring"],
    recommendedProductSlugs: ["168f-standard-repair-kit", "carburetor-troubleshooting-kit", "168f-basic-maintenance-kit"],
    difficulty: "easy",
    timeEstimate: "30–60 min",
    toolsNeeded: ["Spark plug wrench", "Screwdriver set", "Carburetor cleaner spray", "Clean fuel"],
    affectedModels: ["168f", "170f", "188f", "190f", "gx160", "gx200", "3kw-generator"],
    decisionTree: {
      question: "Pull the spark plug, ground it against the engine and crank — is there a blue spark?",
      hint: "No spark points to ignition; good spark points to fuel or air.",
      options: [
        {
          label: "No spark",
          next: {
            question: "Is the spark plug wet with fuel, black or fouled?",
            options: [
              {
                label: "Wet / black / fouled",
                result: {
                  cause: "Fouled or worn spark plug",
                  action: "Clean or replace the spark plug, then retry. Fouling usually comes with a rich carburetor.",
                  productSlugs: ["168f-basic-maintenance-kit"]
                }
              },
              {
                label: "Dry, still no spark",
                result: {
                  cause: "Ignition coil or stop-switch fault",
                  action: "Check the stop-switch wiring first (a shorted kill switch kills spark), then test the ignition coil gap and replace if dead.",
                  productSlugs: ["168f-standard-repair-kit"]
                }
              }
            ]
          }
        },
        {
          label: "Good spark",
          next: {
            question: "Is fresh fuel actually reaching the carburetor?",
            hint: "Close the choke, remove the carb drain screw and check for clean flow.",
            options: [
              {
                label: "No fuel / dirty fuel",
                result: {
                  cause: "Blocked fuel line, stale fuel or closed fuel valve",
                  action: "Drain stale fuel, clear the fuel line and clean the carburetor jets.",
                  productSlugs: ["carburetor-troubleshooting-kit"]
                }
              },
              {
                label: "Fuel reaches carb",
                next: {
                  question: "Is the air filter clean and the choke working?",
                  options: [
                    {
                      label: "Air filter dirty",
                      result: {
                        cause: "Clogged air filter starving the engine",
                        action: "Clean or replace the air filter and recheck.",
                        productSlugs: ["168f-basic-maintenance-kit", "annual-small-engine-maintenance-kit"]
                      }
                    },
                    {
                      label: "Air filter clean",
                      result: {
                        cause: "Clogged carburetor jets / worn carburetor",
                        action: "Rebuild or replace the carburetor — varnish in the jets is the most common no-start cause after spark and fuel are confirmed.",
                        productSlugs: ["carburetor-troubleshooting-kit", "168f-standard-repair-kit"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  {
    slug: "pull-starter-broken",
    title: "Pull Starter Broken",
    description: "The rope, spring or recoil housing can fail after frequent use or rough handling.",
    commonCauses: ["Broken pull rope", "Weak recoil spring", "Damaged starter pawl"],
    checkSteps: ["Inspect rope and handle", "Check recoil spring return", "Match mounting hole pattern before ordering"],
    recommendedProductSlugs: ["pull-start-replacement-kit", "168f-standard-repair-kit"],
    difficulty: "easy",
    timeEstimate: "15–30 min",
    toolsNeeded: ["Socket wrench set", "Screwdriver", "Work gloves"],
    affectedModels: ["168f", "170f", "gx160", "gx200"],
    decisionTree: {
      question: "What happens when you pull the starter handle?",
      options: [
        {
          label: "Rope won't pull back in",
          result: {
            cause: "Broken or unwound recoil spring",
            action: "Replace the recoil spring or the whole recoil assembly — match the mounting hole pattern first.",
            productSlugs: ["pull-start-replacement-kit"]
          }
        },
        {
          label: "Rope is snapped",
          result: {
            cause: "Broken pull rope",
            action: "Fit a new rope of the same diameter and length, or swap the complete recoil unit for speed.",
            productSlugs: ["pull-start-replacement-kit"]
          }
        },
        {
          label: "Rope pulls but engine doesn't turn",
          result: {
            cause: "Worn starter pawls / dogs not engaging the flywheel",
            action: "Replace the starter pawls and springs, or the complete recoil assembly.",
            productSlugs: ["pull-start-replacement-kit", "168f-standard-repair-kit"]
          }
        }
      ]
    }
  },
  {
    slug: "water-pump-not-suction",
    title: "Water Pump Not Suction",
    description: "Weak suction can be caused by air leaks, seal wear, clogged screens or incorrect priming.",
    commonCauses: ["Worn mechanical seal", "Clogged filter screen", "Loose inlet connector", "Pump not primed"],
    checkSteps: ["Prime the pump head", "Inspect inlet connector", "Check mechanical seal", "Clean filter screen"],
    recommendedProductSlugs: ["2-inch-water-pump-standard-repair-kit", "2-inch-water-pump-seal-kit"],
    difficulty: "moderate",
    timeEstimate: "45–90 min",
    toolsNeeded: ["Socket wrench set", "Seal puller or flat screwdriver", "Clean rags", "Grease"],
    affectedModels: ["2-inch-water-pump", "3-inch-water-pump"],
    decisionTree: {
      question: "Did you fill the pump casing with water (prime it) before starting?",
      hint: "A centrifugal pump cannot self-prime when the casing is dry.",
      options: [
        {
          label: "No, I didn't prime it",
          result: {
            cause: "Pump was not primed",
            action: "Fill the pump casing with water through the priming port, then restart. This fixes most 'no suction' calls."
          }
        },
        {
          label: "Yes, primed but still weak",
          next: {
            question: "Check the suction side — any air leaks at the inlet hose or connector?",
            options: [
              {
                label: "Loose / leaking inlet",
                result: {
                  cause: "Air leak on the suction side",
                  action: "Re-seal the inlet connector and replace the inlet gasket / O-ring so the pump can build vacuum.",
                  productSlugs: ["2-inch-water-pump-seal-kit"]
                }
              },
              {
                label: "Inlet is sealed tight",
                result: {
                  cause: "Worn mechanical seal or clogged impeller screen",
                  action: "Clean the filter screen, then replace the mechanical seal and impeller gaskets as a set.",
                  productSlugs: ["2-inch-water-pump-standard-repair-kit", "2-inch-water-pump-seal-kit"]
                }
              }
            ]
          }
        }
      ]
    }
  },
  {
    slug: "water-pump-leaking",
    title: "Water Pump Leaking",
    description: "Leakage usually comes from pump gaskets, O-rings or the mechanical seal.",
    commonCauses: ["Worn pump gasket", "Damaged O-ring", "Mechanical seal failure"],
    checkSteps: ["Locate the leak point", "Check pump head bolts", "Replace seal and gasket as a set"],
    recommendedProductSlugs: ["2-inch-water-pump-seal-kit", "3-inch-water-pump-seal-kit"],
    difficulty: "moderate",
    timeEstimate: "45–90 min",
    toolsNeeded: ["Socket wrench set", "Gasket scraper", "Seal puller", "Clean rags"],
    affectedModels: ["2-inch-water-pump", "3-inch-water-pump"],
    decisionTree: {
      question: "Where is the water coming from?",
      options: [
        {
          label: "Between pump body and engine",
          result: {
            cause: "Failed mechanical seal behind the impeller",
            action: "Replace the mechanical seal — leaking there also lets water into the engine, so don't delay.",
            productSlugs: ["2-inch-water-pump-seal-kit", "3-inch-water-pump-seal-kit"]
          }
        },
        {
          label: "Around the pump cover / casing",
          result: {
            cause: "Worn casing gasket or O-ring",
            action: "Replace the casing gasket and O-rings as a set and torque the cover bolts evenly.",
            productSlugs: ["2-inch-water-pump-seal-kit", "3-inch-water-pump-seal-kit"]
          }
        },
        {
          label: "At the hose connectors",
          result: {
            cause: "Loose connector or damaged connector gasket",
            action: "Replace the connector gaskets and re-tighten the camlock / threaded couplings."
          }
        }
      ]
    }
  },
  {
    slug: "generator-no-voltage",
    title: "Generator No Voltage",
    description: "No voltage can be related to AVR, carbon brushes, wiring or rotor/stator problems.",
    commonCauses: ["AVR failure", "Worn carbon brush", "Loose wiring", "Incorrect switch connection"],
    checkSteps: ["Confirm generator model", "Check AVR plug type", "Inspect carbon brush", "Ask before buying electrical parts"],
    recommendedProductSlugs: ["3kw-generator-electrical-addon-kit"],
    difficulty: "advanced",
    timeEstimate: "1–2 hours",
    toolsNeeded: ["Multimeter", "Screwdriver set", "Socket wrench set", "Insulated gloves"],
    affectedModels: ["3kw-generator", "5kw-generator"],
    decisionTree: {
      question: "Does the engine itself run normally at full speed?",
      hint: "No output with a weak/slow engine is a speed problem, not an electrical one.",
      options: [
        {
          label: "Engine runs fine, but no output",
          next: {
            question: "Inspect the carbon brushes — are they worn down or not touching the slip rings?",
            options: [
              {
                label: "Brushes worn / not contacting",
                result: {
                  cause: "Worn carbon brushes",
                  action: "Replace the carbon brushes and clean the slip rings.",
                  productSlugs: ["3kw-generator-electrical-addon-kit"]
                }
              },
              {
                label: "Brushes look fine",
                result: {
                  cause: "Faulty AVR (automatic voltage regulator)",
                  action: "Replace the AVR with the correct plug type for your model. Send us a photo of the old AVR to match it.",
                  productSlugs: ["3kw-generator-electrical-addon-kit"]
                }
              }
            ]
          }
        },
        {
          label: "Engine is weak / runs slow",
          result: {
            cause: "Engine speed too low to generate rated voltage",
            action: "Fix the engine running issue first (carburetor / governor), then recheck output.",
            productSlugs: ["carburetor-troubleshooting-kit"]
          }
        }
      ]
    }
  },
  {
    slug: "engine-runs-rough",
    title: "Engine Runs Rough",
    description: "Rough running often points to fuel delivery, air filtration or carburetor adjustment problems.",
    commonCauses: ["Dirty carburetor", "Blocked air filter", "Poor fuel flow"],
    checkSteps: ["Clean carburetor", "Replace air filter", "Check fuel hose and gasket sealing"],
    recommendedProductSlugs: ["carburetor-troubleshooting-kit", "annual-small-engine-maintenance-kit"],
    difficulty: "moderate",
    timeEstimate: "30–60 min",
    toolsNeeded: ["Screwdriver set", "Carburetor cleaner spray", "Compressed air (optional)"],
    affectedModels: ["168f", "170f", "gx160", "gx200"],
    decisionTree: {
      question: "When is the rough running worst?",
      options: [
        {
          label: "Worst at idle / low speed",
          result: {
            cause: "Clogged idle jet or dirty carburetor",
            action: "Clean the carburetor — especially the idle (pilot) jet — and adjust the idle screw.",
            productSlugs: ["carburetor-troubleshooting-kit"]
          }
        },
        {
          label: "Worst at full throttle / under load",
          next: {
            question: "Is the air filter clean?",
            options: [
              {
                label: "Air filter dirty",
                result: {
                  cause: "Restricted air flow under load",
                  action: "Clean or replace the air filter, then retest under load.",
                  productSlugs: ["annual-small-engine-maintenance-kit"]
                }
              },
              {
                label: "Air filter clean",
                result: {
                  cause: "Main jet starving for fuel / weak fuel flow",
                  action: "Check the fuel flow and clean the main jet; replace the carburetor gaskets if the bowl seal leaks.",
                  productSlugs: ["carburetor-troubleshooting-kit"]
                }
              }
            ]
          }
        },
        {
          label: "Shakes / vibrates roughly all the time",
          result: {
            cause: "Loose mounts or intake gasket air leak",
            action: "Check engine mount bolts and replace the intake/carburetor gaskets if you find an air leak.",
            productSlugs: ["168f-standard-repair-kit"]
          }
        }
      ]
    }
  }
];

export function getProblem(slug: string) {
  return problems.find((problem) => problem.slug === slug);
}
