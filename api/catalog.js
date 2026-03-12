export default async function handler(req, res) {
    const SUPABASE_URL = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";
    const SITE_URL = "https://www.happinessmakers.online";

    try {
        // 1. جلب كافة المنتجات من قاعدة البيانات
        // نختار المنتجات التي لديها سعر ومخزون أكبر من صفر (اختياري حسب رغبتك)
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error("Failed to fetch products");
        }

        // دالة مساعدة لهروب المحارف الخاصة بالـ XML لضمان عدم حدوث أخطاء
        const escapeXml = (unsafe) => {
            return String(unsafe || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        // 2. بناء ملف XML بتنسيق Facebook (RSS 2.0)
        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>متجر صناع السعادة - متجر الشوكولاتة الفاخرة</title>
    <link>${SITE_URL}</link>
    <description>كتالوج المنتجات الرسمي لمتجر صناع السعادة</description>`;

        products.forEach(product => {
            const id = escapeXml(product.id);
            const name = escapeXml((product.name || '').replace(/\[TAX_EXEMPT\]/g, '').split('*')[0].trim());
            const desc = escapeXml((product.description || product.name || '').replace(/\[TAX_EXEMPT\]/g, '').trim());
            const price = Number(product.price || 0).toFixed(2);
            
            let imageUrl = product.image || '';
            if (!imageUrl.startsWith('http')) {
                imageUrl = `${SITE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            const image = escapeXml(imageUrl);
            
            // رابط المنتج على الموقع
            const link = escapeXml(`${SITE_URL}/products/${product.id}`);
            const availability = (product.stock > 0) ? 'in stock' : 'out of stock';

            xml += `
    <item>
      <g:id>${id}</g:id>
      <g:title>${name}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} EGP</g:price>
      <g:brand>صناع السعادة</g:brand>
      <g:google_product_category>Food &gt; Beverages &gt; Coffee</g:google_product_category>
    </item>`;
        });

        xml += `
  </channel>
</rss>`;

        // 3. إرسال الرد بصيغة XML
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(xml);

    } catch (error) {
        console.error("Catalog Feed Error:", error);
        return res.status(500).send(`Error generating feed: ${error.message}`);
    }
}
