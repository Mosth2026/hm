import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Branch {
  id: number;
  name: string;
  whatsapp_number: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase.from('branches').select('*').eq('is_active', true);
      if (data) {
        setBranches(data);
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestBranch = (lat: number, lng: number, branchesList: Branch[]) => {
    if (branchesList.length === 0) return null;
    let nearest = branchesList[0];
    let minDistance = calculateDistance(lat, lng, nearest.latitude, nearest.longitude);

    branchesList.forEach(branch => {
      const dist = calculateDistance(lat, lng, branch.latitude, branch.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = branch;
      }
    });

    return nearest;
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserCoords(coords);
        
        if (branches.length > 0) {
          const nearest = findNearestBranch(latitude, longitude, branches);
          if (nearest) {
            setSelectedBranch(nearest);
            localStorage.setItem('selected_branch', JSON.stringify(nearest));
          }
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        // Default to first branch if geolocation fails
        if (branches.length > 0 && !selectedBranch) {
          setSelectedBranch(branches[0]);
        }
      });
    } else {
      // Fallback if not supported
      if (branches.length > 0 && !selectedBranch) {
        setSelectedBranch(branches[0]);
      }
    }
  };

  // Initialize from localStorage ONLY if saved, otherwise keep as null
  useEffect(() => {
    if (branches.length > 0) {
      const saved = localStorage.getItem('selected_branch');
      if (saved) {
        setSelectedBranch(JSON.parse(saved));
      }
      // Automatic detection removed to keep branches in background as requested
    }
  }, [branches]);

  const selectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selected_branch', JSON.stringify(branch));
  };

  return { branches, selectedBranch, selectBranch, detectLocation, loading, userCoords };
};
