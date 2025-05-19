const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Caro Game API!");
});

router.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

module.exports = router;
