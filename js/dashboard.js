document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("nombreUsuario").textContent = usuario.nombre;

  if (usuario.cargo === "gerente") {
    document.getElementById("panelControlItem").style.display = "block";
    document.getElementById("panelControl").classList.remove("hidden");

    // Power BI Embedded (solo si tienes credenciales)
    const embedConfig = {
      type: 'report',
      id: 'TU_REPORT_ID',
      embedUrl: 'TU_EMBED_URL',
      accessToken: 'TU_EMBED_TOKEN',
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: true
      }
    };
    powerbi.embed(document.getElementById('reportContainer'), embedConfig);
  }
});



function ocultarTodosLosModulos() {
  const modulos = document.querySelectorAll("section[id^='modulo'], #bienvenida");
  modulos.forEach(modulo => {
    modulo.classList.add("opacity-0");
    setTimeout(() => {
      modulo.classList.add("hidden");
    }, 200); // espera a que termine la transición
  });
}

function ocultarSubseccionesActivas() {
  const secciones = document.querySelectorAll(
    "#formularioProveedor, #busquedaProveedores, #formularioModificar, " +
    "#formularioProducto, #busquedaProductos, #formularioModificarProducto"
  );
  secciones.forEach(s => s.classList.add("hidden"));

  const mensajes = document.querySelectorAll(
    "#mensajeExito, #mensajeError, #mensajeProductoExito"
  );
  mensajes.forEach(m => m.classList.add("hidden"));

  const botones = document.querySelectorAll(
    "#botonesProveedor, #botonesProductos"
  );
  botones.forEach(b => b.classList.remove("hidden"));
}





// Menú desplegable de usuario
const userMenuButton = document.getElementById("userMenuButton");
const userMenu = document.getElementById("userMenu");

userMenuButton.addEventListener("click", () => {
  userMenu.classList.toggle("hidden");
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
});






// Activar módulo Proveedores
const menuProveedores = document.querySelector('#menuLider li:nth-child(3) a');
const bienvenida = document.getElementById('bienvenida');
const moduloProveedores = document.getElementById('moduloProveedores');

menuProveedores.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloProveedores.classList.remove("hidden");
    moduloProveedores.classList.remove("opacity-0");
  }, 200);
});

// Elementos del formulario
const btnAgregar = document.getElementById('btnAgregar');
const btnBuscar = document.getElementById('btnBuscar');
const botonesProveedor = document.getElementById('botonesProveedor');
const formularioProveedor = document.getElementById('formularioProveedor');
const mensajeExito = document.getElementById('mensajeExito');
const btnVolver = document.getElementById('btnVolver');
const btnLimpiar = document.getElementById('btnLimpiar');

// Mostrar formulario y ocultar botones
btnAgregar.addEventListener('click', () => {
  botonesProveedor.classList.add('hidden');
  formularioProveedor.classList.remove('hidden');
  mensajeExito.classList.add('hidden');
});

// Volver a botones principales
btnVolver.addEventListener('click', () => {
  formularioProveedor.classList.add('hidden');
  botonesProveedor.classList.remove('hidden');
  mensajeExito.classList.add('hidden');
});

// Limpiar campos del formulario
btnLimpiar.addEventListener('click', () => {
  document.getElementById('proveedorForm').reset();
  mensajeExito.classList.add('hidden');
});

// Guardar proveedor
document.getElementById('proveedorForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const rut = document.getElementById('rut').value.trim();
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

  const existe = proveedores.some(p => p.rut === rut);
  const mensajeExito = document.getElementById('mensajeExito');
  const mensajeError = document.getElementById('mensajeError');

  if (existe) {
    mensajeExito.classList.add('hidden');
    mensajeError.classList.remove('hidden');
    return;
  }

  const proveedor = {
    id: crypto.randomUUID(),
    rut,
    nombre: document.getElementById('nombre').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
    ciudad: document.getElementById('ciudad').value.trim(),
    region: document.getElementById('region').value.trim(),
    contactoNombre: document.getElementById('contactoNombre').value.trim(),
    contactoTelefono: document.getElementById('contactoTelefono').value.trim(),
    contactoEmail: document.getElementById('contactoEmail').value.trim(),
    tipoProductos: document.getElementById('tipoProductos').value.trim(),
    estado: "Activo",
    fechaRegistro: new Date().toLocaleDateString('es-CL')
  };

  proveedores.push(proveedor);
  localStorage.setItem("proveedores", JSON.stringify(proveedores));

  mensajeError.classList.add('hidden');
  mensajeExito.classList.remove('hidden');
});


const busquedaProveedores = document.getElementById('busquedaProveedores');
const tablaProveedores = document.getElementById('tablaProveedores');
const btnRegresarBusqueda = document.getElementById('btnRegresarBusqueda');

// Mostrar búsqueda
btnBuscar.addEventListener('click', () => {
  botonesProveedor.classList.add('hidden');
  formularioProveedor.classList.add('hidden');
  busquedaProveedores.classList.remove('hidden');
  renderizarProveedores();
});

// Regresar
btnRegresarBusqueda.addEventListener('click', () => {
  busquedaProveedores.classList.add('hidden');
  botonesProveedor.classList.remove('hidden');
});

// Filtros y buscador
['filtroRegion', 'filtroMes', 'filtroTipo', 'filtroEstado', 'filtroOrden', 'buscadorRut'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderizarProveedores);
});

