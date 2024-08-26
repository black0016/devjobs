const mongoose = require('mongoose'); // Importar mongoose
mongoose.Promise = global.Promise; // Eliminar advertencias de mongoose
const slug = require('slug'); // Importar slug para las URLs amigables
const shortid = require('shortid'); // Importar shortid para generar un ID único para las vacantes en la BD 

// Definición del esquema de vacantes usando Mongoose
const vacantesSchema = new mongoose.Schema({
    // Campo para el título de la vacante
    titulo: {
        type: String, // Tipo de dato String
        required: 'El nombre de la vacante es obligatorio', // Campo obligatorio con mensaje de error
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para el nombre de la empresa
    empresa: {
        type: String, // Tipo de dato String
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para la ubicación de la vacante
    ubicacion: {
        type: String, // Tipo de dato String
        required: 'La ubicación es obligatoria', // Campo obligatorio con mensaje de error
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para el salario ofrecido
    salario: {
        type: String, // Tipo de dato String
        default: 0, // Valor por defecto es 0
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para el tipo de contrato
    contrato: {
        type: String, // Tipo de dato String
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para la descripción de la vacante
    descripcion: {
        type: String, // Tipo de dato String
        required: 'La descripción de la vacante es obligatoria', // Campo obligatorio con mensaje de error
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    // Campo para la URL de la vacante
    url: {
        type: String, // Tipo de dato String
        lowercase: true // Convierte el valor a minúsculas
    },
    // Campo para las habilidades requeridas, es un array de Strings
    skills: [String],
    // Campo para los candidatos, es un array de objetos
    candidatos: [{
        nombre: String, // Nombre del candidato
        email: String, // Email del candidato
        cv: String // URL del CV del candidato
    }],
    // Campo para el autor de la vacante (usuario que la creó) 
    autor: {
        type: mongoose.Schema.ObjectId, // Tipo de dato ObjectID de mongoose para referenciar a un usuario en la BD 
        ref: 'Usuarios', // Referencia al modelo de Usuarios
        required: 'El autor es obligatorio' // Campo obligatorio con mensaje de error 
    }
});

// Antes de guardar la vacante en la BD, se genera la URL amigable y el ID único
vacantesSchema.pre('save', function (next) {
    // Generar la URL amigable para la vacante
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
    // Continuar con el siguiente middleware
    next();
});

vacantesSchema.index({ titulo: 'text' }); // Crear un índice de texto para el campo de título de la vacante

module.exports = mongoose.model('Vacante', vacantesSchema); // Exportar el modelo de vacantes para su uso en la aplicación