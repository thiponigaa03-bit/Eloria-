const CART_KEY = 'eloria-cart';
const THEME_KEY = 'eloria-theme';
const INVENTORY_KEY = 'eloria-inventory';

function setTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-toggle').forEach((button) => {
        button.setAttribute('aria-pressed', String(isDark));
        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

function bindThemeToggle() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme ? savedTheme === 'dark' : prefersDark);
    document.querySelectorAll('.theme-toggle').forEach((button) => {
        button.addEventListener('click', () => setTheme(!document.body.classList.contains('dark-mode')));
    });
}

function markCurrentPage() {
    const currentFile = window.location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('header nav a[href]').forEach((link) => {
        if (link.getAttribute('href') === currentFile) link.setAttribute('aria-current', 'page');
    });
}

function bindAccountDialog() {
    const dialog = document.querySelector('#account-dialog');
    const trigger = document.querySelector('#account-fab');
    if (!dialog || !trigger) return;

    const title = dialog.querySelector('#account-title');
    const intro = dialog.querySelector('#account-intro');
    const loginForm = dialog.querySelector('#login-form');
    const registerForm = dialog.querySelector('#register-form');
    const message = dialog.querySelector('#account-message');
    const showForm = (register) => {
        loginForm.hidden = register;
        registerForm.hidden = !register;
        title.textContent = register ? 'Create your account' : 'Welcome back';
        intro.textContent = register ? 'Register to save your Eloria favourites.' : 'Sign in to continue your Eloria journey.';
        message.textContent = '';
        window.setTimeout(() => (register ? registerForm : loginForm).querySelector('input')?.focus(), 0);
    };

    trigger.addEventListener('click', () => { showForm(false); dialog.showModal(); });
    dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-account-view]').forEach((button) => button.addEventListener('click', () => showForm(button.dataset.accountView === 'register')));
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!loginForm.checkValidity()) { loginForm.reportValidity(); return; }
        const identity = loginForm.querySelector('[name="identity"]').value.trim();
        const password = loginForm.querySelector('[name="password"]').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)) { message.textContent = 'Enter a valid email address.'; return; }
        if (password.length < 8) { message.textContent = 'Your password must contain at least 8 characters.'; return; }
        message.textContent = 'Signed in successfully. Welcome to Eloria!';
        loginForm.reset();
    });
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!registerForm.checkValidity()) { registerForm.reportValidity(); return; }
        const password = registerForm.querySelector('[name="password"]').value;
        const confirmation = registerForm.querySelector('[name="confirm-password"]').value;
        const phone = registerForm.querySelector('[name="phone"]').value.replace(/[\s-]/g, '');
        if (!/^(?:\+94|0)7\d{8}$/.test(phone)) { message.textContent = 'Enter a valid Sri Lankan mobile number.'; return; }
        if (password !== confirmation) { message.textContent = 'Your passwords do not match. Please try again.'; return; }
        message.textContent = 'Your account is ready. Welcome to Eloria!';
        registerForm.reset();
    });
    registerForm.querySelector('[name="phone"]').addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 10); });
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function getInventory() {
    try { return JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {}; } catch { return {}; }
}

function saveInventory(inventory) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

function syncShopInventory() {
    const inventory = getInventory();
    document.querySelectorAll('[data-product-id]').forEach((card) => {
        const id = card.dataset.productId;
        const startingStock = Number(card.dataset.productStock || 12);
        if (!Number.isFinite(inventory[id])) inventory[id] = startingStock;
        const stock = inventory[id];
        const stockLabel = card.querySelector('[data-stock-label]');
        const button = card.querySelector('[data-add-to-cart]');
        if (stockLabel) stockLabel.textContent = stock > 0 ? `${stock} available` : 'Sold out';
        if (button) { button.disabled = stock < 1; button.textContent = stock > 0 ? 'Add to Cart' : 'Sold out'; }
    });
    saveInventory(inventory);
}

