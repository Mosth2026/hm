export default async function handler(req, res) {
    const { id, type } = req.query;
    // 🏛️ CONSTITUTION: Never hardcode credentials. Use environment variables.
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    // تحديد النطاق ديناميكياً لضمان تطابق رابط المعاينة مع الرابط المشترك (WWW أو بدونها)
    const host = req.headers.host || "www.happinessmakers.online";
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const SITE_URL = `${protocol}://${host}`;

    try {
        let title = "صناع السعادة - متجر الشوكولاتة الفاخرة";
        let description = "متجر صناع السعادة يقدم أجود أنواع الشوكولاتة الفاخرة المصنوعة بكل حب وشغف.";
        let image = `${SITE_URL}/assets/logo.png`;
        const PLACEHOLDER_URL = "images.unsplash.com/photo-1581091226825-a6a2a5aee158";

        if (type === 'product' && id) {
            // نحاول البحث بالمعرف الحقيقي أولاً، ثم بالباركود في الوصف إذا لم نجد الحقيقي
            let response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            let data = await response.json();

            if (!data || data.length === 0) {
                // محاولة البحث بالباركود في الوصف
                response = await fetch(
                    `${SUPABASE_URL}/rest/v1/products?description=ilike.*${id}*&select=*&limit=1`,
                    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
                );
                data = await response.json();
            }

            if (data && data[0]) {
                const product = data[0];
                let rawName = (product.name || '').replace(/^"/, '').replace(/\[TAX_EXEMPT\]/g, '').split('*')[0].trim();
                title = rawName + " | صناع السعادة";

                let rawDesc = product.description || description;
                description = rawDesc.replace(/\[TAX_EXEMPT\]/g, '').replace(/باركود\s*:\s*\d+/g, '').trim();

                let rawImage = product.image || '';
                // إذا كانت الصورة هي صورة "المرأة والكمبيوتر" غير المناسبة، نستخدم شعار المحل كبديل
                if (rawImage.includes(PLACEHOLDER_URL)) {
                    image = `${SITE_URL}/assets/logo.png`;
                } else if (rawImage.startsWith('http')) {
                    image = rawImage;
                } else if (rawImage) {
                    image = `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                }
            }
        } else if (type === 'category' && id) {
            // جلب اسم القسم الفعلي من قاعدة البيانات
            const catRes = await fetch(
                `${SUPABASE_URL}/rest/v1/categories?id=eq.${id}&select=label`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const catData = await catRes.json();
            const categoryLabel = catData && catData[0] ? catData[0].label : id;
            
            title = `قسم ${categoryLabel} | صناع السعادة`;
            description = `تصفح تشكيلة رائعة من ${categoryLabel} في متجر صناع السعادة.`;

            // جلب صورة منتج من هذا القسم، مع استبعاد الصور التوضيحية (المرأة والكمبيوتر)
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?category_id=eq.${id}&select=image&limit=5`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                // اختيار أول صورة ليست هي الـ placeholder
                const validProduct = data.find(p => p.image && !p.image.includes(PLACEHOLDER_URL)) || data[0];
                let rawImage = validProduct.image || '';
                image = rawImage.startsWith('http') ? rawImage : `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                
                if (image.includes(PLACEHOLDER_URL)) {
                    image = `${SITE_URL}/assets/logo.png`;
                }
            }
        }

        // تنظيف العنوان والوصف من أي رموز تكسر الميتا تاق
        const escapeHtml = (str) => (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ' ');
        title = escapeHtml(title);
        description = escapeHtml(description);

        // تحسين الروابط وضمان كود تتبع (Cache Buster)
        const version = Math.floor(Date.now() / 3600000); 
        if (image.includes('supabase.co') || image.includes('assets/')) {
            image += (image.includes('?') ? '&' : '?') + 'v=' + version;
        }

        // تحسين اكتشاف نوع الصورة ديناميكياً (نتجاهل البرامترات في الآخر للفحص)
        let imageType = "image/jpeg"; 
        const testUrl = image.split('?')[0].toLowerCase();
        
        // إذا كان هناك بارامتر format=jpg في الرابط، فنحن نعرف مسبقاً النوع
        if (image.includes('format=jpg')) {
            imageType = "image/jpeg";
        } else if (testUrl.endsWith('.webp')) {
            imageType = "image/webp";
        } else if (testUrl.endsWith('.png')) {
            imageType = "image/png";
        } else if (testUrl.endsWith('.gif')) {
            imageType = "image/gif";
        }

        const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- SEO Basics -->
  <meta name="description" content="${description}">
  <link rel="canonical" href="${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}">
  
  <!-- OpenGraph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="800">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:site_name" content="صناع السعادة">
  <meta property="og:locale" content="ar_EG">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- WhatsApp Specific -->
  <meta property="og:image:type" content="${imageType}">
  <link rel="image_src" href="${image}">

  <!-- Redirect to the real page -->
  <meta http-equiv="refresh" content="0;url=${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}">
</head>
<body>
  <div style="display:none;">
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${image}" alt="${title}">
  </div>
  <script>
    window.location.href = "${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}";
  </script>
  جاري التحويل...
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
    } catch (error) {
        return res.status(302).redirect(`${SITE_URL}/${type === 'product' ? 'products' : 'categories'}/${id}`);
    }
}
