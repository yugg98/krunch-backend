const express = require("express");
const { registerUser } = require("../controllers/user.controller");

const router = express.Router();

router.route('/user/register').post(registerUser)
// router.route('/user/get').post(createUser)
// router.route('/user/create').post(createUser)
// router.route('/user/create').post(createUser)


module.exports = router;