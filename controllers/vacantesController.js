const { check, validationResult, body } = require('express-validator'); // Importa los métodos de validación de express-validator
const mongoose = require('mongoose'); // Importa el módulo mongoose para interactuar con la base de datos
const Vacante = mongoose.model('Vacante'); // Importa el modelo Vacante para interactuar con la colección de vacantes

const multer = require('multer'); // Importa el módulo multer para subir archivos
const shortid = require('shortid'); // Importa el módulo shortid para generar IDs únicos

// Exporta la función 'formularioNuevaVacante' como parte del módulo
exports.formularioNuevaVacante = (req, res) => {
    // Renderiza la vista 'nueva-vacante' y pasa un objeto con datos a la plantilla
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante', // Título de la página
        tagline: 'Llena el formulario y publica tu vacante', // Descripción o eslogan de la página
        cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
        nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
        imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
    });
};

// Exporta la función 'agregarVacante' como parte del módulo
exports.agregarVacante = async (req, res) => {
    // Crea una nueva instancia del modelo 'Vacante' con los datos del cuerpo de la solicitud
    const vacante = new Vacante(req.body);
    // Asigna el autor de la vacante al usuario autenticado
    vacante.autor = req.user._id;
    // Divide la cadena de habilidades (skills) en un array, separando por comas
    vacante.skills = req.body.skills.split(',');
    // Guarda la nueva vacante en la base de datos y espera a que se complete la operación
    const nuevaVacante = await vacante.save();
    // Redirige al usuario a la página de la nueva vacante utilizando la URL generada
    res.redirect(`/vacantes/${nuevaVacante.url}`);
};

// Exporta la función 'mostrarVacante' como parte del módulo
exports.mostrarVacante = async (req, res, next) => {
    // Busca una vacante por su URL y espera a que se complete la operación
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    // Si no se encuentra la vacante, continuar con el siguiente middleware
    if (!vacante) return next();
    // Si se encuentra la vacante, renderizar la vista 'vacante' y pasar los datos a la plantilla
    res.render('vacante', {
        nombrePagina: vacante.titulo, // Título de la página
        barra: true, // Mostrar la barra de navegación en la página de
        vacante, // Objeto con los datos de la vacante para mostrar en la plantilla
    });
};

// Exporta la función 'formEditarVacante' como parte del módulo
exports.formEditarVacante = async (req, res, next) => {
    // Busca una vacante por su URL y espera a que se complete la operación
    const vacante = await Vacante.findOne({ url: req.params.url });
    // Si no se encuentra la vacante, continuar con el siguiente middleware
    if (!vacante) return next();
    // Si se encuentra la vacante, renderizar la vista 'editar-vacante' y pasar los datos a la plantilla
    res.render('editar-vacante', {
        nombrePagina: `Editar - ${vacante.titulo}`, // Título de la página
        vacante, // Objeto con los datos de la vacante para mostrar en la plantilla
        cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
        nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
        imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
    });
};

// Exporta la función 'editarVacante' como parte del módulo
exports.editarVacante = async (req, res) => {
    // Almacena los datos del cuerpo de la solicitud en 'vacanteActualizada'
    const vacanteActualizada = req.body;
    // Convierte la cadena de habilidades en un array y lo asigna a 'vacanteActualizada.skills'
    vacanteActualizada.skills = req.body.skills.split(',');
    // Busca una vacante por su URL y la actualiza con los datos de 'vacanteActualizada'
    const vacante = await Vacante.findOneAndUpdate(
        { url: req.params.url },
        vacanteActualizada,
        {
            new: true, // 'new: true' devuelve el documento actualizado
            runValidators: true // 'runValidators: true' ejecuta las validaciones definidas en el esquema del modelo
        }
    );
    // Redirige al usuario a la página de la vacante actualizada
    res.redirect(`/vacantes/${vacante.url}`);
};

