// Importa el módulo 'path' de Node.js para trabajar con rutas de archivos y directorios
const path = require('path');
// Importa el módulo 'webpack' para usar sus funcionalidades
const webpack = require('webpack');

// Exporta la configuración de Webpack
module.exports = {
    // Punto de entrada de la aplicación
    entry: './public/js/app.js',
    // Configuración de salida
    output: {
        // Nombre del archivo de salida
        filename: 'bundle.js',
        // Ruta de salida del archivo de salida
        path: path.join(__dirname, './public/dist')
    },
    // Configuración de módulos
    module: {
        // Reglas para los módulos
        rules: [
            {
                // Expresión regular para identificar archivos JavaScript
                test: /\.m?js$/,
                // Loader a utilizar para los archivos JavaScript
                use: {
                    loader: 'babel-loader',
                    // Opciones para el loader
                    options: {
                        // Presets a utilizar por Babel
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
};