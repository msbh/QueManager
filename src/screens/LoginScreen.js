import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Title, Provider as PaperProvider } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; // Firebase Authentication
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Firestore
import theme from '../theme/theme'; // Import the shared theme
import { useNavigation } from '@react-navigation/native'; // For navigation
import { Snackbar } from 'react-native-paper';

const LoginScreen = () => {
    const [username, setUsername] = useState(''); // Mobile number as username
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null); // Store the user data after login
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Track login state
    const db = getFirestore();
    const auth = getAuth();
    const navigation = useNavigation();  // Using React Navigation for redirection

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        // Check if user is already logged in when the screen loads
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // If the user is logged in, fetch user details from Firestore
                //const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                const q = query(collection(db, 'users'), where('email', '==', user.email));

                const querySnapshot = await getDocs(q);
                console.log(' querySnapshot User Data from Firestore:', querySnapshot);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0].data();
                    setUserData(userDoc); // Store user data
                    console.log('User Data from Firestore:', userDoc);
                    setIsUserLoggedIn(true); // User is logged in
                    // Navigate to User Dashboard
                    navigation.navigate('UserDashboard');
                } else {
                    //alert('User not found in the database');
                    setSnackbarMessage('User not found in the database');
                    setSnackbarVisible(true);

                }
            } else {
                setIsUserLoggedIn(false); // User is not logged in
            }
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, [auth, db, navigation]); // Add necessary dependencies here

    // Handle login
    const handleLogin = async () => {
        setLoading(true); // Start loading state
        try {
            // Ensure email format is correct (append '@mobile.com' to the username)
            const email = `${username}@mobile.com`;

            // Attempt to sign in with mobile number (as email) and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User logged in:', user);

            // Log the UID for debugging purposes
            console.log('UID from Firebase Authentication:', user.uid);

            // Fetch additional user details from Firestore based on UID
            const q = query(collection(db, 'users'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                setUserData(userDoc); // Store user data
                console.log('User Data from Firestore:', userDoc);
                setIsUserLoggedIn(true); // User is logged in
                // Navigate to User Dashboard
                navigation.navigate('UserDashboard');
            } else {
                // alert('User not found in the database');
            }

        } catch (error) {
            console.error('Error logging in:', error);
            if (error.code === 'auth/invalid-email') {
                alert('The email address is not valid or has not been registered.');
            } else if (error.code === 'auth/user-not-found') {
                alert('No user found with that mobile number.');
            } else {
                alert('Invalid credentials, please try again');
            }
        } finally {
            setLoading(false); // End loading state
        }
    };


    // If user is already logged in, return null or navigate to Dashboard directly
    if (isUserLoggedIn) {

        navigation.navigate('UserDashboard');
        return null; // or `navigation.navigate('UserDashboard')` to prevent rendering login screen
    }

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
                            onPress={() => navigation.navigate('RegistrationScreen')}
                            style={styles.registerButton}
                        >
                            Don't have an account? Register
                        </Button>
                    </Card.Content>
                </Card>
            </View>

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
                {snackbarMessage}
            </Snackbar>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: theme.colors.background,
    },
    card: {
        padding: 16,
        backgroundColor: theme.colors.surface,
    },
    title: {
        textAlign: 'center',
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
