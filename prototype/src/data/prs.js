// One state per pull request, worst first. Shared with the shell
// (shell/lib/prs.mjs links here).
//   failing   checks failed            conflict  merge conflict with base
//   behind    base moved on (stale)    pending   checks running
//   review    waiting for a review     ready     green and approved / mergeable
//   merged    merged since last look
export const ORDER = ['failing', 'conflict', 'behind', 'pending', 'review', 'ready', 'merged'];

export function prStatus(pr) {
  if (pr.merged) return 'merged';
  if (pr.checks === 'FAILURE' || pr.checks === 'ERROR') return 'failing';
  if (pr.mergeState === 'DIRTY') return 'conflict';
  if (pr.mergeState === 'BEHIND') return 'behind';
  if (pr.checks === 'PENDING' || pr.checks === 'EXPECTED') return 'pending';
  if (pr.review === 'REVIEW_REQUIRED' || pr.review === 'CHANGES_REQUESTED') return 'review';
  return 'ready';
}

export const worst = list => list.map(prStatus).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0] ?? null;

// grouped by repo: repos needing action first, then A-Z; PRs worst first
export function byRepo(list) {
  const map = new Map();
  for (const pr of list) (map.get(pr.repo) ?? map.set(pr.repo, []).get(pr.repo)).push(pr);
  const rank = prs => ORDER.indexOf(worst(prs));
  return [...map].map(([repo, prs]) => ({
    repo, prs: prs.sort((a, b) => ORDER.indexOf(prStatus(a)) - ORDER.indexOf(prStatus(b))),
  })).sort((a, b) => rank(a.prs) - rank(b.prs) || a.repo.localeCompare(b.repo));
}
