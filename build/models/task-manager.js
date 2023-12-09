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
const utils_1 = require("../utils");
class TaskManager extends events_1.EventEmitter {
    constructor(threads = 1) {
        super();
        this.threads = threads;
        this._queue = [];
        this._usedThreads = 0;
        this._indexies = [];
        this._indexies.length = threads;
    }
    handle(f, id, data) {
        return new Promise((resolve, reject) => {
            const _id = id || utils_1.makeId(32);
            this._queue.push({ id: _id, cb: f, status: 'pending', data });
            const completeEvent = `complete-${_id}`;
            const abortEvent = `abort-${_id}`;
            const onComplete = ({ data, error }) => {
                this.removeListener(abortEvent, onAbort);
                if (error)
                    return reject(error);
                resolve(data);
            };
            const onAbort = () => {
                this.removeListener(completeEvent, onComplete);
                resolve();
            };
            this.once(completeEvent, onComplete);
            this.once(abortEvent, onAbort);
            if (this.available) {
                this._process(_id);
            }
        });
    }
    get available() {
        return this._usedThreads < this.threads;
    }
    _process(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const _task = typeof task === 'string' ? this._queue.find(r => r.id === task) : task;
            const index = this._reserve();
            switch (_task.status) {
                case 'busy': throw new Error('Task is already executed!');
                case 'finished': throw new Error('Task is already finished!');
                case 'deleted': throw new Error('Task is deleted!');
            }
            this._usedThreads++;
            _task.status = 'busy';
            const res = yield utils_1.safeExec(_task.cb, _task.id, index);
            this._usedThreads--;
            this._free(index);
            _task.status = 'finished';
            this.emit(`complete-${_task.id}`, res);
            this._next();
        });
    }
    _next() {
        const task = this._queue.find(r => r.status === 'pending');
        if (task) {
            this._process(task);
        }
        else if (this._usedThreads === 0) {
            this._clearQueue();
        }
    }
    _clearQueue() {
        this._queue = [];
    }
    delete(taskId) {
        const task = this._queue.find(r => r.id === taskId);
        switch (task.status) {
            case 'busy': throw new Error('Cannot delete task while it\'s executing!');
            case 'finished': throw new Error('Cannot delete finished task!');
            case 'deleted': throw new Error('Cannot delete removed task!');
        }
        task.status = 'deleted';
    }
    deleteAll(filter) {
        this._queue.forEach(r => {
            if (r.status === 'pending') {
                if (!filter || filter(r)) {
                    r.status = 'deleted';
                    this.emit(`abort-${r.id}`);
                }
            }
        });
    }
    _reserve() {
        const index = this._indexies.findIndex(r => !r);
        if (index === -1) {
            throw new Error();
        }
        this._indexies[index] = true;
        return index;
    }
    _free(index) {
        this._indexies[index] = false;
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=task-manager.js.map