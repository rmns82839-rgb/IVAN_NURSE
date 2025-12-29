// Variable global para almacenar el pedido
let carrito = [];
let timerEnvio;

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
            btn.className = "btn btn-outline-primary m-1 btn-sm fw-bold shadow-sm btn-hover-effect";
            btn.innerHTML = `<i class="fas fa-external-link-alt"></i> ${farma.nombre}`;
            contenedorBotones.appendChild(btn);
        });
    } else if (seleccion !== "") {
        window.open(seleccion + termino, '_blank');
    }

    const btnAsesor = document.createElement('button');
    btnAsesor.className = "btn btn-success m-1 btn-sm fw-bold shadow-sm border-2 border-white btn-hover-effect";
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
// Mejora: Feedback visual y manejo de duplicados
// Mejora: Feedback visual y manejo de duplicados
function agregarAlCarrito(nombre, precio) {
    // Verificar si el servicio ya está (opcional, según prefieras)
    const existe = carrito.find(item => item.nombre === nombre);
    
    if (nombre === 'Mensajería Médica' || nombre === 'Reclamo EPS') {
        const detalle = prompt("Describe el medicamento o trámite:");
        if (!detalle) return; 
        nombre = `${nombre} (${detalle})`;
    }

    carrito.push({ nombre, precio });
    actualizarCarrito();
    
    // Feedback con SweetAlert2 (recomiendo esta librería para alertas pro)
    // En lugar de alert(), usa algo más moderno
    const toast = document.createElement('div');
    toast.className = "position-fixed top-0 start-50 translate-middle-x bg-success text-white p-3 rounded-bottom shadow";
    toast.style.zIndex = "9999";
    toast.innerHTML = `✅ ${nombre} añadido al carrito`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}


function actualizarCarrito() {
    const contador = document.getElementById('badge-carrito'); 
    const lista = document.getElementById('lista-carrito');
    const totalCarritoModal = document.getElementById('total-carrito');
    let total = 0;
    
    if (contador) {
        contador.innerText = carrito.length;
        contador.style.display = carrito.length > 0 ? 'inline-block' : 'none';
    }

    if(!lista) return;

    if(carrito.length === 0) {
        lista.innerHTML = '<div class="text-center p-4"><p class="text-muted">No hay servicios seleccionados.</p></div>';
        if(totalCarritoModal) totalCarritoModal.innerText = "$0";
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
    
    if(totalCarritoModal) totalCarritoModal.innerText = `$${total.toLocaleString()}`;
    
    lista.innerHTML += `
        <div class="d-flex justify-content-between mt-3 p-2 bg-light rounded border">
            <span class="fw-bold">TOTAL:</span>
            <span class="fw-bold text-primary">$${total.toLocaleString()}</span>
        </div>`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function enviarPedido() {
    // 1. Capturar los elementos del formulario
    const nombreInput = document.getElementById('nombre-cliente');
    const direccionInput = document.getElementById('direccion-cliente');
    const barrioInput = document.getElementById('barrio-cliente');
    const fechaCitaInput = document.getElementById('fecha-cita');
    const alergiasInput = document.getElementById('alergias-cliente');
    const horarioInput = document.getElementById('horario-cliente');
    const obsInput = document.getElementById('observaciones-cliente');

    // 2. Validaciones obligatorias
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    if (!nombreInput.value.trim() || !direccionInput.value.trim() || !fechaCitaInput.value) {
        alert("Por favor completa: Nombre, Dirección y Fecha de la Cita.");
        return;
    }

    // 3. Procesar datos
    const nombre = nombreInput.value.trim().toUpperCase();
    const direccion = direccionInput.value.trim();
    const barrio = barrioInput.value.trim() || "No especificado";
    const fechaCita = fechaCitaInput.value; // Formato YYYY-MM-DD
    const alergias = alergiasInput.value.trim() || "Ninguna / No reporta";
    const horario = horarioInput.value;
    const observaciones = obsInput.value.trim() || "Sin observaciones adicionales";
    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    // Fecha actual para el registro
    const registro = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    // 4. Construcción del mensaje (TEXTO LIMPIO - SIN EMOJIS PARA EVITAR ROMBOS)
    let msj = "NUEVO PEDIDO | IVAN NURSE\n";
    msj += "Registro: " + registro + "\n";
    msj += "--------------------------------------\n\n";
    
    msj += "PACIENTE: " + nombre + "\n";
    msj += "DIRECCION: " + direccion + " (" + barrio + ")\n";
    msj += "FECHA CITA: " + fechaCita + "\n";
    msj += "HORARIO: " + horario + "\n";
    msj += "ALERGIAS: " + alergias + "\n\n";
    
    msj += "SERVICIOS:\n";
    carrito.forEach((item) => {
        msj += "- " + item.nombre + " ($" + item.precio.toLocaleString() + ")\n";
    });
    
    msj += "\nTOTAL A COBRAR: $" + totalPedido.toLocaleString() + "\n";
    msj += "--------------------------------------\n";
    msj += "NOTAS: " + observaciones + "\n\n";
    msj += "Por favor, confirma la disponibilidad para asignar un profesional.\n\n";
    msj += "CODIGO: IVANNURSE10 (10% OFF)\n";
    msj += "Enviado desde el catalogo digital";

    // 5. Animación de la barra de progreso
    const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modalConfirm.show();

    const barra = document.getElementById('barra-progreso');
    let progreso = 0;
    const intervaloBarra = setInterval(() => {
        progreso += 25;
        if(barra) barra.style.width = progreso + "%";
        if(progreso >= 100) clearInterval(intervaloBarra);
    }, 200);

    // 6. Redirección a WhatsApp
    setTimeout(() => {
        const urlFinal = "https://wa.me/573054494534?text=" + encodeURIComponent(msj);
        window.open(urlFinal, '_blank'); 

        // Limpiar formulario y carrito
        carrito = [];
        actualizarCarrito();
        nombreInput.value = "";
        direccionInput.value = "";
        barrioInput.value = "";
        fechaCitaInput.value = "";
        alergiasInput.value = "";
        obsInput.value = "";
        
        modalConfirm.hide();
        
        // Cerrar modal del carrito
        const mCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
        if(mCarrito) mCarrito.hide();
        
    }, 1500);
}
