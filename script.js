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
 * ENVIAR PEDIDO (VERSIÓN SEGURA ANTI-ERRORES)
 */
function enviarPedido() {
    const direccionInput = document.getElementById('direccion-cliente');
    const direccion = direccionInput ? direccionInput.value.trim() : "";
    
    if(carrito.length === 0 || !direccion) {
        alert("Asegúrate de tener servicios en el carrito e ingresar tu dirección.");
        return;
    }

    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    // CONSTRUCCIÓN DEL MENSAJE USANDO SÍMBOLOS BÁSICOS (+)
    let mensaje = "*--- NUEVO PEDIDO - IVAN NURSE ---*\n";
    mensaje += "Fecha: " + fecha + "\n";
    mensaje += "------------------------------------------\n";
    mensaje += "Hola Ivan, deseo solicitar estos servicios:\n\n";
    
    carrito.forEach((item) => {
        mensaje += "+ " + item.nombre + " ($" + item.precio.toLocaleString() + ")\n";
    });
    
    mensaje += "\n------------------------------------------\n";
    mensaje += "*TOTAL: $" + totalPedido.toLocaleString() + "*\n";
    mensaje += "*DIRECCION: " + direccion + "*\n";
    mensaje += "------------------------------------------\n";
    mensaje += "_Enviado desde el catalogo digital_";
    // Dentro de la construcción del mensaje en enviarPedido():
    mensaje += "\n🎟️ *CÓDIGO DESCUENTO:* IVANNURSE10 (10% OFF)\n";

    // CODIFICACIÓN FINAL
    const urlFinal = "https://wa.me/573054494534?text=" + encodeURIComponent(mensaje);
    window.open(urlFinal, '_blank');

    // Limpieza automática
    setTimeout(() => {
        if(confirm("¿Se envió el mensaje? Dale OK para limpiar tu carrito.")) {
            carrito = [];
            if(direccionInput) direccionInput.value = ""; 
            actualizarCarrito();
            const modalElement = document.getElementById('modalCarrito');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if(modal) modal.hide();
            }
        }
    }, 1500);
}

