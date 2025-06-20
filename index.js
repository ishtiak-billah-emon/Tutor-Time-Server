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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const tutorialCollection = client.db("TutorTime").collection("tutorials");
    const userCollection = client.db("TutorTime").collection("users");
    const bookedTutorialCollection = client
      .db("TutorTime")
      .collection("bookedTutorial");

    // USER COLLECTION
    
    app.get("/users", async (req, res) => {    
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

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
    // app.get("/tutorials", async (req, res) => {
    //   const cursor = tutorialCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/tutorials", async (req, res) => {
      const { category } = req.query;
      const query = category ? { language: category } : {};
      const tutorials = await tutorialCollection.find(query).toArray();

      res.send(tutorials);
    });

    //Get specific tutorial by ID
    app.get("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialCollection.findOne(query);
      res.send(result);
    });

    // Get some tutorials by email [my tutorial]
    app.get("/myTutorials/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await tutorialCollection.find(query).toArray();
      res.send(result);
    });

    // post tutorial
    app.post("/tutorials", async (req, res) => {
      const tutorial = req.body;
      const result = await tutorialCollection.insertOne(tutorial);
      res.send(result);
    });

    // increment review
    // app.patch("/tutorials/review/:id", async (req, res) => {
    //   const id = req.params.id;

    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = { $inc: { review: 1 } }; // Increment review by 1

    //   const result = await tutorialCollection.updateOne(filter, updateDoc);
    //   res.send(result);
     
    // });

    // update the tutorial

    app.put("/updateTutorial/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTutorial = req.body;

      const tutorial = {
        $set: {
          name: updatedTutorial.name,
          email: updatedTutorial.email,
          photo: updatedTutorial.photo,
          language: updatedTutorial.language,
          price: updatedTutorial.price,
          description: updatedTutorial.description,
          rating: updatedTutorial.rating,
        },
      };

      const result = await tutorialCollection.updateOne(
        filter,
        tutorial,
        options
      );
      res.send(result);
    });
    // delete tutorial by id
    app.delete("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialCollection.deleteOne(query);
      res.send(result);
    });

    //////////////////////////////////////////////////
    // Booked Tutorial

    // Booking a tutorial
    app.post("/bookedTutorial", async (req, res) => {
      const tutorial = req.body;
      const result = await bookedTutorialCollection.insertOne(tutorial);
      res.send(result);
    });

    // Getting all the booked tutorial

    app.get("/bookedTutorial", async (req, res) => {
      const cursor = bookedTutorialCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all the booked tutorial by email address

    // app.get('/bookedTutorial', async (req,res)=>{
    //   const email = req.query.email;
    //   const query = {userEmail : email};
    //   const result = await bookedTutorialCollection.find(query).toArray();

    //   for(const tutorial of result) {
    //     const query1 = {_id: new ObjectId(tutorial.tutorId)};
    //     const tutor = await tutorialCollection.findOne(query1);
    //     if(tutor) {
    //       tutorial.rating = tutor.rating;
    //       tutorial.description = tutor.description;
    //       console.log('found');
    //     }
    //   }
    //   res.send(result);
    // })

    app.get("/bookedTutorial/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email };
      const bookedTutorials = await bookedTutorialCollection
        .find(filter)
        .toArray();

      // Array to hold matched tutorial details
      const matchedTutorials = [];

      // Loop through booked tutorials and fetch details from tutorialCollection
      for (const tutorial of bookedTutorials) {
        const tutorId = tutorial.tutorId;

        // Find the matching document in tutorialCollection
        const matchedTutorial = await tutorialCollection.findOne({
          _id: new ObjectId(tutorId),
        });

        // Add the matched tutorial details to the array
        if (matchedTutorial) {
          matchedTutorials.push(matchedTutorial);
        }
      }

      // Send the matched tutorials in the response
      res.send(matchedTutorials);
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
  // console.log(`Tutor-Time : listen at port ${port}`);
});
