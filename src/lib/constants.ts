import logoUrl from '@/assets/logo.png';

export const SITE_CONFIG = {
    name: "صناع السعادة",
    englishName: "Suna Al Saada",
    slogan: "أصل المستورد",
    logoPath: logoUrl,
    faviconPath: "/favicon.ico",
    ogImage: logoUrl,
    phoneNumber: "01050663539",
    whatsappNumber: "201050663539",
    officePhone: "01050663539",
    address: "الإسكندرية، سان ستيفانو، أمام ستاربكس، ممر عمارة الأوقاف، بين عصير مكة وصيدلية العزبي",
    email: "info@saada-makers.com",
    placeholderImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    siteUrl: "https://www.happinessmakers.online",
    social: {
        facebook: "https://www.facebook.com/share/1HpTkYTqRf/",
        instagram: "https://www.instagram.com/happiness.makers.20?igsh=anRnZ2Mzcmw2Ymdk"
    },
    vatRate: 1.14,
    branches: [
        { name: "فرع الرحاب", info: "السوق القديم بجانب مكتبة الأوائل", phone: "01050005701", map: "https://maps.app.goo.gl/atDFtjPyawmjVF2f7" },
        { name: "فرع المهندسين", info: "تقاطع شارع شهاب مع شارع سوريا", phone: "01050663537", map: "https://maps.app.goo.gl/n8ZGWeHtxUBbdA497" },
        { name: "فرع المعادي 1", info: "82 شارع 9 بجانب بابا جونز", phone: "01050663538", map: "https://maps.app.goo.gl/1QEZhey61yARYkai6" },
        { name: "فرع المعادي 2", info: "49 شارع 9 المعادي", phone: "01050006956", map: "https://maps.app.goo.gl/gqYx3aiy9VbaJWD28" },
        { name: "فرع مدينة نصر", info: "63 شارع كابول مكرم عبيد", phone: "01050006929", map: "https://maps.app.goo.gl/xEoTtekT3Yii3Rag9" },
        { name: "فرع مصر الجديدة", info: "24 شارع الميرغني امام النادي", phone: "01050006946", map: "https://maps.app.goo.gl/52u6nSZCBhzigG2v5" },
        { name: "فرع اسكندرية", info: "سان ستيفانو ممر عمارة الاوقاف", phone: "01050663539", map: "https://maps.app.goo.gl/GzcPvygy4inj9dbj7" },
    ]
};

export const CAT_HIERARCHY: Record<string, any[]> = {
    'chocolate': [
        { id: 'milk-chocolate', label: 'ميلك', icon: '🥛' },
        { id: 'dark-chocolate', label: 'دارك', icon: '🌑' },
        { id: 'white-chocolate', label: 'وايت', icon: '☁️' },
        { id: 'stevia-chocolate', label: 'ستيفيا', icon: '🌿' },
        { id: 'kunafa-chocolate', label: 'كنافة', icon: '🧁' },
        { id: 'nuts-chocolate', label: 'مكسرات', icon: '🥜' },
    ],
    'coffee': [
        { id: 'instant-coffee', label: 'سريعة التحضير', icon: '⚡' },
        { id: 'turkish-coffee', label: 'قهوة تركية', icon: '🫖' },
        { id: 'espresso', label: 'اسبريسو', icon: '☕' },
        { id: 'decaf', label: 'ديكاف', icon: '💤' },
    ],
    'dietary': [
        { id: 'free-sugar', label: 'فري شوجر', icon: '🚫🍬' },
        { id: 'free-gluten', label: 'فري جلوتين', icon: '🌾❌' },
    ],
    'cosmetics': [
        { id: 'skincare', label: 'العناية بالبشرة', icon: '🧴' },
        { id: 'haircare', label: 'العناية بالشعر', icon: '💇' },
        { id: 'car', label: 'السيارة', icon: '🚗' },
    ],
};
