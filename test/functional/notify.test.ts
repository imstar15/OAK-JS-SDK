import _ from 'lodash';
import { waitReady } from '@polkadot/wasm-crypto';
import { hexToAscii, sectionName, sendExtrinsic, findExtrinsicFromChain, getNotifyExtrinsicParams, generateProviderId } from './helpFn';

beforeEach(async () => {
	jest.setTimeout(120000);
  await waitReady();
});

test('scheduler.buildScheduleNotifyExtrinsic works', async () => {
  const { message, providedID, executionTimestamps, polkadotApi, scheduler, keyringPair } = await getNotifyExtrinsicParams();

  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
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

test('scheduler.buildScheduleNotifyExtrinsic will fail with duplicate providerID', async () => {
  const { message, providedID, executionTimestamps, scheduler, keyringPair } = await getNotifyExtrinsicParams();
  
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await sendExtrinsic(scheduler, extrinsicHex);

  const extrinsicHex2 = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await expect(sendExtrinsic(scheduler, extrinsicHex2)).rejects.toThrow(`${sectionName}.DuplicateTask`);
});

test('scheduler.buildScheduleNotifyExtrinsic will fail with empty message', async () => {
  const { providedID, executionTimestamps, scheduler, keyringPair } = await getNotifyExtrinsicParams();
  const message = null;
  
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${sectionName}.EmptyMessage`);
});

test('scheduler.buildScheduleNotifyExtrinsic will fail with empty providedID', async () => {
  const { message, executionTimestamps, scheduler, keyringPair } = await getNotifyExtrinsicParams();
  const providedID = null;
  
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${sectionName}.EmptyProvidedId`);
});
