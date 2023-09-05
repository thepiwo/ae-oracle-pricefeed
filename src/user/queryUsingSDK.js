const { Node, MemoryAccount, AeSdk } = require("@aeternity/aepp-sdk");
const BigNumber = require("bignumber.js");

const url = "https://testnet.aeternity.io/";

class QueryUsingSDK {
  initClient = async () => {
    if (!process.env.SECRET_KEY) throw Error("SECRET_KEY not defined");

    if (!this.client) {
      this.client = new AeSdk({
        nodes: [
          {
            name: "node",
            instance: new Node(process.env.NODE_URL || url),
          },
        ],
        accounts: [new MemoryAccount(process.env.SECRET_KEY)],
      });
    }
  };

  initOracle = async () => {
    if (!process.env.ORACLE_ID) throw Error("ORACLE_ID not defined");
    if (!this.oracle)
      this.oracle = await this.client.getOracleObject(process.env.ORACLE_ID);
    console.log("initialized oracle:", this.oracle.id);
  };

  queryAePrice = async (currency) => {
    if (!this.oracle) throw Error("Oracle not initialized");
    const query = await this.oracle.postQuery(currency, {
      queryFee: this.oracle.queryFee,
      // optionally specify ttl
      //queryTtl: { type: "delta", value: 20 },
      //responseTtl: { type: "delta", value: 20 },
    });

    console.log(`queried for '${currency}' with query id: ${query.id}`);
    return query;
  };

  pollForResponse = async (query) => {
    const response = await query.pollForResponse();
    console.log(
      "got response:",
      new BigNumber(response).div(10 ** 18).toFixed(),
      `raw: (${response})`,
    );
  };
}

const runExample = async () => {
  const example = new QueryUsingSDK();
  await example.initClient();
  await example.initOracle();

  const query = await example.queryAePrice("eur");
  await example.pollForResponse(query);
};

void runExample();
