
import React from "react";
import { Star } from "lucide-react";

const PremiumDecorations = () => {
    // Array of positions and types for variety
    const decorations = [
        { left: '5%', height: '120px', type: 'star', delay: '0s', size: '12px', showOnMobile: true },
        { left: '15%', height: '180px', type: 'lantern', delay: '0.5s', size: '24px', showOnMobile: false },
        { left: '25%', height: '140px', type: 'lantern', delay: '1.2s', size: '18px', showOnMobile: true }, // small lantern for mobile
        { left: '35%', height: '220px', type: 'star', delay: '0.8s', size: '18px', showOnMobile: false },
        { left: '45%', height: '160px', type: 'star', delay: '1.5s', size: '14px', showOnMobile: true },
        { left: '55%', height: '200px', type: 'lantern', delay: '0.3s', size: '28px', showOnMobile: false },
        { left: '70%', height: '130px', type: 'lantern', delay: '2.1s', size: '16px', showOnMobile: true }, // small lantern for mobile
        { left: '80%', height: '190px', type: 'star', delay: '1.7s', size: '20px', showOnMobile: false },
        { left: '90%', height: '150px', type: 'star', delay: '0.9s', size: '13px', showOnMobile: true },
        { left: '98%', height: '210px', type: 'lantern', delay: '2.5s', size: '22px', showOnMobile: false },
    ];

    return (
        <div className="fixed top-0 left-0 w-full h-[300px] pointer-events-none z-[45] overflow-visible select-none pointer-events-none">
            <div className="relative w-full h-full">
                {decorations.map((dec, idx) => (
                    <div
                        key={idx}
                        className={`absolute top-0 flex flex-col items-center animate-sway will-change-transform ${dec.showOnMobile ? 'flex' : 'hidden sm:flex'}`}
                        style={{
                            left: dec.left,
                            height: dec.height,
                            animationDelay: dec.delay,
                            transformOrigin: 'top center'
                        }}
                    >
                        {/* Hanging Thread - Ultra Thin and Elegant */}
                        <div className="w-[0.5px] h-full bg-gradient-to-b from-transparent via-secondary/30 to-secondary/60" />

                        {/* Decoration Item */}
                        <div className="relative -mt-1 flex items-center justify-center">
                            {dec.type === 'star' ? (
                                <Star
                                    className="text-secondary fill-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]"
                                    style={{ width: dec.size, height: dec.size }}
                                />
                            ) : (
                                <svg
                                    viewBox="0 0 100 100"
                                    className="text-secondary fill-secondary drop-shadow-[0_0_12px_rgba(var(--secondary),0.4)]"
                                    style={{ width: dec.size, height: dec.size }}
                                >
                                    {/* Elegant Lantern (Fanous) Design */}
                                    <path d="M50 5 L42 15 L58 15 Z" />
                                    <path d="M30 15 L70 15 L82 35 L70 55 L30 55 L18 35 Z" className="opacity-90" />
                                    <rect x="38" y="22" width="24" height="26" rx="2" className="fill-white/20" />
                                    <path d="M30 55 L42 75 L58 75 L70 55 Z" />
                                    <path d="M45 75 L40 85 L60 85 L55 75 Z" />

                                    {/* Inner Light Effect */}
                                    <circle cx="50" cy="35" r="8" className="fill-white/40 blur-[2px]" />
                                </svg>
                            )}

                            {/* Subtle Glow Aura */}
                            <div className="absolute -inset-2 bg-secondary/10 blur-xl rounded-full" />
                        </div>
                    </div>
                ))}

                {/* Arched Strings - Connecting the Pendants like the Vodafone screenshot */}
                <svg className="absolute top-0 left-0 w-full h-20 opacity-20 pointer-events-none" preserveAspectRatio="none">
                    <path
                        d="M0,0 Q10,40 20,0 Q30,40 40,0 Q50,40 60,0 Q70,40 80,0 Q90,40 100,0"
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </div>
    );
};

export default PremiumDecorations;
