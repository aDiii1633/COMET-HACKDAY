import * as h3 from 'h3-js';

// H3 Resolution 8 (~0.7 km²) & Resolution 9 (~0.1 km²)
export const H3_RESOLUTION_DEFAULT = 9;

/**
 * Converts lat/lng coordinates to an H3 index string
 */
export const getH3Index = (lat, lng, res = H3_RESOLUTION_DEFAULT) => {
  try {
    return h3.latLngToCell(lat, lng, res);
  } catch (error) {
    console.error('Error converting lat/lng to H3 cell:', error);
    return '8928308280fffff';
  }
};

/**
 * Returns GeoJSON polygon representation of an H3 cell
 */
export const getH3CellGeoJson = (h3Index) => {
  try {
    const boundary = h3.cellToBoundary(h3Index, true); // true returns [lng, lat]
    return {
      type: 'Feature',
      properties: { h3Index },
      geometry: {
        type: 'Polygon',
        coordinates: [boundary],
      },
    };
  } catch (error) {
    console.error('Error converting H3 cell to boundary:', error);
    return null;
  }
};

/**
 * Calculates k-ring neighbors around a center location
 */
export const getH3Neighbors = (lat, lng, ringSize = 2, res = H3_RESOLUTION_DEFAULT) => {
  try {
    const centerIndex = h3.latLngToCell(lat, lng, res);
    return h3.gridDisk(centerIndex, ringSize);
  } catch (error) {
    console.error('Error fetching H3 neighbors:', error);
    return [];
  }
};
