import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Button } from '../components/Button';
import { MonoIcon } from '../components/MonoIcon';
import { useClientsViewModel } from '../presentation/viewmodels/useClientsViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const ClientsScreen = ({ navigation }) => {
  const { clients, isLoading, search, setSearch, refresh, errorMessage } = useClientsViewModel();

  const ClientItem = ({ client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => navigation.navigate('ClientDetails', { id: client.id })}
    >
      <View style={styles.clientHeader}>
        <View>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientPhone}>{client.phone}</Text>
        </View>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => {/* Abrir WhatsApp ou enviar mensagem */}}
        >
          <MonoIcon name="message-outline" size={18} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>
      {client.email && (
        <Text style={styles.clientEmail}>{client.email}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroBadge}>Carteira de clientes</Text>
        <Text style={styles.heroTitle}>Clientes</Text>
        <Text style={styles.heroSubtitle}>Consulte, adicione e acompanhe sua base com um visual mais refinado.</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
        />
      </View>

      <Button
        title="Adicionar Cliente"
        iconName="account-plus-outline"
        onPress={() => navigation.navigate('NewClient')}
        style={styles.addBtn}
      />

      {!!errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={({ item }) => <ClientItem client={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND
  },
  hero: {
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.MD,
    marginBottom: SPACING.MD,
    backgroundColor: '#FFFDFC',
    borderRadius: 26,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1ED',
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    marginBottom: SPACING.SM
  },
  heroTitle: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22
  },
  searchContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.SURFACE
  },
  addBtn: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD
  },
  errorContainer: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: 14,
    backgroundColor: '#FFF1ED',
    borderWidth: 1,
    borderColor: '#F4D8D2'
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG
  },
  clientCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM
  },
  clientName: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY
  },
  clientPhone: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS
  },
  clientEmail: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY
  },
  messageBtn: {
    padding: SPACING.SM,
    borderRadius: 999,
    backgroundColor: '#FFF1ED'
  },
  messageBtnText: {
    fontSize: FONT_SIZES.LG
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XL
  },
  emptyText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY
  }
});
