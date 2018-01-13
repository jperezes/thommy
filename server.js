let port = process.env.PORT || 1349;
//let SparkBot = require("./routes/sparkRegNew.js");
let DialogModule = require("./routes/parseMessage.js");
let PriceServ = require("./routes/crypto.js");
let botdomain = process.env.TOMY_URL;
//let sparkBot = new SparkBot(process.env.TOMY_KEY, port, botdomain);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const dialogModule = new DialogModule()
sparkBot.sparkBotEmitter.on('message', function(event){
  console.log('I have received an event!!!')
   var mail = event.personEmail;
   console.log("message received + :" + JSON.stringify(event))
   if (mail === process.env.MY_MAIL){
     dialogModule.parseQuestion(event,sparkBot);
   } else {
     sparkBot.sendMessage(event.roomId, "Hi, sorry to tell you that but you're not allowed to proceed",function(){});
   }
  console.log(JSON.stringify(event));
});

sparkBot.sparkBotEmitter.on('rooms', function(event){
    console.log(JSON.stringify(event));
});

sparkBot.sparkBotEmitter.on('memberships', function (event){
    console.log(JSON.stringify(event));
 });


let bot = function(result){
  console.log(result);
}

dialogModule.checkLastPriceAndOperate(sparkBot)
//testApi.listenForStadistics(sparkBot, sparkBot.getServer());
//checkCurrency.scheduleServer(bot);
