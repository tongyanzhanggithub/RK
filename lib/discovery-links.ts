import { models } from "@/data/models";
import { problems } from "@/data/problems";

/** Resolve a free-text compatible-model entry (e.g. "GX160 style engine") to its engine hub page. */
export function engineHrefForModelText(text: string) {
  const haystack = text.toLowerCase();
  const model = models.find((candidate) => haystack.includes(candidate.name.toLowerCase()));
  return model ? `/engines/${model.slug}` : null;
}

/** Resolve a problems-solved entry (e.g. "Engine won't start") to its troubleshooting page. */
export function problemHrefForTitle(text: string) {
  const needle = text.trim().toLowerCase();
  const problem = problems.find((candidate) => candidate.title.toLowerCase() === needle);
  return problem ? `/problems/${problem.slug}` : null;
}
