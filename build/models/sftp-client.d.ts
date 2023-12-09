/// <reference types="node" />
import { EventEmitter } from 'events';
import { Client as SshClient, SFTPWrapper } from 'ssh2';
import { FileEntry, Stats } from 'ssh2-streams';
import { Writable, Readable } from 'stream';
import { Socket } from 'net';
import { IConfig, ISftpOptions } from '../interfaces';
import { Client } from '../models';
export declare interface SftpClient {
    on(event: 'progress', listener: (buffered: number) => void): this;
}
export declare class SftpClient extends EventEmitter {
    protected _client: Client;
    _ssh: SshClient;
    _wrapper: SFTPWrapper;
    constructor(_client: Client);
    get socket(): Socket;
    connect(config: IConfig, options?: ISftpOptions): Promise<unknown>;
    disconnect(): Promise<unknown>;
    size(path: string): Promise<number>;
    send(command: string): Promise<unknown>;
    move(src: string, dest: string): Promise<unknown>;
    unlink(path: string): Promise<unknown>;
    removeDir(path: string): Promise<void>;
    removeEmptyDir(path: string): Promise<unknown>;
    mkdir(path: string): Promise<unknown>;
    pwd(): Promise<unknown>;
    readDir(path: string): Promise<FileEntry[]>;
    createReadStream(path: string, start?: number): import("ssh2").ReadStream;
    createWriteStream(path: string): import("ssh2").WriteStream;
    stat(path: string): Promise<Stats>;
    touch(path: string): Promise<unknown>;
    download(path: string, dest: Writable, startAt?: number): Promise<unknown>;
    upload(path: string, source: Readable): Promise<unknown>;
}
