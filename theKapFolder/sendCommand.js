let DialogModule = require("./testParseCommand.js");
const dialogModule = new DialogModule()


class bot {
  sendMessage(roomId,result) {
    console.log(result)
  }
}


let fakeBot = new bot();
let processInputCommand = function() {
  let commandString = ""
  for (let j = 2; j < process.argv.length; j++) {
      commandString += process.argv[j] + " "
  }
  let data = Object.assign({},{message:commandString})
  console.log("command to be sent is: " + data.message)
  dialogModule.parseQuestion(data,fakeBot);
}

processInputCommand()
