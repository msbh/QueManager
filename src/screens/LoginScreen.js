import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setUserType } from "../redux/actions";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Provider as PaperProvider,
  Snackbar,
} from "react-native-paper";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth"; // Firebase Authentication
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore
import theme from "../theme/theme"; // Import the shared theme
import { getFirestore } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native"; // For navigation

const LoginScreen = () => {
  const [username, setUsername] = useState(""); // Mobile number as username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const dispatch = useDispatch(); // Use dispatch to send actions to Redux
  const navigation = useNavigation(); // Using React Navigation for redirection
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user details from Firestore if user is logged in
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          dispatch(setUser(userDoc)); // Dispatch user data to Redux
          dispatch(setUserType(userDoc.userType)); // Dispatch user data to Redux
          if (userDoc.userType === "receptionist") {
            navigation.navigate("ReceptionistScreen");
          } else if (userDoc.userType === "serviceProvider") {
            navigation.navigate("ServiceProviderDashboard");
          } else {
            navigation.navigate("UserDashboard"); // Default navigation
          }
        } else {
          //alert("User not found in the database");
          setSnackbarMessage("User not found in the database");
          setSnackbarVisible(true);
        }
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [auth, db, dispatch, navigation]); // Dependencies for useEffect

  const handleLogin = async () => {
    setLoading(true);
    try {
      const email = username + "@mobile.com"; // Construct email with mobile number
      //const password2 = "admin123"; // Static password (replace with real password if needed)

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", user.email);
      console.log("UID from Firebase Authentication:", user?.uid);

      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot?.empty) {
        // alert("User not found in the database");
        setSnackbarMessage("User not found in the database");
        setSnackbarVisible(true);
      } else {
        const userDoc = querySnapshot.docs[0].data();
        console.log("User Data from Firestore:", userDoc);
        dispatch(setUser(userDoc)); // Dispatch user data to Redux
        dispatch(setUserType(userDoc.userType)); // Dispatch user data to Redux
        if (userDoc.userType === "receptionist") {
          navigation.navigate("ReceptionistScreen");
        } else if (userDoc.userType === "serviceProvider") {
          navigation.navigate("ServiceProviderDashboard");
        } else {
          navigation.navigate("UserDashboard"); // Default navigation
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.code === "auth/invalid-email") {
        setSnackbarMessage(
          "The email address is not valid or has not been registered."
        );
        setSnackbarVisible(true);
      } else if (error.code === "auth/user-not-found") {
        //alert("No user found with that mobile number.");
        setSnackbarMessage("No user found with that mobile number.");
        setSnackbarVisible(true);
      } else {
        //alert("Invalid credentials, please try again");
        setSnackbarMessage("Invalid credentials, please try again");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Login</Title>

            {/* Username (Mobile Number) */}
            <TextInput
              label="Mobile Number"
              value={username}
              onChangeText={setUsername}
              keyboardType="phone-pad"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={loading} // Show loading spinner when logging in
            >
              Login
            </Button>

            {/* Register Button */}
            <Button
              mode="text"
              onPress={() => navigation.navigate("RegistrationScreen")}
              style={styles.registerButton}
            >
              Don't have an account? Register
            </Button>
          </Card.Content>
        </Card>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  card: {
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
  },
  registerButton: {
    marginTop: 8,
    color: theme.colors.accent,
  },
});

export default LoginScreen;
