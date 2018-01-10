let rp = require('request-promise');
let schedule = require('node-schedule');
const binance = require('node-binance-api');
const api = require('binance');
let cryptoModule = function(){};

const priceOptions= ["-p","-pi","-pd"];

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

async function getPriceFromOptions(array, pair){
  let result = priceOptions.forEach(async (item) =>{
    if(array.indexOf(item) !== -1){
      console.log("Valid index option found: " + item)
      let lastPrice = -1;
      switch (item) {
        case "-p":
          return parseFloat(array[array.indexOf(item) + 1]);
          break;
        case "-pi":
          lastPrice = await checkLastPairPrice(pair)
          let increment = parseFloat(array[array.indexOf(item) + 1]) / 100;
          return parseFloat(1 + increment) * lastPrice;
          break;
        case "-pd":
          lastPrice = await checkLastPairPrice(pair)
          let decrement = parseFloat(array[array.indexOf(item) + 1]) / 100;
          return parseFloat(1 - decrement) * lastPrice;
          break;
        default:
          return "error -- from default"
          break;
      }
    }
  })
  console.log("price calculated: " + result)
  return result
}

async function parseOrderCommand(array) {
  // remove first element of the array as it is -po
  array[0] = ""
  let timestamp = new Date().getTime();
  try {
    let askingPair = array[array.indexOf("-pair") + 1].toUpperCase()
    let askingPrice = await getPriceFromOptions(array,askingPair);
    if (askingPrice < 0) return "Error price ";
    let data = Object.assign({},{
      symbol: askingPair,
      side: array[array.indexOf("-s") + 1].toUpperCase(),
      type: array[array.indexOf("-t")+1].toUpperCase(),
      timeInForce:'GTC',
      quantity: parseInt(array[array.indexOf("-q") + 1]),
      timestamp:timestamp,
      price: askingPrice
    });
    return data;
  }catch(e) {
    return e
  }
}

async function validatePrice(data){
  try{
    console.log("object 2  is: " + JSON.stringify(data))
    let lastPrice = await checkLastPairPrice(data.symbol);
    console.log("requested price is: " + data.price + " last price is: " + lastPrice)
    if(data.side === 'SELL') {
      if(lastPrice > data.price) {
        console.log("selling below the current price. Aborting ...")
        return false
      }
      return true
    } else if(data.side === 'BUY') {
      if(lastPrice < data.price) {
        console.log("buying above the current price. Aborting ...")
        return false
      }
      return true
    }
  }catch(e)
  {
    console.log("error processing the prices: " + e)
    return false
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

  try {
    let data = await parseOrderCommand(array);
    return "data to be sent is: "  + JSON.stringify(data)
    let validOrder = await validatePrice(data)
    console.log("validOrder is" + validOrder)
    if (validOrder === true){
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
