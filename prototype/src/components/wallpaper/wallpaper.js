import { Component, define } from '../../core/component.js';

// Desktop stand-in: the (live) wallpaper plus overlays that fake what the
// hardware controls would do - monitor brightness and night light.
// The video and poster are local files populated by serve.sh (assets/local/).
class Wallpaper extends Component {
  static slices = ['ui', 'display', 'caps'];

  render() {
    return `
      <video autoplay muted loop playsinline poster="assets/local/wallpaper.jpg" src="assets/local/wallpaper.mp4"></video>
      <div class="tint"></div>
      <div class="night"></div>`;
  }

  setup() {
    this.video = this.$('video');
    this.video.addEventListener('error', () => this.video.remove(), { once: true });
  }

  update({ ui, display, caps }) {
    if (this.video.isConnected) ui.liveWallpaper ? this.video.play().catch(() => {}) : this.video.pause();
    this.video.style.filter = `brightness(${(0.8 + display.brightness / 250).toFixed(3)})`;
    const night = caps.hyprsunset && display.night ? (6500 - display.nightK) / 4000 * 0.32 : 0;
    this.$('.night').style.opacity = night.toFixed(3);
  }
}

define('ss-wallpaper', Wallpaper);
