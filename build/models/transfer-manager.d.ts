/// <reference types="node" />
import { Writable, Readable } from 'stream';
import { ITransferStatus, ITransferOptions, ITransferInfo } from '../interfaces';
import { Client } from './client';
interface ITransferData {
    info?: Partial<ITransferInfo>;
    size?: number;
    options?: ITransferOptions;
    stream?: Writable | Readable;
}
export declare class TransferManager {
    protected _client: Client;
    buffered: number;
    protected _status: ITransferStatus;
    protected _data: ITransferData;
    constructor(_client: Client);
    download(remotePath: string, dest: Writable, options?: ITransferOptions): Promise<ITransferStatus>;
    upload(remotePath: string, source: Readable, options?: ITransferOptions): Promise<ITransferStatus>;
    protected _handleTransfer(data: ITransferData): Promise<ITransferStatus>;
    protected _prepare(): void;
    protected _clean(): void;
    protected _onDisconnect: () => void;
    protected _onSftpProgress: (chunk: any) => void;
    protected _onProgress(): void;
    protected _getFileSize(path: string, options?: ITransferOptions): Promise<number>;
}
export {};
