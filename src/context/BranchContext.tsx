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

export function BranchProvider({ children }: { children: ReactNode }) {
  const branchData = useBranches();
  const providerValue = {
    ...branchData
  };

  return (
    <BranchContext.Provider value={providerValue}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranchContext() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
}