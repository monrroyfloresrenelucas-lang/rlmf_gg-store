let cart = JSON.parse(localStorage.getItem('cart')) || [];
let productsList = JSON.parse(localStorage.getItem('productsList')) || [];
let shippingCost = 0;

function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return; 
    container.innerHTML = '';
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        const imageSrc = item.imageSrc || item.image || 'placeholder.jpg'; 
        div.innerHTML = `
            <div class="product-image">
                ${imageSrc ? `<img src="${imageSrc}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '<p style="color: #6a1b9a; font-size: 12px;">No image</p>'}
            </div>
            <div class="item-info">
                <h3>${item.name || 'Unnamed Product'}</h3>
                <p>Compatible</p>
            </div>
            <div class="item-quantity">
                <input type="number" value="${item.quantity || 1}" min="1" onchange="updateQty(${index}, this.value)">
            </div>
            <div class="item-price">${(item.price * (item.quantity || 1)).toFixed(2)}€</div>
            <button onclick="removeItem(${index})" class="remove-item">Remove</button>
        `;
        container.appendChild(div);
    });
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6a1b9a;">No items in the budget.</p>';
    }
    updateTotals();
}

function updateQty(index, qty) {
    if (cart[index]) {
        cart[index].quantity = parseInt(qty) || 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
}

function removeItem(index) {
    if (confirm('Are you sure you want to remove this item?')) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
}

function addToBudget() {
    const select = document.getElementById('select-product');
    const qtyInput = document.getElementById('product-qty');
    const qty = parseInt(qtyInput.value) || 1;
    const productId = select.value;

    if (!productId) {
        alert('Please select a product from the gallery.');
        return;
    }
    if (qty < 1) {
        alert('Minimum quantity is 1.');
        return;
    }

    const product = productsList.find(p => p.id === productId);
    if (!product) {
        alert('Product not found. Please reload the gallery first.');
        return;
    }


    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + qty;
    } else {
        const item = { ...product, quantity: qty, imageSrc: product.image };
        cart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();

    select.value = '';
    qtyInput.value = 1;
    alert(`Added: ${product.name} x${qty}`);
}

function applyShipping() {
    const select = document.getElementById('select-extra');
    const value = select.value;
    shippingCost = value === 'recogida' ? 0 : { 'mrw': 14.00, 'gls': 8.40, 'nacex': 5.65 }[value] || 0;
    document.getElementById('shipping').textContent = `${shippingCost.toFixed(2)}€`;
    updateTotals();
    alert(`Shipping applied: ${select.options[select.selectedIndex].text}`);
}

function updateTotals() {
    const subtotal = getSubtotal();
    const tax = subtotal * 0.12; 
    const total = subtotal + shippingCost + tax;

    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}€`;
    document.getElementById('shipping').textContent = `${shippingCost.toFixed(2)}€`;
    document.getElementById('tax').textContent = `${tax.toFixed(2)}€`;
    document.getElementById('total').textContent = `${total.toFixed(2)}€ VAT inc`;
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

function procesarPresupuesto() {
    const pais = document.getElementById('pais').value;
    if (!pais) {
        alert('Por favor, selecciona un país.');
        return;
    }
    if (!document.getElementById('terminos').checked) {
        alert('Please accept the terms and conditions.');
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
        cart: cart,
        shipping: shippingCost,
        tax: parseFloat(document.getElementById('tax').textContent.replace('€', '')),
        total: parseFloat(document.getElementById('total').textContent.replace('€ VAT inc', ''))
    };
    localStorage.setItem('presupuestoFinal', JSON.stringify(personalData));
    alert('Budget processed! Check your email or contact us for details.');
}

