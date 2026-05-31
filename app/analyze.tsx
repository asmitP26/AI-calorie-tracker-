import { useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Camera,
  ChevronLeft,
  ImagePlus,
  ScanLine,
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
  ACCENT_BORDER,
  BG,
  BORDER,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'
import { analyzeMealImage } from '@/lib/aiNutrition'
import { saveMeal } from '@/lib/mealStorage'

const STEPS = [
  { n: '1', label: 'Add photo' },
  { n: '2', label: 'AI scan' },
  { n: '3', label: 'See macros' },
]

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

  const activeStep = analyzing ? 2 : imageUri ? 2 : 1

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <ChevronLeft size={22} color={TEXT_SECONDARY} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Analyze Meal</Text>
          <View style={s.aiBadge}>
            <Sparkles size={11} color={ACCENT} strokeWidth={2.5} />
            <Text style={s.aiBadgeText}>AI Vision</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.instruction}>
          Snap or upload your meal. Cal AI estimates calories and macros from your photo in seconds.
        </Text>

        <View style={s.stepsRow}>
          {STEPS.map((step, i) => {
            const done = analyzing ? i < 1 : i + 1 < activeStep
            const active = i + 1 === activeStep
            return (
              <View key={step.n} style={s.stepItem}>
                <View style={[s.stepDot, done && s.stepDotDone, active && s.stepDotActive]}>
                  <Text style={[s.stepNum, done && s.stepNumDone, active && !done && s.stepNumActive]}>
                    {step.n}
                  </Text>
                </View>
                <Text style={[s.stepLabel, active && s.stepLabelActive]}>{step.label}</Text>
              </View>
            )
          })}
        </View>

        {imageUri ? (
          <Card style={s.previewCard}>
            <View style={s.previewHeader}>
              <ScanLine size={16} color={ACCENT} strokeWidth={2} />
              <Text style={s.previewLabel}>Meal preview</Text>
            </View>
            <View style={s.previewImageWrap}>
              <Image source={{ uri: imageUri }} style={s.previewImage} resizeMode="cover" />
              {analyzing ? (
                <View style={s.previewOverlay}>
                  <Sparkles size={28} color={ACCENT} strokeWidth={2} />
                  <ActivityIndicator color={ACCENT} style={{ marginTop: 12 }} />
                  <Text style={s.overlayTitle}>Analyzing meal with AI vision...</Text>
                  <Text style={s.overlaySub}>Estimating calories, macros, and ingredients</Text>
                </View>
              ) : null}
            </View>
            {!analyzing ? (
              <Pressable onPress={() => setImageUri(null)} style={s.changePhoto}>
                <Text style={s.changePhotoText}>Change photo</Text>
              </Pressable>
            ) : null}
          </Card>
        ) : (
          <Pressable
            onPress={() => pickImage('gallery')}
            disabled={analyzing}
            style={({ pressed }) => [pressed && { opacity: 0.92 }]}
          >
            <LinearGradient
              colors={['rgba(34,197,94,0.12)', 'rgba(255,255,255,0.03)']}
              style={s.placeholderCard}
            >
              <View style={s.placeholderIcon}>
                <ImagePlus size={34} color={ACCENT} strokeWidth={1.8} />
              </View>
              <Text style={s.placeholderTitle}>Tap to add a meal photo</Text>
              <Text style={s.placeholderSub}>
                Well-lit, top-down shots work best for accurate portion estimates.
              </Text>
              <View style={s.uploadHint}>
                <Camera size={14} color={ACCENT} strokeWidth={2.2} />
                <Text style={s.uploadHintText}>Choose from gallery</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}

        <Card style={s.pickerCard}>
          <Text style={s.pickerTitle}>Upload options</Text>
          <View style={s.pickerActions}>
            <Button
              label="Choose Meal Photo"
              variant="primary"
              fullWidth
              onPress={() => pickImage('gallery')}
              disabled={analyzing}
            />
            <Button
              label="Take Photo"
              variant="secondary"
              fullWidth
              onPress={() => pickImage('camera')}
              disabled={analyzing}
            />
          </View>
        </Card>

        {error ? (
          <Card compact style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
          </Card>
        ) : null}

        <Button
          label="Analyze Meal"
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerCenter: { alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: ACCENT },
  body: { paddingHorizontal: 20, paddingTop: 18, gap: 16 },
  instruction: { fontSize: 15, lineHeight: 22, color: TEXT_SECONDARY },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepItem: { alignItems: 'center', gap: 6, flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_DIM,
  },
  stepDotDone: {
    borderColor: ACCENT,
    backgroundColor: ACCENT,
  },
  stepNum: { fontSize: 12, fontWeight: '700', color: TEXT_TERTIARY },
  stepNumActive: { color: ACCENT },
  stepNumDone: { color: '#0d0d0d' },
  stepLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
  stepLabelActive: { color: TEXT_PRIMARY },
  pickerCard: { paddingVertical: 14, gap: 10 },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  pickerActions: { gap: 10 },
  previewCard: { gap: 10, padding: 14, overflow: 'hidden' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  previewImageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ACCENT_BORDER,
  },
  previewImage: {
    width: '100%',
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,13,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 4,
  },
  overlayTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  overlaySub: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
  },
  changePhoto: { alignSelf: 'center', paddingVertical: 6 },
  changePhotoText: { fontSize: 13, fontWeight: '600', color: ACCENT },
  placeholderCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ACCENT_BORDER,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  placeholderTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },
  placeholderSub: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  uploadHintText: { fontSize: 12, fontWeight: '700', color: ACCENT },
  errorCard: {
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(248,113,113,0.08)',
  },
  errorText: { fontSize: 13, color: '#f87171', lineHeight: 18 },
})
