// Simulación de login
const user = JSON.parse(localStorage.getItem("usuarioActivo"));
if (user && user.cargo !== "gerente") {
  document.getElementById("panelControl").style.display = "none";
}

document.querySelectorAll("nav ul li").forEach(item => {
  item.addEventListener("click", () => {
    document.getElementById("moduloActual").innerText = `Estás en el módulo: ${item.innerText}`;
  });
});