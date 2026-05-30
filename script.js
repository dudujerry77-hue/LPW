
// ══════════════════════════════════════════════
//  SEED DATA — 10 default products
// ══════════════════════════════════════════════
const SEED_PRODUCTS = [
  {id:1,name:"Jollof Rice Combo",category:"Food & Drinks",price:3500,desc:"Premium party jollof rice with grilled chicken, plantain, and coleslaw. Freshly prepared daily.",emoji:"🍛",badge:"hot",rating:4.8,reviews:142},
  {id:2,name:"Ankara Print Dress",category:"Clothing",price:18500,desc:"Vibrant hand-crafted Ankara fabric dress. Available in sizes S–XXL. Perfect for occasions.",emoji:"👗",badge:"new",rating:4.6,reviews:87},
  {id:3,name:"iPhone 15 Pro Max",category:"Phones & Accessories",price:1250000,desc:"Apple iPhone 15 Pro Max 256GB. Brand new, sealed box with full warranty. All colours available.",emoji:"📱",badge:"hot",rating:4.9,reviews:321},
  {id:4,name:"Samsung 4K Smart TV 55\"",category:"Electronics",price:420000,desc:"55-inch 4K UHD Smart TV with HDR, built-in Netflix & YouTube. Wall bracket included.",emoji:"📺",badge:"",rating:4.7,reviews:65},
  {id:5,name:"Luxury Skincare Set",category:"Beauty & Skincare",price:22000,desc:"Premium 5-piece skincare routine: cleanser, toner, serum, moisturiser & SPF. All skin types.",emoji:"🧴",badge:"sale",rating:4.5,reviews:198},
  {id:6,name:"Nike Air Force 1",category:"Footwear",price:75000,desc:"Original Nike Air Force 1 sneakers. Unisex sizing 36–46. Comes with original box.",emoji:"👟",badge:"",rating:4.8,reviews:256},
  {id:7,name:"Blender & Juice Extractor",category:"Home & Kitchen",price:35000,desc:"2-in-1 heavy duty blender & cold press juicer. 1500W motor, 2L capacity, BPA-free.",emoji:"🥤",badge:"new",rating:4.4,reviews:43},
  {id:8,name:"WAEC/JAMB Study Pack",category:"Books & Stationery",price:8500,desc:"Complete past questions bundle with answer keys for all subjects. 2015–2025 editions.",emoji:"📚",badge:"",rating:4.7,reviews:512},
  {id:9,name:"Dumbbells Set 20kg",category:"Sports & Fitness",price:48000,desc:"Adjustable dumbbell set 20kg total. Cast iron with rubber grip. Home or gym use.",emoji:"🏋️",badge:"",rating:4.6,reviews:89},
  {id:10,name:"Designer Leather Bag",category:"Bags & Luggage",price:95000,desc:"Hand-stitched genuine leather tote bag. Spacious interior, gold hardware, multiple pockets.",emoji:"👜",badge:"new",rating:4.9,reviews:74}
];

const ADMIN_USER='admin', ADMIN_PASS='admin123';

let state = {
  loggedIn: false,
  products: [],
  cart: [],
  activeFilter: 'all',
  settings: {
    name: 'LUXE STORE',
    whatsapp: '',
    messageTemplate: "Hi! I'd like to order the following items:\n{items}\n\nTotal: {total}\n\nPlease confirm availability."
  }
};

// ── PERSIST ──────────────────────────────────
function loadState() {
  try {
    const s = localStorage.getItem('luxe_v2');
    if (s) {
      const p = JSON.parse(s);
      state.products = p.products && p.products.length ? p.products : SEED_PRODUCTS;
      state.settings = {...state.settings, ...(p.settings||{})};
      state.cart = p.cart || [];
    } else {
      state.products = [...SEED_PRODUCTS];
    }
  } catch(e) { state.products = [...SEED_PRODUCTS]; }
}
function saveState() {
  localStorage.setItem('luxe_v2', JSON.stringify({
    products: state.products,
    settings: state.settings,
    cart: state.cart
  }));
}

// ── NAVIGATION ───────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  if(name==='shop'){renderShop();document.getElementById('nav-shop').classList.add('active')}
  else{document.getElementById('nav-shop').classList.remove('active')}
  if(name==='admin'){
    if(!state.loggedIn) document.getElementById('login-overlay').style.display='flex';
    else document.getElementById('login-overlay').style.display='none';
    refreshDashboard();
  }
  window.scrollTo(0,0);
}
function scrollTo(id){
  document.querySelector(id)&&document.querySelector(id).scrollIntoView({behavior:'smooth'});
}

