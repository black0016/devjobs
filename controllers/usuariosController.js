const mongoose = require('mongoose'); // Importa el módulo mongoose para interactuar con la base de datos
const Usuarios = mongoose.model('Usuarios'); // Importa el modelo Usuarios para interactuar con la colección de usuarios 
const { check, validationResult, body } = require('express-validator'); // Importa los métodos de validación de express-validator
const multer = require('multer'); // Importa el módulo multer para subir archivos al servidor 
const shortid = require('shortid'); // Importa el módulo shortid para generar IDs únicos 

// Exporta la función 'formCrearCuenta' como parte del módulo
exports.formCrearCuenta = (req, res) => {
    // Renderiza la vista 'crear-cuenta' y pasa un objeto con datos a la vista
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs', // Título de la página
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta', // Descripción o eslogan de la página
    });
};

// Middleware para validar el registro de un usuario
exports.validarRegistro = async (req, res, next) => {
    // Sanitiza y valida los campos del formulario
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').escape().run(req); // Sanitiza y valida el campo 'nombre'
    await check('email').isEmail().withMessage('El email debe ser válido').escape().run(req); // Sanitiza y valida el campo 'email'
    await check('password').notEmpty().withMessage('El password no puede ir vacío').escape().run(req); // Sanitiza y valida el campo 'password'
    await check('confirmar').notEmpty().withMessage('Confirmar Password no puede ir vacío').escape().run(req); // Sanitiza y valida el campo 'confirmar'
    await check('confirmar').custom((value, { req }) => value === req.body.password).withMessage('El password es diferente').run(req); // Compara el campo 'confirmar' con el campo 'password'

    // Obtiene los errores de validación del cuerpo de la solicitud
    const errores = validationResult(req);

    // Si hay errores en la validación, muestra la vista de registro con los errores correspondientes
    if (!errores.isEmpty()) {
        req.flash('error', errores.errors.map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en DevJobs', // Título de la página
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta', // Descripción o eslogan de la página
            mensajes: req.flash(), // Muestra los mensajes de error en la vista
        });
        return;
    }

    // Si no hay errores, llama al siguiente middleware
    next();
}

// Exporta la función 'crearUsuario' como parte del módulo
exports.crearUsuario = async (req, res) => {
    // Crea una nueva instancia del modelo 'Usuarios' con los datos del cuerpo de la solicitud
    const usuario = new Usuarios(req.body);

    // Intenta guardar el nuevo usuario en la base de datos y manejar los errores si ocurren 
    try {
        // Guarda el nuevo usuario en la base de datos y espera a que la operación se complete
        const nuevoUsuario = await usuario.save();
        // Si el usuario se guardó correctamente, redirige al usuario a la página de inicio de sesión
        res.redirect('/iniciar-sesion');
    } catch (error) {
        // Si hay un error al guardar el usuario, muestra un mensaje de error
        req.flash('error', error);
        // Redirige al usuario a la página de registro
        res.redirect('/crear-cuenta');
    }
};

// Exporta la función 'formIniciarSesion' como parte del módulo 
exports.formIniciarSesion = (req, res) => {
    // Renderiza la vista 'iniciar-sesion' y pasa un objeto con datos a la vista
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión en DevJobs', // Título de la página
        tagline: 'Inicia sesión para publicar tus vacantes', // Descripción o eslogan de la página
    });
};

// Exporta la función 'formEditarPerfil' como parte del módulo
exports.formEditarPerfil = (req, res) => {
    // Renderiza la vista 'editar-perfil' y pasa un objeto con datos a la vista
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en DevJobs', // Título de la página
        usuario: req.user, // Pasa los datos del usuario autenticado a la vista
        cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
        nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
        imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
    });
}

