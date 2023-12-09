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
const fs_1 = require("fs");
const client_1 = require("./client");
const task_manager_1 = require("./task-manager");
const utils_1 = require("../utils");
/**API to transfer files using queue, which you can speed up by setting the number of clients in the constructor. You can also use the same methods like in the `Client` class in concurrent to transfer, if you set `reserveClient` to true. */
class ConcurrentClient extends events_1.EventEmitter {
    /**
     * @param maxClients - How many clients  you want to allocate for file transfer.
     * @param reserveClient - Allocate one client for general methods like `readDir`. This will substract one from `maxClients`, if its greater than 1.
     */
    constructor(maxClients = 1, reserveClient = false) {
        super();
        this.maxClients = maxClients;
        this.reserveClient = reserveClient;
        this._clients = [];
        this._activeTransfers = new Map();
        this.download = (remotePath, localPath) => this._handleConcurrentTransfer('download', localPath, remotePath);
        this.upload = (remotePath, localPath) => this._handleConcurrentTransfer('upload', localPath, remotePath);
        this.readDir = (path) => this._callClientMethod('readDir', path);
        this.size = (path) => this._callClientMethod('size', path);
        this.move = (srcPath, destPath) => this._callClientMethod('move', srcPath, destPath);
        this.stat = (path) => this._callClientMethod('stat', path);
        this.unlink = (path) => this._callClientMethod('unlink', path);
        this.rimraf = (path) => this._callClientMethod('rimraf', path);
        this.delete = (path) => this._callClientMethod('delete', path);
        this.mkdir = (path) => this._callClientMethod('mkdir', path);
        this.pwd = () => this._callClientMethod('pwd');
        this.exists = (path) => this._callClientMethod('exists', path);
        this.send = (command) => this._callClientMethod('send', command);
        this.touch = (path) => this._callClientMethod('touch', path);
        this.createBlank = (type, path, files) => this._callClientMethod('createBlank', type, path, files);
        this._tasks = new task_manager_1.TaskManager(this._transferClients);
    }
    get _transferClients() {
        return this.reserveClient
            ? Math.max(1, this.maxClients - 1)
            : this.maxClients;
    }
    get _reservedClient() {
        return this.reserveClient && this._transferClients > 1
            ? this._clients[this._clients.length - 1]
            : null;
    }
    _callClientMethod(methodName, ...args) {
        if (this._reservedClient) {
            return this._reservedClient[methodName](...args);
        }
        return this._tasks.handle((_, taskIndex) => {
            return this._clients[taskIndex][methodName](...args);
        });
    }
    _abortActiveTransfers() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this._activeTransfers.forEach(r => {
                promises.push(r.abort());
            });
            yield Promise.all(promises);
        });
    }
    _handleConcurrentTransfer(type, localPath, remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = {
                id: utils_1.makeId(32),
                type,
                status: 'pending',
                localPath,
                remotePath,
            };
            this.emit('new', info);
            const status = yield this._tasks.handle((_, taskIndex) => {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    let status;
                    const client = this._clients[taskIndex];
                    this._activeTransfers.set(info.id, client);
                    yield utils_1.ensureExists(localPath);
                    const onProgress = (progress) => {
                        if (status !== 'aborted') {
                            this.emit('progress', progress, Object.assign(Object.assign({}, info), { status: 'transfering' }));
                        }
                    };
                    const onAbort = () => {
                        status = 'aborted';
                        client.once('connected', () => {
                            resolve('aborted');
                        });
                    };
                    client.addListener('progress', onProgress);
                    client.once('abort', onAbort);
                    if (type === 'download') {
                        status = yield client.download(remotePath, fs_1.createWriteStream(localPath));
                    }
                    else if (type === 'upload') {
                        status = yield client.upload(remotePath, fs_1.createReadStream(localPath));
                    }
                    client.removeListener('progress', onProgress);
                    this._activeTransfers.delete(info.id);
                    this.emit('finished', Object.assign(Object.assign({}, info), { status }));
                    if (status !== 'aborted') {
                        client.removeListener('abort', onAbort);
                        resolve(status);
                    }
                }));
            }, info.id, 'transfer');
            return status || 'aborted';
        });
    }
    connect(config, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = [];
            for (let i = 0; i < this.maxClients; i++) {
                this._clients[i] = new client_1.Client();
                promises.push(this._clients[i].connect(config, options));
            }
            yield Promise.all(promises);
            this.emit('connected');
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this._clients.map(r => r.disconnect()));
            this.emit('disconnected');
        });
    }
    abortAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit('abort-all');
            this._tasks.deleteAll(r => r.data === 'transfer');
            yield this._abortActiveTransfers();
        });
    }
    abort(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit('abort');
            const client = this._activeTransfers.get(transferId);
            yield client.abort();
        });
    }
}
exports.ConcurrentClient = ConcurrentClient;
//# sourceMappingURL=concurrent-client.js.map