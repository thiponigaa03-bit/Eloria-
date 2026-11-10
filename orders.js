const orderHistory = document.querySelector('#order-history');
const orderIds = JSON.parse(localStorage.getItem('eloria-order-history') || '[]');

function itemSubtotal(item) {
    return Number(String(item.price).replace(/[^0-9]/g, '')) * item.quantity;
}

async function showOrders() {
    if (!orderIds.length) {
        orderHistory.innerHTML = '<p class="empty-cart">You have not placed an order in this browser yet.</p>';
        return;
    }

    const orders = await Promise.all(orderIds.map(async (id) => {
        const response = await fetch(`/api/orders/${id}`);
        return response.ok ? response.json() : null;
    }));

    orderHistory.innerHTML = orders.filter(Boolean).map((order) => `<article class="cart-item order-history-item"><div class="order-history-content"><h2>Order #${order._id}</h2><p>${new Date(order.createdAt).toLocaleString()}</p><p>${order.paymentMethod === 'cod' ? 'Cash on delivery' : `${order.cardBrand === 'amex' ? 'American Express' : order.cardBrand === 'mastercard' ? 'Mastercard' : 'Visa'} ending ${order.cardLast4}`}</p><div class="order-products">${(order.items || []).map((item) => `<div class="order-product"><img src="${item.image}" alt="${item.name}"><span>${item.name} × ${item.quantity}</span><strong>Rs. ${itemSubtotal(item).toLocaleString()}</strong></div>`).join('') || '<p>Product information is unavailable for this earlier order.</p>'}</div><p><strong>Total: Rs. ${Number(order.total).toLocaleString()}</strong> · ${order.status}</p></div></article>`).join('') || '<p class="empty-cart">Your completed orders could not be loaded.</p>';
}

showOrders().catch(() => { orderHistory.innerHTML = '<p class="empty-cart">Order history is unavailable. Please make sure the Eloria server is running.</p>'; });
