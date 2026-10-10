import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { setHTML } from '../ui/ui.js';
import { t, formatTime } from '../../i18n/index.js';
import { update as updateStore } from '../../state.js';
import { savePref } from '../../core/prefs.js';
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

// hidden repos leave the list and the count, unless the user asks to see them
const visible = prs => prs.list.filter(pr => prs.showHidden || !prs.hidden.includes(pr.repo));

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
    if (ui.popover !== 'prs') return;
    const updated = prs.updatedAt ? t('prs.updated', { time: formatTime(prs.updatedAt) }) : t('prs.sample');
    setHTML(this, `
      <div class="prs-head">
        <span class="sec">${t('prs.title')}</span>
        <span class="meta">${updated}</span>
        <button class="ib${prs.loading ? ' spinning' : ''}" data-refresh title="${t('prs.refresh')}">${icon('refresh-cw')}</button>
      </div>
      ${visible(prs).length ? byRepo(visible(prs)).map(g => {
        const status = worst(g.prs), look = LOOK[status];
        return `
        <div class="pr-group${isExpanded(g.repo, status) ? ' open' : ''}${prs.hidden.includes(g.repo) ? ' hidden-repo' : ''}" data-repo="${g.repo}">
          <div class="pr-repo" title="${g.repo}">${icon('chevron-right', 'pr-chev')}
            <span class="pr-ic" style="color:${look.color}">${icon(look.icon)}</span>
            <span class="grow">${g.repo.split('/')[1]}</span>
            <button class="pr-hide" data-hide="${g.repo}" title="${t(prs.hidden.includes(g.repo) ? 'prs.unhide' : 'prs.hide')}">${icon(prs.hidden.includes(g.repo) ? 'eye' : 'eye-off')}</button>
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
      }).join('') : `<div class="meta prs-empty">${t('prs.none')}</div>`}
      ${prs.hidden.length ? `<button class="pr-hidden-toggle" data-show-hidden>${icon(prs.showHidden ? 'eye-off' : 'eye')}${t(prs.showHidden ? 'prs.hideHidden' : 'prs.showHidden', { n: prs.hidden.length })}</button>` : ''}`);
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
    const shown = prs.list.filter(p => !prs.hidden.includes(p.repo));
    const open = shown.filter(p => !p.merged);
    const w = worst(shown);
    this.toggleAttribute('data-open', ui.popover === 'prs');
    this.style.setProperty('--pr', w ? LOOK[w].color : 'var(--menu-sub)');
    this.$('[data-count]').textContent = open.length;
    this.$('.label').textContent = t('prs.tile', { n: open.length });
  }
}
define('ss-prs', Prs);
