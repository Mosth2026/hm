
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PremiumDecorations = () => {
    // Array of positions and types for variety
    const decorations = [
        { left: '5%', height: '140px', type: 'star', delay: '0s', size: '14px', showOnMobile: true },
        { left: '15%', height: '200px', type: 'lantern', delay: '0.5s', size: '28px', showOnMobile: true },
        { left: '25%', height: '160px', type: 'lantern', delay: '1.2s', size: '22px', showOnMobile: true },
        { left: '35%', height: '240px', type: 'star', delay: '0.8s', size: '20px', showOnMobile: false },
        { left: '45%', height: '180px', type: 'star', delay: '1.5s', size: '16px', showOnMobile: true },
        { left: '55%', height: '220px', type: 'lantern', delay: '0.3s', size: '32px', showOnMobile: true },
        { left: '65%', height: '190px', type: 'lantern', delay: '1.8s', size: '26px', showOnMobile: true },
        { left: '75%', height: '150px', type: 'lantern', delay: '2.1s', size: '18px', showOnMobile: true },
        { left: '85%', height: '210px', type: 'star', delay: '1.7s', size: '24px', showOnMobile: false },
        { left: '92%', height: '170px', type: 'star', delay: '0.9s', size: '15px', showOnMobile: true },
        { left: '98%', height: '230px', type: 'lantern', delay: '2.5s', size: '25px', showOnMobile: true },
    ];

    return (
        <div className="fixed top-0 left-0 w-full h-[300px] pointer-events-none z-[45] overflow-visible select-none pointer-events-none">
            <div className="relative w-full h-full">
                {decorations.map((dec, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "absolute top-0 flex flex-col items-center will-change-transform",
                            idx % 2 === 0 ? "animate-sway" : "animate-sway-slow",
                            dec.showOnMobile ? 'flex' : 'hidden sm:flex'
                        )}
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
                                    className="text-secondary fill-secondary lux-glow"
                                    style={{ width: dec.size, height: dec.size }}
                                />
                            ) : (
                                <svg
                                    viewBox="0 0 100 120"
                                    className="text-secondary fill-secondary lux-glow"
                                    style={{ width: dec.size, height: `calc(${dec.size} * 1.2)` }}
                                >
                                    {/* Luxurious Gold Gradient Definition */}
                                    <defs>
                                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                                            <stop offset="50%" style={{ stopColor: '#DAA520' }} />
                                            <stop offset="100%" style={{ stopColor: '#B8860B' }} />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Detailed Lantern Body */}
                                    <path d="M50 5 L42 18 L58 18 Z" fill="url(#goldGradient)" />
                                    <path d="M30 18 L70 18 L85 45 L70 75 L30 75 L15 45 Z" fill="url(#goldGradient)" className="opacity-95" />
                                    
                                    {/* Glass/Window Effect */}
                                    <path d="M38 25 L62 25 L68 45 L62 65 L38 65 L32 45 Z" fill="white" fillOpacity="0.1" />
                                    
                                    {/* Inner Light Flare */}
                                    <circle cx="50" cy="45" r="10" fill="white" fillOpacity="0.4" filter="url(#glow)" />
                                    <circle cx="50" cy="45" r="5" fill="white" fillOpacity="0.8" />
                                    
                                    {/* Decorative Filigree */}
                                    <path d="M30 18 L70 18 M30 75 L70 75 M15 45 L85 45" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
                                    <path d="M50 75 L40 100 L60 100 L50 75 Z" fill="url(#goldGradient)" />
                                    <path d="M45 100 L40 110 L60 110 L55 100 Z" fill="url(#goldGradient)" />
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
