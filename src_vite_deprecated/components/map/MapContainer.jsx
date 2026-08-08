import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLE_DARK_OLED } from '../../services/mapbox';
import { generateRiskHeatmapGeoJson } from '../../services/riskEngine';
import { useRouteStore } from '../../store/useRouteStore';
import { useSafetyStore } from '../../store/useSafetyStore';
import { triggerHaptic } from '../../utils/hapticManager';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const MapContainer = ({ onSelectSegment }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { origin, destination, routes, selectedRouteId, futureRiskMinutes } = useRouteStore();
  const { communityReports } = useSafetyStore();

  useEffect(() => {
    if (mapRef.current) return; // Prevent re-initialization (RULE-31)

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_DARK_OLED,
      center: [origin.longitude, origin.latitude],
      zoom: 14,
      pitch: 45,
      bearing: -17.6,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Add H3 Spatial Risk Hexagons source
      const riskHeatmapData = generateRiskHeatmapGeoJson(
        origin.latitude,
        origin.longitude,
        futureRiskMinutes,
        communityReports
      );

      map.addSource('risk-heatmap-source', {
        type: 'geojson',
        data: riskHeatmapData,
      });

      // Layer for Hexagon Fills
      map.addLayer({
        id: 'risk-heatmap-layer',
        type: 'fill',
        source: 'risk-heatmap-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.45,
        },
      });

      // Layer for Hexagon Outlines
      map.addLayer({
        id: 'risk-heatmap-outline',
        type: 'line',
        source: 'risk-heatmap-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.5,
          'line-opacity': 0.7,
        },
      });

      // Click event for Explainable AI (XAI) breakdown
      map.on('click', 'risk-heatmap-layer', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          triggerHaptic('light');
          if (onSelectSegment) {
            onSelectSegment(props);
          }
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update heatmap data when future risk timeline slider moves
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const updatedHeatmap = generateRiskHeatmapGeoJson(
      origin.latitude,
      origin.longitude,
      futureRiskMinutes,
      communityReports
    );
    const source = mapRef.current.getSource('risk-heatmap-source');
    if (source) {
      source.setData(updatedHeatmap);
    }
  }, [futureRiskMinutes, communityReports, mapLoaded]);

  // Render navigation route paths
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !routes || routes.length === 0) return;

    routes.forEach((route) => {
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      if (!mapRef.current.getSource(sourceId)) {
        mapRef.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route.geometry,
          },
        });

        mapRef.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': route.id === 'route_alpha_safest' ? '#10B981' : '#EF4444',
            'line-width': route.id === selectedRouteId ? 6 : 3,
            'line-opacity': route.id === selectedRouteId ? 0.95 : 0.4,
          },
        });
      } else {
        mapRef.current.setPaintProperty(
          layerId,
          'line-width',
          route.id === selectedRouteId ? 6 : 3
        );
        mapRef.current.setPaintProperty(
          layerId,
          'line-opacity',
          route.id === selectedRouteId ? 0.95 : 0.4
        );
      }
    });
  }, [routes, selectedRouteId, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
