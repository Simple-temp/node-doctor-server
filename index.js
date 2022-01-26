const express = require('express')
const cors = require("cors")
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');
require("dotenv").config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ka9ky.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))



client.connect(err => {
    const appointmentCollection = client.db("appointment").collection("appointmentlist");

    app.post("/postappointment", (req, res) => {
        const postAppointment = req.body
        console.log(postAppointment)
        appointmentCollection.insertOne(postAppointment)
            .then(function (result) {
                res.send(result.insertedCount > 0)
            })
    })

    app.post("/postappointmentbydate", (req, res) => {
        const date = req.body
        console.log(date.date)
        appointmentCollection.find({ BookingDate : date.date})
            .toArray((err,documents)=>{
                res.send(documents)
            })
    })

    app.get("/getallpatientsdata",(req,res)=>{
        appointmentCollection.find({})
        .toArray((err,documents)=>{
          res.send(documents)
        })
      })


    console.log("db connected")
});


app.get('/', (req, res) => {
    res.send("Doctors")
})

const port = 4000;

app.listen(process.env.PORT || port, console.log("successfully running port 4000"))