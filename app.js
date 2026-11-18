const $=id=>document.getElementById(id);
const STORAGE_KEY='miInventario_productos_v1',HISTORY_KEY='miInventario_movimientos_v1';
let products=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
let history=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
let deferredPrompt=null;
const money=v=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(v);
const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(products));localStorage.setItem(HISTORY_KEY,JSON.stringify(history));};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 $('totalProducts').textContent=products.length;
 $('totalUnits').textContent=products.reduce((s,p)=>s+p.quantity,0);
 $('lowStock').textContent=products.filter(p=>p.quantity<=p.minimum).length;
 $('inventoryValue').textContent=money(products.reduce((s,p)=>s+p.price*p.quantity,0));
 const cats=[...new Set(products.map(p=>p.category))].sort(),current=$('categoryFilter').value;
 $('categoryFilter').innerHTML='<option value="">Todas las categorías</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');
 $('categoryFilter').value=cats.includes(current)?current:'';
 $('movementProduct').innerHTML='<option value="">Selecciona un producto</option>'+products.map(p=>`<option value="${p.id}">${esc(p.name)} (${p.quantity})</option>`).join('');
 const q=$('searchInput').value.toLocaleLowerCase('es'),cat=$('categoryFilter').value,stock=$('stockFilter').value;
 const shown=products.filter(p=>(p.name.toLocaleLowerCase('es').includes(q)||p.category.toLocaleLowerCase('es').includes(q))&&(!cat||p.category===cat)&&(!stock||(stock==='low'?p.quantity<=p.minimum:p.quantity>p.minimum)));
 $('productsBody').innerHTML=shown.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${p.quantity}</td><td><span class="pill ${p.quantity<=p.minimum?'low':'ok'}">${p.quantity<=p.minimum?'Stock bajo':'Disponible'}</span></td><td><div class="actions"><button class="mini-btn" data-edit="${p.id}">Editar</button><button class="mini-btn delete" data-delete="${p.id}">Eliminar</button></div></td></tr>`).join('');
 $('emptyState').hidden=shown.length>0;
 $('historyList').innerHTML=history.length?history.slice(0,8).map(m=>`<div class="history-item"><div><strong>${esc(m.name)}</strong><small>${new Date(m.date).toLocaleString('es-MX')}</small></div><span class="movement-tag ${m.type}">${m.type==='entrada'?'+':'−'}${m.quantity} · ${m.type}</span></div>`).join(''):'<p class="empty">Todavía no hay movimientos registrados.</p>';
}
function openProduct(p=null){
 $('productForm').reset();$('productId').value=p?.id||'';$('dialogTitle').textContent=p?'Editar producto':'Nuevo producto';
 $('productName').value=p?.name||'';$('productPrice').value=p?.price??'';$('productQuantity').value=p?.quantity??'';
 $('productCategory').value=p?.category||'';$('productMinimum').value=p?.minimum??5;$('productQuantity').disabled=!!p;$('productDialog').showModal();
}
$('addBtn').addEventListener('click',()=>openProduct());
$('closeDialog').addEventListener('click',()=>$('productDialog').close());
$('cancelDialog').addEventListener('click',()=>$('productDialog').close());
$('productForm').addEventListener('submit',e=>{
 e.preventDefault();const id=$('productId').value,data={name:$('productName').value.trim(),price:Number($('productPrice').value),quantity:Number($('productQuantity').value),category:$('productCategory').value.trim(),minimum:Number($('productMinimum').value)};
 if(!data.name||!data.category||data.price<0||data.quantity<0||data.minimum<0)return alert('Revisa los datos del producto.');
 if(id){const p=products.find(x=>x.id===id);Object.assign(p,{...data,quantity:p.quantity});}else products.push({id:crypto.randomUUID(),...data});
 save();$('productDialog').close();render();
});
$('productsBody').addEventListener('click',e=>{
 const edit=e.target.dataset.edit,del=e.target.dataset.delete;
 if(edit){const p=products.find(x=>x.id===edit);if(p)openProduct(p);}
 if(del){const p=products.find(x=>x.id===del);if(p&&confirm(`¿Eliminar "${p.name}" del inventario?`)){products=products.filter(x=>x.id!==del);save();render();}}
});
['searchInput','categoryFilter','stockFilter'].forEach(id=>$(id).addEventListener(id==='searchInput'?'input':'change',render));
$('movementForm').addEventListener('submit',e=>{
 e.preventDefault();const p=products.find(x=>x.id===$('movementProduct').value),type=$('movementType').value,n=Number($('movementQuantity').value);
 if(!p)return alert('Selecciona un producto.');if(!Number.isInteger(n)||n<1)return alert('La cantidad debe ser un entero mayor que cero.');
 if(type==='salida'&&n>p.quantity)return alert(`No hay existencias suficientes. Disponibles: ${p.quantity}.`);
 p.quantity+=type==='entrada'?n:-n;history.unshift({id:crypto.randomUUID(),name:p.name,type,quantity:n,date:new Date().toISOString()});save();$('movementForm').reset();render();
});
$('clearHistory').addEventListener('click',()=>{if(confirm('¿Limpiar el historial de movimientos?')){history=[];save();render();}});
window.addEventListener('online',()=>{$('connection').textContent='● En línea';$('connection').style.color='#16834a';});
window.addEventListener('offline',()=>{$('connection').textContent='● Sin conexión';$('connection').style.color='#b66b16';});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false;});
$('installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true;});
render();