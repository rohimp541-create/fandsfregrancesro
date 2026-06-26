/**
 * Admin Panel Logic - Professional REST API & Real-Time Sync
 */

const adminOrdersKey = 'fs_orders';
const imgPrefix = '../';
let currentProductImage = "";

// ============================================================
// Authentication
// ============================================================

function isAuthenticated() {
    return FSApi.isAuthenticated();
}

function ensureAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

function logout() {
    FSApi.setToken(null);
    window.location.href = 'login.html';
}

// ============================================================
// Order Management
// ============================================================

async function refreshOrders() {
    try {
        const response = await FSApi.getOrders();
        if (response.success) {
            renderOrders(response.data);
        }
    } catch (err) {
        console.error('Failed to fetch orders:', err);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await FSApi.updateOrderStatus(orderId, newStatus);
        if (response.success) {
            // UI will be updated via Socket.io event or we can refresh manually
            await refreshOrders();
        }
    } catch (err) {
        alert('Failed to update status: ' + err.message);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
        const response = await FSApi.deleteOrder(orderId);
        if (response.success) {
            await refreshOrders();
        }
    } catch (err) {
        alert('Failed to delete order: ' + err.message);
    }
}

function renderOrders(orders = []) {
    const container = document.getElementById('orders-list');
    const count = document.getElementById('orders-count');
    if (count) count.innerText = orders.length;

    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-state">لا توجد طلبات بعد.</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        const orderStatus = order.status || 'pending';
        const statusMap = {
            'pending': { text: 'قيد الانتظار', class: 'status-new', icon: 'fa-clock' },
            'processing': { text: 'جاري التجهيز', class: 'status-unshipped', icon: 'fa-spinner fa-spin' },
            'delivered': { text: 'تم التسليم', class: 'status-shipped', icon: 'fa-check' }
        };
        const config = statusMap[orderStatus] || statusMap['pending'];

        const itemsHtml = (order.items || []).map(item => `
            <div class="order-item">
                <strong>${item.product_name || 'منتج'}</strong>
                <span>${item.quantity} × ${item.price} جنيه</span>
            </div>
        `).join('');

        const date = new Date(order.created_at).toLocaleString('ar-EG');

        return `
            <div class="order-card" data-id="${order.id}">
                <div class="order-meta">
                    <span>طلب #${order.id}</span>
                    <span>${date}</span>
                </div>
                <div class="order-info">
                    <p><strong>الاسم:</strong> ${order.customer_name}</p>
                    <p><strong>الهاتف:</strong> ${order.phone}</p>
                    <p><strong>العنوان:</strong> ${order.address}</p>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                <div class="order-total">الإجمالي: ${order.total_price} جنيه</div>
                <div class="order-status-row">
                    <span class="order-status-badge ${config.class}">
                        <i class="fa-solid ${config.icon}"></i>
                        ${config.text}
                    </span>
                </div>
                <div class="order-actions">
                    <button type="button" class="order-action-btn order-action-ship" onclick="updateOrderStatus(${order.id}, 'delivered')">
                        <i class="fa-solid fa-check"></i> تم التسليم
                    </button>
                    <button type="button" class="order-action-btn order-action-unship" onclick="updateOrderStatus(${order.id}, 'processing')">
                        <i class="fa-solid fa-spinner"></i> جاري التجهيز
                    </button>
                    <button type="button" class="order-action-btn order-action-delete" onclick="deleteOrder(${order.id})">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// Product Management
// ============================================================

async function refreshAdminProducts() {
    try {
        const response = await FSApi.getProducts();
        if (response.success) {
            const mapped = response.data.map(p => FSApi.mapProductToFrontend(p));
            renderAdminProducts(mapped);
        }
    } catch (err) {
        console.error('Failed to fetch products:', err);
    }
}

function renderAdminProducts(products = []) {
    const container = document.getElementById('admin-products-list');
    if (!container) return;

    container.innerHTML = products.map(p => {
        const isOutOfStock = (p.stock_quantity ?? 0) <= 0;
        return `
            <div class="admin-prod-card" onclick="openProductForm(${p.id})" style="cursor: pointer;">
                <img src="${p.image}" onerror="this.src='https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=200'">
                <div class="info">
                    <strong>${p.title_ar}</strong>
                    <span>${p.price} جنيه</span>
                    <small style="display:block; margin-top:5px; color:${isOutOfStock ? '#ff4d4d' : '#2ecc71'}">المخزون: ${p.stock_quantity}</small>
                </div>
                <div class="btns">
                    <button class="edit-btn" onclick="event.stopPropagation(); openProductForm(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="del-btn" onclick="event.stopPropagation(); deleteProductAdmin(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteProductAdmin(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
        const response = await FSApi.deleteProduct(id);
        if (response.success) {
            await refreshAdminProducts();
        }
    } catch (err) {
        alert('Failed to delete product: ' + err.message);
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const url = await FSApi.uploadImage(file);
        currentProductImage = url;
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.src = url;
            preview.style.display = 'block';
        }
    } catch (err) {
        alert('Upload failed: ' + err.message);
    }
}

