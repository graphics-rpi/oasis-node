const express = require('express');

const router = express.Router();

//Lets say the route below is very sensitive and we want only authorized users to have access

//Displays information tailored according to the logged in user
router.get('/app', (req, res, next) => {
  res.send("Success")
});

module.exports = router;