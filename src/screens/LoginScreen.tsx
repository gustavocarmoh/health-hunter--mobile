import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import PressableScale from '../ui/PressableScale';
import PrimaryButton from '../ui/PrimaryButton';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { EyeIcon, EyeOffIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import authApi from '../api/auth';
import { getErrorMessage } from '../api/errors';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setUser, showToast } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
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
      await authApi.login({ email, password });
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
            <OrbitronText weight="900" style={{ fontSize: 24, color: '#A78BFA', letterSpacing: 2 }}>SOLO LEVELING</OrbitronText>
            <OrbitronText weight="800" style={{ fontSize: 15, color: colors.text, marginTop: 2 }}>LIFESTYLE</OrbitronText>
          </View>
          <View style={{ gap: 14, width: '100%', maxWidth: 300 }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.dim}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={inputStyle}
          />
          <View>
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.dim}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              style={[inputStyle, { paddingRight: 44 }]}
            />
            <PressableScale
              onPress={() => setShowPass((v) => !v)}
              scaleTo={0.85}
              style={{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', padding: 4 }}
            >
              {showPass ? <EyeOffIcon color={colors.dim} /> : <EyeIcon color={colors.dim} />}
            </PressableScale>
          </View>
            <PrimaryButton
              label={loading ? '...' : 'ENTER THE GATES'}
              onPress={submit}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </View>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
            Don't have an account?{' '}
            <RajdhaniText style={{ fontSize: 13, color: '#A78BFA' }} onPress={() => navigation.navigate('Register')}>
              Awaken
            </RajdhaniText>
          </RajdhaniText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
