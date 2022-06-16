import _ from 'lodash';
import { WsProvider, ApiPromise, Keyring } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { Extrinsic } from '@polkadot/types/interfaces/extrinsics';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { BalanceOf } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { waitReady } from '@polkadot/wasm-crypto';

import { OakChains, OakChainWebsockets, SS58_PREFIX, MS_IN_SEC } from '../../src/constants';
import { Scheduler } from '../../src/scheduler';
import { Recurrer } from '../../src/recurrer'
import { Observer } from '../../src/observer'

export const SECTION_NAME = 'automationTime';
export const MIN_RUNNING_TEST_BALANCE = 20000000000;
export const TRANSFER_AMOUNT = 1000000000;

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
  const wsProvider = new WsProvider(OakChainWebsockets[OakChains.STUR]);
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

export const checkBalance = async (keyringPair: KeyringPair) => {
  const polkadotApi = await getPolkadotApi();
  const { data: balanceRaw } = await polkadotApi.query.system.account(keyringPair.address) as any;
  expect((<BalanceOf>balanceRaw.free).gte(new BN(MIN_RUNNING_TEST_BALANCE))).toEqual(true);
};

export const getKeyringPair = async () => {
  await waitReady();
  if (_.isEmpty(process.env.SENDER_MNEMONIC)) {
    throw new Error('The SENDER_MNEMONIC environment variable is not set.')
  }
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

export const cancelTaskAndVerify = async (scheduler: Scheduler, observer: Observer, keyringPair: KeyringPair, taskID: string, executionTimestamp: number) => {
  const cancelExtrinsicHex = await scheduler.buildCancelTaskExtrinsic(keyringPair, taskID);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, cancelExtrinsicHex);

  // Fetch extrinsic from chain
  const extrinsic = await findExtrinsicFromChain(scheduler.api, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [taskIdOnChain] = args;

  expect(section).toEqual(SECTION_NAME);
  expect(method).toEqual('cancelTask');
  expect(taskIdOnChain.toString()).toEqual(taskID);

   // Make sure the task has been canceled.
   const tasksAfterCanceled = await observer.getAutomationTimeScheduledTasks(executionTimestamp);
   expect(_.findIndex(tasksAfterCanceled, (task) => task === taskID)).toEqual(-1);
}

export const scheduleNotifyTaskAndVerify = async (scheduler: Scheduler, observer: Observer, keyringPair: KeyringPair, extrinsicParams: any) => {
  const { providedID, executionTimestamps, message } = extrinsicParams;
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
  const extrinsic = await findExtrinsicFromChain(scheduler.api, blockHash, extrinsicHash);

  //  Verify arguments
  const { method: { section, method, args } } = extrinsic;
  const [providedIdOnChainHex, executionTimestampsOnChain, messageOnChainHex] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());
  const messageOnChain = hexToAscii(messageOnChainHex.toString());

  expect(section).toEqual(SECTION_NAME);
  expect(method).toEqual('scheduleNotifyTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(messageOnChain).toEqual(message);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);

  // Make use the task has been scheduled
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
  const tasks = await observer.getAutomationTimeScheduledTasks(executionTimestamps[0]);
  expect(_.findIndex(tasks, (task) => task === taskID)).not.toEqual(-1);

  return taskID;
}

export const scheduleNativeTransferAndVerify = async (scheduler: Scheduler, observer: Observer, keyringPair: KeyringPair, extrinsicParams: any) => {
  // Send extrinsic and get extrinsicHash, blockHash.
  const { providedID, executionTimestamps, receiverAddress, amount } = extrinsicParams;
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(
    keyringPair,
    providedID,
    executionTimestamps,
    receiverAddress,
    amount,
  );
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
  const extrinsic = await findExtrinsicFromChain(scheduler.api, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [providedIdOnChainHex, executionTimestampsOnChain, receiverAddressOnChain, amountOnChainRaw] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());
  const amountOnChain = <BalanceOf>amountOnChainRaw;

  expect(section).toEqual(SECTION_NAME);
  expect(method).toEqual('scheduleNativeTransferTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(receiverAddressOnChain.toString()).toEqual(receiverAddress);
  expect(amountOnChain.toNumber()).toEqual(amount);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);

  // Make use the task has been scheduled
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
  const tasksAfterCanceled = await observer.getAutomationTimeScheduledTasks(executionTimestamps[0]);
  expect(_.findIndex(tasksAfterCanceled, (task) => task === taskID)).not.toEqual(-1);

  return taskID;
}

export const getNativeTransferExtrinsicParams = () => {
  return {
    amount: TRANSFER_AMOUNT,
    receiverAddress: "66fhJwYLiK87UDXYDQP9TfYdHpeEyMvQ3MK8Z6GgWAdyyCL3",
    providedID: generateProviderId(),
    executionTimestamps: _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 5, 0), (time) => time / MS_IN_SEC),
  }
}

export const getNotifyExtrinsicParams = () => ({
  message: 'notify',
  providedID: generateProviderId(),
  executionTimestamps: _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 3, 7), (time) => time / MS_IN_SEC),
});

export const getContext = async () => ({
  scheduler: new Scheduler(OakChains.STUR),
  observer: new Observer(OakChains.STUR),
  keyringPair: await getKeyringPair(),
});
