export type RouteDetailsProps = {
  origin: string;
  destination: string;
  isOriginLoading: boolean;
  isDestinationLoading: boolean;
  originSuggestions: LocationSuggestion[];
  destinationSuggestions: LocationSuggestion[];
  handleOriginChange: (text: string) => void;
  handleDestinationChange: (text: string) => void;
  clearOrigin: () => void;
  clearDestination: () => void;
  selectOriginSuggestion: (item: LocationSuggestion) => void;
  selectDestinationSuggestion: (item: LocationSuggestion) => void;
};

export type LocationSuggestion = {
  name: string;
  lat: number;
  lon: number;
  address?: string;
};