// Login & Registro
const API_BASE = ''; // mismo origen
const q = s => document.querySelector(s);

q('#form-registro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    nombre: q('#reg-nombre').value.trim(),
    email: q('#reg-email').value.trim(),
    telefono: q('#reg-telefono').value.trim(),
  };
  const res = await fetch(`${API_BASE}/clientes/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) return alert(data.error || 'Error registrando');
  alert('Registrado. Ahora puedes iniciar sesión.');
});

q('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    email: q('#login-email').value.trim(),
    telefono: q('#login-telefono').value.trim(),
  };
  const res = await fetch(`${API_BASE}/clientes/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) return alert(data.error || 'Login inválido');
  // guardar sesión simple en localStorage
  localStorage.setItem('cliente', JSON.stringify(data));
  window.location.href = './pedidos.html';
});
