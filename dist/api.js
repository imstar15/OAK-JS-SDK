'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const graphql_request_1 = require('graphql-request')
class BifrostAPIProvider {
  constructor(host) {
    this.host = host
  }
  async getSalpContributions(parachainId) {
    const query = `
      query {
        salp_contributed(
          para_id:\"${parachainId}\"
        ){
          para_id
          balance
          account
          block_timestamp
          block_height
        }
      }
    `
    return (0, graphql_request_1.request)('https://bifrost-service.bifrost.finance/graphql', query)
  }
}
exports.default = BifrostAPIProvider
