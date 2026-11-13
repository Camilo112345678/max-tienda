// MAX TIENDA - catálogo de productos
// Todo está hecho con JavaScript normal (sin librerías)

// ---------- Datos ----------
var productos = [
  { id: 1,  nombre: "Chaqueta de mezclilla", categoria: "Ropa",       precio: 85000,   emoji: "🧥", imagen: "img/chaqueta.jpg" },
  { id: 2,  nombre: "Tenis deportivos",      categoria: "Ropa",       precio: 160000,  emoji: "👟", imagen: "img/tenis.jpg" },
  { id: 3,  nombre: "Gafas de sol",          categoria: "Ropa",       precio: 48000,   emoji: "🕶️", imagen: "img/gafas.jpg" },
  { id: 4,  nombre: "Audífonos",             categoria: "Tecnología", precio: 230000,  emoji: "🎧", imagen: "img/audifonos.jpg" },
  { id: 5,  nombre: "Teclado mecánico",      categoria: "Tecnología", precio: 310000,  emoji: "⌨️", imagen: "img/teclado.jpg" },
  { id: 6,  nombre: "Portátil 14 pulgadas",  categoria: "Tecnología", precio: 1450000, emoji: "💻", imagen: "img/portatil.jpg" },
  { id: 7,  nombre: "Cámara instantánea",    categoria: "Tecnología", precio: 380000,  emoji: "📷", imagen: "img/camara.jpg" },
  { id: 8,  nombre: "Planta monstera",       categoria: "Hogar",      precio: 38000,   emoji: "🪴", imagen: "img/planta.jpg" },
  { id: 9,  nombre: "Lámpara de mesa",       categoria: "Hogar",      precio: 120000,  emoji: "💡", imagen: "img/lampara.jpg" },
  { id: 10, nombre: "Set de tazas",          categoria: "Hogar",      precio: 69000,   emoji: "☕", imagen: "img/tazas.jpg" },
  { id: 11, nombre: "Balón de fútbol",       categoria: "Deportes",   precio: 89000,   emoji: "⚽", imagen: "img/balon.jpg" },
  { id: 12, nombre: "Mat de yoga",           categoria: "Deportes",   precio: 54000,   emoji: "🧘", imagen: "img/yoga.jpg" },
  { id: 13, nombre: "Novela de ciencia ficción", categoria: "Libros", precio: 32000,   emoji: "📘", imagen: "img/novela.jpg" },
  { id: 14, nombre: "Libro de cocina",       categoria: "Libros",     precio: 58000,   emoji: "📖", imagen: "img/libro-cocina.jpg" }
];

// El carrito guarda objetos así: { id: 1, cantidad: 2 }
var carrito = [];

// Si ya había un carrito guardado en el navegador, lo cargamos
try {
  var guardado = localStorage.getItem("maxtienda_carrito");
  if (guardado) {
    carrito = JSON.parse(guardado);
  }
} catch (e) {}

// Los productos base son de la tienda y tienen 10 unidades
for (var n = 0; n < productos.length; n++) {
  productos[n].vendedor = "MAX TIENDA";
  productos[n].dueno = "";
  productos[n].stock = 10;
}

// Copia de la lista original (sirve para recuperar las fotos de los productos base)
var productosBase = productos;

// Si los vendedores ya publicaron productos, usamos la lista guardada
try {
  var prodGuardados = localStorage.getItem("maxtienda_productos");
  if (prodGuardados) {
    productos = JSON.parse(prodGuardados);
    for (var a = 0; a < productos.length; a++) {
      if (!productos[a].imagen) {
        for (var b = 0; b < productosBase.length; b++) {
          if (productosBase[b].id == productos[a].id) {
            productos[a].imagen = productosBase[b].imagen;
          }
        }
      }
    }
  }
} catch (e) {}

// ---------- Elementos del HTML ----------
var contenedor = document.getElementById("productos");
var buscador = document.getElementById("buscador");
var selectCategoria = document.getElementById("categoria");
var inputPrecio = document.getElementById("precioMax");
var selectOrden = document.getElementById("orden");
var textoResultados = document.getElementById("resultados");

// ---------- Funciones ----------

// Pone el precio con puntos y el signo $
function formatearPrecio(numero) {
  return "$" + numero.toLocaleString("es-CO");
}

