/// App constants matching the web store configuration
class AppConstants {
  AppConstants._();

  // ─── App Info ───
  static const String appName = 'صناع السعادة';
  static const String appNameEn = 'Happiness Makers';
  static const String appSlogan = 'أصل المستورد';
  static const String appVersion = '1.0.0';

  // ─── Contact Info ───
  static const String phoneNumber = '01050663539';
  static const String whatsappNumber = '201050663539';
  static const String officePhone = '01050663539';
  static const String email = 'info@saada-makers.com';
  static const String address =
      'الإسكندرية، سان ستيفانو، أمام ستاربكس، ممر عمارة الأوقاف، بين عصير مكة وصيدلية العزبي';
  static const String siteUrl = 'https://www.happinessmakers.online';

  // ─── Social Media ───
  static const String facebookUrl =
      'https://www.facebook.com/share/1HpTkYTqRf/';
  static const String instagramUrl =
      'https://www.instagram.com/happiness.makers.20?igsh=anRnZ2Mzcmw2Ymdk';

  // ─── Supabase ───
  static const String supabaseUrl =
      'https://yacjvrfwcahjqqbuiyxy.supabase.co';
  static const String supabaseAnonKey =
      'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS';

  // ─── Branches ───
  static const List<Map<String, String>> branches = [
    {
      'name': 'فرع الرحاب',
      'info': 'السوق القديم بجانب مكتبة الأوائل',
      'phone': '01050005701',
      'map': 'https://maps.app.goo.gl/atDFtjPyawmjVF2f7',
    },
    {
      'name': 'فرع المهندسين',
      'info': 'تقاطع شارع شهاب مع شارع سوريا',
      'phone': '01050663537',
      'map': 'https://maps.app.goo.gl/n8ZGWeHtxUBbdA497',
    },
    {
      'name': 'فرع المعادي 1',
      'info': '82 شارع 9 بجانب بابا جونز',
      'phone': '01050663538',
      'map': 'https://maps.app.goo.gl/1QEZhey61yARYkai6',
    },
    {
      'name': 'فرع المعادي 2',
      'info': '49 شارع 9 المعادي',
      'phone': '01050006956',
      'map': 'https://maps.app.goo.gl/gqYx3aiy9VbaJWD28',
    },
    {
      'name': 'فرع مدينة نصر',
      'info': '63 شارع كابول مكرم عبيد',
      'phone': '01050006929',
      'map': 'https://maps.app.goo.gl/xEoTtekT3Yii3Rag9',
    },
    {
      'name': 'فرع مصر الجديدة',
      'info': '24 شارع الميرغني امام النادي',
      'phone': '01050006946',
      'map': 'https://maps.app.goo.gl/52u6nSZCBhzigG2v5',
    },
    {
      'name': 'فرع اسكندرية',
      'info': 'سان ستيفانو ممر عمارة الاوقاف',
      'phone': '01050663539',
      'map': 'https://maps.app.goo.gl/GzcPvygy4inj9dbj7',
    },
  ];

  // ─── Categories (Full 3-Level Hierarchy) ───
  // NOTE: "الكل" is added automatically at runtime by CategoryNode
  static const List<Map<String, dynamic>> categoryHierarchy = [
    {
      'id': 'chocolate',
      'label': 'الشوكولاتة',
      'icon': '🍫',
      'subcategories': [
        {
          'id': 'milk-chocolate',
          'label': 'ميلك',
          'icon': '🥛',
          'subcategories': [
            {'id': 'milk-fruits', 'label': 'فواكه', 'icon': '🍓'},
            {'id': 'milk-nuts', 'label': 'مكسرات', 'icon': '🥜'},
            {'id': 'milk-fruits-nuts', 'label': 'فواكه ومكسرات', 'icon': '🍓🥜'},
          ]
        },
        {'id': 'dark-chocolate', 'label': 'دارك', 'icon': '🌑'},
        {'id': 'white-chocolate', 'label': 'وايت', 'icon': '☁️'},
        {'id': 'stevia-chocolate', 'label': 'ستيفيا', 'icon': '🌿'},
        {'id': 'kunafa-chocolate', 'label': 'كنافة', 'icon': '🧁'},
        {'id': 'nuts-chocolate', 'label': 'مكسرات', 'icon': '🥜'},
      ]
    },
    {
      'id': 'coffee',
      'label': 'القهوة',
      'icon': '☕',
      'subcategories': [
        {'id': 'instant-coffee', 'label': 'سريعة التحضير', 'icon': '⚡'},
        {'id': 'turkish-coffee', 'label': 'قهوة تركية', 'icon': '🫖'},
        {'id': 'espresso', 'label': 'اسبريسو', 'icon': '☕'},
        {'id': 'decaf', 'label': 'ديكاف', 'icon': '💤'},
      ]
    },
    {
      'id': 'dietary',
      'label': 'الدايت والصحة',
      'icon': '🌱',
      'subcategories': [
        {'id': 'free-sugar', 'label': 'فري شوجر', 'icon': '🚫🍬'},
        {'id': 'free-gluten', 'label': 'فري جلوتين', 'icon': '🌾❌'},
      ]
    },
    {
      'id': 'cookies',
      'label': 'الكوكيز',
      'icon': '🍪',
    },
    {
      'id': 'snacks',
      'label': 'الاسناكس',
      'icon': '🥨',
    },
    {
      'id': 'candy',
      'label': 'الكاندي',
      'icon': '🍬',
    },
    {
      'id': 'cosmetics',
      'label': 'لمسات الجمال',
      'icon': '💄',
      'subcategories': [
        {'id': 'skincare', 'label': 'العناية بالبشرة', 'icon': '🧴'},
        {'id': 'haircare', 'label': 'العناية بالشعر', 'icon': '💇'},
        {'id': 'car', 'label': 'السيارة', 'icon': '🚗'},
      ]
    },
    {
      'id': 'gifts',
      'label': 'بوكسات الهدايا',
      'icon': '🎁',
    },
  ];

  // Flat list for quick access (used by legacy widgets)
  static const List<Map<String, String>> defaultCategories = [
    {'id': 'chocolate', 'label': 'الشوكولاتة', 'icon': '🍫'},
    {'id': 'coffee', 'label': 'القهوة', 'icon': '☕'},
    {'id': 'dietary', 'label': 'الدايت والصحة', 'icon': '🌱'},
    {'id': 'cookies', 'label': 'الكوكيز', 'icon': '🍪'},
    {'id': 'snacks', 'label': 'الاسناكس', 'icon': '🥨'},
    {'id': 'candy', 'label': 'الكاندي', 'icon': '🍬'},
    {'id': 'cosmetics', 'label': 'لمسات الجمال', 'icon': '💄'},
    {'id': 'gifts', 'label': 'بوكسات الهدايا', 'icon': '🎁'},
  ];

  // ─── Placeholder Image ───
  static const String placeholderImage =
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';

  // ─── WhatsApp Template ───
  static String whatsAppOrderUrl({
    required String phone,
    required String message,
  }) =>
      'https://wa.me/$phone?text=${Uri.encodeComponent(message)}';

  // ─── Order Statuses ───
  static const Map<String, String> orderStatuses = {
    'pending': 'قيد الانتظار',
    'processing': 'جاري التجهيز',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي',
  };

  // ─── Order Status Colors (hex) ───
  static const Map<String, int> orderStatusColors = {
    'pending': 0xFFF59E0B,
    'processing': 0xFF3B82F6,
    'shipped': 0xFF8B5CF6,
    'delivered': 0xFF10B981,
    'cancelled': 0xFFEF4444,
  };
}
