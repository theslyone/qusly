/// <reference types="node" />
import { Writable, Readable } from 'stream';
import { EventEmitter } from 'events';
import { Client as FtpClient } from 'basic-ftp';
import { IConfig, IProtocol, IFile, IStats, ITransferOptions, ITransferInfo, ITransferProgress, ITransferStatus, IOptions } from '../interfaces';
import { TaskManager } from './task-manager';
import { SftpClient } from './sftp-client';
import { TransferManager } from './transfer-manager';
export interface IClientBaseMethods {
    /**Connects to a server.*/
    connect(config: IConfig): Promise<void>;
    /**Disconnects from the server. Closes all opened sockets and streams.*/
    disconnect(): Promise<void>;
    /**Lists files and folders in specified directory.*/
    readDir(path?: string): Promise<IFile[]>;
    /**Returns the size of a file.*/
    size(path: string): Promise<number>;
    /**Moves a file.*/
    move(srcPath: string, destPath: string): Promise<void>;
    /**Returns details about a file*/
    stat(path: string): Promise<IStats>;
    /**Removes a file.*/
    unlink(path: string): Promise<void>;
    /**Removes a folder and all of its content.*/
    rimraf(path: string): Promise<void>;
    /**Removes any file and folder. */
    delete(path: string): Promise<void>;
    /**Creates a new folder. */
    mkdir(path: string): Promise<void>;
    /**Returns path of the current working directory.*/
    pwd(): Promise<string>;
    /**Checks if a file exists. */
    exists(path: string): Promise<boolean>;
    /**Sends a raw command. Output depends on protocol and server support!*/
    send(command: string): Promise<string>;
    /**Creates an empty file. */
    touch(path: string): Promise<void>;
    /**Creates an empty file or folder with unique name and returns the name.
     * If you don't provide the `files` argument, it will list the directory. */
    createBlank(type: 'folder' | 'file', path: string, files?: IFile[]): Promise<string>;
}
interface IClientMethods extends IClientBaseMethods {
    /**Aborts the current file transfer by reconnecting with the server.*/
    abort(): Promise<void>;
    /**Downloads a remote file and and pipes it to a writable stream.*/
    download(path: string, dest: Writable, options?: ITransferOptions): Promise<ITransferStatus>;
    /**Uploads a local file from readable stream.*/
    upload(path: string, source: Readable, options?: ITransferOptions): Promise<ITransferStatus>;
}
export declare type IClientEvents = 'connected' | 'disconnected' | 'abort' | 'progress';
export declare interface Client {
    /**Emitted when the client has connected with a server.*/
    on(event: 'connected', listener: (context: Client) => void): this;
    /**Emitted when the client has disconnected from a server.*/
    on(event: 'disconnected', listener: (context: Client) => void): this;
    /**Emitted when `Client.abort` is called.*/
    on(event: 'abort', listener: (context: Client) => void): this;
    /**Emitted when a chunk of a file was read and sent.*/
    on(event: 'progress', listener: (progress: ITransferProgress, info: ITransferInfo) => void): this;
    once(event: 'connected', listener: (context: Client) => void): this;
    once(event: 'disconnected', listener: (context: Client) => void): this;
    once(event: 'progress', listener: (progress: ITransferProgress, info: ITransferInfo) => void): this;
    once(event: 'abort', listener: (context: Client) => void): this;
    addListener(event: IClientEvents, listener: Function): this;
    removeListener(event: IClientEvents, listener: Function): this;
    emit(event: IClientEvents, ...args: any[]): boolean;
}
/**API to interact with both FTP and SFTP servers.*/
export declare class Client extends EventEmitter implements IClientMethods {
    connected: boolean;
    config: IConfig;
    options: IOptions;
    _ftpClient: FtpClient;
    _sftpClient: SftpClient;
    protected _tasks: TaskManager;
    protected _transfer: TransferManager;
    connect(config: IConfig, options?: IOptions): Promise<void>;
    disconnect(): Promise<void>;
    abort(): Promise<void>;
    download(remotePath: string, dest: Writable, options?: ITransferOptions): Promise<ITransferStatus>;
    upload(remotePath: string, source: Readable, options?: ITransferOptions): Promise<ITransferStatus>;
    readDir(path?: string): Promise<IFile[]>;
    size(path: string): Promise<number>;
    move(srcPath: string, destPath: string): Promise<void>;
    stat(path: string): Promise<IStats>;
    unlink(path: string): Promise<void>;
    rimraf(path: string): Promise<void>;
    delete(path: string): Promise<void>;
    mkdir(path: string): Promise<void>;
    pwd(): Promise<string>;
    exists(path: string): Promise<boolean>;
    send(command: string): Promise<string>;
    touch(path: string): Promise<void>;
    createBlank(type: 'folder' | 'file', path?: string, files?: IFile[]): Promise<string>;
    get protocol(): IProtocol;
    get isSftp(): boolean;
}
export {};
