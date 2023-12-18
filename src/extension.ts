import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import msg from './messages'
import { v4 } from 'uuid'
import fetch from 'node-fetch'
import { URL, fileURLToPath } from 'url'

function activate(context: vscode.ExtensionContext) {
  if (!require.main?.filename) {
    vscode.window.showErrorMessage(msg.internalError + 'no main filename')
    return
  }
  const appDir = path.dirname(require.main.filename)
  const base = path.join(appDir, 'vs', 'code')
  const htmlFile = path.join(
    base,
    'electron-sandbox',
    'workbench',
    'workbench.html'
  )
  const BackupFilePath = (uuid: string) =>
    path.join(
      base,
      'electron-sandbox',
      'workbench',
      `workbench.${uuid}.bak-custom-css`
    )

  // #### Patching ##############################################################

  function clearExistingPatches(html: string) {
    html = html.replace(
      /<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/,
      ''
    )
    html = html.replace(
      /<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g,
      ''
    )
    return html
  }

  function reloadWindow() {
    // reload vscode-window
    vscode.commands.executeCommand('workbench.action.reloadWindow')
  }
  function enabledRestart() {
    vscode.window
      .showInformationMessage(msg.enabled, { title: msg.restartIde })
      .then(reloadWindow)
  }
  function disabledRestart() {
    vscode.window
      .showInformationMessage(msg.disabled, { title: msg.restartIde })
      .then(reloadWindow)
  }

  // ####  main commands ######################################################

  async function cmdInstall() {
    const uuidSession = v4()
    // await createBackup(uuidSession)
    {
      try {
        let html = await fs.promises.readFile(htmlFile, 'utf-8')
        html = clearExistingPatches(html)
        await fs.promises.writeFile(BackupFilePath(uuidSession), html, 'utf-8')
      } catch (e) {
        vscode.window.showInformationMessage(msg.admin)
        throw e
      }
    }
    // await performPatch(uuidSession)
    {
      let html = await fs.promises.readFile(htmlFile, 'utf-8')
      html = clearExistingPatches(html)

      html = html.replace(
        /<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/,
        ''
      )

      let indicatorJsPath
      let ext = vscode.extensions.getExtension('be5invis.vscode-custom-css')
      if (ext && ext.extensionPath) {
        indicatorJsPath = path.resolve(ext.extensionPath, 'src/statusbar.js')
      } else {
        indicatorJsPath = path.resolve(__dirname, 'statusbar.js')
      }
      const indicatorJsContent = await fs.promises.readFile(
        indicatorJsPath,
        'utf-8'
      )
      const indicatorJS = `<script>${indicatorJsContent}</script>`

      html = html.replace(
        /(<\/html>)/,
        `<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ${uuidSession} !! -->\n` +
          '<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n' +
          indicatorJS +
          '<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>'
      )
      try {
        await fs.promises.writeFile(htmlFile, html, 'utf-8')
      } catch (e) {
        vscode.window.showInformationMessage(msg.admin)
        disabledRestart()
      }
      enabledRestart()
    }
  }

  async function cmdReinstall() {
    await uninstallImpl()
    await cmdInstall()
  }

  async function cmdUninstall() {
    await uninstallImpl()
    disabledRestart()
  }

  async function uninstallImpl() {
    // if typescript wont won't freak out about promises then nothing matters :D
    // getBackupUuid
    const backupUuid = await (async function getBackupUuid() {
      try {
        const htmlContent = await fs.promises.readFile(htmlFile, 'utf-8')
        const m = htmlContent.match(
          /<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/
        )
        if (!m) throw new Error('no backup uuid found')
        else return m[1]
      } catch (e) {
        vscode.window.showInformationMessage(msg.somethingWrong + e)
        throw e
      }
    })()

    // restoreBackup
    const backupFilePath = BackupFilePath(backupUuid)
    {
      try {
        if (fs.existsSync(backupFilePath)) {
          await fs.promises.unlink(htmlFile)
          await fs.promises.copyFile(backupFilePath, htmlFile)
        }
      } catch (e) {
        vscode.window.showInformationMessage(msg.admin)
        throw e
      }
    }
    // deleteBackupFiles
    {
      const htmlDir = path.dirname(htmlFile)
      const htmlDirItems = await fs.promises.readdir(htmlDir)
      for (const item of htmlDirItems) {
        if (item.endsWith('.bak-custom-css')) {
          await fs.promises.unlink(path.join(htmlDir, item))
        }
      }
    }
  }
  const installCustomCSS = vscode.commands.registerCommand(
    'extension.installCustomCSS',
    cmdInstall
  )
  const uninstallCustomCSS = vscode.commands.registerCommand(
    'extension.uninstallCustomCSS',
    cmdUninstall
  )
  const updateCustomCSS = vscode.commands.registerCommand(
    'extension.updateCustomCSS',
    cmdReinstall
  )

  context.subscriptions.push(installCustomCSS)
  context.subscriptions.push(uninstallCustomCSS)
  context.subscriptions.push(updateCustomCSS)

  console.log('vscode-custom-css is active!')
  console.log('Application directory', appDir)
  console.log('Main HTML file', htmlFile)
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate
