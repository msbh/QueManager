import { StyleSheet } from "react-native";
import theme from "../theme/theme"; // Import the shared theme

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
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
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  countryCodeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 10,
  },
  countryCodeInput: {
    width: "30%",
    marginRight: 8,
  },
  button: {
    // marginTop:10,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    paddingBottom: 20,
    flexGrow: 1,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 5,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  timeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputTime: {
    flex: 1,
    marginRight: 10,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "30%",
  },
  button: {
    width: "100%",
    padding: 6,
    borderRadius: 5,
    borderColor: theme.colors.primary,
  },
  availabilityList: {
    marginTop: 20,
  },
  availabilityItem: {
    marginBottom: 10,
  },
  slotText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 6,
    margin: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default styles;