// Exporta la función 'validarVacante' como parte del módulo
exports.validarVacante = async (req, res, next) => {
    // Valida y sanitiza los campos del formulario de nueva vacante

    // Verifica que el campo 'titulo' no esté vacío, muestra un mensaje si está vacío, y escapa cualquier carácter especial para evitar inyecciones de código
    await check('titulo').notEmpty().withMessage('El título es obligatorio').escape().run(req);
    // Verifica que el campo 'empresa' no esté vacío, muestra un mensaje si está vacío, y escapa cualquier carácter especial para evitar inyecciones de código
    await check('empresa').notEmpty().withMessage('La empresa es obligatoria').escape().run(req);
    // Verifica que el campo 'ubicacion' no esté vacío, muestra un mensaje si está vacío, y escapa cualquier carácter especial para evitar inyecciones de código
    await check('ubicacion').notEmpty().withMessage('La ubicación es obligatoria').escape().run(req);
    // Verifica que el campo 'contrato' no esté vacío, muestra un mensaje si está vacío, y escapa cualquier carácter especial para evitar inyecciones de código
    await check('contrato').notEmpty().withMessage('El tipo de contrato es obligatorio').escape().run(req);
    // Verifica que el campo 'skills' no esté vacío, muestra un mensaje si está vacío, y escapa cualquier carácter especial para evitar inyecciones de código
    await check('skills').notEmpty().withMessage('Agrega al menos una habilidad').escape().run(req);

    // Obtiene los errores de validación del cuerpo de la solicitud
    const errores = validationResult(req);

    // Si hay errores en la validación, muestra la vista de nueva vacante con los errores correspondientes
    if (!errores.isEmpty()) {
        req.flash('error', errores.errors.map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante', // Título de la página
            tagline: 'Llena el formulario y publica tu vacante', // Descripción o eslogan de la página
            cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
            nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
            mensajes: req.flash() // Muestra los mensajes de error en la vista
        });
        return;
    }

    // Si no hay errores, llama al siguiente middleware
    next();
}

// Exporta la función 'eliminarVacante' como parte del módulo
exports.eliminarVacante = async (req, res) => {
    // Extrae el id de la vacante de los parámetros de la solicitud (req.params)
    const { id } = req.params;
    // Busca la vacante por su id en la base de datos y la almacena en 'vacante'
    const vacante = await Vacante.findById(id);
    // Verifica si el usuario autenticado es el autor de la vacante
    if (verificarAutor(vacante, req.user)) {
        // Si el usuario es el autor, elimina la vacante de la base de datos usando deleteOne y el id de la vacante a eliminar 
        await Vacante.deleteOne({ _id: id });
        // Envía un mensaje de éxito al cliente con un status 200
        res.status(200).send('Vacante eliminada correctamente');
    } else {
        // Si el usuario no es el autor, envía un mensaje de error al cliente
        res.status(403).send('Error al intentar eliminar la vacante');
    }
}

// Función para verificar si el usuario es el autor de la vacante
const verificarAutor = (vacante = {}, usuario = {}) => {
    // Verifica si el ID del autor de la vacante es igual al ID del usuario autenticado en la aplicación (req.user)
    // equals() es un método de Mongoose que compara dos ObjectId y retorna true si son iguales
    if (!vacante.autor.equals(usuario._id)) {
        // Si no son iguales, retorna false (el usuario no es el autor) 
        return false;
    }
    // Si son iguales, retorna true (el usuario es el autor)
    return true;
}

// Middleware para subir archivos con multer y validar el tamaño y tipo de archivo subido
exports.subirCV = (req, res, next) => {
    // Llama a la función upload para manejar la subida del archivo
    upload(req, res, function (error) {
        // Si hay un error durante la subida del archivo
        if (error) {
            // Si el error es una instancia de MulterError (error específico de multer)
            if (error instanceof multer.MulterError) {
                // Si el error es debido al tamaño del archivo
                if (error.code === 'LIMIT_FILE_SIZE') {
                    // Agrega un mensaje flash de error indicando que el archivo es muy grande
                    req.flash('error', 'El archivo es muy grande: Máximo 100KB');
                } else {
                    // Agrega un mensaje flash de error con el mensaje del error de multer
                    req.flash('error', error.message);
                }
            } else {
                // Si el error no es de multer, agrega un mensaje flash con el mensaje del error
                req.flash('error', error.message);
            }
            // Redirige al usuario de vuelta a la página anterior
            res.redirect('back');
            return;
        } else {
            // Si no hay errores, llama al siguiente middleware
            return next();
        }
    });
}