// Convierte un texto en algo seguro para meterlo en el HTML
function escapar(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Llena el select de categorías (y la lista del panel) sin repetirlas
function cargarCategorias() {
  var elegida = selectCategoria.value;
  var categorias = [];
  for (var i = 0; i < productos.length; i++) {
    if (categorias.indexOf(productos[i].categoria) == -1) {
      categorias.push(productos[i].categoria);
    }
  }
  selectCategoria.innerHTML = '<option value="Todas">Todas las categorías</option>';
  var lista = "";
  for (var j = 0; j < categorias.length; j++) {
    var opcion = document.createElement("option");
    opcion.value = categorias[j];
    opcion.textContent = categorias[j];
    selectCategoria.appendChild(opcion);
    lista += '<option value="' + escapar(categorias[j]) + '">';
  }
  document.getElementById("listaCategorias").innerHTML = lista;
  if (categorias.indexOf(elegida) != -1) {
    selectCategoria.value = elegida;
  }
}

// Devuelve los productos filtrados y ordenados (modo local, sin servidor)
function filtrarLocal() {
  var texto = buscador.value.toLowerCase();
  var categoria = selectCategoria.value;
  var precioMax = Number(inputPrecio.value);
  var lista = [];

  // 1. Filtrar
  for (var i = 0; i < productos.length; i++) {
    var p = productos[i];
    var cumpleTexto = (p.nombre + " " + (p.descripcion || "")).toLowerCase().indexOf(texto) != -1;
    var cumpleCategoria = (categoria == "Todas" || p.categoria == categoria);
    var cumplePrecio = (precioMax == 0 || p.precio <= precioMax);

    if (cumpleTexto && cumpleCategoria && cumplePrecio) {
      lista.push(p);
    }
  }

  // 2. Ordenar
  if (selectOrden.value == "menor") {
    lista.sort(function (a, b) { return a.precio - b.precio; });
  } else if (selectOrden.value == "mayor") {
    lista.sort(function (a, b) { return b.precio - a.precio; });
  } else if (selectOrden.value == "nombre") {
    lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  }

  return lista;
}

// Dibuja las tarjetas de la lista que le pasemos
function dibujarProductos(lista) {
  var html = "";
  for (var k = 0; k < lista.length; k++) {
    var prod = lista[k];
    html += '<div class="tarjeta">';
    html += '  <div class="imagen">' + htmlFoto(prod) + '</div>';
    html += '  <h3>' + escapar(prod.nombre) + '</h3>';
    html += '  <p class="categoria">' + escapar(prod.categoria) + ' · Vende ' + escapar(prod.vendedor) + '</p>';
    if (prod.descripcion) {
      html += '  <p class="descripcion">' + escapar(prod.descripcion) + '</p>';
    }
    html += '  <p class="precio">' + formatearPrecio(prod.precio) + '</p>';
    if (prod.stock > 0) {
      html += '  <p class="stock">Quedan ' + prod.stock + '</p>';
      html += '  <button onclick="agregarAlCarrito(\'' + prod.id + '\')">Agregar al carrito</button>';
    } else {
      html += '  <p class="stock agotado">Agotado</p>';
      html += '  <button disabled>Agotado</button>';
    }
    html += '</div>';
  }

  if (lista.length == 0) {
    html = "<p>No se encontraron productos 😢</p>";
  }

  contenedor.innerHTML = html;
  textoResultados.textContent = "Mostrando " + lista.length + " productos";
}

// ---------- Conexión con el servidor (API del catálogo) ----------
// Si config.js tiene API_URL, los productos vienen del servidor
var modoApi = (typeof API_URL == "string" && API_URL != "");
var temporizador = null;
var numeroPedido = 0;
var emojisCategoria = { "Ropa": "👕", "Tecnología": "💻", "Hogar": "🏠", "Deportes": "⚽", "Libros": "📚", "Arte": "🎨" };

// Esta función la llaman la búsqueda y los filtros
function mostrarProductos() {
  if (!modoApi) {
    dibujarProductos(filtrarLocal());
    return;
  }
  // Con servidor esperamos un momento por si la persona sigue escribiendo
  clearTimeout(temporizador);
  temporizador = setTimeout(pedirAlServidor, 300);
}

// Convierte un producto de la API al formato que usa la página
function convertirProducto(item) {
  return {
    id: item.id,
    nombre: item.nombre,
    categoria: item.categoria,
    precio: Number(item.precio),
    emoji: emojisCategoria[item.categoria] || "🛍️",
    imagen: item.imagen_url || "",
    vendedor: item.nombre_vendedor || "Vendedor",
    dueno: "",
    stock: item.stock,
    descripcion: item.descripcion || ""
  };
}

// Guarda el producto en la lista general (el carrito la necesita)
function guardarEnLista(p) {
  for (var i = 0; i < productos.length; i++) {
    if (productos[i].id == p.id) {
      productos[i] = p;
      return;
    }
  }
  productos.push(p);
}

// Pide los productos al servidor con la búsqueda y los filtros actuales
function pedirAlServidor() {
  var partes = [];
  var texto = buscador.value.trim();
  var precioMax = Number(inputPrecio.value);
  var ordenes = { normal: "recent", menor: "price_asc", mayor: "price_desc", nombre: "name_asc" };

  if (texto != "") {
    partes.push("buscar=" + encodeURIComponent(texto));
  }
  if (selectCategoria.value != "Todas") {
    partes.push("categoria=" + encodeURIComponent(selectCategoria.value));
  }
  if (precioMax > 0) {
    partes.push("precio_max=" + precioMax);
  }
  partes.push("orden=" + ordenes[selectOrden.value]);

  numeroPedido++;
  var miPedido = numeroPedido;
  if (productos.length == 0) {
    contenedor.innerHTML = "<p>Cargando productos... (si el servidor estaba dormido puede tardar hasta un minuto)</p>";
  }

  fetch(API_URL + "/catalogo?" + partes.join("&"))
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("Error " + respuesta.status);
      }
      return respuesta.json();
    })
    .then(function (datos) {
      if (miPedido != numeroPedido) {
        return; // llegó una respuesta vieja, la ignoramos
      }
      var lista = [];
      for (var i = 0; i < datos.length; i++) {
        var p = convertirProducto(datos[i]);
        lista.push(p);
        guardarEnLista(p);
      }
      cargarCategorias();
      mostrarCarrito();
      dibujarProductos(lista);
    })
    .catch(function () {
      if (miPedido != numeroPedido) {
        return;
      }
      contenedor.innerHTML = "<p>No se pudo conectar con el servidor 😢 Revisa API_URL en config.js</p>";
      textoResultados.textContent = "";
    });
}

