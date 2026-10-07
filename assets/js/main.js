/* ============================================================
   TOKE'S SAMMLUNG – MAIN JAVASCRIPT (UNIFIED THEME)
   ============================================================ */

// ============================================================
// 1. CONFIGURATION
// ============================================================
const WHATSAPP_NUMBER = '2348053004410'; // Remove the + sign // Replace with actual number

// ============================================================
// 2. DOM REFS
// ============================================================
const doc = document;
const htmlEl = doc.documentElement;
const body = doc.body;

const navToggle = doc.getElementById('navToggle');
const mobileMenu = doc.getElementById('mobileMenu');
const mobileClose = doc.getElementById('mobileClose');
const toastEl = doc.getElementById('toast');
const toastMessage = doc.getElementById('toastMessage');
const toastIcon = toastEl?.querySelector('.toast-icon');

// ============================================================
// 3. THEME SYSTEM – SINGLE SOURCE OF TRUTH
// ============================================================
const THEME_KEY = 'ts-theme';

function getStoredTheme() {
    try {
        const stored = localStorage.getItem(THEME_KEY);
        return stored === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

function updateAllThemeToggles(theme) {
    const isDark = theme === 'dark';
    const icon = isDark ? '☾' : '☀';
    const toggles = document.querySelectorAll('.theme-toggle, #authThemeToggle');
    toggles.forEach(toggle => {
        if (toggle) {
            toggle.innerHTML = `<span class="theme-icon" aria-hidden="true">${icon}</span>`;
            toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }
    });
}

function applyTheme(theme, updateToggles = true) {
    if (theme === 'dark') {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
    if (updateToggles) {
        updateAllThemeToggles(theme);
    }
}

function toggleTheme() {
    const current = htmlEl.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
}

// --- Initialize theme ---
applyTheme(getStoredTheme(), true);

// --- Bind toggle events (main nav + auth) ---
doc.addEventListener('DOMContentLoaded', function() {
    const toggles = document.querySelectorAll('.theme-toggle, #authThemeToggle');
    toggles.forEach(toggle => {
        toggle.removeEventListener('click', toggleTheme);
        toggle.addEventListener('click', toggleTheme);
    });
});

// ============================================================
// 4. MOBILE MENU
// ============================================================
function openMobile() {
    if (mobileMenu) {
        mobileMenu.classList.add('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
    }
}

function closeMobile() {
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    }
}

if (navToggle) {
    navToggle.addEventListener('click', () => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobile();
        } else {
            openMobile();
        }
    });
}

if (mobileClose) {
    mobileClose.addEventListener('click', closeMobile);
}

doc.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMobile);
});

doc.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        const isInside = mobileMenu.contains(e.target);
        const isToggle = navToggle && navToggle.contains(e.target);
        if (!isInside && !isToggle) {
            closeMobile();
        }
    }
});

doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobile();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobile();
    }
});

// ============================================================
// 5. TOAST SYSTEM
// ============================================================
let toastTimer = null;

function showToast(message, icon = '✦') {
    if (!toastEl || !toastMessage) return;
    toastMessage.textContent = message;
    if (toastIcon) toastIcon.textContent = icon;
    toastEl.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// ============================================================
// 6. AUTHENTICATION STATUS (for demo purposes)
// ============================================================
function isLoggedIn() {
    // In production, this will be replaced with real auth check.
    // For demo: set localStorage.setItem('ts-auth-status', 'logged-in') to simulate login.
    try {
        return localStorage.getItem('ts-auth-status') === 'logged-in';
    } catch {
        return false;
    }
}

// ============================================================
// 7. FAVOURITES (shared across all pages)
// ============================================================
function getFavourites() {
    try {
        return JSON.parse(localStorage.getItem('ts-favourites')) || [];
    } catch {
        return [];
    }
}

function setFavourites(list) {
    localStorage.setItem('ts-favourites', JSON.stringify(list));
}

function toggleFavourite(productId, buttonEl) {
    let favs = getFavourites();
    const idx = favs.indexOf(productId);
    if (idx > -1) {
        favs.splice(idx, 1);
        buttonEl.textContent = '♡';
        buttonEl.classList.remove('liked');
        buttonEl.setAttribute('aria-label', 'Add to favourites');
        showToast('Removed from favourites', '♡');
    } else {
        favs.push(productId);
        buttonEl.textContent = '♥';
        buttonEl.classList.add('liked');
        buttonEl.setAttribute('aria-label', 'Remove from favourites');
        showToast('Added to favourites', '♥');
    }
    setFavourites(favs);
}

// ============================================================
// 8. HOMEPAGE FAVOURITES (static cards) – with fix for favourites page
// ============================================================
doc.addEventListener('DOMContentLoaded', () => {
    const favs = getFavourites();
    // Restore favourite states (visual only)
    doc.querySelectorAll('.product-card-fav').forEach((btn) => {
        const id = Number(btn.dataset.id);
        if (favs.includes(id)) {
            btn.textContent = '♥';
            btn.classList.add('liked');
            btn.setAttribute('aria-label', 'Remove from favourites');
        }
    });

    // Attach click listeners only on NON-favourites pages
    // On favourites page, the dedicated initFavouritesPage handles the click with login check.
    if (document.body.dataset.page !== 'favourites') {
        doc.querySelectorAll('.product-card-fav').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                toggleFavourite(id, btn);
            });
        });
    }
});

