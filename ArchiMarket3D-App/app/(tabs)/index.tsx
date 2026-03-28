import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏛️ ArchiMarket3D</Text>

      {user ? (
        <>
          <Text style={styles.welcome}>¡Hola, {user.name}! 👋</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/explore')}>
            <Text style={styles.buttonText}>Explorar Modelos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={logout}>
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Encuentra los mejores modelos 3D para tus proyectos</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.push('/auth/register')}>
            <Text style={styles.buttonOutlineText}>Registrarse</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 30 },
  welcome: { fontSize: 20, marginBottom: 30 },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginVertical: 8, width: '80%', alignItems: 'center' },
  buttonDanger: { backgroundColor: '#ef4444' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2563eb' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  buttonOutlineText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
});