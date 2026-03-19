import React, { createContext, useContext, ReactNode } from 'react';
import { useBranches, Branch } from '../hooks/use-branches';
import { useAuth } from '../hooks/use-auth';

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  selectBranch: (branch: Branch) => void;
  detectLocation: () => void;
  loading: boolean;
  userCoords: { lat: number; lng: number } | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const branchData = useBranches();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  // Force null selected branch for customers to return to global store view
  const providerValue = {
    ...branchData,
    selectedBranch: isAdmin ? branchData.selectedBranch : null
  };

  return (
    <BranchContext.Provider value={providerValue}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
};
