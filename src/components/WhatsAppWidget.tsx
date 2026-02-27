
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const WhatsAppWidget = () => {
    const phoneNumber = SITE_CONFIG.whatsappNumber;
    const message = encodeURIComponent("مرحباً صناع السعادة، أريد الاستفسار عن ...");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex items-center gap-3">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4"
                aria-label="Contact us on WhatsApp"
            >
                {/* Tooltip - Show on Hover */}
                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border border-saada-brown/10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none hidden md:block rtl">
                    <p className="text-saada-brown font-bold text-sm whitespace-nowrap">هل لديك استفسار؟ تواصل معنا</p>
                </div>

                {/* Main Action Button */}
                <div className="relative">
                    {/* Ring Animation */}
                    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />

                    <div className="relative w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 group-hover:shadow-[#25D366]/60 group-hover:scale-110 active:scale-95 transition-all duration-500">
                        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white fill-white/10" />

                        {/* Notification Dot */}
                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saada-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-saada-red border-2 border-white"></span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default WhatsAppWidget;