// Renderizar tabla
function renderizarProveedores() {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

  const region = document.getElementById('filtroRegion').value;
  const mes = document.getElementById('filtroMes').value;
  const tipo = document.getElementById('filtroTipo').value;
  const estado = document.getElementById('filtroEstado').value;
  const orden = document.getElementById('filtroOrden').value;
  const rutBuscado = document.getElementById('buscadorRut').value.trim();

  let filtrados = proveedores.filter(p => {
    const fecha = p.fechaRegistro.split('-');
    const mesRegistro = fecha[1];

    return (!region || p.region === region) &&
           (!mes || mesRegistro === mes) &&
           (!tipo || p.tipoProductos === tipo) &&
           (!estado || p.estado === estado) &&
           (!rutBuscado || p.rut.includes(rutBuscado));
  });

  if (orden === 'desc') filtrados.reverse();

  tablaProveedores.innerHTML = filtrados.map(p => `
    <tr class="border-t">
      <td class="px-4 py-2">${p.rut}</td>
      <td class="px-4 py-2">${p.nombre}</td>
      <td class="px-4 py-2">${p.direccion}</td>
      <td class="px-4 py-2">${p.ciudad}</td>
      <td class="px-4 py-2">${p.region}</td>
      <td class="px-4 py-2">${p.contactoNombre}</td>
      <td class="px-4 py-2">${p.contactoTelefono}</td>
      <td class="px-4 py-2">${p.contactoEmail}</td>
      <td class="px-4 py-2">${p.tipoProductos}</td>
      <td class="px-4 py-2">${p.estado}</td>
      <td class="px-4 py-2">${p.fechaRegistro}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}


const formularioModificar = document.getElementById('formularioModificar');
const modificarForm = document.getElementById('modificarForm');
let rutModificar = null;

// Activar formulario con datos
tablaProveedores.addEventListener('click', (e) => {
  if (e.target.textContent === "Modificar") {
    const fila = e.target.closest("tr");
    const rut = fila.children[0].textContent;
    const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
    const proveedor = proveedores.find(p => p.rut === rut);
    if (!proveedor) return;

    rutModificar = rut;
    document.getElementById('modRut').value = proveedor.rut;
    document.getElementById('modNombre').value = proveedor.nombre;
    document.getElementById('modDireccion').value = proveedor.direccion;
    document.getElementById('modCiudad').value = proveedor.ciudad;
    document.getElementById('modRegion').value = proveedor.region;
    document.getElementById('modContactoNombre').value = proveedor.contactoNombre;
    document.getElementById('modContactoTelefono').value = proveedor.contactoTelefono;
    document.getElementById('modContactoEmail').value = proveedor.contactoEmail;
    document.getElementById('modTipoProductos').value = proveedor.tipoProductos;
    document.getElementById('modEstado').value = proveedor.estado;

    busquedaProveedores.classList.add('hidden');
    formularioModificar.classList.remove('hidden');
  }

  if (e.target.textContent === "Eliminar") {
  const fila = e.target.closest("tr");
  const rut = fila.children[0].textContent;

  const confirmar = confirm(`¿Estás seguro de que deseas eliminar al proveedor?`);
  if (!confirmar) return;

  let proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  proveedores = proveedores.filter(p => p.rut !== rut);
  localStorage.setItem("proveedores", JSON.stringify(proveedores));
  renderizarProveedores();
}
});

// Cancelar modificación
document.getElementById('btnCancelarMod').addEventListener('click', () => {
  formularioModificar.classList.add('hidden');
  busquedaProveedores.classList.remove('hidden');
});

// Guardar cambios
modificarForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  const nuevoRut = document.getElementById('modRut').value.trim();

  // Verificar si el nuevo RUT ya existe en otro proveedor
  const duplicado = proveedores.some(p => p.rut === nuevoRut && p.rut !== rutModificar);
  if (duplicado) {
    alert("❌ No se puede guardar: el RUT ya está registrado en otro proveedor.");
    return;
  }

  const index = proveedores.findIndex(p => p.rut === rutModificar);
  if (index === -1) return;

  proveedores[index] = {
    ...proveedores[index],
    rut: nuevoRut,
    nombre: document.getElementById('modNombre').value.trim(),
    direccion: document.getElementById('modDireccion').value.trim(),
    ciudad: document.getElementById('modCiudad').value.trim(),
    region: document.getElementById('modRegion').value.trim(),
    contactoNombre: document.getElementById('modContactoNombre').value.trim(),
    contactoTelefono: document.getElementById('modContactoTelefono').value.trim(),
    contactoEmail: document.getElementById('modContactoEmail').value.trim(),
    tipoProductos: document.getElementById('modTipoProductos').value.trim(),
    estado: document.getElementById('modEstado').value.trim()
  };

  localStorage.setItem("proveedores", JSON.stringify(proveedores));
  formularioModificar.classList.add('hidden');
  busquedaProveedores.classList.remove('hidden');
  renderizarProveedores();
});










// Activar módulo Productos
const menuProductos = document.querySelector('#menuLider li:nth-child(5) a'); // Ajusta si cambia el orden
const moduloProductos = document.getElementById('moduloProductos');
const botonesProductos = document.getElementById('botonesProductos');
const formularioProducto = document.getElementById('formularioProducto');
const mensajeProductoExito = document.getElementById('mensajeProductoExito');

menuProductos.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloProductos.classList.remove("hidden");
    moduloProductos.classList.remove("opacity-0");
  }, 200);
});

// Mostrar formulario
document.getElementById('btnAgregarProducto').addEventListener('click', () => {
  botonesProductos.classList.add('hidden');
  formularioProducto.classList.remove('hidden');
  mensajeProductoExito.classList.add('hidden');
  cargarProveedoresEnSelect();
});

// Volver
document.getElementById('btnVolverProducto').addEventListener('click', () => {
  formularioProducto.classList.add('hidden');
  botonesProductos.classList.remove('hidden');
  mensajeProductoExito.classList.add('hidden');
});

// Limpiar
document.getElementById('btnLimpiarProducto').addEventListener('click', () => {
  document.getElementById('productoForm').reset();
  mensajeProductoExito.classList.add('hidden');
});

// Guardar producto
document.getElementById('productoForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const producto = {
    id: crypto.randomUUID(),
    sku: document.getElementById('sku').value.trim(),
    nombre: document.getElementById('nombreProducto').value.trim(),
    marca: document.getElementById('marca').value.trim(),
    categoria: document.getElementById('categoria').value.trim(),
    proveedor: document.getElementById('proveedorProducto').value.trim(),
    unidadMedida: document.getElementById('unidadMedida').value.trim(),
    costo: parseFloat(document.getElementById('costo').value),
    estado: "Activo"
  };

  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));

  // Crear inventario vinculado si no existe
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const yaExiste = inventario.some(i => i.idInventario === producto.id);
  if (!yaExiste) {
    inventario.push({
      idInventario: producto.id, // mismo que idProducto
      sku: producto.sku,
      categoria: producto.categoria,
      stock: 0,
      ubicacion: "Sin asignar",
      precioVenta: 0,
      estado: "Activo"
    });
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }
  mensajeProductoExito.classList.remove('hidden');
});

// Cargar proveedores en el select
function cargarProveedoresEnSelect() {
  const select = document.getElementById('proveedorProducto');
  select.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  proveedores.forEach(p => {
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = `${p.nombre} (${p.rut})`;
    select.appendChild(option);
  });
}

const btnBuscarProducto = document.getElementById('btnBuscarProducto');
const busquedaProductos = document.getElementById('busquedaProductos');
const tablaProductos = document.getElementById('tablaProductos');
const btnRegresarProductos = document.getElementById('btnRegresarProductos');

// Mostrar búsqueda
btnBuscarProducto.addEventListener('click', () => {
  botonesProductos.classList.add('hidden');
  formularioProducto.classList.add('hidden');
  busquedaProductos.classList.remove('hidden');
  cargarProveedoresEnFiltro();
  renderizarProductos();
});

// Regresar
btnRegresarProductos.addEventListener('click', () => {
  busquedaProductos.classList.add('hidden');
  botonesProductos.classList.remove('hidden');
});

// Filtros dinámicos
['filtroMarca', 'filtroCategoria', 'filtroProveedor', 'filtroOrdenProducto', 'buscadorSKU'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderizarProductos);
});

// Cargar proveedores en filtro
function cargarProveedoresEnFiltro() {
  const select = document.getElementById('filtroProveedor');
  select.innerHTML = '<option value="">Todos los proveedores</option>';
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  proveedores.forEach(p => {
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = `${p.nombre} (${p.rut})`;
    select.appendChild(option);
  });
}

// Renderizar tabla
function renderizarProductos() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  const marca = document.getElementById('filtroMarca').value.trim().toLowerCase();
  const categoria = document.getElementById('filtroCategoria').value;
  const proveedor = document.getElementById('filtroProveedor').value;
  const orden = document.getElementById('filtroOrdenProducto').value;
  const skuBuscado = document.getElementById('buscadorSKU').value.trim().toLowerCase();

  let filtrados = productos.filter(p =>
    (!marca || p.marca.toLowerCase().includes(marca)) &&
    (!categoria || p.categoria === categoria) &&
    (!proveedor || p.proveedor === proveedor) &&
    (!skuBuscado || p.sku.toLowerCase().includes(skuBuscado))
  );

  if (orden === 'desc') filtrados.reverse();

  tablaProductos.innerHTML = filtrados.map(p => `
    <tr data-id="${p.id}" class="border-t">
      <td class="px-4 py-2">${p.sku}</td>
      <td class="px-4 py-2">${p.nombre}</td>
      <td class="px-4 py-2">${p.marca}</td>
      <td class="px-4 py-2">${p.categoria}</td>
      <td class="px-4 py-2">${p.proveedor}</td>
      <td class="px-4 py-2">${p.unidadMedida}</td>
      <td class="px-4 py-2">$${p.costo.toFixed(0)}</td>
      <td class="px-4 py-2">${p.estado}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarBtn bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

localStorage.removeItem("inventario");


const formularioModificarProducto = document.getElementById('formularioModificarProducto');
const modificarProductoForm = document.getElementById('modificarProductoForm');
let skuModificar = null;

// Activar formulario con datos del producto
tablaProductos.addEventListener('click', (e) => {
  const fila = e.target.closest("tr");
  const sku = fila.children[0].textContent;
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const producto = productos.find(p => p.sku === sku);
  if (!producto) return;

  if (e.target.textContent === "Modificar") {
    skuModificar = sku;
    document.getElementById('modSku').value = producto.sku;
    document.getElementById('modNombreProducto').value = producto.nombre;
    document.getElementById('modMarca').value = producto.marca;
    document.getElementById('modCategoria').value = producto.categoria;
    document.getElementById('modUnidadMedida').value = producto.unidadMedida;
    document.getElementById('modCosto').value = producto.costo;
    document.getElementById('modEstadoProducto').value = producto.estado;

    // Cargar proveedores en el select
    const select = document.getElementById('modProveedor');
    select.innerHTML = '<option value="" disabled>Seleccione proveedor</option>';
    const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
    proveedores.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = `${p.nombre} (${p.rut})`;
      select.appendChild(option);
    });
    select.value = producto.proveedor;

    busquedaProductos.classList.add('hidden');
    formularioModificarProducto.classList.remove('hidden');
  }

  if (e.target.textContent === "Eliminar") {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el producto?`);
    if (!confirmar) return;

    const nuevos = productos.filter(p => p.sku !== sku);
    localStorage.setItem("productos", JSON.stringify(nuevos));
    
    const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    const actualizado = inventario.filter(i => i.idInventario !== producto.id);
    localStorage.setItem("inventario", JSON.stringify(actualizado));
    renderizarProductos();
  }
});

// Cancelar modificación
document.getElementById('btnCancelarModProducto').addEventListener('click', () => {
  formularioModificarProducto.classList.add('hidden');
  busquedaProductos.classList.remove('hidden');
});

// Guardar cambios
modificarProductoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const nuevoSku = document.getElementById('modSku').value.trim();

  const duplicado = productos.some(p => p.sku === nuevoSku && p.sku !== skuModificar);
  if (duplicado) {
    alert("❌ No se puede guardar: el SKU ya está registrado en otro producto.");
    return;
  }

  const index = productos.findIndex(p => p.sku === skuModificar);
  if (index === -1) return;

  productos[index] = {
    ...productos[index],
    sku: nuevoSku,
    nombre: document.getElementById('modNombreProducto').value.trim(),
    marca: document.getElementById('modMarca').value.trim(),
    categoria: document.getElementById('modCategoria').value.trim(),
    proveedor: document.getElementById('modProveedor').value.trim(),
    unidadMedida: document.getElementById('modUnidadMedida').value.trim(),
    costo: parseFloat(document.getElementById('modCosto').value),
    estado: document.getElementById('modEstadoProducto').value.trim()
  };

  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const idProducto = productos[index].id;
  const indexInv = inventario.findIndex(i => i.idInventario === idProducto);
  if (indexInv !== -1) {
    inventario[indexInv].sku = nuevoSku;
    inventario[indexInv].categoria = document.getElementById('modCategoria').value.trim();
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }


  formularioModificarProducto.classList.add('hidden');
  busquedaProductos.classList.remove('hidden');
  renderizarProductos();
});

function sincronizarInventarioConProductos() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  let cambios = 0;

  productos.forEach(p => {
    const yaExiste = inventario.some(i => i.idInventario === p.id);
    if (!yaExiste) {
      inventario.push({
        idInventario: p.id,
        sku: p.sku,
        categoria: p.categoria,
        stock: 0,
        ubicacion: "Sin asignar",
        precioVenta: 0,
        estado: "Activo"
      });
      cambios++;
    }
  });

  if (cambios > 0) {
    localStorage.setItem("inventario", JSON.stringify(inventario));
    console.log(`✅ Inventario sincronizado: se añadieron ${cambios} registros.`);
  }
}












const moduloClientes = document.getElementById('moduloClientes');
const tablaClientes = document.getElementById('tablaClientes');
const btnImportarClientes = document.getElementById('btnImportarClientes');
const inputImportarClientes = document.getElementById('inputImportarClientes');

// Mostrar módulo Clientes
const menuClientes = document.querySelector('#menuLider li:nth-child(4) a');
menuClientes.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloClientes.classList.remove("hidden", "opacity-0");
    renderizarClientes();
  }, 200);
});

// Importar archivo Excel
btnImportarClientes.addEventListener('click', () => {
  inputImportarClientes.click();
});

inputImportarClientes.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const clientesImportados = XLSX.utils.sheet_to_json(sheet);

  const clientesExistentes = JSON.parse(localStorage.getItem("clientes")) || [];

  clientesImportados.forEach(importado => {
    const index = clientesExistentes.findIndex(c => c.idCliente === importado.idCliente);
    const cliente = {
      idCliente: importado.idCliente,
      rut: importado.rut,
      nombre: importado.nombre,
      tipoCliente: importado.tipoCliente,
      correo: importado.correo,
      telefono: importado.telefono,
      region: importado.region,
      miembroClub: importado.miembroClub,
      nivelLealtad: importado.nivelLealtad
    };

    if (index !== -1) {
      clientesExistentes[index] = cliente;
    } else {
      clientesExistentes.push(cliente);
    }
  });

  localStorage.setItem("clientes", JSON.stringify(clientesExistentes));
  alert("✅ Clientes importados correctamente");
  e.target.value = "";
  renderizarClientes();
});

// Filtros dinámicos
['filtroTipoCliente', 'filtroRegionCliente', 'filtroClub', 'filtroLealtad', 'filtroOrdenCliente', 'buscadorRutCliente'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderizarClientes);
});

// Renderizar tabla
function renderizarClientes() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  const tipo = document.getElementById('filtroTipoCliente').value;
  const region = document.getElementById('filtroRegionCliente').value;
  const club = document.getElementById('filtroClub').value;
  const lealtad = document.getElementById('filtroLealtad').value;
  const orden = document.getElementById('filtroOrdenCliente').value;
  const rutBuscado = document.getElementById('buscadorRutCliente').value.trim().toLowerCase();

  let filtrados = clientes.filter(c =>
    (!tipo || c.tipoCliente === tipo) &&
    (!region || c.region === region) &&
    (!club || c.miembroClub === club) &&
    (!lealtad || c.nivelLealtad === lealtad) &&
    (!rutBuscado || c.rut.toLowerCase().includes(rutBuscado))
  );

  if (orden === 'desc') filtrados.reverse();

  tablaClientes.innerHTML = filtrados.map(c => `
    <tr class="border-t">
      <td class="px-4 py-2">${c.rut}</td>
      <td class="px-4 py-2">${c.nombre}</td>
      <td class="px-4 py-2">${c.tipoCliente}</td>
      <td class="px-4 py-2">${c.correo}</td>
      <td class="px-4 py-2">${c.telefono}</td>
      <td class="px-4 py-2">${c.region}</td>
      <td class="px-4 py-2">${c.miembroClub}</td>
      <td class="px-4 py-2">${c.nivelLealtad}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

tablaClientes.addEventListener('click', (e) => {
  if (e.target.textContent === "Eliminar") {
    const fila = e.target.closest("tr");
    const rut = fila.children[0].textContent;

    const confirmar = confirm(`¿Estás seguro de que deseas eliminar al cliente con RUT ${rut}?`);
    if (!confirmar) return;

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes = clientes.filter(c => c.rut !== rut);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    renderizarClientes();
  }
});









const moduloInventario = document.getElementById('moduloInventario');
const tablaInventario = document.getElementById('tablaInventario');
const formularioModificarInventario = document.getElementById('formularioModificarInventario');
const modificarInventarioForm = document.getElementById('modificarInventarioForm');
let idInventarioModificar = null;

// Activar módulo Inventario
const menuInventario = document.querySelector('#menuLider li:nth-child(1) a');
menuInventario.addEventListener('click', (e) => {
  e.preventDefault();
  sincronizarInventarioConProductos();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloInventario.classList.remove("hidden", "opacity-0");
    renderizarInventario();
  }, 200);
});

// Filtros
['filtroCategoriaInv', 'filtroEstadoInv', 'buscadorSkuInv', 'ordenStockInv'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderizarInventario);
});

