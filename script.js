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
function agregarAlCarrito(nombre, precio) {
    if (nombre === 'Mensajería Médica' || nombre === 'Reclamo EPS') {
        const detalle = prompt("Describe brevemente el trámite o medicamento:");
        if (!detalle) return; 
        nombre = nombre + " - " + detalle;
    }
    carrito.push({ nombre, precio });
    actualizarCarrito();
    
    if(event && event.target) {
        const originalText = event.target.innerText;
        event.target.innerText = "¡Agregado! ✅";
        setTimeout(() => event.target.innerText = originalText, 1000);
    }
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
    const direccionInput = document.getElementById('direccion-cliente');
    const barrioInput = document.getElementById('barrio-cliente');
    const alergiasInput = document.getElementById('alergias-cliente');
    const obsInput = document.getElementById('observaciones-cliente');

    if(carrito.length === 0) { alert("El carrito está vacío."); return; }
    if(!direccionInput || !direccionInput.value.trim()) {
        alert("Por favor, ingresa tu dirección en Bogotá.");
        direccionInput.focus();
        return;
    }

    const direccion = direccionInput.value.trim();
    const barrio = (barrioInput && barrioInput.value.trim()) ? barrioInput.value.trim() : "No especificado";
    const alergias = (alergiasInput && alergiasInput.value.trim()) ? alergiasInput.value.trim() : "Ninguna / No reporta";
    const observaciones = (obsInput && obsInput.value.trim()) ? obsInput.value.trim() : "Sin observaciones adicionales";
    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    // Fecha automática para Bogotá
    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    // --- ICONOS SEGUROS (TEXTO PURO PARA EVITAR ROMBOS) ---
    const iHosp   = "HOSPITAL:"; 
    const iHola   = "SALUDO:"; 
    const iCal    = "FECHA:"; 
    const iCheck  = "[X]";       
    const iMoney  = "TOTAL:"; 
    const iPin    = "DIR:"; 
    const iCasa   = "BARRIO:"; 
    const iWarn   = "ALERGIAS:"; 
    const iNote   = "OBS:"; 
    const iTicket = "CODIGO:"; 
    const n = "\n";

    // CONSTRUCCIÓN DEL MENSAJE
    let mensaje = iHosp + " *--- NUEVO PEDIDO - IVÁN NURSE ---*" + n;
    mensaje += "¡Hola Iván Nurse! " + iHola + " Vengo de la App." + n;
    mensaje += iCal + " *Fecha:* " + fecha + n;
    mensaje += "------------------------------------------" + n;
    mensaje += "Deseo solicitar estos servicios:" + n + n;
    
    carrito.forEach((item) => {
        mensaje += iCheck + " " + item.nombre + " ($" + item.precio.toLocaleString() + ")" + n;
    });
    
    mensaje += n + "------------------------------------------" + n;
    mensaje += iMoney + " *TOTAL: $" + totalPedido.toLocaleString() + "*" + n;
    mensaje += iPin + " *DIRECCIÓN:* " + direccion + n;
    mensaje += iCasa + " *BARRIO:* " + barrio + n;
    mensaje += iWarn + " *ALERGIAS:* " + alergias + n;
    mensaje += iNote + " *OBS:* " + observaciones + n;
    mensaje += "------------------------------------------" + n;
    mensaje += iTicket + " *CÓDIGO:* IVANNURSE10 (10% OFF)" + n;
    mensaje += "_Enviado desde el catálogo digital_";

    // 1. MOSTRAR MODAL DE CARGA
    const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modalConfirm.show();

    // 2. ANIMAR BARRA
    const barra = document.getElementById('barra-progreso');
    let progreso = 0;
    const intevaloBarra = setInterval(() => {
        progreso += 20;
        barra.style.width = progreso + "%";
        if(progreso >= 100) clearInterval(intevaloBarra);
    }, 300);

    // 3. EJECUTAR ENVÍO A WHATSAPP
    setTimeout(() => {
        const urlFinal = "https://wa.me/573054494534?text=" + encodeURIComponent(mensaje);
        window.open(urlFinal, '_blank'); 

        // Limpiar carrito y campos
        carrito = [];
        actualizarCarrito();
        direccionInput.value = "";
        if(barrioInput) barrioInput.value = "";
        if(alergiasInput) alergiasInput.value = "";
        if(obsInput) obsInput.value = "";
        
        modalConfirm.hide();
        
        // Cerrar carrito
        const mCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
        if(mCarrito) mCarrito.hide();

        // Mostrar Éxito Final
        setTimeout(() => {
            const exito = new bootstrap.Modal(document.getElementById('modalExitoFinal'));
            exito.show();
        }, 800);
        
    }, 2000);
}
