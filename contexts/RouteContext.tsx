// RouteContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface RouteDetails {
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
}

interface RouteContextType {
  routeDetails: RouteDetails | null;
  setRouteDetails: (details: RouteDetails) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  return (
    <RouteContext.Provider value={{ routeDetails, setRouteDetails }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRouteContext = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return context;
};
