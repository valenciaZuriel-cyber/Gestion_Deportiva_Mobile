import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import MobileHeader from '../components/MobileHeader';
// import apiFetch from '../api/apiFetch'; // <-- DESCOMENTAR AL CONECTAR API
import { COLORS } from '../styles/theme';

export default function MyLoansScreen({ navigation, loans, setLoans }) {
  const handleUnauthorized = () => {
    navigation.replace('Login');
  };

  /* =========================================================================
     CÓDIGO REAL PARA CARGAR PRÉSTAMOS DE LA API (DESCOMENTAR ESTE BLOQUE):
     =========================================================================
  useEffect(() => {
    apiFetch
      .get('/sports/loans', handleUnauthorized)
      .then((data) => {
        if (Array.isArray(data) && typeof setLoans === 'function') {
          const normalizados = data.map((ln) => ({
            id: ln.loanId ?? ln.id,
            itemNombre: ln.item?.nombre || ln.item || ln.itemNombre || 'Material deportivo',
            cantidad: ln.cantidad ?? 1,
            canchaOActividad: ln.canchaOActividad || 'Cancha universitaria',
            fechaSalida: ln.horaSalida || ln.fechaSalida || '',
            estatus: ln.estatus || 'ACTIVO',
          }));
          setLoans(normalizados);
        }
      })
      .catch((err) => Alert.alert('Error', err.message || 'No se pudieron cargar los préstamos.'));
  }, []);
  ========================================================================= */

  return (
    <View style={styles.container}>
      <MobileHeader navigation={navigation} />

      <View style={styles.body}>
        <Text style={styles.title}>Mis Solicitudes</Text>

        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes préstamos registrados aún.</Text>
          }
          renderItem={({ item }) => {
            const isActivo = item.estatus === 'ACTIVO';
            return (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{item.itemNombre}</Text>
                  <View style={[styles.badge, { backgroundColor: isActivo ? COLORS.info : COLORS.success }]}>
                    <Text style={styles.badgeText}>{item.estatus}</Text>
                  </View>
                </View>

                <Text style={styles.detail}>
                  Cantidad: <Text style={{ fontWeight: '700' }}>{item.cantidad}</Text> • {item.canchaOActividad}
                </Text>
                <Text style={styles.date}>Hora de salida: {item.fechaSalida}</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    marginTop: 24,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  detail: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.muted,
  },
});