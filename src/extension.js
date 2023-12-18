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
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var messages_1 = require("./messages");
var uuid_1 = require("uuid");
var node_fetch_1 = require("node-fetch");
var url_1 = require("url");
function activate(context) {
    var _a;
    if (!((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename)) {
        vscode.window.showErrorMessage(messages_1.default.internalError + 'no main filename');
        return;
    }
    var appDir = path.dirname(require.main.filename);
    var base = path.join(appDir, 'vs', 'code');
    var htmlFile = path.join(base, 'electron-sandbox', 'workbench', 'workbench.html');
    var BackupFilePath = function (uuid) {
        return path.join(base, 'electron-sandbox', 'workbench', "workbench.".concat(uuid, ".bak-custom-css"));
    };
    function getContent(url) {
        return __awaiter(this, void 0, void 0, function () {
            var fp, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^file:/.test(url)) return [3 /*break*/, 2];
                        fp = (0, url_1.fileURLToPath)(url);
                        return [4 /*yield*/, fs.promises.readFile(fp)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.buffer()];
                }
            });
        });
    }
    // ####  main commands ######################################################
    function cmdInstall() {
        return __awaiter(this, void 0, void 0, function () {
            var uuidSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uuidSession = (0, uuid_1.v4)();
                        return [4 /*yield*/, createBackup(uuidSession)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, performPatch(uuidSession)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function cmdReinstall() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, uninstallImpl()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, cmdInstall()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function cmdUninstall() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, uninstallImpl()];
                    case 1:
                        _a.sent();
                        disabledRestart();
                        return [2 /*return*/];
                }
            });
        });
    }
    function uninstallImpl() {
        return __awaiter(this, void 0, void 0, function () {
            var backupUuid, backupPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getBackupUuid(htmlFile)];
                    case 1:
                        backupUuid = _a.sent();
                        if (!backupUuid)
                            return [2 /*return*/];
                        backupPath = BackupFilePath(backupUuid);
                        return [4 /*yield*/, restoreBackup(backupPath)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, deleteBackupFiles()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    // #### Backup ################################################################
    function getBackupUuid(htmlFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var htmlContent, m, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.promises.readFile(htmlFilePath, 'utf-8')];
                    case 1:
                        htmlContent = _a.sent();
                        m = htmlContent.match(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/);
                        if (!m)
                            return [2 /*return*/, null];
                        else
                            return [2 /*return*/, m[1]];
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        vscode.window.showInformationMessage(messages_1.default.somethingWrong + e_1);
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    function createBackup(uuidSession) {
        return __awaiter(this, void 0, void 0, function () {
            var html, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fs.promises.readFile(htmlFile, 'utf-8')];
                    case 1:
                        html = _a.sent();
                        html = clearExistingPatches(html);
                        return [4 /*yield*/, fs.promises.writeFile(BackupFilePath(uuidSession), html, 'utf-8')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        vscode.window.showInformationMessage(messages_1.default.admin);
                        throw e_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function restoreBackup(backupFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!fs.existsSync(backupFilePath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.promises.unlink(htmlFile)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.promises.copyFile(backupFilePath, htmlFile)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        vscode.window.showInformationMessage(messages_1.default.admin);
                        throw e_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function deleteBackupFiles() {
        return __awaiter(this, void 0, void 0, function () {
            var htmlDir, htmlDirItems, _i, htmlDirItems_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        htmlDir = path.dirname(htmlFile);
                        return [4 /*yield*/, fs.promises.readdir(htmlDir)];
                    case 1:
                        htmlDirItems = _a.sent();
                        _i = 0, htmlDirItems_1 = htmlDirItems;
                        _a.label = 2;
                    case 2:
                        if (!(_i < htmlDirItems_1.length)) return [3 /*break*/, 5];
                        item = htmlDirItems_1[_i];
                        if (!item.endsWith('.bak-custom-css')) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.promises.unlink(path.join(htmlDir, item))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    // #### Patching ##############################################################
    function performPatch(uuidSession) {
        return __awaiter(this, void 0, void 0, function () {
            var config, html, injectHTML, indicatorJS, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('vscode_custom_css');
                        if (!patchIsProperlyConfigured(config)) {
                            return [2 /*return*/, vscode.window.showInformationMessage(messages_1.default.notConfigured)];
                        }
                        return [4 /*yield*/, fs.promises.readFile(htmlFile, 'utf-8')];
                    case 1:
                        html = _a.sent();
                        html = clearExistingPatches(html);
                        return [4 /*yield*/, patchHtml(config)];
                    case 2:
                        injectHTML = _a.sent();
                        html = html.replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '');
                        indicatorJS = '';
                        if (!config.statusbar) return [3 /*break*/, 4];
                        return [4 /*yield*/, getIndicatorJs()];
                    case 3:
                        indicatorJS = _a.sent();
                        _a.label = 4;
                    case 4:
                        html = html.replace(/(<\/html>)/, "<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ".concat(uuidSession, " !! -->\n") +
                            '<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n' +
                            indicatorJS +
                            injectHTML +
                            '<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>');
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, fs.promises.writeFile(htmlFile, html, 'utf-8')];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_4 = _a.sent();
                        vscode.window.showInformationMessage(messages_1.default.admin);
                        disabledRestart();
                        return [3 /*break*/, 8];
                    case 8:
                        enabledRestart();
                        return [2 /*return*/];
                }
            });
        });
    }
    function clearExistingPatches(html) {
        html = html.replace(/<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/, '');
        html = html.replace(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g, '');
        return html;
    }
    function patchIsProperlyConfigured(config) {
        return config && config.imports && config.imports instanceof Array;
    }
    function patchHtml(config) {
        return __awaiter(this, void 0, void 0, function () {
            var res, _i, _a, item, imp;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        res = '';
                        _i = 0, _a = config.imports;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        item = _a[_i];
                        return [4 /*yield*/, patchHtmlForItem(item)];
                    case 2:
                        imp = _b.sent();
                        if (imp)
                            res += imp;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, res];
                }
            });
        });
    }
    function patchHtmlForItem(url) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed, ext, fetched, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url)
                            return [2 /*return*/, ''];
                        if (typeof url !== 'string')
                            return [2 /*return*/, ''
                                // Copy the resource to a staging directory inside the extension dir
                            ];
                        parsed = new url_1.URL(url);
                        ext = path.extname(parsed.pathname);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getContent(url)];
                    case 2:
                        fetched = _a.sent();
                        if (ext === '.css') {
                            return [2 /*return*/, "<style>".concat(fetched, "</style>")];
                        }
                        else if (ext === '.js') {
                            return [2 /*return*/, "<script>".concat(fetched, "</script>")];
                        }
                        else {
                            console.log("Unsupported extension type: ".concat(ext));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        console.error(e_5);
                        vscode.window.showWarningMessage(messages_1.default.cannotLoad(url));
                        return [2 /*return*/, ''];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function getIndicatorJs() {
        return __awaiter(this, void 0, void 0, function () {
            var indicatorJsPath, ext, indicatorJsContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = vscode.extensions.getExtension('be5invis.vscode-custom-css');
                        if (ext && ext.extensionPath) {
                            indicatorJsPath = path.resolve(ext.extensionPath, 'src/statusbar.js');
                        }
                        else {
                            indicatorJsPath = path.resolve(__dirname, 'statusbar.js');
                        }
                        return [4 /*yield*/, fs.promises.readFile(indicatorJsPath, 'utf-8')];
                    case 1:
                        indicatorJsContent = _a.sent();
                        return [2 /*return*/, "<script>".concat(indicatorJsContent, "</script>")];
                }
            });
        });
    }
    function reloadWindow() {
        // reload vscode-window
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
    function enabledRestart() {
        vscode.window
            .showInformationMessage(messages_1.default.enabled, { title: messages_1.default.restartIde })
            .then(reloadWindow);
    }
    function disabledRestart() {
        vscode.window
            .showInformationMessage(messages_1.default.disabled, { title: messages_1.default.restartIde })
            .then(reloadWindow);
    }
    var installCustomCSS = vscode.commands.registerCommand('extension.installCustomCSS', cmdInstall);
    var uninstallCustomCSS = vscode.commands.registerCommand('extension.uninstallCustomCSS', cmdUninstall);
    var updateCustomCSS = vscode.commands.registerCommand('extension.updateCustomCSS', cmdReinstall);
    context.subscriptions.push(installCustomCSS);
    context.subscriptions.push(uninstallCustomCSS);
    context.subscriptions.push(updateCustomCSS);
    console.log('vscode-custom-css is active!');
    console.log('Application directory', appDir);
    console.log('Main HTML file', htmlFile);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
