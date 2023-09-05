function fetchUpstreamResponse(queryString) {
  return fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=aeternity&vs_currencies=${queryString}`,
  ).then(async (res) => (await res.json()).aeternity[queryString]);
}

module.exports = {
  fetchUpstreamResponse,
};
