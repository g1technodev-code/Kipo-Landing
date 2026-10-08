(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = n => '$ ' + n.toLocaleString('es-AR');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Change the call-to-action label everywhere: 'Pedir una demo' | 'Probar gratis' | 'Hablar por WhatsApp'
  const CTA_LABEL = 'Pedir una demo';
  document.querySelectorAll('[data-cta]').forEach(el => { el.textContent = CTA_LABEL; });

  /* ---------- Header ---------- */
  const hdr = $('#hdr');
  const heroPanel = $('#heroPanel');
  let raf = 0;
  const scrollFx = () => {
    const y = scrollY;
    hdr.classList.toggle('scrolled', y > 30);
    if (heroPanel && !reduceMotion) {
      const p = Math.min(Math.max(y / 650, 0), 1);
      heroPanel.style.transform = `perspective(1200px) rotateX(${(p * 16).toFixed(2)}deg) rotateY(${(-p * 6).toFixed(2)}deg) scale(${(1 - p * .14).toFixed(3)}) translateY(${(p * 50).toFixed(1)}px)`;
      heroPanel.style.opacity = (1 - p * .35).toFixed(3);
    }
  };
  const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; scrollFx(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  scrollFx();

  /* ---------- Hero live inventory ---------- */
  const HERO = [
    { name: 'Yerba 1kg', sku: '7790387 000124', price: 4200 },
    { name: 'Aceite girasol 1,5L', sku: '7790070 318209', price: 2950 },
    { name: 'Café molido 500g', sku: '7790150 045501', price: 6800 },
    { name: 'Galletitas surtidas', sku: '7790040 931708', price: 1450 },
    { name: 'Detergente 750ml', sku: '7791290 011927', price: 1900 },
  ];
  const hero = { stock: [3, 18, 9, 42, 2], flash: -1, value: 4812300, sales: 31 };
  const heroRowsEl = $('#heroRows');
  heroRowsEl.innerHTML = HERO.map(p => `
    <div class="inv-row">
      <div class="inv-name"><b>${esc(p.name)}</b><span class="sku">${esc(p.sku)}</span></div>
      <span class="inv-price">${fmt(p.price).replace('$ ', '$')}</span>
      <span class="stock-pill"></span>
    </div>`).join('');
  const heroRowEls = [...heroRowsEl.children];
  const alertEl = $('#heroAlert');
  let alertTimer, flashTimer;

  const renderHero = () => {
    heroRowEls.forEach((row, i) => {
      const q = hero.stock[i];
      const pill = row.querySelector('.stock-pill');
      pill.textContent = q + ' u.';
      pill.className = 'stock-pill ' + (q <= 3 ? 'lvl-low' : q <= 10 ? 'lvl-mid' : 'lvl-ok');
      row.classList.toggle('flash', hero.flash === i);
    });
    $('#heroValue').textContent = '$' + (hero.value / 1e6).toFixed(2).replace('.', ',') + 'M';
    $('#heroLow').textContent = 4 + hero.stock.filter(q => q <= 3).length;
    $('#heroSales').textContent = hero.sales;
  };
  const showAlert = (t, s, ms) => {
    $('#alertT').textContent = t;
    $('#alertS').textContent = s;
    alertEl.classList.add('on');
    clearTimeout(alertTimer);
    alertTimer = setTimeout(() => alertEl.classList.remove('on'), ms);
  };
  const heroTick = () => {
    if (document.hidden) return;
    const i = Math.floor(Math.random() * HERO.length);
    hero.stock[i] -= 1;
    if (hero.stock[i] <= 0) {
      hero.stock[i] = 20 + Math.floor(Math.random() * 20);
      showAlert(`Reposición: +${hero.stock[i]} de ${HERO[i].name}`, 'Cargado desde el remito del proveedor', 3200);
    } else if (hero.stock[i] <= 3) {
      showAlert(`Quedan ${hero.stock[i]} de ${HERO[i].name}`, `En Sucursal Norte hay ${12 + i * 4}`, 3200);
    }
    hero.flash = i;
    hero.value -= HERO[i].price;
    hero.sales += 1;
    renderHero();
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { hero.flash = -1; renderHero(); }, 700);
  };
  renderHero();
  showAlert('Quedan 3 de Yerba 1kg', 'En Sucursal Norte hay 20', 3500);
  setInterval(heroTick, 2200);

  /* ---------- Features ---------- */
  const FEATURES = [
    { n: '01', t: 'Control de stock', d: 'Cada venta y cada compra actualiza las cantidades al instante. Te avisa cuando algo está por agotarse.' },
    { n: '02', t: 'Carga de facturas y remitos', d: 'Ingresá la mercadería del proveedor desde la factura o el remito, sin tipear producto por producto.' },
    { n: '03', t: 'Escaneo de códigos', d: 'Usá la cámara del celular o un lector para buscar, contar y cargar productos por código de barras.' },
    { n: '04', t: 'Multi-sucursal', d: 'Mirá el stock de cada local por separado o todo junto, y mové mercadería entre sucursales.' },
    { n: '05', t: 'Reportes', d: 'Qué se vende más, qué no rota y cuánto vale tu mercadería, a costo y a precio de venta.' },
    { n: '06', t: 'App móvil', d: 'Todo Kipo en el celular: consultá y cargá stock desde el mostrador o el depósito.' },
  ];
  const featuresEl = $('#features');
  featuresEl.innerHTML = FEATURES.map(f => `
    <div class="feature" data-reveal>
      <span class="feature-n">${f.n}</span>
      <h3>${esc(f.t)}</h3>
      <p>${esc(f.d)}</p>
    </div>`).join('');
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    featuresEl.querySelectorAll('.feature').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .12s ease-out, opacity .7s ease, border-color .2s, box-shadow .2s';
        el.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), opacity .7s ease, border-color .2s, box-shadow .2s';
        el.style.transform = 'none';
      });
    });
  }

  /* ---------- Sales demo ---------- */
  const PRODUCTS = [
    { id: 'OFI-004', name: 'Abrochadora industrial', price: 21000 },
    { id: 'ALI-003', name: 'Agua mineral (pack 12u)', price: 9800 },
    { id: 'OFI-002', name: 'Archivador de palanca Oficio', price: 4800 },
    { id: 'ALI-002', name: 'Azúcar paquete 1kg', price: 2100 },
    { id: 'ALI-001', name: 'Café molido gourmet 500g', price: 11200 },
    { id: 'FER-003', name: 'Cinta métrica 5m Stanley', price: 6800 },
  ];
  const STOCK0 = { 'OFI-004': 12, 'ALI-003': 55, 'OFI-002': 3, 'ALI-002': 2, 'ALI-001': 30, 'FER-003': 40 };
  const PAYS = ['Efectivo', 'Transferencia', 'Tarjeta'];
  const demo = { stock: { ...STOCK0 }, cart: {}, pay: 'Efectivo' };
  const productsEl = $('#products');
  const cartItemsEl = $('#cartItems');
  const paysEl = $('#pays');
  const toastEl = $('#toast');
  const confirmEl = $('#confirm');
  const cartTarget = $('#cartTarget');
  let toastTimer;

  productsEl.innerHTML = PRODUCTS.map(p => `
    <button type="button" class="product" data-id="${p.id}">
      <span class="product-top"><span class="product-name">${esc(p.name)}</span><span class="sku">${p.id}</span></span>
      <span class="product-bottom"><span class="product-price">${fmt(p.price)}</span><span class="product-stock"></span></span>
      <span class="product-qty" hidden></span>
    </button>`).join('');
  paysEl.innerHTML = PAYS.map(l => `<button type="button" class="pay-btn" data-pay="${l}">${l}</button>`).join('');

  const hideToast = () => { toastEl.hidden = true; clearTimeout(toastTimer); };
  const setQty = (id, q) => {
    if (q <= 0) delete demo.cart[id];
    else demo.cart[id] = Math.min(q, demo.stock[id]);
    hideToast();
    renderDemo();
  };

  const renderDemo = () => {
    const { stock, cart } = demo;
    productsEl.querySelectorAll('.product').forEach(btn => {
      const id = btn.dataset.id, qty = cart[id] || 0, left = stock[id];
      const avail = left - qty > 0;
      btn.classList.toggle('in-cart', qty > 0);
      btn.classList.toggle('soldout', !avail);
      btn.setAttribute('aria-disabled', String(!avail));
      const pill = btn.querySelector('.product-stock');
      pill.textContent = left === 0 ? 'Sin stock' : 'Stock: ' + left;
      pill.classList.toggle('low', left <= 3);
      const badge = btn.querySelector('.product-qty');
      badge.hidden = !qty;
      badge.textContent = qty;
    });

    const items = PRODUCTS.filter(p => cart[p.id]);
    cartItemsEl.innerHTML = items.map(p => `
      <div class="cart-item">
        <span class="cart-item-name">${esc(p.name)}</span>
        <span class="stepper">
          <button type="button" data-dec="${p.id}" aria-label="Quitar uno">−</button>
          <span>${cart[p.id]}</span>
          <button type="button" data-inc="${p.id}" aria-label="Sumar uno">+</button>
        </span>
        <span class="cart-sub">${fmt(cart[p.id] * p.price)}</span>
      </div>`).join('');

    const units = Object.values(cart).reduce((a, b) => a + b, 0);
    const total = PRODUCTS.reduce((a, p) => a + (cart[p.id] || 0) * p.price, 0);
    $('#cartEmpty').hidden = units > 0;
    $('#cartCount').textContent = units ? units + (units === 1 ? ' producto' : ' productos') : '';
    $('#total').textContent = fmt(total);
    confirmEl.classList.toggle('ready', units > 0);
    paysEl.querySelectorAll('.pay-btn').forEach(b => b.classList.toggle('on', b.dataset.pay === demo.pay));
  };

  const fly = (src, label) => {
    if (reduceMotion || !src.animate) return;
    const a = src.getBoundingClientRect(), b = cartTarget.getBoundingClientRect();
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
    const dx = b.left + b.width / 2 - x0, dy = b.top + b.height / 2 - y0;
    const el = document.createElement('div');
    el.className = 'fly-chip';
    el.textContent = label;
    el.style.left = x0 + 'px';
    el.style.top = y0 + 'px';
    document.body.appendChild(el);
    const T = (x, y, s) => `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${s})`;
    el.animate([
      { transform: T(0, 0, 1), opacity: 1 },
      { transform: T(dx * .5, dy * .5 - 90, .85), opacity: 1, offset: .5 },
      { transform: T(dx, dy, .3), opacity: .3 },
    ], { duration: 650, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => {
      el.remove();
      cartTarget.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', color: '#1e5eff' }, { transform: 'scale(1)' }], { duration: 320 });
    };
  };

  productsEl.addEventListener('click', e => {
    const btn = e.target.closest('.product'); if (!btn) return;
    const id = btn.dataset.id, qty = demo.cart[id] || 0;
    if (demo.stock[id] - qty <= 0) return;
    fly(btn, PRODUCTS.find(p => p.id === id).name);
    setQty(id, qty + 1);
  });
  cartItemsEl.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) setQty(inc.dataset.inc, demo.cart[inc.dataset.inc] + 1);
    if (dec) setQty(dec.dataset.dec, demo.cart[dec.dataset.dec] - 1);
  });
  paysEl.addEventListener('click', e => {
    const b = e.target.closest('[data-pay]'); if (!b) return;
    demo.pay = b.dataset.pay;
    renderDemo();
  });
  confirmEl.addEventListener('click', () => {
    const { cart, stock } = demo;
    const units = Object.values(cart).reduce((a, b) => a + b, 0);
    if (!units) return;
    const total = PRODUCTS.reduce((a, p) => a + (cart[p.id] || 0) * p.price, 0);
    Object.keys(cart).forEach(id => { stock[id] -= cart[id]; });
    const lows = PRODUCTS.filter(p => cart[p.id] && stock[p.id] <= 3).map(p => p.name);
    demo.cart = {};
    $('#toastTitle').textContent = `✓ Venta de ${fmt(total)} registrada (${demo.pay.toLowerCase()})`;
    $('#toastBody').textContent = lows.length ? `Stock bajo: ${lows.join(', ')}.` : 'El stock se actualizó en todas las sucursales.';
    renderDemo();
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5000);
  });
  $('#resetDemo').addEventListener('click', () => {
    demo.stock = { ...STOCK0 };
    demo.cart = {};
    hideToast();
    renderDemo();
  });
  renderDemo();

  /* ---------- Weekly chart ---------- */
  const WEEK = [['Lun', 12], ['Mar', 19], ['Mié', 15], ['Jue', 25], ['Vie', 32], ['Sáb', 45], ['Dom', 30]];
  const barsEl = $('#bars');
  barsEl.innerHTML = WEEK.map(([, v], i) => `
    <div class="bar-col">
      <span class="bar-label" style="transition-delay:${i * 80}ms">$${v}k</span>
      <div class="bar" style="background:${v === 45 ? '#1e5eff' : '#19c3ff'};transition-delay:${i * 80}ms" data-h="${(v / 50 * 88)}%"></div>
    </div>`).join('');
  $('#barDays').innerHTML = WEEK.map(([d]) => `<span>${d}</span>`).join('');
  const showChart = () => {
    barsEl.querySelectorAll('.bar').forEach(b => { b.style.height = b.dataset.h; });
    barsEl.querySelectorAll('.bar-label').forEach(l => { l.style.opacity = 1; });
  };
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { showChart(); io2.disconnect(); }
    }, { threshold: 0.35 });
    io2.observe($('#chart'));
  } else showChart();

  /* ---------- App screenshots ---------- */
  const SHOTS = [
    { label: 'Ventas', img: 'assets/app-ventas.png', alt: 'Pantalla de ventas de Kipo', cap: 'Buscás o escaneás el producto, elegís el medio de pago y el stock se descuenta solo.' },
    { label: 'Inventario', img: 'assets/app-inventario.png', alt: 'Listado de inventario de Kipo', cap: 'Stock, costo y precio de venta de cada producto, con aviso de stock bajo.' },
    { label: 'Reportes', img: 'assets/app-reportes.png', alt: 'Reportes de ventas de Kipo', cap: 'Ingresos por día, ticket promedio y ganancia por período.' },
  ];
  const tabsEl = $('#shotTabs'), viewEl = $('#shotView');
  tabsEl.innerHTML = SHOTS.map((s, i) => `
    <button type="button" class="shot-tab" data-shot="${i}">
      <span class="shot-tab-top"><span class="shot-tab-n">0${i + 1}</span><span class="shot-tab-label">${s.label}</span></span>
      <span class="shot-tab-cap">${esc(s.cap)}</span>
      <span class="shot-bar"><span></span></span>
    </button>`).join('');
  viewEl.innerHTML = SHOTS.map(s => `<img src="${s.img}" alt="${esc(s.alt)}" loading="lazy">`).join('');
  const setShot = act => {
    tabsEl.querySelectorAll('.shot-tab').forEach((t, i) => {
      t.classList.toggle('on', i === act);
      t.setAttribute('aria-pressed', String(i === act));
    });
    viewEl.querySelectorAll('img').forEach((img, i) => {
      img.classList.toggle('on', i === act);
      img.style.transform = i === act ? 'none' : i < act ? 'translateY(-24px) scale(.98)' : 'translateY(24px) scale(.98)';
    });
  };
  tabsEl.addEventListener('click', e => { const t = e.target.closest('[data-shot]'); if (t) setShot(+t.dataset.shot); });
  setShot(0);

  /* ---------- FAQ ---------- */
  const FAQS = [
    { q: '¿Necesito una computadora?', a: 'No. Kipo funciona desde el celular, y también desde cualquier computadora con navegador.' },
    { q: '¿Sirve si tengo más de un local?', a: 'Sí. Podés manejar varias sucursales y ver el stock de cada una o el total.' },
    { q: '¿Me ayudan a cargar los productos?', a: 'Sí. Te acompañamos en la carga inicial para que empieces a usar Kipo cuanto antes.' },
    { q: '¿Necesito un lector de códigos?', a: 'No es obligatorio. Podés escanear con la cámara del celular o usar un lector USB si ya tenés uno.' },
  ];
  const faqsEl = $('#faqs');
  faqsEl.innerHTML = FAQS.map((f, i) => `
    <div class="faq">
      <button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}"><span>${esc(f.q)}</span><span class="faq-plus" aria-hidden="true">+</span></button>
      <p class="faq-a" id="faq-a-${i}" hidden>${esc(f.a)}</p>
    </div>`).join('');
  const setFaq = open => {
    [...faqsEl.children].forEach((el, i) => {
      const on = i === open;
      el.classList.toggle('open', on);
      el.querySelector('.faq-q').setAttribute('aria-expanded', String(on));
      el.querySelector('.faq-a').hidden = !on;
    });
  };
  let openFaq = 0;
  faqsEl.addEventListener('click', e => {
    const q = e.target.closest('.faq-q'); if (!q) return;
    const i = [...faqsEl.children].indexOf(q.parentElement);
    openFaq = openFaq === i ? -1 : i;
    setFaq(openFaq);
  });
  setFaq(openFaq);

  /* ---------- Contact form ---------- */
  const LOCALES = ['1', '2 a 3', '4 o más'];
  let locales = '1';
  const localesEl = $('#locales');
  localesEl.innerHTML = LOCALES.map(l => `<button type="button" data-loc="${l}">${l}</button>`).join('');
  const renderLocales = () => localesEl.querySelectorAll('button').forEach(b => {
    const on = b.dataset.loc === locales;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  localesEl.addEventListener('click', e => { const b = e.target.closest('[data-loc]'); if (b) { locales = b.dataset.loc; renderLocales(); } });
  renderLocales();

  // Web3Forms access key (free, delivers to the email it was created for): https://web3forms.com
  const WEB3FORMS_KEY = '42a8b15d-ca89-4f93-aad2-16f86bbb2c49';
  const WA_NUMBER = '5492646237685';

  const form = $('#form'), sent = $('#sent'), submitBtn = $('.btn-submit', form), formErr = $('#formErr');
  const waLink = data => {
    const lines = [
      `Hola! Quiero pedir una demo de Kipo.`,
      `Nombre: ${data.nombre}`,
      data.comercio && `Comercio: ${data.comercio}`,
      `WhatsApp: ${data.tel}`,
      data.email && `Email: ${data.email}`,
      `Locales: ${data.locales}`,
      data.msg && `Mensaje: ${data.msg}`,
    ].filter(Boolean);
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  };
  const send = async data => {
    if (WEB3FORMS_KEY.startsWith('YOUR_')) throw new Error('Web3Forms key not configured');
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Pedido de demo Kipo: ${data.comercio || data.nombre}`,
        from_name: 'Landing Kipo',
        botcheck: data.botcheck,
        Nombre: data.nombre,
        Comercio: data.comercio,
        WhatsApp: data.tel,
        Email: data.email,
        Locales: data.locales,
        Mensaje: data.msg,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.locales = locales;
    formErr.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    try {
      await send(data);
      $('#sentName').textContent = String(data.nombre || '').trim().split(' ')[0];
      $('#sentWa').href = waLink(data);
      form.hidden = true;
      sent.hidden = false;
    } catch (err) {
      console.error('[contact form]', err);
      $('#formErrWa').href = waLink(data);
      formErr.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = CTA_LABEL;
    }
  });
  $('#resetForm').addEventListener('click', () => {
    form.reset();
    formErr.hidden = true;
    sent.hidden = true;
    form.hidden = false;
  });

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      const d = sibs.indexOf(el) * 90;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity .7s ease ${d}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${d}ms`;
      io.observe(el);
    });
  }
})();
