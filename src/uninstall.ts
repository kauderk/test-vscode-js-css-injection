import { uninstallImpl } from './extension'
uninstallImpl().catch((e: unknown) => console.error(e))