// ============================================================
// 9. PRODUCTS PAGE (search, filters, grid/list)
// ============================================================
// (function initProductsPage() {
//     if (document.body.dataset.page !== 'products') return;

//     const grid = document.getElementById('productGrid');
//     if (!grid) return;

//     const cards = grid.querySelectorAll('.product-card');
//     const emptyState = document.getElementById('emptyState');
//     const searchInput = document.getElementById('searchInput');
//     const categoryButtons = document.querySelectorAll('.filter-btn');
//     const viewButtons = document.querySelectorAll('.view-btn');
//     const resultCount = document.getElementById('resultCount');
//     const resetBtn = document.getElementById('resetSearchBtn');

//     if (!cards.length) return;

//     let currentCategory = 'all';
//     let currentSearch = '';
//     let currentView = localStorage.getItem('ts-products-view') || 'grid';

//     function filterProducts() {
//         let visibleCount = 0;
//         const searchTerm = currentSearch.trim().toLowerCase();

//         cards.forEach(card => {
//             // Get category and sub-category from data attributes
//             const cardCategory = card.dataset.category || '';
//             const cardSubCategory = card.dataset.subCategory || '';
//             const cardTags = (card.dataset.tags || '').split(' ').filter(Boolean);

//             // ---- Main category match ----
//             let matchCategory = false;
//             if (currentCategory === 'all') {
//                 matchCategory = true;
//             } else if (currentCategory === 'featured') {
//                 matchCategory = cardTags.includes('featured');
//             } else if (currentCategory === 'new') {
//                 matchCategory = cardTags.includes('new');
//             } else {
//                 matchCategory = cardCategory === currentCategory;
//             }

//             // ---- Sub-category match (only if a main category is selected) ----
//             let matchSubCategory = true;
//             if (currentSubCategory && currentSubCategory !== 'all' && currentSubCategory !== `all-${currentCategory}`) {
//                 // If a specific sub-category is selected, match it
//                 matchSubCategory = cardSubCategory === currentSubCategory;
//             }

//             // ---- Search match ----
//             const searchData = (card.dataset.search || '').toLowerCase();
//             const matchSearch = !searchTerm || searchData.includes(searchTerm);

//             const show = matchCategory && matchSubCategory && matchSearch;
//             card.classList.toggle('hidden', !show);
//             if (show) visibleCount++;
//         });

//         // Update count
//         if (resultCount) {
//             resultCount.textContent = visibleCount + ' piece' + (visibleCount !== 1 ? 's' : '');
//         }

//         // Update empty state
//         if (emptyState) {
//             if (visibleCount === 0) {
//                 emptyState.classList.remove('hidden');
//                 emptyState.style.display = '';
//             } else {
//                 emptyState.classList.add('hidden');
//                 emptyState.style.display = 'none';
//             }
//         }
//     }

//     function setView(view) {
//         currentView = view;
//         localStorage.setItem('ts-products-view', view);
//         grid.classList.toggle('list-view', view === 'list');
//         viewButtons.forEach(btn => {
//             const isActive = btn.dataset.view === view;
//             btn.classList.toggle('active', isActive);
//         });
//     }

//     if (searchInput) {
//         searchInput.addEventListener('input', (e) => {
//             currentSearch = e.target.value;
//             filterProducts();
//         });
//     }

//     categoryButtons.forEach(btn => {
//         btn.addEventListener('click', function() {
//             categoryButtons.forEach(b => b.classList.remove('active'));
//             this.classList.add('active');
//             currentCategory = this.dataset.category;
//             filterProducts();
//         });
//     });

