const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Add a route for the force update page
app.get("/forceupdate", (req, res) => {
  res.sendFile(path.join(__dirname, "public/forceupdate.html"));
});

// Add a route for the forced CSS update
app.get("/css/styles-force-update.css", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(path.join(__dirname, "public/css/styles-force-update.css"));
});

// Add a no-cache middleware for CSS files
app.use("/css", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
