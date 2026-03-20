/************************************
 GLOBAL PRODUCT DATA
*************************************/
const PRODUCTS = [
    { id: 1, name: "Product 1", price: 49.99, category: "clothing", image: "assets/images/product1.jpg" },
    { id: 2, name: "Product 2", price: 79.99, category: "shoes", image: "assets/images/product2.jpg" },
    { id: 3, name: "Product 3", price: 29.99, category: "accessories", image: "assets/images/product3.jpg" },
    { id: 4, name: "Product 4", price: 59.99, category: "clothing", image: "assets/images/product4.jpg" }
];

/************************************
 STORAGE
*************************************/
const STORAGE_KEY = "cart";

const getCart = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const saveCart = (cart) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

/************************************
 CART
*************************************/
function addToCart(product, qty = 1) {
    if (!product) return;

    let cart = getCart();
    let item = cart.find(i => i.id === product.id);

    qty = parseInt(qty) || 1;

    if (item) {
        item.qty += qty;
    } else {
        cart.push({ ...product, qty });
    }

    saveCart(cart);
    updateCartBadge();
    alert(`${product.name} added to cart ✅`);
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i.id !== id));
    renderCartPage();
    updateCartBadge();
}

function updateQty(id, qty) {
    let cart = getCart();
    let item = cart.find(i => i.id === id);

    if (!item) return;

    item.qty = Math.max(1, parseInt(qty) || 1);
    saveCart(cart);

    renderCartPage();
    updateCartBadge();
}

function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    renderCartPage();
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.querySelector(".cart-badge");
    if (!badge) return;

    const total = getCart().reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = total;
}