function consumeInventory(items) {
    const inventory = getInventory();
    items.forEach((item) => {
        if (!item.id || !Number.isFinite(inventory[item.id])) return;
        inventory[item.id] = Math.max(0, inventory[item.id] - item.quantity);
    });
    saveInventory(inventory);
}

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach((element) => {
        element.textContent = count;
    });
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.name === product.name);

    if (product.id) {
        const stock = getInventory()[product.id] ?? product.stock;
        if (Number.isFinite(stock) && (existing?.quantity || 0) >= stock) return false;
    }

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    return true;
}

function productFromCard(card) {
    return {
        name: card.dataset.productName || card.querySelector('h3')?.textContent.trim() || 'Eloria jewellery',
        price: card.dataset.productPrice || card.querySelector('.price, p')?.textContent.trim() || 'Rs. 0',
        image: card.dataset.productImage || card.querySelector('img')?.getAttribute('src') || '',
        id: card.dataset.productId || '',
        stock: Number(card.dataset.productStock || NaN)
    };
}

function bindCartButtons() {
    document.querySelectorAll('[data-add-to-cart], .product button').forEach((button) => {
        if (button.dataset.cartBound) return;
        button.dataset.cartBound = 'true';
        button.addEventListener('click', () => {
            const added = addToCart(productFromCard(button.closest('[data-product], .product, .shop-product')));
            if (!added) { button.textContent = 'Maximum available in cart'; return; }
            button.textContent = 'Added to Cart';
            setTimeout(() => { button.textContent = 'Add to Cart'; }, 1200);
        });
    });
}

function renderCart() {
    const cartItems = document.querySelector('#cart-items');
    if (!cartItems) return;

    const cart = getCart();
    const total = cart.reduce((sum, item) => {
        const price = Number(String(item.price).replace(/[^0-9]/g, ''));
        return sum + price * item.quantity;
    }, 0);
    cartItems.innerHTML = cart.length
        ? cart.map((item, index) => `<article class="cart-item"><img src="${item.image}" alt="${item.name}"><div><h2>${item.name}</h2><p>${item.price}</p><div class="cart-actions"><button data-cart-change="${index}" data-change="-1">−</button><span>${item.quantity}</span><button data-cart-change="${index}" data-change="1">+</button><button class="remove-item" data-cart-remove="${index}">Remove</button></div></div></article>`).join('')
        : '<p class="empty-cart">Your cart is empty. Discover a piece you love in our shop.</p>';

    document.querySelector('#cart-total').textContent = `Rs. ${total.toLocaleString()}`;

    cartItems.querySelectorAll('[data-cart-change]').forEach((button) => button.addEventListener('click', () => {
        const updatedCart = getCart();
        const index = Number(button.dataset.cartChange);
        updatedCart[index].quantity += Number(button.dataset.change);
        if (updatedCart[index].quantity < 1) updatedCart.splice(index, 1);
        saveCart(updatedCart);
        renderCart();
    }));

    cartItems.querySelectorAll('[data-cart-remove]').forEach((button) => button.addEventListener('click', () => {
        const updatedCart = getCart();
        updatedCart.splice(Number(button.dataset.cartRemove), 1);
        saveCart(updatedCart);
        renderCart();
    }));
}

function ensureFooterContact() {
    document.querySelectorAll('footer').forEach((footer) => {
        if (footer.querySelector('.footer-contact')) return;
        const contact = document.createElement('div');
        contact.className = 'footer-contact';
        contact.innerHTML = '<p class="footer-brand">Eloria Handmade Jewellery</p><div class="footer-contact-details"><span>✉ eloria@gamil.com</span><span>☎ 0746584578</span><span>⌖ Wellawatte, Colombo, Sri Lanka</span></div>';
        footer.prepend(contact);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindThemeToggle();
    markCurrentPage();
    updateCartCount();
    bindCartButtons();
    syncShopInventory();
    renderCart();
    bindAccountDialog();
    ensureFooterContact();
});
