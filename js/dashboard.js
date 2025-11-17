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

function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}-${month}-${year}`;
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






// --- Activar módulo Proveedores ---
const menuProveedores = document.querySelector('#menuLider li:nth-child(3) a');
const moduloProveedores = document.getElementById('moduloProveedores');
const botonesProveedores = document.getElementById('botonesProveedores');

menuProveedores.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloProveedores.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesProveedores();
    renderizarProveedores();
  }, 200);
});

// --- Botones principales ---
const btnImportarProveedores = document.getElementById('btnImportarProveedores');
const inputImportarProveedores = document.getElementById('inputImportarProveedores');
const btnExportarProveedores = document.getElementById('btnExportarProveedores');
const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
const btnBuscarProveedor = document.getElementById('btnBuscarProveedor');

// --- Formulario de alta ---
const formularioProveedor = document.getElementById('formularioProveedor');
const btnRegresarProveedor = document.getElementById('btnRegresarProveedor');
const btnLimpiarProveedor = document.getElementById('btnLimpiarProveedor');
const provMsgOk = document.getElementById('provMsgOk');
const provMsgErr = document.getElementById('provMsgErr');

// --- Sección de búsqueda ---
const busquedaProveedores = document.getElementById('busquedaProveedores');
const tablaProveedores = document.getElementById('tablaProveedores');

// --- Alternancia búsqueda ---
let mostrandoBusquedaProveedores = false;

// --- Utilidad: mostrar solo botones principales ---
function mostrarSoloBotonesProveedores() {
  botonesProveedores.classList.remove('hidden');
  formularioProveedor.classList.add('hidden');
  busquedaProveedores.classList.add('hidden');
  provMsgOk.classList.add('hidden');
  provMsgErr.classList.add('hidden');
}

// --- Importar ---
btnImportarProveedores.addEventListener('click', () => {
  inputImportarProveedores.click();
});

inputImportarProveedores.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const proveedoresImportados = XLSX.utils.sheet_to_json(sheet);

  const proveedoresExistentes = JSON.parse(localStorage.getItem("proveedores")) || [];

  proveedoresImportados.forEach(importado => {
    const id = importado.idProveedor || crypto.randomUUID();
    const rut = importado.rut || "";
    const proveedor = {
      idProveedor: id,
      rut,
      nombre: importado.nombre || "",
      direccion: importado.direccion || "",
      ciudad: importado.ciudad || "",
      region: importado.region || "",
      contactoNombre: importado.contactoNombre || "",
      contactoTelefono: importado.contactoTelefono || "",
      contactoEmail: importado.contactoEmail || "",
      tipoProductos: importado.tipoProductos || "",
      estado: importado.estado || "Activo",
      fechaRegistro: importado.fechaRegistro || new Date().toISOString().slice(0, 10)
    };

    const index = proveedoresExistentes.findIndex(p => p.idProveedor === id);
    if (index !== -1) {
      proveedoresExistentes[index] = proveedor;
    } else {
      proveedoresExistentes.push(proveedor);
    }
  });

  localStorage.setItem("proveedores", JSON.stringify(proveedoresExistentes));
  alert("✅ Proveedores importados correctamente");
  e.target.value = "";
  if (mostrandoBusquedaProveedores) renderizarProveedores();
});

// --- Exportar ---
btnExportarProveedores.addEventListener('click', () => {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  if (!proveedores.length) {
    alert("No hay proveedores para exportar.");
    return;
  }

  const rows = proveedores.map(p => ({
    "Id del proveedor": p.idProveedor || "",
    "RUT": p.rut || "",
    "Nombre": p.nombre || "",
    "Dirección": p.direccion || "",
    "Ciudad": p.ciudad || "",
    "Región": p.region || "",
    "Contacto": p.contactoNombre || "",
    "Teléfono": p.contactoTelefono || "",
    "Email": p.contactoEmail || "",
    "Tipo": p.tipoProductos || "",
    "Estado": p.estado || "",
    "Fecha registro": p.fechaRegistro || ""
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
  XLSX.writeFile(wb, "Proveedores_export.xlsx");
});

// --- Agregar Proveedor ---
btnNuevoProveedor.addEventListener('click', () => {
  botonesProveedores.classList.add('hidden');   // ✅ oculta los 4 botones
  busquedaProveedores.classList.add('hidden');  // oculta lista si estaba abierta
  formularioProveedor.classList.remove('hidden'); // muestra formulario
  provMsgOk.classList.add('hidden');
  provMsgErr.classList.add('hidden');
});


// --- Regresar desde formulario ---
btnRegresarProveedor.addEventListener('click', () => {
  mostrarSoloBotonesProveedores();
});

// --- Limpiar formulario ---
btnLimpiarProveedor.addEventListener('click', () => {
  formularioProveedor.reset();
  provMsgOk.classList.add('hidden');
  provMsgErr.classList.add('hidden');
});

// --- Guardar Proveedor ---
formularioProveedor.addEventListener('submit', (e) => {
  e.preventDefault();

  const rut = document.getElementById("provRut").value.trim();
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  const existe = proveedores.some(p => (p.rut || "").toLowerCase() === rut.toLowerCase());

  if (existe) {
    provMsgOk.classList.add("hidden");
    provMsgErr.classList.remove("hidden");
    return;
  }

  const nuevoProveedor = {
    idProveedor: crypto.randomUUID(),
    rut,
    nombre: document.getElementById("provNombre").value.trim(),
    direccion: document.getElementById("provDireccion").value.trim(),
    ciudad: document.getElementById("provCiudad").value.trim(),
    region: document.getElementById("provRegion").value.trim(),
    contactoNombre: document.getElementById("provContactoNombre").value.trim(),
    contactoTelefono: document.getElementById("provContactoTelefono").value.trim(),
    contactoEmail: document.getElementById("provContactoEmail").value.trim(),
    tipoProductos: document.getElementById("provTipoProductos").value.trim(),
    estado: "Activo",
    fechaRegistro: new Date().toISOString().slice(0, 10)
  };

  proveedores.push(nuevoProveedor);
  localStorage.setItem("proveedores", JSON.stringify(proveedores));

  provMsgErr.classList.add("hidden");
  provMsgOk.classList.remove("hidden");
  formularioProveedor.reset();
});

// --- Buscar Proveedor: alternar lista debajo de botones ---
btnBuscarProveedor.addEventListener('click', () => {
  mostrandoBusquedaProveedores = !mostrandoBusquedaProveedores;

  if (mostrandoBusquedaProveedores) {
    formularioProveedor.classList.add('hidden');
    busquedaProveedores.classList.remove('hidden');
    renderizarProveedores();
  } else {
    busquedaProveedores.classList.add('hidden');
  }
});

// --- Filtros y buscador ---
['filtroRegionProveedor', 'filtroMesProveedor', 'filtroTipoProveedor', 'filtroEstadoProveedor', 'filtroOrdenProveedor', 'buscadorRutProveedor']
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderizarProveedores);
  });

// --- Renderizar tabla ---
function renderizarProveedores() {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

  const region = document.getElementById('filtroRegionProveedor').value;
  const mes = document.getElementById('filtroMesProveedor').value;
  const tipo = document.getElementById('filtroTipoProveedor').value;
  const estado = document.getElementById('filtroEstadoProveedor').value;
  const orden = document.getElementById('filtroOrdenProveedor').value;
  const rutBuscado = document.getElementById('buscadorRutProveedor').value.trim().toLowerCase();

  let filtrados = proveedores.filter(p => {
    const mesRegistro = (p.fechaRegistro || "").split("-")[1];
    return (!region || p.region === region) &&
           (!mes || mesRegistro === mes) &&
           (!tipo || p.tipoProductos === tipo) &&
           (!estado || p.estado === estado) &&
           (!rutBuscado || (p.rut || "").toLowerCase().includes(rutBuscado));
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
        <button class="modificarProveedor bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarProveedor bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

const formularioModificarProveedor = document.getElementById('formularioModificarProveedor');
const btnRegresarModProveedor = document.getElementById('btnRegresarModProveedor');
let rutProveedorModificar = null;

// Al presionar Modificar en la tabla
tablaProveedores.addEventListener('click', (e) => {
  if (e.target.classList.contains("modificarProveedor")) {
    const fila = e.target.closest("tr");
    const rut = fila.children[0].textContent;
    const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
    const proveedor = proveedores.find(p => p.rut === rut);
    if (!proveedor) return;

    rutProveedorModificar = rut;

    // Rellenar campos
    document.getElementById('modRutProveedor').value = proveedor.rut;
    document.getElementById('modNombreProveedor').value = proveedor.nombre;
    document.getElementById('modDireccionProveedor').value = proveedor.direccion;
    document.getElementById('modCiudadProveedor').value = proveedor.ciudad;
    document.getElementById('modRegionProveedor').value = proveedor.region;
    document.getElementById('modContactoNombreProveedor').value = proveedor.contactoNombre;
    document.getElementById('modContactoTelefonoProveedor').value = proveedor.contactoTelefono;
    document.getElementById('modContactoEmailProveedor').value = proveedor.contactoEmail;
    document.getElementById('modTipoProductosProveedor').value = proveedor.tipoProductos;
    document.getElementById('modEstadoProveedor').value = proveedor.estado;

    // Mostrar formulario de modificación
    botonesProveedores.classList.add('hidden');
    busquedaProveedores.classList.add('hidden');
    formularioModificarProveedor.classList.remove('hidden');
  }
});

// Guardar cambios
formularioModificarProveedor.addEventListener('submit', (e) => {
  e.preventDefault();
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

  const nuevoRut = document.getElementById('modRutProveedor').value.trim();
  const duplicado = proveedores.some(p => p.rut === nuevoRut && p.rut !== rutProveedorModificar);
  if (duplicado) {
    alert("❌ El RUT ya existe en otro proveedor.");
    return;
  }

  const index = proveedores.findIndex(p => p.rut === rutProveedorModificar);
  if (index === -1) return;

  proveedores[index] = {
    ...proveedores[index],
    rut: nuevoRut,
    nombre: document.getElementById('modNombreProveedor').value.trim(),
    direccion: document.getElementById('modDireccionProveedor').value.trim(),
    ciudad: document.getElementById('modCiudadProveedor').value.trim(),
    region: document.getElementById('modRegionProveedor').value.trim(),
    contactoNombre: document.getElementById('modContactoNombreProveedor').value.trim(),
    contactoTelefono: document.getElementById('modContactoTelefonoProveedor').value.trim(),
    contactoEmail: document.getElementById('modContactoEmailProveedor').value.trim(),
    tipoProductos: document.getElementById('modTipoProductosProveedor').value.trim(),
    estado: document.getElementById('modEstadoProveedor').value.trim()
  };

  localStorage.setItem("proveedores", JSON.stringify(proveedores));
  formularioModificarProveedor.classList.add('hidden');
  busquedaProveedores.classList.remove('hidden');
  botonesProveedores.classList.add('hidden'); // oculta los 4 botones
  busquedaProveedores.classList.add('hidden'); // oculta la lista
  formularioModificarProveedor.classList.remove('hidden'); // muestra el formulario de edición

  renderizarProveedores();
});

// Regresar desde modificación
btnRegresarModProveedor.addEventListener('click', () => {
  formularioModificarProveedor.classList.add('hidden');
  busquedaProveedores.classList.remove('hidden');
  botonesProveedores.classList.remove('hidden'); // vuelve a mostrar los 4 botones
});
















// Activar módulo Productos
const menuProductos = document.querySelector('#menuLider li:nth-child(5) a');
const moduloProductos = document.getElementById('moduloProductos');
const botonesProductos = document.getElementById('botonesProductos');

menuProductos.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloProductos.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesProductos();
    cargarProveedoresEnFiltro();
    renderizarProductos();
  }, 200);
});

// Elementos principales
const btnImportarProductos = document.getElementById('btnImportarProductos');
const inputImportarProductos = document.getElementById('inputImportarProductos');
const btnExportarProductos = document.getElementById('btnExportarProductos');
const btnNuevoProducto = document.getElementById('btnNuevoProducto');
const btnBuscarProducto = document.getElementById('btnBuscarProducto');

const formularioProducto = document.getElementById('formularioProducto');
const btnRegresarProducto = document.getElementById('btnRegresarProducto');
const btnLimpiarProducto = document.getElementById('btnLimpiarProducto');
const prodMsgOk = document.getElementById('prodMsgOk');
const prodMsgErr = document.getElementById('prodMsgErr');

const formularioModificarProducto = document.getElementById('formularioModificarProducto');
const btnRegresarModProducto = document.getElementById('btnRegresarModProducto');

const busquedaProductos = document.getElementById('busquedaProductos');
const tablaProductos = document.getElementById('tablaProductos');

let mostrandoBusquedaProductos = false;
let skuModificar = null;

// Mostrar solo botones
function mostrarSoloBotonesProductos() {
  botonesProductos.classList.remove('hidden');
  formularioProducto.classList.add('hidden');
  formularioModificarProducto.classList.add('hidden');
  busquedaProductos.classList.add('hidden');
  prodMsgOk.classList.add('hidden');
  prodMsgErr.classList.add('hidden');
}

// Importar
btnImportarProductos.addEventListener('click', () => {
  inputImportarProductos.click();
});

inputImportarProductos.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const productosImportados = XLSX.utils.sheet_to_json(sheet);

  const productosExistentes = JSON.parse(localStorage.getItem("productos")) || [];

  productosImportados.forEach(importado => {
    const id = importado.idProducto || crypto.randomUUID();
    const producto = {
      idProducto: id,
      sku: importado.sku || "",
      nombre: importado.nombre || "",
      marca: importado.marca || "",
      categoria: importado.categoria || "",
      proveedor: importado.proveedor || "",
      unidadMedida: importado.unidadMedida || "",
      costo: parseFloat(importado.costo) || 0,
      cantidad: parseInt(importado.cantidad) || 0,
      costoTotal: (parseFloat(importado.costo) || 0) * (parseInt(importado.cantidad) || 0),
      estado: importado.estado || "Activo",
      fechaRegistro: importado.fechaRegistro || new Date().toISOString().slice(0, 10)
    };

    const index = productosExistentes.findIndex(p => p.idProducto === id);
    if (index !== -1) {
      productosExistentes[index] = producto;
    } else {
      productosExistentes.push(producto);
    }
  });

  localStorage.setItem("productos", JSON.stringify(productosExistentes));
  alert("✅ Productos importados correctamente");
  e.target.value = "";
  if (mostrandoBusquedaProductos) renderizarProductos();
});

// Exportar
btnExportarProductos.addEventListener('click', () => {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  if (!productos.length) {
    alert("No hay productos para exportar.");
    return;
  }

  const rows = productos.map(p => ({
    "SKU": p.sku,
    "Nombre": p.nombre,
    "Marca": p.marca,
    "Categoría": p.categoria,
    "Proveedor": p.proveedor,
    "Unidad de Medida": p.unidadMedida,
    "Costo Unitario": p.costo,
    "Cantidad": p.cantidad,
    "Costo Total": p.costoTotal,
    "Estado": p.estado,
    "Fecha Registro": p.fechaRegistro
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.sheet_add_json(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  XLSX.writeFile(wb, "Productos_export.xlsx");
});

// Agregar
btnNuevoProducto.addEventListener('click', () => {
  botonesProductos.classList.add('hidden');
  busquedaProductos.classList.add('hidden');
  formularioProducto.classList.remove('hidden');
  prodMsgOk.classList.add('hidden');
  prodMsgErr.classList.add('hidden');
  cargarProveedoresEnFormulario();
});

// Regresar
btnRegresarProducto.addEventListener('click', () => {
  mostrarSoloBotonesProductos();
});

btnLimpiarProducto.addEventListener('click', () => {
  formularioProducto.reset();
  prodMsgOk.classList.add('hidden');
  prodMsgErr.classList.add('hidden');
});

// Guardar nuevo producto
formularioProducto.addEventListener('submit', (e) => {
  e.preventDefault();

  const sku = document.getElementById("prodSKU").value.trim();
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const existe = productos.some(p => p.sku === sku);

  if (existe) {
    prodMsgOk.classList.add("hidden");
    prodMsgErr.classList.remove("hidden");
    return;
  }

  const costo = parseFloat(document.getElementById("prodCosto").value.trim());
  const cantidad = parseInt(document.getElementById("prodCantidad").value.trim());

  const nuevoProducto = {
    idProducto: crypto.randomUUID(),
    sku,
    nombre: document.getElementById("prodNombre").value.trim(),
    marca: document.getElementById("prodMarca").value.trim(),
    categoria: document.getElementById("prodCategoria").value.trim(),
    proveedor: document.getElementById("prodProveedor").value.trim(),
    unidadMedida: document.getElementById("prodUnidadMedida").value.trim(),
    costo,
    cantidad,
    costoTotal: costo * cantidad,
    estado: "Activo",
    fechaRegistro: new Date().toISOString().slice(0, 10)
  };

  productos.push(nuevoProducto);
  localStorage.setItem("productos", JSON.stringify(productos));

  prodMsgErr.classList.add("hidden");
  prodMsgOk.classList.remove("hidden");
  formularioProducto.reset();
});

// Buscar
btnBuscarProducto.addEventListener('click', () => {
  mostrandoBusquedaProductos = !mostrandoBusquedaProductos;

  if (mostrandoBusquedaProductos) {
    formularioProducto.classList.add('hidden');
    formularioModificarProducto.classList.add('hidden');
    busquedaProductos.classList.remove('hidden');
    renderizarProductos();
  } else {
    busquedaProductos.classList.add('hidden');
  }
});

// Filtros
["filtroMarcaProducto", "filtroCategoriaProducto", "filtroProveedorProducto", "filtroOrdenProducto", "buscadorSKUProducto"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderizarProductos);
  });

function cargarProveedoresEnFiltro() {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  const select = document.getElementById("filtroProveedorProducto");
  if (!select) return;

  const únicos = [...new Set(proveedores.map(p => p.nombre).filter(Boolean))];
  select.innerHTML = '<option value="">Todos los proveedores</option>' +
    únicos.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
}

function renderizarProductos() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  const marca = document.getElementById('filtroMarcaProducto').value.trim().toLowerCase();
  const proveedor = document.getElementById('filtroProveedorProducto').value;
  const categoria = document.getElementById('filtroCategoriaProducto').value;
  const orden = document.getElementById('filtroOrdenProducto').value;
  const skuBuscado = document.getElementById('buscadorSKUProducto').value.trim().toLowerCase();

  let filtrados = productos.filter(p =>
    (!marca || (p.marca || "").toLowerCase().includes(marca)) &&
    (!categoria || p.categoria === categoria) &&
    (!proveedor || p.proveedor === proveedor) &&
    (!skuBuscado || (p.sku || "").toLowerCase().includes(skuBuscado))
  );

  if (orden === 'desc') filtrados.reverse();

  tablaProductos.innerHTML = filtrados.map(p => `
    <tr class="border-t">
      <td class="px-4 py-2">${p.sku}</td>
      <td class="px-4 py-2">${p.nombre}</td>
      <td class="px-4 py-2">${p.marca}</td>
      <td class="px-4 py-2">${p.categoria}</td>
      <td class="px-4 py-2">${p.proveedor}</td>
      <td class="px-4 py-2">${p.unidadMedida}</td>
      <td class="px-4 py-2">${p.costo}</td>
      <td class="px-4 py-2">${p.cantidad}</td>
      <td class="px-4 py-2">${p.costoTotal}</td>
      <td class="px-4 py-2">${p.estado}</td>
      <td class="px-4 py-2">${p.fechaRegistro}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="modificarProducto bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarProducto bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}


