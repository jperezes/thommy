var mongoose = require('mongoose');
let Promise= require('bluebird')
var sleep = require('sleep');
//mongoose.set('debug', true);

var transSchema = mongoose.Schema({
    pair: String,
    transactions: [{
      transId:String,
      placingDate: Date,
      exchange:String,
      operations:[{
        order_pos: Number,
        side:String,
        price:Number,
        quantity:Number
      }]
    }]
});

transSchema.static({
	list: async function() {
		return await this.find({}, null, {});
	}
});

transSchema.statics.checkSavedOrder = function (priceObject) {
  return new Promise((resolve,reject) =>{
    this.findOne({pair: priceObject.symbol}, function(err, result) {
        if(err) {
          let reply = "Failed to ad the keyword with following error: " + err;
          resolve(reply)
        } else {
          resolve(result)
        }
  });
  })
}

transSchema.statics.updateTransaction = function (transId,newArray) {
  return new Promise((resolve,reject) => {
      this.findOne({'transactions.transId': transId}, function(err, result) {
          if(err) {
            console.log("error updating the database: " + err)
            resolve(false)
          } else {
            result.transactions[0].operations = newArray;
            result.save(err => {
              if(err) {
                console.log("error updating the database");
              }
              console.log("database updated...");
            })
        }});
      })
}

transSchema.statics.updateSequence = async function(object) {
  let result = await this.findOne({pair:object.pair})
  if(result !== null) {
    await this.update({pair:object.pair}, {$push:{transactions: object.transactions[0] }})
  } else {
    let saved = await object.save();
  }
}

transSchema.statics.getSavedPairs = async function() {
  let allThings = this.list({});
  console.log("all things found are: " + JSON.stringify(allThings))
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
