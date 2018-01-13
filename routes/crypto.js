let rp = require('request-promise');
let schedule = require('node-schedule');
const binance = require('node-binance-api');
const api = require('binance');
let TransSchema = require('../model/transactions');
let mongoose = require('mongoose');
let md5 = require('md5')
let cryptoDB = process.env.ORD_DB || 'mongodb://localhost:27017/cryptoDB';
let con;
let transModel;

if ((cryptoDB !== null)) {
  //To avoid promise warning
  mongoose.Promise = global.Promise;
  con = mongoose.createConnection(cryptoDB);
  transModel = con.model('transSchema',TransSchema)
}

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
    console.log("error checking price" + JSON.stringify(e))
    throw new Error(e);
  }
}

async function getPriceFromOptions(array, pair){
  try{
    let lastPrice = await checkLastPairPrice(pair)
    if (lastPrice < 0 || isNaN(lastPrice)) throw new Error ("error")
    let askingPrice = 0.0
    let item = "-"
    for (var i = 0, len = array.length; i < len; i++) {
      item = priceOptions[priceOptions.indexOf(array[i])];
      switch (item) {
        case "-p":
          return parseFloat(array[array.indexOf(item) + 1]);
        case "-pi":
          let increment = (parseFloat(array[array.indexOf(item) + 1]) / 100)
          console.log("increment, final price: " + increment)
          askingPrice = ((1 + increment) * lastPrice).toFixed(10);
          return parseFloat(askingPrice)
        case "-pd":
          let decrement = parseFloat(array[array.indexOf(item) + 1]) / 100;
          askingPrice = ((1 - decrement) * lastPrice).toFixed(10);
          return parseFloat(askingPrice)
        default:
          break;
      }
    }
    console.log("problem option not foud")
    throw new Error ("error valid price option not foud")
  }catch(e) {
    console.log("price calculated: " + e)
    return e
  }
}

async function parseOrderCommand(array) {
  // remove first element of the array as it is -po
  array[0] = ""
  let timestamp = new Date().getTime();
  try {
    let askingPair = array[array.indexOf("-pair") + 1].toUpperCase()
    let type = array[array.indexOf("-t")+1].toUpperCase();
    let data = Object.assign({},{
      symbol: askingPair,
      side: array[array.indexOf("-s") + 1].toUpperCase(),
      type: array[array.indexOf("-t")+1].toUpperCase(),
      timeInForce:'GTC',
      quantity: parseInt(array[array.indexOf("-q") + 1]),
      timestamp:timestamp
    });
    if(type !== 'MARKET') {
      let askingPrice = await getPriceFromOptions(array,askingPair);
      if (askingPrice < 0) throw new Error("Error price ");
      Object.assign(data,{price: askingPrice})
    }
    return data;
  }catch(e) {
    throw e
  }
}