// ── AUTH ─────────────────────────────────────
function doLogin(){
  const u=document.getElementById('login-user').value.trim();
  const p=document.getElementById('login-pass').value.trim();
  if(u===ADMIN_USER&&p===ADMIN_PASS){
    state.loggedIn=true;
    document.getElementById('login-overlay').style.display='none';
    refreshDashboard();
    toast('Welcome back, Admin!');
  } else {
    document.getElementById('login-err').textContent='Invalid credentials.';
    document.getElementById('login-user').style.borderColor='var(--danger)';
    document.getElementById('login-pass').style.borderColor='var(--danger)';
  }
}
function logout(){state.loggedIn=false;showView('shop')}

// ── ADMIN TABS ───────────────────────────────
function adminTab(tab){
  ['dashboard','products','settings'].forEach(t=>{
    document.getElementById('tab-'+t).style.display=t===tab?'block':'none';
    document.getElementById('si-'+t).classList.toggle('active',t===tab);
  });
  if(tab==='products'){renderAdminProducts()}
  if(tab==='settings'){loadSettingsForm()}
  if(tab==='dashboard'){refreshDashboard()}
}

// ── SHOP RENDER ──────────────────────────────
function getCategories(){
  return [...new Set(state.products.map(p=>p.category))].filter(Boolean);
}

function renderCategoryBar(){
  const bar=document.getElementById('cat-bar');
  const cats=getCategories();
  const pills=cats.map(c=>`<button class="cat-pill${state.activeFilter===c?' active':''}" onclick="filterCat('${c.replace(/'/g,"\\'").replace(/&/g,"and")}',this)">${c}</button>`).join('');
  bar.innerHTML=`<span class="cat-label">Filter:</span><button class="cat-pill${state.activeFilter==='all'?' active':''}" onclick="filterCat('all',this)">All</button>${pills}`;
}

function filterCat(cat,el){
  state.activeFilter=cat;
  renderCategoryBar();
  renderProductGrid();
}

function renderShop(){
  const wa=state.settings.whatsapp;
  if(wa){
    const clean=wa.replace(/\s+/g,'').replace('+','');
    document.getElementById('wa-link').href=`https://wa.me/${clean}`;
    document.getElementById('wa-float').style.display='block';
  } else {
    document.getElementById('wa-float').style.display='none';
  }
  const n=state.settings.name||'LUXE STORE';
  document.querySelector('.nav-logo').textContent=n.substring(0,8).toUpperCase();
  document.getElementById('footer-name').textContent=n.toUpperCase();
  renderCategoryBar();
  renderProductGrid();
  updateCartUI();
}

function renderProductGrid(){
  const grid=document.getElementById('shop-grid');
  const filtered=state.activeFilter==='all'
    ? state.products
    : state.products.filter(p=>p.category===state.activeFilter);

  const countEl=document.getElementById('product-count');
  countEl.textContent=`${filtered.length} item${filtered.length!==1?'s':''}`;
  document.getElementById('hero-product-count').textContent=state.products.length;

  if(!filtered.length){
    grid.innerHTML=`<div class="empty-products"><span>🔍</span>No products in this category.</div>`;
    return;
  }

  grid.innerHTML=filtered.map(p=>{
    const imgEl=p.img
      ?`<img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy">`
      :`<div class="product-emoji-thumb">${p.emoji||'🛍'}</div>`;
    const badge=p.badge?`<div class="product-badge badge-${p.badge}">${p.badge}</div>`:'';
    const stars='★'.repeat(Math.round(p.rating||4))+'☆'.repeat(5-Math.round(p.rating||4));
    const safeN=p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return `
    <div class="product-card">
      <div class="p-img-wrap">${imgEl}${badge}</div>
      <div class="product-info">
        <div class="product-category">${p.category||'General'}</div>
        <div class="product-name">${p.name}</div>
        ${p.desc?`<div class="product-desc">${p.desc}</div>`:''}
        <div class="product-footer">
          <div>
            <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
          </div>
          <div class="product-rating"><span class="stars">${stars}</span>${p.rating||''}</div>
        </div>
      </div>
      <div class="product-overlay">
        <button class="overlay-btn overlay-btn-cart" onclick="addToCart(${p.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.73L23 6H6"/></svg>
          Add to Cart
        </button>
        <button class="overlay-btn overlay-btn-wa" onclick="orderProductWA('${safeN}',${p.price})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Order via WhatsApp
        </button>
      </div>
    </div>`;
  }).join('');
}

