const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

//Using Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

app.listen(port, () => {
  console.log("Server is running on port:", port);
});
