const API_BASE = '';
const c = JSON.parse(localStorage.getItem('cliente') || 'null');
if (!c) window.location.href = './index.html';

const elInfo = document.querySelector('#cliente-info');
elInfo.innerHTML = `<strong>Cliente:</strong> ${c.nombre} (${c.email})<br><small>Tel: ${c.telefono}</small>`;

async function cargar() {
  const res = await fetch(`${API_BASE}/ordenes/${c.id}`);
  const data = await res.json();
  const ul = document.querySelector('#lista');
  ul.innerHTML = '';
  data.forEach(o => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div><strong>#${o.id}</strong> - ${o.platillo_nombre} <span class="badge">${o.estado}</span></div>
        ${o.notes ? `<div><small>${o.notes}</small></div>` : ''}
      </div>
    `;
    const btn = document.createElement('button');
    btn.className = 'advance';
    btn.textContent = avanzarTexto(o.estado);
    btn.disabled = o.estado === 'delivered';
    btn.onclick = async () => {
      const r = await fetch(`${API_BASE}/ordenes/${o.id}/estado`, { method: 'PUT' });
      const d = await r.json();
      if (!r.ok) return alert(d.error || 'Error');
      cargar();
    };
    li.appendChild(btn);
    document.querySelector('#lista').appendChild(li);
  });
}

function avanzarTexto(estado) {
  if (estado === 'pending') return '→ preparing';
  if (estado === 'preparing') return '→ delivered';
  return '✓ completado';
}

document.querySelector('#form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    platillo_nombre: document.querySelector('#platillo').value.trim(),
    notes: document.querySelector('#notes').value.trim()
  };
  const res = await fetch(`${API_BASE}/ordenes/${c.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) return alert(data.error || 'Error creando pedido');
  e.target.reset();
  cargar();
});

cargar();
