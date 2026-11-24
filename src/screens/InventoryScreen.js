import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import MobileHeader from '../components/MobileHeader';
import { INITIAL_ITEMS } from '../api/mockData';
// import apiFetch from '../api/apiFetch'; // <-- DESCOMENTAR AL CONECTAR API
import { COLORS } from '../styles/theme';

const DEPORTES = ['Todo', 'Fútbol', 'Básquetbol', 'Voleibol'];

const getBadgeColor = (estado) => {
  if (estado === 'NUEVO') return COLORS.success;
  if (estado === 'BUENO') return COLORS.info;
  return COLORS.warning;
};

export default function InventoryScreen({ navigation, loans, setLoans }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [deporte, setDeporte] = useState('Todo');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [canchaOActividad, setCanchaOActividad] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUnauthorized = () => {
    navigation.replace('Login');
  };

  /* =========================================================================
     CÓDIGO REAL PARA CARGAR INVENTARIO DE LA API (DESCOMENTAR ESTE BLOQUE):
     =========================================================================
  const cargarItemsReales = async () => {
    try {
      const data = await apiFetch.get('/sports/items', handleUnauthorized);
      if (Array.isArray(data)) {
        const normalizados = data.map((it) => ({
          id: it.id,
          codigo: it.codigo,
          nombre: it.nombre,
          deporte: it.deporte,
          estadoFisico: it.estadoFisico || it.estado_fisico || 'BUENO',
          cantidadTotal: it.cantidadTotal ?? it.disponibles ?? 0,
          cantidadDisponible: it.disponibles ?? it.cantidadDisponible ?? 0,
        }));
        setItems(normalizados);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo cargar el inventario.');
    }
  };

  useEffect(() => {
    cargarItemsReales();
  }, []);
  ========================================================================= */

  const filteredItems = items.filter((it) => {
    const matchDep = deporte === 'Todo' || it.deporte === deporte;
    const matchDisp = !soloDisponibles || it.cantidadDisponible > 0;
    const matchSearch =
      it.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      it.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchDep && matchDisp && matchSearch;
  });

  const openModal = (item) => {
    setSelectedItem(item);
    setCantidad(1);
    setCanchaOActividad('');
  };

  const handleConfirmLoan = async () => {
    if (!selectedItem) return;
    if (!canchaOActividad.trim()) {
      return Alert.alert('Campo requerido', 'Indica la cancha o actividad.');
    }
    if (cantidad < 1 || cantidad > selectedItem.cantidadDisponible) {
      return Alert.alert('Cantidad inválida', 'La cantidad no puede exceder los disponibles.');
    }

    setSubmitting(true);

    /* =========================================================================
       CÓDIGO REAL PARA ENVIAR PRÉSTAMO A LA API (DESCOMENTAR ESTE BLOQUE):
       =========================================================================
    try {
      const res = await apiFetch.post(
        '/sports/loans',
        {
          itemId: selectedItem.id,
          cantidad: Number(cantidad),
          canchaOActividad: canchaOActividad.trim(),
        },
        handleUnauthorized
      );
      await cargarItemsReales();
      setLoans([
        {
          id: res?.loanId || Date.now(),
          itemId: selectedItem.id,
          itemNombre: selectedItem.nombre,
          cantidad: Number(cantidad),
          canchaOActividad: canchaOActividad.trim(),
          fechaSalida: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          estatus: res?.estatus || 'ACTIVO',
        },
        ...loans,
      ]);
      setSelectedItem(null);
      Alert.alert('Solicitud enviada', 'Tu préstamo deportivo quedó registrado.');
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo solicitar el préstamo.');
    } finally {
      setSubmitting(false);
    }
    return;
    ========================================================================= */

    // SIMULACIÓN TEMPORAL SIN BACKEND
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? { ...it, cantidadDisponible: it.cantidadDisponible - cantidad }
          : it
      )
    );

    const newLoan = {
      id: Date.now(),
      itemId: selectedItem.id,
      itemNombre: selectedItem.nombre,
      cantidad,
      canchaOActividad: canchaOActividad.trim(),
      fechaSalida: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estatus: 'ACTIVO',
    };
    setLoans([newLoan, ...loans]);
    setSubmitting(false);
    setSelectedItem(null);
    Alert.alert('Préstamo solicitado', 'Se registró en Mis solicitudes.');
  };

  return (
    <View style={styles.container}>
      <MobileHeader navigation={navigation} />

      <View style={styles.body}>
        <Text style={styles.pageTitle}>Inventario de Material</Text>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar artículo o código..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <Search size={18} color={COLORS.muted} />
        </View>

        <View style={styles.chipsRow}>
          {DEPORTES.map((dep) => {
            const active = deporte === dep;
            return (
              <TouchableOpacity
                key={dep}
                style={[styles.chip, active && { backgroundColor: COLORS.primary }]}
                onPress={() => setDeporte(dep)}
              >
                <Text style={[styles.chipText, active && { color: '#FFFFFF' }]}>{dep}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setSoloDisponibles(!soloDisponibles)}
        >
          <View style={[styles.checkbox, soloDisponibles && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} />
          <Text style={styles.filterToggleText}>Solo disponibles</Text>
        </TouchableOpacity>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const agotado = item.cantidadDisponible <= 0;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.nombre}</Text>
                    <Text style={styles.itemCode}>Código: {item.codigo} • {item.deporte}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getBadgeColor(item.estadoFisico) }]}>
                    <Text style={styles.badgeText}>{item.estadoFisico}</Text>
                  </View>
                </View>

                <Text style={styles.stockText}>
                  Disponibles: <Text style={{ fontWeight: '700' }}>{item.cantidadDisponible}</Text>
                </Text>

                <TouchableOpacity
                  style={[styles.requestBtn, agotado && styles.disabledBtn]}
                  disabled={agotado}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.requestBtnText}>
                    {agotado ? 'Agotado' : 'Solicitar préstamo'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {/* Bottom Sheet / Modal de Solicitud (Pantalla B2) */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar Préstamo</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <X size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>
                  {selectedItem.nombre} ({selectedItem.codigo})
                </Text>
                <Text style={styles.modalAvailable}>
                  Máximo disponible: {selectedItem.cantidadDisponible}
                </Text>

                <Text style={styles.label}>Cantidad</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setCantidad((c) => Math.max(1, c - 1))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="number-pad"
                    value={String(cantidad)}
                    onChangeText={(txt) => {
                      const num = parseInt(txt, 10);
                      if (Number.isNaN(num)) {
                        setCantidad(1);
                      } else {
                        setCantidad(Math.min(selectedItem.cantidadDisponible, Math.max(1, num)));
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() =>
                      setCantidad((c) => Math.min(selectedItem.cantidadDisponible, c + 1))
                    }
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Cancha o Actividad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Cancha 2 - Torneo"
                  value={canchaOActividad}
                  onChangeText={setCanchaOActividad}
                />

                <TouchableOpacity
                  style={[styles.confirmBtn, submitting && styles.disabledBtn]}
                  disabled={submitting}
                  onPress={handleConfirmLoan}
                >
                  <Text style={styles.confirmBtnText}>
                    {submitting ? 'Enviando...' : 'Confirmar Préstamo'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    paddingTop: 14,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  searchBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
  },
  filterToggleText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemCode: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
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
  stockText: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 10,
  },
  requestBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledBtn: {
    backgroundColor: COLORS.muted,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(60, 55, 55, 0.5)',
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalAvailable: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  qtyInput: {
    width: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
});