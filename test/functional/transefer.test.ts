import _ from 'lodash';
import { waitReady } from '@polkadot/wasm-crypto';
import { hexToAscii, sendExtrinsic, findExtrinsicFromChain, sectionName, getNativeTransferExtrinsicParams } from './helpFn';
import type { BalanceOf } from '@polkadot/types/interfaces';

beforeEach(async () => {
  jest.setTimeout(120000);
  await waitReady();
});

test('scheduler.buildScheduleNativeTransferExtrinsic works', async () => {
  const { amount, receiverAddress, providedID, executionTimestamps, polkadotApi, scheduler, keyringPair } = await getNativeTransferExtrinsicParams();

  // Send extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(
    keyringPair,
    providedID,
    executionTimestamps,
    receiverAddress,
    amount,
  );
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
  const extrinsic = await findExtrinsicFromChain(polkadotApi, blockHash, extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [providedIdOnChainHex, executionTimestampsOnChain, receiverAddressOnChain, amountOnChainRaw] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());
  const amountOnChain = <BalanceOf>amountOnChainRaw;

  expect(section).toEqual(sectionName);
  expect(method).toEqual('scheduleNativeTransferTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(receiverAddressOnChain.toString()).toEqual(receiverAddress);
  expect(amountOnChain.toNumber()).toEqual(amount);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);
});

test('scheduler.buildScheduleNativeTransferExtrinsic will fail with duplicate providerID', async () => {
  const { amount, receiverAddress, providedID, executionTimestamps, scheduler, keyringPair } = await getNativeTransferExtrinsicParams();
  
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(keyringPair, providedID, executionTimestamps, receiverAddress, amount);
  await sendExtrinsic(scheduler, extrinsicHex);

  const extrinsicHex2 = await scheduler.buildScheduleNativeTransferExtrinsic(keyringPair, providedID, executionTimestamps, receiverAddress, amount);
  await expect(sendExtrinsic(scheduler, extrinsicHex2)).rejects.toThrow(`${sectionName}.DuplicateTask`);
});

test('scheduler.buildScheduleNativeTransferExtrinsic will fail with incorrect format receiver address', async () => {
  const { amount, providedID, executionTimestamps, scheduler, keyringPair } = await getNativeTransferExtrinsicParams();
  const receiverAddress = 'incorrect format receiver address';

  await expect(scheduler.buildScheduleNativeTransferExtrinsic(keyringPair, providedID, executionTimestamps, receiverAddress, amount)).rejects.toBeInstanceOf(Error);
});

test('scheduler.buildScheduleNativeTransferExtrinsic will fail with empty providedID', async () => {
  const { amount, receiverAddress, executionTimestamps, scheduler, keyringPair } = await getNativeTransferExtrinsicParams();
  const providedID = null;
  
  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(keyringPair, providedID, executionTimestamps, receiverAddress, amount);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${sectionName}.EmptyProvidedId`);
});