let rp = require('request-promise');
let schedule = require('node-schedule');
const binance = require('node-binance-api');
let cryptoModule = function(){};

cryptoModule.prototype.checkTicker = async function checkResult(){
  console.log("about to parse the data from kraken")
  res = await rp({url:"https://api.kraken.com/0/public/Ticker?pair=XXRPZEUR",method:'GET'});
  res = JSON.parse(res)
  console.log(res.result.XXRPZEUR.c[0])

  binance.prices(function(ticker) {
	console.log("Price of BNB: ", ticker.BNBBTC);
});

}

cryptoModule.prototype.getAllPairs = function(roomId,bot){
  binance.prices(function(ticker){
    bot.sendRichTextMessage(roomId,ticker,function(){})
  })
}

cryptoModule.prototype.getPairPrice = function(roomId,bot){
  binance.prices(function(ticker){
    bot.sendRichTextMessage(roomId,ticker,function(){})
  })
}

module.exports = cryptoModule;
