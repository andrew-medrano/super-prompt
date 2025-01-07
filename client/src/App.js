import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';

const theme = createTheme({
    typography: {
        fontFamily: "'SF Pro Display','-apple-system','BlinkMacSystemFont','Helvetica Neue','Arial',sans-serif"
    },
    palette: {
        primary: {
            main: '#007AFF',
        },
        secondary: {
            main: '#5856D6',
        },
        background: {
            default: '#FAFAFA',
        },
    },
    components: {
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiButton: {
            defaultProps: {
                variant: 'contained',
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Home />
        </ThemeProvider>
    );
}

export default App;