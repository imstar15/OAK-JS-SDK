import { WsProvider, ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'
export default class BifrostExtrinsicsProvider {
  host: string
  wsProvider: WsProvider
  api: ApiPromise
  constructor(host: string)
  getAPIClient(): Promise<ApiPromise>
  getToken(address: string, saveBalance: Function): Promise<void>
  getVsBond(address: string, saveBalance: Function): Promise<void>
  getVsToken(address: string, saveBalance: Function): Promise<void>
  getCurrency(
    address: string,
    currencyParameter: any,
    saveBalance: Function
  ): Promise<import('@polkadot/types/types').Codec>
  sendKSMtoBifrost(parachainID: number, amount: number, address: string): Promise<`0x${string}`>
  getFees(extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>, address: string): Promise<Object>
  bifrostContribute(address: string): Promise<`0x${string}`>
  sendExtrinsic(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    handleDispatch: Function
  ): Promise<() => void>
}
