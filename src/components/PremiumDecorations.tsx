
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
                                    viewBox="0 0 100 130"
                                    className="text-secondary fill-secondary lux-glow"
                                    style={{ width: dec.size, height: `calc(${dec.size} * 1.3)` }}
                                >
                                    <defs>
                                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                                            <stop offset="50%" style={{ stopColor: '#FDB931' }} />
                                            <stop offset="100%" style={{ stopColor: '#9E7E38' }} />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Traditional Fanous (Egyptian Style) */}
                                    {/* Top Ring */}
                                    <circle cx="50" cy="5" r="3" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />
                                    
                                    {/* Dome Top */}
                                    <path d="M50 8 L35 22 L65 22 Z" fill="url(#goldGradient)" />
                                    
                                    {/* Upper Tier */}
                                    <path d="M30 22 L70 22 L78 35 L22 35 Z" fill="url(#goldGradient)" opacity="0.9" />
                                    
                                    {/* Main Glass Body */}
                                    <path d="M22 35 L78 35 L85 65 L15 65 Z" fill="url(#goldGradient)" opacity="0.85" />
                                    
                                    {/* Detailed Glass Patterns (Windows) */}
                                    <path d="M35 40 L65 40 L72 60 L28 60 Z" fill="white" fillOpacity="0.15" />
                                    <rect x="48" y="40" width="4" height="20" fill="white" fillOpacity="0.1" />
                                    
                                    {/* Inner Light */}
                                    <circle cx="50" cy="50" r="12" fill="white" fillOpacity="0.3" filter="url(#glow)" />
                                    <circle cx="50" cy="50" r="6" fill="white" fillOpacity="0.6" />
                                    
                                    {/* Lower Flare */}
                                    <path d="M15 65 L85 65 L75 85 L25 85 Z" fill="url(#goldGradient)" />
                                    
                                    {/* Tiered Base */}
                                    <path d="M25 85 L35 105 L65 105 L75 85 Z" fill="url(#goldGradient)" opacity="0.9" />
                                    <path d="M40 105 L35 115 L65 115 L60 105 Z" fill="url(#goldGradient)" />
                                    
                                    {/* Decorative Borders */}
                                    <path d="M30 22 L70 22 M22 35 L78 35 M15 65 L85 65 M25 85 L75 85" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
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
