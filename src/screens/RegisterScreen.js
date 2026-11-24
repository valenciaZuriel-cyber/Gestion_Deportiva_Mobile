import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
// import apiFetch from '../api/apiFetch'; // <-- DESCOMENTAR AL CONECTAR API
import { COLORS } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ nombre: '', matricula: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (Object.values(form).some((v) => !v.trim())) {
      return Alert.alert('Campos requeridos', 'Completa todos los campos.');
    }
    if (form.password !== form.confirm) {
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    }

    setLoading(true);

    /* =========================================================================
       CÓDIGO REAL PARA CUANDO EL PROFESOR PASE LA API (DESCOMENTAR ESTE BLOQUE):
       =========================================================================
    try {
      await apiFetch.post('/auth/register', {
        nombre: form.nombre,
        matricula: form.matricula,
        email: form.email,
        password: form.password,
        rol: 'USER',
      });
      Alert.alert('Registro exitoso', 'Cuenta creada con rol USER.', [
        { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error al registrar', error.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
    return;
    ========================================================================= */

    // SIMULACIÓN TEMPORAL SIN BACKEND
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Registro exitoso', 'Cuenta creada con rol USER.', [
        { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
      ]);
    }, 400);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 44 }}>
      <View style={styles.card}>
        <Text style={styles.title}>¡REGÍSTRATE!</Text>
        <Text style={styles.subtitle}>Regístrate para acceder al sistema</Text>

        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput style={styles.input} value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />

        <Text style={styles.label}>Matrícula / ID</Text>
        <TextInput style={styles.input} value={form.matricula} onChangeText={(v) => setForm({ ...form, matricula: v })} />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passBox}>
          <TextInput style={[styles.input, { marginBottom: 0, paddingRight: 40 }]} secureTextEntry={!showPass} value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            {showPass ? <EyeOff size={18} color={COLORS.muted} /> : <Eye size={18} color={COLORS.muted} />}
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Confirmar Contraseña</Text>
        <View style={styles.passBox}>
          <TextInput style={[styles.input, { marginBottom: 0, paddingRight: 40 }]} secureTextEntry={!showConfirm} value={form.confirm} onChangeText={(v) => setForm({ ...form, confirm: v })} />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
            {showConfirm ? <EyeOff size={18} color={COLORS.muted} /> : <Eye size={18} color={COLORS.muted} />}
          </TouchableOpacity>
        </View>

        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>Rol por defecto: USER</Text>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 14 }}>
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Inicia Sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    padding: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
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
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  passBox: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
  },
  rolePill: {
    backgroundColor: COLORS.info,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 18,
  },
  rolePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 13,
    alignSelf: 'center',
    width: 200,
    alignItems: 'center',
    marginTop: 14,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  linkText: {
    color: COLORS.info,
    textAlign: 'center',
    fontSize: 13,
  },
});