// Busca un producto por su id
function buscarProducto(id) {
  for (var i = 0; i < productos.length; i++) {
    if (productos[i].id == id) {
      return productos[i];
    }
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem("maxtienda_carrito", JSON.stringify(carrito));
  } catch (e) {}
}

function guardarProductos() {
  try {
    localStorage.setItem("maxtienda_productos", JSON.stringify(productos));
    return true;
  } catch (e) {
    return false; // por ejemplo, si ya no hay espacio en el navegador
  }
}

// Muestra un mensaje corto abajo de la pantalla
function avisar(texto) {
  var aviso = document.getElementById("aviso");
  aviso.textContent = texto;
  aviso.classList.remove("oculto");
  setTimeout(function () {
    aviso.classList.add("oculto");
  }, 2500);
}

function agregarAlCarrito(id) {
  var p = buscarProducto(id);
  if (!p) {
    return;
  }
  // Si ya está en el carrito, solo sumamos 1 (sin pasarnos del stock)
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id == id) {
      if (carrito[i].cantidad >= p.stock) {
        avisar("No hay más unidades de " + p.nombre);
        return;
      }
      carrito[i].cantidad++;
      guardarCarrito();
      mostrarCarrito();
      avisar("Agregado al carrito 🛒");
      return;
    }
  }
  // Si no estaba, lo agregamos
  carrito.push({ id: id, cantidad: 1 });
  guardarCarrito();
  mostrarCarrito();
  avisar("Agregado al carrito 🛒");
}

function cambiarCantidad(id, cambio) {
  var p = buscarProducto(id);
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id == id) {
      if (cambio > 0 && p && carrito[i].cantidad >= p.stock) {
        avisar("No hay más unidades de " + p.nombre);
        return;
      }
      carrito[i].cantidad += cambio;
      if (carrito[i].cantidad <= 0) {
        carrito.splice(i, 1); // lo quitamos del carrito
      }
      break;
    }
  }
  guardarCarrito();
  mostrarCarrito();
}

