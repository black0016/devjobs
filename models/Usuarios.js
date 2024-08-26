const mongoose = require('mongoose'); // Importar mongoose
mongoose.Promise = global.Promise; // Eliminar advertencias de mongoose
const bcrypt = require('bcrypt'); // Importar bcrypt para encriptar contraseñas

// Definición del esquema de usuarios usando Mongoose
const usuariosSchema = new mongoose.Schema({
    // Campo para el nombre del usuario
    nombre: {
        type: String, // Tipo de dato String
        required: true, // Campo obligatorio
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para el email del usuario
    email: {
        type: String, // Tipo de dato String
        unique: true, // Campo único en la BD
        lowercase: true, // Convierte el valor a minúsculas
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para la contraseña del usuario
    password: {
        type: String, // Tipo de dato String
        required: true, // Campo obligatorio
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para el token de restablecimiento de contraseña
    token: String,
    // Campo para la fecha de expiración del token
    expira: Date,
    // Campo para la imagen de perfil del usuario
    imagen: String
});

// Antes de guardar el usuario en la BD, se encripta la contraseña
usuariosSchema.pre('save', async function (next) {
    // Si la contraseña no está modificada, continuar con el siguiente middleware
    if (!this.isModified('password')) {
        return next();
    }
    // Encriptar la contraseña
    const hash = await bcrypt.hash(this.password, 12);
    // Asignar la contraseña encriptada al campo password
    this.password = hash;
    // Continuar con el siguiente middleware
    next();
});

// Manejar errores de duplicados en MongoDB (correo duplicado)
usuariosSchema.post('save', function (error, doc, next) {
    // Verificar si el error es un error de MongoDB y si el código de error es 11000 (duplicado)
    if (error.name === 'MongoServerError' && error.code === 11000) {
        // Pasar un mensaje de error personalizado al siguiente middleware
        next('Ese correo ya está registrado');
    } else {
        // Pasar el error al siguiente middleware
        next(error);
    }
});

// Métodos personalizados para el modelo de usuarios
usuariosSchema.methods = {
    // Método para verificar la contraseña
    compararPassword: function (password) {
        // Comparar la contraseña ingresada con la contraseña almacenada en la BD
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema); // Exportar el modelo de usuarios