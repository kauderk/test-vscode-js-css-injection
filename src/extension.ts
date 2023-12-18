import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import msg from './messages'
import { v4 } from 'uuid'

function getWorkBenchHtmlData() {
  if (!require.main?.filename) {
    vscode.window.showErrorMessage(msg.internalError + 'no main filename')
    throw new Error('no main filename')
  }
  const appDir = path.dirname(require.main.filename)
  const base = path.join(appDir, 'vs', 'code')
  const workbenchPath = path.join(
    base,
    'electron-sandbox',
    'workbench',
    'workbench.html'
  )
  const getBackupPath = (uuid: string) =>
    path.join(
      base,
      'electron-sandbox',
      'workbench',
      `workbench.${uuid}.bak-custom-css`
    )
  return { path: workbenchPath, getBackupPath }
}
async function installImpl() {
  const file = getWorkBenchHtmlData()

  const backupUuid = await getBackupUuid(file.path).catch((e) =>
    console.error(e)
  )
  if (backupUuid) {
    console.log('vscode-custom-css is active!')
    return
  }

  const uuidSession = v4()
  // await createBackup(uuidSession)
  {
    try {
      const html = await fs.promises
        .readFile(file.path, 'utf-8')
        .then(clearExistingPatches)
      await fs.promises.writeFile(
        file.getBackupPath(uuidSession),
        html,
        'utf-8'
      )
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin)
      throw e
    }
  }

  // await performPatch(uuidSession)
  {
    let indicatorJsPath
    let ext = vscode.extensions.getExtension('be5invis.vscode-custom-css')
    if (ext && ext.extensionPath) {
      indicatorJsPath = path.resolve(ext.extensionPath, 'dist/statusbar.js')
    } else {
      indicatorJsPath = path.resolve(__dirname, 'statusbar.js')
    }
    const indicatorJsContent = await fs.promises.readFile(
      indicatorJsPath,
      'utf-8'
    )
    const indicatorJS = `<script>${indicatorJsContent}</script>`

    // prettier-ignore
    const html = (await fs.promises
      .readFile(file.path, 'utf-8')
      .then(clearExistingPatches))
      .replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')
      .replace(
        /(<\/html>)/,
        `<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ${uuidSession} !! -->\n` +
          '<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n' +
          indicatorJS +
          '<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>'
      )

    try {
      await fs.promises.writeFile(file.path, html, 'utf-8')
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin)
      disabledRestart()
    }

    // enabledRestart()
    vscode.window
      .showInformationMessage(msg.enabled, { title: msg.restartIde })
      .then(reloadWindow)
  }

  console.log('vscode-custom-css is active!')
}
function clearExistingPatches(html: string) {
  return html
    .replace(
      /<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/,
      ''
    )
    .replace(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g, '')
}
async function getBackupUuid(path: string) {
  try {
    const uid = (await fs.promises.readFile(path, 'utf-8')) //
      .match(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/)
    if (!uid) throw new Error('no backup uuid found')
    else return uid[1]
  } catch (e) {
    vscode.window.showInformationMessage(msg.somethingWrong + e)
    throw e
  }
}
export async function uninstallImpl() {
  const file = getWorkBenchHtmlData()

  // if typescript wont won't freak out about promises then nothing matters :D
  // getBackupUuid
  const backupUuid = await getBackupUuid(file.path)

  // restoreBackup
  const backupFilePath = file.getBackupPath(backupUuid)
  {
    try {
      if (fs.existsSync(backupFilePath)) {
        await fs.promises.unlink(file.path)
        await fs.promises.copyFile(backupFilePath, file.path)
      }
    } catch (e) {
      vscode.window.showInformationMessage(msg.admin)
      throw e
    }
  }

  // deleteBackupFiles
  {
    const htmlDir = path.dirname(file.path)
    const htmlDirItems = await fs.promises.readdir(htmlDir)
    for (const item of htmlDirItems) {
      if (item.endsWith('.bak-custom-css')) {
        await fs.promises.unlink(path.join(htmlDir, item))
      }
    }
  }

  disabledRestart()
}

function reloadWindow() {
  // reload vscode-window
  vscode.commands.executeCommand('workbench.action.reloadWindow')
}

function disabledRestart() {
  vscode.window
    .showInformationMessage(msg.disabled, { title: msg.restartIde })
    .then(reloadWindow)
}

function _catch(e: unknown) {
  console.error(e)
}
// how do you make javascript freak out about promises/errors?
// export function deactivate() {
//   return uninstallImpl().catch(_catch)
// }
export function activate(context: vscode.ExtensionContext) {
  return installImpl().catch(_catch)
}
