function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id') || '', 10) || null;
}

async function renderProductPage() {
    const id = getProductIdFromUrl();
    if (!id) return;

    if (typeof refreshProductsFromAPI === 'function') {
        await refreshProductsFromAPI();
    }

    const product = getProducts().find(p => p.id === id);
    if (!product) {
        document.body.innerHTML = `
            <main class="container" style="padding: 80px 20px; text-align: center; color: #fff;">
                <h1>المنتج غير موجود</h1>
                <p>هذا المنتج غير متاح حالياً. حاول مرة أخرى من الصفحة الرئيسية.</p>
                <a href="index.html" class="btn btn-gold">العودة للرئيسية</a>
            </main>
        `;
        return;
    }

    const title = currentLang === 'ar' ? product.title_ar : product.title_en;
    const description = currentLang === 'ar' ? product.desc_ar : product.desc_en;
    const currency = currentLang === 'ar' ? product.currency_ar : product.currency_en;
    const notes = currentLang === 'ar' ? product.notes_ar : product.notes_en;
    const outOfStock = !product.in_stock || product.stock_quantity <= 0;

    document.getElementById('product-image').src = product.image || '';
    document.getElementById('product-image').alt = title;
    document.getElementById('product-vendor').innerText = product.vendor;
    document.getElementById('product-title').innerText = title;
    document.getElementById('product-price').innerText = `${product.price} ${currency}`;
    document.getElementById('product-desc').innerText = description;
    document.getElementById('product-notes-top').innerText = notes.top;
    document.getElementById('product-notes-mid').innerText = notes.mid;
    document.getElementById('product-notes-base').innerText = notes.base;

    const stockEl = document.getElementById('product-stock');
    if (stockEl) {
        stockEl.innerText = outOfStock
            ? (currentLang === 'ar' ? 'Out Of Stock — نفذت الكمية' : 'Out Of Stock')
            : (currentLang === 'ar' ? `متبقي: ${product.stock_quantity} قطعة` : `In stock: ${product.stock_quantity}`);
        stockEl.className = outOfStock ? 'stock-out' : 'stock-in';
    }

    const addBtn = document.getElementById('page-add-to-cart');
    if (addBtn) {
        addBtn.disabled = outOfStock;
        addBtn.innerText = outOfStock
            ? (currentLang === 'ar' ? 'غير متوفر' : 'Out Of Stock')
            : (currentLang === 'ar' ? 'أضف للسلة' : 'Add to Cart');
        addBtn.addEventListener('click', () => {
            addToCart(product.id);
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', renderProductPage);
