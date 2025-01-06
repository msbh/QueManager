import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider, RadioButton, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { addDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithPhoneNumber, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
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
    const db = getFirestore();
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [userData, setUserData] = useState(null); // Store the user data after login
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Track login state
    // Validate phone number
    const validatePhoneNumber = (countryCode, mobileNumber) => {
        try {
            const phoneNumber = parsePhoneNumber(`${countryCode}${mobileNumber}`);
            return phoneNumber.isValid();
        } catch (error) {
            return false;
        }
    };
    // Add user to Firestore
    const AddUserDB = async (user,phoneNumber,userType) => {
        try {
            console.log('AddUserDB:', user.uid);
            // Prepare the user data for Firestore
            const payload = { username, phoneNumber, countryCode };
            payload.uid = user.uid;
            payload.email = user.email;
            payload.userType = userType;
            if (userType === 'receptionist') {
                payload.organization = organization;
                payload.organizationType = organizationType;
                payload.jobId = jobId;
            } else if (userType === 'serviceProvider') {
                payload.profession = profession;
                payload.specialization = specialization;
                payload.availabilityHours = availabilityHours;
            }

            console.log('AddUserDB 2:', user.uid);
            // Ensure db is properly initialized
            const usersCollection = collection(db, 'users');
            await addDoc(usersCollection, payload);

            console.log('AddUserDB 3:', user.uid);
            console.log('Payload:', payload);
            // Dispatch action to store user info
            dispatch({ type: 'REGISTER_USER', payload });
            return true;
        } catch (error) {
            console.log(' AddUserDB error:', error);
            return false;
        }
    };
    // Get user from DB
    const GetUserDB = async (user) => {
        try {
            console.log('GetUserDB:', user.uid);
            // Fetch additional user details from Firestore based on UID
            const q2 = query(collection(db, 'users'), where('uid', '==', user.uid));
            const querySnapshot2 = await getDocs(q2);

            console.log('GetUserDB 2:', user.uid);
            if (!querySnapshot2.empty) {
                const userDoc = querySnapshot2.docs[0].data();
                setUserData(userDoc); // Store user data
                console.log('User Data from Firestore:', userDoc);
                setIsUserLoggedIn(true); // User is logged in
                return true;
            } else {

                console.log('GetUserDB 3:', user.uid);
                return false;
                // alert('User not found in the database');
            }
        } catch (error) {
            console.log('GetUserDB error:', error);
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
            setConfirmationResult(confirmationResult);  // Store the result in state
            setSnackbarMessage('OTP sent to your phone number');
            setSnackbarVisible(true);
            setOtpSent(true);  // Mark OTP as sent
            // Store confirmation result globally
            // window.confirmationResult = confirmationResult;

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
            if (confirmationResult) {
                const result = await confirmationResult.confirm(confirmationCode);
                const user = result.user;
                setSnackbarMessage('Mobile number verified successfully');
                setSnackbarVisible(true);

                // Proceed with user registration after OTP verification
                handleMobileAndPasswordRegistration(user);
            } else {
                throw new Error('Confirmation result is undefined');
            }

        } catch (error) {
            console.error('Error verifying OTP:', error);
            setSnackbarMessage('OTP verification failed, please try again');
            setSnackbarVisible(true);
        }
    };

    // Register the user with mobile number and password
    const handleMobileAndPasswordRegistration = async (user) => {
        debugger;
        if (!password) {
            setSnackbarMessage('Please enter a password');
            setSnackbarVisible(true);
            return;
        }


        // Create a valid email by appending the mobile number with a domain

        const phoneNumber = `${countryCode}${mobileNumber}`;
        const validEmail = `${phoneNumber}@mobile.com`; // Use phone number as email

        try {
            // Register with mobile number (as email) and password
        	// Use mobile number as email for authentication
        	const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, validEmail, password);
            const user = userCredential.user;
            console.log('User registered:', user);
           // Add user to the database after registration
            const userAdded = await AddUserDB(user, phoneNumber, userType);
            if (userAdded) {

                // Navigate to the login screen
                setSnackbarMessage('Registration successful');
                setSnackbarVisible(true);
                navigation.navigate('LoginScreen');
            } else {
                setSnackbarMessage('Registration Failed ');
                setSnackbarVisible(true);
            }
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setSnackbarMessage('Email (mobile number) is already in use. Please log in or use a different number.');
                setSnackbarVisible(true);

                console.log('Email (mobile number) is already in use:1');
                // If the email is already in use, try logging the user in
                try {
                    const userCredentialGet = await signInWithEmailAndPassword(getAuth(), validEmail, password);
                    const userGet = userCredentialGet.user;
                    const userFound = await GetUserDB(userGet);
                    if (userFound) {
                        setSnackbarMessage('Successfully logged in');
                        setSnackbarVisible(true);
                        navigation.navigate('UserDashboard'); // Redirect to HomeScreen or relevant screen
                    }
                    else {
                    const userFound = await AddUserDB(userGet,phoneNumber,userType);
                    if (userFound) {
                            // Navigate to the login screen
                            setSnackbarMessage('User Registration successful');
                            setSnackbarVisible(true);
                            navigation.navigate('LoginScreen');
                        } else {
                            // Navigate to the login screen
                            setSnackbarMessage('Not Registerd Some error occured');
                            setSnackbarVisible(true);
                        }

                    }
                    console.log('Email (mobile number) is already in use:2', validEmail, password);

                } catch (loginError) {
                    console.error('Email (mobile number) is already in use. Error logging in:', loginError);
                    setSnackbarMessage('Email (mobile number) is already in use. Login failed. Please try again.');
                    setSnackbarVisible(true);
                }
            } else {
                console.error('Error registering user:', error);
                setSnackbarMessage('Registration failed. Please try again.');
                setSnackbarVisible(true);
            }
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
