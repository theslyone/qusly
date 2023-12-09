"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcElapsed = (start) => {
    return (new Date().getTime() - start) / 1000;
};
exports.calcEta = (elapsed, buffered, size) => {
    const rate = buffered / elapsed;
    const estimated = size / rate;
    const eta = Math.round(estimated - elapsed);
    return Number.isSafeInteger(eta) ? eta : 1;
};
//# sourceMappingURL=network.js.map