"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.uninstallImpl = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var messages_1 = require("./messages");
var uuid_1 = require("uuid");
function getWorkBenchHtmlData() {
    var _a;
    if (!((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename)) {
        vscode.window.showErrorMessage(messages_1.default.internalError + 'no main filename');
        throw new Error('no main filename');
    }
    var appDir = path.dirname(require.main.filename);
    var base = path.join(appDir, 'vs', 'code');
    var workbenchPath = path.join(base, 'electron-sandbox', 'workbench', 'workbench.html');
    var getBackupPath = function (uuid) {
        return path.join(base, 'electron-sandbox', 'workbench', "workbench.".concat(uuid, ".bak-custom-css"));
    };
    return { path: workbenchPath, getBackupPath: getBackupPath };
}
function installImpl() {
    return __awaiter(this, void 0, void 0, function () {
        var file, backupUuid, uuidSession, html, e_1, indicatorJsPath, ext, indicatorJsContent, indicatorJS, html, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = getWorkBenchHtmlData();
                    return [4 /*yield*/, getBackupUuid(file.path).catch(function (e) {
                            return console.error(e);
                        })];
                case 1:
                    backupUuid = _a.sent();
                    if (backupUuid) {
                        console.log('vscode-custom-css is active!');
                        return [2 /*return*/];
                    }
                    uuidSession = (0, uuid_1.v4)();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fs.promises
                            .readFile(file.path, 'utf-8')
                            .then(clearExistingPatches)];
                case 3:
                    html = _a.sent();
                    return [4 /*yield*/, fs.promises.writeFile(file.getBackupPath(uuidSession), html, 'utf-8')];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    vscode.window.showInformationMessage(messages_1.default.admin);
                    throw e_1;
                case 6:
                    indicatorJsPath = void 0;
                    ext = vscode.extensions.getExtension('be5invis.vscode-custom-css');
                    if (ext && ext.extensionPath) {
                        indicatorJsPath = path.resolve(ext.extensionPath, 'src/statusbar.js');
                    }
                    else {
                        indicatorJsPath = path.resolve(__dirname, 'statusbar.js');
                    }
                    return [4 /*yield*/, fs.promises.readFile(indicatorJsPath, 'utf-8')];
                case 7:
                    indicatorJsContent = _a.sent();
                    indicatorJS = "<script>".concat(indicatorJsContent, "</script>");
                    return [4 /*yield*/, fs.promises
                            .readFile(file.path, 'utf-8')
                            .then(clearExistingPatches)];
                case 8:
                    html = (_a.sent())
                        .replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')
                        .replace(/(<\/html>)/, "<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ".concat(uuidSession, " !! -->\n") +
                        '<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n' +
                        indicatorJS +
                        '<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>');
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, fs.promises.writeFile(file.path, html, 'utf-8')];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    e_2 = _a.sent();
                    vscode.window.showInformationMessage(messages_1.default.admin);
                    disabledRestart();
                    return [3 /*break*/, 12];
                case 12:
                    // enabledRestart()
                    vscode.window
                        .showInformationMessage(messages_1.default.enabled, { title: messages_1.default.restartIde })
                        .then(reloadWindow);
                    console.log('vscode-custom-css is active!');
                    return [2 /*return*/];
            }
        });
    });
}
function clearExistingPatches(html) {
    return html
        .replace(/<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/, '')
        .replace(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g, '');
}
function getBackupUuid(path) {
    return __awaiter(this, void 0, void 0, function () {
        var uid, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.promises.readFile(path, 'utf-8')];
                case 1:
                    uid = (_a.sent()) //
                        .match(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/);
                    if (!uid)
                        throw new Error('no backup uuid found');
                    else
                        return [2 /*return*/, uid[1]];
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    vscode.window.showInformationMessage(messages_1.default.somethingWrong + e_3);
                    throw e_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function uninstallImpl() {
    return __awaiter(this, void 0, void 0, function () {
        var file, backupUuid, backupFilePath, e_4, htmlDir, htmlDirItems, _i, htmlDirItems_1, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = getWorkBenchHtmlData();
                    return [4 /*yield*/, getBackupUuid(file.path)
                        // restoreBackup
                    ];
                case 1:
                    backupUuid = _a.sent();
                    backupFilePath = file.getBackupPath(backupUuid);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    if (!fs.existsSync(backupFilePath)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs.promises.unlink(file.path)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs.promises.copyFile(backupFilePath, file.path)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_4 = _a.sent();
                    vscode.window.showInformationMessage(messages_1.default.admin);
                    throw e_4;
                case 7:
                    htmlDir = path.dirname(file.path);
                    return [4 /*yield*/, fs.promises.readdir(htmlDir)];
                case 8:
                    htmlDirItems = _a.sent();
                    _i = 0, htmlDirItems_1 = htmlDirItems;
                    _a.label = 9;
                case 9:
                    if (!(_i < htmlDirItems_1.length)) return [3 /*break*/, 12];
                    item = htmlDirItems_1[_i];
                    if (!item.endsWith('.bak-custom-css')) return [3 /*break*/, 11];
                    return [4 /*yield*/, fs.promises.unlink(path.join(htmlDir, item))];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    disabledRestart();
                    return [2 /*return*/];
            }
        });
    });
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
