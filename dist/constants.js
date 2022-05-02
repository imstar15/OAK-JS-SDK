export const MS_IN_SEC = 1000;
export const SEC_IN_MIN = 60;
export const MIN_IN_HOUR = 60;
export const HOUR_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const ADDITIONAL_UNIT = 1;
export const NO_DIFF = 0;
export const RECURRING_TASK_LIMIT = 24;
export const LOWEST_TRANSFERRABLE_AMOUNT = 1000000000;
export const NEUMANN_WEBSOCKET = 'wss://rpc.testnet.oak.tech';
export const TURING_WEBSOCKET = 'wss://rpc.turing.oak.tech';
export var OakChainWebsockets;
(function (OakChainWebsockets) {
    OakChainWebsockets["NEU"] = "wss://rpc.testnet.oak.tech";
    OakChainWebsockets["TUR"] = "wss://rpc.turing.oak.tech";
})(OakChainWebsockets || (OakChainWebsockets = {}));
export var OakChainSchedulingLimit;
(function (OakChainSchedulingLimit) {
    OakChainSchedulingLimit[OakChainSchedulingLimit["NEU"] = 604800000] = "NEU";
    OakChainSchedulingLimit[OakChainSchedulingLimit["TUR"] = 15552000000] = "TUR";
})(OakChainSchedulingLimit || (OakChainSchedulingLimit = {}));
export var OakChains;
(function (OakChains) {
    OakChains["NEU"] = "NEU";
    OakChains["TUR"] = "TUR";
})(OakChains || (OakChains = {}));
//# sourceMappingURL=constants.js.map