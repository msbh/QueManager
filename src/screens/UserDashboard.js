import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/actions"; // Import logout action
import { useSelector } from "react-redux";
import { Card, Button, Snackbar } from "react-native-paper"; // Import Card and Button from react-native-paper
import { QUEUE_STATUSES } from "../constants/constants"; // Import queue statuses

const UserDashboard = ({ navigation }) => {
  const [userQueues, setUserQueues] = useState([]);
  const [currentServingQueueNumbers, setCurrentServingQueueNumbers] = useState(
    {}
  );
  const db = getFirestore();
  const auth = getAuth();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    fetchUserQueues();
  }, []);

  const fetchUserQueues = async () => {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Set to the start of the current day
      const q = query(
        collection(db, "queues"),
        where("patientMobile", "==", user.phoneNumber),
        where("status", "in", [
          QUEUE_STATUSES.WAITING,
          QUEUE_STATUSES.SERVING,
          QUEUE_STATUSES.MISSED,
          QUEUE_STATUSES.REJECTED,
        ]),
        where("time", ">=", now)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const queues = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const queueData = doc.data();
            const doctorData = await fetchDoctorDetails(queueData.doctorId);
            const currentServingQueueNumber =
              await fetchCurrentServingQueueNumber(queueData.doctorId);
            return {
              ...queueData,
              doctorDetails: doctorData,
              currentServingQueueNumber,
            };
          })
        );
        setUserQueues(queues);
      }
    } catch (error) {
      console.error("Error fetching user queues:", error);
    }
  };

  const fetchDoctorDetails = async (doctorId) => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", doctorId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
    return null;
  };
  const fetchCurrentServingQueueNumber = async (doctorId) => {
    try {
      const q = query(
        collection(db, "queues"),
        where("doctorId", "==", doctorId),
        where("status", "==", QUEUE_STATUSES.SERVING),
        where("time", ">=", new Date(new Date().setHours(0, 0, 0, 0))),
        where("time", "<=", new Date(new Date().setHours(23, 59, 59, 999)))
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().queueNumber;
      }
    } catch (error) {
      console.error("Error fetching current serving queue number:", error);
    }
    return "None";
  };

  // Log out the user
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setSnackbarMessage("Logged out successfully");
      setSnackbarVisible(true);
      dispatch(logoutUser()); // Dispatch logout action
      navigation.navigate("LoginScreen"); // Redirect to login screen
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };
  const formatTime = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const handleQuitQueue = async (queueId) => {
    try {
      const queueDoc = doc(db, "queues", queueId);
      await deleteDoc(queueDoc);
      setUserQueues(userQueues.filter((queue) => queue.id !== queueId));
      setSnackbarMessage("You have successfully quit the queue.");
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error quitting the queue:", error);
      setSnackbarMessage("Failed to quit the queue. Please try again.");
      setSnackbarVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18 }}>
          {user ? user.username : "User "} Dashboard
        </Text>
        {userQueues.length > 0 ? (
          userQueues.map((queue) => (
            <Card key={queue.id} style={styles.card}>
              <Card.Content>
                {queue.currentServingQueueNumber === queue.queueNumber && (
                  <Text style={styles.turnNow}>It's Your Turn Now</Text>
                )}
                <Text style={styles.cardTitle}>
                  Your Queue Number: {queue.queueNumber}
                </Text>
                <Text>
                  Service Provider:{" "}
                  {queue.doctorDetails
                    ? queue.doctorDetails.username
                    : "Loading..."}
                </Text>

                <Text>
                  Organization:{" "}
                  {queue.doctorDetails
                    ? queue.doctorDetails.organization
                    : "Loading..."}
                </Text>
                <Text>
                  Type:{" "}
                  {queue.doctorDetails
                    ? queue.doctorDetails.organizationType
                    : "Loading..."}
                </Text>
                <Text>
                  Current Serving Queue Number:{" "}
                  {queue.currentServingQueueNumber !== null
                    ? queue.currentServingQueueNumber
                    : "None"}
                </Text>
                <Text>
                  Number initiated:{" "}
                  {queue.time ? formatTime(queue.time) : "Unknown"}
                </Text>
              </Card.Content>
              <Card.Actions>
                {queue.status !== "served" && (
                  <Button
                    mode="contained"
                    onPress={() => handleQuitQueue(queue.id)}
                    style={styles.quitButton}
                  >
                    Quit Queue
                  </Button>
                )}
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text style={{ marginTop: 20 }}>
            You have not taken any queue number.
          </Text>
        )}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginVertical: 10,
    width: "100%",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 20,
  },
  turnNow: {
    fontSize: 20,
    color: "green",
    fontWeight: "bold",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