function cargarProveedoresEnFormulario() {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  const select = document.getElementById("prodProveedor");
  if (!select) return;

  const únicos = [...new Set(proveedores.map(p => p.nombre).filter(Boolean))];
  select.innerHTML = '<option value="">Seleccione proveedor</option>' +
    únicos.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
}

function cargarProveedoresEnFormularioMod() {
  const proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
  const select = document.getElementById("modProveedorProducto");
  if (!select) return;

  const únicos = [...new Set(proveedores.map(p => p.nombre).filter(Boolean))];
  select.innerHTML = '<option value="">Seleccione proveedor</option>' +
    únicos.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
}

// Acciones en tabla
tablaProductos.addEventListener("click", (e) => {
  const fila = e.target.closest("tr");
  if (!fila) return;
  const sku = fila.children[0].textContent;
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  // Eliminar
  if (e.target.classList.contains("eliminarProducto")) {
    const confirmar = confirm(`¿Eliminar producto con SKU ${sku}?`);
    if (!confirmar) return;
    const nuevos = productos.filter(p => p.sku !== sku);
    localStorage.setItem("productos", JSON.stringify(nuevos));
    renderizarProductos();
    return;
  }

  // Modificar
  if (e.target.classList.contains("modificarProducto")) {
    const producto = productos.find(p => p.sku === sku);
    if (!producto) return;

    skuModificar = sku;

    cargarProveedoresEnFormularioMod();

    document.getElementById("modSKUProducto").value = producto.sku;
    document.getElementById("modNombreProducto").value = producto.nombre;
    document.getElementById("modMarcaProducto").value = producto.marca;
    document.getElementById("modCategoriaProducto").value = producto.categoria;
    document.getElementById("modProveedorProducto").value = producto.proveedor;
    document.getElementById("modUnidadMedidaProducto").value = producto.unidadMedida;
    document.getElementById("modCostoProducto").value = producto.costo;
    document.getElementById("modCantidadProducto").value = producto.cantidad;

    botonesProductos.classList.add("hidden");
    busquedaProductos.classList.add("hidden");
    formularioModificarProducto.classList.remove("hidden");
  }
});

