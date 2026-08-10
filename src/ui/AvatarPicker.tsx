import React from 'react';
import { Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PressableScale from './PressableScale';
import { RajdhaniText } from './Typography';
import { useTheme } from '../theme/ThemeContext';

interface AvatarPickerProps {
  uri: string | null;
  onChange: (uri: string | null) => void;
  size?: number;
}

/** Native equivalent of the prototype's draggable <image-slot> — tap to pick a profile photo. */
export default function AvatarPicker({ uri, onChange, size = 72 }: AvatarPickerProps) {
  const { colors } = useTheme();

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <PressableScale
      onPress={pick}
      scaleTo={0.95}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: '#FBBF24',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg1,
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>foto</RajdhaniText>
        </View>
      )}
    </PressableScale>
  );
}
