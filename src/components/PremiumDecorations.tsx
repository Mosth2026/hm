
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PremiumDecorations = () => {
    // Array of positions and types for variety
    const decorations = [
        { left: '5%', height: '160px', type: 'star', delay: '0s', size: '14px', showOnMobile: true },
        { left: '12%', height: '220px', type: 'lantern', delay: '0.5s', size: '24px', showOnMobile: true },
        { left: '22%', height: '180px', type: 'star-outline', delay: '1.2s', size: '18px', showOnMobile: true },
        { left: '32%', height: '260px', type: 'lantern', delay: '0.8s', size: '28px', showOnMobile: false },
        { left: '42%', height: '200px', type: 'star', delay: '1.5s', size: '16px', showOnMobile: true },
        { left: '52%', height: '240px', type: 'lantern', delay: '0.3s', size: '30px', showOnMobile: true },
        { left: '62%', height: '210px', type: 'star-outline', delay: '1.8s', size: '24px', showOnMobile: true },
        { left: '72%', height: '170px', type: 'star', delay: '2.1s', size: '18px', showOnMobile: true },
        { left: '82%', height: '230px', type: 'lantern', delay: '1.7s', size: '26px', showOnMobile: false },
        { left: '92%', height: '190px', type: 'star-outline', delay: '0.9s', size: '15px', showOnMobile: true },
        { left: '98%', height: '250px', type: 'lantern', delay: '2.5s', size: '22px', showOnMobile: true },
    ];

    return (
        <div className="fixed top-0 left-0 w-full h-[400px] pointer-events-none z-[45] overflow-visible select-none font-tajawal hidden md:block">
            {/* Arched Strings Background - Matching Vodafone screenshot arches */}
            <svg className="absolute top-0 left-0 w-full h-40 opacity-20 pointer-events-none" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsla(var(--secondary), 0.1)" />
                        <stop offset="50%" stopColor="hsla(var(--secondary), 0.6)" />
                        <stop offset="100%" stopColor="hsla(var(--secondary), 0.1)" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,0 Q10,80 20,0 Q30,80 40,0 Q50,80 60,0 Q70,80 80,0 Q90,80 100,0"
                    fill="none"
                    stroke="url(#wireGradient)"
                    strokeWidth="0.5"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            <div className="relative w-full h-full">
                {decorations.map((dec, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "absolute top-0 flex flex-col items-center transform-gpu",
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
                        {/* Hanging Thread - Matching the screen link style */}
                        <div className="w-[0.5px] h-full bg-secondary/40 shadow-[0_0_5px_rgba(var(--secondary),0.2)]" />

                        {/* Decoration Item */}
                        <div className="relative -mt-1 flex items-center justify-center">
                            {dec.type.includes('star') ? (
                                <Star
                                    className={cn(
                                        "text-secondary lux-glow transition-all duration-700",
                                        dec.type === 'star' ? "fill-secondary" : "fill-none"
                                    )}
                                    style={{
                                        width: dec.size,
                                        height: dec.size,
                                        strokeWidth: dec.type === 'star-outline' ? 1.5 : 0,
                                        opacity: dec.type === 'star-outline' ? 0.7 : 0.9
                                    }}
                                />
                            ) : (
                                <svg
                                    viewBox="0 0 100 160"
                                    className="text-secondary lux-glow"
                                    style={{ width: dec.size, height: `calc(${dec.size} * 1.6)` }}
                                >
                                    <defs>
                                        <linearGradient id={`goldGradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#FFD700" />
                                            <stop offset="50%" stopColor="#FDB931" />
                                            <stop offset="100%" stopColor="#9E7E38" />
                                        </linearGradient>
                                        <filter id={`internalGlow-${idx}`}>
                                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Ultra Slender Traditional Fanous Silhouette */}
                                    <path d="M50 5 L35 25 L65 25 Z" fill={`url(#goldGradient-${idx})`} />
                                    <path d="M28 25 L72 25 L80 40 L20 40 Z" fill={`url(#goldGradient-${idx})`} opacity="0.95" />

                                    {/* Slender Main Body */}
                                    <path d="M20 40 L80 40 L88 85 L12 85 Z" fill={`url(#goldGradient-${idx})`} opacity="0.85" />

                                    {/* Ornate Glass Windows */}
                                    <path d="M35 45 L65 45 L72 80 L28 80 Z" fill="white" fillOpacity="0.15" />
                                    <rect x="49" y="45" width="2" height="35" fill="white" fillOpacity="0.1" />

                                    {/* Center Light Flare */}
                                    <circle cx="50" cy="62" r="10" fill="white" fillOpacity="0.25" filter={`url(#internalGlow-${idx})`} />
                                    <circle cx="50" cy="62" r="5" fill="white" fillOpacity="0.7" />

                                    {/* Lower Transition */}
                                    <path d="M12 85 L88 85 L78 105 L22 105 Z" fill={`url(#goldGradient-${idx})`} />

                                    {/* Slender Tiered Base */}
                                    <path d="M22 105 L32 135 L68 135 L78 105 Z" fill={`url(#goldGradient-${idx})`} opacity="0.9" />
                                    <path d="M38 135 L34 145 L66 145 L62 135 Z" fill={`url(#goldGradient-${idx})`} />

                                    {/* Very fine etching lines for luxury feel */}
                                    <path d="M28 25 L72 25 M20 40 L80 40 M12 85 L88 85 M22 105 L78 105" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
                                </svg>
                            )}

                            {/* Subtle Radial Glow */}
                            <div className="absolute -inset-4 bg-secondary/5 blur-[30px] rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PremiumDecorations;
