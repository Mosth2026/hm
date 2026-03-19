import React, { createContext, useContext, ReactNode } from 'react';
import { useBranches, Branch } from '../hooks/use-branches';

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

  return (
    <BranchContext.Provider value={branchData}>
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
