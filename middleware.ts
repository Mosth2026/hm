
// This middleware detect bots (WhatsApp, Facebook, etc.) and serves them static HTML with meta tags
// It uses standard Web APIs compatible with Vercel Edge Middleware

export const config = {
    matcher: ['/products/:path*', '/categories/:path*'],
};

export default async function middleware(request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Bots that we want to serve static meta tags to
    const botRegex = /WhatsApp|facebookexternalhit|Twitterbot|TelegramBot|Slackbot|discordbot|Googlebot|bingbot/i;
    const isBot = botRegex.test(userAgent);

    if (isBot && url.pathname.startsWith('/products/')) {
        const productId = url.pathname.split('/').pop();
        if (productId && !isNaN(Number(productId))) {
            return fetchMetaAndRender(productId, 'product', url.origin);
        }
    }

    if (isBot && url.pathname.startsWith('/categories/')) {
        const categoryId = url.pathname.split('/').pop();
        if (categoryId) {
            return fetchMetaAndRender(categoryId, 'category', url.origin);
        }
    }

    return Response.next?.() || fetch(request);
}

async function fetchMetaAndRender(id, type, origin) {
    const SUPABASE_URL = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";
    const SITE_URL = "https://www.happinessmakers.online";

    try {
        let title = "صناع السعادة";
        let description = "متجر صناع السعادة للشوكولاتة والقهوة العالمية.";
        let image = `${SITE_URL}/assets/logo.png`;

        if (type === 'product') {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const data = await response.json();

            if (data && data[0]) {
                const product = data[0];
                title = (product.name || '').replace(/^"/, '').split('*')[0].trim() + " | صناع السعادة";
                description = product.description || description;

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
        } else {
            title = `قسم ${id} | صناع السعادة`;
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/products?category_id=eq.${id}&select=image&limit=1`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const data = await response.json();
            if (data && data[0]) {
                let rawImage = data[0].image || '';
                if (rawImage.startsWith('http')) {
                    image = rawImage;
                } else if (rawImage) {
                    image = `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                }
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
  <meta property="og:url" content="${origin}${type === 'product' ? '/products/' : '/categories/'}${id}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
</head>
<body>
  Redirecting to Happiness Makers...
  <script>window.location.href = "${origin}${type === 'product' ? '/products/' : '/categories/'}${id}?bot_redirect=true";</script>
</body>
</html>`;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    } catch (error) {
        return new Response('', { status: 302, headers: { Location: origin + (type === 'product' ? '/products/' : '/categories/') + id } });
    }
}
