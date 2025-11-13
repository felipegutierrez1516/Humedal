document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const rut = document.getElementById('rut').value.trim();
    const cargo = document.getElementById('cargo').value;
    const contraseña = document.getElementById('contraseña').value;

    if (!nombre || !apellido || !correo || !rut || !cargo || !contraseña) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (usuarios.some(u => u.correo === correo)) {
      alert('Este correo ya está registrado');
      return;
    }

    const nuevoUsuario = { nombre, apellido, correo, rut, cargo, contraseña };
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));

    form.style.display = 'none';
    successMessage.classList.add('show');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  });
});