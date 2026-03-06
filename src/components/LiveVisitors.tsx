
import React, { useState, useEffect } from "react";
import { Users, Activity } from "lucide-react";

const LiveVisitors = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // A "smart" pseudo-live counter that reflects a realistic number of shoppers
        // In a real app, this would use a websocket or real-time Supabase presence
        const baseCount = 12 + Math.floor(Math.random() * 8);
        setCount(baseCount);

        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                return next < 5 ? 5 : next > 40 ? 35 : next;
            });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative">
                <Users className="h-4 w-4 text-emerald-500" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                يتسوق الآن: <span className="text-sm font-black">{count}</span> عميل
            </p>
        </div>
    );
};

export default LiveVisitors;
