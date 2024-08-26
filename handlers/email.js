const emailConfig = require('../config/email'); // Importa la configuración del correo electrónico
const nodemailer = require('nodemailer'); // Importa el módulo nodemailer para enviar correos electrónicos 
const hbs = require('nodemailer-express-handlebars'); // Importa el módulo nodemailer-express-handlebars para usar Handlebars con Nodemailer 
const util = require('util'); // Importa el módulo util para convertir funciones de callback en funciones de promesa 

// Crea un objeto de transporte utilizando nodemailer.createTransport
// Este objeto se utiliza para enviar correos electrónicos
let transport = nodemailer.createTransport({
    // Configuración del servidor SMTP
    host: emailConfig.host, // Dirección del servidor SMTP
    port: emailConfig.port, // Puerto del servidor SMTP
    auth: {
        // Autenticación del servidor SMTP
        user: emailConfig.user, // Nombre de usuario para autenticarse en el servidor SMTP
        pass: emailConfig.pass  // Contraseña para autenticarse en el servidor SMTP
    }
});

// Configura el uso de Handlebars como motor de plantillas para Nodemailer
transport.use('compile', hbs({
    // Configuración del motor de vistas
    viewEngine: {
        extName: '.handlebars', // Extensión de los archivos de plantilla
        partialsDir: __dirname + '/../views/emails', // Directorio de los archivos parciales
        layoutsDir: __dirname + '/../views/emails', // Directorio de los archivos de layout
        defaultLayout: false, // No usar un layout por defecto
    },
    viewPath: __dirname + '/../views/emails', // Directorio de las plantillas de correo electrónico
    extName: '.handlebars' // Extensión de los archivos de plantilla
}));

// Exporta una función asíncrona llamada 'enviar' que toma un objeto 'opciones' como parámetro
exports.enviar = async (opciones) => {
    // Define las opciones del correo electrónico utilizando los datos proporcionados en 'opciones'
    const opcionesEmail = {
        from: 'devJobs <noreply@devjobs.com>', // Dirección de correo del remitente
        to: opciones.usuario.email, // Dirección de correo del destinatario, obtenida del objeto 'usuario' en 'opciones'
        subject: opciones.subject, // Asunto del correo electrónico, proporcionado en 'opciones'
        template: opciones.archivo, // Nombre de la plantilla de correo electrónico a utilizar, proporcionado en 'opciones'
        context: {
            resetUrl: opciones.resetUrl // URL de restablecimiento de contraseña, proporcionada en 'opciones'
        }
    };
    // Convierte la función sendMail de transport, que usa callbacks, en una función que devuelve una promesa
    const sendMail = util.promisify(transport.sendMail, transport);
    // Llama a la función sendMail con las opciones del correo electrónico y devuelve el resultado
    return sendMail.call(transport, opcionesEmail);
}