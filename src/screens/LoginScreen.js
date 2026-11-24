import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { Trophy, Eye, EyeOff } from 'lucide-react-native';
// import apiFetch from '../api/apiFetch'; // <-- DESCOMENTAR AL CONECTAR API
import { COLORS } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('sesion_deportes').then((sesion) => {
      if (sesion) navigation.replace('MainTabs');
    });
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Campos requeridos', 'Ingresa tus datos para acceder al sistema.');
    }

    setLoading(true);

    /* =========================================================================
       CÓDIGO REAL PARA CUANDO EL PROFESOR PASE LA API (DESCOMENTAR ESTE BLOQUE):
       =========================================================================
    try {
      const data = await apiFetch.post('/auth/login', { email, password });
      const payload = {
        email: data.user?.email || email,
        role: data.user?.rol || data.user?.role || 'USER',
        token: data.token || data.accessToken,
      };
      await AsyncStorage.setItem('sesion_deportes', JSON.stringify(payload));
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error al iniciar sesión', error.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
    return;
    ========================================================================= */

    // SIMULACIÓN TEMPORAL SIN BACKEND
    setTimeout(async () => {
      const payload = {
        email,
        role: 'USER',
        token: 'mock-jwt-user-token',
      };
      await AsyncStorage.setItem('sesion_deportes', JSON.stringify(payload));
      setLoading(false);
      navigation.replace('MainTabs');
    }, 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.topBanner}>
        <Trophy size={42} color="#FFFFFF" strokeWidth={2} />
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 4, marginBottom: 8 }}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M2.2 12h19.6M12 2.2v19.6" />
          </Svg>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
            <Circle cx="12" cy="12" r="10" />
            <Polygon points="12 7 16.5 10.3 14.8 15.5 9.2 15.5 7.5 10.3" />
          </Svg>
        </View>
        <Text style={styles.bannerTitle}>Coordinación{'\n'}Deportiva</Text>
        <Text style={styles.bannerSub}>Gestión de material y espacios{'\n'}deportivos.</Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSub}>Ingresa tus datos para{'\n'}acceder al sistema</Text>

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Contraseña</Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.mutedSmall}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { marginBottom: 0, paddingRight: 40 }]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              {showPassword ? <EyeOff size={18} color={COLORS.muted} /> : <Eye size={18} color={COLORS.muted} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.forgotText}>Olvidé mi contraseña</Text>

          <TouchableOpacity style={styles.pillBtn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.pillBtnText}>{loading ? 'Validando...' : 'Iniciar Sesión'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 22 }}>
            <Text style={styles.registerLink}>
              ¿No tienes cuenta? <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBanner: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  bannerSub: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 8,
  },
  bottomArea: {
    padding: 16,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    padding: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
  },
  mutedSmall: {
    fontSize: 11,
    color: COLORS.muted,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
  },
  forgotText: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'right',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  pillBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 20,
    minWidth: 190,
    alignItems: 'center',
  },
  pillBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.info,
    textAlign: 'center',
    fontSize: 13,
  },
});