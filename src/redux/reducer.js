const initialState = {
  user: null,
  businesses: [],
  queues: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'REGISTER_USER':
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