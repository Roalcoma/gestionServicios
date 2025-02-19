const clientesContainer = document.getElementById('clientes-container');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const formClienteInfo = document.getElementById('client-info')
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modal-title');
const servicesContainer = document.getElementById('services-container');
const serviceInfo = document.getElementById('service-info');
const cantidad = document.getElementById('input-cantidad')
const total = document.getElementById('input-total')
const fechaInicio = document.getElementById('input-fecha-inicio')
const fechaFinal = document.getElementById('input-fecha-final')
const formInsertServicioCliente = document.getElementById('formNuevoServicio')
const formNuevoPago = document.getElementById('formNuevoPago')
const btnCrearCliente = document.getElementById('btn-crear-cliente')
const formCrearCliente = document.getElementById('form-crear-cliente')
//Inputs
const inputCorreo = document.getElementById('input-correo')
const inputTelf = document.getElementById('input-telf')
const inputDireccion = document.getElementById('input-direccion')
const inputCif = document.getElementById('input-cif')
const inputRefPago = document.getElementById('input-referencia-pago')
const inputTasa = document.getElementById('input-tasa')
const inputMontoUsd = document.getElementById('input-monto-usd')
const inputMontoVes = document.getElementById('input-monto-ves')
const inputFechaTransaccion = document.getElementById('input-fecha-transaccion')
const inputComentario = document.getElementById('input-comentario')
const inputNombreAcreedor = document.getElementById('input-nombre')
//Selects
const selectServicios = document.getElementById('select-servicios')
const selectProveedores = document.getElementById('select-proveedor')
const selectTiempos = document.getElementById('select-tiempos')
const selectTiempoPago = document.getElementById('select-tiempo-pago')
/*Modales*/
const modalNuevoServicio = document.getElementById('nuevoServicioModal');
const closeNuevoServicio = document.getElementById('closeNuevoServicio');
const modalNuevoPago = document.getElementById('nuevoPagoModal');
const closeNuevoPago = document.getElementById('closePagoModal');
const btnRegistrarPago = document.getElementById('btn-registrar-pago');
const crearClienteModal = document.getElementById('crearClienteModal');
const closeCrearCliente = document.getElementById('closeCrearClienteModal');

let clientes = [];
let currentClientId = null;

function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (de 0 a 11, sumamos 1)
    const day = String(date.getDate()).padStart(2, '0'); // Día del mes

    return `${year}-${month}-${day}`;
}

function clearInputs() {
    const inputs = formNuevoPago.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.value = ''; // Limpia el valor del input
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
    const response = await fetch('http://localhost:9003/api/allRoutes/clientes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    
    const { success, clientes: fetchedClientes } = await response.json();
    clientes = fetchedClientes;
    displayClientes(clientes);
    } catch (error) {
    console.log(error);
    }
});

