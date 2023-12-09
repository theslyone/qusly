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
const events_1 = require("events");
const ssh2_1 = require("ssh2");
const fs_1 = require("fs");
class SftpClient extends events_1.EventEmitter {
    constructor(_client) {
        super();
        this._client = _client;
    }
    get socket() {
        return this._ssh._sock;
    }
    connect(config, options) {
        return new Promise((resolve, reject) => {
            var _a;
            this._ssh = new ssh2_1.Client();
            if (options === null || options === void 0 ? void 0 : options.tryKeyboard) {
                this._ssh.once('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
                    finish([config.password]);
                });
            }
            this._ssh.once('error', e => {
                this._ssh.removeAllListeners();
                reject(e);
            });
            this._ssh.once('ready', () => {
                this._ssh.removeAllListeners();
                this._ssh.sftp((err, sftp) => {
                    if (err)
                        return reject(err);
                    this._wrapper = sftp;
                    resolve(true);
                });
            });
            this._ssh.connect({
                username: config.user,
                host: config.host,
                port: config.port,
                // ...config, 
                privateKey: (_a = options === null || options === void 0 ? void 0 : options.privateKey) !== null && _a !== void 0 ? _a : fs_1.readFileSync(options === null || options === void 0 ? void 0 : options.privateKeyPath)
            });
        });
    }
    disconnect() {
        return new Promise(resolve => {
            this.socket.addListener('close', () => {
                this._wrapper = null;
                this._ssh = null;
                resolve(true);
            });
            this._ssh.end();
        });
    }
    size(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.stat(path, (err, stats) => {
                if (err)
                    return reject(err);
                resolve(stats.size);
            });
        });
    }
    send(command) {
        return new Promise((resolve, reject) => {
            this._ssh.exec(command, (err, stream) => {
                if (err)
                    return reject(err);
                let data = '';
                stream.once('error', (err) => {
                    stream.close();
                    reject(err);
                });
                stream.on('data', chunk => {
                    data += chunk;
                });
                stream.once('close', () => {
                    stream.close();
                    resolve(data);
                });
            });
        });
    }
    move(src, dest) {
        return new Promise((resolve, reject) => {
            this._wrapper.rename(src, dest, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
    unlink(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.unlink(path, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
    removeDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this.readDir(path);
            if (files.length) {
                for (const file of files) {
                    const filePath = path + '/' + file.filename;
                    if (file.attrs.isDirectory()) {
                        yield this.removeDir(filePath);
                    }
                    else {
                        yield this.unlink(filePath);
                    }
                }
            }
            yield this.removeEmptyDir(path);
        });
    }
    removeEmptyDir(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.rmdir(path, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
    mkdir(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.mkdir(path, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
    pwd() {
        return new Promise((resolve, reject) => {
            this._wrapper.realpath('./', (err, path) => {
                if (err)
                    return reject(err);
                resolve(path);
            });
        });
    }
    readDir(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.readdir(path, (err, files) => {
                if (err)
                    return reject(err);
                resolve(files);
            });
        });
    }
    createReadStream(path, start = 0) {
        return this._wrapper.createReadStream(path, { start, autoClose: true });
    }
    createWriteStream(path) {
        return this._wrapper.createWriteStream(path);
    }
    stat(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.stat(path, (err, stats) => {
                if (err)
                    return reject(err);
                resolve(stats);
            });
        });
    }
    touch(path) {
        return new Promise((resolve, reject) => {
            this._wrapper.open(path, 'w', (err, handle) => {
                if (err)
                    return reject(err);
                this._wrapper.close(handle, err => {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            });
        });
    }
    download(path, dest, startAt) {
        return new Promise((resolve, reject) => {
            const source = this.createReadStream(path, startAt);
            this._client.once('disconnected', resolve);
            source.on('data', chunk => {
                this.emit('progress', chunk);
            });
            source.once('error', err => {
                this._client.removeListener('disconnected', resolve);
                reject(err);
            });
            source.once('close', () => {
                this._client.removeListener('disconnected', resolve);
                resolve(true);
            });
            source.pipe(dest);
        });
    }
    upload(path, source) {
        return new Promise((resolve, reject) => {
            const dest = this.createWriteStream(path);
            this._client.once('disconnected', resolve);
            source.on('data', chunk => {
                this.emit('progress', chunk);
            });
            dest.once('error', err => {
                this._client.removeListener('disconnected', resolve);
                reject(err);
            });
            dest.once('close', () => {
                this._client.removeListener('disconnected', resolve);
                resolve(true);
            });
            source.pipe(dest);
        });
    }
}
exports.SftpClient = SftpClient;
//# sourceMappingURL=sftp-client.js.map