document.addEventListener('DOMContentLoaded', () => {
  function track(eventName, params = {}) {
    try { if (window.gtag) gtag('event', eventName, params); } catch (e) {}
    console.log('[track]', eventName, params);
  }

  // ----- Cart (localStorage) -----
  function getCart() {
    try { return JSON.parse(localStorage.getItem('mage_cart') || '[]'); } catch (e) { return []; }
  }
  function setCart(items) {
    try { localStorage.setItem('mage_cart', JSON.stringify(items)); } catch (e) {}
    updateCartSummary();
  }

  // ----- Nav -----
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { nav.classList.remove('open'); });
  });

  // ----- Smooth scroll -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ----- Roll the Mat demo -----
  const rollBtn = document.getElementById('rollBtn');
  const matDemo = document.querySelector('.mat-demo');
  const audio = new Audio('assets/roll.mp3');
  if (rollBtn && matDemo) {
    rollBtn.addEventListener('click', () => {
      const isRolled = matDemo.classList.contains('rolled-out');
      matDemo.classList.toggle('rolled-out', !isRolled);
      try { audio.currentTime = 0; audio.play().catch(() => {}); } catch (e) {}
      if (!isRolled) matDemo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      track(isRolled ? 'mat_folded' : 'mat_rolled');
    });
  }

  // ----- Add to Order (product cards → modal → cart) -----
  const modal = document.getElementById('modal');
  const buyForm = document.getElementById('buyForm');
  const quickSku = document.getElementById('quickSku');
  const quickName = document.getElementById('quickName');
  const qtyInput = document.getElementById('qty');
  const toast = document.getElementById('toast');
  const minusBtn = document.getElementById('minus');
  const plusBtn = document.getElementById('plus');

  function showToast(msg = 'Added to cart!') {
    if (!toast) { alert(msg); return; }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
  }

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const sku = btn.dataset.sku;
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      if (!sku || !name) return;
      if (quickSku) quickSku.value = sku;
      if (quickName) quickName.textContent = name;
      if (qtyInput) qtyInput.value = 1;
      if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
      }
      track('open_add_modal', { sku, name });
    });
  });

  const closeBtn = document.querySelector('.modal .close');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
  }
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      const v = Math.max(1, parseInt(qtyInput.value || '1', 10) - 1);
      qtyInput.value = v;
    });
  }
  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      const v = Math.max(1, parseInt(qtyInput.value || '1', 10) + 1);
      qtyInput.value = v;
    });
  }

  if (buyForm) {
    buyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sku = quickSku ? quickSku.value : '';
      const name = quickName ? quickName.textContent : '';
      const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : '1', 10));
      if (!sku) { showToast('Please select a product'); return; }
      const cart = getCart();
      const price = document.querySelector(`.btn-add[data-sku="${sku}"]`)?.dataset.price || '0';
      cart.push({ sku, name, price: parseFloat(price), qty, ts: Date.now() });
      setCart(cart);
      showToast('Added to cart!');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      track('add_to_cart', { sku, quantity: qty });
    });
  }

  // ----- Cart summary (checkout) -----
  function updateCartSummary() {
    const cart = getCart();
    const cartItemsEl = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const countrySelect = document.getElementById('country');

    let subtotal = 0;
    cart.forEach(item => { subtotal += (item.price || 0) * (item.qty || 1); });

    if (cartItemsEl) {
      if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Cart is empty. Add items from Shop.</p>';
      } else {
        cartItemsEl.innerHTML = cart.map(item =>
          `<div class="cart-line">${item.name} × ${item.qty} — $${(item.price * item.qty).toFixed(2)}</div>`
        ).join('');
      }
    }
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);

    const country = countrySelect ? countrySelect.value : '';
    let shipping = 0;
    if (country === 'US') shipping = subtotal >= 75 ? 0 : 8;
    else if (country === 'CN') shipping = subtotal >= 100 ? 0 : 12;
    else if (country && country !== '') shipping = 15;
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
    }
    let total = subtotal + shipping;
    const giftWrap = document.getElementById('giftWrap');
    if (giftWrap && giftWrap.checked) total += 5;
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  const countrySelect = document.getElementById('country');
  if (countrySelect) countrySelect.addEventListener('change', updateCartSummary);

  const giftWrap = document.getElementById('giftWrap');
  if (giftWrap) giftWrap.addEventListener('change', updateCartSummary);

  updateCartSummary();

  // ----- Testimonial carousel -----
  const slides = document.querySelectorAll('.testimonial-slide');
  let slideIndex = 0;
  function updateTestimonialSlides() {
    slides.forEach((s, i) => {
      s.style.display = i === slideIndex ? 'block' : 'none';
    });
  }
  if (slides && slides.length > 0) {
    updateTestimonialSlides();
    setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      updateTestimonialSlides();
    }, 4000);
  }

  // ----- Checkout form -----
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty. Add items from Shop.');
        return;
      }
      const paymentModal = document.getElementById('paymentModal');
      if (paymentModal) {
        paymentModal.style.display = 'flex';
        paymentModal.setAttribute('aria-hidden', 'false');
      } else {
        showToast('Order received! Payment coming soon — contact us to complete.');
      }
      track('checkout_submit');
    });
  }
  const paymentModal = document.getElementById('paymentModal');
  const paymentClose = document.querySelector('.payment-close');
  const paymentOk = document.getElementById('paymentModalOk');
  if (paymentModal) {
    if (paymentClose) paymentClose.addEventListener('click', () => { paymentModal.style.display = 'none'; paymentModal.setAttribute('aria-hidden', 'true'); });
    if (paymentOk) paymentOk.addEventListener('click', () => { paymentModal.style.display = 'none'; paymentModal.setAttribute('aria-hidden', 'true'); });
    paymentModal.addEventListener('click', (e) => { if (e.target === paymentModal) { paymentModal.style.display = 'none'; paymentModal.setAttribute('aria-hidden', 'true'); } });
  }
});
