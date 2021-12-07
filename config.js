require('dotenv').config()
module.exports = {
  amqpUrl: `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}/%2f${process.env.RMQ_VHOST}?heartbeat=60`,
  mongoUrl: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  mongoOptions: {
    keepAlive: true,
    poolSize: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
}