// Renderizar tabla
function renderizarInventario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  const categoria = document.getElementById('filtroCategoriaInv').value;
  const estado = document.getElementById('filtroEstadoInv').value;
  const skuBuscado = document.getElementById('buscadorSkuInv').value.trim().toLowerCase();
  const orden = document.getElementById('ordenStockInv').value;

  let filtrados = inventario.filter(i =>
    (!categoria || i.categoria === categoria) &&
    (!estado || i.estado === estado) &&
    (!skuBuscado || i.sku.toLowerCase().includes(skuBuscado))
  );

  if (orden === 'asc') filtrados.sort((a, b) => a.stock - b.stock);
  else filtrados.sort((a, b) => b.stock - a.stock);

  tablaInventario.innerHTML = filtrados.map(i => {
    const alerta = i.stock < 50 && i.estado === "Activo" ? "bg-red-100" : "";
    return `
      <tr class="border-t ${alerta}">
        <td class="px-4 py-2">${i.sku}</td>
        <td class="px-4 py-2">${i.categoria}</td>
        <td class="px-4 py-2">${i.stock}</td>
        <td class="px-4 py-2">${i.ubicacion}</td>
        <td class="px-4 py-2">$${i.precioVenta.toFixed(0)}</td>
        <td class="px-4 py-2">${i.estado}</td>
        <td class="px-4 py-2">
          <button class="bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Activar modificación
tablaInventario.addEventListener('click', (e) => {
  if (e.target.textContent === "Modificar") {
    const fila = e.target.closest("tr");
    const sku = fila.children[0].textContent;
    const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    const registro = inventario.find(i => i.sku === sku);
    if (!registro) return;

    idInventarioModificar = registro.idInventario;
    document.getElementById('modSkuInv').value = registro.sku;
    document.getElementById('modCategoriaInv').value = registro.categoria;
    document.getElementById('modStockInv').value = registro.stock;
    document.getElementById('modUbicacionInv').value = registro.ubicacion;
    document.getElementById('modPrecioVentaInv').value = registro.precioVenta;
    document.getElementById('modEstadoInv').value = registro.estado;

    formularioModificarInventario.classList.remove('hidden');
  }
});

// Cancelar modificación
document.getElementById('btnCancelarModInv').addEventListener('click', () => {
  formularioModificarInventario.classList.add('hidden');
});

// Guardar cambios
modificarInventarioForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const index = inventario.findIndex(i => i.idInventario === idInventarioModificar);
  if (index === -1) return;

  inventario[index] = {
    ...inventario[index],
    stock: parseInt(document.getElementById('modStockInv').value),
    ubicacion: document.getElementById('modUbicacionInv').value.trim(),
    precioVenta: parseFloat(document.getElementById('modPrecioVentaInv').value),
    estado: document.getElementById('modEstadoInv').value.trim()
  };

  localStorage.setItem("inventario", JSON.stringify(inventario));
  formularioModificarInventario.classList.add('hidden');
  renderizarInventario();
});










const moduloOfertas = document.getElementById("moduloOfertas");
const formularioOferta = document.getElementById("formularioOferta");

// Activar módulo desde menú
document.getElementById("menuOfertas").addEventListener("click", (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloOfertas.classList.remove("hidden", "opacity-0");
  }, 200);
});

// Botón "Añadir nueva oferta"
document.getElementById("btnNuevaOferta").addEventListener("click", () => {
  formularioOferta.classList.remove("hidden");
  document.getElementById("btnNuevaOferta").classList.add("hidden");
  document.getElementById("btnBuscarOferta").classList.add("hidden");

  cargarSkusEnOfertas();
  document.getElementById("btnGuardarOferta").disabled = true;
});

// Botón "Regresar"
document.getElementById("btnRegresarOferta").addEventListener("click", () => {
  formularioOferta.classList.add("hidden");
  document.getElementById("btnNuevaOferta").classList.remove("hidden");
  document.getElementById("btnBuscarOferta").classList.remove("hidden");
});

// Botón "Limpiar"
document.getElementById("btnLimpiarOferta").addEventListener("click", () => {
  formularioOferta.reset();
  document.getElementById("btnGuardarOferta").disabled = true;
});

// Cargar SKUs desde productos
function cargarSkusEnOfertas() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const selectSku = document.getElementById("ofertaSku");
  selectSku.innerHTML = '<option value="">Seleccione SKU</option>';
  productos.forEach(p => {
    const option = document.createElement("option");
    option.value = p.sku;
    option.textContent = `${p.sku} - ${p.nombre}`;
    selectSku.appendChild(option);
  });
}

// Validar stock al seleccionar SKU
document.getElementById("ofertaSku").addEventListener("change", () => {
  const sku = document.getElementById("ofertaSku").value;
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const producto = productos.find(p => p.sku === sku);
  const registro = inventario.find(i => i.sku === sku);

  // Autocompletar categoría
  if (producto) {
    document.getElementById("ofertaCategoria").value = producto.categoria;
  }

  // Validar stock
  if (!registro) {
    alert("❌ No se encontró inventario para este SKU.");
    document.getElementById("btnGuardarOferta").disabled = true;
    return;
  }

  if (registro.stock < 50) {
    alert("⚠️ No es posible crear una oferta: el producto tiene menos de 50 unidades en stock.");
    document.getElementById("btnGuardarOferta").disabled = true;
  } else {
    document.getElementById("btnGuardarOferta").disabled = false;
  }
});


// Guardar oferta
document.getElementById("formularioOferta").addEventListener("submit", (e) => {
  e.preventDefault();

  const sku = document.getElementById("ofertaSku").value;
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const registro = inventario.find(i => i.sku === sku);
  if (!registro || registro.stock < 50) {
    alert("❌ No se puede guardar la oferta: stock insuficiente.");
    return;
  }

  const nuevaOferta = {
    idOferta: crypto.randomUUID(),
    sku: sku,
    categoria: document.getElementById("ofertaCategoria").value,
    tipoPersona: document.getElementById("ofertaTipoPersona").value,
    clubLider: document.getElementById("ofertaClubLider").value,
    nuevoPrecio: parseFloat(document.getElementById("ofertaPrecio").value),
    fechaInicio: document.getElementById("ofertaInicio").value,
    fechaTermino: document.getElementById("ofertaTermino").value,
    estado: "Activo"
  };

  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  ofertas.push(nuevaOferta);
  localStorage.setItem("ofertas", JSON.stringify(ofertas));

  alert("✅ Oferta registrada correctamente.");
  formularioOferta.reset();
  document.getElementById("btnGuardarOferta").disabled = true;
});


const busquedaOfertas = document.getElementById("busquedaOfertas");
const tablaOfertas = document.getElementById("tablaOfertas");

// Mostrar búsqueda
document.getElementById("btnBuscarOferta").addEventListener("click", () => {
  formularioOferta.classList.add("hidden");
  busquedaOfertas.classList.remove("hidden");
  renderizarOfertas();
});

// Regresar
document.getElementById("btnRegresarBusquedaOferta").addEventListener("click", () => {
  busquedaOfertas.classList.add("hidden");
  botonesOfertas.classList.remove("hidden");
});

// Filtros dinámicos
["filtroSkuOferta", "filtroCategoriaOferta", "filtroTipoPersona", "filtroClubLider", "filtroOrdenOferta"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderizarOfertas);
});

// Renderizar tabla
function renderizarOfertas() {
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];

  const sku = document.getElementById("filtroSkuOferta").value.trim().toLowerCase();
  const categoria = document.getElementById("filtroCategoriaOferta").value;
  const tipo = document.getElementById("filtroTipoPersona").value;
  const club = document.getElementById("filtroClubLider").value;
  const orden = document.getElementById("filtroOrdenOferta").value;

  let filtradas = ofertas.filter(o =>
    (!sku || o.sku.toLowerCase().includes(sku)) &&
    (!categoria || o.categoria === categoria) &&
    (!tipo || o.tipoPersona === tipo) &&
    (!club || o.clubLider === club)
  );

  if (orden === "desc") filtradas.reverse();

  tablaOfertas.innerHTML = filtradas.map(o => `
    <tr data-id="${o.idOferta}" class="border-t">
      <td class="px-4 py-2">${o.sku}</td>
      <td class="px-4 py-2">${o.categoria}</td>
      <td class="px-4 py-2">${o.tipoPersona}</td>
      <td class="px-4 py-2">${o.clubLider}</td>
      <td class="px-4 py-2">$${o.nuevoPrecio.toFixed(0)}</td>
      <td class="px-4 py-2">${o.fechaInicio}</td>
      <td class="px-4 py-2">${o.fechaTermino}</td>
      <td class="px-4 py-2">${o.estado}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="modificarOferta bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarOferta bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

let ofertaModificarId = null; // Variable global para edición

tablaOfertas.addEventListener("click", (e) => {
  const fila = e.target.closest("tr");
  if (!fila) return; // Protección si se hace clic fuera de una fila

  const id = fila.dataset.id;
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const oferta = ofertas.find(o => o.idOferta === id);
  if (!oferta) return;

  if (e.target.classList.contains("modificarOferta")) {
  cargarSkusEnOfertas(); // 👈 Esto asegura que el select esté poblado

  // Mostrar formulario con datos
    document.getElementById("ofertaSku").value = oferta.sku;
    document.getElementById("ofertaCategoria").value = oferta.categoria;
    document.getElementById("ofertaTipoPersona").value = oferta.tipoPersona;
    document.getElementById("ofertaClubLider").value = oferta.clubLider;
    document.getElementById("ofertaPrecio").value = oferta.nuevoPrecio;
    document.getElementById("ofertaInicio").value = oferta.fechaInicio;
    document.getElementById("ofertaTermino").value = oferta.fechaTermino;

    const estadoField = document.getElementById("ofertaEstado");
    if (estadoField) {
      estadoField.classList.remove("hidden");
      estadoField.value = oferta.estado || "Activo";
    }

    ofertaModificarId = id;

    busquedaOfertas.classList.add("hidden");
    formularioOferta.classList.remove("hidden");
    document.getElementById("btnGuardarOferta").textContent = "Guardar cambios";
    document.getElementById("btnGuardarOferta").disabled = false;
  }


  if (e.target.classList.contains("eliminarOferta")) {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta oferta?");
    if (!confirmar) return;

    const nuevas = ofertas.filter(o => o.idOferta !== id);
    localStorage.setItem("ofertas", JSON.stringify(nuevas));
    renderizarOfertas();
  }
});

// Modificar o guardar nueva oferta (reemplaza tu submit actual)
document.getElementById("formularioOferta").addEventListener("submit", (e) => {
  e.preventDefault();

  const sku = document.getElementById("ofertaSku").value;
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const registro = inventario.find(i => i.sku === sku);
  if (!registro || registro.stock < 50) {
    alert("❌ No se puede guardar la oferta: stock insuficiente.");
    return;
  }

  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];

  const nuevaData = {
    sku,
    categoria: document.getElementById("ofertaCategoria").value,
    tipoPersona: document.getElementById("ofertaTipoPersona").value,
    clubLider: document.getElementById("ofertaClubLider").value,
    nuevoPrecio: parseFloat(document.getElementById("ofertaPrecio").value),
    fechaInicio: document.getElementById("ofertaInicio").value,
    fechaTermino: document.getElementById("ofertaTermino").value,
    estado: document.getElementById("ofertaEstado")?.value || "Activo"
  };

  if (ofertaModificarId) {
    const index = ofertas.findIndex(o => o.idOferta === ofertaModificarId);
    if (index !== -1) {
      ofertas[index] = { ...ofertas[index], ...nuevaData };
      alert("✅ Oferta modificada correctamente.");
    }
  } else {
    ofertas.push({
      idOferta: crypto.randomUUID(),
      ...nuevaData
    });
    alert("✅ Oferta registrada correctamente.");
  }

  localStorage.setItem("ofertas", JSON.stringify(ofertas));

  // Reset
  formularioOferta.reset();
  document.getElementById("btnGuardarOferta").disabled = true;
  document.getElementById("btnGuardarOferta").textContent = "Guardar oferta";
  ofertaModificarId = null;
  formularioOferta.classList.add("hidden");
  document.getElementById("btnNuevaOferta").classList.remove("hidden");
  document.getElementById("btnBuscarOferta").classList.remove("hidden");
  renderizarOfertas();
});









// --- Variables principales ---
const menuVentas = document.getElementById("menuVentas");
const moduloVentas = document.getElementById("moduloVentas");
const inputImportarVentas = document.getElementById("inputImportarVentas");
const btnImportarVentas = document.getElementById("btnImportarVentas");
const tablaVentas = document.getElementById("tablaVentas");

const formularioVenta = document.getElementById("formularioVenta");
const btnNuevaVenta = document.getElementById("btnNuevaVenta");
const btnRegresarVenta = document.getElementById("btnRegresarVenta");
const btnLimpiarVenta = document.getElementById("btnLimpiarVenta");

// --- Activar módulo Ventas ---
menuVentas.addEventListener("click", (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloVentas.classList.remove("hidden", "opacity-0");
    renderizarVentas();
  }, 200);
});

