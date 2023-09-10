const express = require('express');
const multer = require('multer');
const cors = require('cors')
const app = express();
const port = 3000;
const bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: '*'
}));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
var db;

MongoClient
  .connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async (client) => {
    console.log("Connected to the database!");  
    db = client.db('news-app').collection('news');;
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully!');
});

app.post('/create',async (req, res) => {
    try {
        await db.insertOne(req.body);
        res.send({code:1})
    } catch (error) {
        res.send({code:0})
    }
  });


  app.get('/getnews',async (req, res) => {
    try {
       const news = await db.find().toArray();
        res.send({code:1,news})
    } catch (error) {
        res.send({code:0})
    }
  });
  

app.listen(port,"0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
