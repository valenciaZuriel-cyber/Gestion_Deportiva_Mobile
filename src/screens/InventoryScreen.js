import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MobileHeader from '../components/MobileHeader';
import { COLORS } from '../styles/theme';
import apiFetch from '../api/apiFetch';

const DEPORTES = ['Todo', 'Fútbol', 'Básquetbol', 'Voleibol', 'Otros'];
const DEPORTES_PRINCIPALES = ['fútbol', 'futbol', 'básquetbol', 'basquetbol', 'voleibol'];

function normalizarTexto(texto) {
  return String(texto || '').trim().toLowerCase();
}

function normalizarItem(raw, index) {
  const disponible = Number(
    raw?.cantidadDisponible ?? raw?.disponibles ?? raw?.stockDisponible ?? raw?.cantidad ?? 0
  );
  const total = Number(
    raw?.cantidadTotal ?? raw?.total ?? raw?.stockTotal ?? Math.max(disponible, 0)
  );
  const estado = String(
    raw?.estadoFisico ?? raw?.estado_fisico ?? raw?.estado ?? 'BUENO'
  ).toUpperCase();

  return {
    id: raw?.id ?? raw?._id ?? index + 1,
    codigo: raw?.codigo ?? raw?.sku ?? `MAT-${index + 1}`,
    nombre: raw?.nombre ?? raw?.name ?? raw?.titulo ?? 'Artículo deportivo',
    deporte: raw?.deporte ?? raw?.disciplina ?? raw?.categoria ?? 'Otros',
    estadoFisico: estado,
    cantidadDisponible: disponible,
    cantidadTotal: total,
  };
}

