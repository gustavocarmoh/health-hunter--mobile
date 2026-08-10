import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import PrimaryButton from '../ui/PrimaryButton';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import authApi from '../api/auth';
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

  const submit = async () => {
    if (!NAME_RE.test(name)) {
      showToast('Hunter Name: 3–30 caracteres, letras/números/underscore.', 'error');
      return;
    }
    if (!email.includes('@')) {
      showToast('Informe um email válido.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
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