// Guardar cambios
formularioModificarProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  const productos = JSON.parse(localStorage.getItem("productos")) || [];

  const nuevoSKU = document.getElementById("modSKUProducto").value.trim();
  const duplicado = productos.some(p => p.sku === nuevoSKU && p.sku !== skuModificar);
  if (duplicado) {
    alert("❌ El SKU ya existe en otro producto.");
    return;
  }

  const index = productos.findIndex(p => p.sku === skuModificar);
  if (index === -1) return;

  const costo = parseFloat(document.getElementById("modCostoProducto").value.trim());
  const cantidad = parseInt(document.getElementById("modCantidadProducto").value.trim());

  productos[index] = {
    ...productos[index],
    sku: nuevoSKU,
    nombre: document.getElementById("modNombreProducto").value.trim(),
    marca: document.getElementById("modMarcaProducto").value.trim(),
    categoria: document.getElementById("modCategoriaProducto").value.trim(),
    proveedor: document.getElementById("modProveedorProducto").value.trim(),
    unidadMedida: document.getElementById("modUnidadMedidaProducto").value.trim(),
    costo,
    cantidad,
    costoTotal: costo * cantidad
  };

  localStorage.setItem("productos", JSON.stringify(productos));
  formularioModificarProducto.classList.add("hidden");
  botonesProductos.classList.remove("hidden");
  renderizarProductos();
});

// Regresar desde modificación
btnRegresarModProducto.addEventListener("click", () => {
  formularioModificarProducto.classList.add("hidden");
  botonesProductos.classList.remove("hidden");
});
















// --- Referencias principales ---
const moduloClientes = document.getElementById('moduloClientes');
const tablaClientes = document.getElementById('tablaClientes');

const botonesClientes = document.getElementById('botonesClientes');
const btnImportarClientes = document.getElementById('btnImportarClientes');
const inputImportarClientes = document.getElementById('inputImportarClientes');
const btnExportarClientes = document.getElementById('btnExportarClientes');
const btnNuevoCliente = document.getElementById('btnNuevoCliente');
const btnBuscarCliente = document.getElementById('btnBuscarCliente');

// --- Formulario de alta ---
const formularioCliente = document.getElementById('formularioCliente');
const btnRegresarCliente = document.getElementById('btnRegresarCliente');
const btnLimpiarCliente = document.getElementById('btnLimpiarCliente');
const cliMsgOk = document.getElementById('cliMsgOk');
const cliMsgErr = document.getElementById('cliMsgErr');

// --- Sección de búsqueda (filtros + tabla) ---
const busquedaClientes = document.getElementById('busquedaClientes');

// --- Filtros y buscador ---
const filtroTipoCliente = document.getElementById('filtroTipoCliente');
const filtroRegionCliente = document.getElementById('filtroRegionCliente');
const filtroClub = document.getElementById('filtroClub');
const filtroLealtad = document.getElementById('filtroLealtad');
const filtroOrdenCliente = document.getElementById('filtroOrdenCliente');
const buscadorRutCliente = document.getElementById('buscadorRutCliente');

