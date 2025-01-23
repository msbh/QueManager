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

const UserDashboard = ({ navigation }) => {
  const [userQueue, setUserQueue] = useState(null);
  const [currentServingQueueNumber, setCurrentServingQueueNumber] =
    useState(null);
  const db = getFirestore();
  const auth = getAuth();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // Get the userType from Redux store
  const userType = useSelector((state) => state.userType); // Access userType from Redux

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    fetchUserQueue();
  }, []);

  // Fetch user type from Firestore
  const checkUserType = async (user) => {
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        return userDoc.userType; // Get the user type (e.g., 'receptionist' or 'generalUser')
      } else {
        // Return a default user type if the user is not found in the database
        return "generalUser";
      }
    } catch (error) {
      console.error("Error fetching user type:", error);
      return "generalUser"; // Default type in case of error
    }
  };
  const fetchUserQueue = async () => {
    try {
      const now = new Date();
      const q = query(
        collection(db, "queues"),
        where("patientMobile", "==", user.phoneNumber),
        where("status", "in", ["waiting", "serving", "missed"]),
        where("time", ">=", now)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userQueueData = querySnapshot.docs[0].data();
        setUserQueue(userQueueData);
        fetchCurrentServingQueueNumber(userQueueData.doctorId);
        fetchDoctorDetails(userQueueData.doctorId);
      }
    } catch (error) {
      console.error("Error fetching user queue:", error);
    }
  };

  const fetchCurrentServingQueueNumber = async (doctorId) => {
    try {
      const q = query(
        collection(db, "queues"),
        where("doctorId", "==", doctorId),
        where("status", "==", "serving"),
        where("time", ">=", new Date(new Date().setHours(0, 0, 0, 0))),
        where("time", "<=", new Date(new Date().setHours(23, 59, 59, 999)))
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const currentServing = querySnapshot.docs[0].data().queueNumber;
        setCurrentServingQueueNumber(currentServing);
      } else {
        setCurrentServingQueueNumber(null);
      }
    } catch (error) {
      console.error("Error fetching current serving queue number:", error);
    }
  };

  const fetchDoctorDetails = async (doctorId) => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", doctorId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doctorData = querySnapshot.docs[0].data();
        setDoctorDetails(doctorData);
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  // Handle user redirection based on userType
  const handleNavigation = async () => {
    const user = auth.currentUser;
    const type = await checkUserType(user);

    // const type= checkUserType(userType);
    // setUserType(type);
    if (type === "receptionist") {
      navigation.navigate("ReceptionistScreen");
    } else if (type === "serviceProvider") {
      navigation.navigate("ServiceProviderDashboard");
    } else {
      // navigation.navigate('UserDashboard'); // Default navigation
    }
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

  const handleQuitQueue = async () => {
    try {
      if (userQueue) {
        const queueDoc = doc(db, "queues", userQueue.id);
        await deleteDoc(queueDoc);
        setUserQueue(null);
        setSnackbarMessage("You have successfully quit the queue.");
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error("Error quitting the queue:", error);
      setSnackbarMessage("Failed to quit the queue. Please try again.");
      setSnackbarVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18 }}>{user.username} Dashboard</Text>
        {userQueue ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>
                Your Queue Number: {userQueue.queueNumber}
              </Text>
              <Text>
                Service Provider:{" "}
                {doctorDetails ? doctorDetails.username : "Loading..."}
              </Text>
              <Text>
                Organization:{" "}
                {doctorDetails ? doctorDetails.organization : "Loading..."}
              </Text>
              <Text>
                Type:{" "}
                {doctorDetails ? doctorDetails.organizationType : "Loading..."}
              </Text>
              <Text>
                Current Serving Queue Number:{" "}
                {currentServingQueueNumber !== null
                  ? currentServingQueueNumber
                  : "None"}
              </Text>
              <Text>
                Number initiated:{" "}
                {userQueue.time ? formatTime(userQueue.time) : "Unknown"}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={handleQuitQueue}
                style={styles.quitButton}
              >
                Quit Queue
              </Button>
            </Card.Actions>
          </Card>
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
      </View>{" "}
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
});