// ── CART ─────────────────────────────────────
function addToCart(id){
  const product=state.products.find(p=>p.id===id);
  if(!product) return;
  const existing=state.cart.find(c=>c.id===id);
  if(existing){ existing.qty++; }
  else { state.cart.push({...product, qty:1}); }
  saveState();
  updateCartUI();
  toast(`✓ ${product.name} added to cart`);
}

function updateCartQty(id, delta){
  const item=state.cart.find(c=>c.id===id);
  if(!item) return;
  item.qty+=delta;
  if(item.qty<=0) state.cart=state.cart.filter(c=>c.id!==id);
  saveState();
  updateCartUI();
  renderCartDrawer();
}

function removeFromCart(id){
  state.cart=state.cart.filter(c=>c.id!==id);
  saveState();
  updateCartUI();
  renderCartDrawer();
}

function clearCart(){
  state.cart=[];
  saveState();
  updateCartUI();
  renderCartDrawer();
}

function cartTotal(){
  return state.cart.reduce((s,i)=>s+i.price*i.qty, 0);
}
function cartCount(){
  return state.cart.reduce((s,i)=>s+i.qty, 0);
}

function updateCartUI(){
  const count=cartCount();
  const badge=document.getElementById('cart-badge');
  badge.textContent=count;
  badge.classList.toggle('show', count>0);
  // admin stat
  const statCart=document.getElementById('stat-cart');
  if(statCart) statCart.textContent=count;
}

function renderCartDrawer(){
  const el=document.getElementById('cart-items');
  const foot=document.getElementById('cart-foot');
  if(!state.cart.length){
    el.innerHTML=`<div class="cart-empty"><span>🛒</span><div>Your cart is empty</div><div style="font-size:0.75rem;color:var(--muted)">Add items from the shop</div></div>`;
    foot.style.display='none';
    return;
  }
  foot.style.display='block';
  el.innerHTML=state.cart.map(item=>`
    <div class="cart-item">
      <div class="cart-item-thumb">
        ${item.img?`<img src="${item.img}" alt="${item.name}">`:(item.emoji||'🛍')}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-cat">${item.category||''}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₦${(item.price*item.qty).toLocaleString()}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateCartQty(${item.id},-1)">−</button>
          <div class="qty-val">${item.qty}</div>
          <button class="qty-btn" onclick="updateCartQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
    </div>
  `).join('');
  const total=cartTotal();
  document.getElementById('cart-subtotal').textContent=`₦${total.toLocaleString()}`;
  document.getElementById('cart-total').textContent=`₦${total.toLocaleString()}`;
}

function toggleCart(){
  const drawer=document.getElementById('cart-drawer');
  const backdrop=document.getElementById('cart-backdrop');
  const open=drawer.classList.contains('open');
  drawer.classList.toggle('open',!open);
  backdrop.classList.toggle('open',!open);
  if(!open) renderCartDrawer();
}

