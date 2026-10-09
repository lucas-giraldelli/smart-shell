import { t } from '../i18n/index.js';

// Optional backends a feature can depend on. Features whose backend is missing
// stay visible but disabled, telling the user what to install.
export const capabilities = {
  bluetooth: { label: 'Bluetooth', install: 'bluez bluez-utils' },
  ddcutil: { label: 'ddcutil', install: 'ddcutil' },
  docker: { label: 'Docker', install: 'docker' },
  hyprsunset: { label: 'hyprsunset', install: 'hyprsunset' },
};

export const missingText = cap => (capabilities[cap] ? t(`capabilities.${cap}`) : t('capabilities.unknown', { name: cap }));
export const installHint = cap => capabilities[cap]?.install;
