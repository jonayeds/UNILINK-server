const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: '*',
}));
app.use(express.json());
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_username}:${process.env.DB_password}@cluster0.jtcqgec.mongodb.net/?appName=Cluster0`;


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
    const database = client.db("UNILINK");
    const usersCollection = database.collection("users");
    const commentsCollection= database.collection('comments')
    const chatsCollection= database.collection('chats')
    // Connect the client to the server	(optional starting in v4.7)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exists = await usersCollection.findOne(query);
      if (!exists) {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } else {
        res.send({ insertCount: 0 });
      }
    });
    app.post('/comments', async  (req, res)=>{
      const comment = req.body
      const result = await  commentsCollection.insertOne(comment)
      res.send(result)
    })
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/users/id/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get("/users/email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get('/users/:email', async(req, res)=>{
      const email = req.params.email
      const query = {email: email}
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    app.get('/comments/:email/:id', async(req, res)=>{
      const email = req.params.email
      const postId = req.params.id
      const queryA = {author : email}
      const result = await commentsCollection.find(queryA).toArray()
      const comments  = result.filter(comment=> comment.postId === parseInt(postId))
      res.send(comments)
    })
    app.get('/chats/:chatId', async(req ,res)=>{
      const chatId = req.params.chatId
      
    })
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const query = req.body;
      if (query.followerAccounts) {
        const updatedUser = {
          $set: {
            followers: query.followers,
            followerAccounts: query.followerAccounts,
          },
        };
        const result = await usersCollection.updateOne(filter, updatedUser);
        res.send(result);
      } else {
        const updatedUser = {
          $set: {
            following: query.following,
            followingAccounts: query.followingAccounts,
          },
        };
        const result = await usersCollection.updateOne(filter, updatedUser);
        res.send(result);
      }
    });
    app.put('/users/edit/:id', async(req, res)=>{
      const id = req.params.id
      const query = req.body
      const filter = {_id : new ObjectId(id)}
      const updatedUser = {
        $set: {
          fName: query.fName,
          sName: query.sName,
          fullName: query.fullName,
          image: query.image,
          bio: query.bio
        }
      }
      const result = await usersCollection.updateOne(filter, updatedUser)
      res.send(result)
    })
    app.put('/users/upload/:email', async(req, res)=>{
      const email = req.params.email
      const query = req.body
      const filter = {email : email}
      const updatedUser = {
        $set: {
          postsCount: query.postsCount,
          idParam: query.idParam,
          posts: query.posts
        }
      }
      const result = await usersCollection.updateOne(filter, updatedUser)
      res.send(result)
    })
    app.put('/post/update/:email' , async(req, res)=>{
      const email = req.params.email
      const query = req.body
      const filter = {email : email }
      const updatedUser  = {
        $set:{
          posts:  query.posts
        }
      }
      const result = await usersCollection.updateOne(filter, updatedUser)
      res.send(result)
    })
    app.put('/bookMark/:email',  async(req, res)=>{
      const  email = req.params.email
      const query = req.body
      const filter = {email:  email}
      const updatedBookMark = {
        $set:{
          bookMarks:query.bookMarks
        }
      } 
      const result= await usersCollection.updateOne(filter, updatedBookMark)
      res.send(result)
    })
    app.put('/delete/bookMark/:email/:id', async(req , res)=>{
      const email = req.params.email
      const postId = req.params.id
      const followerAccounts = req.body.followerAccounts
      followerAccounts.map( async(follower)=>{
        const f = await usersCollection.findOne({email: follower})
        const mark = f?.bookMarks?.filter(M=>  M.author+M.postId !==email+postId )
        const updatedBookMark = {
          $set:{
            bookMarks:mark
          }
        }
        const result = await usersCollection.updateOne({email:follower}, updatedBookMark)
      })
      
    })
    app.delete('/comments/:id',  async(req, res)=>{
      const commentId = req.params.id
      const query = { commentId: commentId }

      const result = await commentsCollection.deleteMany(query)
      res.send(result)

    })
   
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("UNILINK is running");
});
app.listen(port, () => {
  console.log("server is running on port ", port);
});

