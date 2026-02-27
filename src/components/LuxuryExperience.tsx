
import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";

const LuxuryExperience = () => {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {/* Optimized Spotlight using CSS Variables */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-[0.15] will-change-transform"
                style={{
                    left: 'calc(var(--mouse-x, -1000px) - 400px)',
                    top: 'calc(var(--mouse-y, -1000px) - 400px)',
                    background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
                }}
            />

            {/* Subtle Sparkle - Floating Elegant Element */}
            <div className="absolute top-10 right-10 opacity-[0.05] animate-float hidden md:block">
                <Sparkles className="h-32 w-32 text-secondary" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--secondary)))' }} />
            </div>

            {/* High-end Bokeh */}
            <div className="absolute top-1/3 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] animate-float" style={{ animationDuration: '15s' }} />
        </div>
    );
};

export default LuxuryExperience;
