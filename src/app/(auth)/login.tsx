import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.style";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from 'react-native'

export default function login() {
    const router = useRouter()
    const {startSSOFlow} = useSSO()
    const handleGoogleSignIn = async ()=> {
        try {
            const {createdSessionId,setActive}= await startSSOFlow({strategy: 'oauth_google'})
            if(setActive && createdSessionId) {
                setActive({session: createdSessionId});
                router.navigate('/(tabs)');
            }
            
        }
        catch (error) {
              console.error('OauthError', error)  
        }
    }
  return (
    <View style={styles.container}>
        {/* Brand Section */}
      <View style={styles.brandSection}>
       <View style={styles.logoContainer}>
       <Ionicons name="leaf" size={32} color={COLORS.primary} />
       </View>
     
      <Text style={styles.appName}>
        spotlight
      </Text>
      <Text style={styles.tagline}>
        don't miss anything
      </Text>
      </View>
      {/* Image Section */}
      <View style={styles.illustrationContainer}>
      <Image source={require('@/assets/online-wishes-bro.png')} resizeMode="cover" style={styles.illustration} />
      </View>
      {/* Login Section */}
      <View style={styles.loginSection}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} activeOpacity={0.9}>
            <View style={styles.googleIconContainer}>
                <Ionicons name="logo-google" size={20} color={COLORS.surface}/>
            </View>
            <Text style={styles.googleButtonText}>
                Continue with google
            </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
            By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  )
}