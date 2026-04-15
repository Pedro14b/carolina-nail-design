import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useCreateClientViewModel } from '../presentation/viewmodels/useCreateClientViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const NewClientScreen = ({ navigation, route }) => {
  const initialClient = route?.params?.client || null;
  const { form, errors, isLoading, isFormValid, isEditing, setField, submit } = useCreateClientViewModel(initialClient);

  const handleCreateClient = async () => {
    const result = await submit();
    if (result.success) {
      Alert.alert('Sucesso', isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!');
      navigation.goBack();
      return;
    }

    Alert.alert('Erro', result.error || (isEditing ? 'Erro ao atualizar cliente' : 'Erro ao adicionar cliente'));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Cadastro rápido</Text>
        <Text style={styles.title}>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
        <Text style={styles.subtitle}>{isEditing ? 'Atualize os dados da cliente com suas preferências e histórico.' : 'Preencha os dados para criar uma ficha elegante e organizada.'}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nome*"
          placeholder="Nome completo"
          value={form.name}
          onChangeText={(value) => setField('name', value)}
          error={errors.name}
          minLength={3}
          required
        />

        <Input
          label="Telefone*"
          placeholder="(XX) XXXXX-XXXX"
          value={form.phone}
          onChangeText={(value) => setField('phone', value)}
          keyboardType="phone-pad"
          error={errors.phone}
          minLength={10}
          required
          format="phone"
        />

        <Input
          label="Email"
          placeholder="email@example.com"
          value={form.email}
          onChangeText={(value) => setField('email', value)}
          keyboardType="email-address"
        />

        <Input
          label="Data de Nascimento"
          placeholder="DD/MM/YYYY"
          value={form.birthDate}
          onChangeText={(value) => setField('birthDate', value)}
          keyboardType="numeric"
          format="date"
        />

        <Input
          label="Endereço"
          placeholder="Rua, número"
          value={form.address}
          onChangeText={(value) => setField('address', value)}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Cidade"
              placeholder="Cidade"
              value={form.city}
              onChangeText={(value) => setField('city', value)}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Estado"
              placeholder="UF"
              value={form.state}
              onChangeText={(value) => setField('state', value)}
              maxLength={2}
            />
          </View>
        </View>

        <Input
          label="CEP"
          placeholder="00000-000"
          value={form.zipCode}
          onChangeText={(value) => setField('zipCode', value)}
          keyboardType="numeric"
        />

        <Input
          label="Observações"
          placeholder="Notas sobre o cliente"
          value={form.notes}
          onChangeText={(value) => setField('notes', value)}
        />

        <Input
          label="Alergias"
          placeholder="Ex.: sensível a acetona"
          value={form.allergies}
          onChangeText={(value) => setField('allergies', value)}
        />

        <Input
          label="Preferências"
          placeholder="Ex.: gosta de formatos curtos"
          value={form.preferences}
          onChangeText={(value) => setField('preferences', value)}
        />

        <Input
          label="Serviços favoritos"
          placeholder="Ex.: alongamento, banho de gel"
          value={form.favoriteServices}
          onChangeText={(value) => setField('favoriteServices', value)}
        />

        <Button
          title={isLoading ? (isEditing ? 'Salvando...' : 'Salvando...') : (isEditing ? 'Atualizar Cliente' : 'Salvar Cliente')}
          iconName="content-save-outline"
          onPress={handleCreateClient}
          disabled={isLoading || !isFormValid}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND
  },
  content: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG
  },
  hero: {
    backgroundColor: '#FFFDFC',
    borderRadius: 26,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: SPACING.LG
  },
  badge: {
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
  header: {
    marginBottom: SPACING.XL
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS
  },
  subtitle: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22
  },
  form: {
    marginBottom: SPACING.XL,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 24,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: '#F1E2DD'
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.MD
  },
  halfField: {
    flex: 1
  },
  submitButton: {
    marginTop: SPACING.SM
  }
});
