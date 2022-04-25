'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const extension_dapp_1 = require('@polkadot/extension-dapp')
const api_1 = require('@polkadot/api')
const util_1 = require('@polkadot/util')
const util_crypto_1 = require('@polkadot/util-crypto')
class BifrostExtrinsicsProvider {
  constructor(host) {
    this.host = host
    this.wsProvider = new api_1.WsProvider(`wss://bifrost-rpc.devnet.liebi.com/ws`)
  }
  async getAPIClient() {
    if (this.api) return this.api
    return api_1.ApiPromise.create({ provider: this.wsProvider })
  }
  async getToken(address, saveBalance) {
    const currencyId = { Token: 'ksm' }
    await this.getCurrency(address, currencyId, saveBalance)
  }
  async getVsBond(address, saveBalance) {
    const currencyId = { vsBond: ['ksm', 2090, 15, 22] }
    await this.getCurrency(address, currencyId, saveBalance)
  }
  async getVsToken(address, saveBalance) {
    const currencyId = { vsToken: 'ksm' }
    await this.getCurrency(address, currencyId, saveBalance)
  }
  async getCurrency(address, currencyParameter, saveBalance) {
    const api = await this.getAPIClient()
    return api.query.tokens.accounts(address, currencyParameter, async (balance) => {
      await saveBalance(balance.free.toString())
    })
  }
  async sendKSMtoBifrost(parachainID, amount, address) {
    const paras = [
      {
        V1: {
          parents: 0,
          interior: {
            X1: {
              Parachain: parachainID,
            },
          },
        },
      },
      {
        V1: {
          parents: 0,
          interior: {
            X1: {
              AccountId32: {
                network: 'Any',
                id: (0, util_1.u8aToHex)((0, util_crypto_1.decodeAddress)(address)),
              },
            },
          },
        },
      },
      {
        V1: [
          {
            id: {
              Concrete: {
                parents: 0,
                interior: 'Here',
              },
            },
            fun: {
              Fungible: amount,
            },
          },
        ],
      },
      0,
    ]
    const injector = await (0, extension_dapp_1.web3FromAddress)(address)
    const polkadotApi = await this.getAPIClient()
    const extrinsic = polkadotApi.tx.xcmPallet.reserveTransferAssets(...paras)
    const signedExtrinsic = await extrinsic.signAsync(address, {
      signer: injector.signer,
    })
    return signedExtrinsic.toHex()
  }
  async getFees(extrinsic, address) {
    const paymentInfo = await extrinsic.paymentInfo(address)
    return paymentInfo.partialFee
  }
  async bifrostContribute(address) {
    const injector = await (0, extension_dapp_1.web3FromAddress)(address)
    const polkadotApi = await this.getAPIClient()
    const extrinsic = polkadotApi.tx.salp.contribute(2090, 1000000000000)
    const signedExtrinsic = await extrinsic.signAsync(address, {
      signer: injector.signer,
    })
    return signedExtrinsic.toHex()
  }
  async sendExtrinsic(extrinsic, handleDispatch) {
    return extrinsic.send(async ({ status, dispatchError }) => {
      handleDispatch(status, dispatchError)
    })
  }
}
exports.default = BifrostExtrinsicsProvider