function mostrarCarrito() {
  // Quitamos del carrito lo que ya no existe o se agotó
  var limpio = [];
  for (var k = 0; k < carrito.length; k++) {
    var prod = buscarProducto(carrito[k].id);
    if (prod && prod.stock > 0) {
      if (carrito[k].cantidad > prod.stock) {
        carrito[k].cantidad = prod.stock;
      }
      limpio.push(carrito[k]);
    }
  }
  carrito = limpio;
  guardarCarrito();

  var html = "";
  var total = 0;
  var cantidadTotal = 0;

  for (var i = 0; i < carrito.length; i++) {
    var p = buscarProducto(carrito[i].id);
    var subtotal = p.precio * carrito[i].cantidad;
    total += subtotal;
    cantidadTotal += carrito[i].cantidad;

    html += '<div class="item">';
    html += '  <b>' + escapar(p.emoji) + ' ' + escapar(p.nombre) + '</b><br>';
    html += '  <button onclick="cambiarCantidad(\'' + p.id + '\', -1)">-</button> ';
    html += carrito[i].cantidad;
    html += ' <button onclick="cambiarCantidad(\'' + p.id + '\', 1)">+</button> ';
    html += formatearPrecio(subtotal);
    html += '</div>';
  }

  if (carrito.length == 0) {
    html = "<p>El carrito está vacío</p>";
  }

  document.getElementById("listaCarrito").innerHTML = html;
  document.getElementById("total").textContent = "Total: " + formatearPrecio(total);
  document.getElementById("contador").textContent = cantidadTotal;
}

// ---------- Usuarios y sesión ----------
// OJO: esto es solo para practicar. Los usuarios se guardan en el navegador
// y la contraseña no está cifrada. Una tienda real necesita un servidor.
var usuarios = [];
var sesion = null; // aquí va el correo del usuario que inició sesión
var modoRegistro = false;

try {
  usuarios = JSON.parse(localStorage.getItem("maxtienda_usuarios")) || [];
  sesion = localStorage.getItem("maxtienda_sesion");
} catch (e) {}

function guardarSesion() {
  try {
    localStorage.setItem("maxtienda_usuarios", JSON.stringify(usuarios));
    if (sesion) {
      localStorage.setItem("maxtienda_sesion", sesion);
    } else {
      localStorage.removeItem("maxtienda_sesion");
    }
  } catch (e) {}
}

function buscarUsuario(correo) {
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo == correo) {
      return usuarios[i];
    }
  }
  return null;
}

function abrirLogin() {
  document.getElementById("login").classList.remove("oculto");
  document.getElementById("mensajeLogin").textContent = "";
}

function cambiarModo() {
  modoRegistro = !modoRegistro;
  document.getElementById("lNombre").classList.toggle("oculto", !modoRegistro);
  document.getElementById("tituloLogin").textContent = modoRegistro ? "Crear cuenta de vendedor" : "Iniciar sesión";
  document.getElementById("btnEntrar").textContent = modoRegistro ? "Registrarme" : "Entrar";
  document.getElementById("cambiarModo").textContent = modoRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate";
  document.getElementById("mensajeLogin").textContent = "";
}

function entrar() {
  var nombre = document.getElementById("lNombre").value.trim();
  var correo = document.getElementById("lCorreo").value.trim().toLowerCase();
  var clave = document.getElementById("lClave").value;
  var mensaje = document.getElementById("mensajeLogin");

  if (correo == "" || clave.length < 4) {
    mensaje.textContent = "Escribe tu correo y una contraseña de mínimo 4 caracteres";
    return;
  }

  if (modoRegistro) {
    if (nombre == "") {
      mensaje.textContent = "Escribe tu nombre o el de tu tienda";
      return;
    }
    if (buscarUsuario(correo)) {
      mensaje.textContent = "Ese correo ya está registrado";
      return;
    }
    usuarios.push({ nombre: nombre, correo: correo, clave: clave });
  } else {
    var u = buscarUsuario(correo);
    if (!u || u.clave != clave) {
      mensaje.textContent = "Correo o contraseña incorrectos";
      return;
    }
  }

  sesion = correo;
  guardarSesion();
  document.getElementById("login").classList.add("oculto");
  document.getElementById("lClave").value = "";
  actualizarSesion();
  document.getElementById("panel").classList.remove("oculto");
  avisar("Bienvenido, " + buscarUsuario(correo).nombre + " 👋");
}