// --- Activar módulo Clientes desde menú ---
const menuClientes = document.querySelector('#menuLider li:nth-child(4) a');
menuClientes.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloClientes.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesClientes();
    renderizarClientes(); // opcional: render de tabla si hay datos
  }, 200);
});

// --- Estado de alternancia para la búsqueda ---
let mostrandoBusquedaClientes = false;

// --- Utilidad: mostrar solo los botones principales ---
function mostrarSoloBotonesClientes() {
  botonesClientes.classList.remove('hidden');
  formularioCliente.classList.add('hidden');
  busquedaClientes.classList.add('hidden');
  cliMsgOk.classList.add('hidden');
  cliMsgErr.classList.add('hidden');
}

// --- Importar (botón único que abre el input oculto) ---
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
    // Asegurar claves consistentes según tu plantilla de importación
    const id = importado.idCliente || importado["Id del cliente"] || crypto.randomUUID();
    const rut = importado.rut || importado["RUT"] || "";
    const nombre = importado.nombre || importado["Nombre"] || "";
    const tipoCliente = importado.tipoCliente || importado["Tipo"] || "";
    const correo = importado.correo || importado["Correo"] || "";
    const telefono = importado.telefono || importado["Teléfono"] || "";
    const region = importado.region || importado["Región"] || "";
    const miembroClub = importado.miembroClub || importado["Club Líder"] || "";
    const nivelLealtad = importado.nivelLealtad || importado["Lealtad"] || "";

    const cliente = {
      idCliente: id,
      rut,
      nombre,
      tipoCliente,
      correo,
      telefono,
      region,
      miembroClub,
      nivelLealtad,
      fechaRegistro: importado.fechaRegistro || importado["Fecha registro"] || new Date().toISOString().slice(0, 10)
    };

    const index = clientesExistentes.findIndex(c => c.idCliente === id);
    if (index !== -1) {
      clientesExistentes[index] = cliente;
    } else {
      clientesExistentes.push(cliente);
    }
  });

  localStorage.setItem("clientes", JSON.stringify(clientesExistentes));
  alert("✅ Clientes importados correctamente");
  e.target.value = "";
  if (mostrandoBusquedaClientes) renderizarClientes();
});

