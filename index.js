const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

//Using Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4xnjt3a.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

// MongoDB database and collection

const toyCollection = client.db("toyMarket").collection("toys");
app.get("/alltoys", async (req, res) => {
  let query = {};
  if (req.query.toyname) {
    query = { toyname: { $regex: req.query.toyname, $options: "i" } };
  }
  const result = await toyCollection.find(query).limit(20).toArray();

  res.send(result);
});

// Reading data with dynamic email

app.get("/alltoys/:email", async (req, res) => {
  const email = req.params.email;
  const sortBy = req.query.sortby;
  console.log(sortBy);
  const filter = { email: email };
  if (sortBy == "ascending") {
    const result = await toyCollection
      .find(filter)
      .sort({ price: 1 })
      .toArray();
    res.send(result);
  } else if (sortBy == "descending") {
    const result = await toyCollection
      .find(filter)
      .sort({ price: -1 })
      .toArray();
    res.send(result);
  } else {
    const result = await toyCollection.find(filter).toArray();
    res.send(result);
  }
});

// Data find with subcategory

app.get("/subcategory", async (req, res) => {
  let query = {};
  if (req.query.subcategory) {
    query = { subcategory: req.query.subcategory };
  }
  const result = await toyCollection.find(query).toArray();
  res.send(result);
});

// Single data

app.get("/toy/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };
  const result = await toyCollection.findOne(query);
  res.send(result);
});

// Data post

app.post("/addtoy", async (req, res) => {
  const body = req.body;
  const result = await toyCollection.insertOne(body);
  res.send(result);
});

// Data update
app.put("/updatetoy/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  console.log(id, body);
  const query = { _id: new ObjectId(id) };
  const updatedToy = {
    $set: {
      price: body.price,
      quantity: body.quantity,
      description: body.description,
    },
  };
  const result = await toyCollection.updateOne(query, updatedToy);
  res.send(result);
});

// Data delete

app.delete("/toy/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };
  const result = await toyCollection.deleteOne(query);
  res.send(result);
});

async function run() {
  try {
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const indexKeys = { toyname: 1 };
    const indexOptions = { name: "toyName" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on port:", port);
});
