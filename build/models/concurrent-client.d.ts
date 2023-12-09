/// <reference types="node" />
import { EventEmitter } from 'events';
import { IConfig, IConcurrentTransferInfo, ITransferProgress, ITransferStatus, IFile, IStats, ITransferType, IOptions } from '../interfaces';
import { Client, IClientBaseMethods, IClientEvents } from './client';
import { TaskManager } from './task-manager';
interface IConcurrentClientMethods extends IClientBaseMethods {
    /**Connects every client to the server.*/
    connect(config: IConfig): Promise<void>;
    /**Disconnects every client from the server.*/
    disconnect(): Promise<void>;
    /**Aborts a file transfer with specified id.*/
    abort(transferId: string): Promise<void>;
    /**Aborts every file transfer.*/
    abortAll(): Promise<void>;
    /**Downloads a remote file.*/
    download(remotePath: string, localPath: string): Promise<ITransferStatus>;
    /**Uploads a local file.*/
    upload(localPath: string, remotePath: string): Promise<ITransferStatus>;
}
export declare type IConcurrentClientEvents = 'abort-all' | 'new' | 'finished' | IClientEvents;
export declare interface ConcurrentClient {
    /**Emitted when every client has connected with a server.*/
    on(event: 'connected', listener: Function): this;
    /**Emitted when every client has disconnected from a server.*/
    on(event: 'disconnected', listener: Function): this;
    /**Emitted when `ConcurrentClient.abort` is called.*/
    on(event: 'abort', listener: (id: string) => void): this;
    /**Emitted when `ConcurrentClient.abortAll` is called.*/
    on(event: 'abort-all', listener: Function): this;
    /**Emitted when a new file transfer is requested.*/
    on(event: 'new', listener: (info: IConcurrentTransferInfo) => void): this;
    /**Emitted when a chunk of a file was read and sent.*/
    on(event: 'progress', listener: (progress: ITransferProgress, info: IConcurrentTransferInfo) => void): this;
    /**Emitted when a file transfer has finished or has been aborted.*/
    on(event: 'finished', listener: (info: IConcurrentTransferInfo) => void): this;
    once(event: 'connected', listener: Function): this;
    once(event: 'disconnected', listener: Function): this;
    once(event: 'abort', listener: (id: string) => void): this;
    once(event: 'abort-all', listener: Function): this;
    once(event: 'new', listener: (info: IConcurrentTransferInfo) => void): this;
    once(event: 'progress', listener: (progress: ITransferProgress, info: IConcurrentTransferInfo) => void): this;
    once(event: 'finished', listener: (info: IConcurrentTransferInfo) => void): this;
    addListener(event: IConcurrentClientEvents, listener: Function): this;
    removeListener(event: IConcurrentClientEvents, listener: Function): this;
    emit(event: IConcurrentClientEvents, ...args: any[]): boolean;
}
/**API to transfer files using queue, which you can speed up by setting the number of clients in the constructor. You can also use the same methods like in the `Client` class in concurrent to transfer, if you set `reserveClient` to true. */
export declare class ConcurrentClient extends EventEmitter implements IConcurrentClientMethods {
    maxClients: number;
    reserveClient: boolean;
    protected _clients: Client[];
    protected _tasks: TaskManager;
    protected _activeTransfers: Map<string, Client>;
    /**
     * @param maxClients - How many clients  you want to allocate for file transfer.
     * @param reserveClient - Allocate one client for general methods like `readDir`. This will substract one from `maxClients`, if its greater than 1.
     */
    constructor(maxClients?: number, reserveClient?: boolean);
    protected get _transferClients(): number;
    protected get _reservedClient(): Client;
    protected _callClientMethod(methodName: Extract<keyof Client, string>, ...args: any[]): any;
    protected _abortActiveTransfers(): Promise<void>;
    protected _handleConcurrentTransfer(type: ITransferType, localPath: string, remotePath: string): Promise<ITransferStatus>;
    connect(config: IConfig, options?: IOptions): Promise<void>;
    disconnect(): Promise<void>;
    abortAll(): Promise<void>;
    abort(transferId: string): Promise<void>;
    download: (remotePath: string, localPath: string) => Promise<ITransferStatus>;
    upload: (remotePath: string, localPath: string) => Promise<ITransferStatus>;
    readDir: (path?: string) => Promise<IFile[]>;
    size: (path: string) => Promise<number>;
    move: (srcPath: string, destPath: string) => Promise<void>;
    stat: (path: string) => Promise<IStats>;
    unlink: (path: string) => Promise<void>;
    rimraf: (path: string) => Promise<void>;
    delete: (path: string) => Promise<void>;
    mkdir: (path: string) => Promise<void>;
    pwd: () => Promise<string>;
    exists: (path: string) => Promise<boolean>;
    send: (command: string) => Promise<string>;
    touch: (path: string) => Promise<void>;
    createBlank: (type: "file" | "folder", path?: string, files?: IFile[]) => Promise<string>;
}
export {};
