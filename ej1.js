
// ========================
// CONFIGURACIÓN Y CONSTANTES
// ========================
const STORAGE_KEY_USER = 'kiosko_usuario';
const STORAGE_KEY_PEDIDO = 'kiosko_pedido_actual';

const PATRONES_VALIDACION = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{3,10}$/,
    apellido: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{4,8}$/,
    telefono: /^\+\d{2}\s\d{3}\s\d{3}\s\d{3}$|^$/, // +99 999-999-999
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    direccion: /^.{5,100}$/
};

const MENSAJES_ERROR = {
    nombre: "El nombre debe tener entre 3 y 10 letras (sin espacios ni números)",
    apellido1: "El primer apellido debe tener entre 4 y 8 letras",
    apellido2: "El segundo apellido debe tener entre 4 y 8 letras (si se indica)",
    telefono: "Formato esperado: +34 666 777 888",
    email: "Introduce un email válido",
    direccion: "La dirección debe tener al menos 5 caracteres"
};


// ========================
// REFERENCIAS AL DOM
// ========================
const elementos = {
    welcomeText: document.getElementById('welcome-text'),
    btnVerMenu: document.getElementById('btn-ver-menu'),
    btnRegistroLogout: document.getElementById('btn-registro-logout'),
    formContacto: document.getElementById('form-datos-contacto'),
    btnRealizarPedido: document.getElementById('btn-realizar-pedido'),
    btnBorrarPedido: document.getElementById('btn-borrar-pedido'),
    resumenContenido: document.getElementById('resumen-contenido'),
    buyButtons: document.querySelectorAll('.buy-button')
};


// ========================
// FUNCIONES AUXILIARES
// ========================
function guardarUsuarioLocal(usuario) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario));
}

function obtenerUsuarioLocal() {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
}

function actualizarMensajeBienvenida() {
    const usuario = obtenerUsuarioLocal();
    
    if (!usuario) {
        elementos.welcomeText.textContent = "Nuestras delicatessen ahora te las llevamos a casa";
        elementos.btnRegistroLogout.textContent = "Registrarse";
        elementos.btnRegistroLogout.style.color = "";
        return;
    }

    elementos.welcomeText.innerHTML = 
        `¡Bienvenid${usuario.genero === 'f' ? 'a' : 'o'} <span class="welcome-message">${usuario.nombre}</span>! ¿Qué te apetece hoy?`;

    elementos.btnRegistroLogout.textContent = "Log out";
    elementos.btnRegistroLogout.style.color = "var(--color-error)";
}

function validarCampo(campo, valor) {
    const patron = PATRONES_VALIDACION[campo];
    if (!patron) return true;

    if (campo === 'apellido2' && valor.trim() === '') return true;

    return patron.test(valor.trim());
}

function mostrarError(input, mensaje) {
    const grupo = input.parentElement;
    let errorEl = grupo.querySelector('.error-message');

    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.style.color = 'var(--color-error)';
        errorEl.style.fontSize = '0.85rem';
        grupo.appendChild(errorEl);
    }

    errorEl.textContent = mensaje;
    input.classList.add('error');
}

function limpiarError(input) {
    const grupo = input.parentElement;
    const errorEl = grupo.querySelector('.error-message');
    if (errorEl) errorEl.textContent = '';
    input.classList.remove('error');
}


// ========================
// MANEJO DEL FORMULARIO
// ========================
function validarFormulario() {
    let esValido = true;

    ['nombre','apellido1','apellido2','telefono','email','direccion'].forEach(campo => {
        const input = document.getElementById(campo);

        // Limpia errores previos
        limpiarError(input);

        // Caso especial: segundo apellido vacío (no obligatorio)
        if (campo === 'apellido2' && input.value.trim() === '') {
            return;
        }

        // VALIDACIÓN
        if (!input.checkValidity()) {

            if (input.validity.valueMissing) {
                mostrarError(input, "Este campo es obligatorio");

            } else if (input.validity.patternMismatch) {
                mostrarError(input, MENSAJES_ERROR[campo]);

            } else if (input.validity.typeMismatch) {
                mostrarError(input, "Formato incorrecto");

            } else {
                mostrarError(input, "Valor no válido");
            }

            esValido = false;
        }
    });

    return esValido;
}


