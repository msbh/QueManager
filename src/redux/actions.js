import { SET_USER, SET_USER_TYPE } from './actionTypes';  // Import action types

export const setUser = (userData) => ({
    type: 'SET_USER',
    payload: userData,
  });
  
  export const registerUser = (user) => ({
    type: 'REGISTER_USER',
    payload: user,
  });
  
  export const setBusinesses = (businesses) => ({
    type: 'SET_BUSINESSES',
    payload: businesses,
  });
  
  export const updateQueue = (queue) => ({
    type: 'UPDATE_QUEUE',
    payload: queue,
  });
  
// Action to set user type
export const setUserType = (userType) => ({
  type: 'SET_USER_TYPE',
  payload: userType,
});

// Logout action
export const logoutUser = () => ({
  type: 'LOGOUT_USER',
});
  