function salir() {
  sesion = null;
  guardarSesion();
  actualizarSesion();
}

// Muestra u oculta los botones según haya sesión o no
function actualizarSesion() {
  var u = buscarUsuario(sesion);
  if (!u) {
    sesion = null;
  }
  var hay = (sesion != null);
  document.getElementById("btnLogin").classList.toggle("oculto", hay);
  document.getElementById("saludo").classList.toggle("oculto", !hay);
  document.getElementById("btnPanel").classList.toggle("oculto", !hay);
  document.getElementById("btnSalir").classList.toggle("oculto", !hay);
  if (hay) {
    document.getElementById("saludo").textContent = "Hola, " + u.nombre;
    mostrarPanel();
  } else {
    document.getElementById("panel").classList.add("oculto");
  }
}

// ---------- Fotos de los productos ----------
var fotoNueva = ""; // foto elegida en el formulario (se guarda como texto)

// Devuelve el emoji y, encima, la foto (si la foto no carga, se ve el emoji)
function htmlFoto(p) {
  var h = escapar(p.emoji);
  if (p.imagen) {
    h += '<img src="' + escapar(p.imagen) + '" alt="' + escapar(p.nombre) + '" loading="lazy" onerror="this.remove()">';
  }
  return h;
}

// Lee una foto del celular o del PC, la achica a 500px y la convierte en texto
function leerFoto(archivo, cuandoTermine) {
  if (!archivo) {
    return;
  }
  var lector = new FileReader();
  lector.onload = function () {
    var img = new Image();
    img.onload = function () {
      var escala = Math.min(1, 500 / Math.max(img.width, img.height));
      var canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      cuandoTermine(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = function () {
      avisar("No se pudo leer esa imagen");
    };
    img.src = lector.result;
  };
  lector.readAsDataURL(archivo);
}

// Cambia la foto de un producto que ya estaba publicado
function cambiarFoto(id, input) {
  leerFoto(input.files[0], function (foto) {
    var p = buscarProducto(id);
    var vieja = p.imagen;
    p.imagen = foto;
    if (!guardarProductos()) {
      p.imagen = vieja;
      avisar("No hay espacio para guardar. Prueba con una foto más pequeña");
      return;
    }
    mostrarProductos();
    mostrarPanel();
    avisar("Foto actualizada ✅");
  });
}

// ---------- Panel del vendedor ----------
function mostrarPanel() {
  var html = "";
  var cuantos = 0;
  for (var i = 0; i < productos.length; i++) {
    var p = productos[i];
    if (p.dueno != sesion) {
      continue;
    }
    cuantos++;
    html += '<div class="fila-prod">';
    html += '  <div class="mini">' + htmlFoto(p) + '</div>';
    html += '  <div class="campo grande"><small>Nombre</small><input type="text" id="nom' + p.id + '" value="' + escapar(p.nombre) + '"></div>';
    html += '  <div class="campo"><small>Precio</small><input type="number" min="0" id="pre' + p.id + '" value="' + p.precio + '"></div>';
    html += '  <div class="campo"><small>Cantidad</small><input type="number" min="0" id="sto' + p.id + '" value="' + p.stock + '"></div>';
    html += '  <label class="boton-foto">📷 Foto<input type="file" accept="image/*" hidden onchange="cambiarFoto(' + p.id + ', this)"></label>';
    html += '  <button onclick="guardarCambios(' + p.id + ')">Guardar</button>';
    html += '  <button class="rojo" onclick="eliminarProducto(' + p.id + ')">Eliminar</button>';
    html += '</div>';
  }
  if (cuantos == 0) {
    html = "<p>Todavía no has publicado productos.</p>";
  }
  document.getElementById("misProductos").innerHTML = html;
}

function publicarProducto() {
  var nombre = document.getElementById("pNombre").value.trim();
  var categoria = document.getElementById("pCategoria").value.trim();
  var precio = Number(document.getElementById("pPrecio").value);
  var stock = Math.floor(Number(document.getElementById("pStock").value));
  var emoji = document.getElementById("pEmoji").value.trim();

  if (nombre == "" || categoria == "" || !(precio > 0) || !(stock >= 1)) {
    avisar("Completa nombre, categoría, precio y cantidad (mínimo 1)");
    return;
  }
  if (emoji == "") {
    emoji = "🎁";
  }

  var u = buscarUsuario(sesion);
  productos.push({
    id: Date.now(),
    nombre: nombre,
    categoria: categoria,
    precio: precio,
    emoji: emoji,
    vendedor: u.nombre,
    dueno: sesion,
    stock: stock,
    imagen: fotoNueva
  });
  if (!guardarProductos()) {
    productos.pop();
    avisar("No hay espacio para guardar. Prueba con una foto más pequeña");
    return;
  }

  document.getElementById("pNombre").value = "";
  document.getElementById("pCategoria").value = "";
  document.getElementById("pPrecio").value = "";
  document.getElementById("pStock").value = "";
  document.getElementById("pEmoji").value = "";
  document.getElementById("pFoto").value = "";
  document.getElementById("pVista").classList.add("oculto");
  fotoNueva = "";

  cargarCategorias();
  mostrarProductos();
  mostrarPanel();
  avisar("Producto publicado ✅");
}

function guardarCambios(id) {
  var p = buscarProducto(id);
  var nombre = document.getElementById("nom" + id).value.trim();
  var precio = Number(document.getElementById("pre" + id).value);
  var stock = Math.floor(Number(document.getElementById("sto" + id).value));

  if (nombre == "" || !(precio > 0) || !(stock >= 0)) {
    avisar("Revisa el nombre, el precio y la cantidad");
    return;
  }

  p.nombre = nombre;
  p.precio = precio;
  p.stock = stock;
  guardarProductos();
  mostrarProductos();
  mostrarCarrito();
  avisar("Cambios guardados ✅");
}

function eliminarProducto(id) {
  var nuevos = [];
  for (var i = 0; i < productos.length; i++) {
    if (productos[i].id != id) {
      nuevos.push(productos[i]);
    }
  }
  productos = nuevos;
  guardarProductos();
  cargarCategorias();
  mostrarProductos();
  mostrarCarrito();
  mostrarPanel();
  avisar("Producto eliminado");
}

// ---------- Eventos ----------
buscador.addEventListener("input", mostrarProductos);
selectCategoria.addEventListener("change", mostrarProductos);
inputPrecio.addEventListener("input", mostrarProductos);
selectOrden.addEventListener("change", mostrarProductos);

document.getElementById("btnLimpiar").addEventListener("click", function () {
  buscador.value = "";
  selectCategoria.value = "Todas";
  inputPrecio.value = "";
  selectOrden.value = "normal";
  mostrarProductos();
});

document.getElementById("btnCarrito").addEventListener("click", function () {
  document.getElementById("carrito").classList.remove("oculto");
});

document.getElementById("btnCerrar").addEventListener("click", function () {
  document.getElementById("carrito").classList.add("oculto");
});

document.getElementById("btnVaciar").addEventListener("click", function () {
  carrito = [];
  guardarCarrito();
  mostrarCarrito();
});

document.getElementById("btnLogin").addEventListener("click", abrirLogin);
document.getElementById("btnCancelarLogin").addEventListener("click", function () {
  document.getElementById("login").classList.add("oculto");
});
document.getElementById("cambiarModo").addEventListener("click", cambiarModo);
document.getElementById("btnEntrar").addEventListener("click", entrar);
document.getElementById("btnSalir").addEventListener("click", salir);
document.getElementById("btnPanel").addEventListener("click", function () {
  document.getElementById("panel").classList.toggle("oculto");
});
document.getElementById("btnCerrarPanel").addEventListener("click", function () {
  document.getElementById("panel").classList.add("oculto");
});
document.getElementById("btnPublicar").addEventListener("click", publicarProducto);
document.getElementById("pFoto").addEventListener("change", function () {
  leerFoto(this.files[0], function (foto) {
    fotoNueva = foto;
    var vista = document.getElementById("pVista");
    vista.src = foto;
    vista.classList.remove("oculto");
  });
});

// ---------- Iniciar la página ----------
if (modoApi) {
  // Con servidor, los productos los publica el módulo de vendedores (Equipo 4),
  // así que aquí se oculta el botón de vendedor
  productos = [];
  document.getElementById("btnLogin").classList.add("oculto");
  pedirAlServidor();
} else {
  cargarCategorias();
  mostrarProductos();
  mostrarCarrito();
  actualizarSesion();
  // Al recargar con la sesión iniciada el panel queda cerrado (se abre con "Mi panel")
  document.getElementById("panel").classList.add("oculto");
}
