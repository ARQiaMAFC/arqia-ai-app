/**
 * Style Selection Screen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { useApp, CONFIG } from '../context/AppContext';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

export default function StyleScreen({ navigation }) {
  const { selectedImage, selectedStyle, setSelectedStyle, config } = useApp();

  const handleConfirm = useCallback(() => {
    if (selectedStyle) {
      navigation.navigate('Processing');
    }
  }, [selectedStyle, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.headerTitle}>Elige un estilo</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Image Preview */}
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: selectedImage?.uri }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Style Grid */}
        <View style={styles.styleGrid}>
          {Object.entries(CONFIG.styles).map(([key, style]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedStyle(key)}
              activeOpacity={0.85}
              style={[
                styles.styleCardWrapper,
                selectedStyle === key && styles.styleCardSelected
              ]}
            >
              <LinearGradient
                colors={style.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.styleCard}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text style={styles.styleName}>{style.name}</Text>
                
                {selectedStyle === key && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Style Description */}
        {selectedStyle && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {CONFIG.styles[selectedStyle].prompt.split(',').slice(0, 3).join(', ')}...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!selectedStyle}
          activeOpacity={0.9}
          style={[
            styles.generateButton,
            !selectedStyle && styles.generateButtonDisabled
          ]}
        >
          <LinearGradient
            colors={selectedStyle ? [colors.gold, colors.goldDark] : ['#444', '#333']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButtonGradient}
          >
            <Text style={[
              styles.generateButtonText,
              !selectedStyle && styles.generateButtonTextDisabled
            ]}>
              Generar Rediseño
            </Text>
            <Svg viewBox="0 0 24 24" width={20} height={20} style={{ marginLeft: 8 }}>
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                fill="none"
                stroke={selectedStyle ? colors.background : '#888'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  
  imagePreviewContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    height: 200,
  },
  
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: '50%',
  },
  
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  
  styleCardWrapper: {
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  styleCardSelected: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  styleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  
  styleIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  styleName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  
  descriptionBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
  },
  
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  generateButtonDisabled: {
    opacity: 0.5,
  },
  
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  
  generateButtonTextDisabled: {
    color: '#888',
  },
});
