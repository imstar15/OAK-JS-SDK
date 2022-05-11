import _ from 'lodash';
import { WsProvider, ApiPromise, Keyring } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { Extrinsic } from '@polkadot/types/interfaces/extrinsics';
import type { KeyringPair } from '@polkadot/keyring/types';

import { OakChains, OakChainWebsockets, SS58_PREFIX, MS_IN_SEC } from '../../src/constants';
import { Scheduler } from '../../src/scheduler';
import { Recurrer } from '../../src/recurrer'

export const sectionName = 'automationTime';

export const generateProviderId = () => `functional-test-${new Date().getTime()}-${_.random(0, Number.MAX_SAFE_INTEGER, false)}`;

export const sendExtrinsic = async (scheduler: Scheduler, extrinsicHex: HexString) : Promise<{extrinsicHash: string, blockHash: string}> => {
  return new Promise(async (resolve, reject) => {
    try {
      const txHash = await scheduler.sendExtrinsic(extrinsicHex, ({ status, events, dispatchError }) => {
        if (status?.isFinalized) {
          const { api } = scheduler;

          if (!_.isNil(dispatchError)) {
            if (dispatchError.isModule) {
                const metaError = api.registry.findMetaError(dispatchError.asModule);
                const { name, section } = metaError;
                reject(new Error(`${section}.${name}`));
                return;
            } else {
                reject(new Error(dispatchError.toString()));
                return;
            }
          }

          const event = _.find(events, ({ event }) => api.events.system.ExtrinsicSuccess.is(event));
          if (event) {
            resolve({ extrinsicHash: txHash, blockHash: status?.asFinalized?.toString() });
          } else {
            reject(new Error('The event.ExtrinsicSuccess is not found'));
          }
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

export const getKeyringPair = () => {
  // Generate sender keyring pair from mnemonic
  const keyring = new Keyring({ type: 'sr25519', ss58Format: SS58_PREFIX });
  const keyringPair = keyring.addFromMnemonic(process.env.SENDER_MNEMONIC);
  return keyringPair;
}

export const findExtrinsicFromChain = async (polkadotApi: ApiPromise, blockHash: string, extrinsicHash: string) : Promise<Extrinsic> => {
  const signedBlock = await polkadotApi.rpc.chain.getBlock(blockHash);
  const { block: { extrinsics } } = signedBlock;
  const extrinsic = _.find(extrinsics, (extrinsic) => extrinsic.hash.toHex() === extrinsicHash);
  return extrinsic;
}

export const cancelTaskAndVerify = async (polkadotApi: ApiPromise, scheduler: Scheduler, keyringPair: KeyringPair, taskID: string) => {
  const cancelExtrinsicHex = await scheduler.buildCancelTaskExtrinsic(keyringPair, taskID);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, cancelExtrinsicHex);

  // Fetch extrinsic from chain
  const extrinsic = await findExtrinsicFromChain(polkadotApi, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [taskIdOnChain] = args;

  expect(section).toEqual(sectionName);
  expect(method).toEqual('cancelTask');
  expect(taskIdOnChain.toString()).toEqual(taskID);
}

export const getNativeTransferExtrinsicParams = async () => {
  return {
    amount: 1000000000,
    receiverAddress: "66fhJwYLiK87UDXYDQP9TfYdHpeEyMvQ3MK8Z6GgWAdyyCL3",
    providedID: generateProviderId(),
    executionTimestamps: _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 5, 0), (time) => time / MS_IN_SEC),
    polkadotApi: await getPolkadotApi(),
    scheduler: new Scheduler(OakChains.NEU),
    keyringPair: getKeyringPair(),
  }
}

export const getNotifyExtrinsicParams = async () => ({
  message: 'notify',
  providedID: generateProviderId(),
  executionTimestamps: _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 3, 7), (time) => time / MS_IN_SEC),
  polkadotApi: await getPolkadotApi(),
  scheduler: new Scheduler(OakChains.NEU),
  keyringPair: getKeyringPair(),
});
