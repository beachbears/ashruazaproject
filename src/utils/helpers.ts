// src/utils/helpers.ts

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function formatDuration(seconds?: number): string {
  if (seconds === undefined) return "N/A";

  // Round seconds to the nearest whole number
  const roundedSeconds = Math.round(seconds);

  const mins = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  } else if (mins > 0) {
    return `${mins}min ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function shortenAddress(address: string) {
  return address.split(",")[0];
}

export function getSegmentLabel(
  type: string,
  fromStopName?: string,
  toStopName?: string,
  vehicleType?: string | null
): string {
  const mainLabel = ["jeep", "bus", "ejeep", "lrt", "mrt"].includes(type.toLowerCase())
    ? vehicleType
      ? vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
      : type.charAt(0).toUpperCase() + type.slice(1)
    : "Walk";
  if (fromStopName && toStopName) {
    return `${mainLabel}: ${shortenAddress(fromStopName)} - ${shortenAddress(toStopName)}`;
  }
  return mainLabel;
}