// Configuración de multer para subir archivos
const configuracionMulter = {
    // Límite de tamaño del archivo en bytes
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        // Destino de los archivos subidos
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        // Genera un nombre único para el archivo
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    // Función para filtrar los tipos de archivos permitidos
    fileFilter: (req, file, cb) => {
        // Verifica si el archivo es un PDF
        if (file.mimetype === 'application/pdf') {
            // Si es un PDF, ejecuta el callback con el valor true (acepta el archivo)
            cb(null, true);
        } else {
            // Si no es un PDF, ejecuta el callback con el valor false (rechaza el archivo)
            cb(new Error('Formato de archivo no válido. Solo se permiten archivos PDF'), false);
        }
    }
};

// Función para subir archivos con multer
const upload = multer(configuracionMulter).single('cv');

// Exporta la función 'contactar' como parte del módulo
exports.contactar = async (req, res, next) => {
    // Busca una vacante por su URL y espera a que se complete la operación 
    const vacante = await Vacante.findOne({ url: req.params.url });
    // Si no se encuentra la vacante, continuar con el siguiente middleware
    if (!vacante) return next();
    // Crea un objeto con los datos del candidato y el archivo CV subido por el usuario
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    // Agrega el candidato al array de candidatos de la vacante
    vacante.candidatos.push(nuevoCandidato);
    // Guarda la vacante actualizada en la base de datos
    await vacante.save();
    // Envía un mensaje de éxito al cliente
    req.flash('correcto', 'Tu CV se envió correctamente');
    // Redirige al usuario a la página principal
    res.redirect('/');
}

// Exporta la función 'mostrarCandidatos' como parte del módulo
exports.mostrarCandidatos = async (req, res, next) => {
    // Busca una vacante por su ID y espera a que se complete la operación usando el método lean() para obtener un objeto plano de Mongoose 
    const vacante = await Vacante.findById(req.params.id).lean();
    // Si no se encuentra la vacante, continuar con el siguiente middleware
    if (!vacante) return next();
    // Verifica si el usuario autenticado es el autor de la vacante 
    if (vacante.autor != req.user._id.toString()) {
        return next();
    }
    // Renderiza la vista 'candidatos' y pasa los datos de la vacante a la plantilla
    res.render('candidatos', {
        nombrePagina: `Candidatos de la vacante - ${vacante.titulo}`, // Título de la página
        cerrarSesion: true, // Muestra el enlace para cerrar sesión en la vista
        nombre: req.user.nombre, // Pasa el nombre del usuario autenticado a la vista
        imagen: req.user.imagen, // Pasa la imagen del usuario autenticado a la vista
        candidatos: vacante.candidatos // Pasa los candidatos de la vacante a la vista
    });

}

// Exporta la función 'buscarVacantes' como parte del módulo
exports.buscarVacantes = async (req, res) => {
    // Obtiene el término de búsqueda del campo 'q' en el cuerpo de la solicitud
    const { q } = req.body;
    // Si no hay un término de búsqueda, redirige al usuario a la página principal
    if (!q) return res.redirect('/');
    // Busca las vacantes que coincidan con el término de búsqueda
    const vacantes = await Vacante.find({
        $text: {
            $search: q
        }
    });
    // Renderiza la vista 'home' y pasa las vacantes encontradas a la plantilla
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${q}`, // Título de la página
        barra: true, // Muestra la barra de navegación en la página de inicio
        vacantes // Pasa las vacantes encontradas a la vista
    });
}