async function openProductForm(id = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    const preview = document.getElementById('image-preview');
    currentProductImage = "";

    if (id) {
        try {
            const response = await FSApi.getProduct(id);
            const p = FSApi.mapProductToFrontend(response.data);
            title.innerText = "تعديل منتج";
            form.prod_id.value = p.id;
            form.prod_name_ar.value = p.title_ar;
            form.prod_name_en.value = p.title_en || '';
            form.prod_price.value = p.price;
            form.prod_stock.value = p.stock_quantity;
            form.prod_desc_ar.value = p.desc_ar;
            form.prod_desc_en.value = p.desc_en || '';
            currentProductImage = p.image;
            if (preview) {
                preview.src = p.image;
                preview.style.display = 'block';
            }
        } catch (err) {
            alert('Failed to load product details');
            return;
        }
    } else {
        title.innerText = "إضافة منتج جديد";
        form.reset();
        form.prod_id.value = "";
        if (preview) { preview.src = ""; preview.style.display = 'none'; }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function saveProductAdmin(event) {
    event.preventDefault();
    const form = event.target;
    const idVal = form.prod_id.value;
    
    const payload = {
        name: form.prod_name_ar.value,
        name_en: form.prod_name_en.value,
        price: parseFloat(form.prod_price.value),
        stock_quantity: parseInt(form.prod_stock.value),
        description: form.prod_desc_ar.value,
        description_en: form.prod_desc_en.value,
        image: currentProductImage
    };

    try {
        let response;
        if (idVal) {
            response = await FSApi.updateProduct(idVal, payload);
        } else {
            response = await FSApi.createProduct(payload);
        }

        if (response.success) {
            const modal = document.getElementById('product-modal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            await refreshAdminProducts();
            alert("✅ تم الحفظ بنجاح!");
        }
    } catch (err) {
        alert('Save failed: ' + err.message);
    }
}

// ============================================================
// UI Injection & Setup
// ============================================================

function injectProductUI() {
    const main = document.querySelector('main.admin-main');
    if (!main) return;

    const section = document.createElement('section');
    section.className = 'admin-grid';
    section.id = 'products-section';
    section.style.marginTop = '40px';
    section.innerHTML = `
        <div class="admin-panel full-width">
            <div class="panel-head">
                <h3>إدارة المنتجات</h3>
                <button class="btn btn-gold" onclick="openProductForm()">
                    <i class="fa-solid fa-plus"></i> إضافة منتج
                </button>
            </div>
            <div id="admin-products-list" class="admin-products-grid"></div>
        </div>

        <div id="product-modal" class="admin-full-screen">
            <div class="modal-fullscreen-content">
                <form id="product-form" onsubmit="saveProductAdmin(event)" class="mobile-edit-form">
                    <div class="modal-header-sticky">
                        <div class="header-actions-left">
                            <button type="button" class="back-btn" onclick="document.getElementById('product-modal').classList.remove('active'); document.body.style.overflow='auto';">
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                            <span id="modal-title">تعديل المنتج</span>
                        </div>
                        <button type="submit" class="save-btn-top">حفظ</button>
                    </div>

                    <div class="modal-body-scroll">
                        <input type="hidden" name="prod_id">
                        <div class="form-group"><label>اسم المنتج (عربي)</label><input type="text" name="prod_name_ar" required></div>
                        <div class="form-group"><label>اسم المنتج (EN)</label><input type="text" name="prod_name_en"></div>
                        <div class="form-group"><label>السعر</label><input type="number" name="prod_price" required step="0.01"></div>
                        <div class="form-group"><label>الكمية المتوفرة</label><input type="number" name="prod_stock" required></div>
                        <div class="form-group"><label>الوصف (عربي)</label><textarea name="prod_desc_ar" required></textarea></div>
                        <div class="form-group"><label>الوصف (EN)</label><textarea name="prod_desc_en"></textarea></div>
                        <div class="form-group image-upload-section">
                            <label>صورة المنتج</label>
                            <div class="custom-file-upload" onclick="document.getElementById('admin-image-input').click()">
                                <i class="fa-solid fa-camera"></i>
                                <span>تغيير الصورة</span>
                            </div>
                            <input type="file" id="admin-image-input" accept="image/*" onchange="handleImageUpload(event)" style="display:none;">
                            <img id="image-preview" src="" style="width:100%; max-height:250px; object-fit:contain; border-radius:10px; display:none; margin-top:15px; background:#000;">
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    main.appendChild(section);

    // Add styles for grid
    const style = document.createElement('style');
    style.innerHTML = `
        .admin-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 15px; }
        .admin-prod-card { background: #1a1a1a; padding: 10px; border-radius: 12px; border: 1px solid #333; text-align: center; }
        .admin-prod-card img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
        .admin-prod-card .info strong { display: block; font-size: 14px; color: #fff; margin-bottom: 4px; }
        .admin-prod-card .info span { color: #d4af37; font-weight: bold; }
        .admin-prod-card .btns { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
        .admin-prod-card .btns button { background: #222; border: 1px solid #444; color: #fff; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
        .admin-prod-card .edit-btn { color: #d4af37; }
        .admin-prod-card .del-btn { color: #ff4d4d; }
        
        .admin-full-screen { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.95); z-index: 9999; transform: translateY(100%); 
            transition: transform 0.3s ease; visibility: hidden;
            display: flex; align-items: center; justify-content: center;
        }
        .admin-full-screen.active { transform: translateY(0); visibility: visible; }
        .modal-fullscreen-content { width: 95%; max-width: 500px; background: #111; border-radius: 15px; overflow: hidden; }
        .modal-header-sticky { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; }
        .modal-body-scroll { padding: 20px; max-height: 80vh; overflow-y: auto; }
        .form-group { margin-bottom: 20px; text-align: right; }
        .form-group label { display: block; margin-bottom: 8px; color: #d4af37; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; }
        .custom-file-upload { border: 2px dashed #333; padding: 20px; border-radius: 10px; cursor: pointer; }
        .save-btn-top { background: #d4af37; color: #000; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }
        .back-btn { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
    `;
    document.head.appendChild(style);
}

function setupAdminNavigation() {
    const navItems = document.querySelectorAll('.app-bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    ensureAuthenticated();
    injectProductUI();
    setupAdminNavigation();

    // Initial Load
    await Promise.all([refreshOrders(), refreshAdminProducts()]);

    // Real-Time Listeners
    if (typeof FSSocket !== 'undefined') {
        FSSocket.initAdmin({
            onOrderCreated: (order) => {
                console.log('New order received:', order);
                refreshOrders();
                // Optional: Play a sound or show notification
                if (Notification.permission === 'granted') {
                    new Notification('طلب جديد!', { body: `تم استلام طلب جديد من ${order.customer_name}` });
                }
            },
            onOrderUpdated: () => refreshOrders(),
            onProductChange: () => refreshAdminProducts()
        });

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    document.getElementById('logout-btn')?.addEventListener('click', logout);
});
