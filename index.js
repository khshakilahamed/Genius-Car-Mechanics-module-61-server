const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpgna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('carMechanic');
        const servicesCollection = database.collection('services');

        //GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        });

        // GET Single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            // console.log('getting specific id ', id);

            const result = await servicesCollection.findOne(query);
            res.send(result);
        })

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log("Hit the post api ", service);

            const result = await servicesCollection.insertOne(service);
            // console.log(result);

            res.json(result);
        });

        // DELETE API
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            // console.log(result);
            res.send(result);
        });

        //UPDATE API
        app.put('/services/:id', async (req, res) => {
            const updateService = req.body;
            // console.log(updateService);
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    name: updateService.name,
                    description: updateService.description,
                    price: updateService.price,
                    img: updateService.img
                }
            }
            const result = await servicesCollection.updateOne(filter, updateDoc, options);

            console.log(result);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Genius Server')
})

app.listen(port, () => {
    console.log("Running Genius Server on port", port)
})