import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import TimeTrackingTable from './components/TimeTrackingTable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
        '#root': {
          margin: 0,
          padding: 0,
        }
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <TimeTrackingTable />
      </Box>
    </ThemeProvider>
  )
}

export default App
