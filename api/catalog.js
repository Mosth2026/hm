export default async function handler(req, res) {
    const SUPABASE_URL = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";
    const SITE_URL = "https://www.happinessmakers.online";

    try {
        // 1. جلب المنتجات (فلترة: صورة موجودة + رصيد أكبر من صفر)
        const queryParams = new URLSearchParams({
            select: '*',
            image: 'not.is.null',
            stock: 'gt.0',
            order: 'id.desc'
        });

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?${queryParams.toString()}`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        
        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error("Failed to fetch products");
        }

        const escapeXml = (unsafe) => {
            return String(unsafe || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        // 2. بناء ملف XML بتنسيق Meta (Facebook) Catalog
        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>متجر صناع السعادة</title>
    <link>${SITE_URL}</link>
    <description>كتالوج المنتجات الرسمي لمتجر صناع السعادة</description>`;

        products.forEach(product => {
            const name = product.name || '';
            const desc = product.description || '';
            const imageUrl = product.image || '';

            // استبعاد الصور الوهمية (Unsplash) والمسودات
            if (imageUrl.includes('unsplash.com') || desc.includes('[DRAFT]') || name.includes('[DRAFT]')) {
                return;
            }

            // السعر: يتم سحب السعر المعروض في الداتابيز حرفياً بدون أي عمليات حسابية (منع الضريبة المزدوجة)
            const price = Number(product.price || 0).toFixed(2);
            
            let finalImageUrl = imageUrl;
            if (!finalImageUrl.startsWith('http')) {
                finalImageUrl = `${SITE_URL}${finalImageUrl.startsWith('/') ? '' : '/'}${finalImageUrl}`;
            }
            
            // تحجيم وتصغير الصور لضمان القبول السريع
            if (finalImageUrl.includes('supabase.co/storage/v1/object/public/')) {
                finalImageUrl = finalImageUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=800&quality=75';
            }
            
            const imageTag = escapeXml(finalImageUrl);
            const id = escapeXml(product.id);
            const cleanName = escapeXml(name.replace(/\[TAX_EXEMPT\]/g, '').split('*')[0].trim());
            const cleanDesc = escapeXml((desc || name).replace(/\[TAX_EXEMPT\]/g, '').trim());
            const linkTag = escapeXml(`${SITE_URL}/products/${product.id}`);
            
            // الأقسام: نرسل اسم القسم كما هو في المتجر تماماً لفيسبوك
            const categoryName = escapeXml(product.category_name || 'الأصناف');

            xml += `
    <item>
      <g:id>${id}</g:id>
      <g:title>${cleanName}</g:title>
      <g:description>${cleanDesc}</g:description>
      <g:link>${linkTag}</g:link>
      <g:image_link>${imageTag}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price} EGP</g:price>
      <g:brand>صناع السعادة</g:brand>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items</g:google_product_category>
      <g:product_type>${categoryName}</g:product_type>
      <g:custom_label_0>${categoryName}</g:custom_label_0>
      <g:item_group_id>${categoryName}</g:item_group_id>
    </item>`;
        });

        xml += `
  </channel>
</rss>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(xml);

    } catch (error) {
        console.error("Catalog Feed Error:", error);
        return res.status(500).send(`Error generating feed: ${error.message}`);
    }
}
