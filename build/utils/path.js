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
const fs_1 = require("fs");
exports.checkIfExists = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.access(path, fs_1.constants.F_OK);
    }
    catch (error) {
        return false;
    }
    return true;
});
exports.ensureExists = (localPath) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.checkIfExists(localPath);
    if (!exists) {
        const dir = path_1.dirname(localPath);
        yield fs_1.promises.mkdir(dir, { recursive: true });
    }
});
//# sourceMappingURL=path.js.map