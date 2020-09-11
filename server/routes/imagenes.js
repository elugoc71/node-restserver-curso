const express = require('express');
const fs = require('fs');
const path = require('path'); //necesitamos el path absoluto

const { verificaTokenImg } = require('../middlewares/autenticacion');
let app = express();


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);

    } else {
        let noImgPath = path.resolve(__dirname, '../assets/no-image.jpg'); //aqui tenemos el path absoluto
        res.sendFile(noImgPath);
    }
}); //se necesita que se indique si es un usuario o un producto y la imagen


module.exports = app;