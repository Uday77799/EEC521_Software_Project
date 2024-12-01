import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Flex,
  Text,
  Image,
} from '@chakra-ui/react';
import axios from 'axios';
import './Login.css'; // Importing CSS for background styling

const Login = () => {
  // React Router navigation hook
  const navigate = useNavigate();

  // Local state for email, password, error message, and current time
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect hook to update the time every second
  useEffect(() => {
    // Timer to set the current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {
      // Send a POST request to the login endpoint with email and password
      const response = await axios.post('http://localhost:5000/api/Students/Login', { email, password });

      // Check if response status is 200 (OK)
      if (response.status === 200) {
        const { fullName, userId, userType } = response.data; // Destructure response data

        // Navigate to the dashboard and pass user information in state
        navigate('/dashboard', { state: { fullName, userId, userType } });
      } else {
        // Set error message if login is unsuccessful
        setErrorMessage('Invalid email or password.');
      }
    } catch (error) {
      // Display a generic error message if the request fails
      setErrorMessage('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <Flex minHeight="100vh" align="center" justify="center" className="gradient-background">
      {/* Main container for the login form */}
      <Box w="full" maxW="1200px" display="flex" boxShadow="lg" borderRadius="lg" overflow="hidden">

        {/* Left section of the login page */}
        <Box w="50%" bg="white" p={10}>
          {/* Welcome message */}
          <Box textAlign="center" mb={6}>
            <Heading as="h2" size="lg">Welcome to Study Center</Heading>
            <Text color="gray.500">Please enter your details</Text>
          </Box>

          {/* Display the current date and time */}
          <Box textAlign="center" mb={6}>
            <Text fontSize="lg" color="gray.500">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </Text>
          </Box>

          {/* Login form */}
          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
              {/* Email input field */}
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              {/* Password input field */}
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              {/* Submit button */}
              <Button colorScheme="pink" size="lg" type="submit" width="full">
                Sign In
              </Button>
            </Stack>
          </form>

          {/* Error message display */}
          {errorMessage && <Text color="red.500" mt={4}>{errorMessage}</Text>}
        </Box>

        {/* Right section with a decorative image */}
        <Box w="50%" p={10} display="flex" justifyContent="center" alignItems="center">
          <Image src={require('./photos/login-image.png')} alt="Login illustration" />
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