function checkoutWhatsApp(){
  const wa=state.settings.whatsapp;
  if(!wa){toast('WhatsApp number not set. Go to Admin → Settings.');return}
  if(!state.cart.length){toast('Your cart is empty.');return}
  const clean=wa.replace(/\s+/g,'').replace('+','');
  const items=state.cart.map(i=>`• ${i.name} x${i.qty} — ₦${(i.price*i.qty).toLocaleString()}`).join('\n');
  const total=`₦${cartTotal().toLocaleString()}`;
  const tpl=state.settings.messageTemplate||"Hi! I'd like to order:\n{items}\n\nTotal: {total}";
  const msg=tpl.replace('{items}',items).replace('{total}',total);
  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`,'_blank');
}

function orderProductWA(name,price){
  const wa=state.settings.whatsapp;
  if(!wa){toast('WhatsApp not configured.');return}
  const clean=wa.replace(/\s+/g,'').replace('+','');
  const msg=`Hi! I'm interested in ordering: ${name} — ₦${Number(price).toLocaleString()}`;
  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`,'_blank');
}

// ── ADMIN — PRODUCTS ─────────────────────────
function previewImg(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const pre=document.getElementById('img-preview');
    pre.src=e.target.result;pre.style.display='block';
    document.getElementById('upload-hint').style.display='none';
  };
  reader.readAsDataURL(file);
}

function addProduct(){
  const name=document.getElementById('p-name').value.trim();
  const price=document.getElementById('p-price').value.trim();
  const cat=document.getElementById('p-cat').value;
  const badge=document.getElementById('p-badge').value;
  const desc=document.getElementById('p-desc').value.trim();
  const imgEl=document.getElementById('img-preview');
  if(!name||!price){toast('Name and price are required.');return}
  if(!cat){toast('Please select a category.');return}
  const product={
    id:Date.now(),name,price:parseFloat(price),category:cat,
    badge,desc,emoji:'📦',rating:5,reviews:0,
    img:imgEl.src&&imgEl.src!==window.location.href?imgEl.src:null
  };
  state.products.push(product);
  saveState();renderAdminProducts();refreshDashboard();
  // reset
  ['p-name','p-price','p-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('p-cat').value='';
  document.getElementById('p-badge').value='';
  imgEl.style.display='none';imgEl.src='';
  document.getElementById('p-img').value='';
  document.getElementById('upload-hint').style.display='block';
  toast('✓ Product added!');
}

function deleteProduct(id){
  if(!confirm('Delete this product?'))return;
  state.products=state.products.filter(p=>p.id!==id);
  state.cart=state.cart.filter(c=>c.id!==id);
  saveState();renderAdminProducts();refreshDashboard();updateCartUI();
  toast('Product removed.');
}

function renderAdminProducts(){
  const list=document.getElementById('admin-product-list');
  const count=document.getElementById('product-list-count');
  if(count) count.textContent=`(${state.products.length})`;
  if(!state.products.length){
    list.innerHTML='<div class="no-products">No products yet.</div>';return;
  }
  list.innerHTML=state.products.map(p=>`
    <div class="admin-product-item">
      <div class="admin-product-thumb">
        ${p.img?`<img src="${p.img}" alt="${p.name}">`:(p.emoji||'🛍')}
      </div>
      <div class="admin-product-info">
        <div class="admin-product-name">${p.name}</div>
        <div class="admin-product-meta">${p.category||''} ${p.badge?'· '+p.badge:''}</div>
      </div>
      <div class="admin-product-price">₦${Number(p.price).toLocaleString()}</div>
      <div class="admin-product-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── SETTINGS ─────────────────────────────────
function loadSettingsForm(){
  document.getElementById('set-name').value=state.settings.name||'';
  document.getElementById('set-wa').value=state.settings.whatsapp||'';
  document.getElementById('set-msg').value=state.settings.messageTemplate||'';
  updateWaPreview();
}
function updateWaPreview(){
  const v=document.getElementById('set-wa').value.trim();
  const pre=document.getElementById('wa-preview');
  if(v.length>5){
    pre.style.display='flex';
    document.getElementById('wa-preview-text').textContent=v+' · ready to receive orders';
  } else pre.style.display='none';
}
function saveSettings(){
  state.settings.name=document.getElementById('set-name').value.trim();
  state.settings.whatsapp=document.getElementById('set-wa').value.trim();
  state.settings.messageTemplate=document.getElementById('set-msg').value.trim();
  saveState();refreshDashboard();
  const wa=state.settings.whatsapp;
  if(wa){
    const clean=wa.replace(/\s+/g,'').replace('+','');
    document.getElementById('wa-link').href=`https://wa.me/${clean}`;
    document.getElementById('wa-float').style.display='block';
  }
  const m=document.getElementById('save-msg');
  m.classList.add('show');setTimeout(()=>m.classList.remove('show'),2500);
  toast('Settings saved!');
}

// ── DASHBOARD ────────────────────────────────
function refreshDashboard(){
  const cats=[...new Set(state.products.map(p=>p.category))].length;
  document.getElementById('stat-products').textContent=state.products.length;
  document.getElementById('stat-cart').textContent=cartCount();
  document.getElementById('stat-cats').textContent=cats;
  const waEl=document.getElementById('stat-wa');
  const wa=state.settings.whatsapp;
  waEl.textContent=wa||'Not set';
  waEl.style.fontSize=wa?'0.78rem':'0.9rem';
}

// ── TOAST ─────────────────────────────────────
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2600);
}

// ── INIT ──────────────────────────────────────
loadState();
renderShop();
updateCartUI();
