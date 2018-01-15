
let CryptoApi = require("../routes/crypto.js");
let schedule = require('node-schedule');
const criptoApi = new CryptoApi()


checkLastPriceAndOperate = function(bot) {
  var rule = new schedule.RecurrenceRule();
  rule.second = [0, 20, 40];
  schedule.scheduleJob('30 * * * * *', async function() {
    try {
      let savedPairs = await criptoApi.getPairsFromDB();
      for (var i = 0, len = savedPairs.length; i < len; i++) {
        let result = await criptoApi.checkLastPairPrice(savedPairs[i].pair,savedPairs[i].exchange.toLowerCase());
        let pairAndPrice = Object.assign({},{symbol:savedPairs[i].pair,price:result})
        await criptoApi.performOperations(pairAndPrice,bot);
      }
    } catch(e) {
      console.log(e);
    }
  })
}

let bot = function(roomId,result){
  console.log(result);
}

checkLastPriceAndOperate(bot)
