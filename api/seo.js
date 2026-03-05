export default async function handler(req, res) {
    const { id, type } = req.query;
    const SUPABASE_URL = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";
    const SITE_URL = "https://www.happinessmakers.online";

    try {
        let title = "صناع السعادة - متجر الشوكولاتة الفاخرة";
        let description = "متجر صناع السعادة يقدم أجود أنواع الشوكولاتة الفاخرة المصنوعة بكل حب وشغف.";
        let image = `${SITE_URL}/assets/logo.png`;

        if (type === 'product' && id) {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const data = await response.json();

            if (data && data[0]) {
                const product = data[0];
                title = (product.name || '').replace(/^"/, '').split('*')[0].trim() + " | صناع السعادة";

                let rawDesc = product.description || description;
                description = rawDesc.replace(/باركود\s*:\s*\d+/g, '').trim();

                let rawImage = product.image || '';
                if (rawImage.startsWith('http')) {
                    image = rawImage;
                    if (image.includes('unsplash.com')) {
                        const u = new URL(image);
                        image = `${u.origin}${u.pathname}`;
                    }
                } else if (rawImage) {
                    image = `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                }
            }
        } else if (type === 'category' && id) {
            title = `قسم ${id} | صناع السعادة`;
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?category_id=eq.${id}&select=image&limit=1`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const data = await response.json();
            if (data && data[0]) {
                let rawImage = data[0].image || '';
                image = rawImage.startsWith('http') ? rawImage : `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
            }
        }

        const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}">
</head>
<body>جاري التحويل...</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
    } catch (error) {
        return res.status(302).redirect(`${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}`);
    }
}
