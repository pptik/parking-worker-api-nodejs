
const SQLite3 = require('node-sqlite3') 
const dbFile = __dirname + '/Parkir.db'
const db = new SQLite3(dbFile)

const createConnection = async () => {
  await db.open()
};

const database = async () => {
  
}

module.exports = {
  db,
  createConnection
};
