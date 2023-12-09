/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { FileInfo, FileType } from 'basic-ftp';
import { Stats, FileEntry } from 'ssh2-streams';
import { IFile, IFileType } from '../interfaces';
export declare const getFileType: (type: FileType) => IFileType;
export declare const getFileTypeFromStats: (stats: Stats) => IFileType;
export declare const formatFile: (file: FileInfo) => IFile;
export declare const formatFtpFile: (file: FileInfo) => IFile;
export declare const formatSftpFile: (file: FileInfo, entry: FileEntry) => IFile;
export declare const createFileName: (files: IFile[], prefix: string) => string;
export declare const getFilePath: (stream: Writable | Readable) => any;
export declare const getFileSize: (source: Readable) => Promise<number>;