//     viewButtons.forEach(btn => {
//         btn.addEventListener('click', function() {
//             const view = this.dataset.view;
//             setView(view);
//         });
//     });

//     if (resetBtn) {
//         resetBtn.addEventListener('click', function() {
//             if (searchInput) {
//                 searchInput.value = '';
//                 currentSearch = '';
//                 filterProducts();
//             }
//         });
//     }

//     setView(currentView);

//     const allBtn = document.querySelector('.filter-btn[data-category="all"]');
//     if (allBtn) allBtn.classList.add('active');

//     filterProducts();

//     // ---- Favourites on product cards (products page) ----
//     // Note: The capturing listener in initAuthModal will intercept clicks on non-favourites pages.
//     // This is kept for fallback but will be prevented by the capturing listener.
//     document.querySelectorAll('.product-card-fav').forEach(btn => {
//         const id = Number(btn.dataset.id);
//         const favs = getFavourites();
//         if (favs.includes(id)) {
//             btn.textContent = '♥';
//             btn.classList.add('liked');
//             btn.setAttribute('aria-label', 'Remove from favourites');
//         }
//         btn.addEventListener('click', function(e) {
//             e.stopPropagation();
//             const pid = Number(this.dataset.id);
//             toggleFavourite(pid, this);
//         });
//     });

//     console.log('Products page initialised.');
// })();

(function initProductsPage() {
    if (document.body.dataset.page !== 'products') return;

    // ---- DOM refs ----
    const grid = document.getElementById('productGrid');
    const cards = grid ? grid.querySelectorAll('.product-card') : [];
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const resultCount = document.getElementById('resultCount');
    const resetBtn = document.getElementById('resetSearchBtn');

    if (!grid || !cards.length) return;

    // ============================================================
    // ---- STATE VARIABLES (ADDED: currentSubCategory) ----
    // ============================================================
    let currentCategory = 'all';
    let currentSubCategory = 'all';        // ← NEW
    let currentSearch = '';
    let currentView = localStorage.getItem('ts-products-view') || 'grid';

    // ============================================================
    // ---- FILTER PRODUCTS (UPDATED: includes subcategory) ----
    // ============================================================
    function filterProducts() {
        let visibleCount = 0;
        const searchTerm = currentSearch.trim().toLowerCase();

        cards.forEach(card => {
            // Get category and sub-category from data attributes
            const cardCategory = card.dataset.category || '';
            const cardSubCategory = card.dataset.subCategory || '';
            const cardTags = (card.dataset.tags || '').split(' ').filter(Boolean);

            // ---- Main category match ----
            let matchCategory = false;
            if (currentCategory === 'all') {
                matchCategory = true;
            } else if (currentCategory === 'featured') {
                matchCategory = cardTags.includes('featured');
            } else if (currentCategory === 'new') {
                matchCategory = cardTags.includes('new');
            } else {
                matchCategory = cardCategory === currentCategory;
            }

            // ---- Sub-category match (NEW) ----
            let matchSubCategory = true;
            if (currentSubCategory && currentSubCategory !== 'all' && currentSubCategory !== `all-${currentCategory}`) {
                matchSubCategory = cardSubCategory === currentSubCategory;
            }

            // ---- Search match ----
            const searchData = (card.dataset.search || '').toLowerCase();
            const matchSearch = !searchTerm || searchData.includes(searchTerm);

            const show = matchCategory && matchSubCategory && matchSearch;
            card.classList.toggle('hidden', !show);
            if (show) visibleCount++;
        });

        // Update count
        if (resultCount) {
            resultCount.textContent = visibleCount + ' piece' + (visibleCount !== 1 ? 's' : '');
        }

        // Show/hide empty state
        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
                emptyState.style.display = '';
            } else {
                emptyState.classList.add('hidden');
                emptyState.style.display = 'none';
            }
        }
    }

    // ============================================================
    // ---- VIEW TOGGLE ----
    // ============================================================
    function setView(view) {
        currentView = view;
        localStorage.setItem('ts-products-view', view);
        grid.classList.toggle('list-view', view === 'list');
        viewButtons.forEach(btn => {
            const isActive = btn.dataset.view === view;
            btn.classList.toggle('active', isActive);
        });
    }

    // ============================================================
    // ---- SHOW/HIDE SUBCATEGORIES (NEW) ----
    // ============================================================
    function updateSubcategories() {
        const allGroups = document.querySelectorAll('.subcategory-group');
        const subcategoryRow = document.getElementById('subcategoryRow');

        allGroups.forEach(group => {
            const mainCat = group.dataset.mainCategory;
            if (mainCat === currentCategory) {
                group.style.display = 'flex';
            } else {
                group.style.display = 'none';
            }
        });

        // Show/hide the entire row
        const visibleGroups = document.querySelectorAll('.subcategory-group[style*="display: flex"]');
        if (subcategoryRow) {
            if (visibleGroups.length > 0) {
                subcategoryRow.classList.remove('hidden');
            } else {
                subcategoryRow.classList.add('hidden');
            }
        }

        // Reset subcategory to "All" when changing main category
        const activeGroup = document.querySelector(`.subcategory-group[data-main-category="${currentCategory}"]`);
        if (activeGroup) {
            const allBtn = activeGroup.querySelector('.sub-filter-btn[data-sub-category*="all"]');
            if (allBtn) {
                activeGroup.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
                allBtn.classList.add('active');
                currentSubCategory = allBtn.dataset.subCategory;
            }
        }
    }

    // ============================================================
    // ---- EVENT LISTENERS ----
    // ============================================================

    // ---- Search ----
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            filterProducts();
        });
    }

    // ---- Category filters (UPDATED: calls updateSubcategories) ----
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            updateSubcategories();    // ← NEW
            filterProducts();
        });
    });

    // ---- Subcategory filters (NEW) ----
    document.querySelectorAll('.sub-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            const parentGroup = this.closest('.subcategory-group');
            if (parentGroup) {
                parentGroup.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
            }
            this.classList.add('active');

            // Set current subcategory
            currentSubCategory = this.dataset.subCategory;
            filterProducts();
        });
    });

    // ---- View toggles ----
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            setView(view);
        });
    });

    // ---- Reset search ----
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
                filterProducts();
            }
        });
    }

    // ============================================================
    // ---- INITIALISE ----
    // ============================================================

    // Set default view
    setView(currentView);

    // Ensure "All" button is active
    document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');

    // Initial call to set up subcategories (NEW)
    updateSubcategories();

    // Initial filter
    filterProducts();

    // ---- Favourites on product cards ----
    document.querySelectorAll('.product-card-fav').forEach(btn => {
        const id = Number(btn.dataset.id);
        const favs = getFavourites();
        if (favs.includes(id)) {
            btn.textContent = '♥';
            btn.classList.add('liked');
            btn.setAttribute('aria-label', 'Remove from favourites');
        }
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const pid = Number(this.dataset.id);
            toggleFavourite(pid, this);
        });
    });

    console.log('Products page initialised.');
})();

