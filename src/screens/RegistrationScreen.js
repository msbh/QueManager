import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider, RadioButton, Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore
import theme from '../theme/theme'; // Import the shared theme

const organizationTypes = [
    'Restaurant', 'Clinic', 'Bank', 'Pharmacy', 'Educational Institute', 'Government Offices', 'Museum', 'Theme Park', 'Ticket Counter', 'Call Center', 'Service Centers', 'GYM', 'Events', 'Hotels', 'Salons and Spa'
];

const RegistrationScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('generalUser');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [organization, setOrganization] = useState('');
    const [organizationType, setOrganizationType] = useState('');
    const [jobId, setJobId] = useState('');
    const [profession, setProfession] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('');
    const [menuVisible, setMenuVisible] = useState(false); // State to manage menu visibility
    const dispatch = useDispatch();

    const handleRegister = async () => {
        if (username && password && mobileNumber) {
            const payload = { username, password, userType, mobileNumber, email };
            if (userType === 'receptionist') {
                payload.organization = organization;
                payload.organizationType = organizationType;
                payload.jobId = jobId;
            } else if (userType === 'serviceProvider') {
                payload.profession = profession;
                payload.specialization = specialization;
                payload.availabilityHours = availabilityHours;
            }

            try {
                await addDoc(collection(db, 'users'), payload);
                dispatch({ type: 'REGISTER_USER', payload });
                navigation.navigate('LoginScreen');
            } catch (error) {
                console.error('Error adding document: ', error);
                alert('Registration failed. Please try again.');
            }
        } else {
            alert('Please fill all required fields');
        }
    };

    return (
        <PaperProvider theme={theme}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.title}>Register</Title>
                            <TextInput
                                label="Full Name"
                                value={username}
                                onChangeText={setUsername}
                                style={styles.input}
                                theme={{ colors: { primary: theme.colors.primary } }}
                            />
                            <TextInput
                                label="Mobile Number"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
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
                            <TextInput
                                label="Email Address (Optional)"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                theme={{ colors: { primary: theme.colors.primary } }}
                            />
                            <RadioButton.Group onValueChange={newValue => setUserType(newValue)} value={userType}>
                                <View style={styles.radioContainer}>
                                    <RadioButton value="generalUser" />
                                    <Text>General User</Text>
                                </View>
                                <View style={styles.radioContainer}>
                                    <RadioButton value="receptionist" />
                                    <Text>Receptionist</Text>
                                </View>
                                <View style={styles.radioContainer}>
                                    <RadioButton value="serviceProvider" />
                                    <Text>Doctor/Service Provider</Text>
                                </View>
                            </RadioButton.Group>
                            {userType === 'receptionist' && (
                                <>
                                    <TextInput
                                        label="Organization/Business Name"
                                        value={organization}
                                        onChangeText={setOrganization}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                    <View>
                                        <TextInput
                                            label="Organization Type"
                                            value={organizationType}
                                            onFocus={() => setMenuVisible(true)}
                                            style={styles.input}
                                            theme={{ colors: { primary: theme.colors.primary } }}
                                        />
                                        <Menu
                                            visible={menuVisible}
                                            onDismiss={() => setMenuVisible(false)}
                                            anchor={<TextInput label="Organization Type" value={organizationType} />}
                                        >
                                            {organizationTypes.map((type, index) => (
                                                <Menu.Item key={index} onPress={() => { setOrganizationType(type); setMenuVisible(false); }} title={type} />
                                            ))}
                                        </Menu>
                                    </View>
                                    <TextInput
                                        label="Job ID (Optional)"
                                        value={jobId}
                                        onChangeText={setJobId}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                </>
                            )}
                            {userType === 'serviceProvider' && (
                                <>
                                    <TextInput
                                        label="Profession/Title"
                                        value={profession}
                                        onChangeText={setProfession}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                    <TextInput
                                        label="Specialization (Optional)"
                                        value={specialization}
                                        onChangeText={setSpecialization}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                    <TextInput
                                        label="Availability Hours (Optional)"
                                        value={availabilityHours}
                                        onChangeText={setAvailabilityHours}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                </>
                            )}
                            <Button mode="contained" onPress={handleRegister} style={styles.button}>
                                Register
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
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
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: theme.colors.primary,
    },
});

export default RegistrationScreen;