document.addEventListener('DOMContentLoaded', () => {
    const productsList = JSON.parse(localStorage.getItem('productsList')) || [];
    const select = document.getElementById('select-product');
    if (select && productsList.length > 0) {
        select.innerHTML = '<option value="">Select a product</option>';
        productsList.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price.toFixed(2).replace('.', ',')}€`;
            select.appendChild(option);
        });
    } else {
        fetchProductsFromGallery();
    }
    renderCart();
    const selectExtra = document.getElementById('select-extra');
    if (selectExtra) {
        selectExtra.addEventListener('change', applyShipping);
    }
});

function fetchProductsFromGallery() {
    const products = [
        { id: "1", name: "Xiaomi Redmi Note 3 2016 / Note 3 Pro Camara trasera compatible", price: 1.03, image: "../galeryhub/camara_xiaomi.png" },
        { id: "2", name: "Pantalla Táctil Portátil, Monitor HDMI IPS de 12.3 Pulgadas 1920 x 720", price: 89.60, image: "../galeryhub/monitor_portatil_tactil_(1920x720).png" },
        { id: "3", name: "Samsung Galaxy Tab A7 10.4 2020 T500 / T505 Pantalla Lcd + tactil negro Compatible", price: 29.60, image: "../galeryhub/galaxy_tab.png" },
        { id: "4", name: "MOGOOD Hub 3.0 de Datos Ultrafinos - Estación de Adaptadores USB Expandedor de Puertos Múltiples", price: 21.60, image: "../galeryhub/Extencion_de_puertos_USB_portatiles.png" },
        { id: "5", name: "GIGASTONE 32GB Kit(2x16GB) DDR4 3200MHz(2933MHz or 2666MHz) PC4-25600(PC4-23400, 21300) CL22 1.2V SODIMM 260pin Memoria portátil sin búfer, sin ECC, Alto Rendimiento", price: 52.12, image: "../galeryhub/DDR4_Laptop_32gb(2x16gb).png" },
        { id: "6", name: "KOORUI Monitor Curvo - 23,6 Pulgadas Full HD VA 100Hz (1920x1080, 3000:1, 3ms, Curvatura 1500R, Antirreflejo, Eye Ease, Inclinación, HDMI, VGA)", price: 122.00, image: "../galeryhub/KOORUI_monitor_curvo_(1920x1080).png" },
        { id: "7", name: "Teclado Portatil Lenovo 330-15ARR / 330S-15IKB / S145-15IKB / 9Z.NCSSN.10S Sin Marco Negro (Con boton de encendido) Compatible", price: 6.09, image: "../galeryhub/lenovo_keyboard.png" },
        { id: "8", name: "Soporte externo para tarjeta gráfica egpu Thunderbolt 3/4 a pcie mediante fuente de alimentación ATX 7900XT/rtx4090", price: 44.50, image: "../galeryhub/soporte_externo_para_mayor_rendimiento.png" },
        { id: "9", name: "Xiaomi Mi Electric Scooter 1S / Essential / Pro 2 / Pro 2 / Scooter 3 / Mercedes AMG Petronas F1 Team Edition Pantalla BLE compatible", price: 18.07, image: "../galeryhub/pantalla_monopatin.png" },
        { id: "10", name: "Playstation 4 / Xbox One Joystick magnetico compatible", price: 25.07, image: "../galeryhub/joystick.png" },
        { id: "11", name: "iPhone 11 2019 A2221 Pantalla Lcd + tactil negro compatible HQ Plus (IC removible no necesita flex)", price: 32.07, image: "../galeryhub/pantalla_iphone.png" },
        { id: "12", name: "Kingston A400 SSD Disco duro sólido interno 2.5 SATA Rev 3.0, 960GB - SA400S37/960Gb", price: 84.07, image: "../galeryhub/SSD_Kingstone_960gb.png" }
    ];
    localStorage.setItem('productsList', JSON.stringify(products));
    const select = document.getElementById('select-product');
    if (select) {
        select.innerHTML = '<option value="">Select a product</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price.toFixed(2).replace('.', ',')}€`;
            select.appendChild(option);
        });
    }
}