import { useEffect, useState } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { ChevronRight } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { AlertModal } from '@/components/ui/AppModal'
import { useToast } from '@/contexts/ToastContext'
import { ACCENT, ACCENT_DIM, ACCENT_BORDER, BG, BORDER, TEXT_SECONDARY } from '@/lib/theme'
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants'
import { adjustBrightness } from '@/lib/utils'

const { width: SW, height: SH } = Dimensions.get('window')

type FeatureAction = 'analyze' | 'ai-info' | 'dashboard'

const FEATURES: Array<{
    icon: 'camera-outline' | 'sparkles-outline' | 'stats-chart-outline'
    title: string
    desc: string
    action: FeatureAction
    hint: string
}> = [
    {
        icon: 'camera-outline',
        title: 'Snap Your Meal',
        desc: 'Point your camera at any plate for instant logging',
        action: 'analyze',
        hint: 'Tap to start',
    },
    {
        icon: 'sparkles-outline',
        title: 'AI Nutrition',
        desc: 'Get calorie and macro estimates in seconds',
        action: 'ai-info',
        hint: 'Learn more',
    },
    {
        icon: 'stats-chart-outline',
        title: 'Track Daily Goals',
        desc: 'See progress toward your calorie targets',
        action: 'dashboard',
        hint: 'Tap to start',
    },
]

const AI_NUTRITION_MESSAGE =
    'Cal AI uses photo-based analysis to estimate calories, protein, carbs, and fat. Sign in to snap a meal and see your full nutrition breakdown — demo mode uses mock results for reliable screenshots.'

