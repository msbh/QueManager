import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';  // For navigation to other screens

const UserDashboard = () => {
    const [queues, setQueues] = useState([]);
    const [userType, setUserType] = useState('generalUser'); // Assuming you fetch userType on login
    const db = getFirestore();
    const auth = getAuth();
    const navigation = useNavigation();  // Using React Navigation for redirection

    // Fetch queues from Firestore
    const fetchQueues = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'queues'));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQueues(data);
        } catch (error) {
            console.error('Error fetching queues:', error);
        }
    };

    // Join a queue and increment the "total" count
    const joinQueue = async (queueId) => {
        try {
            const queueRef = doc(db, 'queues', queueId);
            await updateDoc(queueRef, {
                total: increment(1), // Increment the total field
            });
            alert('You have joined the queue!');
            fetchQueues();
        } catch (error) {
            console.error('Error joining the queue:', error);
        }
    };

    // Handle user redirection based on userType
    const handleNavigation = () => {
        if (userType === 'receptionist') {
            navigation.navigate('AdminDashboard');
        } else if (userType === 'serviceProvider') {
            navigation.navigate('ServiceProviderDashboard');
        } else {
            navigation.navigate('UserDashboard'); // Default navigation
        }
    };

    // Log out the user
    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('Logged out successfully');
            navigation.navigate('LoginScreen'); // Redirect to login screen
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    useEffect(() => {
        fetchQueues();

        // Optionally, fetch userType from Firestore or Redux state if required
        // This is just an example; make sure to fetch it based on how you store it in your app
        const user = auth.currentUser;
        if (user) {
            // Assuming the userType is stored in Firestore
            // Fetch userType from Firestore and update state
            // setUserType(fetchedUserType);
        }
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18 }}>User Dashboard</Text>
            <FlatList
                data={queues}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={{ marginVertical: 10 }}>
                        <Text>{item.name} - Current: {item.current} / Total: {item.total}</Text>
                        <Button title="Join Queue" onPress={() => joinQueue(item.id)} />
                    </View>
                )}
            />
            {/* Add logout button */}
            <Button title="Logout" onPress={handleLogout} style={{ marginTop: 20 }} />
        </View>
    );
};

export default UserDashboard;
