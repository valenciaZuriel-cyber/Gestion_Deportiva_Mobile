import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import apiFetch from '../api/apiFetch';
import { COLORS } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const irALogin = useCallback(() => {
    if (navigation?.replace) {
      navigation.replace('Login');
    }
  }, [navigation]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('sesion_deportes')
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          navigation.replace('MainTabs');
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [navigation]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const data = await apiFetch.post(
        '/api/auth/login',
        {
          email: email.trim(),
          password,
        },
        irALogin
      );

      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.accessToken;

      const rawRole =
        data?.user?.rol ||
        data?.user?.role ||
        data?.rol ||
        data?.role ||
        data?.data?.user?.rol ||
        data?.data?.rol ||
        'USER';
      const role = String(rawRole).toUpperCase();

      if (!token) {
        throw new Error('La API no devolvió un token válido.');
      }

      if (role === 'ADMIN') {
        throw new Error('Esta app móvil es exclusiva para estudiantes (USER).');
      }

      const usuario = data?.user || data?.data?.user || {
        email: email.trim(),
        rol: role,
      };

      await AsyncStorage.setItem(
        'sesion_deportes',
        JSON.stringify({
          token,
          role,
          email: usuario.email || email.trim(),
          user: usuario,
        })
      );

      navigation.replace('MainTabs');
    } catch (error) {
      const msg = error?.message || 'No se pudo iniciar sesión.';
      setErrorMsg(msg);
      Alert.alert('Error al iniciar sesión', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Banner superior Rojo Terracota con Trofeo y Balones en líneas blancas */}
      <View style={styles.topBanner}>
        <Ionicons name="trophy-outline" size={44} color="#FFFFFF" />

        <View style={styles.ballsRow}>
          {/* Balón de Básquetbol */}
          <Svg
            width={38}
            height={38}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Circle cx="12" cy="12" r="10" />
            <Path d="M2.5 12h19" />
            <Path d="M12 2v20" />
            <Path d="M4.9 4.9c4.2 3.8 4.2 10.4 0 14.2" />
            <Path d="M19.1 4.9c-4.2 3.8-4.2 10.4 0 14.2" />
          </Svg>

          {/* Balón de Fútbol */}
          <Svg
            width={38}
            height={38}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Circle cx="12" cy="12" r="10" />
            <Polygon points="12 7.5 16.2 10.6 14.6 15.5 9.4 15.5 7.8 10.6" />
            <Path d="M12 2v5.5" />
            <Path d="M16.2 10.6l5-2.1" />
            <Path d="M14.6 15.5l3.2 4.3" />
            <Path d="M9.4 15.5l-3.2 4.3" />
            <Path d="M7.8 10.6l-5-2.1" />
          </Svg>
        </View>

        <Text style={styles.bannerTitle}>
          Coordinación{'\n'}Deportiva
        </Text>
        <Text style={styles.bannerSub}>
          Gestión de material y espacios{'\n'}deportivos.
        </Text>
      </View>

      {/* Tarjeta blanca del formulario */}
      <View style={styles.bottomArea}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSub}>
            Ingresa tus datos para{'\n'}acceder al sistema
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="alumno@equipo-b2.utr"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Contraseña</Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.mutedSmall}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Recuperar contraseña',
                'Solicita el restablecimiento de tu contraseña con Coordinación Deportiva.'
              )
            }
          >
            <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillBtn, loading && { backgroundColor: COLORS.muted }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.pillBtnText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerBtn}
          >
            <Text style={styles.registerLink}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerBold}>Regístrate</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  topBanner: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ballsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    marginBottom: 10,
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
    opacity: 0.92,
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
  errorText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  mutedSmall: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
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
    backgroundColor: '#FFFFFF',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 40,
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
  registerBtn: {
    marginTop: 20,
  },
  registerLink: {
    color: COLORS.info,
    textAlign: 'center',
    fontSize: 13,
  },
  registerBold: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});