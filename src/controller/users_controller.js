const format = require("date-fns/format");
const { requestResponse } = require("../utils");
const logger = require('../utils/logger')
const { db } = require("../databases/sqlite")
const id = require('date-fns/locale/id')
let response

const getUsers = async (req, res) => {
  try {
    db.all("SELECT * FROM rfid_activity", [] ,(err, users) => {
      response = { ...requestResponse.success, data: users }
      res.status(response.code).json(response);
    })
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
    res.status(response.code).json(response);
  }
}

const addUsers = async (req, res) => {
  try {
    const { name, kode_rfid } = req.body
    const timestamp = format(new Date(), 'YYY-MM-dd', { locale: id })
    db.run("INSERT INTO rfid_activity (nama, kode_rfid, tanggal_daftar) VALUES ('"+name+"', '"+kode_rfid+"', '"+timestamp+"' )", [] ,(err, users) => {

      response = { ...requestResponse.success, data: users }
      res.status(response.code).json(response);
    })

  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
    res.status(response.code).json(response);
  }
}

module.exports = {
  addUsers,
  getUsers
}
