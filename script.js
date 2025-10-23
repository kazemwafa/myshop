let products = JSON.parse(localStorage.getItem("products")) || [
  {id:1, name:"گوشی سامسونگ A15", price:8900000, cat:"موبایل", desc:"گوشی اقتصادی با صفحه AMOLED", img:"https://dkstatics-public.digikala.com/digikala-products/dc4a7b13.jpg"},
  {id:2, name:"لپ‌تاپ ASUS i5", price:24900000, cat:"لپ‌تاپ", desc:"لپ‌تاپ سبک و سریع مناسب کار روزانه", img:"https://dkstatics-public.digikala.com/digikala-products/7b3a.jpg"},
  {id:3, name:"ساعت هوشمند شیائومی", price:3200000, cat:"لوازم دیجیتال", desc:"دارای حسگر سلامتی و نمایش نوتیفیکیشن", img:"https://dkstatics-public.digikala.com/digikala-products/9fda.jpg"},
  {id:4, name:"هودی مشکی مردانه", price:580000, cat:"لباس", desc:"جنس پنبه‌ای و نرم، مناسب فصل سرد", img:"https://dkstatics-public.digikala.com/digikala-products/hoodie.jpg"},
];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentCat = "همه";
let currentUser = null;

const catsDiv = document.getElementById("cats");
const productGrid = document.getElementById("productGrid");
const modalRoot = document.getElementById("modalRoot");

function renderCategories() {
  let cats = ["همه", ...new Set(products.map(p=>p.cat))];
  catsDiv.innerHTML = "";
  cats.forEach(c=>{
    let el = document.createElement("div");
    el.className = "cat" + (currentCat===c?" active":"");
    el.innerText = c;
    el.onclick = ()=>{currentCat=c; renderCategories(); renderProducts();};
    catsDiv.appendChild(el);
  });
}