// --- Exportar a Excel (misma estructura que el importado) ---
btnExportarClientes.addEventListener('click', () => {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  if (!clientes.length) {
    alert("No hay clientes para exportar.");
    return;
  }

  const rows = clientes.map(c => ({
    "Id del cliente": c.idCliente || "",
    "RUT": c.rut || "",
    "Nombre": c.nombre || "",
    "Tipo": c.tipoCliente || "",
    "Correo": c.correo || "",
    "Teléfono": c.telefono || "",
    "Región": c.region || "",
    "Club Líder": c.miembroClub || "",
    "Lealtad": c.nivelLealtad || "",
    "Fecha registro": c.fechaRegistro || ""
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  XLSX.writeFile(wb, "Clientes_export.xlsx");
});

// --- Agregar Cliente: mostrar formulario ---
btnNuevoCliente.addEventListener('click', () => {
  botonesClientes.classList.add('hidden');
  busquedaClientes.classList.add('hidden');
  formularioCliente.classList.remove('hidden');
  cliMsgOk.classList.add('hidden');
  cliMsgErr.classList.add('hidden');
});

// --- Regresar desde formulario ---
btnRegresarCliente.addEventListener('click', () => {
  mostrarSoloBotonesClientes();
});

// --- Limpiar formulario ---
btnLimpiarCliente.addEventListener('click', () => {
  formularioCliente.reset();
  cliMsgOk.classList.add('hidden');
  cliMsgErr.classList.add('hidden');
});

// --- Guardar Cliente con ID automático y validación de RUT duplicado ---
formularioCliente.addEventListener('submit', (e) => {
  e.preventDefault();

  const rut = document.getElementById("cliRut").value.trim();
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const existe = clientes.some(c => (c.rut || "").toLowerCase() === rut.toLowerCase());

  if (existe) {
    cliMsgOk.classList.add("hidden");
    cliMsgErr.classList.remove("hidden");
    return;
  }

  const nuevoCliente = {
    idCliente: crypto.randomUUID(),
    rut,
    nombre: document.getElementById("cliNombre").value.trim(),
    tipoCliente: document.getElementById("cliTipo").value.trim(),
    correo: document.getElementById("cliCorreo").value.trim(),
    telefono: document.getElementById("cliTelefono").value.trim(),
    region: document.getElementById("cliRegion").value.trim(),
    miembroClub: document.getElementById("cliClub").value.trim(),
    nivelLealtad: document.getElementById("cliLealtad").value.trim(),
    fechaRegistro: new Date().toISOString().slice(0, 10) // yyyy-mm-dd
  };

  clientes.push(nuevoCliente);
  localStorage.setItem("clientes", JSON.stringify(clientes));

  cliMsgErr.classList.add("hidden");
  cliMsgOk.classList.remove("hidden");
  formularioCliente.reset();
});

// --- Buscar Cliente: alternar lista y filtros ---
btnBuscarCliente.addEventListener('click', () => {
  mostrandoBusquedaClientes = !mostrandoBusquedaClientes;

  if (mostrandoBusquedaClientes) {
    // Los botones se mantienen visibles
    formularioCliente.classList.add('hidden');
    busquedaClientes.classList.remove('hidden'); // Se muestra la lista debajo
    renderizarClientes();
  } else {
    busquedaClientes.classList.add('hidden'); // Se oculta la lista
    // Los botones siguen visibles
  }
});


// --- Escuchar cambios de filtros y buscador para refrescar tabla ---
[filtroTipoCliente, filtroRegionCliente, filtroClub, filtroLealtad, filtroOrdenCliente, buscadorRutCliente]
  .forEach(el => {
    if (el) el.addEventListener('input', renderizarClientes);
  });

// --- Renderizar tabla con filtros ---
function renderizarClientes() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  const tipo = filtroTipoCliente ? filtroTipoCliente.value : "";
  const region = filtroRegionCliente ? filtroRegionCliente.value : "";
  const club = filtroClub ? filtroClub.value : "";
  const lealtad = filtroLealtad ? filtroLealtad.value : "";
  const orden = filtroOrdenCliente ? filtroOrdenCliente.value : "asc";
  const rutBuscado = (buscadorRutCliente ? buscadorRutCliente.value : "").trim().toLowerCase();

  let filtrados = clientes.filter(c =>
    (!tipo || c.tipoCliente === tipo) &&
    (!region || c.region === region) &&
    (!club || c.miembroClub === club) &&
    (!lealtad || c.nivelLealtad === lealtad) &&
    (!rutBuscado || (c.rut || "").toLowerCase().includes(rutBuscado))
  );

  if (orden === 'desc') filtrados = filtrados.reverse();

  tablaClientes.innerHTML = filtrados.map(c => `
    <tr class="border-t">
      <td class="px-4 py-2">${c.rut || ""}</td>
      <td class="px-4 py-2">${c.nombre || ""}</td>
      <td class="px-4 py-2">${c.tipoCliente || ""}</td>
      <td class="px-4 py-2">${c.correo || ""}</td>
      <td class="px-4 py-2">${c.telefono || ""}</td>
      <td class="px-4 py-2">${c.region || ""}</td>
      <td class="px-4 py-2">${c.miembroClub || ""}</td>
      <td class="px-4 py-2">${c.nivelLealtad || ""}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="eliminarCliente bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// --- Acciones en tabla (Eliminar) ---
tablaClientes.addEventListener('click', (e) => {
  if (!e.target.classList.contains("eliminarCliente")) return;

  const fila = e.target.closest("tr");
  if (!fila) return;

  const rut = fila.children[0].textContent;

  const confirmar = confirm(`¿Estás seguro de que deseas eliminar al cliente con RUT ${rut}?`);
  if (!confirmar) return;

  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes = clientes.filter(c => c.rut !== rut);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  renderizarClientes();
});










// Activar módulo Inventario
const menuInventario = document.querySelector('#menuLider li:nth-child(1) a'); // ajusta el índice según tu menú
const moduloInventario = document.getElementById('moduloInventario');
const botonesInventario = document.getElementById('botonesInventario');

menuInventario.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloInventario.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesInventario();
    renderizarInventario();
  }, 200);
});

// Elementos principales
const btnImportarInventario = document.getElementById('btnImportarInventario');
const inputImportarInventario = document.getElementById('inputImportarInventario');
const btnExportarInventario = document.getElementById('btnExportarInventario');
const btnBuscarInventario = document.getElementById('btnBuscarInventario');

const busquedaInventario = document.getElementById('busquedaInventario');
const tablaInventario = document.getElementById('tablaInventario');

const formularioModificarInventario = document.getElementById('formularioModificarInventario');
const btnRegresarModInventario = document.getElementById('btnRegresarModInventario');

let mostrandoBusquedaInventario = false;
let skuModificarInventario = null;

// Mostrar solo botones
function mostrarSoloBotonesInventario() {
  botonesInventario.classList.remove('hidden');
  busquedaInventario.classList.add('hidden');
  formularioModificarInventario.classList.add('hidden');
}

// Importar
btnImportarInventario.addEventListener('click', () => {
  inputImportarInventario.click();
});

inputImportarInventario.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const inventarioImportado = XLSX.utils.sheet_to_json(sheet);

  const inventarioExistente = JSON.parse(localStorage.getItem("inventario")) || [];

  inventarioImportado.forEach(importado => {
    const id = importado.idInventario || crypto.randomUUID();
    const registro = {
      idInventario: id,
      sku: importado.sku || "",
      categoria: importado.categoria || "",
      stock: parseInt(importado.stock) || 0,
      ubicacion: importado.ubicacion || "",
      precioVenta: parseFloat(importado.precioVenta) || 0,
      estado: importado.estado || "Disponible"
    };

    const index = inventarioExistente.findIndex(r => r.idInventario === id);
    if (index !== -1) {
      inventarioExistente[index] = registro;
    } else {
      inventarioExistente.push(registro);
    }
  });

  localStorage.setItem("inventario", JSON.stringify(inventarioExistente));
  alert("✅ Inventario importado correctamente");
  e.target.value = "";
  if (mostrandoBusquedaInventario) renderizarInventario();
});

// Exportar
btnExportarInventario.addEventListener('click', () => {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  if (!inventario.length) {
    alert("No hay registros de inventario para exportar.");
    return;
  }

  const rows = inventario.map(r => ({
    "SKU": r.sku,
    "Categoría": r.categoria,
    "Stock": r.stock,
    "Ubicación": r.ubicacion,
    "Precio Venta": r.precioVenta,
    "Estado": r.estado
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");
  XLSX.writeFile(wb, "Inventario_export.xlsx");
});

// Buscar
btnBuscarInventario.addEventListener('click', () => {
  mostrandoBusquedaInventario = !mostrandoBusquedaInventario;

  if (mostrandoBusquedaInventario) {
    busquedaInventario.classList.remove('hidden');
    formularioModificarInventario.classList.add('hidden');
    renderizarInventario();
  } else {
    busquedaInventario.classList.add('hidden');
  }
});

// Filtros
["filtroCategoriaInventario", "filtroEstadoInventario", "filtroSKUInventario", "filtroOrdenStockInventario"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderizarInventario);
  });

// Renderizar tabla
function renderizarInventario() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  // Crear registros de inventario para cada producto si no existen
  productos.forEach(p => {
    const existe = inventario.some(r => r.sku === p.sku);
    if (!existe) {
      inventario.push({
        idInventario: crypto.randomUUID(),
        sku: p.sku,
        categoria: p.categoria || "",
        stock: p.cantidad || 0, // cantidad del producto pasa a stock
        ubicacion: "",          // vacío por defecto
        precioVenta: "",        // vacío por defecto
        estado: "Activo"        // siempre activo
      });
    }
  });

  // Guardar inventario actualizado
  localStorage.setItem("inventario", JSON.stringify(inventario));

  const categoria = document.getElementById('filtroCategoriaInventario').value;
  const estado = document.getElementById('filtroEstadoInventario').value;
  const skuBuscado = document.getElementById('filtroSKUInventario').value.trim().toLowerCase();
  const ordenStock = document.getElementById('filtroOrdenStockInventario').value;

  let filtrados = inventario.filter(r =>
    (!categoria || r.categoria === categoria) &&
    (!estado || r.estado === estado) &&
    (!skuBuscado || (r.sku || "").toLowerCase().includes(skuBuscado))
  );

  // Ordenar por stock
  filtrados.sort((a, b) => ordenStock === "asc" ? a.stock - b.stock : b.stock - a.stock);

  tablaInventario.innerHTML = filtrados.map(r =>{
    const alerta = r.stock < 50 && r.estado === "Activo" ? "bg-red-100" : "";
    return `
    <tr class="border-t ${alerta}">
      <td class="px-4 py-2">${r.sku}</td>
      <td class="px-4 py-2">${r.categoria}</td>
      <td class="px-4 py-2">${r.stock}</td>
      <td class="px-4 py-2">${r.ubicacion}</td>
      <td class="px-4 py-2">${r.precioVenta}</td>
      <td class="px-4 py-2">${r.estado}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="modificarInventario bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarInventario bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `}).join('');
}

// Acciones en tabla
tablaInventario.addEventListener("click", (e) => {
  const fila = e.target.closest("tr");
  if (!fila) return;
  const sku = fila.children[0].textContent;
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  // Eliminar
  if (e.target.classList.contains("eliminarInventario")) {
    const confirmar = confirm(`¿Eliminar registro de inventario con SKU ${sku}?`);
    if (!confirmar) return;
    const nuevos = inventario.filter(r => r.sku !== sku);
    localStorage.setItem("inventario", JSON.stringify(nuevos));
    renderizarInventario();
    return;
  }

  // Modificar
  if (e.target.classList.contains("modificarInventario")) {
    const registro = inventario.find(r => r.sku === sku);
    if (!registro) return;

    skuModificarInventario = sku;

    document.getElementById("modSKUInventario").value = registro.sku;
    document.getElementById("modCategoriaInventario").value = registro.categoria;
    document.getElementById("modStockInventario").value = registro.stock;
    document.getElementById("modUbicacionInventario").value = registro.ubicacion;
    document.getElementById("modPrecioVentaInventario").value = registro.precioVenta;
    document.getElementById("modEstadoInventario").value = registro.estado;

    botonesInventario.classList.add("hidden");
    busquedaInventario.classList.add("hidden");
    formularioModificarInventario.classList.remove("hidden");
  }
});

// Guardar cambios
formularioModificarInventario.addEventListener("submit", (e) => {
  e.preventDefault();
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const index = inventario.findIndex(r => r.sku === skuModificarInventario);
  if (index === -1) return;

  inventario[index] = {
    ...inventario[index],
    categoria: document.getElementById("modCategoriaInventario").value.trim(),
    stock: parseInt(document.getElementById("modStockInventario").value.trim()),
    ubicacion: document.getElementById("modUbicacionInventario").value.trim(),
    precioVenta: parseFloat(document.getElementById("modPrecioVentaInventario").value.trim()),
    estado: document.getElementById("modEstadoInventario").value.trim()
  };

  // Guardar cambios en localStorage
  localStorage.setItem("inventario", JSON.stringify(inventario));

  // Ocultar formulario y volver a mostrar botones
  formularioModificarInventario.classList.add("hidden");
  botonesInventario.classList.remove("hidden");

  // Renderizar nuevamente la tabla con los cambios
  renderizarInventario();
});

// Regresar desde modificación
btnRegresarModInventario.addEventListener("click", () => {
  formularioModificarInventario.classList.add("hidden");
  botonesInventario.classList.remove("hidden");
});











// Activar módulo Ofertas
const menuOfertas = document.querySelector('#menuLider li:nth-child(6) a'); // ajusta índice según tu menú
const moduloOfertas = document.getElementById('moduloOfertas');
const botonesOfertas = document.getElementById('botonesOfertas');

menuOfertas.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloOfertas.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesOfertas();
    cargarSKUYCategoriasEnFormulario();
    renderizarOfertas();
  }, 200);
});

// Elementos principales
const btnImportarOfertas = document.getElementById('btnImportarOfertas');
const inputImportarOfertas = document.getElementById('inputImportarOfertas');
const btnExportarOfertas = document.getElementById('btnExportarOfertas');
const btnNuevaOferta = document.getElementById('btnNuevaOferta');
const btnBuscarOferta = document.getElementById('btnBuscarOferta');

