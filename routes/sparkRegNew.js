let express = require('express')
let router = express.Router();
const bodyParser = require("body-parser");
let rp = require('request-promise');
const EventEmitter = require('events');
class SparkBotEmitter extends EventEmitter {}

// Default options
const defaults = {
  url: "https://api.ciscospark.com",
  headers:{
    'Content-Type': 'application/json; charset=utf-8'
  },
  json: true,
  method:'POST',
	timeout : 5000
};

// Send an API request
const sendRequest = async (data, parentMethod) => {
  console.log("SPARK - API Sending object: " + JSON.stringify(data))
  try {
    const response  = await rp(data);
    return response;
  } catch (e) {
    console.log("[ "+ parentMethod +" ]: " +"Error sending the Request to Spark API: " + e)
  }
};

/**
 * SparkBotApi register the bot to Cisco Spark Api
 * @param {String}        token          Bot token Key
 * @param {Number}        port           Port listening for events
 * @param {String}        botdomain      Bot url listening to events
 * @param {Number}        webhookPort    Not used yet, for websockets
 */
class SparkBotApi {
	constructor(token, port, botdomain,webhookPort) {
    Object.assign(defaults.headers,{'Authorization': 'Bearer ' + token})
		this.config = Object.assign({port, botdomain}, defaults);
    this.sparkBotEmitter = new SparkBotEmitter();
    this.app = express()
    this.initServer(this.app);
    this.initializeWeebHooks();
	}

  /**
   * This method register the webhook for all events on the Spark Api
   */
  async registerWebHooks(){
    console.log("SPARK API - about to register webhooks");
    let options = Object.assign({},this.config);
    options.url = options.url + "/v1/webhooks"
    const callbackListener = 'v1/webhooklistener'
    const targetUrl = 'http://' + options.botdomain + '/' + callbackListener;
    const messageData = {
         'name': 'GlobalListener',
         'targetUrl':targetUrl,
         'resource': 'messages',
         'event': 'all'
    }
    let data = Object.assign( options, {body:messageData});
    const response = await sendRequest(data, 'registerWebHooks');
    return response;
  }

  /**
   * This method returns all registered webhooks on the Spark API
   */
  async readRegisteredWebHooks() {
      let options = Object.assign({},defaults);
      options.url = options.url + '/v1/webhooks'
      options.method = 'GET'
      const result = await sendRequest(options, 'readRegisteredWebHooks')
      return result
  }

  /**
   * This method unregister the specified webhooks
   * @param {object}   webHook webhook to be unregistered
   */
  async deleteWebHook (webHook) {
      let options = Object.assign({},defaults);
      options.url = options.url + '/v1/webhooks/'  + webHook.id
      options.method = 'DELETE'
      const result = await sendRequest(options,'deleteWebHook');
  }

  /**
   * This method unregister All registred webhooks for the Bot
   */
  async deleteAllWebHooks() {
    try {
      let webhooks = await this.readRegisteredWebHooks()
      if(typeof(webhooks.items[0].id) === 'undefined') {
        console.log("no webhooks registered")
      } else {
        webhooks.items.forEach(async (item) => {
            if(typeof(item) === 'undefined') {
              return
            }
            await this.deleteWebHook(item);
        })
      }
    } catch(e) {
        console.log("error deleting the webhook: " + e)
    }
    return false;
  }

  /**
   * This method initializer the webhooks for the Bot by deleting all and registering again
   */
  async initializeWeebHooks() {
    try {
      await this.deleteAllWebHooks();
      console.log("All registered callbacks deleted");
      await this.registerWebHooks();
    } catch (e) {
      console.log("error initializing the webhooks: " + e)
    }
  }

  async getMyDetails() {
    let options = Object.assign({},defaults);
    options.url = defaults.url + '/v1/people/me'
    options.method = 'GET'
    const result = await sendRequest(options, 'getMyDetails');
    return result;
  }

  async readMessage(message) {
    let options = Object.assign({},defaults);
    options.url = options.url + '/v1/messages/' + message.id
    options.method = 'GET'
    const result = await sendRequest(options,'readMessage');
    return result;
  }

  async readPersonDetails(personId) {
    let options = Object.assign({},defaults);
    options.url = options.url + '/v1/people/' + personId
    options.method = 'GET'
    const result = await sendRequest(options, 'readPersonDetails');
    return result
  }

  async getBotName() {
    if (this.botname == undefined || this.botname == null) {
      try {
        const result = await this.getMyDetails()
        this.botName = result.emails[0]
        console.log("Bot name found: " + this.botName);
      }catch(e){
        console.log("Error getting my details" + e)
      }
    } else {
        return this.botName;
    }
  }

  async sendMessage(roomId, txt) {
    let options = Object.assign({},defaults);
    options.url = options.url + "/v1/messages/"
      var messageData = {
          'roomId': roomId,
          'text': txt
      }
      Object.assign(options,{body:messageData})
      const result = await sendRequest(options, 'sendMessage');
  }
  async sendMessageToDirectPerson(personEmail, txt) {
      let options = Object.assign({},defaults);
      options.url = options.url + "/v1/messages/"
        var messageData = {
            'toPersonEmail': personEmail,
            'text': txt
        }
        Object.assign(options,{body:messageData})
        const result = await sendRequest(options, 'sendMessage');
        return result
  }
  async sendRichTextMessage(roomId, txt) {
      let options = Object.assign({},defaults);
      options.url = options.url + "/v1/messages/"
      var messageData = {
          'roomId': roomId,
          'markdown': txt
      }
      Object.assign(options,{body:messageData})
      const result = await sendRequest(options, 'sendMessage');
      return result;
  }

  async handlePostRequest(req) {
    try {
      if (typeof(req.body) === 'undefined') {
        return "error parsing the body";
      }
      if (req.body.resource == 'messages') {
          console.log("POST event received:\n" + req)
          var message = req.body.data;
          await this.getBotName();
          if (message.personEmail !== this.botName) {
            const result = await this.readMessage(message);
            let txt = result.text;
            let personId = message.personId;
            const personDetails = await this.readPersonDetails(personId);
            message.message = txt
            message.person = personDetails
            this.sparkBotEmitter.emit('message',message)
          }
          return "Webhook received"
      }
    } catch(e) {
      console.log("error handling the post request: " + e)
      return e
    }
  }

  /**
   * Init the express server
   */
  initServer(app){
    console.log("Spark Bot API - about to init the server")
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use('/v1',router);
    let port = this.config.port
    router.use(function (req, res, next) {
      next();
    });
    router.route('/webhooklistener').post(async (req, res) => {
      try {
        console.log("webhook received")
        let result = await this.handlePostRequest(req)
        res.send(result)
      } catch(e) {
        res.send("Error processing the post request" + e)
      }

    });
    router.route('/init').get(async(req, res) =>  {
      try{
        await this.initializeWeebHooks();
        res.send('bot re-initialized')
      } catch(e) {
        res.send("error initializing");
      }

    });
    app.listen(port, function(port) {
        console.log(('\n\nBot started at port: ' + port).red)
    })
  }
}

module.exports = SparkBotApi;
