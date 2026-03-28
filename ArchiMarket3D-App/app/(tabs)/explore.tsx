import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

export default function ExploreScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.text}>📦 Catálogo de modelos 3D</Text>
      <Text style={styles.subtext}>Pronto podrás explorar los 236 modelos disponibles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  text: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  subtext: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});