const formularioOferta = document.getElementById('formularioOferta');
const btnRegresarOferta = document.getElementById('btnRegresarOferta');
const btnLimpiarOferta = document.getElementById('btnLimpiarOferta');
const ofertaMsgOk = document.getElementById('ofertaMsgOk');
const ofertaMsgErr = document.getElementById('ofertaMsgErr');

const busquedaOfertas = document.getElementById('busquedaOfertas');
const tablaOfertas = document.getElementById('tablaOfertas');

const formularioModificarOferta = document.getElementById('formularioModificarOferta');
const btnRegresarModOferta = document.getElementById('btnRegresarModOferta');

let mostrandoBusquedaOfertas = false;
let skuModificarOferta = null;

// Mostrar solo botones
function mostrarSoloBotonesOfertas() {
  botonesOfertas.classList.remove('hidden');
  formularioOferta.classList.add('hidden');
  formularioModificarOferta.classList.add('hidden');
  busquedaOfertas.classList.add('hidden');
  ofertaMsgOk.classList.add('hidden');
  ofertaMsgErr.classList.add('hidden');
}

// Importar
btnImportarOfertas.addEventListener('click', () => {
  inputImportarOfertas.click();
});

inputImportarOfertas.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const ofertasImportadas = XLSX.utils.sheet_to_json(sheet);

  const ofertasExistentes = JSON.parse(localStorage.getItem("ofertas")) || [];

  ofertasImportadas.forEach(importado => {
    const id = importado.idOferta || crypto.randomUUID();
    const oferta = {
      idOferta: id,
      sku: importado.sku || "",
      categoria: importado.categoria || "",
      tipoPersona: importado.tipoPersona || "",
      clubLider: importado.clubLider || "No",
      nuevoPrecio: parseFloat(importado.nuevoPrecio) || 0,
      fechaInicio: importado.fechaInicio || new Date().toISOString().slice(0, 10),
      fechaFin: importado.fechaFin || new Date().toISOString().slice(0, 10)
    };

    const index = ofertasExistentes.findIndex(o => o.idOferta === id);
    if (index !== -1) {
      ofertasExistentes[index] = oferta;
    } else {
      ofertasExistentes.push(oferta);
    }
  });

  localStorage.setItem("ofertas", JSON.stringify(ofertasExistentes));
  alert("✅ Ofertas importadas correctamente");
  e.target.value = "";
  if (mostrandoBusquedaOfertas) renderizarOfertas();
});

