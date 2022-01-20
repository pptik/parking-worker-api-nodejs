const express = require("express")
const router = express.Router()

const usersController = require("../controller/users_controller")
const logController = require("../controller/log_controller")

router.get(
  "/getUsers",
  usersController.getUsers
)
router.get(
  "/getLogsLimit",
  logController.getLogsLimit
)

router.get(
  "/getLogs",
  logController.getLogs
)

router.post(
  "/addUsersRFID",
  usersController.addUsers
)


module.exports = router
