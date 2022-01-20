const format = require("date-fns/format");
const mqtt_connect = require("../consumer")
const { requestResponse } = require("../utils");
const { db } = require("../databases/sqlite")
const id = require('date-fns/locale/id');
const logger = require('../utils/logger')

let response

const GateOpen = async (guid, kode_rfid) => {
  try{
  const timestamp = format(new Date(), 'dd LLLL yyyy HH:mm:ss', { locale: id })
  const kondisi = "Belum Keluar"
  db.serialize(() => {
    db.all("SELECT * FROM rfid_activity WHERE kode_rfid = ?", [kode_rfid], (err, users) => {
      if (err) throw err;
      
      if (users.length > 0) {
        db.all("SELECT * FROM activityiot WHERE input_guid = ?", [guid], (err, activity) => {
          if (err) throw err;
          
          if (activity.length > 0) {
            const message_publish = ""+activity[0].output_guid+"#"+activity[0].output_value+""
            const fallback_message = ""+users[0].kode_rfid+"#"+users[0].nama+"#"+timestamp+"#gate-open"
            db.run("INSERT INTO logsiot (nama, kode_rfid, jam_masuk, jam_keluar) VALUES (?, ?, ?, ?)", [users[0].nama, users[0].kode_rfid, timestamp, kondisi], async (err, activity) => {
              if (err) throw err;
              await mqtt_connect.publish('Gate-Open', message_publish)
              await mqtt_connect.publish('gate-fallback', fallback_message)  
            })
            
          } else {
            logger.error("Activity Not Found")
          }  
        })  
      } else {
        logger.error("Users Not Found")
      }
    }) 
  })
  } catch (error) {
  logger.error(error);
  response = { ...requestResponse.server_error };
}
}

const GateClose = async (guid, kode_rfid) => {
  try{
    const timestamp = format(new Date(), 'dd LLLL yyyy HH:mm:ss', { locale: id })
    const kondisi = "Belum Keluar"
    db.all("SELECT * FROM rfid_activity WHERE kode_rfid = ?", [kode_rfid], (err, users) => {
      if (err) throw err;
      
      if (users.length > 0) {
        db.all("SELECT * FROM activityiot WHERE input_guid = ?", [guid], (err, activity) => {
          if (err) throw err;
          if (activity.length > 0) {
            const message_publish = ""+activity[0].output_guid+"#"+activity[0].output_value+""
            const fallback_message = ""+users[0].kode_rfid+"#"+users[0].nama+"#"+timestamp+"#gate-close"
            db.run("UPDATE logsiot SET jam_keluar = '"+timestamp+"' WHERE kode_rfid = '"+kode_rfid+"' AND jam_keluar = '"+kondisi+"'", async () => {
              await mqtt_connect.publish('Gate-Close', message_publish)
              await mqtt_connect.publish('gate-fallback', fallback_message)
            })
            
          }
        })
      } else {
        logger.error("Users Not Found")
      }
    })
    // const keluar = await db.all("SELECT * FROM logsiot WHERE jam_keluar = ?", [kondisi])
    
  } catch (error) {
    logger.error(error);
  }
}

const getLogsLimit = async (req, res) => {
  try {
    db.all("SELECT * FROM logsiot ORDER BY jam_masuk DESC", [] ,(err, logs) => {
      if (err) throw err;
      response = { ...requestResponse.success, data: logs }
      res.status(response.code).json(response);
    })
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
    res.status(response.code).json(response);
  }
}


const getLogs = async (req, res) => {
  try {
    db.all("SELECT * FROM logsiot ORDER BY jam_masuk DESC", function (err, logs) {
      response = { ...requestResponse.success, data: logs }
      res.status(response.code).json(response);
    })
  } catch (error) {
    logger.error(error);
    
  }
}

module.exports = {
  GateOpen,
  GateClose,
  getLogs,
  getLogsLimit
}
