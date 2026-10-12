// One state per pull request, worst first. Shared with the shell
// (shell/lib/prs.mjs links here).
//   failing   checks failed            conflict  merge conflict with base
//   behind    base moved on (stale)    pending   checks running
//   green     pipeline green (one tick) approved  green and approved (two ticks)
//   merged    merged since last look
export const ORDER = ['failing', 'conflict', 'behind', 'pending', 'green', 'approved', 'merged'];

export function prStatus(pr) {
  if (pr.merged) return 'merged';
  if (pr.checks === 'FAILURE' || pr.checks === 'ERROR') return 'failing';
  if (pr.mergeState === 'DIRTY') return 'conflict';
  if (pr.mergeState === 'BEHIND') return 'behind';
  if (pr.checks === 'PENDING' || pr.checks === 'EXPECTED') return 'pending';
  return pr.review === 'APPROVED' ? 'approved' : 'green';
}

export const worst = list => list.map(prStatus).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0] ?? null;

// grouped by repo: repos needing action first, then A-Z; PRs newest first,
// merged ones last
export function byRepo(list) {
  const map = new Map();
  for (const pr of list) (map.get(pr.repo) ?? map.set(pr.repo, []).get(pr.repo)).push(pr);
  const rank = prs => ORDER.indexOf(worst(prs));
  return [...map].map(([repo, prs]) => ({
    repo, prs: prs.sort((a, b) => a.merged - b.merged || (b.created ?? '').localeCompare(a.created ?? '')),
  })).sort((a, b) => rank(a.prs) - rank(b.prs) || a.repo.localeCompare(b.repo));
}
