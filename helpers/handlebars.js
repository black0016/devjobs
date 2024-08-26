module.exports = {
    // Función para seleccionar habilidades (skills) en un formulario
    // Recibe un array de habilidades seleccionadas y un objeto de opciones
    seleccionarSkills: (seleccionadas = [], opciones) => {

        // Lista de habilidades disponibles
        const skills = [
            'HTML5', 'CSS3', 'JavaScript', 'React', 'Angular', 'VueJS', 'NodeJS', 'Python', 'Django', 'Flask',
            'PHP', 'Laravel', 'Symfony', 'Ruby', 'Ruby on Rails', 'Java', 'Spring', 'Kotlin', 'Swift', 'iOS',
            'Android', 'SQL', 'MySQL', 'MongoDB', 'Firebase', 'WordPress', 'Drupal', 'Magento', 'Shopify', 'SEO',
            'SEM', 'Google Analytics', 'Adobe Analytics', 'Facebook Ads', 'Google Ads', 'Bing Ads', 'Twitter Ads',
            'LinkedIn Ads', 'MailChimp', 'SendGrid', 'Twilio', 'Stripe', 'PayPal', 'Mercado Pago', 'PayU', 'OpenPay',
            'Payoneer', 'CSSGrid', 'Flexbox', 'jQuery', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript',
            'ORM', 'Sequelize', 'Mongoose', 'MVC', 'SASS'
        ];

        // Variable para almacenar el HTML generado
        let html = '';

        // Itera sobre cada habilidad en la lista de habilidades
        skills.forEach(skill => {
            // Genera un elemento <li> con la habilidad actual y la clase 'activo' si está seleccionada 
            // (incluida en el array de habilidades seleccionadas) o vacía si no lo está 
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''} >${skill}</li>
            `;
        });

        // Asigna el HTML generado al contenido de opciones.fn() y lo retorna
        return opciones.fn().html = html;
    },
    // Helper personalizado de Handlebars para seleccionar el tipo de contrato en un formulario
    tipoContrato: (seleccionado, opciones) => {
        // Genera el HTML del bloque de opciones utilizando el contexto actual
        let html = opciones.fn(this);
        // Crea una expresión regular para encontrar el valor seleccionado en el HTML generado
        let regex = new RegExp(`value="${seleccionado}"`);
        // Reemplaza el valor encontrado con el mismo valor y agrega el atributo 'selected="selected"'
        // Esto marca la opción como seleccionada en el formulario
        html = html.replace(regex, '$& selected="selected"');
        // Retorna el HTML modificado
        return html;
    },
    // Función helper para mostrar alertas
    mostrarAlertas: (errores = {}, alertas) => {
        // Obtiene las claves del objeto de errores, que representan las categorías de errores
        const categoria = Object.keys(errores);
        // Inicializa una cadena vacía para construir el HTML de las alertas
        let html = '';
        // Verifica si hay alguna categoría de errores
        if (categoria.length) {
            // Itera sobre los errores en la primera categoría (asumiendo que solo hay una categoría)
            errores[categoria].forEach(e => {
                // Agrega cada mensaje de error a la cadena HTML, envuelto en un div con la categoría como clase
                html += `
                <div class="${categoria} alerta">
                    ${e}
                </div>
            `;
            });
        }
        // Retorna la cadena HTML generada y la establece como el contenido del bloque de alertas
        return alertas.fn().html = html;
    }
};