// Exportar
btnExportarOfertas.addEventListener('click', () => {
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  if (!ofertas.length) {
    alert("No hay ofertas para exportar.");
    return;
  }

  const rows = ofertas.map(o => ({
    "SKU": o.sku,
    "Categoría": o.categoria,
    "Tipo de Persona": o.tipoPersona,
    "Club Líder": o.clubLider,
    "Nuevo Precio": o.nuevoPrecio,
    "Fecha Inicio": o.fechaInicio,
    "Fecha Fin": o.fechaFin
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Ofertas");
  XLSX.writeFile(wb, "Ofertas_export.xlsx");
});

// Agregar
btnNuevaOferta.addEventListener('click', () => {
  botonesOfertas.classList.add('hidden');
  busquedaOfertas.classList.add('hidden');
  formularioOferta.classList.remove('hidden');
  ofertaMsgOk.classList.add('hidden');
  ofertaMsgErr.classList.add('hidden');
  cargarSKUYCategoriasEnFormulario();
});

// Regresar
btnRegresarOferta.addEventListener('click', () => {
  mostrarSoloBotonesOfertas();
});

// Limpiar
btnLimpiarOferta.addEventListener('click', () => {
  formularioOferta.reset();
  ofertaMsgOk.classList.add('hidden');
  ofertaMsgErr.classList.add('hidden');
});

// Guardar nueva oferta
formularioOferta.addEventListener('submit', (e) => {
  e.preventDefault();

  const sku = document.getElementById("ofertaSKU").value.trim();
  const categoria = document.getElementById("ofertaCategoria").value.trim();
  const tipoPersona = document.getElementById("ofertaTipoPersona").value.trim();
  const clubLider = document.getElementById("ofertaClubLider").value.trim();
  const nuevoPrecio = parseFloat(document.getElementById("ofertaNuevoPrecio").value.trim());
  const fechaInicio = document.getElementById("ofertaFechaInicio").value.trim();
  const fechaFin = document.getElementById("ofertaFechaFin").value.trim();

  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  // Validar existencia de SKU en inventario
  const productoInventario = inventario.find(p => p.sku === sku);
  if (!productoInventario) {
    ofertaMsgOk.classList.add("hidden");
    ofertaMsgErr.textContent = "❌ El SKU seleccionado no existe en Inventario.";
    ofertaMsgErr.classList.remove("hidden");
    return;
  }

  // Validar stock mínimo
  if (productoInventario.stock < 50) {
    ofertaMsgOk.classList.add("hidden");
    ofertaMsgErr.textContent = "❌ Stock insuficiente (menor a 50 unidades). No se puede crear la oferta.";
    ofertaMsgErr.classList.remove("hidden");
    return;
  }

  // Validar duplicado
  const existe = ofertas.some(o => o.sku === sku);
  if (existe) {
    ofertaMsgOk.classList.add("hidden");
    ofertaMsgErr.textContent = "❌ Ya existe una oferta para este SKU.";
    ofertaMsgErr.classList.remove("hidden");
    return;
  }

  // Crear nueva oferta
  const nuevaOferta = {
    idOferta: crypto.randomUUID(),
    sku,
    categoria,
    tipoPersona,
    clubLider,
    nuevoPrecio,
    fechaInicio,
    fechaFin
  };

  ofertas.push(nuevaOferta);
  localStorage.setItem("ofertas", JSON.stringify(ofertas));

  ofertaMsgErr.classList.add("hidden");
  ofertaMsgOk.textContent = "✅ Oferta guardada correctamente.";
  ofertaMsgOk.classList.remove("hidden");
  formularioOferta.reset();
});

// Buscar
btnBuscarOferta.addEventListener('click', () => {
  mostrandoBusquedaOfertas = !mostrandoBusquedaOfertas;

  if (mostrandoBusquedaOfertas) {
    formularioOferta.classList.add('hidden');
    formularioModificarOferta.classList.add('hidden');
    busquedaOfertas.classList.remove('hidden');
    renderizarOfertas();
  } else {
    busquedaOfertas.classList.add('hidden');
  }
});

// Filtros
["filtroCategoriaOferta", "filtroTipoPersonaOferta", "filtroClubLiderOferta", "filtroSKUOferta", "filtroOrdenOferta"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderizarOfertas);
  });

// Renderizar tabla
function renderizarOfertas() {
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];

  const categoria = document.getElementById('filtroCategoriaOferta').value;
  const tipoPersona = document.getElementById('filtroTipoPersonaOferta').value;
  const clubLider = document.getElementById('filtroClubLiderOferta').value;
  const skuBuscado = document.getElementById('filtroSKUOferta').value.trim().toLowerCase();
  const orden = document.getElementById('filtroOrdenOferta').value;

  let filtrados = ofertas.filter(o =>
    (!categoria || o.categoria === categoria) &&
    (!tipoPersona || o.tipoPersona === tipoPersona) &&
    (!clubLider || o.clubLider === clubLider) &&
    (!skuBuscado || (o.sku || "").toLowerCase().includes(skuBuscado))
  );

  if (orden === 'desc') filtrados.reverse();

  tablaOfertas.innerHTML = filtrados.map(o => `
    <tr class="border-t">
      <td class="px-4 py-2">${o.sku}</td>
      <td class="px-4 py-2">${o.categoria}</td>
      <td class="px-4 py-2">${o.tipoPersona}</td>
      <td class="px-4 py-2">${o.clubLider}</td>
      <td class="px-4 py-2">${o.nuevoPrecio}</td>
      <td class="px-4 py-2">${formatearFecha(o.fechaInicio)}</td>
      <td class="px-4 py-2">${formatearFecha(o.fechaFin)}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="modificarOferta bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarOferta bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Acciones en tabla
tablaOfertas.addEventListener("click", (e) => {
  const fila = e.target.closest("tr");
  if (!fila) return;
  const sku = fila.children[0].textContent;
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];

  // Eliminar
  if (e.target.classList.contains("eliminarOferta")) {
    const confirmar = confirm(`¿Eliminar oferta con SKU ${sku}?`);
    if (!confirmar) return;
    const nuevas = ofertas.filter(o => o.sku !== sku);
    localStorage.setItem("ofertas", JSON.stringify(nuevas));
    renderizarOfertas();
    return;
  }

  // Modificar
  if (e.target.classList.contains("modificarOferta")) {
    const oferta = ofertas.find(o => o.sku === sku);
    if (!oferta) return;

    skuModificarOferta = sku;

    document.getElementById("modSKUOferta").value = oferta.sku;
    document.getElementById("modCategoriaOferta").value = oferta.categoria;
    document.getElementById("modTipoPersonaOferta").value = oferta.tipoPersona;
    document.getElementById("modClubLiderOferta").value = oferta.clubLider;
    document.getElementById("modNuevoPrecioOferta").value = oferta.nuevoPrecio;
    document.getElementById("modFechaInicioOferta").value = oferta.fechaInicio;
    document.getElementById("modFechaFinOferta").value = oferta.fechaFin;

    botonesOfertas.classList.add("hidden");
    busquedaOfertas.classList.add("hidden");
    formularioModificarOferta.classList.remove("hidden");
  }
});

// Guardar cambios en modificación
formularioModificarOferta.addEventListener("submit", (e) => {
  e.preventDefault();
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];

  const index = ofertas.findIndex(o => o.sku === skuModificarOferta);
  if (index === -1) return;

  ofertas[index] = {
    ...ofertas[index],
    categoria: document.getElementById("modCategoriaOferta").value.trim(),
    tipoPersona: document.getElementById("modTipoPersonaOferta").value.trim(),
    clubLider: document.getElementById("modClubLiderOferta").value.trim(),
    nuevoPrecio: parseFloat(document.getElementById("modNuevoPrecioOferta").value.trim()),
    fechaInicio: document.getElementById("modFechaInicioOferta").value.trim(),
    fechaFin: document.getElementById("modFechaFinOferta").value.trim()
  };

  localStorage.setItem("ofertas", JSON.stringify(ofertas));
  formularioModificarOferta.classList.add("hidden");
  botonesOfertas.classList.remove("hidden");
  renderizarOfertas();
});

// Regresar desde modificación
btnRegresarModOferta.addEventListener("click", () => {
  formularioModificarOferta.classList.add("hidden");
  botonesOfertas.classList.remove("hidden");

  if (mostrandoBusquedaOfertas) {
    busquedaOfertas.classList.remove("hidden");
    renderizarOfertas(); // refrescar la tabla
  }
});

// Función para cargar SKU y Categorías desde Inventario
function cargarSKUYCategoriasEnFormulario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const selectSKU = document.getElementById("ofertaSKU");
  const selectCategoria = document.getElementById("ofertaCategoria");
  if (!selectSKU || !selectCategoria) return;

  // Llenar SKUs
  selectSKU.innerHTML = '<option value="">Seleccione SKU</option>' +
    inventario.map(r => `<option value="${r.sku}">${r.sku}</option>`).join('');

  // Llenar categorías únicas
  const categoriasUnicas = [...new Set(inventario.map(r => r.categoria).filter(Boolean))];
  selectCategoria.innerHTML = '<option value="">Seleccione categoría</option>' +
    categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join('');
}













// Activar módulo Ventas
const menuVentas = document.querySelector('#menuLider li:nth-child(2) a'); // ajusta índice según tu menú
const moduloVentas = document.getElementById('moduloVentas');
const botonesVentas = document.getElementById('botonesVentas');

menuVentas.addEventListener('click', (e) => {
  e.preventDefault();
  ocultarTodosLosModulos();
  ocultarSubseccionesActivas();
  setTimeout(() => {
    moduloVentas.classList.remove("hidden", "opacity-0");
    mostrarSoloBotonesVentas();
    cargarSKUEnFormulario();
    renderizarVentas();
  }, 200);
});

// Elementos principales
const btnImportarVentas = document.getElementById('btnImportarVentas');
const inputImportarVentas = document.getElementById('inputImportarVentas');
const btnExportarVentas = document.getElementById('btnExportarVentas');
const btnNuevaVenta = document.getElementById('btnNuevaVenta');
const btnBuscarVenta = document.getElementById('btnBuscarVenta');

const formularioVenta = document.getElementById('formularioVenta');
const btnRegresarVenta = document.getElementById('btnRegresarVenta');
const btnLimpiarVenta = document.getElementById('btnLimpiarVenta');
const ventaMsgOk = document.getElementById('ventaMsgOk');
const ventaMsgErr = document.getElementById('ventaMsgErr');

const busquedaVentas = document.getElementById('busquedaVentas');
const tablaVentas = document.getElementById('tablaVentas');

const formularioModificarVenta = document.getElementById('formularioModificarVenta');
const btnRegresarModVenta = document.getElementById('btnRegresarModVenta');

let mostrandoBusquedaVentas = false;
let boletaModificarVenta = null;

// Mostrar solo botones
function mostrarSoloBotonesVentas() {
  botonesVentas.classList.remove('hidden');
  formularioVenta.classList.add('hidden');
  formularioModificarVenta.classList.add('hidden');
  busquedaVentas.classList.add('hidden');
  ventaMsgOk.classList.add('hidden');
  ventaMsgErr.classList.add('hidden');
}

// Importar
btnImportarVentas.addEventListener('click', () => {
  inputImportarVentas.click();
});

inputImportarVentas.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const ventasImportadas = XLSX.utils.sheet_to_json(sheet);

  const ventasExistentes = JSON.parse(localStorage.getItem("ventas")) || [];

  ventasImportadas.forEach(importado => {
    const id = importado.idVenta || crypto.randomUUID();
    const venta = {
      idVenta: id,
      boletaFactura: importado.boletaFactura || "",
      rutCliente: importado.rutCliente || "",
      sku: importado.sku || "",
      cantidad: parseInt(importado.cantidad) || 0,
      precioUnitario: parseFloat(importado.precioUnitario) || 0,
      usoPromocion: importado.usoPromocion || "No",
      descuento: parseFloat(importado.descuento) || 0,
      total: parseFloat(importado.total) || 0,
      fecha: importado.fecha || new Date().toISOString().slice(0, 10),
      metodoPago: importado.metodoPago || "",
      estado: importado.estado || "Pendiente"
    };

    const index = ventasExistentes.findIndex(v => v.idVenta === id);
    if (index !== -1) {
      ventasExistentes[index] = venta;
    } else {
      ventasExistentes.push(venta);
    }
  });

  localStorage.setItem("ventas", JSON.stringify(ventasExistentes));
  alert("✅ Ventas importadas correctamente");
  e.target.value = "";
  if (mostrandoBusquedaVentas) renderizarVentas();
});

// Exportar
btnExportarVentas.addEventListener('click', () => {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  if (!ventas.length) {
    alert("No hay ventas para exportar.");
    return;
  }

  const rows = ventas.map(v => ({
    "Boleta/Factura": v.boletaFactura,
    "RUT Cliente": v.rutCliente,
    "SKU": v.sku,
    "Cantidad": v.cantidad,
    "Precio Unitario": v.precioUnitario,
    "Uso Promoción": v.usoPromocion,
    "Descuento": v.descuento,
    "Total": v.total,
    "Fecha": v.fecha,
    "Método de Pago": v.metodoPago,
    "Estado": v.estado
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");
  XLSX.writeFile(wb, "Ventas_export.xlsx");
});

// Agregar
btnNuevaVenta.addEventListener('click', () => {
  botonesVentas.classList.add('hidden');
  busquedaVentas.classList.add('hidden');
  formularioVenta.classList.remove('hidden');
  ventaMsgOk.classList.add('hidden');
  ventaMsgErr.classList.add('hidden');
  cargarSKUEnFormulario();
});

// Regresar
btnRegresarVenta.addEventListener('click', () => {
  mostrarSoloBotonesVentas();
});

// Limpiar
btnLimpiarVenta.addEventListener('click', () => {
  formularioVenta.reset();
  ventaMsgOk.classList.add('hidden');
  ventaMsgErr.classList.add('hidden');
});

// Guardar nueva venta
formularioVenta.addEventListener('submit', (e) => {
  e.preventDefault();

  const boletaFactura = document.getElementById("ventaBoletaFactura").value.trim();
  const rutCliente = document.getElementById("ventaRutCliente").value.trim();
  const sku = document.getElementById("ventaSKU").value.trim();
  const cantidad = parseInt(document.getElementById("ventaCantidad").value.trim());
  const precioUnitario = parseFloat(document.getElementById("ventaPrecioUnitario").value.trim());
  const usoPromocion = document.getElementById("ventaUsoPromocion").value.trim();
  const descuento = parseFloat(document.getElementById("ventaDescuento").value.trim()) || 0;
  const fecha = document.getElementById("ventaFecha").value.trim();
  const metodoPago = document.getElementById("ventaMetodoPago").value.trim();
  const estado = document.getElementById("ventaEstado").value.trim();

  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  // Validar duplicado por boleta/factura
  const existe = ventas.some(v => v.boletaFactura === boletaFactura);
  if (existe) {
    ventaMsgOk.classList.add("hidden");
    ventaMsgErr.textContent = "❌ Ya existe una venta con esta Boleta/Factura.";
    ventaMsgErr.classList.remove("hidden");
    return;
  }

  const total = (cantidad * precioUnitario) * (1 - descuento / 100);

  const nuevaVenta = {
    idVenta: crypto.randomUUID(),
    boletaFactura,
    rutCliente,
    sku,
    cantidad,
    precioUnitario,
    usoPromocion,
    descuento,
    total,
    fecha,
    metodoPago,
    estado
  };

  ventas.push(nuevaVenta);
  localStorage.setItem("ventas", JSON.stringify(ventas));

  ventaMsgErr.classList.add("hidden");
  ventaMsgOk.textContent = "✅ Venta registrada correctamente.";
  ventaMsgOk.classList.remove("hidden");
  formularioVenta.reset();
});

// Buscar
btnBuscarVenta.addEventListener('click', () => {
  mostrandoBusquedaVentas = !mostrandoBusquedaVentas;

  if (mostrandoBusquedaVentas) {
    formularioVenta.classList.add('hidden');
    formularioModificarVenta.classList.add('hidden');
    busquedaVentas.classList.remove('hidden');
    renderizarVentas();
  } else {
    busquedaVentas.classList.add('hidden');
  }
});

// Filtros
["filtroUsoPromocionVenta", "filtroMesVenta", "filtroMetodoPagoVenta", "filtroEstadoVenta", "filtroBoletaFacturaVenta", "filtroOrdenVenta"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderizarVentas);
  });

// Renderizar tabla
function renderizarVentas() {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const usoPromocion = document.getElementById('filtroUsoPromocionVenta').value;
  const mesVenta = document.getElementById('filtroMesVenta').value;
  const metodoPago = document.getElementById('filtroMetodoPagoVenta').value;
  const estado = document.getElementById('filtroEstadoVenta').value;
  const boletaBuscada = document.getElementById('filtroBoletaFacturaVenta').value.trim().toLowerCase();
  const orden = document.getElementById('filtroOrdenVenta').value;

  let filtrados = ventas.filter(v =>
    (!usoPromocion || v.usoPromocion === usoPromocion) &&
    (!mesVenta || (v.fecha && v.fecha.split("-")[1] === mesVenta)) &&
    (!metodoPago || v.metodoPago === metodoPago) &&
    (!estado || v.estado === estado) &&
    (!boletaBuscada || (v.boletaFactura || "").toLowerCase().includes(boletaBuscada))
  );

  // Ordenar
  if (orden === "desc") filtrados.reverse();

  // Renderizar tabla
  tablaVentas.innerHTML = filtrados.map(v => `
    <tr class="border-t">
      <td class="px-4 py-2">${v.boletaFactura}</td>
      <td class="px-4 py-2">${v.rutCliente}</td>
      <td class="px-4 py-2">${v.sku}</td>
      <td class="px-4 py-2">${v.cantidad}</td>
      <td class="px-4 py-2">${v.precioUnitario}</td>
      <td class="px-4 py-2">${v.usoPromocion}</td>
      <td class="px-4 py-2">${v.descuento}</td>
      <td class="px-4 py-2">${v.total}</td>
      <td class="px-4 py-2">${formatearFecha(v.fecha)}</td>
      <td class="px-4 py-2">${v.metodoPago}</td>
      <td class="px-4 py-2">${v.estado}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="modificarVenta bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">Modificar</button>
        <button class="eliminarVenta bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Función para formatear fecha a día-mes-año
function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}-${month}-${year}`;
}

// Acciones en tabla
tablaVentas.addEventListener("click", (e) => {
  const fila = e.target.closest("tr");
  if (!fila) return;
  const boletaFactura = fila.children[0].textContent;
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  // Eliminar
  if (e.target.classList.contains("eliminarVenta")) {
    const confirmar = confirm(`¿Eliminar venta con Boleta/Factura ${boletaFactura}?`);
    if (!confirmar) return;
    const nuevas = ventas.filter(v => v.boletaFactura !== boletaFactura);
    localStorage.setItem("ventas", JSON.stringify(nuevas));
    renderizarVentas();
    return;
  }

  // Modificar
  if (e.target.classList.contains("modificarVenta")) {
    const venta = ventas.find(v => v.boletaFactura === boletaFactura);
    if (!venta) return;

    boletaModificarVenta = boletaFactura;

    document.getElementById("modBoletaFacturaVenta").value = venta.boletaFactura;
    document.getElementById("modRutClienteVenta").value = venta.rutCliente;
    document.getElementById("modSKUVenta").value = venta.sku;
    document.getElementById("modCantidadVenta").value = venta.cantidad;
    document.getElementById("modPrecioUnitarioVenta").value = venta.precioUnitario;
    document.getElementById("modUsoPromocionVenta").value = venta.usoPromocion;
    document.getElementById("modDescuentoVenta").value = venta.descuento;
    document.getElementById("modTotalVenta").value = venta.total;
    document.getElementById("modFechaVenta").value = venta.fecha;
    document.getElementById("modMetodoPagoVenta").value = venta.metodoPago;
    document.getElementById("modEstadoVenta").value = venta.estado;

    botonesVentas.classList.add("hidden");
    busquedaVentas.classList.add("hidden");
    formularioModificarVenta.classList.remove("hidden");
  }
});

// Guardar cambios en modificación
formularioModificarVenta.addEventListener("submit", (e) => {
  e.preventDefault();
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const index = ventas.findIndex(v => v.boletaFactura === boletaModificarVenta);
  if (index === -1) return;

  const cantidad = parseInt(document.getElementById("modCantidadVenta").value.trim());
  const precioUnitario = parseFloat(document.getElementById("modPrecioUnitarioVenta").value.trim());
  const descuento = parseFloat(document.getElementById("modDescuentoVenta").value.trim()) || 0;
  const total = (cantidad * precioUnitario) * (1 - descuento / 100);

  ventas[index] = {
    ...ventas[index],
    rutCliente: document.getElementById("modRutClienteVenta").value.trim(),
    sku: document.getElementById("modSKUVenta").value.trim(),
    cantidad,
    precioUnitario,
    usoPromocion: document.getElementById("modUsoPromocionVenta").value.trim(),
    descuento,
    total,
    fecha: document.getElementById("modFechaVenta").value.trim(),
    metodoPago: document.getElementById("modMetodoPagoVenta").value.trim(),
    estado: document.getElementById("modEstadoVenta").value.trim()
  };

  localStorage.setItem("ventas", JSON.stringify(ventas));
  formularioModificarVenta.classList.add("hidden");
  botonesVentas.classList.remove("hidden");
  if (mostrandoBusquedaVentas) {
    busquedaVentas.classList.remove("hidden");
    renderizarVentas();
  }
});

// Regresar desde modificación
btnRegresarModVenta.addEventListener("click", () => {
  formularioModificarVenta.classList.add("hidden");
  botonesVentas.classList.remove("hidden");
  if (mostrandoBusquedaVentas) {
    busquedaVentas.classList.remove("hidden");
    renderizarVentas();
  }
});

// Función para cargar SKUs desde Inventario
function cargarSKUEnFormulario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const selectSKU = document.getElementById("ventaSKU");
  const selectModSKU = document.getElementById("modSKUVenta");
  if (!selectSKU || !selectModSKU) return;

  selectSKU.innerHTML = '<option value="">Seleccione producto (SKU)</option>' +
    inventario.map(r => `<option value="${r.sku}">${r.sku}</option>`).join('');

  selectModSKU.innerHTML = '<option value="">Seleccione producto (SKU)</option>' +
    inventario.map(r => `<option value="${r.sku}">${r.sku}</option>`).join('');
}
