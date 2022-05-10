import _ from 'lodash';
import { waitReady } from '@polkadot/wasm-crypto';
import { OakChains, MS_IN_SEC } from '../src/constants'
import { Scheduler } from '../src/scheduler';
import { Recurrer } from '../src/recurrer'
import { generateProviderId, hexToAscii, getPolkadotApi, sendExtrinsic, getKeyringPair, findExtrinsicFromChain } from './helpFn';

const sectionName = 'automationTime';

const sendScheduleNativeTransferExtrinsic = async (scheduler: Scheduler) : Promise<Object> => {
  const amount = 1000000000;
  const receiverAddress = "66fhJwYLiK87UDXYDQP9TfYdHpeEyMvQ3MK8Z6GgWAdyyCL3";

  const keyringPair = getKeyringPair();
  const providedID = generateProviderId();
  const executionTimestamps = _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 5, 0), (time) => time / MS_IN_SEC);

  // Generate extrinsic hex
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(
    keyringPair,
    providedID,
    executionTimestamps,
    receiverAddress,
    amount,
  );

  // Send extrinsic and get extrinsicHash, blockHash.
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  return { amount, receiverAddress,  providedID, executionTimestamps, extrinsicHash, blockHash, scheduler, keyringPair };
}

beforeEach(async () => {
  await waitReady();
});

test('scheduler.buildScheduleNativeTransferExtrinsic works', async () => {
  jest.setTimeout(120000);

  // send scheduleNativeTransferExtrinsic
  const scheduler = new Scheduler(OakChains.NEU);
  const {
    amount, receiverAddress,  providedID, executionTimestamps, extrinsicHash, blockHash,
  } = await sendScheduleNativeTransferExtrinsic(scheduler);

  // Fetch extrinsic from chain
  const polkadotApi = await getPolkadotApi();
  const extrinsic = await findExtrinsicFromChain(polkadotApi, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [providedIdOnChainHex, executionTimestampsOnChain, receiverAddressOnChain, amountOnChain] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());

  expect(section).toEqual(sectionName);
  expect(method).toEqual('scheduleNativeTransferTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(receiverAddressOnChain.toString()).toEqual(receiverAddress);
  expect(amountOnChain.toNumber()).toEqual(amount);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);
})

test('Cancel scheduleNativeTransferExtrinsic works', async () => {
  jest.setTimeout(120000);

  // send scheduleNativeTransferExtrinsic
  const scheduler = new Scheduler(OakChains.NEU);
  const { providedID, keyringPair } = await sendScheduleNativeTransferExtrinsic(scheduler);

  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();

  // Cancel task
  const cancelExtrinsicHex = await scheduler.buildCancelTaskExtrinsic(keyringPair, taskID);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, cancelExtrinsicHex);

  // Fetch extrinsic from chain
  const polkadotApi = await getPolkadotApi();
  const extrinsic = await findExtrinsicFromChain(polkadotApi, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [taskIdOnChain] = args;

  expect(section).toEqual(sectionName);
  expect(method).toEqual('cancelTask');
  expect(taskIdOnChain.toString()).toEqual(taskID);
});

test('scheduler.buildScheduleNotifyExtrinsic works', async () => {
  const message = 'notify';

  jest.setTimeout(120000);

  const keyringPair = getKeyringPair();
  const providedID = generateProviderId();
  
  // Use Recurrer to generate executionTimestamps
  const executionTimestamps = _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 3, 7), (time) => time / MS_IN_SEC);

  // Generate extrinsic hex
  const scheduler = new Scheduler(OakChains.NEU);
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);

  // Send extrinsic and get extrinsicHash, blockHash.
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
  const polkadotApi = await getPolkadotApi();
  const extrinsic = await findExtrinsicFromChain(polkadotApi, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [providedIdOnChainHex, executionTimestampsOnChain, messageOnChainHex] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());
  const messageOnChain = hexToAscii(messageOnChainHex.toString());

  expect(section).toEqual(sectionName);
  expect(method).toEqual('scheduleNotifyTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(messageOnChain).toEqual(message);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);
});

