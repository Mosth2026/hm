
const brands = [
    "Lindt", "Takis", "Pringles", "Nutella", "Lavazza", "Starbucks", "Lotus", "Milka", "Monster", "Kinder", "Ferrero Rocher"
];

const TrustBanner = () => {
    return (
        <section className="py-12 bg-primary/5 overflow-hidden border-y border-primary/5">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-black text-primary/40 uppercase tracking-[0.3em] mb-10">
                    ننتقي لكم أفضل العلامات التجارية العالمية
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    {brands.map((brand, idx) => (
                        <span
                            key={idx}
                            className="text-2xl md:text-3xl font-black font-outfit text-primary italic hover:scale-110 transition-transform cursor-default"
                        >
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBanner;
