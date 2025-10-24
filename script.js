// ================= Firebase Config =================
// ⚠️ حتماً مقدارهای زیر را با اطلاعات پروژه‌ی Firebase خودت جایگزین کن
const firebaseConfig = {
  apiKey: "API_KEY_HERE",
  authDomain: "PROJECT_ID.firebaseapp.com",
  databaseURL: "https://PROJECT_ID.firebaseio.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// ================= Initialize Firebase =================
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================== مدیریت محصولات ==================
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// دریافت محصولات از Firebase
function loadProducts() {
  db.ref("products").on("value", snapshot => {
    products = [];
    snapshot.forEach(item => {
      let p = item.val();
      p.id = item.key;
      products.push(p);
    });
    renderProducts();
    renderAdminProducts();
    updateCartButton();
    renderProductDetail();
  });
}

// ================== سبد خرید ==================
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartButton() {
  let total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const btn = document.getElementById("cartBtn");
  if (btn) btn.textContent = `سبد خرید: ${total.toLocaleString()} AFN`;
}

function addToCart(id, qty = 1) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  const exist = cart.find(c => c.id === id);
  if (exist) {
    exist.qty += qty;
  } else {
    cart.push({ ...prod, qty });
  }
  saveCart();
  updateCartButton();
  alert("محصول به سبد خرید اضافه شد ✅");
}

function removeCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartButton();
  renderCartPage();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty < 1) item.qty = 1;
    saveCart();
    updateCartButton();
    renderCartPage();
  }
}

// ================== پنل ادمین ==================
const ADMIN_PASSWORD = "5790";

function doLogin() {
  const val = document.getElementById("adminPass").value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById("loginArea").style.display = "none";
    document.getElementById("adminArea").style.display = "block";
  } else alert("رمز اشتباه است!");
}

function logoutAdmin() {
  document.getElementById("loginArea").style.display = "block";
  document.getElementById("adminArea").style.display = "none";
}

function addProductFromAdmin() {
  const name = document.getElementById("pName").value.trim();
  const img = document.getElementById("pImage").value.trim();
  const price = parseInt(document.getElementById("pPrice").value);
  const desc = document.getElementById("pDesc").value.trim();

  if (name && img && price && desc) {
    const newProd = { name, img, price, desc };
    db.ref("products").push(newProd);
    alert("محصول اضافه شد ✅");
    document.getElementById("pName").value = "";
    document.getElementById("pImage").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pDesc").value = "";
  } else {
    alert("تمام فیلدها را پر کنید!");
  }
}

function deleteProduct(id) {
  db.ref("products/" + id).remove();
}

function renderAdminProducts() {
  const div = document.getElementById("adminList");
  if (!div) return;
  div.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card-edit";
    card.innerHTML = `
      <span>${p.name} - ${p.price.toLocaleString()} AFN</span>
      <button onclick="deleteProduct('${p.id}')">حذف</button>
    `;
    div.appendChild(card);
  });
}

// ================== نمایش محصولات ==================
function renderProducts() {
  const div = document.getElementById("products");
  if (!div) return;
  div.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.price.toLocaleString()} AFN</p>
      <button onclick="location.href='product.html?id=${p.id}'">جزئیات</button>
    `;
    div.appendChild(card);
  });
}

// ================== صفحه جزئیات محصول ==================
function renderProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  if (!id) return;
  const prod = products.find(p => p.id === id);
  const div = document.getElementById("productDetail");
  if (!div || !prod) return;
  div.innerHTML = `
    <img src="${prod.img}" alt="${prod.name}">
    <h2>${prod.name}</h2>
    <p>قیمت: ${prod.price.toLocaleString()} AFN</p>
    <p>${prod.desc}</p>
    <button onclick="addToCart('${prod.id}')">افزودن به سبد خرید</button>
  `;
}

// ================== صفحه سبد خرید ==================
function renderCartPage() {
  const cartDiv = document.getElementById("cartList");
  if (!cartDiv) return;
  cartDiv.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price.toLocaleString()} AFN × 
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">-</button>
          ${item.qty}
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </p>
      </div>
      <button class="remove-btn" onclick="removeCart('${item.id}')">حذف</button>
    `;
    cartDiv.appendChild(div);
  });

  const totalDiv = document.getElementById("cartTotal");
  if (totalDiv) totalDiv.textContent = `جمع کل: ${total.toLocaleString()} AFN`;
}

// ================== اجرا ==================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartButton();
  renderCartPage();
});