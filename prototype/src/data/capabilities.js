// Optional backends a feature can depend on. Features whose backend is missing
// stay visible but disabled, telling the user what to install.
export const capabilities = {
  bluetooth: { label: 'Bluetooth', missing: 'Sem adaptador Bluetooth', install: 'bluez bluez-utils' },
  ddcutil: { label: 'ddcutil', missing: 'ddcutil não instalado', install: 'ddcutil' },
  docker: { label: 'Docker', missing: 'Docker não instalado', install: 'docker' },
  hyprsunset: { label: 'hyprsunset', missing: 'hyprsunset não instalado', install: 'hyprsunset' },
};

export const missingText = cap => capabilities[cap]?.missing ?? `${cap} indisponível`;
export const installHint = cap => capabilities[cap]?.install;
