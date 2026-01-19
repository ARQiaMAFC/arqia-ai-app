/**
 * Result Screen - View & Share Generated Image
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Share,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

import { useApp, CONFIG } from '../context/AppContext';
import { colors } from '../theme';

export default function ResultScreen({ navigation }) {
  const { selectedImage, generatedImage, selectedStyle, reset } = useApp();
  const [showOriginal, setShowOriginal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const styleConfig = CONFIG.styles[selectedStyle];

  const handleBack = useCallback(() => {
    reset();
    navigation.popToTop();
  }, [reset, navigation]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      // Request permission on Android
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'No se puede guardar sin permiso de almacenamiento');
          setSaving(false);
          return;
        }
      }

      // If generatedImage is a URL, download first
      let localPath = generatedImage;
      
      if (generatedImage.startsWith('http')) {
        const filename = `arqia_${Date.now()}.jpg`;
        const downloadPath = `${RNFS.CachesDirectoryPath}/${filename}`;
        
        await RNFS.downloadFile({
          fromUrl: generatedImage,
          toFile: downloadPath,
        }).promise;
        
        localPath = downloadPath;
      }

      await CameraRoll.save(localPath, { type: 'photo' });
      Alert.alert('¡Guardado!', 'La imagen se guardó en tu galería');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'No se pudo guardar la imagen');
    } finally {
      setSaving(false);
    }
  }, [generatedImage, saving]);

  const handleShare = useCallback(async () => {
    try {
      const message = `¡Mira mi espacio rediseñado con estilo ${styleConfig?.name}! 🏠✨ Creado con Arqia.MAFC`;
      
      await Share.share({
        message,
        url: generatedImage, // iOS only
        title: 'Mi rediseño Arqia',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [generatedImage, styleConfig]);

  const handleNewDesign = useCallback(() => {
    reset();
    navigation.popToTop();
  }, [reset, navigation]);

  const displayImage = showOriginal ? selectedImage?.uri : generatedImage;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Svg viewBox="0 0 24 24" width={24} height={24}>
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              fill="none"
              stroke={colors.text}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{styleConfig?.name}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Result Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: displayImage }}
          style={styles.resultImage}
          resizeMode="cover"
        />

        {/* Style Badge */}
        <View style={styles.styleBadge}>
          <Text style={styles.styleBadgeIcon}>{styleConfig?.icon}</Text>
          <Text style={styles.styleBadgeText}>{styleConfig?.name}</Text>
        </View>

        {/* Before/After Toggle */}
        <View style={styles.compareToggle}>
          <TouchableOpacity
            onPress={() => setShowOriginal(false)}
            style={[
              styles.compareButton,
              !showOriginal && styles.compareButtonActive
            ]}
          >
            <Text style={[
              styles.compareButtonText,
              !showOriginal && styles.compareButtonTextActive
            ]}>
              Después
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowOriginal(true)}
            style={[
              styles.compareButton,
              showOriginal && styles.compareButtonActive
            ]}
          >
            <Text style={[
              styles.compareButtonText,
              showOriginal && styles.compareButtonTextActive
            ]}>
              Antes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <Svg viewBox="0 0 24 24" width={24} height={24}>
            <Path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              fill="none"
              stroke={colors.text}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.actionButtonText}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Svg viewBox="0 0 24 24" width={24} height={24}>
            <Circle cx="18" cy="5" r="3" fill="none" stroke={colors.text} strokeWidth="1.5" />
            <Circle cx="6" cy="12" r="3" fill="none" stroke={colors.text} strokeWidth="1.5" />
            <Circle cx="18" cy="19" r="3" fill="none" stroke={colors.text} strokeWidth="1.5" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={colors.text} strokeWidth="1.5" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={colors.text} strokeWidth="1.5" />
          </Svg>
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleNewDesign}>
          <Svg viewBox="0 0 24 24" width={24} height={24}>
            <Polyline 
              points="1,4 1,10 7,10" 
              fill="none" 
              stroke={colors.text} 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3.51 15a9 9 0 102.13-9.36L1 10"
              fill="none"
              stroke={colors.text}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.actionButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Prompt Details */}
      <TouchableOpacity style={styles.promptBox}>
        <Text style={styles.promptLabel}>📋 Prompt técnico usado</Text>
        <Text style={styles.promptText} numberOfLines={2}>
          {styleConfig?.prompt}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  
  imageContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  
  resultImage: {
    width: '100%',
    height: '100%',
  },
  
  styleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  styleBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  
  styleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  
  compareToggle: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  compareButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  
  compareButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  
  compareButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  
  compareButtonTextActive: {
    color: colors.background,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  
  promptBox: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  promptLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  
  promptText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
