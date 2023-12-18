export default {
  admin: 'Run VS Code with admin privileges so the changes can be applied.',
  enabled:
    'Custom CSS and JS enabled. Restart to take effect. ' +
    "If Code complains about it is corrupted, CLICK DON'T SHOW AGAIN. " +
    'See README for more detail.',
  disabled:
    'Custom CSS and JS disabled and reverted to default. Restart to take effect.',
  already_disabled: 'Custom CSS and JS already disabled.',
  somethingWrong: 'Something went wrong: ',
  internalError: 'Internal error: ',
  restartIde: 'Restart Visual Studio Code',
  notfound: 'Custom CSS and JS not found.',
  notConfigured:
    'Custom CSS and JS path not configured. ' +
    'Please set "vscode_custom_css.imports" in your user settings.',
  reloadAfterVersionUpgrade:
    'Detected reloading CSS / JS after VSCode is upgraded. ' +
    'Performing application only.',
  cannotLoad: (url: string) => `Cannot load '${url}'. Skipping.` as const,
} as const
