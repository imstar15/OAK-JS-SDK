import _ from 'lodash';
import { WsProvider, ApiPromise, Keyring } from '@polkadot/api';
import { OakChains, OakChainWebsockets, SS58_PREFIX } from '../src/constants';
import { Scheduler } from '../src/scheduler';
import type { HexString } from '@polkadot/util/types';
import type { BlockHash } from '@polkadot/types/interfaces/chain';
import type { Extrinsic } from '@polkadot/types/interfaces/extrinsics';

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

export const getKeyringPair = () => {
  // Generate sender keyring pair from mnemonic
  const keyring = new Keyring({ type: 'sr25519', ss58Format: SS58_PREFIX });
  const keyringPair = keyring.addFromMnemonic(process.env.SENDER_MNEMONIC);
  return keyringPair;
}

export const findExtrinsicFromChain = async (polkadotApi: ApiPromise, blockHash: BlockHash, extrinsicHash: String) : Promise<Extrinsic> => {
  const signedBlock = await polkadotApi.rpc.chain.getBlock(blockHash);
  const { block: { extrinsics } } = signedBlock;
  const extrinsic = _.find(extrinsics, (extrinsic) => extrinsic.hash.toHex() === extrinsicHash);
  return extrinsic;
}