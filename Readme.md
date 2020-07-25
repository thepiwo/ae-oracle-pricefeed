# Aeternity Pricefeed Oracle

## Host yourself

```bash
# checkout repository
git clone https://github.com/thepiwo/ae-oracle-pricefeed
cd ae-oracle-pricefeed

# build container
docker build -t ae-oracle-pricefeed

# run, follow instructions to fund account, configure NODE_URL for other aeternity node
docker run -it --name pricefeed -v "$PWD/.data:/app/.data" -e NODE_URL=https://testnet.aeternity.io/ ae-oracle-pricefeed
```

## Use hosted

to integrate with your smart contract you can copy the logic or deploy these separately and do remote calls

 - to query any compatible oracle compare [PriceFeedQuery.aes](./PriceFeedQuery.aes) 
 - to query a fixed oracle compare [PriceFeedQueryFixedOracle.aes](./PriceFeedQueryFixedOracle.aes) 

1. call `queryAePrice` passing the required query fee as amount, save returned query id
2. after oracle probably responded, use the saved query id and call `checkQuery` to receive price returned from oracle

## Sample hosted mainnet oracle contract
`ct_29LHZSA9r7FpR5UxHtip9RYUFhtvT3tQcQosZZHUg4FM7dXT6c` fee 200000000000000 aetto

## Sample sdk integration
 - implementation [src/exampleSDK.js](./src/exampleSDK.js) 
 - running `NODE_URL=https://mainnet.aeternity.io/ CONTRACT_ADDRESS=ct_GfST8P7YxMv2TpTSwh9SC1qgH7QdQqz8WjCTzyG1sDxxpKNHN PUBLIC_KEY=... SECRET_KEY=... node src/exampleSDK.js`
