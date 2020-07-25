const PriceFeedOracle = require("./priceFeedOracle")

const main = async () => {
  const priceFeedOracle = new PriceFeedOracle();
  await priceFeedOracle.init();
  await priceFeedOracle.register();
  await priceFeedOracle.startPolling();
};

main();
