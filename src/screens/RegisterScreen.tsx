import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import PrimaryButton from '../ui/PrimaryButton';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import authApi from '../api/auth';
import huntersApi from '../api/hunters';
import { getErrorMessage } from '../api/errors';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const NAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setUser, showToast } = useAppState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);

  const showPolicy = async () => {
    try {
      const p = await huntersApi.getPrivacyPolicy();
      const lines = p.data_collected.map((d) => `• ${d.category}: ${d.purpose} (${d.legal_basis})`);
      Alert.alert(`Política de Privacidade v${p.version}`, `${lines.join('\n')}\n\nDPO: ${p.dpo.email}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const submit = async () => {
    if (!NAME_RE.test(name)) {
      showToast('Hunter Name: 3–30 caracteres, letras/números/underscore.', 'error');
      return;
    }
    if (!email.includes('@')) {
      showToast('Informe um email válido.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('A senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }
    if (!accepted) {
      showToast('Aceite os Termos de Uso e a Política de Privacidade para continuar.', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ name, email, password, accepted_terms: accepted, consent_health_data: healthConsent, consent_ai_mentor: aiConsent });
      const userMe = await authApi.getMe();
      setUser({
        name: userMe.name,
        rank: (userMe.rank_level as any) || 'E',
        xp: userMe.xp,
      });
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  const inputStyle = {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg1,
    color: colors.text,
    fontSize: 15,
    fontFamily: 'Rajdhani_400Regular',
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={true}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, paddingTop: insets.top + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <OrbitronText weight="800" style={{ fontSize: 26, color: '#00F5FF', letterSpacing: 2 }}>AWAKEN</OrbitronText>
            <RajdhaniText style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>Create your hunter account</RajdhaniText>
          </View>
          <View style={{ gap: 6, width: '100%', maxWidth: 300 }}>
          <TextInput
            placeholder="Hunter Name — ex.: shadow_monarch_br"
            placeholderTextColor={colors.dim}
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
            style={inputStyle}
          />
          <RajdhaniText style={{ fontSize: 11, color: colors.dim, paddingHorizontal: 2, paddingBottom: 8 }}>
            Esse nome aparece no ranking e representa sua identidade de Hunter.
          </RajdhaniText>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.dim}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={inputStyle}
          />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.dim}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[inputStyle, { marginTop: 8 }]}
            />
            <Pressable
              onPress={() => setAccepted((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}
            >
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: accepted ? '#00F5FF' : colors.border, backgroundColor: accepted ? '#00F5FF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {accepted ? <Text style={{ color: '#05050F', fontSize: 13, fontWeight: '700' }}>✓</Text> : null}
              </View>
              <RajdhaniText style={{ flex: 1, fontSize: 12, color: colors.muted }}>
                Li e aceito os Termos de Uso e a{' '}
                <RajdhaniText style={{ fontSize: 12, color: '#A78BFA' }} onPress={showPolicy}>
                  Política de Privacidade
                </RajdhaniText>
                , incluindo o tratamento de dados de saúde.
              </RajdhaniText>
            </Pressable>
            {([
              { label: 'Opcional: autorizo o registro de medidas corporais (dado de saúde).', value: healthConsent, set: setHealthConsent },
              { label: 'Opcional: autorizo conversar com o Mentor de IA (mensagens enviadas ao Google Gemini).', value: aiConsent, set: setAiConsent },
            ] as const).map((c) => (
              <Pressable
                key={c.label}
                onPress={() => c.set((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: c.value }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: c.value ? '#00F5FF' : colors.border, backgroundColor: c.value ? '#00F5FF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {c.value ? <Text style={{ color: '#05050F', fontSize: 13, fontWeight: '700' }}>✓</Text> : null}
                </View>
                <RajdhaniText style={{ flex: 1, fontSize: 12, color: colors.muted }}>{c.label}</RajdhaniText>
              </Pressable>
            ))}
            <PrimaryButton label={loading ? '...' : 'BECOME A HUNTER'} bg="#00F5FF" color="#05050F" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
          </View>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
            Already a hunter?{' '}
            <RajdhaniText style={{ fontSize: 13, color: '#A78BFA' }} onPress={() => navigation.navigate('Login')}>
              Login
            </RajdhaniText>
          </RajdhaniText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
