const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

// Configuración de la estrategia de autenticación local con Passport
passport.use(
    new localStrategy(
        {
            // Especifica que el campo 'email' será utilizado como el nombre de usuario
            usernameField: 'email',
            // Especifica que el campo 'password' será utilizado como la contraseña
            passwordField: 'password'
        },
        // Función asíncrona que se ejecuta cuando se intenta autenticar un usuario
        async (email, password, done) => {
            // Busca un usuario en la base de datos por su email
            const usuario = await Usuarios.findOne({ email });
            // Si no se encuentra el usuario, retorna un error indicando que el usuario no existe
            if (!usuario) return done(null, false, { message: 'Usuario no existente' });
            // Verifica si la contraseña proporcionada coincide con la contraseña almacenada
            const verificarPass = usuario.compararPassword(password);
            // Si la contraseña no coincide, retorna un error indicando que la contraseña es incorrecta
            if (!verificarPass) return done(null, false, { message: 'Contraseña incorrecta' });
            // Si el usuario y la contraseña son correctos, retorna el usuario autenticado
            return done(null, usuario);
        }
    )
);

// Serializa el usuario para almacenarlo en la sesión
passport.serializeUser((usuario, done) => {
    // Almacena solo el ID del usuario en la sesión
    done(null, usuario._id);
});

// Deserializa el usuario a partir del ID almacenado en la sesión
passport.deserializeUser(async (id, done) => {
    // Busca el usuario en la base de datos por su ID y espera a que la operación se complete 
    const usuario = await Usuarios.findById(id).exec();
    // Retorna el usuario encontrado
    return done(null, usuario);
});

// Exporta la configuración de Passport para que pueda ser utilizada en otras partes de la aplicación
module.exports = passport;