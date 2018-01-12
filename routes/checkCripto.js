let schedule = require('node-schedule');
let Promise= require('bluebird')
let rp = require('request-promise');
let bodyParser = require('body-parser');
var express = require('express');
let Crypto = require('./crypto.js')
var router = express.Router();

let cryptoModule = new Crypto();
let requestCurrencies = function(){};
// Set the headers
let headers = {
    'Content-Type': 'application/json'
}

// Configure the request
let options = {
    url: "https://api.coinmarketcap.com/v1/ticker/Ripple?convert=EUR",
    method: 'GET'
}
let trend ={
  "Bitcoin":[String],
  "Ripple":[String],
  "Ethereum":[String],
  "NEM":[String],
  "Litecoin":[String],
  "Dash":[String],
  "Ethereum Classic":[String],
  "Stellar Lumens":[String],
  "Monero":[String],
  "Bytecoin":[String],
  "Siacoin":[String],
  "Golem":[String],
  "Steem":[String],
  "BitShares":[String],
  "Dogecoin":[String],
  "Gnosis":[String],
  "Stratis":[String],
  "Augur":[String],
  "GameCredits":[String],
  "Waves":[String],
  "MaidSafeCoin":[String],
  "Zcash":[String],
  "DigixDAO":[String],
  "DigiByte":[String],
  "Ardor":[String],
  "SingularDTV":[String],
  "Round":[String],
  "Decred":[String],
  "Iconomi":[String],
  "Factom":[String],
  "Lisk":[String],
  "BitConnect":[String],
  "Nxt":[String],
  "Tether":[String],
  "FirstBlood":[String],
  "SysCoin":[String],
  "PIVX":[String],
  "Byteball":[String],
  "Peercoin":[String],
  "Aragon":[String],
  "Komodo":[String],
  "Emercoin":[String],
  "AntShares":[String],
  "iExec RLC":[String],
  "Melon":[String],
  "Namecoin":[String],
  "Storjcoin X":[String],
  "Lykke":[String],
  "BitcoinDark":[String],
  "Counterparty":[String],
  "Gulden":[String],
  "NAV Coin":[String],
  "YbCoin":[String],
  "Nexus":[String],
  "PotCoin":[String],
  "Xaurum":[String],
  "Synereo":[String],
  "Burst":[String],
  "BitBay":[String],
  "TokenCard":[String]
}

requestCurrencies.prototype.scheduleServer = function(bot){
  cryptoModule.checkTicker();
  // schedule.scheduleJob('30 * * * * *', Promise.coroutine(function* () {
  //     let message ="Hello Joan last hour criptocurrency update:";
  //     let tempMessage="";
  //
  //     result = yield rp({url:"https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=60",method:'GET'});
  //     result = JSON.parse(result)
  //     console.log("result of the request " + result)
  //     result.forEach(item =>{
  //     //  console.log("\"" + item.name +"\""  + ":[String],")
  //       trend[item.name][0] = item.name.percent_change_24h;
  //       console.log(trend[item.name] + " -- " + trend[item.name][0])
  //       //console.log("24h " + item.name + " -> " + item.percent_change_24h + "%"+ " -- 1h " + item.percent_change_1h + " #price euro: " + item.price_eur);
  //       tempMessage = "\n\n >24h " + item.name + " -> " + item.percent_change_24h + "%" + " -- 1h " + item.percent_change_1h + " #ppe: " + item.price_eur;
  //       message = message + tempMessage;
  //     })
  //
  //      bot.sendRichTextMessage(process.env.NUCK_DOLORES_ROOM,message,function(){
  //       console.log("user found about to send him a message");
  //     });
  //
  //
  //     return;
  //   }));
}

cryptoModule.checkTicker();
module.exports = requestCurrencies;
