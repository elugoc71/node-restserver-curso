const express = require('express');
const fileUpload = require('express-fileupload');
//const { verificaAdmin_Role } = require('../middlewares/autenticacion.js');
const app = express();
const Usuario = require('../models/usuario.js');
const Producto = require('../models/producto.js');
const fs = require('fs'); //Paquete de node
const path = require('path'); //Paquete de node

app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    if (!req.files) {
        return res.status(400)
        json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    let archivos = req.files.archivo; //archivo es el nombre de la variable que viene en post
    let nombreCortado = archivos.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    let tipo = req.params.tipo;
    let id = req.params.id;

    console.log(extension);

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });


    }



    //Cambiar el nombre del archivo
    nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivos.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err


            });


        //res.json({
        //    ok: true,
        //    message: 'Imagen subida correctamente'
        //});
        if (tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo); //mando el nombre del archivo a la función para poder manipuarla
        else {
            console.log(tipo);
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {

    console.log(nombreArchivo);
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Este es un error'
                }
            })
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }

            })
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        //ya solo falta guardar el usuario en la DB
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                })
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo

            })
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    console.log(nombreArchivo);
    console.log('producto');
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Este es un error'
                }
            })
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }

            })
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        //ya solo falta guardar el producto en la DB
        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                })
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo

            })
        });
    });

}

function borraArchivo(nombreArchivo, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`); //AQUI VAMOS A BUSCAR SI LA IMAGEN EXISTE
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;