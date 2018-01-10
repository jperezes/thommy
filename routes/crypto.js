let rp = require('request-promise');
let schedule = require('node-schedule');
const binance = require('node-binance-api');
const api = require('binance');
let cryptoModule = function(){};

const binanceRest = new api.BinanceRest({
    key: process.env.BIN_KEY, // Get this from your account on binance.com
    secret: process.env.BIN_SEC, // Same for this
    timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
    recvWindow: 10000000, // Optional, defaults to 5000, increase if you're getting timestamp errors
    disableBeautification: false
    /*
     * Optional, default is false. Binance's API returns objects with lots of one letter keys.  By
     * default those keys will be replaced with more descriptive, longer ones.
     */
});

cryptoModule.prototype.checkBalance = async function(bot,roomId) {
      let reply = "My master, your balance is: \n";
      result = await binanceRest.account();
      let balances = result.balances;
      if (typeof(balances !== 'undefined')) {
        balances.forEach(item => {
          if(parseFloat(item.free) > 0.001) {
            reply = reply + item.asset + ": " + item.free + "\n"
          }
        })
      }
      bot.sendMessage(roomId,reply,function(){})
}

cryptoModule.prototype.testOrder = async function() {
      let reply = "My master, your balance is: \n";
      let timestamp = new Date().getTime();
      const data = {
        symbol: "ADABTC",
        side:"SELL",
        type:"LIMIT",
        timeInForce:"GTC",
        quantity: "200",
        price:"0.00005804"
      }
      try {
        result = await binanceRest.testOrder(data);
        return "success placing the order"
      } catch (e) {
        console.log("error on the order: ", JSON.stringify(e))
        return "error placing the order " + e
      }
}

module.exports = cryptoModule;
