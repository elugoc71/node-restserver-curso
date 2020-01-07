const express = require('express');
const Usuario = require('../models/usuario.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        console.log(body.email);

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contrasena incorrectos'
                }
            });

        }

        console.log(bcrypt.hashSync(body.password, 10));

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) y contrasena incorrectos'
                }
            });
        }


        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({

            ok: true,
            usuario: usuarioDB,
            token: token
        });

    });
});
module.exports = app;