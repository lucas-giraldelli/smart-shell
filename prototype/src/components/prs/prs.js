import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { setHTML } from '../ui/ui.js';
import { t, formatTime } from '../../i18n/index.js';
import { update as updateStore } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { prStatus, worst, byRepo, prUrl } from '../../data/prs.js';

// The user's open pull requests (`gh`, every hour or on refresh), as an item
// of the tray: the PR icon in the worst state's colour (the count on hover);
// click lists them by repo, title only; a row's last button copies its link.
// The + in the head opens a field for the link of someone else's PR to follow
// (Enter follows, Esc cancels, red while it is not a PR link); a followed PR
// gets an x to unfollow it.
const LOOK = {
  failing: { icon: 'circle-x', color: 'var(--crit)' },
  conflict: { icon: 'circle-x', color: 'var(--crit)' },
  behind: { icon: 'triangle-alert', color: 'var(--warn)' },
  pending: { icon: 'circle-dashed', color: 'var(--menu-sub)' },
  green: { icon: 'check', color: 'var(--ok)' },
  approved: { icon: 'check-check', color: 'var(--ok)' },
  merged: { icon: 'git-merge', color: '#a78bfa' },
};

// hidden repos leave the list and the count, unless the user asks to see them
const visible = prs => prs.list.filter(pr => prs.showHidden || !prs.hidden.includes(pr.repo));

// which repos are open: the user's choice, else open when one needs action
const expanded = new Map();
const needsAction = s => ['failing', 'conflict', 'behind'].includes(s);
const isExpanded = (repo, status) => expanded.get(repo) ?? needsAction(status);

// the follow field is open
let adding = false;

class PrList extends Component {
  static slices = ['prs', 'ui'];

  // follow the link in the field: here a placeholder row (the shell reads
  // the PR from GitHub)
  follow(input) {
    const url = prUrl(input.value);
    if (!url) { input.classList.add('bad'); return; }
    const [, , , owner, repo, , number] = url.split('/');
    adding = false;
    updateStore('prs', p => ({
      list: p.list.some(pr => pr.url === url) ? p.list : [...p.list, {
        repo: `${owner}/${repo}`, number: +number, title: `PR #${number}`, url, created: new Date().toISOString(),
        checks: 'PENDING', mergeState: 'BLOCKED', review: null, merged: false, followed: true, author: owner,
      }],
    }));
  }