// --- Botón Importar Ventas (un solo botón) ---
btnImportarVentas.addEventListener("click", () => {
  inputImportarVentas.click();
});

inputImportarVentas.addEventListener("change", () => {
  const archivo = inputImportarVentas.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const ventasImportadas = XLSX.utils.sheet_to_json(hoja);

    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
    const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

    ventasImportadas.forEach(v => {
      const precioUnitario = parseFloat(v["precio unitario"]);
      let descuento = parseFloat(v["descuento por oferta"]) || 0;

      // Uso de promoción
      const usoPromo = v["uso de promoción"] || "No";
      if (usoPromo === "Sí") {
        const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
        const oferta = ofertas.find(o => o.sku === v["SKU"] && o.estado === "Activo");
        if (oferta) {
          descuento = precioUnitario - oferta.nuevoPrecio;
        }
      }

      // Convertir fecha si viene como número
      let fechaVenta = v["fecha venta"];
      if (typeof fechaVenta === "number") {
        fechaVenta = XLSX.SSF.format("yyyy-mm-dd", fechaVenta);
      }

      const montoTotal = (precioUnitario - descuento) * parseInt(v["cantidad"]);

      const venta = {
        idVenta: v["Id de la venta"] || crypto.randomUUID(),
        numeroDocumento: v["numero de boleta o factura"],
        rutCliente: v["Rut del cliente"],
        sku: v["SKU"],
        cantidad: parseInt(v["cantidad"]),
        precioUnitario,
        usoPromo,
        descuento,
        montoTotal,
        fechaVenta,
        metodoPago: v["metodo de pago"],
        estado: v["estado"]
      };

      // Restar stock
      const indexInv = inventario.findIndex(i => i.sku === venta.sku);
      if (indexInv !== -1) {
        inventario[indexInv].stock -= venta.cantidad;
        if (inventario[indexInv].stock < 0) inventario[indexInv].stock = 0;
      }

      ventas.push(venta);
    });

    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("inventario", JSON.stringify(inventario));
    alert("✅ Ventas importadas correctamente.");
    renderizarVentas();
  };

  lector.readAsArrayBuffer(archivo);
});

