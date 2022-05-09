import _ from 'lodash';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { OakChains, OakChainWebsockets } from '../src/constants';
import { Scheduler } from '../src/scheduler';
import { HexString } from '@polkadot/util/types';

export const generateProviderId = () => `functional-test-${new Date().getTime()}-${_.random(0, Number.MAX_SAFE_INTEGER, false)}`;

export const sendExtrinsic = (scheduler: Scheduler, extrinsicHex: HexString) : Promise<Object> =>  {
  return new Promise(async (resolve, reject) => {
    try {
      const txHash = await scheduler.sendExtrinsic(extrinsicHex, ({ status }) => {
        if (status?.isFinalized) {
          resolve(
            {
              extrinsicHash: txHash,
              blockHash: status?.asFinalized?.toString(),
            }
          );
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const hexToAscii = (hexStr: String, hasPrefix = false) => {
  const hex = hasPrefix ? hexStr : hexStr.substring(2);
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, i+2), 16));
  }
  return str;
}

export const getPolkadotApi = async () : Promise<ApiPromise> => {
  const wsProvider = new WsProvider(OakChainWebsockets[OakChains.NEU]);
  const polkadotApi = await ApiPromise.create({
    provider: wsProvider,
    rpc: {
      automationTime: {
        generateTaskId: {
          description: 'Getting task ID given account ID and provided ID',
          params: [
            {
              name: 'accountId',
              type: 'AccountId',
            },
            {
              name: 'providedId',
              type: 'Text',
            },
          ],
          type: 'Hash',
        },
      },
    },
  });
  return polkadotApi;
}