require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// middleware

app.use(cors());
app.use(express.json());

// mongodb
//TutorTimeAdmin
//xpDibyhUKA3iInGF

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.343fm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const tutorialCollection = client.db("TutorTime").collection("tutorials");
    const userCollection = client.db("TutorTime").collection("users");

    // USER COLLECTION

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //////////////////////////////////////////
    //TUTORIAL

    // GET the tutorials from the server
    app.get("/tutorials", async (req, res) => {
      const cursor = tutorialCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //Get specific tutorial by ID
    app.get("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await tutorialCollection.findOne(query);
      res.send(result);
    });

    // post tutorial
    app.post("/tutorials", async (req, res) => {
      const tutorial = req.body;
      const result = await tutorialCollection.insertOne(tutorial);
      res.send(result);
    });


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tutor-Time : Learn your language");
});
app.listen(port, () => {
  console.log(`Tutor-Time : listen at port ${port}`);
});
