const format = require("date-fns/format");
const mqtt_connect = require("../consumer")
const { requestResponse } = require("../utils");
const { db } = require("../databases/sqlite")

let response

const main = async (guid, kode_rfid) => {
  const timestamp = ~~(new Date() / 1000);
  const users = await db.all("SELECT * FROM rfid_activity WHERE kode_rfid = ?", [kode_rfid])
  const logs = await db.all("SELECT * FROM logsiot WHERE rfid = ? AND time_out IS NULL", [kode_rfid])
  const activity = await db.all("SELECT * FROM activityiot WHERE input_guid = ?", [guid])
  
  if (users.length > 0){
    response = "Data Tersedia"
  } else {
    response = "Users Tidak Ditemukan"
  }

  if (activity.length > 0) {
    response = "Data Tersedia"
  } else {
    response = "Activity Tidak Ditemukan"
  }

  if (logs.length > 0) {
    const fallback_message = ""+users[0].kode_rfid+"#"+users[0].nama+"#"+timestamp+"#gate-close"
    const message_publish = ""+activity[0].output_guid+"#"+activity[0].output_value+""
    await db.run("UPDATE logsiot SET time_out = '"+timestamp+"', output_value = '1' WHERE rfid = '"+kode_rfid+"' AND time_out IS NULL")
    await mqtt_connect.publish('gate-close', message_publish)
    await mqtt_connect.publish('gate-fallback', fallback_message)
  } else {
    const fallback_message = ""+users[0].kode_rfid+"#"+users[0].nama+"#"+timestamp+"#gate-open"
    const message_publish = ""+activity[0].output_guid+"#"+activity[0].output_value+""
    await db.run("INSERT INTO logsiot (input_guid, output_guid,rfid, output_value, username, user_guid, time_in, time_out) VALUES ('"+guid+"', '"+activity[0].output_guid+"','"+users[0].kode_rfid+"' , '"+activity[0].output_value+"', '"+users[0].nama+"', '"+users[0].id+"', '"+timestamp+"', null )")
    await mqtt_connect.publish('gate-open', message_publish)
    await mqtt_connect.publish('gate-fallback', fallback_message)
  }
}


const getLogsLimit = async (req, res) => {
  try {
    const logs = await db.all("SELECT * FROM logsiot LIMIT 3 ORDER BY time_in DESC")
    response = { ...requestResponse.success, data: logs }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
}


const getLogs = async (req, res) => {
  try {
    const logs = await db.all("SELECT * FROM logsiot ORDER BY time_in DESC")
    response = { ...requestResponse.success, data: logs }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
}

module.exports = {
  main,
  getLogs,
  getLogsLimit
}
