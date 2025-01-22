import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native"; // For navigation to other screens
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/actions";
import { Card, Button } from "react-native-paper"; // Import Card and Button from react-native-paper

const ServiceProviderDashboard = ({ navigation }) => {
  const [queues, setQueues] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [upcomingQueue, setUpcomingQueue] = useState(null);
  const [totalServed, setTotalServed] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const auth = getAuth();
  const db = getFirestore();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully");
      dispatch(logoutUser()); // Dispatch logout action
      navigation.navigate("LoginScreen"); // Redirect to login screen
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const q = query(
        collection(db, "queues"),
        where("doctorId", "==", user.uid),
        where("time", ">=", new Date(new Date().setHours(0, 0, 0, 0))),
        where("time", "<=", new Date(new Date().setHours(23, 59, 59, 999)))
      );
      console.error("doctorId", user.uid);

      console.error("time", new Date(new Date().setHours(0, 0, 0, 0)));
      console.error("time to", new Date(new Date().setHours(23, 59, 59, 999)));
      const querySnapshot = await getDocs(q);
      const queueData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQueues(queueData);

      // Calculate metrics
      const currentServingQueue = queueData.find(
        (queue) => queue.status === "serving"
      );
      const upcomingQueueNumber = queueData.find(
        (queue) => queue.status === "waiting"
      );
      const totalServedToday = queueData.filter(
        (queue) => queue.status === "served"
      ).length;
      const patientsLeftToServe = queueData.filter(
        (queue) => queue.status === "waiting"
      ).length;

      setCurrentServing(currentServingQueue);
      setUpcomingQueue(upcomingQueueNumber);
      setTotalServed(totalServedToday);
      setPatientsLeft(patientsLeftToServe);
    } catch (error) {
      console.error("Error fetching queues:", error);
    }
  };

  const updateQueueStatus = async (queueId, newStatus) => {
    try {
      const queueDoc = doc(db, "queues", queueId);
      await updateDoc(queueDoc, { status: newStatus });
      fetchQueues(); // Refresh the queue data
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Service Provider Dashboard</Text>
      <Text style={{ marginTop: 10 }}>
        Current Serving Queue Number:{" "}
        {currentServing ? currentServing.queueNumber : "None"}
      </Text>
      <Text style={{ marginTop: 10 }}>
        Upcoming Queue Number:{" "}
        {upcomingQueue ? upcomingQueue.queueNumber : "None"}
      </Text>
      <Text style={{ marginTop: 10 }}>Total Served Today: {totalServed}</Text>
      <Text style={{ marginTop: 10 }}>
        Customer Left to Serve: {patientsLeft}
      </Text>
      <FlatList
        data={queues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>
                Queue Number: {item.queueNumber}
              </Text>
              <Text>Queue Number: {item.queueNumber}</Text>
              <Text>Customer Mobile: {item.patientMobile}</Text>
              <Text>Status: {item.status}</Text>
            </Card.Content>
            <Card.Actions>
              {item.status === "waiting" && (
                <>
                  <Button
                    mode="contained"
                    onPress={() => updateQueueStatus(item.id, "serving")}
                    style={styles.servingButton}
                  >
                    Start Serving
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => updateQueueStatus(item.id, "missed")}
                    style={styles.missedButton}
                  >
                    Mark as Missed
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => updateQueueStatus(item.id, "rejected")}
                    style={styles.rejectedButton}
                  >
                    Reject
                  </Button>
                </>
              )}
              {item.status === "serving" && (
                <Button
                  mode="contained"
                  onPress={() => updateQueueStatus(item.id, "served")}
                  style={styles.servedButton}
                >
                  Mark as Served
                </Button>
              )}
            </Card.Actions>
          </Card>
        )}
      />
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  servingButton: {
    backgroundColor: "#4CAF50", // Green
    marginRight: 10,
  },
  missedButton: {
    backgroundColor: "#FFC107", // Amber
    marginRight: 10,
  },
  rejectedButton: {
    backgroundColor: "#F44336", // Red
    marginRight: 10,
  },
  servedButton: {
    backgroundColor: "#2196F3", // Blue
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default ServiceProviderDashboard;
