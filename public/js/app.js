import axios from 'axios';
import Swal from 'sweetalert2';

// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // Función para limpiar las alertas después de 5 segundos
    let alertas = document.querySelector('.alertas');
    // Verifica si el elemento 'alertas' existe en el DOM
    if (alertas) {
        // Elimina las alertas después de 5 segundos
        limpiarAlertas(alertas);
    }


    // Selecciona el elemento con la clase 'lista-conocimientos'
    const skills = document.querySelector('.lista-conocimientos');
    // Verifica si el elemento 'skills' existe en el DOM
    if (skills) {
        // Añade un evento de clic al elemento 'skills'
        skills.addEventListener('click', agregarSkills);
        // Llama a la función 'skillsSeleccionadas' para marcar las habilidades seleccionadas al cargar la página
        skillsSeleccionadas();
    }


    // Selecciona el elemento con la clase 'panel-administracion'
    const vacantesListado = document.querySelector('.panel-administracion');
    // Verifica si el elemento 'vacantesListado' existe en el DOM
    if (vacantesListado) {
        // Añade un evento de clic al elemento 'vacantesListado'
        vacantesListado.addEventListener('click', accionesListado);
    }

});

// Crea un nuevo conjunto (Set) para almacenar las habilidades seleccionadas
const skills = new Set();
// Función para agregar o quitar habilidades al conjunto 'skills'
const agregarSkills = e => {
    // Verifica si el elemento clicado es una lista (LI)
    if (e.target.tagName === 'LI') {
        // Si el elemento tiene la clase 'activo'
        if (e.target.classList.contains('activo')) {
            // Elimina la habilidad del conjunto 'skills'
            skills.delete(e.target.textContent);
            // Remueve la clase 'activo' del elemento
            e.target.classList.remove('activo');
        } else {
            // Añade la habilidad al conjunto 'skills'
            skills.add(e.target.textContent);
            // Añade la clase 'activo' al elemento
            e.target.classList.add('activo');
        }
    }

    // Almacena las habilidades seleccionadas en un array de habilidades
    const skillsArray = [...skills];
    // Asigna el array de habilidades al campo 'skills' del formulario
    document.querySelector('#skills').value = skillsArray;
}

// Función para marcar las habilidades seleccionadas al cargar la página
const skillsSeleccionadas = () => {
    // Selecciona todas las habilidades almacenadas en el campo 'skills' del formulario
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    // Itera sobre cada habilidad seleccionada
    seleccionadas.forEach(seleccionada => {
        // Añade la habilidad al conjunto 'skills'
        skills.add(seleccionada.textContent);
    });

    // Almacena las habilidades seleccionadas en un array de habilidades
    const skillsArray = [...skills];
    // Asigna el array de habilidades al campo 'skills' del formulario
    document.querySelector('#skills').value = skillsArray;
}

// Función para limpiar alertas
const limpiarAlertas = alertas => {
    // Establece un intervalo que se ejecuta cada 5000 milisegundos (5 segundos)
    const interval = setInterval(() => {
        // Verifica si el elemento 'alertas' tiene hijos
        if (alertas.children.length > 0) {
            // Si tiene hijos, elimina el primer hijo del elemento 'alertas'
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length == 0) {
            // Si no tiene hijos, elimina el elemento 'alertas' del DOM
            alertas.parentElement.removeChild(alertas);
            // Limpia el intervalo para detener la ejecución repetida
            clearInterval(interval);
        }
    }, 5000);
};

// Función para realizar acciones en el listado de vacantes
const accionesListado = e => {
    // Previene el comportamiento por defecto del evento (navegación del enlace)
    e.preventDefault();

    // Verifica si el elemento clicado tiene el atributo data-eliminar
    if (e.target.dataset.eliminar) {
        // Muestra una alerta de confirmación usando SweetAlert2
        Swal.fire({
            title: "¿Confirmar Eliminación?", // Título de la alerta
            text: "Una vez eliminada, no se puede recuperar una vacante.", // Texto de la alerta
            icon: "warning", // Icono de advertencia
            showCancelButton: true, // Muestra el botón de cancelar
            confirmButtonColor: "#3085d6", // Color del botón de confirmación
            cancelButtonColor: "#d33", // Color del botón de cancelar
            confirmButtonText: "Sí, eliminar", // Texto del botón de confirmación
            cancelButtonText: "No, Cancelar" // Texto del botón de cancelar
        }).then((result) => {
            // Si el usuario confirma la eliminación
            if (result.isConfirmed) {
                // Construye la URL para la petición DELETE usando el dataset.eliminar
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                // Envía una petición DELETE a la URL usando Axios y espera a que se complete la operación
                axios.delete(url, { params: { url } })
                    .then(function (respuesta) {
                        // Si la respuesta es exitosa (status 200)
                        if (respuesta.status === 200) {
                            // Muestra una alerta de éxito usando SweetAlert2
                            Swal.fire(
                                "¡Eliminado!", // Título de la alerta
                                respuesta.data, // Texto de la alerta (respuesta del servidor)
                                "success" // Icono de éxito
                            );
                            // Elimina el elemento del DOM
                            e.target.parentElement.parentElement.remove();
                        }
                    })
                    .catch(() => {
                        // Si hay un error en la petición, muestra una alerta de error
                        Swal.fire({
                            type: "error", // Tipo de alerta (error)
                            title: "Hubo un error", // Título de la alerta
                            text: "No se pudo eliminar" // Texto de la alerta
                        });
                    });
            }
        });
    } else if (e.target.tagName === 'A') {
        // Si el elemento clicado es un enlace, redirige a la URL del enlace
        window.location.href = e.target.href;
    }
}