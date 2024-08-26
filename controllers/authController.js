const mongoose = require('mongoose'); // Importa el módulo mongoose para interactuar con la base de datos
const Vacante = mongoose.model('Vacante'); // Importa el modelo Vacante para interactuar con la colección de vacantes
const Usuarios = mongoose.model('Usuarios'); // Importa el modelo Usuarios para interactuar con la colección de usuarios
const passport = require('passport'); // Importa el módulo passport para autenticación de usuarios 
const crypto = require('crypto'); // Importa el módulo crypto para generar tokens seguros

const enviarEmail = require('../handlers/email'); // Importa el módulo email para enviar correos electrónicos

// Autentica al usuario con la estrategia local de Passport
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion', // Redirige al usuario a la página de administración si la autenticación es exitosa
    failureRedirect: '/iniciar-sesion', // Redirige al usuario a la página de inicio de sesión si la autenticación falla 
    failureFlash: true, // Habilita los mensajes flash de error en la autenticación de usuarios 
    badRequestMessage: 'Ambos campos son obligatorios' // Mensaje de error si faltan campos en el formulario de inicio de sesión
});

// Middleware para verificar si el usuario está autenticado 
exports.verificarUsuario = (req, res, next) => {
    // Verifica si el usuario está autenticado
    if (req.isAuthenticated()) {
        return next(); // Si el usuario está autenticado, llama al siguiente middleware
    }
    // Si el usuario no está autenticado, redirige al usuario a la página de inicio de sesión
    res.redirect('/iniciar-sesion');
}

// Exporta la función 'mostrarPanel' como parte del módulo
exports.mostrarPanel = async (req, res) => {
    // Busca todas las vacantes creadas por el usuario autenticado y las convierte en un objeto plano (lean)
    const vacantes = await Vacante.find({ autor: req.user._id }).lean(); // Busca todas las vacantes creadas por el usuario autenticado
    // Renderiza la vista 'administracion' y pasa los datos de la vacante encontrada
    res.render('administracion', {
        nombrePagina: 'Panel de Administración', // Pasa el nombre de la página a la vista
        tagline: 'Crea y administra tus vacantes desde aquí', // Pasa el tagline a la vista 
        cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
        nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
        imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
        vacantes, // Pasa las vacantes encontradas a la vista
    });
};

// Exporta la función 'cerrarSesion' para cerrar la sesión del usuario
exports.cerrarSesion = (req, res) => {
    // Cierra la sesión del usuario y maneja los errores
    req.logout((err) => {
        // Si hay un error al cerrar sesión, pasa el error al siguiente middleware
        if (err) {
            // Muestra un mensaje de error si hay un problema al cerrar sesión
            return next(err);
        }
        req.flash('correcto', 'Cerraste sesión correctamente'); // Muestra un mensaje de éxito al cerrar sesión
        return res.redirect('/iniciar-sesion'); // Redirige al usuario a la página de inicio de sesión
    });
}

// Exporta la función 'formReestablecerPassword' para mostrar el formulario de reestablecimiento de contraseña
exports.formReestablecerPassword = (req, res) => {
    // Renderiza la vista 'reestablecer-password' y pasa un objeto con las variables necesarias para la plantilla
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablecer Contraseña', // Título de la página
        tagline: 'Si ya tienes una cuenta pero olvidaste tu contraseña, ingresa tu correo electrónico para reestablecerla', // Descripción o mensaje de la página
        cerrarSesion: false, // Indica si se debe mostrar la opción de cerrar sesión (en este caso, no)
    });
}

// Exporta la función 'enviarToken' para enviar un token de reestablecimiento de contraseña
exports.enviarToken = async (req, res) => {
    // Verifica si el usuario existe en la base de datos buscando por el correo electrónico proporcionado en la solicitud
    const usuario = await Usuarios.findOne({ email: req.body.email });
    // Si el usuario no existe, muestra un mensaje de error y redirige al usuario a la página de reestablecer contraseña
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta'); // Muestra un mensaje de error
        return res.redirect('/reestablecer-password'); // Redirige a la página de reestablecer contraseña
    }
    // Genera un token y una fecha de expiración para el token
    usuario.token = crypto.randomBytes(20).toString('hex'); // Genera un token aleatorio de 20 bytes y lo convierte a hexadecimal
    usuario.expira = Date.now() + 3600000; // La fecha de expiración del token es en una hora (3600000 ms)
    // Guarda el usuario con el token y la fecha de expiración en la base de datos
    await usuario.save();
    // URL de reestablecimiento de contraseña
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    // Enviar el correo electrónico al usuario con el token de reestablecimiento de contraseña
    await enviarEmail.enviar({
        usuario, // El usuario al que se enviará el correo
        subject: 'Reestablecer Contraseña', // Asunto del correo
        resetUrl, // URL de reestablecimiento de contraseña
        archivo: 'reset' // Plantilla del correo electrónico
    });
    // Muestra un mensaje de éxito al enviar el correo electrónico
    req.flash('correcto', 'Revisa tu correo para las instrucciones');
    // Redirige al usuario a la página de inicio de sesión
    res.redirect('/iniciar-sesion');
}

// Exporta la función 'reestablecerPassword' para reestablecer la contraseña del usuario
exports.reestablecerPassword = async (req, res) => {
    // Busca un usuario en la base de datos cuyo token coincida con el proporcionado en la URL y cuya fecha de expiración sea mayor que la fecha actual
    const usuario = await Usuarios.findOne({
        token: req.params.token, // Token proporcionado en la URL
        expira: {
            $gt: Date.now() // Fecha de expiración mayor que la fecha actual
        }
    });
    // Si no se encuentra un usuario que cumpla con los criterios anteriores
    if (!usuario) {
        // Muestra un mensaje de error indicando que el formulario ya no es válido
        req.flash('error', 'El formulario ya no es válido, intenta de nuevo');
        // Redirige al usuario a la página de reestablecer contraseña
        return res.redirect('/reestablecer-password');
    }
    // Si se encuentra un usuario válido, renderiza la vista 'nuevo-password'
    res.render('nuevo-password', {
        nombrePagina: 'Nueva Contraseña' // Título de la página
    });
}

exports.guardarPassword = async (req, res) => {
    // Busca un usuario en la base de datos cuyo token coincida con el proporcionado en la URL y cuya fecha de expiración sea mayor que la fecha actual
    const usuario = await Usuarios.findOne({
        token: req.params.token, // Token proporcionado en la URL
        expira: {
            $gt: Date.now() // Fecha de expiración mayor que la fecha actual
        }
    });
    // Si no se encuentra un usuario que cumpla con los criterios anteriores
    if (!usuario) {
        // Muestra un mensaje de error indicando que el formulario ya no es válido
        req.flash('error', 'El formulario ya no es válido, intenta de nuevo');
        // Redirige al usuario a la página de reestablecer contraseña
        return res.redirect('/reestablecer-password');
    }
    // Establece la nueva contraseña del usuario con la contraseña proporcionada en el formulario
    usuario.password = req.body.password;
    // Elimina el token y la fecha de expiración del usuario
    usuario.token = undefined;
    usuario.expira = undefined;
    // Guarda la nueva contraseña del usuario en la base de datos
    await usuario.save();
    // Muestra un mensaje de éxito al guardar la nueva contraseña
    req.flash('correcto', 'Contraseña modificada correctamente');
    // Redirige al usuario a la página de inicio de sesión
    res.redirect('/iniciar-sesion');
}