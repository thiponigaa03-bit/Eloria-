const CART_KEY = 'eloria-cart';
const THEME_KEY = 'eloria-theme';

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
        message.textContent = 'Signed in successfully. Welcome to Eloria!';
        loginForm.reset();
    });
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const password = registerForm.querySelector('[name="password"]').value;
        const confirmation = registerForm.querySelector('[name="confirm-password"]').value;
        if (password !== confirmation) { message.textContent = 'Your passwords do not match. Please try again.'; return; }
        message.textContent = 'Your account is ready. Welcome to Eloria!';
        registerForm.reset();
    });
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

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach((element) => {
        element.textContent = count;
    });
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.name === product.name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
}

function productFromCard(card) {
    return {
        name: card.dataset.productName || card.querySelector('h3')?.textContent.trim() || 'Eloria jewellery',
        price: card.dataset.productPrice || card.querySelector('.price, p')?.textContent.trim() || 'Rs. 0',
        image: card.dataset.productImage || card.querySelector('img')?.getAttribute('src') || ''
    };
}

function bindCartButtons() {
    document.querySelectorAll('[data-add-to-cart], .product button').forEach((button) => {
        if (button.dataset.cartBound) return;
        button.dataset.cartBound = 'true';
        button.addEventListener('click', () => {
            addToCart(productFromCard(button.closest('[data-product], .product, .shop-product')));
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

function bindCheckout() {
    const checkoutButton = document.querySelector('#checkout-button');
    if (!checkoutButton) return;

    checkoutButton.addEventListener('click', () => {
        const cart = getCart();
        if (!cart.length) {
            alert('Your cart is empty. Add a jewellery piece before checking out.');
            return;
        }

        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        alert(`Thank you for your order of ${totalItems} item${totalItems === 1 ? '' : 's'} from Eloria. We will contact you to confirm delivery and payment.`);
        saveCart([]);
        renderCart();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindThemeToggle();
    markCurrentPage();
    updateCartCount();
    bindCartButtons();
    renderCart();
    bindCheckout();
    bindAccountDialog();
});
