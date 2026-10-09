import { Component, define } from '../../core/component.js';

// Desktop stand-in: a static default wallpaper, optionally replaced by a local
// video (assets/local/wallpaper.mp4, linked by serve.sh), plus overlays that
// fake what the hardware controls would do - monitor brightness and night light.
const STATIC = 'assets/wallpapers/default.svg';
const VIDEO = 'assets/local/wallpaper.mp4';

class Wallpaper extends Component {
  static slices = ['ui', 'display', 'caps'];

  render() {
    return `
      <div class="wp">
        <img src="${STATIC}" alt="">
        <video muted loop playsinline preload="none" hidden></video>
      </div>
      <div class="night"></div>`;
  }

  setup() {
    this.video = this.$('video');
    // no local video: stay on the static wallpaper
    this.video.addEventListener('error', () => { this.video.hidden = true; this.missing = true; });
  }

  update({ ui, display, caps }) {
    const live = ui.liveWallpaper && !this.missing;
    if (live) {
      if (!this.video.getAttribute('src')) this.video.src = VIDEO;
      this.video.hidden = false;
      this.video.play().catch(() => {});
    } else {
      this.video.pause();
      this.video.hidden = true;
    }
    this.$('.wp').style.filter = `brightness(${(0.8 + display.brightness / 250).toFixed(3)})`;
    const night = caps.hyprsunset && display.night ? (6500 - display.nightK) / 4000 * 0.32 : 0;
    this.$('.night').style.opacity = night.toFixed(3);
  }
}

define('ss-wallpaper', Wallpaper);
