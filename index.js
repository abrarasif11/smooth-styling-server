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
    const serviceCollection = client.db('smoothStyling').collection('service');
    const appointmentCollection = client.db('smoothStyling').collection('appointment');
    try {
        // categories
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
        // services //
        app.get('/service', async (req, res) => {
            const date = req.query.date;
            console.log(date);
            const query = {};
            // const cursor = serviceCollection.find(query);
            // const services = await cursor.toArray();
            const services = await serviceCollection.find(query).toArray();
            const bookingQuery = { date: date }
            const alreadyBooked = await appointmentCollection.find(bookingQuery).toArray();
            services.forEach(service => {
                const optionBooked = alreadyBooked.filter(book => book.service === service.name)
                const bookSlots = optionBooked.map(book => book.slot)
                const remainingSlots = service.slots.filter(slot => !bookSlots.includes(slot))
                service.slots = remainingSlots;
            })
            res.send(services);
        });
        // appointment //
        app.get("/appointment", async (req, res) => {
            const query = {};
            const cursor = await appointmentCollection.find(query);
            const reviews = await cursor.toArray();
            const reverseArray = reviews.reverse();
            res.send(reverseArray);
        });
        app.post("/appointment", async (req, res) => {
            const appointment = req.body;
            const query = {
                appointmentDate: appointment.appointmentDate,
                service: appointment.service,
                email: appointment.email
            }
            const alreadyBooked = await appointmentCollection.find(query).toArray();
            if(alreadyBooked.length){
                const message = `You already have a booking on ${appointment.appointmentDate}`
                return res.send({acknowledged: false,message})
            }
            const result = await appointmentCollection.insertOne(appointment);
            res.send(result);
        });
    }

    finally {

    }
}
run().catch(err => console.error(err));
app.listen(port, () => {
    console.log(`Smooth Styling Server is Running on ${port}`);
})