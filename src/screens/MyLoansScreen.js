import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MobileHeader from '../components/MobileHeader';
import { COLORS } from '../styles/theme';
import apiFetch from '../api/apiFetch';

function extraerNombreArticulo(loan) {
  if (!loan) return 'Artículo deportivo';
  if (typeof loan.item === 'string' && loan.item.trim()) return loan.item.trim();
  return (
    loan.item?.nombre ||
    loan.item?.name ||
    loan.itemNombre ||
    loan.item_nombre ||
    loan.nombreArticulo ||
    loan.articulo ||
    loan.codigo ||
    'Artículo deportivo'
  );
}

function extraerLugar(loan) {
  return (
    loan?.canchaOActividad ||
    loan?.cancha_o_actividad ||
    loan?.cancha ||
    loan?.actividad ||
    '-'
  );
}

function formatearFechaHora(loan) {
  const rawFecha =
    loan?.horaSalida ||
    loan?.hora_salida ||
    loan?.fechaSalida ||
    loan?.fecha_salida ||
    loan?.createdAt ||
    loan?.created_at;

  if (!rawFecha) return '-';
  const fecha = new Date(rawFecha);
  if (Number.isNaN(fecha.getTime())) return String(rawFecha);

  return fecha.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function MyLoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const irALogin = useCallback(() => {
    if (navigation?.replace) {
      navigation.replace('Login');
    }
  }, [navigation]);

  const cargarPrestamos = useCallback(
    async (esRefresco = false) => {
      if (esRefresco) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await apiFetch.get('/api/sports/loans', irALogin);
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.loans)
            ? data.loans
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setLoans(lista);
      } catch (error) {
        console.error('Error al cargar préstamos:', error.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [irALogin]
  );

  useEffect(() => {
    cargarPrestamos(false);
  }, [cargarPrestamos]);

  return (
    <View style={styles.container}>
      <MobileHeader title="Mis Solicitudes" navigation={navigation} />

      <View style={styles.body}>
        <Text style={styles.title}>Mis Préstamos Deportivos</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={loans}
            keyExtractor={(item, idx) => String(item.loanId ?? item.id ?? item._id ?? idx)}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => cargarPrestamos(true)}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aún no tienes préstamos registrados.</Text>
            }
            renderItem={({ item }) => {
              const estatus = String(item.estatus ?? item.estado ?? 'ACTIVO').toUpperCase();
              const nombre = extraerNombreArticulo(item);
              const lugar = extraerLugar(item);
              const salida = formatearFechaHora(item);
              const badgeBg = estatus === 'FINALIZADO' ? COLORS.success : COLORS.info;

              return (
                <View style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {nombre}
                      {item.codigo ? ` (${item.codigo})` : ''}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={styles.badgeText}>{estatus}</Text>
                    </View>
                  </View>

                  <Text style={styles.detail}>
                    Cantidad: <Text style={styles.bold}>{item.cantidad ?? 1}</Text> • Lugar:{' '}
                    <Text style={styles.bold}>{lugar}</Text>
                  </Text>
                  <Text style={styles.date}>Salida: {salida}</Text>
                </View>
              );
            }}
          />
        )}
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
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
  bold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.muted,
  },
});