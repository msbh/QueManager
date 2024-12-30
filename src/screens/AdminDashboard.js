import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import firebase from '../firebase/firebaseConfig';

const AdminDashboard = () => {
    const [queueName, setQueueName] = useState('');
    const [queues, setQueues] = useState([]);

    const addQueue = async () => {
        if (!queueName) return alert('Queue name cannot be empty');
        const newQueue = { name: queueName, current: 0, total: 0 };
        await firebase.firestore().collection('queues').add(newQueue);
        setQueueName('');
        fetchQueues();
    };

    const fetchQueues = async () => {
        const snapshot = await firebase.firestore().collection('queues').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQueues(data);
    };

    React.useEffect(() => {
        fetchQueues();
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18 }}>Admin Dashboard</Text>
            <TextInput
                placeholder="Enter Queue Name"
                value={queueName}
                onChangeText={setQueueName}
                style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
            />
            <Button title="Add Queue" onPress={addQueue} />
            <Text style={{ marginTop: 20 }}>Current Queues:</Text>
            <FlatList
                data={queues}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Text>{item.name} - Current: {item.current} / Total: {item.total}</Text>
                )}
            />
        </View>
    );
};

export default AdminDashboard;
