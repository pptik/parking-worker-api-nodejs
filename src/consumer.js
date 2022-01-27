const logController = require("./controller/log_controller");
const vdController = require("./controller/vd_controller");
const logger = require("./utils/logger");
const mqtt = require('mqtt')

const rmq = mqtt.connect('ws://192.168.0.2:15675/ws', {
  username: '/parkir:parkir',
  password: 'parkir123',
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
    rmq.subscribe('RFID-Open', () => { console.log("RFID Open Connected") })
    rmq.subscribe('RFID-Close', () => { console.log("RFID Close Connected") })
  })

  rmq.on('message', (topic, payload) => {
    // logger.info(topic, payload.toString())
    const data = payload.toString().split("#")

    if (topic === 'VD-Open'){
      vdController.gateOpen(data[0], data[1])
    } 

    if (topic === 'VD-Close'){
      vdController.gateClose(data[0], data[1])
    }

    if (topic === 'RFID-Open'){
      logController.GateOpen(data[0], data[1])
    }
    if (topic === 'RFID-Close'){
      logController.GateClose(data[0], data[1])
    }
  })
}
