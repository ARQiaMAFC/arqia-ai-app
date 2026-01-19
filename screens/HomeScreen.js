/**
 * Home Screen - Image Upload
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Svg, { Rect, Path, Line } from 'react-native-svg';

import { useApp } from '../context/AppContext';
import { colors, typography } from '../theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { setSelectedImage, config } = useApp();

  const handleImagePick = useCallback(async (useCamera = false) => {
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true,
    };

    try {
      const result = useCamera 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel) return;
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'No se pudo acceder a la imagen');
        return;
      }

      if (result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: asset.base64,
          width: asset.width,
          height: asset.height,
        });
        navigation.navigate('Style');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
      console.error(error);
    }
  }, [setSelectedImage, navigation]);

  const showImageOptions = useCallback(() => {
    Alert.alert(
      'Seleccionar imagen',
      '¿De dónde quieres obtener la foto?',
      [
        { text: 'Cámara', onPress: () => handleImagePick(true) },
        { text: 'Galería', onPress: () => handleImagePick(false) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }, [handleImagePick]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundMesh} />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Svg viewBox="0 0 60 60" width={70} height={70}>
              <Rect x="5" y="20" width="50" height="35" fill="none" stroke={colors.gold} strokeWidth="1.5" />
              <Path d="M5 20 L30 5 L55 20" fill="none" stroke={colors.gold} strokeWidth="1.5" />
              <Rect x="22" y="35" width="16" height="20" fill="none" stroke={colors.gold} strokeWidth="1.5" />
              <Rect x="10" y="28" width="8" height="8" fill="none" stroke={colors.gold} strokeWidth="1" />
              <Rect x="42" y="28" width="8" height="8" fill="none" stroke={colors.gold} strokeWidth="1" />
            </Svg>
          </View>
          <Text style={styles.logoText}>{config.appName}</Text>
          <Text style={styles.tagline}>{config.tagline}</Text>
        </View>

        {/* Upload Area */}
        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={showImageOptions}
          activeOpacity={0.8}
        >
          <View style={styles.uploadIcon}>
            <Svg viewBox="0 0 24 24" width={48} height={48}>
              <Path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                fill="none"
                stroke={colors.textSecondary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M17 8l-5-5-5 5"
                fill="none"
                stroke={colors.textSecondary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="12" y1="3" x2="12" y2="15"
                stroke={colors.textSecondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text style={styles.uploadText}>Sube una foto de tu espacio</Text>
          <Text style={styles.uploadHint}>JPG, PNG • Máx 10MB</Text>
        </TouchableOpacity>

        {/* Feature Pills */}
        <View style={styles.featurePills}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>8K Fotorrealista</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>IA Premium</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>4 Estilos</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Powered by Stable Diffusion XL</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  backgroundMesh: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  
  logoIcon: {
    marginBottom: 16,
  },
  
  logoText: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
  
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    marginBottom: 28,
  },
  
  uploadIcon: {
    marginBottom: 16,
  },
  
  uploadText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  
  uploadHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  
  featurePills: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 'auto',
  },
  
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.pillBackground,
    borderWidth: 1,
    borderColor: colors.pillBorder,
  },
  
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
});
