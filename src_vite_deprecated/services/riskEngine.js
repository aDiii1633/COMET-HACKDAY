import { getH3Neighbors, getH3CellGeoJson } from '../utils/h3Helpers';

/**
 * Dynamic Weights for Composite Risk Model R(s,t):
 * - alpha: Community Incidents (0.35)
 * - beta: Illumination Deficiency Index (0.25)
 * - gamma: Pedestrian Crowd Sparsity (0.20)
 * - delta: Historical Crime Severity Index (0.20)
 */
const MODEL_WEIGHTS = {
  alpha: 0.35,
  beta: 0.25,
  gamma: 0.20,
  delta: 0.20,
};

/**
 * Calculates spatial risk score R(s, t) for a single spatial location
 */
export const calculateCompositeRisk = (location, timeOffsetMinutes = 0, communityReports = []) => {
  const { latitude, longitude } = location;

  // 1. Community Incident Density (C)
  let communityScore = 15;
  communityReports.forEach((rep) => {
    const distSq = Math.pow(rep.latitude - latitude, 2) + Math.pow(rep.longitude - longitude, 2);
    if (distSq < 0.0001) {
      communityScore += rep.severity * 12;
    }
  });
  communityScore = Math.min(100, communityScore);

  // 2. Illumination Deficiency Index (L) - degrades with time of day and future offset
  let illuminationScore = 20;
  if (timeOffsetMinutes > 0) {
    illuminationScore += Math.floor(timeOffsetMinutes * 0.8);
  }
  illuminationScore = Math.min(100, illuminationScore);

  // 3. Crowd Sparsity Penalty (D) - drops significantly late at night
  let crowdSparsityScore = 25;
  if (timeOffsetMinutes >= 30) {
    crowdSparsityScore += 45; // Foot traffic drops after business hours
  }
  crowdSparsityScore = Math.min(100, crowdSparsityScore);

  // 4. Historical Crime Severity Index (H)
  const historicalScore = 18;

  // Composite Weighted Sum
  const compositeScore = Math.round(
    MODEL_WEIGHTS.alpha * communityScore +
    MODEL_WEIGHTS.beta * illuminationScore +
    MODEL_WEIGHTS.gamma * crowdSparsityScore +
    MODEL_WEIGHTS.delta * historicalScore
  );

  return {
    score: Math.min(99, Math.max(5, compositeScore)),
    factors: {
      communityScore,
      illuminationScore,
      crowdSparsityScore,
      historicalScore,
    },
  };
};

/**
 * Generates GeoJSON FeatureCollection of spatial risk hexagons around center lat/lng
 */
export const generateRiskHeatmapGeoJson = (centerLat, centerLng, timeOffsetMinutes = 0, communityReports = []) => {
  const hexIndices = getH3Neighbors(centerLat, centerLng, 3);

  const features = hexIndices.map((h3Index, idx) => {
    const geoJsonCell = getH3CellGeoJson(h3Index);
    if (!geoJsonCell) return null;

    // Simulate localized risk variation across hex grid
    let latOffset = (idx % 3 - 1) * 0.004;
    let lngOffset = (Math.floor(idx / 3) - 1) * 0.004;
    
    // Inject high risk corridor for demo alley area
    const isAlleyCorridor = idx === 4 || idx === 7;
    const baseLat = centerLat + latOffset + (isAlleyCorridor ? 0.002 : 0);
    const baseLng = centerLng + lngOffset + (isAlleyCorridor ? 0.002 : 0);

    const { score } = calculateCompositeRisk(
      { latitude: baseLat, longitude: baseLng },
      timeOffsetMinutes,
      communityReports
    );

    const finalScore = isAlleyCorridor ? Math.min(95, score + 45) : score;

    return {
      ...geoJsonCell,
      properties: {
        h3Index,
        riskScore: finalScore,
        color: finalScore > 60 ? '#EF4444' : finalScore > 30 ? '#F59E0B' : '#10B981',
      },
    };
  }).filter(Boolean);

  return {
    type: 'FeatureCollection',
    features,
  };
};
