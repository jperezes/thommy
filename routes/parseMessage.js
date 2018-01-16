let bodyParser = require('body-parser');
let Promise= require('bluebird')
let CryptoApi = require("./crypto.js");
let schedule = require('node-schedule');
const criptoApi = new CryptoApi()

let scope = "";
let currentRegisteringUser = "";
let reply = "";

let dialogModule = function(){};

let registeredOptions= ["-r","unregister","-aw","-df","-sf","-es","-ds","-so","-sf","-fc", "-sc","-ag"];

let checkRegisteredOption = function(question){
  let check = ""
  registeredOptions.forEach(item=>{
    if(question.indexOf(item) !== -1){
      console.log("Menu question found")
      check = "found"
    }
  })
  if(check === "found"){
    return true;
  } else{
    console.log("unknown question")
    return false;
  }
}

let showMenu = function(){
  let options = "\n\n Usage:" +
                "\n      thomas [-h] [-help]  to print options" +
                "\n              [-pb -e <exchange>] Print your balance in exchange <exchange> \"all\" for total balance" +
                "\n              [-po -s <side> -t <type> -q <quantity> -p <price>]  Place  new order where: side: [SELL/BUY] and type: [LIMIT/MARKET] ";


  return options;
}

dialogModule.prototype.parseQuestion = async function(query,bot){
   console.log("THE SCOPE IS: " + scope);
  let cleanQuestion = query.message.toLowerCase().replace(" thomas","").replace("thomas ","").replace("?","").replace("  "," ").replace("  "," ");
  let arrayQuest = cleanQuestion.split(" ");
  let reply ="";
  if (arrayQuest[0] === "-pb"){
      console.log("abou to print the balance")
      let exchange = arrayQuest[arrayQuest.indexOf('-e') +  1]
      reply = await criptoApi.checkBalance(bot,query.roomId,exchange);
      bot.sendMessage(query.roomId,reply)
  } else if(arrayQuest[0] === "-po") {
    reply = await criptoApi.placeOrder(arrayQuest)
    bot.sendMessage(query.roomId,reply);
  } else if(arrayQuest[0] === "-pso") {
    reply = await criptoApi.saveOrderSequence(arrayQuest)
    bot.sendMessage(query.roomId,reply);
  }else if(arrayQuest[0] === "-fpos") {
    reply = await criptoApi.saveSpecifiedPriceSequence(arrayQuest)
    bot.sendMessage(query.roomId,reply);
  }else if(arrayQuest[0] === "-dp") {
    reply = await criptoApi.deletePair(arrayQuest[1])
    bot.sendMessage(query.roomId,reply);
  }else if(arrayQuest[0] === "-h") {
    reply = showMenu()
    bot.sendRichTextMessage(query.roomId,reply);
  } else {
    bot.sendMessage(query.roomId, "sorry didn't get that typ -h for help");
  }
  return;
}

dialogModule.prototype.checkLastPriceAndOperate = function(bot) {
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

module.exports = dialogModule;
