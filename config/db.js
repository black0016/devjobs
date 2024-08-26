const mongoose = require('mongoose'); // Importar mongoose
require('dotenv').config({ path: 'variables.env' }); // Importar dotenv

// Intentar conectar a la base de datos utilizando la URL almacenada en la variable de entorno DATABASE
mongoose.connect(process.env.DATABASE)
    // Si la conexión es exitosa, se ejecuta esta función
    .then(() => {
        console.log('Conexión exitosa a la base de datos'); // Imprimir mensaje de éxito en la consola
    })
    // Si ocurre un error durante la conexión, se ejecuta esta función
    .catch((error) => {
        console.log('Error al conectar a la base de datos', error); // Imprimir mensaje de error y detalles del error en la consola
    });

// Verificar la conexión y manejar cualquier error que ocurra después de la conexión inicial
mongoose.connection.on('error', (error) => {
    console.log('Error en la conexión', error); // Imprimir mensaje de error y detalles del error en la consola
});

// Importar todos los modelos de la aplicación
require('../models/Vacantes'); // Importar el modelo de vacantes
require('../models/Usuarios'); // Importar el modelo de usuarios