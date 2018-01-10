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

let parseOrderCommand = function(command) {
  // remove first element of the array as it is -po
  let array = command.slice(1);
  let timestamp = new Date().getTime();
  let data = Object.assign({},{
    symbol: array[array.indexOf("-pair") + 1].toUpperCase(),
    side: array[array.indexOf("-s") + 1].toUpperCase(),
    type: array[array.indexOf("-t")+1].toUpperCase(),
    timeInForce:'GTC',
    quantity: parseInt(array[array.indexOf("-q") + 1]),
    timestamp:timestamp,
    price: parseFloat(array[array.indexOf("-p") + 1])
  });
  return data;
}

async function checkLastPairPrice(pair) {
  let data = Object.assign({},{symbol:pair})
  try {
    let result = await binanceRest.tickerPrice(data)
    return parseFloat(result.price);
  }catch(e) {
    console.log("error checking price" + e)
    throw new Error(e);
  }

}

async function validatePrice(data){
  try{
    console.log("object 2  is: " + JSON.stringify(data))
    let lastPrice = await checkLastPairPrice(data.symbol);
    console.log("requested price is: " + data.price + " last price is: " + lastPrice)
    if(data.side === 'SELL') {
      if(lastPrice > dataPrice) {
        console.log("should return false")
      }
      return lastPrice < data.price
    } else if(data.side === 'BUY') {
      if(lastPrice < dataPrice) {
        console.log("should return false")
      }
      return lastPrice > data.price
    }
  }catch(e)
  {
    console.log("error processing the prices: " + JSON.stringify(e))
    throw new Error('error processing the prices');
  }
}

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

cryptoModule.prototype.testOrder = async function(array) {
  let data = parseOrderCommand(array);
  try {
    let validOrder = validatePrice(data)
    if (validOrder){
      result = await binanceRest.testOrder(data);
      return "success placing the order"
    } else {
      return "price specified is either lower than current price on sell, or higher than current price on buy, aborting ..."
    }

  } catch (e) {
    console.log("error on the order: ", JSON.stringify(e))
    return "error placing the order " + e
  }

}

module.exports = cryptoModule;
