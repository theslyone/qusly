import { ITaskResponse } from '../interfaces';
export declare const safeExec: (f: Function, ...args: any) => Promise<ITaskResponse>;
