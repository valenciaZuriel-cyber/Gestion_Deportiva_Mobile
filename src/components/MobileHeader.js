import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/theme';

export default function MobileHeader({ title = 'Gestión Deportiva', navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('sesion_deportes');
    } catch (e) {
      console.error(e);
    }
    if (navigation?.replace) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.text,
    paddingTop: 46,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  logoutBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});