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
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const events_1 = require("events");
const basic_ftp_1 = require("basic-ftp");
const utils_1 = require("../utils");
const task_manager_1 = require("./task-manager");
const sftp_client_1 = require("./sftp-client");
const transfer_manager_1 = require("./transfer-manager");
const constants_1 = require("../constants");
/**API to interact with both FTP and SFTP servers.*/
class Client extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.connected = false;
        this._tasks = new task_manager_1.TaskManager();
        this._transfer = new transfer_manager_1.TransferManager(this);
    }
    connect(config, options = constants_1.DEFAULT_OPTIONS) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.options = options;
            this.connected = false;
            if (!this.config.port) {
                this.config.port = this.config.protocol === 'sftp' ? 22 : 21;
            }
            if (this.isSftp) {
                this._sftpClient = new sftp_client_1.SftpClient(this);
                yield this._sftpClient.connect(config, options === null || options === void 0 ? void 0 : options.sftp);
            }
            else {
                this._ftpClient = new basic_ftp_1.Client();
                const ftps = config.protocol === 'ftps';
                yield this._ftpClient.access(Object.assign({ secure: ftps, secureOptions: ftps ? null : (_a = options === null || options === void 0 ? void 0 : options.ftps) === null || _a === void 0 ? void 0 : _a.secureOptions }, config));
            }
            this.connected = true;
            this.emit('connected', this);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected)
                return;
            this.connected = false;
            if (this.isSftp) {
                yield this._sftpClient.disconnect();
            }
            else {
                this._ftpClient.close();
                this._ftpClient = undefined;
            }
            this.emit('disconnected', this);
        });
    }
    abort() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit('abort', this);
            yield this.disconnect();
            yield this.connect(this.config, this.options);
        });
    }
    download(remotePath, dest, options) {
        return this._tasks.handle(() => {
            return this._transfer.download(remotePath, dest, options);
        });
    }
    upload(remotePath, source, options) {
        return this._tasks.handle(() => {
            return this._transfer.upload(remotePath, source, options);
        });
    }
    readDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._tasks.handle(() => __awaiter(this, void 0, void 0, function* () {
                if (this.isSftp) {
                    const list = yield this._sftpClient.readDir(path || './');
                    return list.map(file => {
                        return utils_1.formatSftpFile(basic_ftp_1.parseList(file.longname)[0], file);
                    });
                }
                else {
                    const list = yield this._ftpClient.list(path);
                    return list.map(file => utils_1.formatFtpFile(file));
                }
            }));
        });
    }
    size(path) {
        return this._tasks.handle(() => {
            if (this.isSftp) {
                return this._sftpClient.size(path);
            }
            return this._ftpClient.size(path);
        });
    }
    move(srcPath, destPath) {
        return this._tasks.handle(() => {
            if (this.isSftp) {
                return this._sftpClient.move(srcPath, destPath);
            }
            return this._ftpClient.rename(srcPath, destPath);
        });
    }
    stat(path) {
        return this._tasks.handle(() => __awaiter(this, void 0, void 0, function* () {
            if (this.isSftp) {
                const stats = yield this._sftpClient.stat(path);
                const type = utils_1.getFileTypeFromStats(stats);
                return { type, size: stats.size };
            }
            else {
                const list = yield this._ftpClient.list(path);
                const file = list[0];
                const type = utils_1.getFileType(file.type);
                return { type, size: file.size };
            }
        }));
    }
    unlink(path) {
        return this._tasks.handle(() => {
            if (this.isSftp) {
                return this._sftpClient.unlink(path);
            }
            return this._ftpClient.remove(path);
        });
    }
    rimraf(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._tasks.handle(() => {
                if (this.isSftp) {
                    return this._sftpClient.removeDir(path);
                }
                return this._ftpClient.removeDir(path);
            });
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type } = yield this.stat(path);
            if (type === 'folder') {
                return this.rimraf(path);
            }
            return this.unlink(path);
        });
    }
    mkdir(path) {
        return this._tasks.handle(() => {
            if (this.isSftp) {
                return this._sftpClient.mkdir(path);
            }
            return this._ftpClient.send('MKD ' + path);
        });
    }
    pwd() {
        return this._tasks.handle(() => {
            if (this.isSftp) {
                return this._sftpClient.pwd();
            }
            return this._ftpClient.pwd();
        });
    }
    exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isSftp) {
                    yield this._sftpClient.stat(path);
                }
                else {
                    yield this._ftpClient.rename(path, path);
                }
            }
            catch (err) {
                return false;
            }
            return true;
        });
    }
    send(command) {
        return this._tasks.handle(() => __awaiter(this, void 0, void 0, function* () {
            if (this.isSftp) {
                return this._sftpClient.send(command);
            }
            else {
                const { message } = yield this._ftpClient.send(command);
                return message;
            }
        }));
    }
    touch(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSftp) {
                return this._tasks.handle(() => {
                    return this._sftpClient.touch(path);
                });
            }
            const source = new stream_1.Readable({ read() { } });
            source.push(null);
            yield this.upload(path, source, { quiet: true });
        });
    }
    createBlank(type, path = './', files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files) {
                files = yield this.readDir(path);
            }
            const fileName = utils_1.createFileName(files, `new ${type}`);
            const filePath = `${path}/${fileName}`;
            if (type === 'folder') {
                yield this.mkdir(filePath);
            }
            else {
                yield this.touch(filePath);
            }
            return fileName;
        });
    }
    get protocol() {
        return this.config ? this.config.protocol : null;
    }
    get isSftp() {
        return this.protocol === 'sftp';
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map