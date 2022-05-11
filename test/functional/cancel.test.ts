import _ from 'lodash';
import { waitReady } from '@polkadot/wasm-crypto';
import { sendExtrinsic, getNativeTransferExtrinsicParams, getNotifyExtrinsicParams, cancelTaskAndVerify, getPolkadotApi, getKeyringPair, sectionName } from './helpFn';
import { Scheduler } from '../../src/scheduler';
import { OakChains } from '../../src/constants';

beforeEach(async () => {
	jest.setTimeout(120000);
  await waitReady();
});

test('Cancel scheduleNativeTransferExtrinsic works', async () => {
  const { amount, receiverAddress, providedID, executionTimestamps, polkadotApi, scheduler, keyringPair } = await getNativeTransferExtrinsicParams();

  // Send extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(
    keyringPair,
    providedID,
    executionTimestamps,
    receiverAddress,
    amount,
  );
  await sendExtrinsic(scheduler, extrinsicHex);

  // Cancel task and verify
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
  await cancelTaskAndVerify(polkadotApi, scheduler, keyringPair, taskID);
});

test('Cancel scheduleNotifyExtrinsic works', async () => {
  const { message, providedID, executionTimestamps, polkadotApi, scheduler, keyringPair } = await getNotifyExtrinsicParams();

  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await sendExtrinsic(scheduler, extrinsicHex);

  // Cancel task and verify
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
  await cancelTaskAndVerify(polkadotApi, scheduler, keyringPair, taskID);
});

test('Cancel failed with incorrect format taskID', async () => {
  const nonexistentTaskID = "A string(<32 bytes).";
  const keyringPair = getKeyringPair();
  const scheduler = new Scheduler(OakChains.NEU);

  await expect(scheduler.buildCancelTaskExtrinsic(keyringPair, nonexistentTaskID)).rejects.toBeInstanceOf(Error);
});

test('Cancel failed with nonexistent taskID', async () => {
  const nonexistentTaskID = "Please put a string of length greater than or equal to 32 bytes here, and make sure it is a non-existing taskID.";
  const keyringPair = getKeyringPair();
  const scheduler = new Scheduler(OakChains.NEU);

  const cancelExtrinsicHex = await scheduler.buildCancelTaskExtrinsic(keyringPair, nonexistentTaskID);
  await expect(sendExtrinsic(scheduler, cancelExtrinsicHex)).rejects.toThrow(`${sectionName}.TaskDoesNotExist`);
});

test('Repeated cancellation of scheduleNotifyExtrinsic will fail.', async () => {
  const { message, providedID, executionTimestamps, polkadotApi, scheduler, keyringPair } = await getNotifyExtrinsicParams();

  // Send notify extrinsic and get extrinsicHash, blockHash.
  const extrinsicHex = await scheduler.buildScheduleNotifyExtrinsic(keyringPair, providedID, executionTimestamps, message);
  await sendExtrinsic(scheduler, extrinsicHex);

  // Cancel task and verify
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
  await cancelTaskAndVerify(polkadotApi, scheduler, keyringPair, taskID);
  await expect(cancelTaskAndVerify(polkadotApi, scheduler, keyringPair, taskID)).rejects.toThrow(`${sectionName}.TaskDoesNotExist`);
});
