const mongoose = require('mongoose'); // Importa el módulo mongoose para interactuar con la base de datos
const Vacante = mongoose.model('Vacante'); // Importa el modelo Vacante para interactuar con la colección de vacantes

exports.mostrarTrabajos = async (req, res, next) => {
    // Obtener todas las vacantes de la base de datos
    const vacantes = await Vacante.find();
    // Si no hay vacantes, continuar con el siguiente middleware
    if (!vacantes) return next();
    // Si hay vacantes, renderizar la vista 'home' y pasar los datos a la plantilla
    res.render('home', {
        nombrePagina: 'DevJobs', // Título de la página
        tagline: 'Encuentra y publica trabajos para desarrolladores web', // Descripción o eslogan de la página
        barra: true, // Mostrar la barra de navegación en la página principal (home) 
        boton: true, // Mostrar el botón de publicar vacante en la página principal (home)
        vacantes, // Pasar la lista de vacantes a la plantilla para mostrarlas en la página principal (home) 
    });
}