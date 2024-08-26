const mongoose = require('mongoose'); // Importar mongoose
require('./config/db'); // Importar la conexión a la base de datos

const express = require('express'); // Importar express
const { create } = require('express-handlebars'); // Importar express-handlebars usando create
const path = require('path'); // Importar path
const router = require('./routes'); // Importar las rutas
const cookieParser = require('cookie-parser'); // Importar cookie-parser
const session = require('express-session'); // Importar express-session
const MongoStore = require('connect-mongo'); // Importar connect-mongo
const bodyParser = require('body-parser'); // Importar body-parser
// const expressValidator = require('express-validator'); // Importar express-validator
const { body, validationResult } = require('express-validator'); // Importar express-validator
const flash = require('connect-flash'); // Importar connect-flash
const createError = require('http-errors'); // Importar http-errors para manejar errores HTTP en Express (404, 500, etc.) 
const passport = require('./config/passport'); // Importar passport para la autenticación de usuarios en la aplicación (Archivo de configuracion de passport)

require('dotenv').config({ path: 'variables.env' }); // Importar dotenv

// Crear una instancia de express
const app = express();

// Habilitar body-parser para leer datos en formato JSON (POST) y URL-encoded (GET)
app.use(bodyParser.json());
// Habilitar body-parser para leer datos del formulario en req.body (POST) y req.query (GET) 
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar el motor de plantillas
const hbs = create({
    // Establece la plantilla predeterminada para las vistas
    defaultLayout: 'layout',
    // Importa y registra los helpers personalizados de Handlebars desde el archivo './helpers/handlebars'
    helpers: require('./helpers/handlebars'),
    // Configura las opciones de tiempo de ejecución de Handlebars
    runtimeOptions: {
        // Permite el acceso a propiedades heredadas por defecto
        allowProtoPropertiesByDefault: true,
        // Permite el acceso a métodos heredados por defecto
        allowProtoMethodsByDefault: true
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Habilitar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear cookies
app.use(cookieParser());
// Configuración de sesiones
app.use(session({
    secret: process.env.SECRETO, // Clave secreta para firmar la sesión, almacenada en una variable de entorno
    key: process.env.KEY, // Nombre de la clave de la cookie de sesión, almacenada en una variable de entorno
    resave: false, // No volver a guardar la sesión si no ha sido modificada
    saveUninitialized: false, // No guardar una sesión que no ha sido inicializada
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }) // Almacenar la sesión en la base de datos
}));

// Inicializar Passport para la autenticación
app.use(passport.initialize());
// Habilitar el manejo de sesiones con Passport
app.use(passport.session());

// Habilitar flash messages
app.use(flash());
// Crear nuestro middleware
app.use((req, res, next) => {
    // Crear una variable global para los mensajes de flash
    res.locals.mensajes = req.flash(); // req.flash() devuelve un objeto con los mensajes
    next(); // Llama al siguiente middleware
});

// Usar las rutas
app.use('/', router());

// Middleware para manejar errores 404
app.use((req, res, next) => {
    next(createError(404, 'No encontrado')); // Crea un error 404 y lo pasa al siguiente middleware
});

// Middleware para manejar errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message; // Guarda el mensaje de error en una variable local
    const status = error.status || 500; // Establece el código de estado del error 
    res.locals.status = status; // Guarda el código de estado en una variable local
    res.status(status); // Establece el código de estado de la respuesta
    res.render('error'); // Renderiza la vista de error
});

// // Iniciar el servidor
// app.listen(process.env.PUERTO, () => {
//     console.log(`Servidor iniciado en el puerto ${process.env.PUERTO}`);
// });

// Dejar que Heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;
app.listen(port, host, () => {
    console.log(`Servidor iniciado en el puerto ${port}`);
});