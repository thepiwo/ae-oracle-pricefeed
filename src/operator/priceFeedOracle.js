const Aeternity = require("./aeternity");
const BigNumber = require("bignumber.js");
const { decode } = require("@aeternity/aepp-sdk");

module.exports = class PriceFeedOracle {
  constructor() {
    this.fundingAmount = 10000000000000000;
    this.ttl = 500;
    this.autoExtend = true;
    this.stopPollQueries = null;
  }

  init = async (keyPair = null, ttl = 500, autoExtend = true) => {
    this.ttl = ttl;
    this.autoExtend = autoExtend;
    this.aeternity = new Aeternity();
    await this.aeternity.init(keyPair);
    await this.aeternity.awaitFunding(this.fundingAmount);

    console.debug(
      "oracle client initialized with ttl:",
      this.ttl,
      "auto extend:",
      this.autoExtend,
    );
  };

  register = async (queryFee = 200000000000000) => {
    if (!this.aeternity.client) throw Error("Client not initialized");

    if (!this.oracle)
      this.oracle = await this.aeternity.client
        .getOracleObject(this.aeternity.client.address.replace("ak_", "ok_"))
        .catch(() => null);
    if (!this.oracle)
      this.oracle = await this.aeternity.client.registerOracle(
        "string",
        "string",
        {
          queryFee: queryFee,
          oracleTtl: { type: "delta", value: this.ttl },
        },
      );

    console.log("oracle id", this.oracle.id);

    if (this.autoExtend) {
      await this.extendIfNeeded();
      this.extendIfNeededInterval = setInterval(
        async () => {
          await this.extendIfNeeded();
        },
        (this.ttl / 5) * (60 / 3) * 1000,
      ); // every ttl/5 blocks
    }
  };

  extendIfNeeded = async () => {
    console.debug("checking to extend oracle");
    const height = await this.aeternity.client.getHeight();

    if (height > this.oracle.ttl - this.ttl / 5) {
      this.oracle = await this.oracle.extendOracle({
        type: "delta",
        value: this.ttl,
      });
      console.log(
        "extended oracle at height:",
        height,
        "new ttl:",
        this.oracle.ttl,
      );
    } else {
      console.debug(
        "no need to extend oracle at height:",
        height,
        "ttl:",
        this.oracle.ttl,
      );
    }
  };

  startPolling = async () => {
    if (!this.aeternity.client) throw Error("Client not initialized");

    this.stopPollQueries = await this.oracle.pollQueries(this.respond, {
      interval: 2000,
    });
    console.debug("oracle query polling started");
  };

  respond = async (queries) => {
    let query = Array.isArray(queries)
      ? queries.sort((a, b) => a.ttl - b.ttl)[queries.length - 1]
      : queries;
    if (!query || query.response !== "or_Xfbg4g==") return; //return early on no or non-empty response;

    const queryString = String(decode(query.query));
    console.log("oracle got query", queryString, query.id);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=aeternity&vs_currencies=${queryString}`,
    ).then(async (res) => (await res.json()).aeternity[queryString]);

    if (response) {
      console.log("oracle will respond:", response);
      await this.oracle.respondToQuery(
        query.id,
        new BigNumber(response).toFixed(),
        { responseTtl: query.responseTtl },
      );
    } else {
      console.log("oracle will not respond, no result found in page");
    }
  };

  stopPolling = () => {
    if (this.stopPollQueries) this.stopPollQueries();
    this.stopPollQueries = null;
    if (this.extendIfNeededInterval) clearInterval(this.extendIfNeededInterval);
    this.aeternity.stopAwaitFundingCheck();
    console.log("oracle query polling stopped");
  };

  isRunning = async () => {
    return (
      typeof this.stopPollQueries === "function" &&
      (await this.aeternity.client.height()) < this.oracle.ttl
    );
  };
};
