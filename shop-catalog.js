const catalog = {
    Pearls: ['pearl2.jpeg', 'pearl3.jpeg', 'pearl4.jpeg', 'pearl5.jpeg', 'pearl6.jpeg', 'pearl7.jpeg', 'pearl8.jpeg', 'pearl9.jpeg', 'pearl10.jpeg', 'pearl11.jpeg', 'pearl12.jpeg', 'pearl13.jpeg'],
    Terracotta: ['tera1.jpeg', 'tera2.jpeg', 'tera3.jpeg', 'tera4.jpeg', 'tera5.jpeg', 'tera6.jpeg', 'tera7.jpeg', 'tera8.jpeg', 'tera9.jpeg', 'tera10.jpeg', 'tera11.jpeg', 'tera12.jpeg'],
    Resin: ['resin1.jpeg', 'resin2.jpeg', 'resin3.jpeg', 'resin4.jpeg', 'resin5.jpeg', 'resin6.jpeg', 'resin7.jpeg', 'resin8.jpeg', 'resin9.jpeg', 'resin10.jpeg', 'resin11.jpeg', 'resin12.jpeg'],
    'Sea Shell': ['shell1.jpeg', 'shell2.jpeg', 'shell3.jpeg', 'shell4.jpeg', 'shell5.jpeg', 'shell6.jpeg', 'shell7.jpeg', 'shell8.jpeg', 'shell9.jpeg', 'shell10.jpeg', 'shell11.jpeg', 'shell12.jpeg'],
    'Thread Work': ['work1.jpeg', 'work2.jpeg', 'work3.jpeg', 'work4.jpeg', 'work5.jpeg', 'work6.jpeg', 'work7.jpeg', 'work8.jpeg', 'work9.jpeg', 'work10.jpeg', 'work11.jpeg', 'work12.jpeg']
};

const productNames = {
    Pearls: ['Classic Pearl Necklace', 'Pearl Necklace ', 'Pearl necklace ', 'Pearl bow Earrings', 'Pearl  Earrings', 'Pearl Stud Earrings', 'Pearl Layered bracelet', 'Pearl Bloom bracelet', 'Pearl Elegance bracelet', 'Pearl Anklet', 'Pearl bloom anklet', 'Pearl drop anklet'],
    Terracotta: ['Terracotta Floral Necklace', 'Terracotta necklace', 'Terracotta triangle necklace', 'Terracotta Bead necklace', 'Terracotta round earrings', 'Terracotta Stud Earrings', 'Terracotta Heritage earrings', 'Terracotta round bracelet', 'Terracotta Classic bracelet', 'Terracotta Charm Bracelet', 'Terracotta Art anklet', 'Terracotta Party anklet'],
    Resin: ['Resin Bloom Necklace', 'Resin Round necklace', 'Resin Art necklace', 'Resin Charm earrings', 'Resin Flower Earrings', 'Resin Mini earrings', 'Resin black earrings', 'Resin anklet', 'Resin Luxe anklet', 'Resin Bead Bracelet', 'Resin round anklet', 'Resin Statement bracelet'],
    'Sea Shell': ['Sea Shell Necklace', 'Shell Drop necklace', 'Coastal Shell necklace', 'Shell Charm Bracelet', 'Ocean Shell bracelet', 'Shell Stud bracelet', 'Beach Pearl Earrings', 'Seaside Hoop Earrings', 'Shell Elegance earrings', 'Shell Bead anklet', ' Shell anklet ', 'Coastal Statement anklet'],
    'Thread Work': ['Threadwork Necklace', 'Thread Tassel Necklace', 'Threadwork Festival necklace', 'Thread Bead Bangles', 'Thread Flower bangles', 'Thread brown bangles', 'Thread drop anklet', 'Thread Layered anklet', 'Threadwork Classic anklett', 'Thread Charm Earrings', 'Thread Art earrings', 'Thread Statement Earrings']
};

const mediumPrices = ['Rs. 1,200', 'Rs. 2,200', 'Rs. 1,200', 'Rs. 2,800', 'Rs. 2,000', 'Rs. 2,400', 'Rs. 1,600', 'Rs. 2,700', 'Rs. 2,400', 'Rs. 2,900', 'Rs. 1,100', 'Rs. 2,600'];

const collectionGrid = document.querySelector('#collection-grid');

if (collectionGrid) {
    collectionGrid.innerHTML = Object.entries(catalog).map(([category, images]) => `
        <section class="collection-group" data-category="${category.toLowerCase()}">
            <h2>${category}</h2>
            <div class="collection-products">
                ${images.map((image, index) => {
                    const name = productNames[category][index];
                    const price = mediumPrices[index];
                    return `<article class="shop-product" data-product data-product-name="${name}" data-product-price="${price}" data-product-image="${image}">
                        <img src="${image}" alt="${name}" loading="lazy">
                        <h3>${name}</h3><p class="price">${price}</p>
                        <button type="button" data-add-to-cart>Add to Cart</button>
                    </article>`;
                }).join('')}
            </div>
        </section>`).join('');

    const productSearch = document.querySelector('#product-search');
    const searchStatus = document.querySelector('#search-status');
    productSearch?.addEventListener('input', () => {
        const query = productSearch.value.trim().toLowerCase();
        const products = [...document.querySelectorAll('.shop-product')];
        let matches = 0;

        products.forEach((product) => {
            const matchesSearch = product.textContent.toLowerCase().includes(query);
            product.hidden = !matchesSearch;
            matches += matchesSearch ? 1 : 0;
        });

        document.querySelectorAll('.collection-group').forEach((group) => {
            group.hidden = [...group.querySelectorAll('.shop-product')].every((product) => product.hidden);
        });

        searchStatus.textContent = query ? `${matches} item${matches === 1 ? '' : 's'} found` : '';
    });
}
