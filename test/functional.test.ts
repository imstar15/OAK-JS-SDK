import _ from 'lodash';
import { Keyring } from '@polkadot/api'
import { waitReady } from '@polkadot/wasm-crypto';
import { OakChains, MS_IN_SEC, SS58_PREFIX } from '../src/constants'
import { Scheduler } from '../src/scheduler';
import { Recurrer } from '../src/recurrer'
import { generateProviderId, hexToAscii, getPolkadotApi, sendExtrinsic } from './helpFn';

test('scheduler.buildScheduleNativeTransferExtrinsic works', async () => {
  const amount = 1000000000;

  jest.setTimeout(120000);
  await waitReady();

  // Generate sender keyring pair from mnemonic
  const keyring = new Keyring({ type: 'sr25519', ss58Format: SS58_PREFIX });
  const keyringPair = keyring.addFromMnemonic(process.env.SENDER_MNEMONIC);

  const receiverAddress = "66fhJwYLiK87UDXYDQP9TfYdHpeEyMvQ3MK8Z6GgWAdyyCL3";
  const providedID = generateProviderId();

  // Use Recurrer to generate executionTimestamps
  const numberRecurring = 5;
  const hourOfDay = 0
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const executionTimestampsInMs = recurrer.getDailyRecurringTimestamps(currentTime, numberRecurring, hourOfDay);
  const executionTimestamps = _.map(executionTimestampsInMs, (time) => time / MS_IN_SEC);

  // Generate extrinsic hex
  const scheduler = new Scheduler(OakChains.NEU);
  const extrinsicHex = await scheduler.buildScheduleNativeTransferExtrinsic(
    keyringPair,
    providedID,
    executionTimestamps,
    receiverAddress,
    amount,
    null,
  );

  // Send extrinsic and get extrinsicHash, blockHash.
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, extrinsicHex);

  // Fetch extrinsic from chain
  const polkadotApi = await getPolkadotApi();
  const signedBlock = await polkadotApi.rpc.chain.getBlock(blockHash);
  const { block: { extrinsics } } = signedBlock;
  const extrinsic = _.find(extrinsics, (extrinsic) => extrinsic.hash.toHex() === extrinsicHash);

  //  Verify arguments
  const { section, method, args } = extrinsic.method;
  const [providedIdOnChainHex, executionTimestampsOnChain, receiverAddressOnChain, amountOnChain] = args;
  const providedIdOnChain = hexToAscii(providedIdOnChainHex.toString());

  expect(section).toEqual('automationTime');
  expect(method).toEqual('scheduleNativeTransferTask');
  expect(providedIdOnChain).toEqual(providedID);
  expect(receiverAddressOnChain.toString()).toEqual(receiverAddress);
  expect(amountOnChain.toNumber()).toEqual(amount);
  const isTimestampsEqual = _.reduce(executionTimestamps, (prev, executionTimestamp, index) => prev && executionTimestamp === executionTimestampsOnChain[index].toNumber(), true);
  expect(isTimestampsEqual).toEqual(true);
})

test('scheduler.buildScheduleNotifyExtrinsic works', async () => {});

test('scheduler.buildCancelTaskExtrinsic works', async () => {});

