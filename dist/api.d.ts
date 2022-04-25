export default class BifrostAPIProvider {
  host: string
  constructor(host: string)
  getSalpContributions(parachainId: number): Promise<API.GetSalpContributionResponse>
}
