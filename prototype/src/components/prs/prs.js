import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { setHTML } from '../ui/ui.js';
import { t, formatTime } from '../../i18n/index.js';
import { update as updateStore } from '../../state.js';
import { prStatus, worst, byRepo } from '../../data/prs.js';

// The user's open pull requests (`gh`, every 20 min or on refresh). The tile
// shows how many and the worst state; click lists them, title only.
const LOOK = {
  failing: { icon: 'circle-x', color: 'var(--crit)' },
  conflict: { icon: 'circle-x', color: 'var(--crit)' },
  behind: { icon: 'triangle-alert', color: 'var(--warn)' },
  pending: { icon: 'circle-dashed', color: 'var(--menu-sub)' },
  review: { icon: 'clock', color: 'var(--menu-sub)' },
  ready: { icon: 'circle-check', color: 'var(--ok)' },
  merged: { icon: 'git-merge', color: '#a78bfa' },
};

// which repos are open: the user's choice, else open when one needs action
const expanded = new Map();
const needsAction = s => ['failing', 'conflict', 'behind'].includes(s);
const isExpanded = (repo, status) => expanded.get(repo) ?? needsAction(status);

class PrList extends Component {
  static slices = ['prs', 'ui'];

  setup() {
    this.classList.add('menu', 'prs-menu');
    this.addEventListener('click', e => {
      if (e.target.closest('[data-refresh]')) {
        // `gh api graphql` in the real shell; here, just the timestamp
        updateStore('prs', { loading: true });
        setTimeout(() => updateStore('prs', { loading: false, updatedAt: new Date() }), 700);
        return;
      }
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
    if (ui.popover !== 'prs') return;
    const updated = prs.updatedAt ? t('prs.updated', { time: formatTime(prs.updatedAt) }) : t('prs.sample');
    setHTML(this, `
      <div class="prs-head">
        <span class="sec">${t('prs.title')}</span>
        <span class="meta">${updated}</span>
        <button class="ib${prs.loading ? ' spinning' : ''}" data-refresh title="${t('prs.refresh')}">${icon('refresh-cw')}</button>
      </div>
      ${prs.list.length ? byRepo(prs.list).map(g => {
        const status = worst(g.prs), look = LOOK[status];
        return `
        <div class="pr-group${isExpanded(g.repo, status) ? ' open' : ''}" data-repo="${g.repo}">
          <div class="pr-repo" title="${g.repo}">${icon('chevron-right', 'pr-chev')}
            <span class="pr-ic" style="color:${look.color}">${icon(look.icon)}</span>
            <span class="grow">${g.repo.split('/')[1]}</span>
            <span class="pr-count">${g.prs.length}</span>
          </div>
          <div class="pr-body"><div>${g.prs.map(pr => {
            const s = prStatus(pr), l = LOOK[s];
            return `<div class="row pr" data-url="${pr.url}" title="#${pr.number} · ${t(`prs.status.${s}`)}">
              <span class="pr-ic" style="color:${l.color}">${icon(l.icon)}</span>
              <span class="grow pr-title">${pr.title}</span>
            </div>`;
          }).join('')}</div></div>
        </div>`;
      }).join('') : `<div class="meta prs-empty">${t('prs.none')}</div>`}`);
  }
}
define('ss-pr-list', PrList);

class Prs extends Component {
  static slices = ['prs', 'ui'];

  render() {
    return `<span data-icon>${icon('git-pull-request')}</span><b class="t-big" data-count></b>
      <span class="label"></span><ss-pr-list></ss-pr-list>`;
  }

  setup() {
    this.classList.add('tile', 'prs');
    this.dataset.popover = 'prs';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-pr-list')) return;
      isOpen('prs') ? closePopover() : openPopover('prs');
    });
  }

  update({ prs, ui }) {
    const open = prs.list.filter(p => !p.merged);
    const w = worst(prs.list);
    this.toggleAttribute('data-open', ui.popover === 'prs');
    this.style.setProperty('--pr', w ? LOOK[w].color : 'var(--menu-sub)');
    this.$('[data-count]').textContent = open.length;
    this.$('.label').textContent = t('prs.tile', { n: open.length });
  }
}
define('ss-prs', Prs);
