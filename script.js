let products = JSON.parse(localStorage.getItem("products")) || [
  {id:1,name:"محصول ۱",price:100,img:"https://via.placeholder.com/150",desc:"توضیح محصول ۱"},
  {id:2,name:"محصول ۲",price:200,img:"https://via.placeholder.com/150",desc:"توضیح محصول ۲"}
];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ذخیره داده‌ها
function saveProducts(){ localStorage.setItem("products",JSON.stringify(products)); }
function saveCart(){ localStorage.setItem("cart",JSON.stringify(cart)); }

// سبد خرید
function updateCartButton(){
  let total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  const btn=document.getElementById("cartBtn");
  if(btn) btn.textContent=`سبد خرید: ${total.toLocaleString()} افغانی`;
}
updateCartButton();

// افزودن به سبد خرید
function addToCart(id,qty=1){
  const prod = products.find(p=>p.id===id);
  const exist = cart.find(c=>c.id===id);
  if(exist){ exist.qty+=qty; } else { cart.push({...prod, qty}); }
  saveCart();
  updateCartButton();
}

// حذف از سبد خرید
function removeCart(id){
  cart=cart.filter(c=>c.id!==id);
  saveCart();
  updateCartButton();
}

// تغییر تعداد در سبد
function changeQty(id,delta){
  const item = cart.find(c=>c.id===id);
  if(item){
    item.qty += delta;
    if(item.qty<1) item.qty=1;
    saveCart();
    updateCartButton();
    renderCartPage();
  }
}
