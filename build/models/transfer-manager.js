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
const utils_1 = require("../utils");
class TransferManager {
    constructor(_client) {
        this._client = _client;
        this.buffered = 0;
        this._onDisconnect = () => {
            this._status = 'aborted';
            const { stream } = this._data;
            if (!this._client.isSftp) {
                stream.destroy();
            }
        };
        this._onSftpProgress = (chunk) => {
            this.buffered += chunk.length;
            this._onProgress();
        };
    }
    download(remotePath, dest, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const localPath = utils_1.getFilePath(dest);
            const size = yield this._getFileSize(remotePath, options);
            return this._handleTransfer({
                info: {
                    type: 'download',
                    remotePath,
                    localPath,
                },
                stream: dest,
                options,
                size,
            });
        });
    }
    upload(remotePath, source, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const localPath = utils_1.getFilePath(source);
            const size = yield utils_1.getFileSize(source);
            return this._handleTransfer({
                info: {
                    type: 'upload',
                    remotePath,
                    localPath,
                },
                stream: source,
                options,
                size,
            });
        });
    }
    _handleTransfer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, options, stream } = data;
            const { type, remotePath } = info;
            this._data = data;
            this._prepare();
            try {
                switch (type) {
                    case 'download': {
                        if (this._client.isSftp) {
                            yield this._client._sftpClient.download(remotePath, stream, options.startAt);
                        }
                        else {
                            yield this._client._ftpClient.downloadTo(stream, remotePath, options.startAt);
                        }
                        break;
                    }
                    case 'upload': {
                        if (this._client.isSftp) {
                            yield this._client._sftpClient.upload(remotePath, stream);
                        }
                        else {
                            yield this._client._ftpClient.uploadFrom(stream, remotePath);
                        }
                        break;
                    }
                }
                if (!this._status) {
                    this._status = 'finished';
                }
            }
            catch (err) {
                if (err.message !== 'User closed client during task') {
                    this._status = 'closed';
                    throw err;
                }
            }
            this._clean();
            return this._status;
        });
    }
    _prepare() {
        this.buffered = 0;
        this._status = null;
        this._data.info = Object.assign(Object.assign({}, this._data.info), { startAt: new Date(), context: this._client });
        this._client.once('disconnected', this._onDisconnect);
        if (this._client.isSftp) {
            this._client._sftpClient.addListener('progress', this._onSftpProgress);
        }
        else {
            this._client._ftpClient.trackProgress(info => {
                this.buffered = info.bytes;
                this._onProgress();
            });
        }
    }
    _clean() {
        if (this._client.isSftp) {
            this._client._sftpClient.removeListener('progress', this._onSftpProgress);
        }
        else {
            this._client._ftpClient.trackProgress(undefined);
        }
        this._client.removeListener('disconnected', this._onDisconnect);
        this._data = undefined;
    }
    _onProgress() {
        const { info, options, size } = this._data;
        const { startAt } = info;
        if (!options.quiet) {
            const elapsed = utils_1.calcElapsed(startAt.getTime());
            const speed = this.buffered / elapsed; // bytes per second
            const eta = utils_1.calcEta(elapsed, this.buffered, size); // seconds
            const percent = Math.round(this.buffered / size * 100);
            const progress = {
                buffered: this.buffered,
                speed,
                percent,
                eta,
                size,
            };
            this._client.emit('progress', progress, info);
        }
    }
    _getFileSize(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let size = yield (this._client.isSftp ? this._client._sftpClient.size(path) : this._client._ftpClient.size(path));
            if (options && options.startAt) {
                size -= options.startAt;
            }
            return size;
        });
    }
}
exports.TransferManager = TransferManager;
//# sourceMappingURL=transfer-manager.js.map