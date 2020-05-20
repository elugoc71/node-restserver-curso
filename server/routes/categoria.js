const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion.js');
const app = express();

const Categoria = require('../models/categoria.js');

/** */
/*Mostrar todas las categorias*/
app.get('/categoria', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Categoria.find({})
        .sort('descripcion')
        .populate('categoria')
        .skip(desde)
        .limit(limite)

    .exec((err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };


        Categoria.countDocuments((err, conteo) => {
            res.json({
                ok: true,
                categorias: categorias,
                cuantos: conteo
            });
        });
    });
});

//Mostrar categorias por id
app.get('/categoria/:id', verificaToken, (req, res) => {

    id = req.params.id;

    console.log(req.params);

    Categoria.findById(id)
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            };

            return res.json({
                ok: true,
                categorias: categorias
            });
        });
});

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({ //defino lo que voy a guardar en la categoria
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo un administrados puede borrar las categorias
    id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };

        return res.json({
            ok: true,
            message: 'Categoría borrada'
        });
    });
});

app.put('/categoria/:id', verificaToken, (req, res) => {

    console.log(req);
    id = req.params.id;
    body = req.body;
    let descCategoria = { descripcion: body.descripcion } //La categoria que se va a actualizar

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidator: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };
        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

module.exports = app;