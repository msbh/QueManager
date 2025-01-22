import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Provider as PaperProvider,
  Menu,
} from "react-native-paper";
import { Snackbar, RadioButton } from "react-native-paper";
import { View, StyleSheet, ScrollView } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import theme from "../theme/theme";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setUserType } from "../redux/actions";
import { v4 as uuidv4 } from "uuid"; // Import the uuid library

const ReceptionistScreen = ({ navigation }) => {
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [queueAdded, setQueueAdded] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const dispatch = useDispatch();
  const userstate = useSelector((state) => state.user);
  const userType = useSelector((state) => state.userType);
  const [menuVisible, setMenuVisible] = useState(false); // Added state for menu visibility
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 }); // Added state for menu anchor
  const [currentServingQueueNumber, setCurrentServingQueueNumber] =
    useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserLoggedIn(true);
        checkUserType(user);
      } else {
        setUserLoggedIn(false);
        navigation.navigate("LoginScreen");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      navigation.navigate("LoginScreen");
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  const checkUserType = async (user) => {
    try {
      if (userType == "receptionist") {
        fetchDoctorList(user); // Fetch doctor list if the user is a receptionist
      } else {
        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          const type = userDoc.userType; // Get the user type (receptionist or generalUser)
          setUserType(type);

          // If not a receptionist, redirect to the appropriate screen
          if (type !== "receptionist") {
            navigation.navigate("UserDashboard"); // Redirect normal users to user dashboard
          } else {
            fetchDoctorList(user); // Fetch doctor list if the user is a receptionist
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user type:", error);
    }
  };

  const fetchDoctorList = async (user) => {
    try {
      debugger;
      const q = query(
        collection(db, "users"),
        where("userType", "==", "serviceProvider"),
        where("organization", "==", userstate.organization)
      );
      const querySnapshot = await getDocs(q);
      const doctors = [];
      /* querySnapshot.forEach((doc) => {
        doctors.push({ id: doc.id, name: doc.data() });
      });*/
      const doctorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctorList(doctorsList);
      console.log("Fetched doctors:", doctorsList); // Debugging line to check fetched data
    } catch (error) {
      console.error("Error fetching doctors:", error);
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
  const addQueueEntry = async () => {
    if (!patientMobile || !selectedDoctor) {
      setSnackbarMessage(
        "Please select a doctor and enter a valid mobile number"
      );
      setSnackbarVisible(true);
      return;
    }

    const doctor = doctorList.find((doc) => doc.id === selectedDoctor);
    if (!doctor) {
      setSnackbarMessage("Selected doctor not found");
      setSnackbarVisible(true);
      return;
    }

    const currentDay = new Date().toLocaleString("en-us", { weekday: "long" });
    const currentTime = new Date().getHours();
    let queueNumber = 0;
    const availability = doctor.availabilityHours.find(
      (avail) =>
        avail.days.includes(currentDay) &&
        currentTime >= parseInt(avail.from) &&
        currentTime <= parseInt(avail.to)
    );

    if (!availability) {
      setSnackbarMessage("Doctor is not available at this time");
      setSnackbarVisible(true);
      return;
    }

    try {
      const q = query(
        collection(db, "queues"),
        where("doctorId", "==", selectedDoctor),
        where("status", "==", "waiting"),
        where("time", ">=", new Date(new Date().setHours(0, 0, 0, 0))),
        where("time", "<=", new Date(new Date().setHours(23, 59, 59, 999)))
      );
      const querySnapshot = await getDocs(q);
      const queueCount = querySnapshot.size;

      // Check for duplicate patient mobile number
      const duplicate = querySnapshot.docs.some(
        (doc) => doc.data().patientMobile === patientMobile
      );
      if (duplicate) {
        setSnackbarMessage(
          "Patient with this mobile number is already in the queue"
        );
        setSnackbarVisible(true);
        return;
      }
      if (queueCount >= availability.limit) {
        setSnackbarMessage("Doctor's queue is full for this time slot");
        setSnackbarVisible(true);
        return;
      }
      queueNumber = queueCount + 1; // Calculate the next queue number
    } catch (error) {
      console.error("Error adding patient to the queue missing table:", error);
      setSnackbarMessage("Failed to add patient to the queue table");
      setSnackbarVisible(true);
    }
    try {
      if (queueNumber === 0) {
        queueNumber = 1;
      }
      const payload = {
        id: uuidv4(), // Generate a unique ID for the queue entry
        doctorId: npm,
        patientMobile,
        time: new Date(),
        status: "waiting",
        queueNumber, // Add the queue number to the payload
        updatedTime: new Date(),
      };
      await addDoc(collection(db, "queues"), payload);
      setQueueAdded(true);
      setSnackbarMessage("Patient added to the queue");
      setSnackbarVisible(true);
      setPatientMobile("");
      setSelectedDoctor("");
    } catch (error) {
      console.error("Error adding patient to the queue:", error);
      setSnackbarMessage("Failed to add patient to the queue");
      setSnackbarVisible(true);
    }
  };
  const handleMenuOpen = (event) => {
    setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };
  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId);
    setMenuVisible(false);
    fetchCurrentServingQueueNumber(doctorId);
  };
  return (
    <PaperProvider theme={theme}>
      <ScrollView contentContainerStyle={styles.container}>
        {userLoggedIn ? (
          <>
            <Text style={styles.title}>Receptionist Dashboard</Text>
            <Text style={styles.title}>Add Patient to Queue</Text>
            <TextInput
              label="Patient Mobile Number"
              value={patientMobile}
              onChangeText={setPatientMobile}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Button onPress={handleMenuOpen}>
              {selectedDoctor
                ? doctorList.find((doc) => doc.id === selectedDoctor)?.username
                : "Select Doctor"}
            </Button>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={menuAnchor}
            >
              {doctorList.map((doctor) => (
                <Menu.Item
                  key={doctor.id}
                  onPress={() => handleDoctorSelect(doctor.id)}
                  title={doctor.username}
                />
              ))}
            </Menu>
            {selectedDoctor && currentServingQueueNumber !== null && (
              <Text style={styles.currentServing}>
                Current Serving Queue Number: {currentServingQueueNumber}
              </Text>
            )}
            <Button
              mode="contained"
              onPress={addQueueEntry}
              style={styles.button}
            >
              Add to Queue
            </Button>

            {queueAdded && (
              <Text style={styles.successMessage}>
                Patient added successfully to the queue!
              </Text>
            )}
            <Button
              title="Logout"
              onPress={handleLogout}
              style={{ marginTop: 20 }}
            />
          </>
        ) : (
          <Text>Please log in to access this screen</Text>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
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
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 16,
  },
  successMessage: {
    color: "green",
    marginTop: 8,
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownButton: {
    width: "100%",
  },
  dropdownMenu: {
    paddingTop: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
});

export default ReceptionistScreen;