export default function LandingScreen() {
    const insets = useSafeAreaInsets()
    const { showToast } = useToast()
    const [aiModalOpen, setAiModalOpen] = useState(false)

    const headerY = useSharedValue(-20)
    const headerOpacity = useSharedValue(0)
    const heroScale = useSharedValue(0.88)
    const heroOpacity = useSharedValue(0)
    const featuresY = useSharedValue(30)
    const featuresOpacity = useSharedValue(0)
    const footerOpacity = useSharedValue(0)
    const orbOneY = useSharedValue(0)
    const orbTwoY = useSharedValue(0)

    useEffect(() => {
        headerY.value = withSpring(0, { damping: 16, stiffness: 120 })
        headerOpacity.value = withTiming(1, { duration: 500 })
        heroScale.value = withDelay(180, withSpring(1, { damping: 14, stiffness: 100 }))
        heroOpacity.value = withDelay(180, withTiming(1, { duration: 550 }))
        featuresY.value = withDelay(380, withSpring(0, { damping: 16, stiffness: 110 }))
        featuresOpacity.value = withDelay(380, withTiming(1, { duration: 480 }))
        footerOpacity.value = withDelay(550, withTiming(1, { duration: 500 }))
        orbOneY.value = withRepeat(
            withSequence(
                withTiming(-16, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
            ),
            -1,
            true,
        )
        orbTwoY.value = withRepeat(
            withSequence(
                withTiming(14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
            ),
            -1,
            true,
        )
    }, [])

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: headerY.value }],
        opacity: headerOpacity.value,
    }))
    const heroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }],
        opacity: heroOpacity.value,
    }))
    const featuresStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: featuresY.value }],
        opacity: featuresOpacity.value,
    }))
    const footerStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value }))
    const orbOneStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbOneY.value }] }))
    const orbTwoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbTwoY.value }] }))

    const goToLogin = () => router.push('/(auth)/login')

    /** Analyze and dashboard live behind Stack.Protected — route via sign-in first. */
    const handleFeaturePress = (action: FeatureAction) => {
        switch (action) {
            case 'analyze':
                showToast('Sign in to snap and analyze your first meal', 'info')
                goToLogin()
                break
            case 'ai-info':
                setAiModalOpen(true)
                break
            case 'dashboard':
                showToast('Sign in to open your daily nutrition dashboard', 'info')
                goToLogin()
                break
        }
    }

    return (
        <View style={s.root}>
            <LinearGradient
                pointerEvents="none"
                colors={[BG, '#0b140b', '#081008', BG]}
                locations={[0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View pointerEvents="none" style={[s.orbOne, orbOneStyle]} />
            <Animated.View pointerEvents="none" style={[s.orbTwo, orbTwoStyle]} />

            <Animated.View style={[s.headerOuter, { marginTop: insets.top + 10 }, headerStyle]}>
                <View style={s.headerBar}>
                    <View style={s.headerLeft}>
                        <LinearGradient
                            colors={[adjustBrightness(ACCENT, 20), ACCENT]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.headerLogo}
                        >
                            <Text style={s.headerLogoText}>{APP_NAME.charAt(0)}</Text>
                        </LinearGradient>
                        <Text style={s.headerAppName}>{APP_NAME}</Text>
                    </View>

                    <Pressable
                        onPress={goToLogin}
                        style={({ pressed }) => [s.headerCta, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
                    >
                        <LinearGradient
                            colors={[ACCENT, adjustBrightness(ACCENT, -18)]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.headerCtaGrad}
                        >
                            <Text style={s.headerCtaText}>Get Started</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </Animated.View>

            <Animated.View style={[s.heroWrap, heroStyle]}>
                <Text style={s.heroTitle}>{APP_NAME}</Text>
                <Text style={s.heroTagline}>{APP_TAGLINE}</Text>
                <Text style={s.heroDesc}>{APP_DESCRIPTION}</Text>
            </Animated.View>

            <Animated.View style={[s.featuresWrap, featuresStyle]}>
                {FEATURES.map((feat) => (
                    <Pressable
                        key={feat.action}
                        onPress={() => handleFeaturePress(feat.action)}
                        accessibilityRole="button"
                        accessibilityLabel={`${feat.title}. ${feat.hint}`}
                        style={({ pressed }) => [
                            s.featureRow,
                            pressed && s.featureRowPressed,
                        ]}
                    >
                        <View style={s.featureIconWrap}>
                            <Ionicons name={feat.icon} size={18} color={ACCENT} />
                        </View>
                        <View style={s.featureTextWrap}>
                            <Text style={s.featureTitle}>{feat.title}</Text>
                            <Text style={s.featureDesc}>{feat.desc}</Text>
                            <Text style={s.featureHint}>{feat.hint}</Text>
                        </View>
                        <ChevronRight size={18} color={ACCENT} strokeWidth={2.2} />
                    </Pressable>
                ))}
            </Animated.View>

            <Animated.View style={[s.footer, footerStyle, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable
                    onPress={goToLogin}
                    hitSlop={8}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                    <Text style={s.signInText}>
                        Already have an account? <Text style={s.signInLink}>Sign in</Text>
                    </Text>
                </Pressable>

                <Text style={s.legal}>
                    By continuing you agree to our{' '}
                    <Text onPress={() => router.push('/terms')} style={s.legalLink}>Terms</Text>
                    {' '}and{' '}
                    <Text onPress={() => router.push('/privacy')} style={s.legalLink}>Privacy Policy</Text>
                </Text>
            </Animated.View>

            <AlertModal
                visible={aiModalOpen}
                title="AI Nutrition"
                message={AI_NUTRITION_MESSAGE}
                buttons={[
                    { text: 'Not now', style: 'cancel', onPress: () => setAiModalOpen(false) },
                    {
                        text: 'Get Started',
                        onPress: () => {
                            setAiModalOpen(false)
                            goToLogin()
                        },
                    },
                ]}
                onDismiss={() => setAiModalOpen(false)}
            />
        </View>
    )
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    orbOne: {
        position: 'absolute',
        right: -SW * 0.25,
        top: SH * 0.06,
        width: SW * 0.72,
        height: SW * 0.72,
        borderRadius: 999,
        backgroundColor: `${ACCENT}14`,
    },
    orbTwo: {
        position: 'absolute',
        left: -SW * 0.32,
        bottom: SH * 0.18,
        width: SW * 0.66,
        height: SW * 0.66,
        borderRadius: 999,
        backgroundColor: `${ACCENT}0C`,
    },
    headerOuter: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerBar: {
        width: '95%',
        height: 58,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: BORDER,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 6,
        paddingRight: 6,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerLogo: {
        width: 36,
        height: 36,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLogoText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    headerAppName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    headerCta: {
        borderRadius: 999,
        overflow: 'hidden',
    },
    headerCtaGrad: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 999,
    },
    headerCtaText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    heroWrap: {
        paddingHorizontal: 24,
        paddingTop: 36,
        gap: 10,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 40,
    },
    heroTagline: {
        color: ACCENT,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    heroDesc: {
        color: 'rgba(255,255,255,0.48)',
        fontSize: 14,
        lineHeight: 21,
        maxWidth: 320,
        marginTop: 2,
    },
    featuresWrap: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    featureRowPressed: {
        backgroundColor: ACCENT_DIM,
        borderColor: ACCENT_BORDER,
    },
    featureIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTextWrap: {
        flex: 1,
        gap: 3,
    },
    featureTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    featureDesc: {
        color: 'rgba(255,255,255,0.42)',
        fontSize: 12.5,
        lineHeight: 17,
    },
    featureHint: {
        color: ACCENT,
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    footer: {
        paddingHorizontal: 20,
        gap: 10,
        alignItems: 'center',
    },
    signInText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
    },
    signInLink: {
        color: ACCENT,
        fontWeight: '600',
    },
    legal: {
        color: 'rgba(255,255,255,0.22)',
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 17,
        paddingHorizontal: 8,
    },
    legalLink: {
        color: 'rgba(255,255,255,0.38)',
        textDecorationLine: 'underline',
    },
})