// Exporta la función 'editarPerfil' como parte del módulo
exports.editarPerfil = async (req, res) => {
    // Busca el usuario en la base de datos utilizando el ID del usuario autenticado
    const usuario = await Usuarios.findById(req.user._id);
    // Actualiza el nombre del usuario con el valor recibido en el cuerpo de la solicitud
    usuario.nombre = req.body.nombre;
    // Actualiza el email del usuario con el valor recibido en el cuerpo de la solicitud
    usuario.email = req.body.email;
    // Si se proporciona una contraseña en el cuerpo de la solicitud, actualiza la contraseña del usuario
    if (req.body.password) {
        usuario.password = req.body.password;
    }
    // Si se proporciona una imagen en la solicitud, actualiza la imagen de perfil del usuario con el nombre del archivo subido 
    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    // Guarda los cambios realizados en el usuario en la base de datos
    await usuario.save();
    // Muestra un mensaje de éxito al usuario
    req.flash('correcto', 'Cambios guardados correctamente, vuelve a iniciar sesión para que se apliquen los cambios');
    // Redirige al usuario a la página de administración después de guardar los cambios
    res.redirect('/administracion');
}

// Middleware para validar la edición de un perfil de usuario
exports.validarPerfil = async (req, res, next) => {
    // Sanitiza y valida los campos del formulario
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').escape().run(req); // Sanitiza y valida el campo 'nombre'
    await check('email') // Sanitiza y valida el campo 'email'
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email debe ser válido')
        .escape()
        .run(req);
    // Si se proporciona una contraseña en el cuerpo de la solicitud, valida el campo 'password'
    if (req.body.password) {
        check('password').notEmpty().withMessage('El password no puede ir vacío').escape().run(req); // Sanitiza y valida el campo 'password'
    }
    // Obtiene los errores de validación del cuerpo de la solicitud
    const errores = validationResult(req);

    // Si hay errores en la validación, muestra la vista de edición de perfil con los errores correspondientes
    if (!errores.isEmpty()) {
        req.flash('error', errores.errors.map(error => error.msg)); // Muestra los mensajes de error en la vista
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs', // Título de la página
            usuario: req.user, // Pasa los datos del usuario autenticado a la vista
            cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
            nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
            imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
            mensajes: req.flash(), // Muestra los mensajes de error en la vista
        });
        return;
    }

    // Si no hay errores, llama al siguiente middleware
    next();
}

// Middleware para subir una imagen al servidor
exports.subirImagen = (req, res, next) => {
    // Llama a la función 'upload' para procesar la subida de la imagen
    upload(req, res, function (error) {
        if (error) {
            // Verifica si ocurrió un error específico de multer durante la subida
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande. Máximo 100KB'); // Muestra un mensaje de error en la vista
                } else {
                    req.flash('error', error.message); // Muestra un mensaje de error en la vista
                }
            } else {
                req.flash('error', error.message); // Muestra un mensaje de error en la vista
            }
            res.redirect('/administracion'); // Redirige al usuario a la página de administración
            return; // Finaliza la ejecución del middleware
        } else {
            // Llama al siguiente middleware en la cadena
            next();
        }
    });
}

// Configuración de multer para subir archivos al servidor
const configuracionMulter = {
    // Límite de tamaño para los archivos subidos (100 KB)
    limits: { fileSize: 100000 },
    // Configuración del almacenamiento de archivos
    storage: fileStorage = multer.diskStorage({
        // Directorio de destino para los archivos subidos
        destination: (req, file, cb) => {
            // Guarda los archivos en el directorio 'public/uploads/perfiles'
            cb(null, __dirname + '../../public/uploads/perfiles');
        },
        // Nombre del archivo subido
        filename: (req, file, cb) => {
            // Obtiene la extensión del archivo a partir del tipo MIME
            const extension = file.mimetype.split('/')[1];
            // Genera un nombre único para el archivo usando shortid y agrega la extensión
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    // Filtro para aceptar solo ciertos tipos de archivos
    fileFilter(req, file, cb) {
        // Acepta solo archivos JPEG y PNG
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true); // Acepta el archivo
        } else {
            // Si el archivo no es JPEG o PNG, rechaza el archivo
            cb(new Error('Formato no válido. Solo se permiten archivos en formato JPG y PNG'), false);
        }
    },
};

// Configura multer para manejar la subida de un solo archivo con el campo 'imagen'
const upload = multer(configuracionMulter).single('imagen');
