const express = require('express');
const Usuario = require('../models/usuario.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/*Libreria de google*/
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

        console.log(process.env.SEED);
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

/*Configuriones de google*/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); //Recibir toda la informacion que necesito


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}




app.post('/google', async(req, res) => { //Para poder tomar el verify necesito ponerle async

    let token = req.body.idtoken;

    let googleUser = await verify(token) //esto viene resultado de la promesa de la funcion verify(token)
        .catch(e => {
            return res.status(403).json({ //cachar el error y que se salga
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal'
                    }
                });

            } else {
                let token = jwt.sign({ //si es un usuario que se autentico antes por google
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                res.json({

                    ok: true,
                    usuario: usuarioDB,
                    token: token
                });
            }
        } else {
            //Si el usuario no existe en la base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre; //validacion de datos
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => { //Guardamos el usuario
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err: err
                    });

                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                    res.json({

                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                };
            })
        };

    });


});
module.exports = app;