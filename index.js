const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

//Using Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4xnjt3a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    // Send a ping to confirm a successful connection
    const toyCollection = client.db("toyMarket").collection("toys");
    const indexKeys = { toyname: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/alltoys", async (req, res) => {
      let query = {};
      if (req.query.toyname) {
        query = { toyname: { $regex: req.query.toyname, $options: "i" } };
      }
      const result = await toyCollection.find(query).limit(20).toArray();

      res.send(result);
    });

    app.post("/addtoy", async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

app.listen(port, () => {
  console.log("Server is running on port:", port);
});
