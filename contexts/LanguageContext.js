// =====================================================
// LANGUAGE CONTEXT
// Remaining Feature: Multi-Language UI Support
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations dictionary
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.orders': 'My Orders',
    'nav.track': 'Track Order',
    'nav.account': 'Account',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.none': 'None',
    
    // Products
    'products.title': 'Products',
    'products.addToCart': 'Add to Cart',
    'products.addToWishlist': 'Add to Wishlist',
    'products.removeFromWishlist': 'Remove from Wishlist',
    'products.outOfStock': 'Out of Stock',
    'products.inStock': 'In Stock',
    'products.price': 'Price',
    'products.quantity': 'Quantity',
    'products.description': 'Description',
    'products.reviews': 'Reviews',
    'products.writeReview': 'Write a Review',
    'products.noProducts': 'No products found',
    'products.featured': 'Featured Products',
    'products.newArrivals': 'New Arrivals',
    'products.trending': 'Trending',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.continueShopping': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.updateQuantity': 'Update Quantity',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.contactInfo': 'Contact Information',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.postalCode': 'Postal Code',
    'checkout.country': 'Country',
    'checkout.notes': 'Order Notes',
    
    // Payment
    'payment.cod': 'Cash on Delivery',
    'payment.stripe': 'Credit/Debit Card',
    'payment.paypal': 'PayPal',
    'payment.processing': 'Processing payment...',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No orders yet',
    'orders.orderNumber': 'Order Number',
    'orders.status': 'Status',
    'orders.date': 'Date',
    'orders.total': 'Total',
    'orders.viewDetails': 'View Details',
    'orders.trackOrder': 'Track Order',
    'orders.cancelOrder': 'Cancel Order',
    
    // Order Status
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.processing': 'Processing',
    'status.shipped': 'Shipped',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',
    
    // Wishlist
    'wishlist.title': 'My Wishlist',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.moveToCart': 'Move to Cart',
    'wishlist.moveAllToCart': 'Move All to Cart',
    'wishlist.clearAll': 'Clear Wishlist',
    
    // Reviews
    'reviews.title': 'Customer Reviews',
    'reviews.writeReview': 'Write a Review',
    'reviews.rating': 'Rating',
    'reviews.yourName': 'Your Name',
    'reviews.yourEmail': 'Your Email',
    'reviews.reviewTitle': 'Review Title',
    'reviews.yourReview': 'Your Review',
    'reviews.submitReview': 'Submit Review',
    'reviews.noReviews': 'No reviews yet',
    'reviews.thankYou': 'Thank you for your review!',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2024 XR Tech Solutions. All rights reserved.',
    
    // Virtual Experience
    'vr.launch': 'Launch Virtual Experience',
    'vr.loading': 'Loading 3D Environment...',
    'vr.controls': 'Controls',
    'vr.exit': 'Exit Experience'
  },
  ur: {
    // Navigation (Urdu)
    'nav.home': 'ہوم',
    'nav.products': 'مصنوعات',
    'nav.cart': 'کارٹ',
    'nav.wishlist': 'خواہش فہرست',
    'nav.orders': 'میرے آرڈرز',
    'nav.track': 'آرڈر ٹریک کریں',
    'nav.account': 'اکاؤنٹ',
    'nav.login': 'لاگ ان',
    'nav.register': 'رجسٹر',
    'nav.logout': 'لاگ آؤٹ',
    
    // Common
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.error': 'غلطی',
    'common.success': 'کامیابی',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ',
    'common.delete': 'حذف کریں',
    'common.edit': 'ترمیم',
    'common.view': 'دیکھیں',
    'common.back': 'واپس',
    'common.next': 'اگلا',
    'common.submit': 'جمع کرائیں',
    'common.search': 'تلاش',
    'common.filter': 'فلٹر',
    'common.sort': 'ترتیب',
    'common.all': 'سب',
    'common.none': 'کوئی نہیں',
    
    // Products
    'products.title': 'مصنوعات',
    'products.addToCart': 'کارٹ میں شامل کریں',
    'products.addToWishlist': 'خواہش فہرست میں شامل کریں',
    'products.removeFromWishlist': 'خواہش فہرست سے ہٹائیں',
    'products.outOfStock': 'سٹاک ختم',
    'products.inStock': 'دستیاب',
    'products.price': 'قیمت',
    'products.quantity': 'مقدار',
    'products.description': 'تفصیل',
    'products.reviews': 'جائزے',
    'products.writeReview': 'جائزہ لکھیں',
    'products.noProducts': 'کوئی مصنوعات نہیں ملی',
    'products.featured': 'نمایاں مصنوعات',
    'products.newArrivals': 'نئی آمد',
    'products.trending': 'رجحان ساز',
    
    // Cart
    'cart.title': 'شاپنگ کارٹ',
    'cart.empty': 'آپ کا کارٹ خالی ہے',
    'cart.subtotal': 'ذیلی کل',
    'cart.tax': 'ٹیکس',
    'cart.total': 'کل',
    'cart.checkout': 'چیک آؤٹ کریں',
    'cart.continueShopping': 'خریداری جاری رکھیں',
    'cart.remove': 'ہٹائیں',
    'cart.updateQuantity': 'مقدار اپ ڈیٹ کریں',
    
    // Checkout
    'checkout.title': 'چیک آؤٹ',
    'checkout.contactInfo': 'رابطہ کی معلومات',
    'checkout.shippingAddress': 'ترسیل کا پتہ',
    'checkout.paymentMethod': 'ادائیگی کا طریقہ',
    'checkout.orderSummary': 'آرڈر کا خلاصہ',
    'checkout.placeOrder': 'آرڈر دیں',
    'checkout.firstName': 'پہلا نام',
    'checkout.lastName': 'آخری نام',
    'checkout.email': 'ای میل',
    'checkout.phone': 'فون',
    'checkout.address': 'پتہ',
    'checkout.city': 'شہر',
    'checkout.postalCode': 'پوسٹل کوڈ',
    'checkout.country': 'ملک',
    'checkout.notes': 'آرڈر نوٹس',
    
    // Payment
    'payment.cod': 'کیش آن ڈیلیوری',
    'payment.stripe': 'کریڈٹ/ڈیبٹ کارڈ',
    'payment.paypal': 'پے پال',
    'payment.processing': 'ادائیگی پروسیس ہو رہی ہے...',
    
    // Orders
    'orders.title': 'میرے آرڈرز',
    'orders.empty': 'ابھی تک کوئی آرڈر نہیں',
    'orders.orderNumber': 'آرڈر نمبر',
    'orders.status': 'حیثیت',
    'orders.date': 'تاریخ',
    'orders.total': 'کل',
    'orders.viewDetails': 'تفصیلات دیکھیں',
    'orders.trackOrder': 'آرڈر ٹریک کریں',
    'orders.cancelOrder': 'آرڈر منسوخ کریں',
    
    // Order Status
    'status.pending': 'زیر التوا',
    'status.confirmed': 'تصدیق شدہ',
    'status.processing': 'پروسیسنگ',
    'status.shipped': 'بھیجا گیا',
    'status.delivered': 'پہنچایا گیا',
    'status.cancelled': 'منسوخ',
    
    // Wishlist
    'wishlist.title': 'میری خواہش فہرست',
    'wishlist.empty': 'آپ کی خواہش فہرست خالی ہے',
    'wishlist.moveToCart': 'کارٹ میں منتقل کریں',
    'wishlist.moveAllToCart': 'سب کارٹ میں منتقل کریں',
    'wishlist.clearAll': 'فہرست صاف کریں',
    
    // Reviews
    'reviews.title': 'گاہک کے جائزے',
    'reviews.writeReview': 'جائزہ لکھیں',
    'reviews.rating': 'درجہ بندی',
    'reviews.yourName': 'آپ کا نام',
    'reviews.yourEmail': 'آپ کا ای میل',
    'reviews.reviewTitle': 'جائزہ کا عنوان',
    'reviews.yourReview': 'آپ کا جائزہ',
    'reviews.submitReview': 'جائزہ جمع کرائیں',
    'reviews.noReviews': 'ابھی تک کوئی جائزے نہیں',
    'reviews.thankYou': 'آپ کے جائزے کا شکریہ!',
    
    // Auth
    'auth.login': 'لاگ ان',
    'auth.register': 'رجسٹر',
    'auth.logout': 'لاگ آؤٹ',
    'auth.email': 'ای میل',
    'auth.password': 'پاس ورڈ',
    'auth.confirmPassword': 'پاس ورڈ کی تصدیق',
    'auth.forgotPassword': 'پاس ورڈ بھول گئے؟',
    'auth.noAccount': 'اکاؤنٹ نہیں ہے؟',
    'auth.haveAccount': 'پہلے سے اکاؤنٹ ہے؟',
    
    // Footer
    'footer.about': 'ہمارے بارے میں',
    'footer.contact': 'رابطہ',
    'footer.privacy': 'رازداری کی پالیسی',
    'footer.terms': 'سروس کی شرائط',
    'footer.copyright': '© 2024 ایکس آر ٹیک سولیوشنز۔ تمام حقوق محفوظ ہیں۔',
    
    // Virtual Experience
    'vr.launch': 'ورچوئل تجربہ شروع کریں',
    'vr.loading': '3D ماحول لوڈ ہو رہا ہے...',
    'vr.controls': 'کنٹرولز',
    'vr.exit': 'تجربہ چھوڑیں'
  },
  ar: {
    // Navigation (Arabic)
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.cart': 'السلة',
    'nav.wishlist': 'المفضلة',
    'nav.orders': 'طلباتي',
    'nav.track': 'تتبع الطلب',
    'nav.account': 'الحساب',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'nav.logout': 'تسجيل الخروج',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.all': 'الكل',
    'common.none': 'لا شيء',
    
    // Products
    'products.title': 'المنتجات',
    'products.addToCart': 'أضف إلى السلة',
    'products.addToWishlist': 'أضف إلى المفضلة',
    'products.removeFromWishlist': 'إزالة من المفضلة',
    'products.outOfStock': 'نفذ المخزون',
    'products.inStock': 'متوفر',
    'products.price': 'السعر',
    'products.quantity': 'الكمية',
    'products.description': 'الوصف',
    'products.reviews': 'المراجعات',
    'products.writeReview': 'اكتب مراجعة',
    'products.noProducts': 'لا توجد منتجات',
    'products.featured': 'المنتجات المميزة',
    'products.newArrivals': 'وصل حديثاً',
    'products.trending': 'الأكثر رواجاً',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.tax': 'الضريبة',
    'cart.total': 'الإجمالي',
    'cart.checkout': 'إتمام الشراء',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.remove': 'إزالة',
    'cart.updateQuantity': 'تحديث الكمية',
    
    // Footer
    'footer.about': 'من نحن',
    'footer.contact': 'اتصل بنا',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.copyright': '© 2024 حلول إكس آر التقنية. جميع الحقوق محفوظة.'
  }
};

