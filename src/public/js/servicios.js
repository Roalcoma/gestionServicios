const serviciosContainer = document.getElementById('servicios-container');

function displayServicios(serviciosToDisplay) {
  serviciosContainer.innerHTML = '';
  serviciosToDisplay.forEach(servicio => {
    const div = document.createElement('div');
    console.log(servicio);
    div.innerHTML = `
        <div class="button_slide slide_diagonal" onclick="showServiceDetails(${servicio.id_servicio})">${servicio.nombre_servicio}</div>
    `;
    serviciosContainer.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
  const response = await fetch('http://localhost:9003/api/allRoutes/servicios', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
  });
  
  const { success, servicios } = await response.json();
  if (success === false) {
    throw new Error('Error al obtener los servicios');
    alert('Error al obtener los servicios. Por favor recargar la página');
  }
  displayServicios(servicios);
  } catch (error) {
    console.log(error);
  }
});

