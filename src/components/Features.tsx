
import { TruckIcon, BadgeCheck, Package, Clock, ShieldCheck, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: <TruckIcon className="h-8 w-8" />,
    title: "توصيل ملكي سريع",
    description: "نصل إليكم أينما كنتم بأمان وسرعة تبريد فائقة للحفاظ على جودة المنتجات المستوردة."
  },
  {
    icon: <BadgeCheck className="h-8 w-8" />,
    title: "مختارات عالمية",
    description: "ننتقي لكم أفضل ما تقدمه الأسواق العالمية من علامات تجارية أحببتموها في سفركم."
  },
  {
    icon: <Package className="h-8 w-8" />,
    title: "تغليف هدايا فاخر",
    description: "تغليف يليق بقيمة هداياكم، لنجعل من لحظة الاستقبال ذكرى لا تُنسى."
  },
  {
    icon: <HeartHandshake className="h-8 w-8" />,
    title: "شغف التميز",
    description: "فلسفتنا تعتمد على روابط المشاعر، نسعى دائماً لنوفر لكم المنتجات التي تلامس قلوبكم."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-background font-tajawal rtl">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-[2.5rem] border border-primary/5 shadow-xl transition-all duration-500 hover:-translate-y-2 text-right relative overflow-hidden"
            >
              {/* Decorative Icon Background */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-secondary/5 rounded-br-[3rem] -translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-secondary shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-primary leading-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
