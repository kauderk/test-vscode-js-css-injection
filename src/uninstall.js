const uninstallImpl = require('./extension').uninstallImpl
uninstallImpl().catch((e) => console.error(e))
