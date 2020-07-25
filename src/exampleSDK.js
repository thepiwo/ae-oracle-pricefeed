const fs = require('fs');
const {Universal, Node, MemoryAccount} = require('@aeternity/aepp-sdk');
const PriceFeedQueryFixedOracle = fs.readFileSync(__dirname + '/../PriceFeedQueryFixedOracle.aes', 'utf-8');

class ExampleSDK {

  init = async (keyPair) => {
    if (!process.env.NODE_URL) throw "NODE_URL not defined";

    if (!this.client) {
      this.client = await Universal({
        nodes: [
          {
            name: 'node',
            instance: await Node({
              url: process.env.NODE_URL,
              internalUrl: process.env.NODE_URL,
            }),
          }],
        accounts: [MemoryAccount({keypair: keyPair})],
        compilerUrl: 'https://latest.compiler.aepps.com'
      });
    }

    if (!process.env.CONTRACT_ADDRESS) throw "CONTRACT_ADDRESS not defined";
    this.contract = await this.client.getContractInstance(PriceFeedQueryFixedOracle, {contractAddress: process.env.CONTRACT_ADDRESS})
  };

  queryAePrice = async (currency, fee) => {
    if (!this.contract) throw "Contract not initialized";
    return this.contract.methods.queryAePrice(currency, {amount: fee}).then(res => res.decodedResult);
  }

  checkQuery = async (query) => {
    if (!this.contract) throw "Contract not initialized";
    return this.contract.methods.checkQuery(query).then(res => res.decodedResult);
  }
}

const example = async () => {
  if (!process.env.PUBLIC_KEY || !process.env.SECRET_KEY) throw "PUBLIC_KEY or SECRET_KEY not defined";
  const exampleSDK = new ExampleSDK();
  await exampleSDK.init({publicKey: process.env.PUBLIC_KEY, secretKey: process.env.SECRET_KEY});

  const query = await exampleSDK.queryAePrice("btc", 200000000000000);
  console.log("query", query);
  setTimeout(async () => {
    console.log(await exampleSDK.checkQuery(query));
  }, 5000);
}

example();
