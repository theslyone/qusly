/// <reference types="node" />
import { EventEmitter } from 'events';
import { ITask, ITaskCallback, ITaskFilter } from '../interfaces';
export declare class TaskManager extends EventEmitter {
    threads: number;
    protected _queue: ITask[];
    protected _usedThreads: number;
    protected _indexies: boolean[];
    constructor(threads?: number);
    handle<T>(f: ITaskCallback, id?: string, data?: any): Promise<T>;
    get available(): boolean;
    protected _process(task: string | ITask): Promise<void>;
    protected _next(): void;
    protected _clearQueue(): void;
    delete(taskId: string): void;
    deleteAll(filter?: ITaskFilter): void;
    protected _reserve(): number;
    protected _free(index: number): void;
}