// ============================================================
// 10. PRODUCT DETAIL PAGE (gallery, favourites, WhatsApp)
// ============================================================
(function initProductDetail() {
    if (document.body.dataset.page !== 'product-detail') return;

    // ---- Gallery thumbnails ----
    const thumbBtns = document.querySelectorAll('.thumb-btn');
    const mainImage = document.getElementById('mainImage');
    if (thumbBtns.length && mainImage) {
        thumbBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                thumbBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const src = this.dataset.src;
                if (src) mainImage.src = src;
            });
        });
    }

    // ---- Detail favourite (with login check) ----
    const detailFav = document.querySelector('.detail-fav');
    if (detailFav) {
        const id = parseInt(detailFav.dataset.id, 10);
        const favs = getFavourites();
        if (favs.includes(id)) {
            detailFav.textContent = '♥';
            detailFav.classList.add('liked');
            detailFav.setAttribute('aria-label', 'Remove from favourites');
        }

        detailFav.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pid = parseInt(this.dataset.id, 10);

            // If not logged in, show modal and prevent toggle
            if (!isLoggedIn()) {
                const modal = document.getElementById('authModal');
                if (modal) {
                    const event = new CustomEvent('openAuthModal', { detail: { trigger: this } });
                    document.dispatchEvent(event);
                }
                return;
            }

            // Logged in: toggle favourite
            toggleFavourite(pid, this);
        });
    }

    // ---- WhatsApp link ----
    // const whatsappBtns = document.querySelectorAll('.detail-whatsapp');
    // const number = WHATSAPP_NUMBER;
    // whatsappBtns.forEach(btn => {
    //     const name = btn.dataset.productName || 'Product';
    //     const message = `Hello Toke's Sammlung, I am interested in ${name}. Please provide more details.`;
    //     btn.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    // });

    // ---- Related products ----
    const relatedGrid = document.getElementById('relatedGrid');
    if (relatedGrid) {
        const viewButtons = relatedGrid.closest('.related-products').querySelectorAll('.view-btn');
        const resultCount = document.getElementById('relatedResultCount');
        const cards = relatedGrid.querySelectorAll('.product-card');

        if (viewButtons.length && cards.length) {
            let currentView = localStorage.getItem('ts-related-view') || 'grid';

            function setRelatedView(view) {
                currentView = view;
                localStorage.setItem('ts-related-view', view);
                relatedGrid.classList.toggle('list-view', view === 'list');
                viewButtons.forEach(btn => {
                    const isActive = btn.dataset.view === view;
                    btn.classList.toggle('active', isActive);
                });
                if (resultCount) {
                    resultCount.textContent = cards.length + ' piece' + (cards.length !== 1 ? 's' : '');
                }
            }

            setRelatedView(currentView);

            viewButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const view = this.dataset.view;
                    if (view !== currentView) {
                        setRelatedView(view);
                    }
                });
            });
        }

        // ---- Related card favourites ----
        document.querySelectorAll('.related-products .product-card-fav').forEach(btn => {
            const id = parseInt(btn.dataset.id, 10);
            const favs = getFavourites();
            if (favs.includes(id)) {
                btn.textContent = '♥';
                btn.classList.add('liked');
                btn.setAttribute('aria-label', 'Remove from favourites');
            }
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const pid = parseInt(this.dataset.id, 10);
                toggleFavourite(pid, this);
            });
        });
    }

    console.log('Product Details page initialised.');
})();