  setup() {
    this.classList.add('menu', 'prs-menu');
    this.addEventListener('input', e => {
      if (e.target.matches('[data-follow-input]'))
        e.target.classList.toggle('bad', e.target.value.trim() !== '' && !prUrl(e.target.value));
    });
    this.addEventListener('keydown', e => {
      if (!e.target.matches('[data-follow-input]')) return;
      if (e.key === 'Enter') this.follow(e.target);
      if (e.key === 'Escape') { e.stopPropagation(); adding = false; updateStore('prs', {}); }
    });
    this.addEventListener('click', e => {
      if (e.target.closest('[data-follow-input]')) return;
      if (e.target.closest('[data-add]')) {
        adding = !adding;
        updateStore('prs', {});
        if (adding) this.querySelector('[data-follow-input]')?.focus();
        return;
      }
      const unfollow = e.target.closest('[data-unfollow]');
      if (unfollow) {
        updateStore('prs', p => ({ list: p.list.filter(pr => pr.url !== unfollow.dataset.unfollow) }));
        return;
      }
      if (e.target.closest('[data-refresh]')) {
        // `gh api graphql` in the real shell; here, just the timestamp
        updateStore('prs', { loading: true });
        setTimeout(() => updateStore('prs', { loading: false, updatedAt: new Date() }), 700);
        return;
      }
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        try { navigator.clipboard.writeText(copy.dataset.copy); } catch {}
        copy.innerHTML = icon('check');
        copy.classList.add('copied');
        setTimeout(() => { copy.innerHTML = icon('copy'); copy.classList.remove('copied'); }, 1500);
        return;
      }
      const dismiss = e.target.closest('[data-dismiss]');
      if (dismiss) {
        // merged is the past: gone from the list (saved as dismissed in the shell)
        updateStore('prs', p => ({ list: p.list.filter(pr => pr.url !== dismiss.dataset.dismiss) }));
        return;
      }
      const hide = e.target.closest('[data-hide]');
      if (hide) {
        updateStore('prs', p => {
          const repo = hide.dataset.hide;
          const hidden = p.hidden.includes(repo) ? p.hidden.filter(r => r !== repo) : [...p.hidden, repo];
          savePref('prsHidden', hidden);
          return { hidden };
        });
        return;
      }
      if (e.target.closest('[data-show-hidden]')) { updateStore('prs', p => ({ showHidden: !p.showHidden })); return; }
      const head = e.target.closest('.pr-repo');
      if (head) {
        // toggled in place, so the body animates open / shut
        expanded.set(head.parentElement.dataset.repo, head.parentElement.classList.toggle('open'));
        return;
      }
      const row = e.target.closest('[data-url]');
      if (row) { window.open(row.dataset.url, '_blank'); closePopover(); }
    });
  }

  update({ prs, ui }) {
    if (ui.popover !== 'prs') { adding = false; return; }
    const updated = prs.updatedAt ? t('prs.updated', { time: formatTime(prs.updatedAt) }) : t('prs.sample');
    setHTML(this, `
      <div class="prs-head">
        <span class="sec">${t('prs.title')}</span>
        <span class="meta">${updated}</span>
        <button class="ib flat" data-add title="${t(adding ? 'prs.cancel' : 'prs.follow')}">${icon(adding ? 'x' : 'plus')}</button>
        <button class="ib flat${prs.loading ? ' spinning' : ''}" data-refresh title="${t('prs.refresh')}">${icon('refresh-cw')}</button>
      </div>
      ${adding ? `<div class="pr-follow">
        <input data-follow-input placeholder="https://github.com/owner/repo/pull/123" spellcheck="false">
        <span class="pr-follow-bad">${t('prs.invalid')}</span>
      </div>` : ''}
      ${visible(prs).length ? byRepo(visible(prs)).map(g => {
        const status = worst(g.prs);
        return `
        <div class="pr-group${isExpanded(g.repo, status) ? ' open' : ''}${prs.hidden.includes(g.repo) ? ' hidden-repo' : ''}" data-repo="${g.repo}">
          <div class="pr-repo" title="${g.repo}">${icon('chevron-right', 'pr-chev')}
            <span class="grow">${g.repo.split('/')[1]}</span>
            <button class="pr-hide" data-hide="${g.repo}" title="${t(prs.hidden.includes(g.repo) ? 'prs.unhide' : 'prs.hide')}">${icon(prs.hidden.includes(g.repo) ? 'eye' : 'eye-off')}</button>
            <span class="pr-count">${g.prs.length}</span>
          </div>
          <div class="pr-body"><div>${g.prs.map(pr => {
            const s = prStatus(pr), l = LOOK[s];
            return `<div class="row pr" data-url="${pr.url}" title="#${pr.number}${pr.author ? ` · @${pr.author}` : ''} · ${t(`prs.status.${s}`)}">
              <span class="pr-ic" style="color:${l.color}">${icon(l.icon)}</span>
              <span class="grow pr-title">${pr.title}</span>
              <button class="pr-dismiss pr-copy" data-copy="${pr.url}" title="${t('prs.copy')}">${icon('copy')}</button>
              ${pr.merged ? `<button class="pr-dismiss" data-dismiss="${pr.url}" title="${t('prs.dismiss')}">${icon('x')}</button>`
                : pr.followed ? `<button class="pr-dismiss" data-unfollow="${pr.url}" title="${t('prs.unfollow')}">${icon('x')}</button>` : ''}
            </div>`;
          }).join('')}</div></div>
        </div>`;
      }).join('') : `<div class="meta prs-empty">${t('prs.none')}</div>`}
      ${prs.hidden.length ? `<button class="pr-hidden-toggle" data-show-hidden>${icon(prs.showHidden ? 'eye-off' : 'eye')}${t(prs.showHidden ? 'prs.hideHidden' : 'prs.showHidden', { n: prs.hidden.length })}</button>` : ''}`);
  }
}
define('ss-pr-list', PrList);

class Prs extends Component {
  static slices = ['prs', 'ui'];

  render() {
    return `<span data-icon>${icon('git-pull-request')}</span><ss-pr-list></ss-pr-list>`;
  }

  setup() {
    this.classList.add('prs');
    this.dataset.popover = 'prs';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-pr-list')) return;
      isOpen('prs') ? closePopover() : openPopover('prs');
    });
  }

  update({ prs, ui }) {
    // the icon colour and count are the user's own PRs: a followed one only lists
    const shown = prs.list.filter(p => !prs.hidden.includes(p.repo) && !p.followed);
    const open = shown.filter(p => !p.merged);
    const w = worst(shown);
    this.toggleAttribute('data-open', ui.popover === 'prs');
    this.style.setProperty('--pr', w ? LOOK[w].color : 'var(--menu-sub)');
    this.title = t('prs.tile', { n: open.length });
  }
}
define('ss-prs', Prs);
