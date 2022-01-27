const format = require("date-fns/format");
const mqtt_connect = require("../consumer")
const { db } = require("../databases/sqlite")

let VD_Open = []
let VD_Close = []

const gateOpen = async (guid, data) => {
    VD_Open.unshift(data)
    if (VD_Open.length == 3) {
        VD_Open.pop()
    }

    if (VD_Open[0] == '0' && VD_Open[1] == '1') {
        db.all("SELECT * FROM activityiot WHERE input_guid = ?", [guid], async (err, activity) => {
          await mqtt_connect.publish('Gate-Open', activity[0].output_guid + "#" + activity[0].output_value)
        })
    }
}

const gateClose = async (guid, data) => {
    VD_Close.unshift(data)
    if (VD_Close.length == 3) {
        VD_Close.pop()
    }

    if (VD_Close[0] == '0' && VD_Close[1] == '1') {
        db.all("SELECT * FROM activityiot WHERE input_guid = ?", [guid], async (err, activity) => {
          await mqtt_connect.publish('Gate-Close', activity[0].output_guid + "#" + activity[0].output_value)
        })
    }
}

module.exports = {
    gateOpen,
    gateClose
  }
  