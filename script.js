// Variable global para almacenar el pedido
let carrito = [];

/**
 * BUSCADOR DE PRECIOS
 */
function ejecutarBusqueda() {
    const query = document.getElementById('busqueda-farmacia').value.trim();
    const seleccion = document.getElementById('selector-farmacia').value;
    const contenedorBotones = document.getElementById('enlaces-farmacia');
    
    if(!query) return alert("Por favor, escribe el nombre del producto.");

    const termino = encodeURIComponent(query);
    const farmacias = [
        { nombre: 'Cruz Verde', url: `https://www.cruzverde.com.co/search?query=${termino}` },
        { nombre: 'Farmatodo', url: `https://www.farmatodo.com.co/buscar?product=${termino}` },
        { nombre: 'Pasteur', url: `https://www.farmaciaspasteur.com.co/s/${termino}` }
    ];

    contenedorBotones.innerHTML = '';

    if (seleccion === "todas") {
        contenedorBotones.innerHTML = '<p class="text-muted small w-100 mt-2">Compara precios en sitios seguros:</p>';
        farmacias.forEach(farma => {
            const btn = document.createElement('a');
            btn.href = farma.url;
            btn.target = "_blank";
            btn.className = "btn btn-outline-primary m-1 btn-sm fw-bold shadow-sm";
            btn.innerHTML = `<i class="fas fa-external-link-alt"></i> ${farma.nombre}`;
            contenedorBotones.appendChild(btn);
        });
    } else {
        window.open(farmacias[parseInt(seleccion)].url, '_blank');
    }

    const btnAsesor = document.createElement('button');
    btnAsesor.className = "btn btn-success m-1 btn-sm fw-bold shadow-sm border-2 border-white";
    btnAsesor.innerHTML = `<i class="fab fa-whatsapp"></i> ¿Deseas que yo lo busque?`;
    btnAsesor.style.backgroundColor = "#25d366";
    btnAsesor.onclick = () => cotizarConIvan(query);
    contenedorBotones.appendChild(btnAsesor);
    contenedorBotones.classList.remove('d-none');
}

function cotizarConIvan(producto) {
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const mensaje = "CONSULTA MEDICAMENTOS (" + fecha + ")\n\nHola Ivan, estoy buscando: " + producto + ".\n¿Me ayudas a gestionarlo?";
    window.open("https://wa.me/573054494534?text=" + encodeURIComponent(mensaje), '_blank');
}

/**
 * GESTIÓN DEL CARRITO
 */
function agregarAlCarrito(nombre, precio) {
    if (nombre === 'Mensajería Médica' || nombre === 'Reclamo EPS') {
        const detalle = prompt("Describe brevemente el trámite o medicamento:");
        if (!detalle) return; 
        nombre = nombre + " - " + detalle;
    }
    carrito.push({ nombre, precio });
    actualizarCarrito();
}

function actualizarCarrito() {
    const contador = document.getElementById('contador-carrito');
    const lista = document.getElementById('lista-carrito');
    let total = 0;
    
    if (contador) contador.innerText = carrito.length;
    if(!lista) return;

    if(carrito.length === 0) {
        lista.innerHTML = '<div class="text-center p-4"><p>Tu carrito está vacío</p></div>';
        return;
    }

    lista.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <div class="fw-bold" style="font-size: 0.85rem;">${item.nombre}</div>
                    <div class="text-primary small">$${item.precio.toLocaleString()}</div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="btn btn-sm text-danger border-0">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
    }).join('');
    
    lista.innerHTML += `
        <div class="d-flex justify-content-between mt-3 p-2 bg-light rounded">
            <span class="fw-bold">TOTAL:</span>
            <span class="fw-bold text-primary">$${total.toLocaleString()}</span>
        </div>`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

/**
 * ENVIAR PEDIDO (VERSIÓN IVÁN NURSE 2026)
 */
function enviarPedido() {
    const direccionInput = document.getElementById('direccion-cliente');
    const direccion = direccionInput ? direccionInput.value.trim() : "";
    
    if(carrito.length === 0 || !direccion) {
        alert("Asegúrate de tener servicios en el carrito e ingresar tu dirección.");
        if(direccionInput) direccionInput.focus();
        return;
    }

    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
function vaciarCarrito() {
    if(confirm("¿Quieres quitar todos los servicios del carrito?")) {
        carrito = [];
        actualizarCarrito();
    }
}
    // CONSTRUCCIÓN DEL MENSAJE PROFESIONAL
    // El código %F0%9F%91%8B es el emoji de la mano saludando 👋
let mensaje = "🏥 *--- NUEVO PEDIDO - IVÁN NURSE ---*\n";
mensaje += "¡Hola Iván Nurse! 👋 Vengo de la App y necesito información.\n";
    mensaje += "📅 *Fecha:* " + fecha + "\n";
    mensaje += "------------------------------------------\n";
    mensaje += "Hola Iván, deseo solicitar estos servicios:\n\n";
    
    carrito.forEach((item) => {
        mensaje += "✅ " + item.nombre + " ($" + item.precio.toLocaleString() + ")\n";
    });
    
    mensaje += "\n------------------------------------------\n";
    mensaje += "💰 *TOTAL: $" + totalPedido.toLocaleString() + "*\n";
    mensaje += "📍 *DIRECCIÓN:* " + direccion + "\n";
    mensaje += "------------------------------------------\n";
    mensaje += "🎟️ *CÓDIGO:* IVANNURSE10 (10% OFF)\n";
    mensaje += "_Enviado desde el catálogo digital_";

    // 1. Mostrar el Modal de Confirmación que creamos antes
    const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modalConfirm.show();

    // 2. Esperar 2.5 segundos para la animación y enviar
    setTimeout(() => {
        const urlFinal = "https://wa.me/573054494534?text=" + encodeURIComponent(mensaje);
        
        // Usamos location.href para una transición más suave en móviles
        window.location.href = urlFinal;

        // 3. Limpieza silenciosa (Sin el molesto confirm)
        carrito = [];
        if(direccionInput) direccionInput.value = ""; 
        actualizarCarrito();
        
        // Cerrar el carrito de fondo si está abierto
        const modalCarritoElem = document.getElementById('modalCarrito');
        if (modalCarritoElem) {
            const modalC = bootstrap.Modal.getInstance(modalCarritoElem);
            if(modalC) modalC.hide();
        }
    }, 2500);
}

