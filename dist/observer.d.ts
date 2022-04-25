import { WsProvider, ApiPromise } from '@polkadot/api';
import { HexString } from '@polkadot/util/types';
export default class Observer {
    wsProvider: WsProvider;
    api: ApiPromise;
    constructor(websocket: string);
    private getAPIClient;
    getAutomationTimeLastTimeSlot(): Promise<number[]>;
    getAutomationTimeMissedQueue(): Promise<string[]>;
    getAutomationTimeTaskQueue(): Promise<string[]>;
    getAutomationTimeScheduledTasks(inputTime: number): Promise<string[] | null>;
    getAutomationTimeTasks(taskID: HexString): Promise<AutomationTask>;
}
