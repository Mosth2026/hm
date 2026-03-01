
import { ArrowLeft, Coffee, Gift, Martini, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const collections = [
    {
        title: "ركن الشوكولاتة",
        subtitle: "أفخم أنواع الشوكولاتة العالمية والمستوردة",
        icon: <Martini className="h-8 w-8" />,
        link: "/categories/chocolate",
        image: "https://images.unsplash.com/photo-1549007994-cb92cfd7d4d9?q=80&w=1000&auto=format&fit=crop",
        color: "from-amber-500 to-orange-700"
    },
    {
        title: "عالم السناكس",
        subtitle: "تشكيلة مذهلة من الشيبس والمسليات الفريدة",
        icon: <Utensils className="h-8 w-8" />,
        link: "/categories/snacks",
        image: "https://images.unsplash.com/photo-1599490659223-930b447ff317?q=80&w=1000&auto=format&fit=crop",
        color: "from-purple-500 to-indigo-700"
    },
    {
        title: "عشاق القهوة",
        subtitle: "حبوب، كبسولات، ومشروبات القهوة الجاهزة",
        icon: <Coffee className="h-8 w-8" />,
        link: "/categories/coffee",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop",
        color: "from-rose-500 to-red-700"
    }
];

const LifestyleCollections = () => {
    return (
        <section className="py-24 bg-white font-tajawal rtl overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-primary">أكثر من مجرد متجر</h2>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        لقد اخترنا لك المنتجات بناءً على لحظات حياتك، لتضيف لمسة من الرقي العالمي لكل موقف.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.link}
                            className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl transition-transform hover:-translate-y-2 duration-500"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-60 mix-blend-multiply`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-10 flex flex-col justify-end text-white text-right">
                                <div className="mb-6 h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-2">{item.title}</h3>
                                <p className="text-white/80 font-bold mb-6">{item.subtitle}</p>
                                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest group-hover:translate-x-[-10px] transition-transform">
                                    <ArrowLeft className="h-5 w-5" />
                                    اكتشف المجموعة
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LifestyleCollections;
