"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.uninstallImpl = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const messages_1 = __importDefault(require("./messages"));
const uuid_1 = require("uuid");
function getWorkBenchHtmlData() {
    if (!require.main?.filename) {
        vscode.window.showErrorMessage(messages_1.default.internalError + 'no main filename');
        throw new Error('no main filename');
    }
    const appDir = path.dirname(require.main.filename);
    const base = path.join(appDir, 'vs', 'code');
    const workbenchPath = path.join(base, 'electron-sandbox', 'workbench', 'workbench.html');
    const getBackupPath = (uuid) => path.join(base, 'electron-sandbox', 'workbench', `workbench.${uuid}.bak-custom-css`);
    return { path: workbenchPath, getBackupPath };
}
async function installImpl() {
    const file = getWorkBenchHtmlData();
    const backupUuid = await getBackupUuid(file.path).catch((e) => console.error(e));
    if (backupUuid) {
        console.log('vscode-custom-css is active!');
        return;
    }
    const uuidSession = (0, uuid_1.v4)();
    // await createBackup(uuidSession)
    {
        try {
            const html = await fs.promises
                .readFile(file.path, 'utf-8')
                .then(clearExistingPatches);
            await fs.promises.writeFile(file.getBackupPath(uuidSession), html, 'utf-8');
        }
        catch (e) {
            vscode.window.showInformationMessage(messages_1.default.admin);
            throw e;
        }
    }
    // await performPatch(uuidSession)
    {
        let indicatorJsPath;
        let ext = vscode.extensions.getExtension('be5invis.vscode-custom-css');
        if (ext && ext.extensionPath) {
            indicatorJsPath = path.resolve(ext.extensionPath, 'src/statusbar.js');
        }
        else {
            indicatorJsPath = path.resolve(__dirname, 'statusbar.js');
        }
        const indicatorJsContent = await fs.promises.readFile(indicatorJsPath, 'utf-8');
        const indicatorJS = `<script>${indicatorJsContent}</script>`;
        // prettier-ignore
        const html = (await fs.promises
            .readFile(file.path, 'utf-8')
            .then(clearExistingPatches))
            .replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')
            .replace(/(<\/html>)/, `<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ${uuidSession} !! -->\n` +
            '<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n' +
            indicatorJS +
            '<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>');
        try {
            await fs.promises.writeFile(file.path, html, 'utf-8');
        }
        catch (e) {
            vscode.window.showInformationMessage(messages_1.default.admin);
            disabledRestart();
        }
        // enabledRestart()
        vscode.window
            .showInformationMessage(messages_1.default.enabled, { title: messages_1.default.restartIde })
            .then(reloadWindow);
    }
    console.log('vscode-custom-css is active!');
}
function clearExistingPatches(html) {
    return html
        .replace(/<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/, '')
        .replace(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g, '');
}
async function getBackupUuid(path) {
    try {
        const uid = (await fs.promises.readFile(path, 'utf-8')) //
            .match(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/);
        if (!uid)
            throw new Error('no backup uuid found');
        else
            return uid[1];
    }
    catch (e) {
        vscode.window.showInformationMessage(messages_1.default.somethingWrong + e);
        throw e;
    }
}
async function uninstallImpl() {
    const file = getWorkBenchHtmlData();
    // if typescript wont won't freak out about promises then nothing matters :D
    // getBackupUuid
    const backupUuid = await getBackupUuid(file.path);
    // restoreBackup
    const backupFilePath = file.getBackupPath(backupUuid);
    {
        try {
            if (fs.existsSync(backupFilePath)) {
                await fs.promises.unlink(file.path);
                await fs.promises.copyFile(backupFilePath, file.path);
            }
        }
        catch (e) {
            vscode.window.showInformationMessage(messages_1.default.admin);
            throw e;
        }
    }
    // deleteBackupFiles
    {
        const htmlDir = path.dirname(file.path);
        const htmlDirItems = await fs.promises.readdir(htmlDir);
        for (const item of htmlDirItems) {
            if (item.endsWith('.bak-custom-css')) {
                await fs.promises.unlink(path.join(htmlDir, item));
            }
        }
    }
    disabledRestart();
}
exports.uninstallImpl = uninstallImpl;
function reloadWindow() {
    // reload vscode-window
    vscode.commands.executeCommand('workbench.action.reloadWindow');
}
function disabledRestart() {
    vscode.window
        .showInformationMessage(messages_1.default.disabled, { title: messages_1.default.restartIde })
        .then(reloadWindow);
}
function _catch(e) {
    console.error(e);
}
// how do you make javascript freak out about promises/errors?
// export function deactivate() {
//   return uninstallImpl().catch(_catch)
// }
function activate(context) {
    return installImpl().catch(_catch);
}
exports.activate = activate;
