/**
 * Processing Screen - AI Generation
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';

import { useApp, CONFIG } from '../context/AppContext';
import { generateRedesign } from '../services/replicateApi';
import { colors } from '../theme';

const STEPS = [
  'Analizando estructura',
  'Aplicando estilo',
  'Renderizando 8K',
];

export default function ProcessingScreen({ navigation }) {
  const { selectedImage, selectedStyle, setGeneratedImage, setError } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  const styleConfig = CONFIG.styles[selectedStyle];

  // Spinning animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseValue]);

  // AI Generation
  useEffect(() => {
    let isMounted = true;

    const generate = async () => {
      try {
        // Simulate step progression while actually generating
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }, 1500);

        const result = await generateRedesign(
          selectedImage,
          selectedStyle,
          (progress) => {
            // Update progress based on API response
            if (progress.status === 'processing' && isMounted) {
              setCurrentStep(1);
            }
          }
        );

        clearInterval(stepInterval);

        if (isMounted) {
          setGeneratedImage(result);
          navigation.replace('Result');
        }
      } catch (error) {
        console.error('Generation error:', error);
        if (isMounted) {
          setError(error.message || 'Error al generar la imagen');
          navigation.goBack();
        }
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [selectedImage, selectedStyle, setGeneratedImage, setError, navigation]);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinReverseInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Loader */}
        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.loaderRing,
              { transform: [{ rotate: spinInterpolate }] }
            ]}
          />
          <Animated.View
            style={[
              styles.loaderRingInner,
              { transform: [{ rotate: spinReverseInterpolate }] }
            ]}
          />
          <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
            <Text style={styles.loaderIcon}>{styleConfig?.icon || '◈'}</Text>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Transformando tu espacio</Text>
        <Text style={styles.subtitle}>
          Aplicando estilo <Text style={styles.styleName}>{styleConfig?.name}</Text>
        </Text>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepRow,
                { opacity: currentStep >= index ? 1 : 0.35 }
              ]}
            >
              <View
                style={[
                  styles.stepDot,
                  currentStep >= index && styles.stepDotActive,
                  currentStep === index && styles.stepDotCurrent,
                ]}
              />
              <Text style={styles.stepText}>{step}</Text>
              {currentStep > index && (
                <Text style={styles.stepCheck}>✓</Text>
              )}
            </View>
          ))}
        </View>

        {/* Hint */}
        <Text style={styles.hint}>Esto puede tomar 30-60 segundos</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  
  loaderContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  
  loaderRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopColor: colors.gold,
  },
  
  loaderRingInner: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.04)',
    borderBottomColor: 'rgba(212,175,55,0.4)',
  },
  
  loaderIcon: {
    fontSize: 30,
    color: colors.gold,
  },
  
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 36,
    textAlign: 'center',
  },
  
  styleName: {
    fontWeight: '600',
    color: colors.gold,
  },
  
  stepsContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 36,
  },
  
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  
  stepDotActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  
  stepDotCurrent: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  stepCheck: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
  
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