function displayClientes(clientesToDisplay) {
    clientesContainer.innerHTML = '';
    clientesToDisplay.forEach(cliente => {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="button_slide slide_diagonal" onclick="showClientDetails(${cliente.id_cliente})">${cliente.nombre}</div>
    `;
    clientesContainer.appendChild(div);
    });
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredClientes = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchTerm)
    );
    displayClientes(filteredClientes);
});

async function showClientDetails(clientId) {
    try {
    const response = await fetch(`http://localhost:9003/api/allRoutes/clientes?id=${clientId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    const { success, clientes, servicios } = await response.json();

    currentClientId = clientId;
    modalTitle.textContent = `Detalles de ${clientes[0].nombre}`;
    inputCorreo.value = clientes[0].correo
    inputTelf.value = clientes[0].telefono
    inputDireccion.value = clientes[0].direccion
    inputCif.value = clientes[0].rif_cif

    formClienteInfo.addEventListener('submit', async (e) => {
        e.preventDefault()

        const response = await fetch(`http://localhost:9003/api/allRoutes/actInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: clientId,
            correo: inputCorreo.value,
            cif: inputCif.value,
            telefono: inputTelf.value,
            direccion: inputDireccion.value
        })
        });

        const res = await response.json()

        console.log(res.message)

        alert(res.message)
    })

    console.log('Prueba servicio: ', servicios)

    servicesContainer.innerHTML = '';
    servicios.forEach(servicio => {
        const fechaActual = new Date(); // Fecha actual
        const fechaVencimiento = new Date(servicio.fecha_fin); // Fecha de vencimiento
        const diferenciaMilisegundos = fechaVencimiento - fechaActual;
        const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        const button = document.createElement('button');
        button.textContent = servicio.nombre_servicio;
        button.classList.add('service-button');
        if(diasRestantes <= 15 && diasRestantes >= 0){
        button.classList.add('amarillo')
        }

        if(diasRestantes <= 0){
        button.classList.add('rojo')
        }
        
        button.onclick = async () => {
        await showServiceDetails(clientId, servicio.id_servicio)
        };
        servicesContainer.appendChild(button)
    });

    const btnNuevoServicio = document.createElement('button')
    btnNuevoServicio.innerHTML = `<i class="fas fa-plus"></i>`
    btnNuevoServicio.id = 'btn-modal-ns'
    btnNuevoServicio.classList.add('service-button')

    servicesContainer.appendChild(btnNuevoServicio)

    btnNuevoServicio.addEventListener('click', async (e) => {
        abrirNuevoServicioModal()
    })

    const responseServicios = await fetch('http://localhost:9003/api/allRoutes/servicios', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const responseTiempos = await fetch('http://localhost:9003/api/allRoutes/tiempoServicios', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const resServicios = await responseServicios.json()
    const resTiempos = await responseTiempos.json()

    const serviciosList = resServicios.servicios
    const tiempoServicioList = resTiempos.tiempoServicio
    const tiempoPagoList = resTiempos.tiempoPago

    const fechaHoy = formatDateToYYYYMMDD(new Date())

    fechaInicio.value = fechaHoy

    serviciosList.forEach(ele => {
        const option = document.createElement('option')
        option.value = ele.id_servicio
        option.textContent = ele.nombre_servicio

        selectServicios.appendChild(option)
    })

    tiempoServicioList.forEach(tiempo => {
        const option = document.createElement('option')
        option.value = tiempo.id_tiempo_serv
        option.textContent = tiempo.descripcion

        selectTiempos.appendChild(option)
    })

    tiempoPagoList.forEach(tiempo => {
        const option = document.createElement('option')
        option.value = tiempo.id_tiempo_pago
        option.textContent = tiempo.descripcion

        selectTiempoPago.appendChild(option)
    })

    selectServicios.addEventListener('change', async (eve) => {

        const responseProveedores = await fetch(`http://localhost:9003/api/allRoutes/proveedores?idServicio=${eve.target.value}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
        });

        const resProveedores = await responseProveedores.json()
        const provList = resProveedores.proveedores

        provList.forEach(prov => {
        const option = document.createElement('option')
        option.value = prov.id_serv_prov
        option.textContent = prov.nombre_proveedor

        selectProveedores.appendChild(option)
        })

        selectProveedores.addEventListener('change', async (event) => {
        const findPrecio = provList.find(ele => ele.id_servicio == event.target.value)

        cantidad.value = 1
        total.value = findPrecio.pvp
        })
    })

    formInsertServicioCliente.addEventListener('submit', async (e) => {
        e.preventDefault()

        const responseInsertServicios = await fetch('http://localhost:9003/api/allRoutes/insertServicioCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idCliente: clientId, 
            idServicio: selectServicios.value, 
            fechaInicio: fechaInicio.value, 
            tiempoServicio: selectTiempos.value, 
            intervalosPago: selectTiempoPago.value, 
            total: total.value, 
            cantidad: cantidad.value, 
            proveedor: selectProveedores.value
        })
        });

        const resInsertServicios = await responseInsertServicios.json()

        alert(resInsertServicios.message)
        modalNuevoServicio.style.display = 'none';
        selectServicios.va
        
        lue = 0
        selectProveedores.value = 0
        selectTiempos.value = 0
        selectTiempoPago.value = 0
        fechaInicio.value = ''
        total.value = ''
        cantidad.value = ''
        await showClientDetails(clientId)
    })

    serviceInfo.textContent = '';
    modal.style.display = 'flex';
    } catch (error) {
    console.log(error);
    }
}