// --- Botón Nueva Venta ---
btnNuevaVenta.addEventListener("click", () => {
  formularioVenta.classList.remove("hidden");
  btnNuevaVenta.classList.add("hidden");
});

// --- Botón Regresar ---
btnRegresarVenta.addEventListener("click", () => {
  formularioVenta.classList.add("hidden");
  btnNuevaVenta.classList.remove("hidden");
  formularioVenta.reset();
});

// --- Botón Limpiar ---
btnLimpiarVenta.addEventListener("click", () => {
  formularioVenta.reset();
});

// --- Guardar Venta manual ---
formularioVenta.addEventListener("submit", (e) => {
  e.preventDefault();

  const sku = document.getElementById("ventaSku").value;
  const cantidad = parseInt(document.getElementById("ventaCantidad").value);
  const precioUnitario = parseFloat(document.getElementById("ventaPrecioUnitario").value);
  const usoPromo = document.getElementById("ventaUsoPromo").value;
  let descuento = 0;

  if (usoPromo === "Sí") {
    const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
    const oferta = ofertas.find(o => o.sku === sku && o.estado === "Activo");
    if (oferta) {
      descuento = precioUnitario - oferta.nuevoPrecio;
    }
  }

  const montoTotal = (precioUnitario - descuento) * cantidad;

  const nuevaVenta = {
    idVenta: crypto.randomUUID(),
    numeroDocumento: document.getElementById("ventaDocumento").value,
    rutCliente: document.getElementById("ventaRutCliente").value,
    sku,
    cantidad,
    precioUnitario,
    usoPromo,
    descuento,
    montoTotal,
    fechaVenta: document.getElementById("ventaFecha").value,
    metodoPago: document.getElementById("ventaMetodoPago").value,
    estado: document.getElementById("ventaEstado").value
  };

  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.push(nuevaVenta);
  localStorage.setItem("ventas", JSON.stringify(ventas));

  // Restar stock
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const indexInv = inventario.findIndex(i => i.sku === sku);
  if (indexInv !== -1) {
    inventario[indexInv].stock -= cantidad;
    if (inventario[indexInv].stock < 0) inventario[indexInv].stock = 0;
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }

  alert("✅ Venta registrada correctamente.");
  formularioVenta.reset();
  formularioVenta.classList.add("hidden");
  btnNuevaVenta.classList.remove("hidden");
  renderizarVentas();
});

