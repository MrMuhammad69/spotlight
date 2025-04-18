import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/create.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, TextInput } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import * as FileSystem from 'expo-file-system'
export default function CreateScreen() {
  const route = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl)
  const createPost = useMutation(api.posts.createPost)
  const handleShare = async () => {
    if (!selectedImage) return;
    
    try {
      setIsSharing(true);
      
      // 1. Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // 2. Upload the image
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl, 
        selectedImage, 
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: 'image/jpeg',
        }
      );
  
      // 3. Check upload success
      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }
  
      // 4. Parse the response
      let storageId;
      try {
        storageId = JSON.parse(uploadResult.body).storageId;
      } catch (e) {
        throw new Error('Failed to parse upload response');
      }
  
      if (!storageId) {
        throw new Error('No storageId returned from upload');
      }
  
      // 5. Create post record
      await createPost({ storageId, caption });
      
      // 6. Navigate only after everything succeeds
      setCaption('')
      setSelectedImage(null)
      router.push('/(tabs)');
  
    } catch (error) {
      console.error('Error sharing post:', error);
      // Consider showing an error to the user
      Alert.alert('Error', 'Failed to share post. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };
  console.log(selectedImage);
  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>
        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color={COLORS.grey} />
          <Text style={styles.emptyImageText}>Tap to select an image</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 0}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setCaption(null);
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isSharing ? COLORS.grey : COLORS.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              isSharing && styles.shareButtonDisabled,
            ]}
            onPress={handleShare}
            disabled={isSharing || !selectedImage}
          >
            {isSharing ? (
              <ActivityIndicator size={"small"} color={COLORS.primary} />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Post section */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            {/* Image Section */}
            <View style={styles.imageSection}>
            <Image
              style={styles.previewImage}
              source={{ uri: selectedImage }} // Changed this line
              
            />
            
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              disabled={isSharing}
            >
              <Ionicons name="image-outline" size={20} color={COLORS.primary} />
              <Text style={styles.changeImageText}>Change</Text>
            </TouchableOpacity>
            </View>
            {/* Caption Section */}
            <View  style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image source={{uri: user?.imageUrl}} style={styles.userAvatar}  />
                <TextInput style={styles.captionInput} placeholder="Write a caption..." placeholderTextColor={COLORS.grey} multiline value={caption} onChangeText={setCaption} editable={!isSharing}>

                </TextInput>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
