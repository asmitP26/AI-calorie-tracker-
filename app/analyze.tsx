import { useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Camera,
  ChevronLeft,
  ImagePlus,
  Sparkles,
} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EstimateDisclaimer } from '@/components/meal/MealUi'
import {
  ACCENT,
  ACCENT_DIM,
  BG,
  BORDER,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'
import { analyzeMealImage } from '@/lib/aiNutrition'
import { saveMeal } from '@/lib/mealStorage'

export default function AnalyzeScreen() {
  const insets = useSafeAreaInsets()
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickImage = async (source: 'gallery' | 'camera') => {
    setError(null)
    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          setError('Camera permission is required to take a meal photo.')
          return
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.85,
        })
        if (!result.canceled && result.assets[0]?.uri) {
          setImageUri(result.assets[0].uri)
        }
        return
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        setError('Photo library permission is required to choose a meal photo.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      })
      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
      }
    } catch {
      setError('Could not open the photo picker. Please try again.')
    }
  }

  const handleAnalyze = async () => {
    if (!imageUri || analyzing) return
    setError(null)
    setAnalyzing(true)
    try {
      const analysis = await analyzeMealImage(imageUri)
      await saveMeal(analysis)
      router.push(`/result/${analysis.id}`)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <ChevronLeft size={22} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={s.headerTitle}>Analyze Meal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={s.title}>Just snap a pic</Text>
        <Text style={s.subtitle}>
          Take or upload a photo of your meal and AI will estimate calories and macros in seconds.
        </Text>

        {/* Image Area */}
        {imageUri ? (
          <Card style={s.previewCard}>
            <Image source={{ uri: imageUri }} style={s.previewImage} resizeMode="cover" />
            {analyzing && (
              <View style={s.previewOverlay}>
                <Sparkles size={32} color={ACCENT} strokeWidth={2} />
                <ActivityIndicator color={ACCENT} style={{ marginTop: 12 }} />
                <Text style={s.overlayText}>Analyzing with AI...</Text>
              </View>
            )}
            {!analyzing && (
              <Pressable onPress={() => setImageUri(null)} style={s.changeBtn}>
                <Text style={s.changeBtnText}>Change photo</Text>
              </Pressable>
            )}
          </Card>
        ) : (
          <Pressable
            onPress={() => pickImage('gallery')}
            style={({ pressed }) => [s.uploadArea, pressed && { opacity: 0.9 }]}
          >
            <View style={s.uploadIconWrap}>
              <ImagePlus size={40} color={ACCENT} strokeWidth={1.6} />
            </View>
            <Text style={s.uploadTitle}>Tap to add meal photo</Text>
            <Text style={s.uploadHint}>Well-lit, top-down shots work best</Text>
          </Pressable>
        )}

        {/* Action Buttons */}
        <View style={s.actions}>
          <Button
            label="Choose from Gallery"
            variant="secondary"
            fullWidth
            onPress={() => pickImage('gallery')}
            disabled={analyzing}
          />
          <Button
            label="Take Photo"
            variant="outline"
            fullWidth
            onPress={() => pickImage('camera')}
            disabled={analyzing}
          />
        </View>

        {error && (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Scan Button */}
        <Button
          label="Scan Food"
          variant="primary"
          size="lg"
          fullWidth
          loading={analyzing}
          disabled={!imageUri || analyzing}
          onPress={handleAnalyze}
        />

        <EstimateDisclaimer />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 18 },
  title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: TEXT_SECONDARY, marginTop: -8 },
  uploadArea: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BORDER,
    borderStyle: 'dashed',
    backgroundColor: SURFACE,
  },
  uploadIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  uploadHint: { fontSize: 13, color: TEXT_SECONDARY },
  previewCard: { padding: 0, overflow: 'hidden', borderRadius: 20 },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 20,
  },
  overlayText: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, marginTop: 8 },
  changeBtn: { alignSelf: 'center', paddingVertical: 10 },
  changeBtnText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  actions: { gap: 10 },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: { fontSize: 13, color: '#EF4444', lineHeight: 18 },
})
