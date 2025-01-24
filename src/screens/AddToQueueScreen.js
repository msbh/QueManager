/QManage/QueManager/src/screens/AddToQueueScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Button, Card } from 'react-native-paper';

const AddToQueueScreen = () => {
  const [queues, setQueues] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'queues'));
      const queuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueues(queuesData);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  const handleAddToQueue = async (queueId) => {
    // Implement the logic to add the user to the selected queue
    alert(`Added to queue with ID: ${queueId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add to Queue</Text>
      <FlatList
        data={queues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Queue Number: {item.queueNumber}</Text>
              <Text>Service Provider: {item.doctorId}</Text>
              <Text>Status: {item.status}</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={() => handleAddToQueue(item.id)}>
                Add to Queue
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  card: {
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddToQueueScreen;