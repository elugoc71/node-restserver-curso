const express = require('express');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion.js');

let app = express();

const Producto = require('../models/producto.js');

app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

app.get('/producto', verificaToken, (req, res) => {
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        //.populate('producto')
        .skip(desde)
        .limit(limite)

    .exec((err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };


        Producto.countDocuments((err, conteo) => {
            res.json({
                ok: true,
                producto: producto,
                cuantos: conteo
            });
        });
    });



});


app.get('/producto/:id', verificaToken, (req, res) => {

    id = req.params.id

    console.log(id);

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            };

            res.json({
                ok: true,
                producto: producto
            });
        });
});


/*Buscar productos*/
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regexp = new RegExp(termino, 'i'); //es una expresion regular


    Producto.find({ nombre: regexp })
        .populate('categoria', 'nombre')

    .exec((err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };

        res.json({
            ok: true,
            producto: producto
        });

    });

})

app.put('/producto/:id', verificaToken, (req, res) => {

    //console.log(req);
    id = req.params.id;
    body = req.body;
    let nomProducto = {
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible
        } //La categoria que se va a actualizar

    Producto.findByIdAndUpdate(id, nomProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };
        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo un administrados puede borrar las categorias
    id = req.params.id;

    //Producto.findByIdAndRemove(id, (err, productoDB) => {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };

        /*return res.json({
            ok: true,
            message: 'Producto borrado'
        });*/

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            };

            return res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });

        });


    });
});


module.exports = app;