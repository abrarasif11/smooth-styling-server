const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middle Wares //
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smooth Styling Server is Running')
})
// Mongo Collection //

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vhdpi0m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const categoryCollection = client.db('smoothStyling').collection('categories');
    const galleryCollection = client.db('smoothStyling').collection('gallery');
    const reviewCollection = client.db('smoothStyling').collection('review');
    try {
        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });
        app.get('/gallery', async (req, res) => {
            const query = {}
            const cursor = galleryCollection.find(query);
            const gallery = await cursor.toArray();
            res.send(gallery);
        });
        // review
        app.get("/review", async (req, res) => {
            const query = {};
            const cursor = await reviewCollection.find(query);
            const reviews = await cursor.toArray();
            const reverseArray = reviews.reverse();
            res.send(reverseArray);
        });
        app.post("/review", async (req, res) => {
            const items = req.body;
            const result = await reviewCollection.insertOne(items);
            res.send(result);
        });
        app.get("/review", async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const cursor = await reviewCollection.find(query).toArray();;
            res.send(cursor);
        });
    }

    finally {

    }
}
run().catch(err => console.error(err));
app.listen(port, () => {
    console.log(`Smooth Styling Server is Running on ${port}`);
})