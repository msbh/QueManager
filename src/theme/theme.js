import { DefaultTheme } from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#1877F2', // Facebook Blue
        accent: '#42b72a', // Facebook Green
        background: '#FFFFFF', // White
        surface: '#f0f2f5', // Light Gray
        text: '#050505', // Almost Black
        placeholder: '#8d949e', // Placeholder Gray
    },
};

export default theme;