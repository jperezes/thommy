var mongoose = require('mongoose');
let Promise= require('bluebird')
//mongoose.set('debug', true);

var transSchema = mongoose.Schema({
    pair: String,
    transactions: [{
      transId:String,
      exchange:String,
      operation:[{
        side:String,
        price:Number,
        quantity:Number
      }]
    }]
});


transSchema.static({
	list: function(callback) {
		this.find({}, null, {}, callback);
	}
});

transSchema.statics.checkSavedOrder = function (priceObject) {
  return new Promise((resolve,reject) =>{
    this.find({pair: priceObject.symbol}, function(err, result) {
        if(err) {
          let reply = "Failed to ad the keyword with following error: " + err;
          resolve(reply)
        } else {
          console.log("The result of saved tranactions is: " + JSON.stringify(result))
          resolve(result)
        }
  });
  })
}

transSchema.statics.addTransaction = function (transaction) {
  return new Promise((resolve,reject) =>{
    transaction.save(function(err){
      if(err) {
        resolve("error saving the transaction to the database")
      } else {
        console.log("user saved to the database")
        resolve("transaction saved into the database")
      }
    })
  })
}

module.exports = transSchema;
