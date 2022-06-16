"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OakChains = exports.OakChainSchedulingLimit = exports.OakChainWebsockets = exports.SS58_PREFIX = exports.LOWEST_TRANSFERRABLE_AMOUNT = exports.RECURRING_TASK_LIMIT = exports.NO_DIFF = exports.ADDITIONAL_UNIT = exports.DAYS_IN_WEEK = exports.HOUR_IN_DAY = exports.MIN_IN_HOUR = exports.SEC_IN_MIN = exports.MS_IN_SEC = void 0;
exports.MS_IN_SEC = 1000;
exports.SEC_IN_MIN = 60;
exports.MIN_IN_HOUR = 60;
exports.HOUR_IN_DAY = 24;
exports.DAYS_IN_WEEK = 7;
exports.ADDITIONAL_UNIT = 1;
exports.NO_DIFF = 0;
exports.RECURRING_TASK_LIMIT = 24;
exports.LOWEST_TRANSFERRABLE_AMOUNT = 1000000000;
exports.SS58_PREFIX = 51;
var OakChainWebsockets;
(function (OakChainWebsockets) {
    OakChainWebsockets["STUR"] = "wss://rpc.turing-staging.oak.tech";
    OakChainWebsockets["TUR"] = "wss://rpc.turing.oak.tech";
})(OakChainWebsockets = exports.OakChainWebsockets || (exports.OakChainWebsockets = {}));
var OakChainSchedulingLimit;
(function (OakChainSchedulingLimit) {
    OakChainSchedulingLimit[OakChainSchedulingLimit["STUR"] = 15552000000] = "STUR";
    OakChainSchedulingLimit[OakChainSchedulingLimit["TUR"] = 15552000000] = "TUR";
})(OakChainSchedulingLimit = exports.OakChainSchedulingLimit || (exports.OakChainSchedulingLimit = {}));
var OakChains;
(function (OakChains) {
    OakChains["STUR"] = "STUR";
    OakChains["TUR"] = "TUR";
})(OakChains = exports.OakChains || (exports.OakChains = {}));
//# sourceMappingURL=constants.js.map