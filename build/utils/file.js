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
const path_1 = require("path");
const basic_ftp_1 = require("basic-ftp");
const fs_1 = require("fs");
const string_1 = require("./string");
const date_1 = require("./date");
exports.getFileType = (type) => {
    switch (type) {
        case basic_ftp_1.FileType.Directory: {
            return 'folder';
        }
        case basic_ftp_1.FileType.File: {
            return 'file';
        }
        case basic_ftp_1.FileType.SymbolicLink: {
            return 'symbolic-link';
        }
    }
    return 'unknown';
};
exports.getFileTypeFromStats = (stats) => {
    if (stats.isDirectory()) {
        return 'folder';
    }
    else if (stats.isFile()) {
        return 'file';
    }
    else if (stats.isSymbolicLink()) {
        return 'symbolic-link';
    }
    return 'unknown';
};
exports.formatFile = (file) => {
    const { permissions, name, size, user, group, type } = file;
    return {
        permissions: {
            user: permissions === null || permissions === void 0 ? void 0 : permissions.user,
            group: permissions === null || permissions === void 0 ? void 0 : permissions.group,
        },
        type: exports.getFileType(type),
        ext: path_1.extname(name),
        name,
        size,
        user,
        group,
    };
};
exports.formatFtpFile = (file) => {
    const { date } = file;
    const parsed = exports.formatFile(file);
    return Object.assign(Object.assign({}, parsed), { date: string_1.getValidDate(date) });
};
exports.formatSftpFile = (file, entry) => {
    const parsed = exports.formatFile(file);
    const { mtime } = entry.attrs;
    return Object.assign(Object.assign({}, parsed), { date: date_1.convertUnixTimestamp(mtime) });
};
exports.createFileName = (files, prefix) => {
    let exists = false;
    let index = 1;
    files.forEach(file => {
        const name = file.name.toLowerCase();
        if (name.startsWith(prefix)) {
            exists = true;
            const matches = name.match(/\(([^)]+)\)/);
            if (matches != null) {
                const fileIndex = parseInt(matches[1], 10);
                if (fileIndex > index) {
                    index = fileIndex;
                }
            }
        }
    });
    return exists ? `${prefix} (${index + 1})` : prefix;
};
exports.getFilePath = (stream) => {
    return stream.path;
};
exports.getFileSize = (source) => __awaiter(void 0, void 0, void 0, function* () {
    const path = exports.getFilePath(source);
    if (!path)
        return -1;
    const { size } = yield fs_1.promises.stat(path);
    return size;
});
//# sourceMappingURL=file.js.map