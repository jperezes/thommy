var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var botModule = function(){};
var botSpark;
var messageTest;
botModule.prototype.setBot = function(bot, message){
  botSpark = bot;
  this.messageTest = message;
}

botModule.prototype.listenForStadistics = function(bot,app){
  this.app = app;
  this.app.use(bodyParser.urlencoded({extended: true}));
  this.app.use(bodyParser.json());
  this.app.use('/v1',router);
  router.use(function(req, res, next) {
    //in the future some middleware can be added here.
    next();
  });
  router.route('/test').post(function(req, res) {

    //Save the date when the query arrived
    var datetime = new Date();
    console.log("slunk data received: " + req);
    // if (req.headers.authorization !== process.env.AUTH_TOKEN_STATISTICS) {
    //   console.log('sorry authenticatin failed: ' );
    //   return;
    // }


    bot.sendRichTextMessage(process.env.NUCK_DOLORES_ROOM,"api works so far", function(){})
  });

}

module.exports = router;
module.exports = botModule;
