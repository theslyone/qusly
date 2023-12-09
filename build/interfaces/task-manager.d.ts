export declare type ITaskStatus = 'busy' | 'pending' | 'finished' | 'deleted';
export declare type ITaskCallback = (taskId: string, taskIndex: number) => void;
export interface ITask {
    id?: string;
    cb?: ITaskCallback;
    status?: ITaskStatus;
    data?: any;
}
export interface ITaskResponse {
    data?: any;
    error?: Error;
}
export declare type ITaskFilter = (task: ITask) => boolean;
