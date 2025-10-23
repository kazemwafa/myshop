// ===== داده‌ها =====
let products = JSON.parse(localStorage.getItem("products")) || [
  {id:1,name:"محصول ۱",price:1000,img:"https://via.placeholder.com/150",desc:"توضیح محصول ۱"},
  {id:2,name:"محصول ۲",price:2000,img:"https://via.placeholder.com/150",desc:"توضیح محصول ۲"}
];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===== ذخیره =====
function saveProducts(){ localStorage.setItem("products",JSON.stringify(products)); }
function saveCart(){ localStorage.setItem("cart",JSON.stringify(cart)); }

// ===== سبد خرید =====
function updateCartButton(){
  let total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  const btn=document.getElementById("cartBtn");
  if(btn) btn.textContent=`سبد خرید: ${total.toLocaleString()} AFN`;
}
updateCartButton();
function addToCart(id,qty=1){
  const prod = products.find(p=>p.id===id);
  const exist = cart.find(c=>c.id===id);
  if(exist){ exist.qty+=qty; } else { cart.push({...prod, qty}); }
  saveCart();
  updateCartButton();
}
function removeCart(id){
  cart=cart.filter(c=>c.id!==id);
  saveCart();
  updateCartButton();
}
function changeQty(id,delta){
  const item = cart.find(c=>c.id===id);
  if(item){
    item.qty += delta;
    if(item.qty<1) item.qty=1;
    saveCart();
    updateCartButton();
    renderCartPage && renderCartPage();
  }
}

// ===== پنل ادمین =====
function doLogin() {
  const pass = document.getElementById("adminPass").value;
  if(pass==="5790"){
    document.getElementById("loginArea").style.display="none";
    document.getElementById("adminArea").style.display="block";
    renderAdminList();
  } else alert("رمز اشتباه است!");
}
function logoutAdmin(){
  document.getElementById("adminArea").style.display="none";
  document.getElementById("loginArea").style.display="block";
}
function addProductFromAdmin(){
  let name=document.getElementById("pName").value.trim();
  let price=parseInt(document.getElementById("pPrice").value);
  let desc=document.getElementById("pDesc").value.trim();
  let img=document.getElementById("pImage").value.trim();
  if(!name||!price){alert("نام و قیمت لازم است"); return;}
  let id=Date.now();
  products.push({id,name,price,desc,img});
  saveProducts();
  renderAdminList();
}
function renderAdminList(){
  const div=document.getElementById("adminList");
  if(!div) return;
  div.innerHTML="";
  products.forEach(p=>{
    let el=document.createElement("div");
    el.className="card-edit";
    el.innerHTML=`<span>${p.name}</span> <button onclick="deleteProduct(${p.id})">حذف</button>`;
    div.appendChild(el);
  });
}
function deleteProduct(id){
  products=products.filter(p=>p.id!==id);
  saveProducts();
  renderAdminList();
}

// ===== پرداخت سبد =====
function checkout(){
  if(cart.length===0){ alert("سبد خرید خالی است!"); return; }
  let total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  alert(`پرداخت با موفقیت ✅\nجمع کل: ${total.toLocaleString()} AFN`);
  cart=[];
  saveCart();
  renderCartPage && renderCartPage();
  updateCartButton();
}