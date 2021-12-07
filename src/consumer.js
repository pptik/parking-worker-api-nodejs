const logController = require("./controller/log_controller");
const logger = require("./utils/logger");
const mqtt = require('mqtt')

const rmq = mqtt.connect('ws://localhost:15675/ws', {
  username: '/:guest',
  password: 'guest',
  clientId: 'ParkingGate-' + Math.random().toString(16).substr(2, 8) + '-punclut-',
  protocolId: 'MQTT',
  keepalive: 1
})


exports.publish = async (topic, message) => {
  logger.info(topic, message)
  rmq.publish(topic, message , () => {})
}

exports.consume = async () => {
  rmq.on('connect', () => {
    rmq.subscribe('VD-Open', () => { console.log("VD Open Connected") })
    rmq.subscribe('VD-Close', () => { console.log("VD Close Connected") })
  })

  rmq.on('message', (topic, payload) => {
    logger.info(topic, payload.toString())
    const data = payload.toString().split("#")

    if (topic === 'VD-Open'){
      logController.main(data[0], data[1])
    } 

    if (topic === 'VD-Close'){
      logController.main(data[0], data[1])
    }
  })
}
