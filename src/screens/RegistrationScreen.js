import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider, RadioButton, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore
import { getAuth, createUserWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth'; // Firebase Authentication
import theme from '../theme/theme'; // Import the shared theme
import { parsePhoneNumber } from 'libphonenumber-js';

const RegistrationScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+92');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [userType, setUserType] = useState('generalUser');
    const [organization, setOrganization] = useState('');
    const [organizationType, setOrganizationType] = useState('');
    const [jobId, setJobId] = useState('');
    const [profession, setProfession] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const dispatch = useDispatch();
    const [otpSent, setOtpSent] = useState(false);

    // Validate phone number
    const validatePhoneNumber = (countryCode, mobileNumber) => {
        try {
            const phoneNumber = parsePhoneNumber(`${countryCode}${mobileNumber}`);
            return phoneNumber.isValid();
        } catch (error) {
            return false;
        }
    };

    // Send OTP to the mobile number
    const handleSendOTP = async () => {
        if (!mobileNumber) {
            setSnackbarMessage('Please enter your mobile number');
            setSnackbarVisible(true);
            return;
        }

        if (!validatePhoneNumber(countryCode, mobileNumber)) {
            setSnackbarMessage('Invalid mobile number');
            setSnackbarVisible(true);
            return;
        }

        try {
            //temporary send 
            setOtpSent(true);
            // Send OTP
            const phoneNumber = `${countryCode}${mobileNumber}`;
            const auth = getAuth();

            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);
            setSnackbarMessage('OTP sent to your phone number');
            setSnackbarVisible(true);

            // Store confirmation result globally
            window.confirmationResult = confirmationResult;
            setOtpSent(true); // Mark OTP as sent
        } catch (error) {
            console.error('Error sending OTP:', error);
            setSnackbarMessage('Failed to send OTP, please try again');
            setSnackbarVisible(true);
        }
    };

    // Verify OTP and complete registration
    const handleVerifyOTP = async () => {
        if (!confirmationCode) {
            setSnackbarMessage('Please enter the OTP');
            setSnackbarVisible(true);
            return;
        }

        try {
            const result = await window.confirmationResult.confirm(confirmationCode);
            const user = result.user;
            setSnackbarMessage('Mobile number verified successfully');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setSnackbarMessage('OTP verification failed, please try again');
            setSnackbarVisible(true);
        }
    };

    // Register the user with mobile number and password
    const handleMobileAndPasswordRegistration = async () => {
        if (!password) {
            setSnackbarMessage('Please enter a password');
            setSnackbarVisible(true);
            return;
        }

        // Use mobile number as email for authentication
        const auth = getAuth();

        try {
            // Register with mobile number (as email) and password
            const userCredential = await createUserWithEmailAndPassword(auth, mobileNumber, password);
            const user = userCredential.user;

            // Prepare the user data for Firestore
            const payload = { username, mobileNumber, countryCode };
            if (userType === 'receptionist') {
                payload.organization = organization;
                payload.organizationType = organizationType;
                payload.jobId = jobId;
            } else if (userType === 'serviceProvider') {
                payload.profession = profession;
                payload.specialization = specialization;
                payload.availabilityHours = availabilityHours;
            }

            // Add user data to Firestore
            await addDoc(collection(db, 'users'), payload);

            // Dispatch action to store user info
            dispatch({ type: 'REGISTER_USER', payload });

            // Navigate to the login screen
            setSnackbarMessage('Registration successful');
            setSnackbarVisible(true);
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error('Error registering user:', error);
            setSnackbarMessage('Registration failed. Please try again.');
            setSnackbarVisible(true);
        }
    };

    return (
        <PaperProvider theme={theme}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.title}>Register</Title>

                            {/* Full Name */}
                            <TextInput
                                label="Full Name"
                                value={username}
                                onChangeText={setUsername}
                                style={styles.input}
                                theme={{ colors: { primary: theme.colors.primary } }}
                            />

                            {/* Mobile Number */}
                            <View style={styles.countryCodeContainer}>
                                <TextInput
                                    label="Country Code"
                                    value={countryCode}
                                    onChangeText={setCountryCode}
                                    style={styles.countryCodeInput}
                                    theme={{ colors: { primary: theme.colors.primary } }}
                                />
                                <TextInput
                                    label="Mobile Number"
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                    style={styles.input}
                                    theme={{ colors: { primary: theme.colors.primary } }}
                                />
                            </View>

                            {/* OTP Input */}
                            {otpSent && (
                                <View>
                                    <TextInput
                                        label="Enter OTP"
                                        value={confirmationCode}
                                        onChangeText={setConfirmationCode}
                                        style={styles.input}
                                        theme={{ colors: { primary: theme.colors.primary } }}
                                    />
                                    <Button mode="contained" onPress={handleVerifyOTP} style={styles.button}>
                                        Verify OTP
                                    </Button>
                                </View>
                            )}

                            {/* Password */}
                            {!otpSent && (
                                <TextInput
                                    label="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={styles.input}
                                    theme={{ colors: { primary: theme.colors.primary } }}
                                />
                            )}

                            {/* User Type Radio Buttons */}
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

                            {/* Buttons */}
                            {!otpSent ? (
                                <Button mode="contained" onPress={handleSendOTP} style={styles.button}>
                                    Send OTP
                                </Button>
                            ) : (
                                <Button mode="contained" onPress={handleMobileAndPasswordRegistration} style={styles.button}>
                                    Complete Registration
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
                {snackbarMessage}
            </Snackbar>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        flex: 1,
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
    countryCodeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    countryCodeInput: {
        width: '30%',
        marginRight: 8,
    },
    button: {
        marginTop: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
});

export default RegistrationScreen;