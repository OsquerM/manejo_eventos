// ========================
// CONFIGURACIÓN
// ========================
const STORAGE_KEY_PEDIDO = 'kiosko_pedido_actual';

const PATRONES = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{3,10}$/,
    apellido1: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{4,8}$/,
    apellido2: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{4,8}$/,
    telefono: /^\+\d{2}\s\d{3}\s\d{3}\s\d{3}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    direccion: /^.{5,100}$/
};

const MENSAJES_ERROR = {
    nombre: "El nombre debe tener entre 3 y 10 letras",
    apellido1: "El primer apellido debe tener entre 4 y 8 letras",
    apellido2: "El segundo apellido debe tener entre 4 y 8 letras",
    telefono: "Formato esperado: +34 666 777 888",
    email: "Introduce un email válido",
    direccion: "La dirección debe tener al menos 5 caracteres"
};

// ========================
// REFERENCIAS AL DOM
// ========================
const elementos = {
    buyButtons: document.querySelectorAll('.buy-button'),
    formContacto: document.getElementById('form-datos-contacto'),
    btnRealizarPedido: document.getElementById('btn-realizar-pedido'),
    btnBorrarPedido: document.getElementById('btn-borrar-pedido'),
    resumenContenido: document.getElementById('resumen-contenido')
};

let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY_PEDIDO)) || [];

// ========================
// FUNCIONES
// ========================
function mostrarError(input, mensaje) {
    input.classList.add('error');
    let span = input.parentElement.querySelector('.error-message');
    if (!span) {
        span = document.createElement('span');
        span.className = 'error-message';
        span.style.color = 'red';
        input.parentElement.appendChild(span);
    }
    span.textContent = mensaje;
}

function limpiarError(input) {
    input.classList.remove('error');
    const span = input.parentElement.querySelector('.error-message');
    if (span) span.textContent = '';
}

function validarCampo(campo, valor) {
    if (campo === 'apellido2' && valor.trim() === '') return true;
    const patron = PATRONES[campo];
    return patron.test(valor.trim());
}

function validarFormulario() {
    let esValido = true;
    const inputs = elementos.formContacto.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        limpiarError(input);
        const valor = input.value;
        if (input.required && valor.trim() === '') {
            mostrarError(input, "Este campo es obligatorio");
            esValido = false;
        } else if (!validarCampo(input.id, valor)) {
            mostrarError(input, MENSAJES_ERROR[input.id]);
            esValido = false;
        }
    });
    return esValido;
}

function obtenerDatosFormulario() {
    const datos = {};
    ['nombre','apellido1','apellido2','telefono','email','direccion'].forEach(id => {
        datos[id] = document.getElementById(id).value.trim();
    });
    return datos;
}

function guardarCarrito() {
    localStorage.setItem(STORAGE_KEY_PEDIDO, JSON.stringify(carrito));
}

function actualizarResumen() {
    if (carrito.length === 0) {
        elementos.resumenContenido.innerHTML = '<p class="empty-cart">Actualmente no hay productos en el carrito</p>';
        return;
    }

    const datos = obtenerDatosFormulario();
    const nombreCompleto = [datos.nombre, datos.apellido1, datos.apellido2].filter(Boolean).join(' ');

    let html = '<h3>Pedido de:</h3>';
    if (nombreCompleto) html += `<p><strong>${nombreCompleto}</strong></p>`;
    if (datos.direccion) html += `<p>Dirección: ${datos.direccion}</p>`;
    if (datos.telefono) html += `<p>Teléfono: ${datos.telefono}</p>`;

    html += '<h3>Productos:</h3><ul>';
    let total = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `<li>${item.nombre} × ${item.cantidad} → ${subtotal.toFixed(2)} €</li>`;
    });
    html += `</ul><p><strong>Total: ${total.toFixed(2)} €</strong></p>`;

    elementos.resumenContenido.innerHTML = html;
}

// ========================
// EVENTOS
// ========================
document.addEventListener('DOMContentLoaded', () => {
    actualizarResumen();

    elementos.buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = btn.closest('.product');
            const nombre = producto.querySelector('h3').textContent;
            const precioTexto = producto.querySelector('.important-text').textContent.replace('€','').replace(',','.');
            const precio = parseFloat(precioTexto);

            const existe = carrito.find(i => i.nombre === nombre);
            if (existe) existe.cantidad++;
            else carrito.push({nombre, precio, cantidad:1});

            guardarCarrito();
            actualizarResumen();
        });
    });

    elementos.formContacto.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            limpiarError(input);
            if(input.value.trim() !== '' && !validarCampo(input.id, input.value)){
                mostrarError(input, MENSAJES_ERROR[input.id]);
            }
        });
    });

    elementos.btnRealizarPedido.addEventListener('click', () => {
        if (carrito.length === 0) { alert("Actualmente no hay productos en el carrito."); return; }
        if (!validarFormulario()) { alert("Corrige los errores del formulario."); return; }

        alert("¡Pedido registrado correctamente!\nGracias por tu compra ♥");
        actualizarResumen();
    });

    elementos.btnBorrarPedido.addEventListener('click', () => {
        if (carrito.length === 0) { alert("No hay pedido para borrar"); return; }
        if(confirm("¿Quieres borrar TODO el carrito?")){
            carrito = [];
            localStorage.removeItem(STORAGE_KEY_PEDIDO);
            actualizarResumen();
        }
    });
});
