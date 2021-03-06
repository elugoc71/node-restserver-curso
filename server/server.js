require('./config/config.js');

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Habilitr la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

//Configuracion de las rutas
app.use(require('./routes/index.js'));

//await 
console.log(process.env.URLDB);
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err, resp) => {

    if (err) throw err;

    // useNewUrlParser: true,
    //     useUnifiedTopology: true,
    console.log('Base de datos ONLINE');

});


app.listen(process.env.PORT, () => {
    console.log("escuchando en el puerto:", 3000);
})