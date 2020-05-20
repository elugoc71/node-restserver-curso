const express = require('express');
const Usuario = require('../models/usuario.js');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion.js');
const { verificaAdmin_Role } = require('../middlewares/autenticacion.js');
const app = express();

app.get('/usuario', verificaToken, function(req, res) {

    /*return res.json({ //solo devuelve el usuario autenticado
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
    })*/

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)

    .exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        Usuario.countDocuments({ estado: true }, (err, conteo) => { //Coleccion en mongoose que se utiliza para contar en una db
            res.json({
                ok: true,
                usuarios: usuarios,
                cuantos: conteo
            });


        });


    });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {


    //eturn res.json({
    //  usuario: req.usuario,
    // nombre: req.usuario.nombre,
    //email: req.usuario.email,
    //})

    let body = req.body;

    console.log(body.password);

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    console.log(usuario.password);

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        // usuarioDB.password = null;

        return res.json({
            ok: true,
            usuario: usuarioDB
        });
    });



})

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre',
        'email',
        'img',
        'role',
        'estado'
    ]);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });


})

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;

    let CambiaEstado = {
        estado: false
    }

    //console.log(estado);


    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {


        //let id = req.params.id;
        //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        //if (!usuarioBorrado) {
        //    return res.status(400).json({
        //        ok: false,
        //        err: {
        //            message: 'Usuario no encontrado'
        //        }
        //    });
        //}

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })


    });
})

module.exports = app;