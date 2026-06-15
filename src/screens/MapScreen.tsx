import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';

import { COLORS } from '../constants/colors';
import { getCurrentLocation } from '../services/gps';
import { useMapStore } from '../store/mapStore';

// 현재 위치를 못 얻었을 때의 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

export default function MapScreen() {
  const currentLocation = useMapStore((s) => s.currentLocation);
  const setLocation = useMapStore((s) => s.setLocation);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loc = await getCurrentLocation();
      if (loc && !cancelled) setLocation(loc);
    })();
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  const center: [number, number] = currentLocation
    ? [currentLocation.lng, currentLocation.lat]
    : DEFAULT_CENTER;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Dark}>
        <Camera centerCoordinate={center} zoomLevel={14} animationDuration={0} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fog,
  },
  map: {
    flex: 1,
  },
});
