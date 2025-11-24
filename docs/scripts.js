// helpers
function toastTemporary(btn, text = "Copiado") {
  btn.classList.add('copied');
  const old = btn.innerText;
  btn.innerText = text;
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerText = old;
  }, 1200);
}

// Copiar código al portapapeles (maneja compatibilidad)
function copiarCodigo(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toastTemporary(btn, "Copiado ✅");
    }).catch(() => {
      // fallback
      fallbackCopy(text, btn);
    });
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    toastTemporary(btn, "Copiado ✅");
  } catch (e) {
    alert("No se pudo copiar automáticamente. Selecciona y copia manualmente.");
  }
  textarea.remove();
}

// asignar eventos a botones existentes
function setupCopyButtons(root = document) {
  root.querySelectorAll('.copy-btn').forEach(btn => {
    // evitar múltiples listeners
    if (btn.dataset.hooked) return;
    btn.dataset.hooked = '1';
    btn.addEventListener('click', () => {
      const codeEl = btn.closest('.script-card').querySelector('pre code');
      if (!codeEl) return;
      copiarCodigo(codeEl.innerText.trim(), btn);
    });
  });
}

// filtros por categoría
function setupFilters() {
  const filters = document.querySelectorAll('nav.filters button');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll('.script-card');
      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          card.style.display = (card.dataset.category === filter) ? '' : 'none';
        }
      });
    });
  });
}

// agregar nuevo script desde el formulario
function setupAddScriptForm() {
  const form = document.getElementById('add-script-form');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const category = document.getElementById('new-category').value;
    const code = document.getElementById('new-code').value.trim();
    const desc = document.getElementById('new-desc').value.trim();

    if (!title || !code) {
      alert('Completa al menos título y código.');
      return;
    }

    const card = document.createElement('article');
    card.className = 'script-card';
    card.setAttribute('data-category', category);

    card.innerHTML = `
      <h2>${escapeHtml(title)}</h2>
      <pre><code>${escapeHtml(code)}</code></pre>
      <p>${escapeHtml(desc)}</p>
      <div class="actions"><button class="copy-btn">Copiar</button></div>
    `;

    document.getElementById('scripts-list').prepend(card);

    // limpiar formulario
    form.reset();

    // volver a inicializar listeners para el nuevo nodo
    setupCopyButtons(card);
  });
}

// simple escapado para evitar problemas cuando el usuario escribe caracteres especiales
function escapeHtml(str) {
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// init
document.addEventListener('DOMContentLoaded', () => {
  setupCopyButtons();
  setupFilters();
  setupAddScriptForm();
});