// ============================================================
// 11. AUTHENTICATION PAGES (password toggle, forms, theme toggle)
// ============================================================
(function initAuthPages() {
    if (document.body.dataset.page !== 'auth') return;

    // ---- Password visibility toggle ----
    const toggleButtons = document.querySelectorAll('.auth-password-toggle');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            const eye = this.querySelector('.auth-eye');
            if (eye) eye.textContent = isPassword ? '◓' : '◒';
        });
    });


    // ---- Login form ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            if (!email || !password) {
                showToast('Please fill in all required fields.', '⚠');
                return;
            }
            showToast('Login successful! Welcome back to Toke\'s Sammlung.', '✓');
        });
    }

    // ---- Register form ----
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName')?.value.trim();
            const email = document.getElementById('registerEmail')?.value.trim();
            const password = document.getElementById('registerPassword')?.value;
            const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
            const terms = document.querySelector('#registerForm input[name="terms"]')?.checked;

            if (!name || !email || !password || !confirmPassword) {
                showToast('Please fill in all required fields.', '⚠');
                return;
            }
            if (password !== confirmPassword) {
                showToast('Passwords do not match. Please try again.', '⚠');
                return;
            }
            if (!terms) {
                showToast('Please agree to the Terms & Conditions.', '⚠');
                return;
            }
            showToast('Account created successfully! Welcome to Toke\'s Sammlung.', '✓');
        });
    }

    console.log('Authentication pages initialised.');

    
})();

// ============================================================
// 12. FEATURED COLLECTION GRID/LIST TOGGLE (Homepage)
// ============================================================
(function initFeaturedToggle() {
    if (document.body.dataset.page) return;

    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    const viewButtons = document.querySelectorAll('.featured-collection .view-btn');
    const resultCount = document.getElementById('featuredResultCount');
    const cards = grid.querySelectorAll('.product-card');

    if (!viewButtons.length || !cards.length) return;

    let currentView = localStorage.getItem('ts-featured-view') || 'grid';

    function setFeaturedView(view) {
        currentView = view;
        localStorage.setItem('ts-featured-view', view);
        grid.classList.toggle('list-view', view === 'list');
        viewButtons.forEach(btn => {
            const isActive = btn.dataset.view === view;
            btn.classList.toggle('active', isActive);
        });
        if (resultCount) {
            resultCount.textContent = cards.length + ' piece' + (cards.length !== 1 ? 's' : '');
        }
    }

    setFeaturedView(currentView);

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            if (view !== currentView) {
                setFeaturedView(view);
            }
        });
    });

    console.log('Featured collection grid/list toggle initialised.');
})();