async function parseOrderSequence(array) {
  // remove first element of the array as it is -po
  let sequence = new transModel();
  try {
    array[0] = ""
    let objArray = [{}];
    let j = 0;
    let askingPair = array[array.indexOf("-pair") + 1].toUpperCase()
    let lastPrice = await checkLastPairPrice(askingPair)
    let askingQuantity = parseInt(array[array.indexOf("-q") + 1])
    for (let i = 0, len = array.length; i < len; i++) {
      let tempObj =  {}
      if(array[i] === "-s") {
        tempObj = Object.assign({},{side : array[i + 1].toUpperCase(),quantity:askingQuantity})
        if(array[i+2] == "-pi"){
          let increment = (parseFloat(array[i + 3]) / 100)
          let askingPrice = ((1 + increment) * lastPrice).toFixed(10);
          tempObj = Object.assign(tempObj,{price : parseFloat(askingPrice)})
        } else if (array[i+2] == "-pd") {
          let decrement = (parseFloat(array[i + 3]) / 100)
          let askingPrice = ((1 - decrement) * lastPrice).toFixed(10);
          tempObj = Object.assign(tempObj,{price : parseFloat(askingPrice)})
        } else {
          return "error";
        }
        tempObj = Object.assign(tempObj,{order_pos : j})
        objArray[j]=tempObj;
        j=j+1;
      }
    }
    let dateSubmission = new Date().getTime();
    let data = Object.assign({},{
      pair: askingPair,
      transactions: {
      transId: md5("toek" + dateSubmission),
      placingDate: dateSubmission,
      exchange:'Binance',
      operations: objArray
    }
    });
    console.log("object array is : " + JSON.stringify(objArray))
    return data;
  }catch(e) {
    throw e
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

let placeOrder = async function(array) {
  try {
    let data = await parseOrderCommand(array);
    let validOrder = true;
    if(data.type === 'LIMIT')
    {
      validOrder = await validatePrice(data);
    }
    console.log("validOrder is" + validOrder)
    if (validOrder === true){
      result = await binanceRest.newOrder(data);
      console.log("result from binance is: " + result)
      return "success placing the order"
    } else {
      return "price specified is either lower than current price on sell, or higher than current price on buy, aborting ..."
    }
  } catch (e) {
    console.log("error on the order: ", JSON.stringify(e))
    throw e
  }
}

let saveTransactions = function(){
    trans = new transModel();
    let timestamp = new Date().getTime();
    trans.pair = "BNBBTC";
    trans.transactions.placingDate = timestamp
    trans.transactions = [{}];
    trans.transactions[0].transId = "testID";
    trans.transactions[0].exchange = "Binance";
    trans.transactions[0].operations = [
      {"side":"SELL","price":0.7,"quantity":100},
      {"side":"BUY","price":0.45,"quantity":100},
      {"side":"SELL","price":0.8,"quantity":100},
      {"side":"BUY","price":0.5,"quantity":100},
      {"side":"SELL","price":1.2,"quantity":100}];

      trans.save(err =>{
        let saveReply="";
        if (err) {
          saveReply = "error saving to the database, try again later"
        } else {
          console.log("spaced saved to database")
          saveReply = "Welcome to SparkWorld";
        }
      });
}
let checkOperations = function(array,currentPrice) {
  if(array[0].side === 'SELL'){
    if(currentPrice > array[0].price) {
      let command = " -s sell -t market -q " + array[0].quantity;
      console.log(command)
      let data = Object.assign( {}, {updatedOp: array.slice(1), op:command, success: true});
      return data;
    } else {
      console.log(currentPrice + " price too low, not selling ... [asking price " + array[0].price + "]")
      return null
    }
  } else if (array[0].side === 'BUY') {
    if(currentPrice < array[0].price) {
      let command = " -s buy -t market -q " + array[0].quantity;
      console.log(command)
      let data = Object.assign( {}, {updatedOp: array.slice(1), op:command, success: true});
      return data;
    } else {
      console.log(currentPrice + " price too high, not buying ...[asking price " + array[0].price + "]")
      return null
    }
  }
}
let object = {
  symbol:"BNBBTC",
  price: "0.8323"
}

async function saveOrderSequence(orderString) {
  try {
    let orderArray = orderString.split(" ")
    let orderObject = await parseOrderSequence(orderArray);
    if(typeof(orderObject.pair) === 'undefined') {
      throw new Error("pair invalid")
    }
    let modelObject = new transModel()
    Object.assign(modelObject,orderObject)
    await transModel.updateSequence(modelObject);
  }catch(e) {
    console.log(e);
  }
}

const orders=["-pso -pair trxbtc -s sell -pi 5 -s buy -pd 1 -s sell -pi 10 -s buy -pi 1 -s sell -pi 16 -q 10000",
              "-pso -pair adabtc -s sell -pi 5 -s buy -pd 1 -s sell -pi 6 -s buy -pi 2 -s sell -pi 15 -q 900"]

async function performOperations(pairPrice) {
  let operation = {}
  try {
    console.log("pair symbol is: " + pairPrice.symbol)
    let result = await transModel.checkSavedOrder(pairPrice);
    if(result !== null){
      for (let i = 0, len = result.transactions.length; i < len; i++) {
        operation = checkOperations(result.transactions[i].operations,parseFloat(pairPrice.price))
        if(operation !== null) {
          console.log("last price is: " + pairPrice.price + " asking price is: " + result.transactions[i].operations[0].price)
          console.log("final comand is: -po -pair " + pairPrice.symbol + operation.op);
          let fullOrder = "-po -pair " + pairPrice.symbol + operation.op
          let orderResult = await placeOrder(fullOrder.split(" "))
          await transModel.updateTransaction(result.transactions[i].transId,operation.updatedOp);
          console.log("database updated after perform operation\n")
          console.log("about to send command: " + operation.op)
        }
      }
    }
  } catch (e){
    console.log("got an error in: " + "perfomOperations: " + e);
  }
}

let checkLastPriceAndOperate = function() {
  schedule.scheduleJob('30 * * * * *', async function() {
    try {
      let savedPairs = await getPairsFromDB();
      for (var i = 0, len = savedPairs.length; i < len; i++) {
        let result = await checkLastPairPrice(savedPairs[i]);
        let pairAndPrice = Object.assign({},{symbol:savedPairs[i],price:result})
        await performOperations(pairAndPrice);
      }
    } catch(e) {
      console.log(e);
    }
  })
}
async function getPairsFromDB() {
  try {
    let res = await transModel.list({})
    let array=[];
    res.forEach(item => {
      array.push(item.pair);
    })
    return array;
  } catch(e) {
    console.log(e);
  }

}
checkLastPriceAndOperate();
//saveOrderSequence(orders[1])
//performOperations(object)

module.exports = cryptoModule;
