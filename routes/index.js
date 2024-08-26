const express = require('express'); // Importamos express
const router = express.Router(); // Importamos el método Router de express

const homeController = require('../controllers/homeController'); // Importamos el controlador homeController
const vacantesController = require('../controllers/vacantesController'); // Importamos el controlador vacantesController
const usuariosController = require('../controllers/usuariosController'); // Importamos el controlador usuariosController
const authController = require('../controllers/authController'); // Importamos el controlador authController

module.exports = () => {
    // Ruta para la página principal (home)
    // Muestra una lista de trabajos disponibles
    router.get('/', homeController.mostrarTrabajos);

    // Ruta para el formulario de creación de nuevas vacantes
    // Muestra un formulario para que los usuarios puedan crear una nueva vacante
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    // Ruta para enviar el formulario de creación de nuevas vacantes
    // Recibe los datos del formulario y los guarda en la base de datos
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);

    // Ruta para mostrar una vacante específica
    // Muestra los detalles de una vacante específica
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    // Ruta para enviar un mensaje de contacto a la empresa que publicó la vacante
    // Recibe los datos del formulario y envía un correo electrónico a la empresa con el CV adjunto del usuario interesado
    router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.contactar);

    // Ruta para editar una vacante específica
    // Muestra un formulario para editar una vacante específica
    router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    // Ruta para enviar el formulario de edición de una vacante específica
    // Recibe los datos del formulario y actualiza la vacante en la base de datos
    router.post('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.editarVacante);

    // Ruta para eliminar una vacante específica
    // Elimina una vacante específica de la base de datos
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

    // Ruta para crear una cuenta de usuario
    // Muestra un formulario para que los usuarios puedan crear una cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    // Ruta para enviar el formulario de creación de una cuenta de usuario
    // Recibe los datos del formulario y los guarda en la base de datos
    router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

    // Ruta para iniciar sesión en la aplicación
    // Muestra un formulario para que los usuarios puedan iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    // Ruta para autenticar a un usuario en la aplicación
    // Recibe los datos del formulario y autentica al usuario
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Ruta para cerrar sesión en la aplicación
    // Cierra la sesión del usuario y redirige a la página de inicio
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);

    // Ruta para reestablecer la contraseña de un usuario
    // Muestra un formulario para que los usuarios puedan reestablecer su contraseña
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    // Enviar token para reestablecer contraseña
    // Genera un token y envía un correo electrónico al usuario con un enlace para reestablecer su contraseña
    router.post('/reestablecer-password', authController.enviarToken);
    // Ruta para reestablecer la contraseña del usuario (almacenar en la base de datos)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    // Ruta para guardar la nueva contraseña del usuario en la base de datos
    router.post('/reestablecer-password/:token', authController.guardarPassword);

    // Ruta para mostrar el panel de administración
    // Muestra un panel de administración con las vacantes creadas por el usuario autenticado
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

    // Ruta para mostrar el formulario de edición de perfil
    // Muestra un formulario para que los usuarios puedan editar su perfil
    router.get('/editar-perfil', authController.verificarUsuario, usuariosController.formEditarPerfil);
    // Ruta para enviar el formulario de edición de perfil
    // Recibe los datos del formulario y actualiza el perfil del usuario en la base de datos
    router.post('/editar-perfil',
        authController.verificarUsuario,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );

    // Ruta para mostrar los candidatos de una vacante específica
    // Muestra una lista de candidatos que han aplicado a una vacante específica 
    router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos);

    // Ruta para buscar vacantes en la base de datos
    // Muestra una lista de vacantes que coinciden con los términos de búsqueda del usuario
    router.post('/buscador', vacantesController.buscarVacantes);

    // Exportamos el router para que pueda ser utilizado en otras partes de la aplicación
    return router;
};