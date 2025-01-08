const initialState = {
  user: null,
  users: [],  // Ensure users is an array from the beginning
  businesses: [],
  queues: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'REGISTER_USER':
      // Ensure users is an array and add the new user to it
      return { ...state, users: [...state.users, action.payload] };
    
    case 'SET_BUSINESSES':
      return { ...state, businesses: action.payload };
    
    case 'UPDATE_QUEUE':
      return { ...state, queues: { ...state.queues, ...action.payload } };
    
    default:
      return state;
  }
};

export default reducer;
