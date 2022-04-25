import { WsProvider, ApiPromise } from '@polkadot/api'
import { HexString } from '@polkadot/util/types'
import _ from 'lodash'

// For observing chain state
export default class Observer {
  wsProvider: WsProvider
  api: ApiPromise

  constructor(websocket: string) {
    this.wsProvider = new WsProvider(websocket)
  }

  private async getAPIClient(): Promise<ApiPromise> {
    if (_.isNil(this.api)) {
      this.api = await ApiPromise.create({ provider: this.wsProvider })
    }
    return this.api
  }

  async getAutomationTimeLastTimeSlot(): Promise<number[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query[automationTime].lastTimeSlot()
    return resultCodec.toJSON() as number[]
  }

  async getAutomationTimeMissedQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query.automationTime.missedQueue()
    return resultCodec.toJSON() as string[]
  }

  async getAutomationTimeTaskQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query.automationTime.taskQueue()
    return resultCodec.toJSON() as string[]
  }

  async getAutomationTimeScheduledTasks(inputTime: number): Promise<string[] | null> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query.automationTime.scheduledTasks(inputTime)
    return resultCodec.toJSON() as string[] | null
  }

  async getAutomationTimeTasks(taskID: HexString): Promise<AutomationTask> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query.automationTime.tasks(taskID)
    return resultCodec.toJSON() as unknown as AutomationTask
  }
}
