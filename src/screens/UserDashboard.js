import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import firebase from '../firebase/firebaseConfig';

const UserDashboard = () => {
    const [queues, setQueues] = useState([]);

    const joinQueue = async (queueId) => {
        const queueRef = firebase.firestore().collection('queues').doc(queueId);
        await queueRef.update({
            total: firebase.firestore.FieldValue.increment(1),
        });
        alert('You have joined the queue!');
        fetchQueues();
    };

    const fetchQueues = async () => {
        const snapshot = await firebase.firestore().collection('queues').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQueues(data);
    };

    useEffect(() => {
        fetchQueues();
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
        </View>
    );
};

export default UserDashboard;
