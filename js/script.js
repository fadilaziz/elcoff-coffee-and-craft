//Scroll Record
const nav = document.querySelector('.navbar');
console.log(nav)
window.addEventListener('scroll', ()=> {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
        nav.style.borderBottom = '1px solid rgb(202, 202, 202)';
        nav.style.transition = 'border 0.2s ease-in-out';
        nav.style.height = '40px';
    } else {
        nav.style.borderBottom = '0px solid rgb(202, 202, 202)';
        nav.style.transition = 'all 0.2s ease-in-out';
        nav.style.height = '40px';
    }
});

const moreProductsButton = document.querySelector('.banyak-produk');
const moreProducts = document.querySelector('.more-products');
const moreitems = document.querySelector('.more-products-items');
const body = document.body;
let scrollPosition = 0;

function disableBodyScroll() {
    scrollPosition = window.pageYOffset;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';
}

function enableBodyScroll() {
    body.style.removeProperty('overflow');
    body.style.removeProperty('position');
    body.style.removeProperty('top');
    body.style.removeProperty('width');
    window.scrollTo(0, scrollPosition);
}

moreProductsButton.addEventListener('click', () => {
    moreProducts.classList.add('active');
    moreitems.classList.add('active');
    disableBodyScroll();
});

const closeMoreProduct = document.querySelector('.close-more-product');

function closeModal() {
    moreitems.style.animation = 'modalDisappear 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    
    // Wait for the animation to complete before removing the active class from the overlay
    setTimeout(() => {
        moreProducts.classList.remove('active');
        moreitems.classList.remove('active');
        // Reset animation for next time
        moreitems.style.animation = '';
        enableBodyScroll();
    }, 300);
}

// Close when clicking the close button
closeMoreProduct.addEventListener('click', closeModal);

// Close when clicking outside the modal
moreProducts.addEventListener('click', (e) => {
    if (e.target === moreProducts) {
        closeModal();
    }
});

// Close when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && moreProducts.classList.contains('active')) {
        closeModal();
    }
});

const ANON_public_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHJ5Z3ZtdXRvdW9udnNkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTczMTMsImV4cCI6MjA4MzczMzMxM30._f_sYjjRMAcV6AmJ7nje4gmO-HO1LGc4WxHyoISodVo';

// Global variable to store all products
let allProducts = [];

// Function to render products based on filter
function renderProducts(products, containerSelector) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = ''; // Clear existing content
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products found in this category.</p>';
        container.classList.add('active');
        return;
    }
    
    // Remove active class to trigger fade out
    container.classList.remove('active');
    
    // Add products after a short delay to allow fade out to complete
    setTimeout(() => {
        products.forEach(product => {
        container.innerHTML += `
            <div class="product-items" data-category="${product.type.toLowerCase()}">
                <div class="img-bg">
                    <div class="promo">
                        <p>20% Off</p>
                    </div>
                    <img src="img/${product.image_url}" alt="${product.name}" loading="lazy" decoding="async">
                </div>
                <h1>${product.name}</h1>
                <div class="price-type">
                    <p>${product.type}</p>
                    <p>Rp.${product.price}</p>
                </div>
                <div class="product-button">
                    <button>Add to Cart</button>
                </div>
            </div>
        `;
    });
    }, 300); // Match the fade-out duration
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to filter products by search term
function searchProducts(searchTerm) {
    if (!searchTerm.trim()) {
        // If search is empty, show all products
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
        filterProducts(activeCategory);
        return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.type.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    renderProducts(filtered, '.more-menu');
}

// Function to filter products by category
function filterProducts(category) {
    // Update active state of buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Filter products
    const filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(product => product.type.toLowerCase() === category);

    // Render filtered products in the modal
    renderProducts(filteredProducts, '.more-menu');
}

// Initialize the application
async function initApp() {
    try {
        // Fetch all products
        const response = await fetch('https://ojprygvmutouonvsdubt.supabase.co/rest/v1/product?select=*&order=id', {
            headers: {
                apikey: ANON_public_key,
                Authorization: `Bearer ${ANON_public_key}`
            }
        });
        
        allProducts = await response.json();
        
        // Initial render
        renderProducts(allProducts.slice(0, 12), '.product');
        renderProducts(allProducts, '.more-menu');
        
        // Add event listeners to category buttons
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                filterProducts(category);
            });
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        document.querySelector('.product').innerHTML = '<p>Error loading products. Please try again later.</p>';
        document.querySelector('.more-menu').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Add search functionality
function setupSearch() {
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) {
        const debouncedSearch = debounce(() => {
            searchProducts(searchInput.value);
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
        
        // Clear search when clicking on category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                searchInput.value = '';
            });
        });
    }
}

// Shared functions for panel management
function toggleNotificationPanel() {
    const notificationPanel = document.querySelector('.notification-panel');
    const profilePanel = document.querySelector('.profile-panel');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // Toggle notification panel
    notificationPanel.classList.toggle('active');
    
    // Close profile panel if it's open
    if (profilePanel.classList.contains('active')) {
        profilePanel.classList.remove('active');
    }
    
    // If opening the panel, clear the badge
    if (notificationPanel.classList.contains('active')) {
        if (notificationBadge) {
            notificationBadge.style.animation = 'none';
            notificationBadge.style.display = 'none';
        }
        
        // Mark all notifications as read
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
    }
}

function toggleProfilePanel() {
    const notificationPanel = document.querySelector('.notification-panel');
    const profilePanel = document.querySelector('.profile-panel');
    const profileBadge = document.querySelector('.profile-badge');
    
    // Toggle profile panel
    profilePanel.classList.toggle('active');
    
    // Close notification panel if it's open
    if (notificationPanel.classList.contains('active')) {
        notificationPanel.classList.remove('active');
    }
    
    // If opening the panel, clear the badge
    if (profilePanel.classList.contains('active') && profileBadge) {
        profileBadge.style.animation = 'none';
        profileBadge.style.display = 'none';
    }
}

function handleClickOutside(e) {
    const notificationBtn = document.querySelector('.notification-btn');
    const profileBtn = document.querySelector('.profile-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const profilePanel = document.querySelector('.profile-panel');
    
    // Close notification panel if clicking outside
    if (notificationPanel && !notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationPanel.classList.remove('active');
    }
    
    // Close profile panel if clicking outside
    if (profilePanel && !profilePanel.contains(e.target) && !profileBtn.contains(e.target)) {
        profilePanel.classList.remove('active');
    }
}

// Initialize panels
document.addEventListener('DOMContentLoaded', () => {
    // Notification panel elements
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const closeNotification = document.querySelector('.close-notification');
    
    // Profile panel elements
    const profileBtn = document.querySelector('.profile-btn');
    const profilePanel = document.querySelector('.profile-panel');
    const closeProfile = document.querySelector('.close-profile');
    
    // Add event listeners for notification panel
    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationPanel();
        });
        
        if (closeNotification) {
            closeNotification.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.remove('active');
            });
        }
    }
    
    // Add event listeners for profile panel
    if (profileBtn && profilePanel) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProfilePanel();
        });
        
        if (closeProfile) {
            closeProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                profilePanel.classList.remove('active');
            });
        }
    }
    
    // Add click effect to notification items
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 200);
        });
    });
    
    // Add click outside handler
    document.addEventListener('click', handleClickOutside);
    
    // Prevent panels from closing when clicking inside them
    if (notificationPanel) {
        notificationPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    if (profilePanel) {
        profilePanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

// Start the application
initApp().then(() => {
    setupSearch();
});

