// --- Configuration ---
const WHATSAPP_NUMBER = '59168989536'; // Country code + number

// --- State ---
let cart = [];

// --- DOM Elements ---
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

// --- Functions ---

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// Update Cart UI
function updateCartUI() {
    // Calculate totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update count badge
    cartCountElement.textContent = totalItems;
    if (totalItems > 0) {
        cartCountElement.classList.remove('hidden');
        cartCountElement.classList.add('cart-pop');
        setTimeout(() => cartCountElement.classList.remove('cart-pop'), 300);
    } else {
        // cartCountElement.classList.add('hidden'); // Optional: hide when 0
    }

    // Update Total
    cartTotalElement.textContent = formatCurrency(totalPrice);

    // Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartItemsContainer.appendChild(emptyCartMsg);
        emptyCartMsg.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        emptyCartMsg.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        checkoutBtn.disabled = false;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm';
            itemElement.innerHTML = `
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-800 line-clamp-1">${item.name}</h4>
                    <div class="text-brand-600 font-bold text-sm">${formatCurrency(item.price)}</div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center bg-gray-100 rounded-md">
                        <button class="px-2 py-1 text-gray-600 hover:text-brand-600 focus:outline-none" onclick="updateQuantity(${index}, -1)">
                            <i class="fa-solid fa-minus text-xs"></i>
                        </button>
                        <span class="w-6 text-center text-sm font-medium text-gray-800">${item.quantity}</span>
                        <button class="px-2 py-1 text-gray-600 hover:text-brand-600 focus:outline-none" onclick="updateQuantity(${index}, 1)">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                    <button class="text-red-400 hover:text-red-600 focus:outline-none p-1" onclick="removeItem(${index})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Save to local storage
    localStorage.setItem('demoCart', JSON.stringify(cart));
}

// Add to Cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    updateCartUI();
    showToast(`"${name}" añadido al carrito`);
}

// Update Quantity (Exposed to global scope for inline onclick handlers)
window.updateQuantity = function(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    }
};

// Remove Item (Exposed to global scope)
window.removeItem = function(index) {
    if (cart[index]) {
        cart.splice(index, 1);
        updateCartUI();
    }
};

// Toggle Cart Sidebar
function toggleCart() {
    const isClosed = cartSidebar.classList.contains('translate-x-full');
    if (isClosed) {
        // Open
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => cartOverlay.classList.remove('opacity-0'), 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        // Close
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('opacity-0');
        setTimeout(() => cartOverlay.classList.add('hidden'), 300); // Wait for transition
        document.body.style.overflow = '';
    }
}

// Show Toast Notification
let toastTimeout;
function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Generate WhatsApp Message
function checkoutWhatsApp() {
    if (cart.length === 0) return;

    let message = "*NUEVO PEDIDO - SITIO DEMO*%0A%0A";
    message += "*Detalle del pedido:*%0A";
    
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})%0A`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `%0A*TOTAL: ${formatCurrency(totalPrice)}*%0A%0A`;
    message += "Hola, me gustaría confirmar este pedido.";

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// --- Event Listeners ---

// Initialize
function init() {
    // Load cart from local storage if exists
    const savedCart = localStorage.getItem('demoCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();

    // Attach Add to cart events
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            addToCart(id, name, price);
        });
    });

    // Cart toggles
    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Checkout
    checkoutBtn.addEventListener('click', checkoutWhatsApp);
}

// Run init
document.addEventListener('DOMContentLoaded', init);

// For testing purposes, export functions if running in Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        cart,
        addToCart,
        WHATSAPP_NUMBER
    };
}