function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value.trim(),
        apellido1: document.getElementById('apellido1').value.trim(),
        apellido2: document.getElementById('apellido2').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim()
    };
}


// ========================
// CARRITO / PEDIDO
// ========================
let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY_PEDIDO)) || [];

function guardarCarrito() {
    localStorage.setItem(STORAGE_KEY_PEDIDO, JSON.stringify(carrito));
}

function actualizarResumen() {
    if (carrito.length === 0) {
        elementos.resumenContenido.innerHTML = '<p class="empty-cart">Actualmente no hay productos en el carrito</p>';
        return;
    }

    const datosCliente = obtenerDatosFormulario();
    const nombreCompleto = [datosCliente.nombre, datosCliente.apellido1, datosCliente.apellido2]
        .filter(Boolean).join(' ');

    let html = '<h3>Pedido de:</h3>';
    if (nombreCompleto) html += `<p><strong>${nombreCompleto}</strong></p>`;
    if (datosCliente.direccion) html += `<p>Dirección: ${datosCliente.direccion}</p>`;
    if (datosCliente.telefono) html += `<p>Teléfono: ${datosCliente.telefono}</p>`;

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
    actualizarMensajeBienvenida();
    actualizarResumen();

    // Registro / Logout
    elementos.btnRegistroLogout.addEventListener('click', () => {
        if (elementos.btnRegistroLogout.textContent === "Registrarse") {
            const nombre = prompt("Introduce tu nombre de usuario:");
            if (!nombre) return;

            const genero = prompt("¿Eres mujer u hombre? (f/m)", "f")?.toLowerCase();
            guardarUsuarioLocal({ nombre, genero: genero === 'f' ? 'f' : 'm' });
            actualizarMensajeBienvenida();
        } else {
            if (confirm("¿Cerrar sesión?")) {
                localStorage.removeItem(STORAGE_KEY_USER);
                actualizarMensajeBienvenida();
            }
        }
    });

    // Comprar producto
    elementos.buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nombre = btn.closest('.product-card').querySelector('h3').textContent;
            const precio = parseFloat(btn.dataset.price);

            const existe = carrito.find(item => item.nombre === nombre);
            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push({ nombre, precio, cantidad: 1 });
            }

            guardarCarrito();
            actualizarResumen();
        });
    });

    // Validación en tiempo real
    elementos.formContacto.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            limpiarError(input);
            if (input.value.trim() !== '') {
                if (!validarCampo(input.id, input.value)) {
                    mostrarError(input, MENSAJES_ERROR[input.id] || "Formato incorrecto");
                }
            }
        });
    });

    // Realizar pedido
    elementos.btnRealizarPedido.addEventListener('click', () => {
        if (carrito.length === 0) {
            alert("Actualmente no hay datos de pedido.");
            return;
        }

        if (!validarFormulario()) {
            alert("Por favor, corrige los errores en el formulario.");
            return;
        }

        alert("¡Pedido registrado correctamente!\n\n" + 
              "Se ha guardado en el almacenamiento local.\n" +
              "Gracias por tu compra ♥");
    });

    // Borrar pedido
    elementos.btnBorrarPedido.addEventListener('click', () => {
        if (carrito.length === 0 && !localStorage.getItem(STORAGE_KEY_PEDIDO)) {
            alert("No hay pedido para borrar");
            return;
        }

        if (confirm("¿Quieres borrar TODO el carrito?")) {
            carrito = [];
            localStorage.removeItem(STORAGE_KEY_PEDIDO);
            actualizarResumen();
        }
    });

    // Botón Ver Menú → por ahora solo cambia texto (puedes ampliarlo)
    elementos.btnVerMenu.addEventListener('click', () => {
        elementos.btnVerMenu.textContent = 
            elementos.btnVerMenu.textContent.includes("Ver") ? "¡Menú desplegado!" : "Ver Menú";
    });
});