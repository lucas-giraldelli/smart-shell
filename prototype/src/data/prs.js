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

// the checks of a PR's last commit as one state (SUCCESS, PENDING, FAILURE),
// from its CheckRun / StatusContext nodes: GitHub's own rollup calls a
// cancelled run a failure, here cancelled, skipped and neutral runs don't count
export function checksOf(nodes) {
  if (!nodes || !nodes.length) return null;
  const states = nodes.map(c => c.state || (c.status !== 'COMPLETED' ? 'PENDING' : c.conclusion));
  if (states.some(s => ['FAILURE', 'ERROR', 'TIMED_OUT', 'STARTUP_FAILURE', 'ACTION_REQUIRED'].includes(s))) return 'FAILURE';
  if (states.some(s => ['PENDING', 'EXPECTED'].includes(s))) return 'PENDING';
  return 'SUCCESS';
}

export const worst = list => list.map(prStatus).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0] ?? null;

// grouped by repo: repos needing action first, then A-Z; PRs oldest first,
// merged ones last
export function byRepo(list) {
  const map = new Map();
  for (const pr of list) (map.get(pr.repo) ?? map.set(pr.repo, []).get(pr.repo)).push(pr);
  const rank = prs => ORDER.indexOf(worst(prs));
  return [...map].map(([repo, prs]) => ({
    repo, prs: prs.sort((a, b) => a.merged - b.merged || (a.created ?? '').localeCompare(b.created ?? '')),
  })).sort((a, b) => rank(a.prs) - rank(b.prs) || a.repo.localeCompare(b.repo));
}
