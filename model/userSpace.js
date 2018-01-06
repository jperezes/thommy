var mongoose = require('mongoose');
let Promise= require('bluebird')
let versions = require('../routes/getClientChannels').versions;
//mongoose.set('debug', true);

var spaceSchema = mongoose.Schema({
    username: String,
    coins: [{
      coinName:String,
      exchange:String,
      quantity:Number,
      transactionDate:Date,
      price_to_eur:Number,
      price_to_usd:Number,
      price_to_btc:Number,
      price_to_eth:Number,
      
    }]
});


spaceSchema.static({
	list: function(callback) {
		this.find({}, null, {}, callback);
	}
});
