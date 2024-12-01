import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';  // Importing Dashboard component

const App = () => {
  return (
    // Router component enables navigation and routing for the application
    <Router>
      {/* Routes component defines the individual routes and their corresponding components */}
      <Routes>
        
        {/* Route for the root path ("/") rendering the Login component */}
        <Route path="/" element={<Login />} />

        {/* Route for the "/dashboard" path rendering the Dashboard component */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
