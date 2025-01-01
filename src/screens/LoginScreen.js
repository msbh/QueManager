import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore
import { db } from '../firebase/firebaseConfig'; // Firestore config
import theme from '../theme/theme'; // Import the shared theme

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState(''); // Mobile number as username
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null); // Store the user data after login
    // Temporary hardcoded user data for login

    const hardcodedUsers = [
        { username: '1234567890', password: 'password123', userType: 'generalUser', fullName: 'John Doe' },
        { username: '0987654321', password: 'password456', userType: 'receptionist', fullName: 'Jane Smith' },
    ];
    const handleLogin = async () => {
        setLoading(true); // Start loading state
        const auth = getAuth();

        try {
            // Attempt to sign in with mobile number (as email) and password
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;
            //const user = hardcodedUsers.find(
            //  (user) => user.username === username && user.password === password
            //);

            console.log('User logged in:', user);

            // Now fetch additional user details from Firestore based on UID
            const q = query(collection(db, 'users'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                setUserData(userDoc); // Store user data
                console.log('User Data from Firestore:', userDoc);
                // Navigate to User Dashboard
                navigation.navigate('UserDashboard');
            }
            else {
                alert('User not found ');
            }

        } catch (error) {
            console.error('Error logging in:', error);
            alert('Invalid credentials, please try again');
        } finally {
            setLoading(false); // End loading state
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
                            onPress={() => navigation.navigate('RegistrationScreen')}
                            style={styles.registerButton}
                        >
                            Don't have an account? Register
                        </Button>
                    </Card.Content>
                </Card>
            </View>
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
