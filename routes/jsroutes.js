const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/js/userinfo.js", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/js/userinfo.js"));
});

router.get("/js/toggle.js", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/js/toggle.js"));
});

router.get("/js/blob-animation.js", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/js/blob-animation.js"));
});

module.exports = router;
