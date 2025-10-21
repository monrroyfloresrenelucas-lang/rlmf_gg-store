function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

function addToCart(productId, productName, productPrice, imageSrc) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const price = parseFloat(productPrice.replace('€', '').replace(',', '.').replace(' IVA Inc.', '')) || 0;
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1,
            imageSrc: imageSrc || 'placeholder.jpg'
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function updateQuantity(productId, newQuantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    displayCart();
}

function getSelectedShipping() {
    const select = document.getElementById('select-extra');
    if (!select || !select.value) return 0;
    const value = select.value;
    return value === 'recogida' ? 0 : { 'mrw': 14.00, 'gls': 8.40, 'nacex': 5.65 }[value] || 0;
}

function applyDiscount() {
    const days = parseInt(document.getElementById('discount-days')?.value) || 0;
    if (days < 4) {
        alert('Ingresa días válidos (mínimo 4).');
        return 0;
    }
    const subtotal = getSubtotal();
    const discount = (subtotal * 0.05) * Math.floor(days / 30);
    document.getElementById('discount').textContent = `-${discount.toFixed(2).replace('.', ',')}€`;
    updateCartSummary(subtotal, getSelectedShipping(), discount);
    return discount;
}

function formatPrice(price) {
    return price.toFixed(2).replace('.', ',') + '€';
}

function getSubtotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');

    if (!cartContainer || !subtotalElement) return;

    cartContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #6a1b9a;">No hay productos en el presupuesto.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="product-image">
                    <img src="${item.imageSrc}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>Compatible</p>
                </div>
                <div class="item-quantity">
                    <input type="number" value="${item.quantity}" min="1" data-product-id="${item.id}" onchange="updateQuantity('${item.id}', this.value)">
                </div>
                <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">Eliminar</button>
            `;
            cartContainer.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Vaciar Presupuesto';
        clearButton.className = 'remove-item';
        clearButton.onclick = clearCart;
        cartContainer.appendChild(clearButton);
    }

    subtotalElement.textContent = formatPrice(subtotal);
    updateCartSummary(subtotal, getSelectedShipping(), 0); 
}

function updateCartSummary(subtotal, shipping, discount) {
    const tax = subtotal * 0.12; 
    const grandTotal = subtotal + shipping + tax - discount;

    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (shippingElement) shippingElement.textContent = formatPrice(shipping);
    if (taxElement) taxElement.textContent = formatPrice(tax);
    if (totalElement) totalElement.textContent = formatPrice(grandTotal) + ' IVA inc';
}

function procesarPresupuesto() {
    if (!document.getElementById('terminos').checked) {
        alert('Acepta los términos.');
        return;
    }
    const personalData = {
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        direccion: document.getElementById('direccion').value,
        codigoPostal: document.getElementById('codigo-postal').value,
        pais: document.getElementById('pais').value,
        numero: document.getElementById('numero').value,
        email: document.getElementById('email').value,
        pago: document.querySelector('input[name="pago"]:checked')?.value || '',
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        shipping: getSelectedShipping(),
        discount: applyDiscount(),
        total: parseFloat(document.getElementById('total').textContent.replace('€ IVA inc', '').replace(',', '.'))
    };
    localStorage.setItem('presupuestoFinal', JSON.stringify(personalData));
    alert('¡Presupuesto realizado! Revisa tu email o contacta para detalles.');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    displayCart();

    const selectExtra = document.getElementById('select-extra');
    if (selectExtra) {
        selectExtra.addEventListener('change', () => {
            const subtotal = getSubtotal();
            const shipping = getSelectedShipping();
            updateCartSummary(subtotal, shipping, 0);
        });
    }
});