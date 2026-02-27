import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Palette, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
    { id: 'saada-signature', name: 'Saada Signature', colors: ['bg-black', 'bg-[#f31b3e]'], description: 'ثيم اللوجو الرسمي (أسود ملكي)' },
    { id: 'signature-serene', name: 'Signature Serene', colors: ['bg-[#fdfcfb]', 'bg-[#f31b3e]'], description: 'هدوء وبساطة اللوجو (أبيض)' },
    { id: 'royal', name: 'Classic Royal', colors: ['bg-[#222319]', 'bg-[#d99d33]'], description: 'القهوة والذهب الملكي' },
    { id: 'chocolate-silk', name: 'Chocolate Silk', colors: ['bg-[#fdfcfb]', 'bg-[#3d2b1f]'], description: 'بياض الحرير بلمسة بنية' },
    { id: 'golden-sands', name: 'Golden Sands', colors: ['bg-[#f5f5f5]', 'bg-[#d4af37]'], description: 'رمال الذهب العربية' },
    { id: 'lavender-mist', name: 'Lavender Mist', colors: ['bg-[#f9f5ff]', 'bg-[#b39ddb]'], description: 'رقة اللافندر والفضة' },
    { id: 'luxury-velvet', name: 'Luxury Velvet', colors: ['bg-[#4a0e0e]', 'bg-[#cd7f32]'], description: 'فخامة المخمل والبرونز' },
    { id: 'midnight', name: 'Midnight Glow', colors: ['bg-[#090b1c]', 'bg-[#1fbff2]'], description: 'سحر الليل والنيون' },
    { id: 'berry', name: 'Berry Bliss', colors: ['bg-[#7a1f3d]', 'bg-[#ebae9a]'], description: 'فخامة التوت والورد' },
    { id: 'emerald', name: 'Emerald Garden', colors: ['bg-[#0d3d2a]', 'bg-[#b65a25]'], description: 'هدوء الطبيعة والنحاس' },
    { id: 'noir', name: 'Modern Noir', colors: ['bg-black', 'bg-gray-400'], description: 'بساطة الأبيض والأسود' },
];

const ThemeToggle = () => {
    const [currentTheme, setCurrentTheme] = useState('royal');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('site-theme') || 'royal';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = (themeId: string) => {
        setCurrentTheme(themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('site-theme', themeId);
    };

    return (
        <div className="fixed left-6 bottom-6 z-[100] font-tajawal rtl">
            <div className={cn(
                "absolute bottom-20 left-0 bg-white/10 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl transition-all duration-700 transform origin-bottom-left",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
            )}>
                <div className="space-y-6 w-64">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Palette className="h-5 w-5 text-secondary" />
                        <div>
                            <h3 className="text-white font-black text-lg">اختر ثيم المتجر</h3>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-outfit">Luxury Experiences</p>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-3 pb-2">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => toggleTheme(theme.id)}
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-2xl transition-all duration-500 border-2",
                                        currentTheme === theme.id
                                            ? "bg-white/20 border-secondary shadow-lg shadow-secondary/10 scale-[1.02]"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            <div className={cn("h-6 w-6 rounded-full border-2 border-white/20", theme.colors[0])} />
                                            <div className={cn("h-6 w-6 rounded-full border-2 border-white/20", theme.colors[1])} />
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-white text-sm font-bold">{theme.name}</span>
                                            <span className="block text-white/40 text-[10px]">{theme.description}</span>
                                        </div>
                                    </div>
                                    {currentTheme === theme.id && <Check className="h-4 w-4 text-secondary animate-in zoom-in duration-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-center">
                        <p className="text-[10px] text-white/30 italic">يمكنك العودة للثيم الأصلي في أي وقت</p>
                    </div>
                </div>
            </div>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-16 w-16 rounded-full shadow-2xl shadow-primary/20 transition-all duration-500 group relative overflow-hidden",
                    isOpen ? "bg-secondary text-primary rotate-90" : "bg-primary text-secondary"
                )}
            >
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
                <Sparkles className={cn("h-8 w-8 relative z-10 transition-transform", isOpen ? "rotate-45" : "")} />
            </Button>
        </div>
    );
};

export default ThemeToggle;
