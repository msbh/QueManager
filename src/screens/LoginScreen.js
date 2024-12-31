import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore
import theme from '../theme/theme'; // Import the shared theme

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersList = querySnapshot.docs.map(doc => doc.data());
            setUsers(usersList);
        };

        fetchUsers();
    }, []);

    const handleLogin = () => {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            navigation.navigate('UserDashboard');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.title}>Login</Title>
                        <TextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                            theme={{ colors: { primary: theme.colors.primary } }}
                        />
                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            theme={{ colors: { primary: theme.colors.primary } }}
                        />
                        <Button mode="contained" onPress={handleLogin} style={styles.button}>
                            Login
                        </Button>
                        <Button mode="text" onPress={() => navigation.navigate('RegistrationScreen')} style={styles.registerButton}>
                            Register
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