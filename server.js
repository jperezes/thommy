let port = process.env.PORT || 1349;
let sparklite = require("sparklite");
let botdomain = process.env.TOMY_URL;
let CheckCurrency = require('./routes/checkCripto');
let TestApi = require('./routes/temp.js')

console.log("bot domain: " + botdomain)
console.log("bot key: " + process.env.TOMY_KEY)
let checkCurrency = new CheckCurrency()
let testApi = new TestApi()
let sparkBot = new sparklite.SparkBot(process.env.TOMY_KEY, port, botdomain);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
sparkBot.printHelloWorld();
sparkBot.on('message', function(event){
  console.log('I have received an event!!!')
   var mail = event.personEmail.split('@');
   console.log("message received + :" + JSON.stringify(event))
   if (mail[1] === "cisco.com"){

     let message = "your room id is : " + event.roomId;
     testApi.getAllPairs(event.roomId,sparkBot)
   } else {

     sparkBot.sendMessage(event.roomId, "Hi, sorry to tell you that but you're not allowed to proceed",function(){});
   }
  console.log(JSON.stringify(event));
});

sparkBot.on('rooms', function(event){
    console.log(JSON.stringify(event));
});

sparkBot.on('memberships', function (event){
    console.log(JSON.stringify(event));
});


let bot = function(result){
  console.log(result);
}
testApi.listenForStadistics(sparkBot, sparkBot.getServer());
//checkCurrency.scheduleServer(bot);
