// ========================
// CONFIGURACIÓN
// ========================
const STORAGE_KEY_PEDIDO = 'kiosko_pedido_actual';
const STORAGE_KEY_CONTACTO = 'kiosko_datos_contacto';
const STORAGE_KEY_USUARIO = 'kiosko_usuario';

// ========================
// VALIDACIONES
// ========================
const PATRONES = {
    nombre: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,9}$/,
    apellido1: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{3,7}$/,
    apellido2: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{3,7}$/,
    telefono: /^\+\d{2}\s\d{3}\s\d{3}\s\d{3}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    direccion: /^.{5,100}$/
};

const MENSAJES_ERROR = {
    nombre: "Nombre entre 3 y 10 letras, inicial mayúscula",
    apellido1: "Apellido entre 4 y 8 letras, inicial mayúscula",
    apellido2: "Apellido entre 4 y 8 letras, inicial mayúscula",
    telefono: "Formato: +34 666 777 888",
    email: "Email no válido",
    direccion: "Dirección mínima de 5 caracteres"
};

// ========================
// DOM
// ========================
const elementos = {
    buyButtons: document.querySelectorAll('.buy-button'),
    form: document.getElementById('form-datos-contacto'),
    btnRealizar: document.getElementById('btn-realizar-pedido'),
    btnBorrar: document.getElementById('btn-borrar-pedido'),
    resumen: document.getElementById('resumen-contenido'),
    btnVerPedido: document.getElementById('btn-ver-pedido'),
    btnLogout: document.getElementById('btn-logout'),
    mensajeBienvenida: document.getElementById('mensaje-bienvenida'),
    wrapper: document.querySelector('.form-summary-wrapper')
};

// ========================
// POO
// ========================
class Producto {
    constructor(nombre, precio, cantidad = 1) {
        this.nombre = nombre;
        this.precio = precio;
        this.cantidad = cantidad;
    }

    subtotal() {
        return this.precio * this.cantidad;
    }
}

const Carrito = {
    items: JSON.parse(localStorage.getItem(STORAGE_KEY_PEDIDO))?.map(
        p => new Producto(p.nombre, p.precio, p.cantidad)
    ) || [],

    agregar(producto) {
        const existe = this.items.find(p => p.nombre === producto.nombre);
        if (existe) existe.cantidad++;
        else this.items.push(producto);
        this.guardar();
    },

    guardar() {
        localStorage.setItem(STORAGE_KEY_PEDIDO, JSON.stringify(this.items));
    },

    borrar() {
        this.items = [];
        localStorage.removeItem(STORAGE_KEY_PEDIDO);
    },

    total() {
        return this.items.reduce((acc, p) => acc + p.subtotal(), 0);
    }
};

// ========================
// FORMULARIO
// ========================
function validarFormulario() {
    let valido = true;
    const inputs = elementos.form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.classList.remove('error');

        if (!input.checkValidity() || (PATRONES[input.id] && !PATRONES[input.id].test(input.value))) {
            valido = false;
            input.classList.add('error');
        }
    });

    return valido;
}

function guardarContacto() {
    const datos = {};
    ['nombre','apellido1','apellido2','telefono','email','direccion']
        .forEach(id => datos[id] = document.getElementById(id).value.trim());
    sessionStorage.setItem(STORAGE_KEY_CONTACTO, JSON.stringify(datos));
    return datos;
}

// ========================
// RESUMEN
// ========================
function actualizarResumen() {
    const datos = JSON.parse(sessionStorage.getItem(STORAGE_KEY_CONTACTO));

    if (!datos) {
        elementos.resumen.innerHTML = '<p>Actualmente no hay datos de contacto</p>';
        return;
    }

    if (Carrito.items.length === 0) {
        elementos.resumen.innerHTML = '<p>Actualmente no hay productos en el carrito</p>';
        return;
    }

    let html = `
        <p><strong>${datos.nombre} ${datos.apellido1} ${datos.apellido2 || ''}</strong></p>
        <p>${datos.direccion}</p>
        <p>${datos.telefono}</p>
        <ul>
    `;

    Carrito.items.forEach(p => {
        html += `<li>${p.nombre} x ${p.cantidad} → ${p.subtotal().toFixed(2)} €</li>`;
    });

    html += `</ul><p><strong>Total: ${Carrito.total().toFixed(2)} €</strong></p>`;
    elementos.resumen.innerHTML = html;
}

// ========================
// USUARIO
// ========================
function gestionarUsuario() {
    let usuario = localStorage.getItem(STORAGE_KEY_USUARIO);

    if (!usuario) {
        usuario = prompt("Introduce tu nombre de usuario:");
        if (!usuario) return;
        localStorage.setItem(STORAGE_KEY_USUARIO, usuario);
        elementos.mensajeBienvenida.textContent =
            `¡Bienvenido ${usuario}, qué delicatessen deseas probar hoy!`;
    } else {
        elementos.mensajeBienvenida.textContent =
            `¡Bienvenido de nuevo ${usuario}!, ¿repetimos?`;
    }
}

// ========================
// EVENTOS
// ========================
document.addEventListener('DOMContentLoaded', () => {
    gestionarUsuario();
    actualizarResumen();

    // ---- COMPRAR ----
    elementos.buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productoDOM = btn.closest('.product');
            const nombre = productoDOM.querySelector('h3').textContent;
            const precio = parseFloat(
                productoDOM.querySelector('.important-text').textContent.replace('€','').replace(',','.')
            );

            const producto = new Producto(nombre, precio);
            Carrito.agregar(producto);
            actualizarResumen();
        });
    });

    // ---- REALIZAR PEDIDO ----
    elementos.btnRealizar.addEventListener('click', () => {
        if (!validarFormulario()) return alert("Corrige los errores");
        if (!confirm("¿Deseas enviar los datos?")) return;
        guardarContacto();
        actualizarResumen();
    });

    // ---- BORRAR PEDIDO ----
    elementos.btnBorrar.addEventListener('click', () => {
        Carrito.borrar();
        sessionStorage.removeItem(STORAGE_KEY_CONTACTO);
        actualizarResumen();
    });

    // ---- VER PEDIDO ----
    elementos.btnVerPedido.addEventListener('click', () => {
        elementos.wrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // ---- LOGOUT ----
    elementos.btnLogout.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY_USUARIO);
        location.reload();
    });
});
