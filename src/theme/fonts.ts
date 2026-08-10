import {
  useFonts,
  Orbitron_600SemiBold,
  Orbitron_700Bold,
  Orbitron_800ExtraBold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import {
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';

export const fonts = {
  orbitron600: 'Orbitron_600SemiBold',
  orbitron700: 'Orbitron_700Bold',
  orbitron800: 'Orbitron_800ExtraBold',
  orbitron900: 'Orbitron_900Black',
  rajdhani400: 'Rajdhani_400Regular',
  rajdhani500: 'Rajdhani_500Medium',
  rajdhani600: 'Rajdhani_600SemiBold',
  rajdhani700: 'Rajdhani_700Bold',
};

export function useAppFonts() {
  return useFonts({
    Orbitron_600SemiBold,
    Orbitron_700Bold,
    Orbitron_800ExtraBold,
    Orbitron_900Black,
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });
}
