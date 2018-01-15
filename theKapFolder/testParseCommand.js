let CryptoApi = require("../routes/crypto.js");
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

dialogModule.prototype.parseQuestion = async function(query,bot){
   console.log("THE SCOPE IS: " + scope);
  let cleanQuestion = query.message.toLowerCase();
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
  }else if(arrayQuest[0] === "-h") {
    reply = showMenu()
    bot.sendRichTextMessage(query.roomId,reply);
  } else {
    bot.sendMessage(query.roomId, "sorry didn't get that typ -h for help");
  }
  return;
}

module.exports = dialogModule;