export default function InventoryScreen({ navigation, onLoanCreated }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deporte, setDeporte] = useState('Todo');
  const [search, setSearch] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cancha, setCancha] = useState('');

  const irALogin = useCallback(() => {
    if (navigation?.replace) {
      navigation.replace('Login');
    }
  }, [navigation]);

  const cargarInventario = useCallback(
    async (esRefresco = false) => {
      if (esRefresco) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await apiFetch.get('/api/sports/items', irALogin);
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setItems(lista.map(normalizarItem));
      } catch (error) {
        Alert.alert('Error', error.message || 'No se pudo cargar el inventario.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [irALogin]
  );

  useEffect(() => {
    cargarInventario(false);
  }, [cargarInventario]);

  const filteredItems = items.filter((item) => {
    const depItem = normalizarTexto(item.deporte);
    const depFiltro = normalizarTexto(deporte);

    let matchDeporte = true;
    if (depFiltro === 'otros') {
      matchDeporte =
        depItem === 'otros' ||
        depItem === 'otro' ||
        !DEPORTES_PRINCIPALES.some((p) => depItem.includes(p));
    } else if (depFiltro !== 'todo' && depFiltro !== 'todos') {
      matchDeporte = depItem.includes(depFiltro);
    }

    const matchDisp = !soloDisponibles || item.cantidadDisponible > 0;
    const matchSearch =
      normalizarTexto(item.nombre).includes(normalizarTexto(search)) ||
      normalizarTexto(item.codigo).includes(normalizarTexto(search));

    return matchDeporte && matchDisp && matchSearch;
  });

  const getBadgeColor = (estado) => {
    if (estado === 'NUEVO') return COLORS.success;
    if (estado === 'BUENO') return COLORS.info;
    return COLORS.warning;
  };

  const confirmLoan = async () => {
    if (!selectedItem) return;
    if (!cancha.trim()) {
      return Alert.alert('Dato requerido', 'Escribe la cancha o actividad.');
    }
    if (cantidad < 1 || cantidad > selectedItem.cantidadDisponible) {
      return Alert.alert('Cantidad inválida', 'Revisa el stock disponible.');
    }

    setSubmitting(true);
    try {
      await apiFetch.post(
        '/api/sports/loans',
        {
          itemId: selectedItem.id,
          cantidad: Number(cantidad),
          canchaOActividad: cancha.trim(),
        },
        irALogin
      );

      await cargarInventario(false);
      if (typeof onLoanCreated === 'function') {
        onLoanCreated();
      }

      setSelectedItem(null);
      setCancha('');
      setCantidad(1);
      Alert.alert('¡Listo!', 'Tu solicitud de préstamo ha sido registrada.');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo registrar el préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <MobileHeader title="Material Deportivo" navigation={navigation} />

      <View style={styles.body}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o código..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons name="search" size={18} color={COLORS.muted} />
        </View>

        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {DEPORTES.map((dep) => {
              const active = deporte === dep;
              return (
                <TouchableOpacity
                  key={dep}
                  style={[
                    styles.chip,
                    active && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                  ]}
                  onPress={() => setDeporte(dep)}
                >
                  <Text style={[styles.chipText, active && { color: '#FFFFFF' }]}>{dep}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => setSoloDisponibles(!soloDisponibles)}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, soloDisponibles && { backgroundColor: COLORS.info, borderColor: COLORS.info }]}>
            {soloDisponibles && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkLabel}>Mostrar solo disponibles</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => cargarInventario(true)}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay artículos que coincidan con el filtro.</Text>
            }
            renderItem={({ item }) => {
              const agotado = item.cantidadDisponible <= 0;
              return (
                <View style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemCode}>{item.codigo}</Text>
                    <View style={[styles.badge, { backgroundColor: getBadgeColor(item.estadoFisico) }]}>
                      <Text style={styles.badgeText}>{item.estadoFisico}</Text>
                    </View>
                  </View>

                  <Text style={styles.itemName}>{item.nombre}</Text>
                  <Text style={styles.itemSport}>{item.deporte}</Text>
                  <Text style={styles.stockText}>
                    {item.cantidadDisponible} / {item.cantidadTotal} disponibles
                  </Text>

                  <TouchableOpacity
                    disabled={agotado}
                    style={[styles.btnRequest, agotado && { backgroundColor: COLORS.muted }]}
                    onPress={() => {
                      setSelectedItem(item);
                      setCantidad(1);
                    }}
                  >
                    <Text style={styles.btnRequestText}>
                      {agotado ? 'Agotado' : 'Solicitar préstamo'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>

      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {selectedItem?.nombre}
              </Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.availPill}>
              <Text style={styles.availPillText}>
                {selectedItem?.cantidadDisponible ?? 0} Disponibles
              </Text>
            </View>

            <Text style={styles.sheetLabel}>Cantidad</Text>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.stepTouch}
                onPress={() => setCantidad(Math.max(1, cantidad - 1))}
              >
                <Text style={styles.stepSymbol}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{cantidad}</Text>
              <TouchableOpacity
                style={styles.stepTouch}
                onPress={() =>
                  setCantidad(Math.min(selectedItem?.cantidadDisponible || 1, cantidad + 1))
                }
              >
                <Text style={styles.stepSymbol}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetLabel}>Cancha o Actividad</Text>
            <TextInput
              style={styles.sheetInput}
              placeholder="Ej. Cancha 2 - Torneo"
              placeholderTextColor={COLORS.muted}
              value={cancha}
              onChangeText={setCancha}
            />

            <View style={styles.sheetActions}>
              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                style={styles.cancelBtn}
                disabled={submitting}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, submitting && { backgroundColor: COLORS.muted }]}
                onPress={confirmLoan}
                disabled={submitting}
              >
                <Text style={styles.confirmBtnText}>
                  {submitting ? 'Enviando...' : 'Confirmar Préstamo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
  },
  chipsWrapper: {
    height: 40,
    marginBottom: 10,
  },
  chipsContent: {
    alignItems: 'center',
    paddingRight: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
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
    alignItems: 'center',
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
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
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  itemSport: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 12,
  },
  btnRequest: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnRequestText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 54,
    height: 4,
    backgroundColor: '#BDBDBD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    padding: 4,
  },
  availPill: {
    backgroundColor: COLORS.info,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  availPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  stepTouch: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  stepSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 10,
    color: COLORS.text,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  confirmBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
});