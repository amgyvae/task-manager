import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

export default function SelectLocationScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location permission in settings.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const handleSelect = (event: MapPressEvent) => {
    setSelected(event.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    if (selected) {
      router.push({ pathname: '/', params: { lat: selected.latitude, lng: selected.longitude } });
    } else {
      Alert.alert('Please select a location');
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleSelect}
        >
          {selected && <Marker coordinate={selected} />}
        </MapView>
      )}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  confirmButton: {
    backgroundColor: '#3D85C6',
    padding: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