async function showServiceDetails(idCliente, idServicio) {
    const responseDetalleServicio = await fetch(`http://localhost:9003/api/allRoutes/detalleServicios?idCliente=${idCliente}&idServicio=${idServicio}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
    });

    const resDetalleServicio = await responseDetalleServicio.json()
    const servicio = resDetalleServicio.data

    const tasaActual = servicio[0].tasa

    if(servicio.length === 0){
    serviceInfo.innerHTML = ''
    await showClientDetails(idCliente)
    return
    }

    serviceInfo.innerHTML = `
    <button id="close-div-service" onclick="serviceInfo.innerHTML = ''">&times;</button>
    <div class="table-wrapper">
        <table id="miTabla" class="fl-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Servicio</th>
                <th>Total$</th>
                <th>Fecha Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody><tbody>
        </table>
    </div>
    `;

    console.log('array: ', servicio)

    const tabla = document.getElementById('miTabla').getElementsByTagName('tbody')[0]

    servicio.forEach(serv => {
        const fechaActual = new Date(); // Fecha actual
        const fechaVencimiento = new Date(serv.fecha_pago); // Fecha de vencimiento
        const diferenciaMilisegundos = fechaVencimiento - fechaActual;
        const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        const fila = tabla.insertRow()

        const celdaId = fila.insertCell()
        celdaId.textContent = serv.id_tesoreria

        const celdaServicio = fila.insertCell()
        celdaServicio.textContent = serv.nombre_servicio

        const celdaMonto = fila.insertCell()
        celdaMonto.textContent = serv.monto_pago

        const celdaFechaPago = fila.insertCell()
        celdaFechaPago.textContent = serv.fecha_pago

        const celdaStatus = fila.insertCell()
        celdaStatus.textContent = serv.status_lin

        if(diasRestantes <= 30 && diasRestantes > 5 && serv.status_lin == 'PENDIENTE'){
            celdaFechaPago.className = 'amarillo'
            celdaStatus.className = 'amarillo'
        }

        if(diasRestantes <= 5 && serv.status_lin == 'PENDIENTE'){
            celdaFechaPago.className = 'rojo'
            celdaStatus.className = 'rojo'
        }

        if(serv.status_lin == 'PAGADO'){
            celdaFechaPago.className = 'verde'
            celdaStatus.className = 'verde'
        }

        const celdaAcciones = fila.insertCell()
        const botonEliminar = document.createElement('button');
        botonEliminar.className = 'delete-button';
        botonEliminar.innerHTML = `Pagar`;
        botonEliminar.onclick = async () => {
            inputTasa.value = tasaActual
            abrirNuevoPagoModal()
            await RegistrarPago(serv.id_tesoreria, serv.id_linea);
        }
        celdaAcciones.appendChild(botonEliminar);

        if(serv.status_lin == 'PAGADO'){
            botonEliminar.disabled = true
        }
    })

    

    async function RegistrarPago(id, linea) {
        inputMontoUsd.addEventListener('input', (e) => {
            inputMontoVes.value = (e.target.value * inputTasa.value).toFixed(2)
        })

        inputMontoVes.addEventListener('input', (e) => {
            inputMontoUsd.value = (e.target.value / inputTasa.value).toFixed(2)
        })

        formNuevoPago.addEventListener('submit', async (e) => {
            e.preventDefault()

            const responseRegistrarPago = await fetch(`http://localhost:9003/api/allRoutes/eliminarClienteServicio?idClienteServicio=${id}&linea=${linea}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_tesoreria: id, 
                    id_servicio: idServicio, 
                    id_cliente: idCliente, 
                    id_linea: linea, 
                    fecha_transaccion: inputFechaTransaccion.value,
                    fecha_registro: new Date(), 
                    nombre_acreedor: inputNombreAcreedor.value, 
                    monto_usd: inputMontoUsd.value, 
                    monto_ves: inputMontoVes.value, 
                    tasa_ves: inputTasa.value, 
                    ref_pago: inputRefPago.value, 
                    comentario: inputComentario.value
                })
            });
    
            const resRegistrarPago = await responseRegistrarPago.json()
    
            alert(resRegistrarPago.message)
            modalNuevoPago.style.display = 'none';
            clearInputs()
            await showServiceDetails(idCliente, idServicio)
            
        })
    }
}

btnCrearCliente.addEventListener('click', async (e) => {
    crearClienteModal.style.display = 'flex';
})

formCrearCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener los valores de los inputs manualmente
    const nombreCliente = document.getElementById('input-nombre-cliente').value.trim();
    const cif = document.getElementById('input-cif-cliente').value.trim();
    const email = document.getElementById('input-email-cliente').value.trim();
    const telefono = document.getElementById('input-telefono-cliente').value.trim();
    const direccion = document.getElementById('input-direccion-cliente').value.trim();
    const esEmpresa = document.getElementById('input-es-empresa').checked; // Checkbox
    const nombreContacto = document.getElementById('input-comentario').value.trim();

    // Crear un objeto con los datos del formulario
    const cliente = {
        nombre: nombreCliente,
        cif: cif,
        email: email,
        telefono: telefono,
        direccion: direccion,
        esEmpresa: esEmpresa,
        nombreContacto: nombreContacto
    };

    console.log(cliente);

    const responseCrearCliente = await fetch('http://localhost:9003/api/allRoutes/crearcliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });

    const resCrearCliente = await responseCrearCliente.json();

    if(resCrearCliente.success === false) {
        alert('Hubo algun error al crear el cliente');
        return
    }

    alert(resCrearCliente.message);

    // Cerrar el modal
    crearClienteModal.style.display = 'none';
    formCrearCliente.reset();
    // Recargar la página
    location.reload();
})

/*Modales*/

closeModal.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
    modal.style.display = 'none';
    }
};

// Abrir modal para nuevo servicio
function abrirNuevoServicioModal() {
    modalNuevoServicio.style.display = 'flex';
}

// Abrir modal para nuevo pago
function abrirNuevoPagoModal() {
    modalNuevoPago.style.display = 'flex';
}

// Cerrar modal de nuevo servicio
closeNuevoServicio.onclick = () => {
    modalNuevoServicio.style.display = 'none';
};

closeNuevoPago.onclick = () => {
    modalNuevoPago.style.display = 'none';
};

closeCrearCliente.onclick = () => {
    crearClienteModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modalNuevoServicio) {
    modalNuevoServicio.style.display = 'none';
    }
};