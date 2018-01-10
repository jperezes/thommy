let bodyParser = require('body-parser');
let Promise= require('bluebird')
let CryptoApi = require("./crypto.js");
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
      reply = await criptoApi.checkBalance(bot,query.roomId);
      bot.sendMessage(query.roomId,reply)
  } else if(arrayQuest[0] === "-po") {
    reply = await criptoApi.testOrder()
    bot.sendMessage(query.roomId,reply);
  } else if(arrayQuest[0] === "-h") {
    reply = showMenu()
    bot.sendRichTextMessage(query.roomId,reply);
  } else {
    bot.sendMessage(query.roomId, "sorry didn't get that typ -h for help");
  }
  return;
}

module.exports = dialogModule;