// ============================================================
// 13. FAVOURITES PAGE – INTERACTIONS & EMPTY STATE
// ============================================================
(function initFavouritesPage() {
    if (document.body.dataset.page !== 'favourites') return;

    const grid = document.getElementById('favouritesGrid');
    const emptyState = document.getElementById('favouritesEmpty');
    if (!grid) return;

    const cards = grid.querySelectorAll('.product-card');
    const favButtons = grid.querySelectorAll('.product-card-fav');

    function updateEmptyState() {
        let visibleCards = 0;
        cards.forEach(card => {
            if (card.style.display !== 'none') visibleCards++;
        });
        if (emptyState) {
            if (visibleCards === 0) {
                emptyState.style.display = 'block';
                grid.style.display = 'none';
            } else {
                emptyState.style.display = 'none';
                grid.style.display = '';
            }
        }
    }

    function syncFavourites() {
        const favs = getFavourites();
        favButtons.forEach(btn => {
            const id = parseInt(btn.dataset.id, 10);
            if (favs.includes(id)) {
                btn.textContent = '♥';
                btn.classList.add('liked');
                btn.setAttribute('aria-label', 'Remove from favourites');
            } else {
                btn.textContent = '♡';
                btn.classList.remove('liked');
                btn.setAttribute('aria-label', 'Add to favourites');
            }
        });
        cards.forEach(card => {
            const id = parseInt(card.dataset.id, 10);
            if (favs.includes(id)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        updateEmptyState();
    }

    // Initial sync
    syncFavourites();

    // Click handler with login check
    favButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id, 10);

            // If not logged in, show modal and return (no toast)
            if (!isLoggedIn()) {
                const modal = document.getElementById('authModal');
                if (modal) {
                    const event = new CustomEvent('openAuthModal', { detail: { trigger: this } });
                    document.dispatchEvent(event);
                }
                return; // <-- prevents toggleFavourite from being called
            }

            // Logged in: toggle favourite and re-sync
            toggleFavourite(id, this);
            syncFavourites();
        });
    });

    console.log('Favourites page initialised.');
})();

// ============================================================
// 14. AUTHENTICATION MODAL – FAVOURITE PROTECTION
// ============================================================
(function initAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const overlay = document.getElementById('authModalOverlay');
    const closeBtn = document.getElementById('authModalClose');
    let activeTrigger = null;

    function openModal(triggerButton) {
        activeTrigger = triggerButton;
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => closeBtn?.focus(), 50);
    }

    function closeModal() {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null;
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    const container = modal.querySelector('.auth-modal-container');
    if (container) {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // ---- Open modal via custom event (for favourites page and detail page) ----
    document.addEventListener('openAuthModal', function(e) {
        openModal(e.detail.trigger);
    });

    // ---- Capturing-phase intercept for favourite clicks on non-favourites pages ----
    // On non-favourites pages, intercept and show modal.
    // On favourites page, the direct listener handles it.
    document.addEventListener('click', function(e) {
        // Check if the click is on a product-card-fav or detail-fav
        const btn = e.target.closest('.product-card-fav') || e.target.closest('.detail-fav');
        if (!btn) return;

        // On the favourites page, the direct listener handles it.
        if (document.body.dataset.page === 'favourites') {
            return;
        }

        // On all other pages, intercept and show the modal.
        e.preventDefault();
        e.stopPropagation();
        openModal(btn);
    }, true); // <-- capturing phase

    console.log('Auth modal initialised.');
})();

console.log('Toke\'s Sammlung — main.js loaded.');


/* ============================================================
   PASSWORD RESET – FORM VALIDATION
   ============================================================ */

(function initPasswordReset() {
    const form = document.getElementById('passwordResetForm');
    if (!form) return;

    const emailInput = document.getElementById('resetEmail');

    // ---- Simple email validation ----
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ---- Form submission ----
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        // Validate empty
        if (!email) {
            if (typeof showToast === 'function') {
                showToast('Please enter your email address.', '⚠');
            }
            emailInput.focus();
            return;
        }

        // Validate format
        if (!isValidEmail(email)) {
            if (typeof showToast === 'function') {
                showToast('Please enter a valid email address.', '⚠');
            }
            emailInput.focus();
            return;
        }

        // Valid – show success toast and redirect to next step
        if (typeof showToast === 'function') {
            showToast('Check your email for reset instructions.', '✓');
        }

        // In a real Django implementation, this would submit the form.
        // For frontend demo, redirect to the next page (password-reset-complete.html).
        setTimeout(function() {
            window.location.href = 'password-reset-done.html';
        }, 1500);
    });

    console.log('Password reset page initialised.');
})();


