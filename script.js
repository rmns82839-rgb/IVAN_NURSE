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

    // FARMACIAS QUE SÍ FUNCIONAN Y SON ESTABLES
    const farmacias = [
        { nombre: 'Cruz Verde', url: `https://www.cruzverde.com.co/search?query=${termino}` },
        { nombre: 'Farmatodo', url: `https://www.farmatodo.com.co/buscar?product=${termino}` },
        { nombre: 'Pasteur', url: `https://www.farmaciaspasteur.com.co/s/${termino}` }
    ];

    // Limpiamos el contenedor
    contenedorBotones.innerHTML = '';

    if (seleccion === "todas") {
        contenedorBotones.innerHTML = '<p class="text-muted small w-100 mt-2">Compara precios en sitios seguros:</p>';
        
        // Creamos botones de farmacias
        farmacias.forEach(farma => {
            const btn = document.createElement('a');
            btn.href = farma.url;
            btn.target = "_blank";
            btn.className = "btn btn-outline-primary m-1 btn-sm fw-bold shadow-sm";
            btn.innerHTML = `<i class="fas fa-external-link-alt"></i> ${farma.nombre}`;
            contenedorBotones.appendChild(btn);
        });
    } else {
        // Abre solo la elegida
        const farmaElegida = farmacias[parseInt(seleccion)];
        window.open(farmaElegida.url, '_blank');
    }

    // SIEMPRE añadir el Botón de Asesoría de Iván (WhatsApp)
    const btnAsesor = document.createElement('button');
    btnAsesor.className = "btn btn-success m-1 btn-sm fw-bold shadow-sm border-2 border-white";
    btnAsesor.innerHTML = `<i class="fab fa-whatsapp"></i> ¿Deseas que yo lo busque y te lo lleve?`;
    btnAsesor.style.backgroundColor = "#25d366";
    btnAsesor.onclick = () => cotizarConIvan(query);
    contenedorBotones.appendChild(btnAsesor);

    contenedorBotones.classList.remove('d-none');
}

function cotizarConIvan(producto) {
    const mensaje = encodeURIComponent(`Hola Iván, estoy buscando "${producto}". ¿Me puedes ayudar a cotizarlo en otras farmacias y traérmelo a casa?`);
    window.open(`https://wa.me/573054494534?text=${mensaje}`, '_blank');
}

/**
 * AÑADIR AL CARRITO
 */
function agregarAlCarrito(nombre, precio) {
    if (nombre === 'Mensajería Médica' || nombre === 'Reclamo EPS') {
        const detalle = prompt("Por favor, describe brevemente el medicamento o trámite que necesitas:");
        if (!detalle) return; 
        nombre = `${nombre} - ${detalle}`;
    }

    carrito.push({ nombre, precio });
    actualizarCarrito();
    
    // Pequeña alerta visual de éxito
    console.log(`✅ ${nombre} añadido al pedido.`);
}

/**
 * ACTUALIZAR VISTA DEL CARRITO (MODAL)
 */
function actualizarCarrito() {
    const contador = document.getElementById('contador-carrito');
    const lista = document.getElementById('lista-carrito');
    let total = 0;
    
    contador.innerText = carrito.length;
    
    if(carrito.length === 0) {
        lista.innerHTML = '<div class="text-center p-4"><i class="fas fa-shopping-basket fa-3x text-muted mb-2"></i><p>Tu carrito está vacío</p></div>';
        return;
    }

    lista.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div class="d-flex justify-content-between align-items-center border-bottom py-3">
                <div>
                    <div class="fw-bold" style="font-size: 0.9rem;">${item.nombre}</div>
                    <div class="text-primary small">$${item.precio.toLocaleString()}</div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="btn btn-sm btn-outline-danger border-0">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
    }).join('');
    
    lista.innerHTML += `
        <div class="d-flex justify-content-between mt-4 p-2 bg-light rounded">
            <span class="fw-bold">TOTAL A PAGAR:</span>
            <span class="fw-bold text-primary fs-5">$${total.toLocaleString()}</span>
        </div>`;
}

/**
 * ELIMINAR ÍTEM
 */
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

/**
 * ENVIAR PEDIDO A WHATSAPP (CON MEJORAS DE FORMATO)
 */
function enviarPedido() {
    const direccion = document.getElementById('direccion-cliente').value.trim();
    
    if(carrito.length === 0) {
        alert("El carrito está vacío. Añade algún servicio primero.");
        return;
    }
    
    if(!direccion) {
        alert("Por favor, ingresa tu dirección para el domicilio.");
        return;
    }

    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);

    // Construcción del mensaje con formato WhatsApp más profesional
    let mensaje = `*🏥 NUEVO PEDIDO - IVÁN NURSE*%0A`;
    mensaje += `------------------------------------------%0A`;
    mensaje += `*Hola Iván, deseo solicitar los siguientes servicios:*%0A%0A`;
    
    carrito.forEach((item, i) => {
        mensaje += `✅ *${item.nombre}* ($${item.precio.toLocaleString()})%0A`;
    });
    
    mensaje += `%0A------------------------------------------%0A`;
    mensaje += `*💰 TOTAL:* $${totalPedido.toLocaleString()}%0A`;
    mensaje += `*📍 DIRECCIÓN:* ${direccion}%0A`;
    mensaje += `------------------------------------------%0A`;
    mensaje += `_Enviado desde el catálogo digital_`;

    const numeroWhatsApp = "573054494534";
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');

    // MEJORA: Vaciar el carrito después de enviar para evitar duplicados
    setTimeout(() => {
        if(confirm("¿Se abrió WhatsApp correctamente? Presiona OK para limpiar tu carrito.")) {
            carrito = [];
            document.getElementById('direccion-cliente').value = ""; // Limpiar dirección
            actualizarCarrito();
            // Cerrar el modal automáticamente (si usas Bootstrap)
            const modalElement = document.getElementById('modalCarrito');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if(modal) modal.hide();
        }
    }, 1000);
}