// --- Renderizar tabla con filtros ---
function renderizarVentas() {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const filtroPromo = document.getElementById("filtroUsoPromo").value;
  const filtroMes = document.getElementById("filtroMesVenta").value;
  const filtroPago = document.getElementById("filtroMetodoPago").value;
  const filtroEstado = document.getElementById("filtroEstadoVenta").value;
  const buscadorDoc = document.getElementById("buscadorDocumentoVenta").value.trim().toLowerCase();

  let filtradas = ventas.filter(v =>
    (!filtroPromo || v.usoPromo === filtroPromo) &&
    (!filtroMes || (v.fechaVenta && v.fechaVenta.split("-")[1] === filtroMes)) &&
    (!filtroPago || v.metodoPago === filtroPago) &&
    (!filtroEstado || v.estado === filtroEstado) &&
    (!buscadorDoc || v.numeroDocumento.toLowerCase().includes(buscadorDoc))
  );

  tablaVentas.innerHTML = filtradas.map(v => `
    <tr data-id="${v.idVenta}" class="border-t">
      <td class="px-4 py-2">${v.numeroDocumento}</td>
      <td class="px-4 py-2">${v.rutCliente}</td>
      <td class="px-4 py-2">${v.sku}</td>
      <td class="px-4 py-2">${v.cantidad}</td>
      <td class="px-4 py-2">$${v.precioUnitario.toFixed(0)}</td>
      <td class="px-4 py-2">${v.usoPromo}</td>
      <td class="px-4 py-2">$${v.descuento.toFixed(0)}</td>
      <td class="px-4 py-2">$${v.montoTotal.toFixed(0)}</td>
      <td class="px-4 py-2">${v.fechaVenta}</td>
      <td class="px-4 py-2">${v.metodoPago}</td>
      <td class="px-4 py-2">${v.estado}</td>
      <td class="px-4 py-2">
        <button class="eliminarVenta bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// --- Eliminar venta ---
tablaVentas.addEventListener("click", (e) => {
  if (!e.target.classList.contains("eliminarVenta")) return;

  const fila = e.target.closest("tr");
  if (!fila) return;

  const id = fila.dataset.id;
  const confirmar = confirm("¿Estás seguro de que deseas eliminar esta venta?");
  if (!confirmar) return;

  let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas = ventas.filter(v => v.idVenta !== id);
  localStorage.setItem("ventas", JSON.stringify(ventas));

  // Renderizar nuevamente la tabla para reflejar cambios
  renderizarVentas();
});
