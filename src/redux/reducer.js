import { SET_USER, SET_USER_TYPE } from './actionTypes';  // Import action types

// Action types
//const SET_USER = 'SET_USER';
const REGISTER_USER = 'REGISTER_USER';
const SET_BUSINESSES = 'SET_BUSINESSES';
const UPDATE_QUEUE = 'UPDATE_QUEUE';
const LOGOUT_USER = 'LOGOUT_USER';  // Action type for logging out

const initialState = {
  user: null,
  userType: 'generalUser', // Default userType
  users: [],  // Make sure users is an array from the beginning
  businesses: [],
  queues: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };  // Setting user data
    
    case REGISTER_USER:
      return { ...state, users: [...state.users, action.payload] };  // Adding new user to users array
    
    case SET_BUSINESSES:
      return { ...state, businesses: action.payload };  // Setting businesses data
    
    case SET_USER_TYPE:
        return { ...state, userType: action.payload };
      
    case UPDATE_QUEUE:
      return { ...state, queues: { ...state.queues, ...action.payload } };  // Updating queue data
    
    case LOGOUT_USER:  // Action to log out the user
      return { ...state, user: null };  // Clear user data on logout

    default:
      return state;
  }
};

export default reducer;
