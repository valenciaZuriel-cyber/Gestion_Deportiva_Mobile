import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import apiFetch from "../api/apiFetch";
import { COLORS } from "../styles/theme";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !nombre.trim() ||
      !matricula.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return Alert.alert(
        "Campos incompletos",
        "Completa todos los campos para registrarte.",
      );
    }

    setLoading(true);
    try {
      await apiFetch.post("/api/auth/register", {
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta de estudiante fue creada. Ya puedes iniciar sesión.",
        [{ text: "Ir a Login", onPress: () => navigation.replace("Login") }],
      );
    } catch (error) {
      Alert.alert("Error en registro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Registro de estudiante (USER)</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Ana López"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 22300123"
          value={matricula}
          onChangeText={setMatricula}
        />

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="alumno@utr.edu.mx"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[
            styles.btnPrimary,
            loading && { backgroundColor: COLORS.muted },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    padding: 20,
  },
  card: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 22 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D1D1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  linkBtn: { marginTop: 16, alignItems: "center" },
  linkText: { color: COLORS.text, fontWeight: "600", fontSize: 13 },
});
