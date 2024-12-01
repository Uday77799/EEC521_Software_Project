import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';               // Importing global CSS styles
import App from './App';             // Importing the main App component
import { ChakraProvider } from '@chakra-ui/react';  // Chakra UI provider for consistent styling
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';   // Utility for performance measurement

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // Finding the root element in HTML to render the app
);

root.render(
  // StrictMode checks for potential problems in the application during development
  <React.StrictMode>
    {/* ChakraProvider wraps the entire app to provide Chakra UI styling across all components */}
    <ChakraProvider>
      {/* Main App component that contains the router and main application structure */}
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// Registering the service worker to make the app work offline and load faster.
// Uncommenting `register()` enables the service worker, but comes with considerations.
serviceWorkerRegistration.unregister();

// Reporting performance metrics for the app. Results are logged in the console
// or can be sent to an analytics endpoint for detailed insights.
reportWebVitals();