function renderProducts() {
  let list = [...products];
  if(currentCat!=="همه") list = list.filter(p=>p.cat===currentCat);

  let q = document.getElementById("searchInput").value.trim();
  if(q) list = list.filter(p=>p.name.includes(q) || p.desc.includes(q));

  let min = parseInt(document.getElementById("minPrice").value) || 0;
  let max = parseInt(document.getElementById("maxPrice").value) || 1e9;
  list = list.filter(p=>p.price>=min && p.price<=max);

  let sort = document.getElementById("sortBy").value;
  if(sort==="price-asc") list.sort((a,b)=>a.price-b.price);
  else if(sort==="price-desc") list.sort((a,b)=>b.price-a.price);

  productGrid.innerHTML = "";
  list.forEach(p=>{
    let div = document.createElement("div");
    div.className="card";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">${p.price.toLocaleString()} تومان</div>
      <div class="card-actions">
        <button class="btn add" onclick="addToCart(${p.id})">خرید</button>
        <button class="btn view" onclick="viewProduct(${p.id})">جزئیات</button>
      </div>
    `;
    productGrid.appendChild(div);
  });
}

function addToCart(id){
  let p = products.find(x=>x.id===id);
  let ex = cart.find(c=>c.id===id);
  if(ex) ex.qty++;
  else cart.push({...p, qty:1});
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI(){
  document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
  document.getElementById("cartTotalFab").innerText = cart.reduce((a,b)=>a+b.price*b.qty,0).toLocaleString() + " تومان";
}

function doSearch(){ renderProducts(); }

function viewProduct(id){
  let p = products.find(x=>x.id===id);
  modalRoot.style.display="flex";
  modalRoot.innerHTML = `
  <div class="modal-back" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="row">
        <img src="${p.img}">
        <div>
          <h3>${p.name}</h3>
          <div class="price">${p.price.toLocaleString()} تومان</div>
          <p>${p.desc}</p>
          <button class="btn add" onclick="addToCart(${p.id});closeModal()">افزودن به سبد</button>
        </div>
      </div>
    </div>
  </div>`;
}

function closeModal(e){ modalRoot.style.display="none"; }

function applyPriceFilter(){ renderProducts(); }

// Admin functions
function openAdmin(){
  document.getElementById("adminModal").style.display="flex";
}
function closeAdmin(){
  document.getElementById("adminModal").style.display="none";
}
function doLogin(){
  let pass = document.getElementById("adminPass").value;
  if(pass==="1234"){
    currentUser="admin";
    document.getElementById("adminArea").style.display="block";
    renderAdminList();
  } else alert("رمز اشتباه است");
}
function logoutAdmin(){
  currentUser=null;
  document.getElementById("adminArea").style.display="none";
}
function addProductFromAdmin(){
  let name=document.getElementById("pName").value.trim();
  let price=parseInt(document.getElementById("pPrice").value);
  let cat=document.getElementById("pCat").value.trim()||"عمومی";
  let desc=document.getElementById("pDesc").value.trim();
  let img=document.getElementById("pImage").value.trim();
  const file=document.getElementById("pImageFile").files[0];
  if(file){
    let reader=new FileReader();
    reader.onload=e=>{
      saveNewProduct(name,price,cat,desc,e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    saveNewProduct(name,price,cat,desc,img);
  }
}

function saveNewProduct(name,price,cat,desc,img){
  if(!name || !price){alert("نام و قیمت لازم است");return;}
  let id=Date.now();
  products.push({id,name,price,cat,desc,img});
  localStorage.setItem("products",JSON.stringify(products));
  renderAdminList();
  renderCategories();
  renderProducts();
}

function renderAdminList(){
  let div=document.getElementById("adminList");
  div.innerHTML="";
  products.forEach(p=>{
    let el=document.createElement("div");
    el.className="card-edit";
    el.innerHTML=`
      <span>${p.name}</span>
      <button class="btn" onclick="deleteProduct(${p.id})">حذف</button>`;
    div.appendChild(el);
  });
}

function deleteProduct(id){
  products=products.filter(p=>p.id!==id);
  localStorage.setItem("products",JSON.stringify(products));
  renderAdminList();
  renderProducts();
}

function exportData(){
  let blob=new Blob([JSON.stringify(products)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="products.json";
  a.click();
}

function importData(e){
  let file=e.target.files[0];
  if(!file)return;
  let reader=new FileReader();
  reader.onload=ev=>{
    try{
      let arr=JSON.parse(ev.target.result);
      products=arr;
      localStorage.setItem("products",JSON.stringify(products));
      renderCategories();
      renderProducts();
      alert("درون‌ریزی موفق بود");
    }catch{alert("فایل نامعتبر است")}
  };
  reader.readAsText(file);
}

// slider
let sliderImgs=[
  "https://dkstatics-public.digikala.com/digikala-adservice-banners/slider1.jpg",
  "https://dkstatics-public.digikala.com/digikala-adservice-banners/slider2.jpg",
  "https://dkstatics-public.digikala.com/digikala-adservice-banners/slider3.jpg"
];
let sindex=0;
function renderSlider(){
  const s=document.getElementById("slider");
  s.innerHTML=`<img src="${sliderImgs[sindex]}">`;
}
setInterval(()=>{sindex=(sindex+1)%sliderImgs.length;renderSlider();},3000);

// init
renderCategories();
renderProducts();
renderSlider();
updateCartUI();
function doLogin() {
  const pass = document.getElementById("adminPass").value;
  if(pass === "5790") {    // رمز جدید
    document.getElementById("loginArea").style.display="none";
    document.getElementById("adminArea").style.display="block";
    renderAdminList();
  } else alert("رمز اشتباه است!");
}

function logoutAdmin() {
  document.getElementById("adminArea").style.display="none";
  document.getElementById("loginArea").style.display="block";
}

// افزودن محصول از پنل ادمین
function addProductFromAdmin(){
  let name=document.getElementById("pName").value.trim();
  let price=parseInt(document.getElementById("pPrice").value);
  let cat=document.getElementById("pCat").value.trim()||"عمومی";
  let desc=document.getElementById("pDesc").value.trim();
  let img=document.getElementById("pImage").value.trim();
  const file=document.getElementById("pImageFile").files[0];
  if(file){
    let reader=new FileReader();
    reader.onload=e=>{
      saveNewProduct(name,price,cat,desc,e.target.result);
    };
    reader.readAsDataURL(file);
  } else saveNewProduct(name,price,cat,desc,img);
}

function saveNewProduct(name,price,cat,desc,img){
  if(!name || !price){alert("نام و قیمت لازم است");return;}
  let id=Date.now();
  products.push({id,name,price,cat,desc,img});
  localStorage.setItem("products",JSON.stringify(products));
  renderAdminList();
  renderCategories();
  renderProducts();
}

// نمایش لیست محصولات در پنل
function renderAdminList(){
  const div=document.getElementById("adminList");
  div.innerHTML="";
  products.forEach(p=>{
    let el=document.createElement("div");
    el.className="card-edit";
    el.innerHTML=`<span>${p.name}</span>
                  <button onclick="deleteProduct(${p.id})">حذف</button>`;
    div.appendChild(el);
  });
}

// حذف محصول
function deleteProduct(id){
  products=products.filter(p=>p.id!==id);
  localStorage.setItem("products",JSON.stringify(products));
  renderAdminList();
  renderProducts();
}

// خروجی و درون‌ریزی JSON
function exportData(){
  let blob=new Blob([JSON.stringify(products)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="products.json";
  a.click();
}

function importData(e){
  let file=e.target.files[0];
  if(!file) return;
  let reader=new FileReader();
  reader.onload=ev=>{
    try{
      let arr=JSON.parse(ev.target.result);
      products=arr;
      localStorage.setItem("products",JSON.stringify(products));
      renderCategories();
      renderProducts();
      renderAdminList();
      alert("درون‌ریزی موفق بود");
    } catch { alert("فایل نامعتبر است"); }
  };
  reader.readAsText(file);
}