// Supported languages
const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'ar', name: 'العربية', dir: 'rtl' }
];

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [direction, setDirection] = useState('ltr');

  // Load saved language on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      if (savedLang && translations[savedLang]) {
        setCurrentLanguage(savedLang);
        const lang = languages.find(l => l.code === savedLang);
        setDirection(lang?.dir || 'ltr');
      }
    }
  }, []);

  // Update document direction when language changes (client-side only)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = currentLanguage;
    }
  }, [direction, currentLanguage]);

  // Change language
  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
      const lang = languages.find(l => l.code === langCode);
      setDirection(lang?.dir || 'ltr');
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  // Translate function
  const t = (key, fallback = '') => {
    const langTranslations = translations[currentLanguage] || translations.en;
    return langTranslations[key] || translations.en[key] || fallback || key;
  };

  const value = {
    currentLanguage,
    direction,
    languages,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language selector component
export function LanguageSelector() {
  const { currentLanguage, languages, changeLanguage } = useLanguage();

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value)}
      className="language-selector"
      aria-label="Select Language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
      <style jsx>{`
        .language-selector {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }
        .language-selector:focus {
          outline: none;
          border-color: #667eea;
        }
        .language-selector option {
          background: #1a1a2e;
          color: #ffffff;
        }
      `}</style>
    </select>
  );
}
