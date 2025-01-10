import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, Card, Title, Provider as PaperProvider} from 'react-native-paper';
import { Snackbar,RadioButton } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import theme from '../theme/theme';
import { useDispatch, useSelector } from 'react-redux';  
import { setUser, setUserType } from '../redux/actions';  

const ReceptionistScreen = ({ navigation }) => {
    const [doctorList, setDoctorList] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [patientMobile, setPatientMobile] = useState('');
    const [queueAdded, setQueueAdded] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const db = getFirestore();
    const auth = getAuth();
    const user = useSelector((state) => state.user);
    const userType = useSelector((state) => state.userType); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserLoggedIn(true);
                checkUserType(user); 
            } else {
                setUserLoggedIn(false);
                navigation.navigate('LoginScreen'); 
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            dispatch(logoutUser());
            navigation.navigate('LoginScreen');
        } catch (error) {
            alert('Failed to log out. Please try again.');
        }
    };

    const checkUserType = async (user) => {
        try {
            if(userType =='receptionist')
        {
             fetchDoctorList(user); // Fetch doctor list if the user is a receptionist
        }else{
        const userRef = collection(db, 'users');
        const q = query(userRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            const type = userDoc.userType; // Get the user type (receptionist or generalUser)
            setUserType(type);

            // If not a receptionist, redirect to the appropriate screen
            if (type !== 'receptionist') {
                navigation.navigate('UserDashboard'); // Redirect normal users to user dashboard
            } else {
                fetchDoctorList(user); // Fetch doctor list if the user is a receptionist
            }
        }
    }
    } catch (error) {
        console.error('Error fetching user type:', error);
    }
    };

    const fetchDoctorList = async (user) => {
        try {
            debugger;
            const q = query(collection(db, 'users'), where('userType', '==', 'serviceProvider'));
            const querySnapshot = await getDocs(q);
            const doctors = [];
            querySnapshot.forEach((doc) => {
                doctors.push({ id: doc.id, name: doc.data().username });
            });
            setDoctorList(doctors);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const addQueueEntry = async () => {
        if (!patientMobile || !selectedDoctor) {
            setSnackbarMessage('Please select a doctor and enter a valid mobile number');
            setSnackbarVisible(true);
            return;
        }

        try {
            const payload = {
                doctorId: selectedDoctor,
                patientMobile,
                time: new Date(),
                status: 'waiting',
            };
            await addDoc(collection(db, 'queues'), payload);
            setQueueAdded(true);
            setSnackbarMessage('Patient added to the queue');
            setSnackbarVisible(true);
            setPatientMobile('');
            setSelectedDoctor('');
        } catch (error) {
            console.error('Error adding to queue:', error);
            setSnackbarMessage('Failed to add patient to the queue');
            setSnackbarVisible(true);
        }
    };

    return (
        <PaperProvider theme={theme}>
        <ScrollView contentContainerStyle={styles.container}>
            {userLoggedIn ? (
                <>
                    <Text style={styles.title}>Receptionist Dashboard</Text>
                    <Text style={styles.label}>Select Doctor</Text>
                    <View style={styles.dropdown}>
                        <Button mode="outlined" onPress={() => {}} style={styles.dropdownButton}>
                            {selectedDoctor ? selectedDoctor : 'Select Doctor'}
                        </Button>
                        {doctorList.length > 0 && (
                            <View style={styles.dropdownMenu}>
                                {doctorList.map((doctor) => (
                                    <Button
                                        key={doctor.id}
                                        mode="text"
                                        onPress={() => setSelectedDoctor(doctor.name)}
                                        style={styles.dropdownItem}
                                    >
                                        {doctor.name}
                                    </Button>
                                ))}
                            </View>
                        )}
                    </View>
                    <Text style={styles.label}>Enter Patient Mobile Number</Text>
                    <TextInput
                        label="Enter Patient Mobile Number"
                        value={patientMobile}
                        onChangeText={setPatientMobile}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <Button mode="contained" onPress={addQueueEntry} style={styles.button}>
                        Add to Queue
                    </Button>

                    {queueAdded && (
                        <Text style={styles.successMessage}>Patient added successfully to the queue!</Text>
                    )}
                </>
            ) : (
                <Text>Please log in to access this screen</Text>
            )}

            <Button title="Logout" onPress={handleLogout} style={{ marginTop: 20 }} />
            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 16,
    },
    successMessage: {
        color: 'green',
        marginTop: 8,
    },
    dropdown: {
        marginBottom: 16,
    },
    dropdownButton: {
        width: '100%',
    },
    dropdownMenu: {
        paddingTop: 8,
    },
    dropdownItem: {
        paddingVertical: 8,
    },
});

export default ReceptionistScreen;
