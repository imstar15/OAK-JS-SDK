import { WsProvider, ApiPromise } from '@polkadot/api'
import { HexString } from '@polkadot/util/types'
import * as _ from 'lodash'

import { OakChainWebsockets } from './constants'

// For observing chain state
export class Observer {
  wsProvider: WsProvider
  api: ApiPromise

  constructor(chain: OakChains) {
    console.log(_)
    console.log(_.times)
    console.log(chain)
    console.log(typeof WsProvider)
    console.log(JSON.stringify(WsProvider))
    this.wsProvider = new WsProvider(OakChainWebsockets[chain])
  }

  private async getAPIClient(): Promise<ApiPromise> {
    if (_.isNil(this.api)) {
      this.api = await ApiPromise.create({ provider: this.wsProvider })
    }
    return this.api
  }

  async getAutomationTimeLastTimeSlot(): Promise<number[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['lastTimeSlot']()
    return resultCodec.toJSON() as number[]
  }

  async getAutomationTimeMissedQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['missedQueue']()
    return resultCodec.toJSON() as string[]
  }

  async getAutomationTimeTaskQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['taskQueue']()
    return resultCodec.toJSON() as string[]
  }

  async getAutomationTimeScheduledTasks(inputTime: number): Promise<string[] | null> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['scheduledTasks'](inputTime)
    return resultCodec.toJSON() as string[] | null
  }

  async getAutomationTimeTasks(taskID: HexString): Promise<AutomationTask> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['tasks'](taskID)
    return resultCodec.toJSON() as unknown as AutomationTask
  }
}
