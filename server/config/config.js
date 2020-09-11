/********* */
/*Puerto*****/
/************************ */
process.env.PORT = process.env.PORT || 3000;

/********* */
/*Entorno*****/
/************************ */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//********************** */
//Vencimiento del tokek*/
//60 segundos
//60 minutos
//24 horas
//30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//******************************** */
//SEED DE AUTENTICACION
//**************************************** */
process.env.SEED = process.env.SEED || 'este es el seed de desarrollo';

//******************************** */
//CLIENT ID
//**************************************** */
process.env.CLIENT_ID = process.env.CLIENT_ID || '537422196363-8jahuu34e7sgviph1ou87fs9ctp0knl2.apps.googleusercontent.com';


/********* */
/*Base de datos*****/
/************************ */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;