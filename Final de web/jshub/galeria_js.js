document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const sortSelect = document.getElementById('sortSelect');
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalAddCart = document.getElementById('modal-add-cart');
    const closeModal = document.querySelector('.close');

    function setDeliveryDates() {
        const today = new Date(); 
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 3); 
        
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const day = deliveryDate.getDate();
        const month = months[deliveryDate.getMonth()];
        
        const dateStr = `${day} de ${month}`;

        for (let i = 1; i <= 12; i++) {
            const deliverySpan = document.getElementById(`delivery-${i}`);
            if (deliverySpan) {
                deliverySpan.textContent = dateStr + ' para clientes Prime'; 
            }
        }
    }
    setDeliveryDates(); 

    const products = Array.from(productsContainer.children).map(product => ({
        id: product.dataset.id,
        name: product.querySelector('.product-name').textContent,
        price: parseFloat(product.dataset.price),
        image: product.querySelector('.product-image img').src
    }));
    localStorage.setItem('productsList', JSON.stringify(products));

    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const products = Array.from(productsContainer.children);

        if (sortValue === '') {
            products.sort((a, b) => parseInt(a.dataset.id) - parseInt(b.dataset.id));
        } else {
            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                return sortValue === 'asc' ? priceA - priceB : priceB - priceA;
            });
        }

        products.forEach(product => productsContainer.appendChild(product));
    });

    document.querySelectorAll('.product-image img').forEach(img => {
    img.addEventListener('click', function(e) {
        e.stopPropagation();
        const product = this.closest('.product');
        const productName = product.querySelector('.product-name').textContent;
        const productPrice = product.querySelector('.price').textContent;
        const productId = product.dataset.id;

        modalImg.src = this.src;
        modalImg.alt = `Imagen ampliada de ${productName}`; 

        let modalName = document.getElementById('modal-name');
        if (!modalName) {
            modalName = document.createElement('h2');
            modalName.id = 'modal-name';
            document.getElementById('modal-details').prepend(modalName);
        }
        modalName.textContent = productName;

        modalPrice.textContent = productPrice;
        modalAddCart.dataset.id = productId;
        modalAddCart.dataset.name = productName;
        modalAddCart.dataset.price = parseFloat(productPrice.replace('€ IVA Inc.', '').replace(',', '.'));
        modalAddCart.dataset.image = this.src;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});
    closeModal.addEventListener('click', closeLightbox);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeLightbox();
    });
    modalAddCart.addEventListener('click', function() {
        addToCart(this.dataset.id, this.dataset.name, this.dataset.price + '€', this.dataset.image);
        closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeLightbox();
        }
    });

    function closeLightbox() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
        const product = this.closest('.product');
        const productId = product.dataset.id;
        const productName = product.querySelector('.product-name').textContent;
        const productPrice = product.querySelector('.price').textContent;
        const imageSrc = product.querySelector('.product-image img').src;
        addToCart(productId, productName, productPrice, imageSrc);
    });
});

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearSearch');

function performSearch(query) {
    const products = document.querySelectorAll('.product');
    products.forEach(product => {
        const name = product.querySelector('.product-name').textContent.toLowerCase();
        product.style.display = name.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

searchInput.addEventListener('input', function() {
    const query = this.value;
    performSearch(query);
    clearBtn.style.display = query ? 'block' : 'none';
});

searchBtn.addEventListener('click', function() {
    performSearch(searchInput.value);
});

clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    performSearch(''); 
});