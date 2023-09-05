const PriceFeedOracle = require("./priceFeedOracle");

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const main = async () => {
  const priceFeedOracle = new PriceFeedOracle();
  await priceFeedOracle.init();
  await priceFeedOracle.register();
  await priceFeedOracle.startPolling();
};

void main();
