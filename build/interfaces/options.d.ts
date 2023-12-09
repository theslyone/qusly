/// <reference types="node" />
import { ConnectionOptions } from 'tls';
export interface IOptions {
    sftp?: ISftpOptions;
    ftp?: IFtpOptions;
    ftps?: IFtpsOptions;
}
export interface ISftpOptions {
    tryKeyboard?: boolean;
    privateKey?: Buffer | string;
}
export interface IFtpOptions {
    timeout?: number;
}
export interface IFtpsOptions {
    secureOptions?: ConnectionOptions;
}
