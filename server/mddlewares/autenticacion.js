const jwt = require('jsonwebtoken');



/***** */
/*verifica token*/
/**-*** */
let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                //err: err
                message: 'Token no valido'
            });
        }
        req.usuario = decoded.usuario;
        next();

    });



    //res.json({
    //    token: token
    //});
};


/***** */
/*verifica role*/
/**-*** */
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;
    console.log(usuario);

    if (usuario.role === 'USER_ROLE') {
        return res.status(401).json({
            ok: false,
            //err: err
            message: 'Usuario no valido'
        });
    };


    next();
};
//res.json({
//    token: token
//});


let verificaTokenImg = (req, res, next) {
    let token = req.query.token; //token es el nombre que utilizamos al pasar el ? en la url

    res.json({
        token: token
    })


}
module.exports = {
    verificaToken: verificaToken,
    verificaAdmin_Role: verificaAdmin_Role,
    verificaTokenImg: verificaTokenImg
}