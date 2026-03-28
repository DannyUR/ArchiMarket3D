import { View, Text, StyleSheet } from 'react-native';
import { useCart } from '../../hooks/useCart';

export default function CartScreen() {
  const { items, total } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Carrito</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Tu carrito está vacío</Text>
      ) : (
        <>
          <Text style={styles.count}>{items.length} modelo(s)</Text>
          <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 20 },
  empty: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 50 },
  count: { fontSize: 16, color: '#374151' },
  total: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginTop: 20 },
});