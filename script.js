const CART_KEY = 'eloria-cart';

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
    const total = cart.reduce((sum, item) => sum + Number(String(item.price).replace(/[^0-9.]/g, '')) * item.quantity, 0);

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
    updateCartCount();
    bindCartButtons();
    renderCart();
    bindCheckout();
});
