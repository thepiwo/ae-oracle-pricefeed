# Aeternity Pricefeed Oracle
The **ae-oracle-pricefeed** is an example service that can be hosted and allows clients to query the current price of AE.

On startup of the service following tasks are being executed:
1. The sdk-client is being initialized with the keypair provided via `./data/keypair.json` (when using the command to host by hourself) or alternatively generates a new keypair if no keypair is provided
1. The service checks if the account of the provided keypair has enough funds to run the oracle
    - if NOT it prints the respective information in the console and waits for respective funding (on testnet this can easily be done using https://faucet.aepps.com/)
1. If the balance check is successful the service checks if the oracle is already registered
    - if NOT the oracle will be registered
1. The service logs the oracle id to the console
    - this will be required for other contracts or services in order to query the oracle
1. The service now periodically:
    - extends the TTL of the oracle if necessary
    - polls the node for queries that have to be answered
    - responds to queries if they exist

## Host yourself

```bash
# checkout repository
git clone https://github.com/thepiwo/ae-oracle-pricefeed
cd ae-oracle-pricefeed

# build container
docker build -t ae-oracle-pricefeed .

# run, follow instructions to fund account, configure NODE_URL for other aeternity node
docker run -it --init --name pricefeed -v "$PWD/.data:/app/.data" -e NODE_URL=https://testnet.aeternity.io/ ae-oracle-pricefeed
```

## Hosted on mainnet

There the ae-oracle-pricefeed oracle is running on mainnet:
- https://mainnet.aeternity.io/v3/oracles/ok_2NRBaMsgSDjZRFw4dU82KCqLa5W7aQdbJAzaFprTpjEGLAzroV

## Sample how to query the oracle using the SDK
- implementation [src/user/queryUsingSDK.js](./src/user/queryUsingSDK.js) 
- running `NODE_URL=https://testnet.aeternity.io/ ORACLE_ID=... SECRET_KEY=... node src/user/queryUsingSDK.js` will initialize the SDK, query the oracle for the AE price in EUR and wait for the response of the oracle
    - it's required to provide `ORACLE_ID` and `SECRET_KEY`
    - the `ORACLE_ID` should be visible in the logs of ae-oracle-pricefeed service
    - for `SECRET_KEY` you should - of course - use your own key and you need to make sure that the account you are using has enough funds to query the oracle (for testnet you can use https://faucet.aepps.com/)

## Query the oracle in a contract
- Deploy [PriceFeedQuery.aes](./PriceFeedQuery.aes) and provide the oracle id of any compatible oracle for deployment
- Call the `queryAePrice` function by providing a valid coingecko currency code, e.g. `eur` and of course the required oracle fee for the query
    - to check the query fee call the `queryFee` function
    - the function will return the oracle query id
- Call the `checkQueryStr` function by providing the query id in order to get the response of the oracle as string, multiplied by 10^18 to provide greater int precision 
- Call the `checkQueryFrac` function by providing the query id in order to get the response of the oracle in fractional representation 