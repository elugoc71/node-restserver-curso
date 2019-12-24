const express = require('express')
const app = express()

app.get('/usuario', function(req, res) {
    res.json('get usuario')
});

app.listen(3000, () => {
    console.log("escuchando en el puerto:", 3000);
})