const express = require('express')
const cors = require("cors")
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');
const fileUpload = require("express-fileupload")
require("dotenv").config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ka9ky.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("photo"));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }))



client.connect(err => {
    const appointmentCollection = client.db("appointment").collection("appointmentlist");
    const doctorscollection = client.db("appointment").collection("doctors");

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
        const email = req.body.email
        console.log(date.date)

        doctorscollection.find({ email : email })
        .toArray((err, doctors) => {
            const filter = { BookingDate: date.date }
            if(doctors.length === 0)
            {
                filter.email = email;
            }
            appointmentCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents)
            })
        })
    })

    app.get("/getallpatientsdata", (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get("/doctorscollection", (req, res) => {
        doctorscollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post("/addAdoctor", (req, res) => {

            const file = req.files.file;
            const title = req.body.title;
            const email = req.body.email;
            const all = { img : file.name, title, email }
            console.log(all)

            file.mv(`${__dirname}/photo/${file.name}`, err=> {
                if (err) {
                    console.log(err)
                    return res.status(500).send({ msg: "file not uploaded" })
                }
                doctorscollection.insertOne(all)
                .then(function (result) {
                    res.send(result.insertedCount > 0)
                })
                // return res.send({ img: file.name, path: `/${file.name}` })
            })
    })


    app.post("/isDoctor", (req, res) => {
        const email = req.body.email
        doctorscollection.find({ email : email })
        .toArray((err, doctors) => {
            res.send(doctors.length > 0)
        })
    })


    console.log("db connected")
});


app.get('/', (req, res) => {
    res.send("Doctors")
})

const port = 4000;

app.listen(process.env.PORT || port, console.log("successfully running port 4000"))