/* ============================================================
   PASSWORD RESET CONFIRM – VALIDATION & REQUIREMENTS
   ============================================================ */

(function initResetConfirm() {
    const form = document.getElementById('resetConfirmForm');
    if (!form) return;

    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const reqLength = document.getElementById('reqLength');

    // ---- Update password requirements in real-time ----
    function updateRequirements() {
        const val = newPassword.value;
        const hasLength = val.length >= 8;

        if (reqLength) {
            reqLength.classList.toggle('valid', hasLength);
            reqLength.classList.toggle('invalid', !hasLength && val.length > 0);
        }
    }

    if (newPassword) {
        newPassword.addEventListener('input', updateRequirements);
    }

    // ---- Form submission ----
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const pw = newPassword.value.trim();
        const confirm = confirmPassword.value.trim();

        // Check empty
        if (!pw) {
            if (typeof showToast === 'function') {
                showToast('Please enter a new password.', '⚠');
            }
            newPassword.focus();
            return;
        }

        if (!confirm) {
            if (typeof showToast === 'function') {
                showToast('Please confirm your new password.', '⚠');
            }
            confirmPassword.focus();
            return;
        }

        // Check length
        if (pw.length < 8) {
            if (typeof showToast === 'function') {
                showToast('Password must be at least 8 characters.', '⚠');
            }
            newPassword.focus();
            return;
        }

        // Check match
        if (pw !== confirm) {
            if (typeof showToast === 'function') {
                showToast('Passwords do not match. Please try again.', '⚠');
            }
            confirmPassword.focus();
            confirmPassword.select();
            return;
        }

        // Valid – show success and redirect
        if (typeof showToast === 'function') {
            showToast('Password reset successfully! You can now log in.', '✓');
        }

        // In a real Django implementation, this would submit the form.
        // For frontend demo, redirect to the done page.
        setTimeout(function() {
            window.location.href = 'password-reset-complete.html';
        }, 1500);
    });

    console.log('Password reset confirmation page initialised.');
})();



/* ============================================================
   SCROLL TO TOP – PREMIUM, NON-INTRUSIVE
   ============================================================ */

(function initScrollToTop() {
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (!scrollBtn) return; // Exit gracefully if button doesn't exist

    let isVisible = false;
    let scrollTimeout = null;

    // ---- Check scroll position and toggle visibility ----
    function checkScrollPosition() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const threshold = 300; // Show after 300px of scrolling

        if (scrollY > threshold && !isVisible) {
            scrollBtn.classList.add('visible');
            isVisible = true;
        } else if (scrollY <= threshold && isVisible) {
            scrollBtn.classList.remove('visible');
            isVisible = false;
        }
    }

    // ---- Throttled scroll listener ----
    function handleScroll() {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(checkScrollPosition);
    }

    // ---- Click handler ----
    function handleClick(e) {
        e.preventDefault();
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        // Immediately hide the button after click (optional)
        // It will reappear if the user scrolls back down
    }

    // ---- Attach events ----
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollBtn.addEventListener('click', handleClick);

    // ---- Check initial position on load ----
    // Use a small delay to let the page settle
    setTimeout(checkScrollPosition, 100);

    // ---- Also check on resize (user might change viewport) ----
    window.addEventListener('resize', checkScrollPosition, { passive: true });

    console.log('Scroll-to-top button initialised.');
})();



/* ============================================================
   PREMIUM ANIMATION SYSTEM – ENHANCED 10X
   ============================================================ */