/************************************
 PRODUCTS PAGE
*************************************/
function renderProductsPage() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;

    const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "";
    const sort = document.getElementById("sortSelect")?.value || "";

    let data = PRODUCTS.filter(p => p.name.toLowerCase().includes(search));

    if (category) {
        data = data.filter(p => p.category === category);
    }

    if (sort === "low") data.sort((a, b) => a.price - b.price);
    if (sort === "high") data.sort((a, b) => b.price - a.price);

    grid.innerHTML = data.map(p => `
        <div class="col-md-12">
            <div class="card h-100 shadow-sm" onclick="viewProduct(${p.id})" style="cursor:pointer">
                <img src="${p.image}" class="card-img-top">
                <div class="card-body text-center">
                    <h5>${p.name}</h5>
                    <p class="fw-bold">$${p.price}</p>

                    <button class="btn btn-primary btn-sm btn-add-cart" data-id="${p.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join("") || `<div class="col-12 text-center">No products found</div>`;
}

function initProductFilters() {
    ["searchInput", "categoryFilter", "sortSelect"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", renderProductsPage);
        document.getElementById(id)?.addEventListener("change", renderProductsPage);
    });
}

/************************************
 PRODUCT DETAILS
*************************************/
function renderProductDetails() {
    const nameEl = document.querySelector(".product-info h1");
    if (!nameEl) return;

    const id = Number(new URLSearchParams(location.search).get("id"));
    const product = PRODUCTS.find(p => p.id === id);

    if (!product) return;

    document.querySelector(".main-image").src = product.image;
    nameEl.textContent = product.name;
    document.querySelector(".price").textContent = `$${product.price}`;

    document.querySelector(".btn-add-cart").onclick = () => {
        const qty = document.getElementById("quantity").value;
        addToCart(product, qty);
    };

    // RELATED
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id);

    document.getElementById("relatedProducts").innerHTML = related.map(p => `
        <div class="col">
            <div class="card p-2 text-center" onclick="viewProduct(${p.id})">
                <img src="${p.image}" class="img-fluid">
                <h6>${p.name}</h6>
            </div>
        </div>
    `).join("");
}

/************************************
 CART PAGE
*************************************/
function renderCartPage() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    const empty = document.getElementById("emptyCart");
    const cart = getCart();

    if (!cart.length) {
        container.innerHTML = "";
        empty.classList.remove("d-none");
        document.getElementById("subtotal").textContent = "0.00";
        document.getElementById("total").textContent = "0.00";
        return;
    }

    empty.classList.add("d-none");

    let total = 0;

    container.innerHTML = cart.map(item => {
        const t = item.price * item.qty;
        total += t;

        return `
        <tr>
            <td class="d-flex align-items-center gap-2">
                <img src="${item.image}" width="50">
                ${item.name}
            </td>

            <td>$${item.price}</td>

            <td>
                <input type="number" value="${item.qty}" min="1"
                    class="form-control cart-qty"
                    data-id="${item.id}">
            </td>

            <td>$${t.toFixed(2)}</td>

            <td>
                <button class="btn btn-danger btn-sm btn-remove" data-id="${item.id}">
                    Remove
                </button>
            </td>
        </tr>`;
    }).join("");

    document.getElementById("subtotal").textContent = total.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
}

/************************************
 EVENTS
*************************************/
function initEvents() {

    document.body.addEventListener("click", e => {

        if (e.target.classList.contains("btn-add-cart")) {
            e.stopPropagation();
            const id = Number(e.target.dataset.id);
            addToCart(PRODUCTS.find(p => p.id === id));
        }

        if (e.target.classList.contains("btn-remove")) {
            removeFromCart(Number(e.target.dataset.id));
        }
    });

    document.body.addEventListener("change", e => {
        if (e.target.classList.contains("cart-qty")) {
            updateQty(Number(e.target.dataset.id), e.target.value);
        }
    });
}

/************************************
 NAVIGATION
*************************************/
function viewProduct(id) {
    window.location.href = `product-details.html?id=${id}`;
}

/************************************
 Navbar User Display
*************************************/
function updateNavbarUser() {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const nav = document.querySelector(".navbar-nav");

    if (!nav) return;

    if (user) {
        nav.innerHTML += `
            <li class="nav-item ms-2">
                <span class="nav-link">Hi, ${user.name}</span>
            </li>
            <li class="nav-item">
                <button class="btn btn-sm btn-danger" onclick="logout()">Logout</button>
            </li>
        `;
    }
}

/************************************
 INIT
*************************************/
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    initEvents();
    initProductFilters();

    renderProductsPage();
    renderProductDetails();
    renderCartPage();
    updateNavbarUser();
});

/************************************
 AUTH SYSTEM (LOCAL STORAGE)
*************************************/
const USER_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

// GET USERS
function getUsers() {
    return JSON.parse(localStorage.getItem(USER_KEY)) || [];
}

// SAVE USERS
function saveUsers(users) {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
}

// REGISTER
function handleRegister() {
    const form = document.querySelector(".register-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirm").value;

        if (password !== confirm) {
            alert("Passwords do not match ❌");
            return;
        }

        let users = getUsers();

        const exists = users.find(u => u.email === email);

        if (exists) {
            alert("User already exists ⚠️");
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password
        };

        users.push(newUser);
        saveUsers(users);

        alert("Registration successful ✅");

        window.location.href = "login.html";
    });
}

// LOGIN
function handleLogin() {
    const form = document.querySelector(".login-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = getUsers();

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            alert("Invalid credentials ❌");
            return;
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        alert(`Welcome ${user.name} 🎉`);

        window.location.href = "index.html";
    });
}

// LOGOUT
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
}

// CHECK LOGIN STATE
function checkAuth() {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    // Example: protect checkout page
    if (document.querySelector(".checkout-page") && !user) {
        alert("Please login first 🔐");
        window.location.href = "login.html";
    }
}

/************************************
 INIT (ADD BELOW YOUR EXISTING INIT)
*************************************/
document.addEventListener("DOMContentLoaded", () => {
    handleRegister();
    handleLogin();
    checkAuth();
});