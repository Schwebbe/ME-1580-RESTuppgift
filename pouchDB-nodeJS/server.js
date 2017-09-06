// Här skapas alla moduler som har installerats via npm
var express = require('express');
var app = express();
var path = require('path');
var error = Error('error');
var bodyParser = require('body-parser');
var pouchDB = require('pouchdb');

var database = new pouchDB("http://localhost:5984/customers");


app.use(express.static(path.join(__dirname, 'public')));
//Här används en json-tolkare
app.use(bodyParser.json());
//Man skapar en urlencoded tolkare
app.use(bodyParser.urlencoded({
    extended: true
}));
//index route till servern
app.get('/', function (req, res) {
    if (!error) {
        console.log('Loaded...');
        res.send('index.html');
    } else {
        return res.status(400).send({
            "status": "error",
            "message": "An `id` is required"
        });
    }

});
//Kör alla databas variabler och inkludera alla dokument som ska vara = sant
app.get("/customers", function (req, res) {
    database.allDocs({
        include_docs: true
    }).then(function (result) {
        res.send(result.rows.map(function (item) {
            return item.doc;
        }));
    }, function (error) {
        res.status(400).send(error);
    });
});
//Här postas ny data till routen customers och svarar med resultatet från databasen
app.post("/customers", function (req, res) {
    database.post(req.body).then(function (result) {
        res.send(result);
    });
});
//Här tas data bort från customers och returnerar resultaten från databasen 
app.delete("/customers", function (req, res) {
    database.get(req.body.id).then(function (result) {
        return database.remove(result);
    }).then(function (result) {
        res.send(result);
    });
});

//Här uppdateras customers kolumnen och returnerar nya ändringar som har gjorts
app.put("/customers/:id", function (req, res) {
    database.get(req.body.id).then(function (result) {
        result.firstname = req.body.firstname;
        result.lastname = req.body.lastname;
        result.Gender = req.body.Gender;
        result.address = req.body.address;
        result.email = req.body.email;
        database.put(result);
        res.send(result);
    });
});
app.listen(3000, function (error) {
    if (!error) {
        console.log('Server is running on port 3000');
    }
});