(function initAnimations() {
    if (typeof IntersectionObserver === 'undefined') {
        // Fallback: reveal all
        document.querySelectorAll('.anim-ready, .anim-fade-up, .anim-fade-in, .anim-scale-in, .anim-reveal-image, .anim-slide-right, .anim-slide-left, .anim-stagger, .anim-hero-eyebrow, .anim-hero-title, .anim-hero-description, .anim-hero-actions, .anim-hero-image').forEach(el => {
            el.classList.add('anim-visible');
        });
        return;
    }

    // ---- Helper: check if element is near viewport ----
    function isElementNearViewport(el, offset = 150) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight + offset;
    }

    // ---- Hero entrance (with a more generous delay) ----
    function initHeroAnimation() {
        const heroElements = document.querySelectorAll('.anim-hero-eyebrow, .anim-hero-title, .anim-hero-description, .anim-hero-actions, .anim-hero-image');
        if (heroElements.length === 0) return;

        const hero = heroElements[0].closest('.hero, .about-hero, .contact-hero, .products-hero');
        if (hero && isElementNearViewport(hero, 300)) {
            heroElements.forEach(el => {
                el.classList.add('anim-visible');
            });
            return;
        }

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heroElements.forEach(el => {
                        el.classList.add('anim-visible');
                    });
                    heroObserver.disconnect();
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

        if (hero) {
            heroObserver.observe(hero);
        } else {
            heroObserver.observe(heroElements[0].closest('section') || heroElements[0]);
        }
    }

    // ---- Scroll-reveal with better thresholds ----
    function initScrollReveals() {
        const animElements = document.querySelectorAll(
            '.anim-fade-up, .anim-fade-in, .anim-scale-in, ' +
            '.anim-reveal-image, .anim-slide-right, .anim-slide-left, ' +
            '.anim-stagger, .anim-ready'
        );
        if (animElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -50px 0px'
        });

        animElements.forEach(el => {
            if (el.classList.contains('anim-visible')) return;
            revealObserver.observe(el);
        });
    }

    // ---- Stagger parents ----
    function initStaggerParents() {
        const staggerParents = document.querySelectorAll('.anim-stagger');
        if (staggerParents.length === 0) return;

        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-visible');
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -50px 0px'
        });

        staggerParents.forEach(el => {
            if (el.classList.contains('anim-visible')) return;
            staggerObserver.observe(el);
        });
    }

    // ---- Image reveals (already in view) ----
    function initImageReveals() {
        document.querySelectorAll('.anim-reveal-image').forEach(img => {
            if (isElementNearViewport(img, 150)) {
                img.classList.add('anim-visible');
            }
        });
    }

    // ---- Run on load ----
    function runAnimations() {
        // Slight delay for layout stability
        setTimeout(() => {
            initHeroAnimation();
            initImageReveals();
            setTimeout(() => {
                initScrollReveals();
                initStaggerParents();
            }, 150);
        }, 80);
    }

    if (document.readyState === 'complete') {
        runAnimations();
    } else {
        window.addEventListener('load', runAnimations);
    }

    // ---- Fallback on DOMContentLoaded for hero visibility ----
    document.addEventListener('DOMContentLoaded', function() {
        if (document.readyState === 'complete') return;
        document.querySelectorAll('.anim-hero-eyebrow, .anim-hero-title, .anim-hero-description, .anim-hero-actions, .anim-hero-image').forEach(el => {
            if (isElementNearViewport(el, 200)) {
                el.classList.add('anim-visible');
            }
        });
        document.querySelectorAll('.anim-reveal-image').forEach(img => {
            if (isElementNearViewport(img, 150)) {
                img.classList.add('anim-visible');
            }
        });
    });

    console.log('Enhanced animation system initialised.');
})();


/* ============================================================
   LOGIN / REGISTER THEME TOGGLE – ISOLATED
   ============================================================ */

(function initLoginToggle() {
    const toggle = document.querySelector('.login-toggle-btn');
    if (!toggle) return; // Only runs on login/register pages

    function updateToggle() {
        const isDark = document.documentElement.classList.contains('dark');
        toggle.innerHTML = isDark
            ? '<span class="theme-icon" aria-hidden="true">☾</span>'
            : '<span class="theme-icon" aria-hidden="true">☀</span>';
        toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    }

    // Initial sync
    updateToggle();

    // Click handler
    toggle.addEventListener('click', function(e) {
        e.preventDefault();

        // Toggle dark class
        document.documentElement.classList.toggle('dark');
        const nowDark = document.documentElement.classList.contains('dark');

        // Save to localStorage
        localStorage.setItem('ts-theme', nowDark ? 'dark' : 'light');

        // Update this toggle
        updateToggle();

        // Also update main navbar toggle if it exists
        const mainToggle = document.getElementById('themeToggle');
        if (mainToggle) {
            mainToggle.innerHTML = nowDark
                ? '<span class="theme-icon" aria-hidden="true">☾</span>'
                : '<span class="theme-icon" aria-hidden="true">☀</span>';
            mainToggle.setAttribute('aria-checked', nowDark ? 'true' : 'false');
        }
    });

    console.log('Login toggle initialised.');
})();