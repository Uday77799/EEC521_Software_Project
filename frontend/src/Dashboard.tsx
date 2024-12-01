import React, { useState, useEffect } from 'react';
import {
  Image,Badge,HStack, Box,Tooltip, Heading, Text, Button, Stack, Flex, Table, Thead, Tbody, Tr, Th, Td, useDisclosure, Collapse, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Input, FormLabel, FormControl
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css'; // Import the CSS file with the gradient background\import courseImage from './photos/course-image.png';
import courseImage from './photos/course-image.png';
import studentImage from './photos/Avatar/student-avatar1.png'
import AdminbackImage from './photos/Background1.jpeg'
import StudentbackImage from './photos/Background2.jpeg'




interface Enrollment {
  courseName: string;
  completionStatus: string;
  progress?: number;
}

interface Course {
  courseId: number;
  courseName: string;
  description: string;
  maxSeats: number;
  currentSeats: number;
  startDate: string;
  endDate: string;
}

interface Student {
  studentId: number;
  fullName: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, userId, userType } = location.state || {};
  const [currentTime, setCurrentTime] = useState(new Date());


  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentEnrollments, setSelectedStudentEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const [isPreviousClassesOpen, setIsPreviousClassesOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false); // New course modal
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [maxSeats, setMaxSeats] = useState(0);
  const [currentSeats, setCurrentSeats] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Course/ShowAllCourses');
        setAvailableCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (userType === 1) {
      const fetchStudents = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/Students/ShowAllStudents');
          setStudents(response.data);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };

      fetchStudents();
      fetchCourses(); // Fetch courses for admin users
    } else if (userType === 2) {
      const fetchEnrollments = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/Enrollments/GetAllEnrollments');
          const studentEnrollments = response.data.data.filter((enrollment: any) => enrollment.studentName === fullName);

          const processedEnrollments = studentEnrollments.map((enrollment: any) => {
            let progress = 0;
            if (enrollment.completionStatus === "1") {
              progress = 100;
            } else {
              progress = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
            }
            return {
              courseName: enrollment.courseName,
              completionStatus: enrollment.completionStatus,
              progress,
            };
          });

          setEnrollments(processedEnrollments);
        } catch (error) {
          console.error('Error fetching enrollments:', error);
        }
      };

      fetchEnrollments();
      fetchCourses(); // Fetch courses for student users
    }
  }, [fullName, userType]);

  const openAddCourseModal = () => {
    setIsCourseModalOpen(true);
  };

  const closeAddCourseModal = () => {
    setIsCourseModalOpen(false);
    clearForm();
  };

  const clearForm = () => {
    setCourseName('');
    setDescription('');
    setMaxSeats(0);
    setCurrentSeats(0);
    setStartDate('');
    setEndDate('');
    setErrorMessage(null);
  };

  const handleAddCourse = async () => {
    if (!courseName || !description || !maxSeats || !currentSeats || !startDate || !endDate) {
      setErrorMessage('All fields are required.');
      return;
    }

    const requestBody = {
      courseId: Math.floor(Math.random() * 900) + 100, // Random 3-digit courseId
      courseName,
      description,
      maxSeats,
      currentSeats,
      startDate: startDate, // Format should already be 'yyyy-mm-dd'
      endDate: endDate // Format should already be 'yyyy-mm-dd'
    };

    try {
      const response = await axios.post('http://localhost:5000/api/Course/CreateCourse', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.Message) {
        setModalMessage(response.data.Message);
      } else {
        setModalMessage('Successfully added the course.');
      }

      onOpen(); // Open success modal
      closeAddCourseModal(); // Close the course modal
      clearForm(); // Clear form values

      const fetchCourses = async () => {
        const response = await axios.get('http://localhost:5000/api/Course/ShowAllCourses');
        setAvailableCourses(response.data);
      };
      fetchCourses();
    } catch (error: any) {
      console.error('Error while adding course:', error.response ? error.response.data : error.message);
      setErrorMessage('An error occurred while adding the course. Please try again.');
    }
  };

  const handleEnroll = async (courseName: string) => {
    try {
      const requestBody = {
        studentName: fullName,
        courseName: courseName,
      };

      const response = await axios.post('http://localhost:5000/api/Enrollments/JoinCourse', requestBody);

      if (response.data && response.data.Message) {
        setModalMessage(response.data.Message);
      } else {
        setModalMessage('Successfully enrolled in the course.');
      }

      onOpen(); // Open the modal to show the message

      const fetchEnrollments = async () => {
        try {
          const response = await axios.get('http://localhost:5000/GetAllEnrollments');

          const studentEnrollments = response.data.data.filter(
            (enrollment: any) => enrollment.studentName === fullName
          );

          const processedEnrollments = studentEnrollments.map((enrollment: any) => {
            let progress = 0;
            if (enrollment.completionStatus === "1") {
              progress = 100;
            } else {
              progress = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
            }
            return {
              courseName: enrollment.courseName,
              completionStatus: enrollment.completionStatus,
              progress,
            };
          });

          setEnrollments(processedEnrollments);
        } catch (error) {
          console.error('Error refetching enrollments:', error);
          setModalMessage('Error refetching enrollments. Please try again.');
          onOpen();
        }
      };

      fetchEnrollments();
    } catch (error: any) {
      console.error('Error during enrollment:', error);

      if (error.response && error.response.data && error.response.data.Message) {
        setModalMessage(error.response.data.Message);
      } else if (error.response && error.response.data) {
        setModalMessage(error.response.data);
      } else {
        setModalMessage('An unexpected error occurred. Please try again.');
      }

      onOpen();
    }
  };

  const handleStudentClick = async (studentName: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/Enrollments/GetAllEnrollments');
      const studentEnrollments = response.data.data.filter((enrollment: any) => enrollment.studentName === studentName);

      const processedEnrollments = studentEnrollments.map((enrollment: any) => ({
        courseName: enrollment.courseName,
        completionStatus: enrollment.completionStatus,
        progress: enrollment.completionStatus === "1" ? 100 : Math.floor(Math.random() * (90 - 20 + 1)) + 20,
      }));

      setSelectedStudentEnrollments(processedEnrollments);
      setSelectedStudentName(studentName);
      setStudentModalOpen(true);
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
    }
  };

  const handleCourseClick = async (courseId: number) => {
    try {
      const course = availableCourses.find(c => c.courseId === courseId);
      if (course) {
        setSelectedCourseDetails(course);
        setCourseModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const togglePreviousClasses = () => {
    setIsPreviousClassesOpen(!isPreviousClassesOpen);
  };

  const toggleStudents = () => {
    setIsStudentsOpen(!isStudentsOpen);
  };

  const toggleCourses = () => {
    setIsCoursesOpen(!isCoursesOpen);
  };

  const activeClasses = enrollments.filter((e) => e.completionStatus === '0');
  const previousClasses = enrollments.filter((e) => e.completionStatus === '1');

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'green.500';
    if (progress < 59 && progress > 39) return 'orange.300';
    if (progress < 40 && progress > 0) return 'red.300';
    if (progress < 89 && progress > 59) return 'green.300';
    return 'teal.300';
  };

  // Dynamically set background image based on userType
  const backImage = userType === 1 ? AdminbackImage : StudentbackImage;

  const [currentPage, setCurrentPage] = useState(1);
  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const studentsPerPage = 5; // Number of students per page
  const coursesPerPage = 5; // Number of courses per page

   // Calculate indexes for the current page
   const indexOfLastStudent = currentPage * studentsPerPage;
   const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
   const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
 
   // Calculate total pages
   const totalPages = Math.ceil(students.length / studentsPerPage);


  // Calculate indexes for the current page
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = availableCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalCoursePages = Math.ceil(availableCourses.length / coursesPerPage);



  return (
    <Flex minHeight="100vh" minWidth="100vw"justify="center" align="start" bg="gray.50" p={6} className="gradient-background" >
      
      
      <Box p={8}  width="80%" borderWidth={1} borderRadius="2xl" boxShadow="lg" backgroundColor="whiteAlpha.800">


     {/*{userType === 1 ? 'Admin' : 'Student'} */} 
     <Box bgImage={backImage} bgSize="cover"bgPosition="center"p={10}borderRadius="lg"
              boxShadow="lg"position="relative"height="300px"width="100%"display="flex"
                  flexDirection="column"justifyContent="center"alignItems="center"mb={6}   >

                    

      
  
  
   {/* Logout Button */}
              <Tooltip label="Logout" aria-label="Logout Tooltip" placement="top">
                    <Button
                      position="absolute"
                      top="10px"
                      right="10px"
                      size="sm"
                      padding="10px"
                      color="red.600"
                      onClick={handleLogout}
                      fontSize="3xl"
                    >
                      ➲
                    </Button>
                  </Tooltip>

  {/* User Info on the top-left */}

  <Box position="absolute" top="20px" left="20px" color="white">
    <Heading as="h1" size="md" mb={2} fontWeight="bold" fontFamily="Helvetica"  color="blackAlpha.900">
    {fullName}, 
    </Heading>
    <Heading as="h1" size="md" mb={2} fontFamily="Helvetica" fontSize="xl" color="gray.500">
   <i>{userType === 1 ? 'Admin' : 'Student'}</i>
    </Heading>
    {/* Display the current date and time */}
    <Box textAlign="left" mb={6}>
            <Text fontSize="md" color="black">
              {currentTime.toLocaleDateString()}
            </Text>
            <Text fontSize="md" color="black">
             {currentTime.toLocaleTimeString()}
            </Text>
          </Box>
  </Box>

  {/* Main Heading (Dashboard) centered */}
  

 
</Box>

    
    {/* Add some space between header and the rest of the page */}
    <Box mt={8} />

        
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader><Text></Text>Enrollment Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text ><i>{modalMessage}  !!</i></Text>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {userType === 1 ? (
          <>
            <Box>
      <Flex justifyContent="flex-start" alignItems="center" mb={4}>
        <Heading as="h1" size="lg" mb={4}>
          List of Students  
          <Button size="sm" borderRadius="3xl" onClick={toggleStudents}>
          <i>{isStudentsOpen ? 'Collapse' : 'Expand'}</i> 
        </Button>
        </Heading>
        
       
      </Flex>

      <Collapse in={isStudentsOpen}>
        <Flex overflowX="auto" maxHeight="400px">
          <Table variant="simple" size="md" width="100%">
            <Thead>
              <Tr>
                <Th
                  position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}
                >
                  Student ID
                </Th>
                <Th
                  position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="50%"
                  textAlign="center"
                  zIndex={1}
                >
                  Full Name
                </Th>
                <Th
                  position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="50%"
                  textAlign="center"
                  zIndex={1}
                >
                  Email
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <Tr key={student.studentId}>
                    <Td textAlign="center">{student.studentId}</Td>
                    <Td textAlign="center">
                      <Text
                        as="button"
                        color="blue.500"
                        fontWeight="bold"
                        onClick={() => handleStudentClick(student.fullName)}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {student.fullName}
                      </Text>
                    </Td>
                    <Td textAlign="center">{student.email}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3} textAlign="center">
                    No students found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Flex>

        {/* Pagination Controls */}
        <Flex justifyContent="center" alignItems="center" mt={4}>
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
            colorScheme="Pink" textColor="black" fontSize="2xl"
          >
          <span><i>←</i></span>   
          </Button>

          <Text>
            Page {currentPage} of {totalPages}
          </Text>

          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            colorScheme="Pink" textColor="black" fontSize="2xl"
          >
          <span><i>→</i></span>  
          </Button>
        </Flex>
      </Collapse>
    </Box>

            <Box mt={8}>
              <Flex justifyContent="flex-start" alignItems="center" mb={4}>
              <Heading as="h1" size="lg" mb={4}>
                  List of Courses  
                  <Button size="sm" borderRadius="3xl"onClick={toggleCourses}>
                 <i>{isCoursesOpen ? 'Collapse' : 'Expand'}</i> 
                </Button>
               </Heading>
               
              </Flex>
              <Collapse in={isCoursesOpen}>
                <Flex overflowX="auto" maxHeight="400px">
                  <Table variant="simple" size="md" width="100%">
                    <Thead>
                      <Tr>
                        <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>
                          Course ID
                          </Th>
                        <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>
                          Course Name
                          </Th>
                        <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="lg"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>
                          Description
                          </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <Tr key={course.courseId}>
                  <Td textAlign="center"><Text >{course.courseId}</Text></Td>
                  <Td textAlign="center">
                    <Text
                      as="button"
                      color="blue.500"
                      onClick={() => handleCourseClick(course.courseId)}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      <b>{course.courseName}</b>
                    </Text>
                  </Td>
                  <Td textAlign="center"><Text >{course.description}</Text></Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3} textAlign="center">
                  No courses found.
                </Td>
              </Tr>
            )}
          </Tbody>
                  </Table>
                </Flex>
                
                <Flex justifyContent="center" alignItems="center" mt={4}>
                <Button
          onClick={() => setCurrentCoursePage(currentCoursePage - 1)}
          isDisabled={currentCoursePage === 1}
          colorScheme=""
          textColor="black"
          fontSize="2xl"
        >
          <span><i>←</i></span>
        </Button>

          <Text>
            Page {currentCoursePage} of {totalCoursePages}
          </Text>

          <Button
          onClick={() => setCurrentCoursePage(currentCoursePage + 1)}
          isDisabled={currentCoursePage === totalCoursePages}
          colorScheme=""
          textColor="black"
          fontSize="2xl"
        >
          <span><i>→</i></span>
        </Button>
        </Flex>

                {userType === 1 && (
                  <Flex justifyContent="flex-end" mt={4}>
                    <Button colorScheme="gray" onClick={openAddCourseModal}>
                      Add New Course
                    </Button>
                  </Flex>
                )}
              </Collapse>
            </Box>

            <Modal isOpen={isCourseModalOpen} onClose={closeAddCourseModal} >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Fill in the New Course details</ModalHeader>
                <ModalCloseButton />
                <ModalBody >
                  <FormControl isRequired mb={3}>
                    <FormLabel>Course Name</FormLabel>
                    <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired mb={3} >
                    <FormLabel>Description</FormLabel>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired mb={3}>
                    <FormLabel>Max Seats</FormLabel>
                    <Input type="number" value={maxSeats} onChange={(e) => setMaxSeats(parseInt(e.target.value))} />
                  </FormControl>
                  <FormControl isRequired mb={3}>
                    <FormLabel>Current Seats</FormLabel>
                    <Input type="number" value={currentSeats} onChange={(e) => setCurrentSeats(parseInt(e.target.value))} />
                  </FormControl>
                  <FormControl isRequired mb={3}>
                    <FormLabel>Start Date</FormLabel>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="yyyy-mm-dd"  />
                  </FormControl>
                  <FormControl isRequired mb={3}>
                    <FormLabel>End Date</FormLabel>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="yyyy-mm-dd"  />
                  </FormControl>
                  {errorMessage && <Text color="red.500">{errorMessage}</Text>}
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="blue" onClick={handleAddCourse}>
                    Add
                  </Button>
                  <Button variant="ghost" onClick={closeAddCourseModal} ml={3}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

          </>
        ) : (
          <Stack spacing={6}>
            <Box>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading as="h1" size="lg" mb={4}>
                  Completed Courses<Button size="sm" borderRadius="3xl"onClick={togglePreviousClasses}>
                  {isPreviousClassesOpen ? 'Collapse' : 'Expand'}
                </Button>
                </Heading>
                
              </Flex>
              <Collapse in={isPreviousClassesOpen}>
                <Flex overflowX="auto" direction="row" gap={4}>
                  {previousClasses.length > 0 ? (
                    previousClasses.map((enrollment, index) => (
                      <Box
                        key={index}
                        minWidth="250px"
                        p={4}
                        borderWidth={1}
                        borderRadius="3xl"
                        bg="green.300"
                        textAlign="center"
                      >
                        <Heading size="sm">{enrollment.courseName}</Heading>
                        <Text mt={2}>Progress: {enrollment.progress}%</Text>
                      </Box>
                    ))
                  ) : (
                    <Text>No previous classes found.</Text>
                  )}
                </Flex>
              </Collapse>
            </Box>

            <Box>
              <Heading as="h1" size="md" mb={4}>
                Active Courses
              </Heading>
              <Flex overflowX="auto" direction="row" gap={4}>
                {activeClasses.length > 0 ? (
                  activeClasses.map((enrollment, index) => (
                    <Box
                      key={index}
                      minWidth="250px"
                      p={4}
                      borderWidth={1}
                      borderRadius="3xl"
                      bg={getProgressColor(enrollment.progress!)}
                      textAlign="center"
                    >
                      <Heading size="sm">{enrollment.courseName}</Heading>
                      <Text mt={2}>Progress: {enrollment.progress}%</Text>
                    </Box>
                  ))
                ) : (
                  <Text>No active classes found.</Text>
                )}
              </Flex>
            </Box>

            <Box>
              <Heading as="h1" size="md" mb={4}>
                Available Classes
              </Heading>

              <Flex overflowX="auto" maxHeight="400px">
                <Table variant="simple" size="md" width="100%">
                  <Thead>
                    <Tr>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>Course Name</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>Description</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>Max Seats</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>Current Seats</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>Start Date</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}>End Date</Th>
                      <Th position="sticky"
                  top={0}
                  bg="blue.800"
                  color="white"
                  fontSize="md"
                  textTransform="uppercase"
                  fontWeight="bold"
                  width="25%"
                  textAlign="center"
                  zIndex={1}></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {availableCourses.length > 0 ? (
                      availableCourses.map((course) => (
                        <Tr key={course.courseId}>
                          <Td>{course.courseName}</Td>
                          <Td>{course.description}</Td>
                          <Td>{course.maxSeats}</Td>
                          <Td>{course.currentSeats}</Td>
                          <Td>{new Date(course.startDate).toLocaleDateString()}</Td>
                          <Td>{new Date(course.endDate).toLocaleDateString()}</Td>
                          <Td>
                            <Button colorScheme="blue" size="sm" onClick={() => handleEnroll(course.courseName)}>
                              Enroll
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center">
                          No available classes.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Flex>
            </Box>
          </Stack>
        )}

       

{/* starting of the editing modal modal */}

<Modal isOpen={studentModalOpen} onClose={() => setStudentModalOpen(false)}>
  <ModalOverlay />
    
  <ModalContent overflowX="auto" borderRadius="lg" boxShadow="dark-lg" maxWidth="600px" maxHeight="700px"  borderWidth="5px">
    {/* Header section: Student Details */}
    <Box maxW="100%">
      <Image src={studentImage} alt="studen_avatar" height="550px" width="100%"/>

      <Box p="4" width="100%" height="100px">
        <HStack>
          <Badge color="white" variant="solid">
            Student
          </Badge>
        </HStack>
        
        <Text fontWeight="medium"  fontSize="4xl" color="Black">
          {selectedStudentName}
        </Text>
       
        
      </Box>

    </Box>

    {/* Enrollment Details */}
    <ModalBody>
  <Text fontWeight="bold" fontSize="2xl" color="black" mb={4}>
    Enrolled Courses
  </Text>

  {selectedStudentEnrollments.length > 0 ? (
    <Box position="relative" overflow="hidden" maxW="100%" pb={4}>
      {/* Left Scroll Arrow */}
      <Button
        position="absolute"
        left={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        bg="rgba(0, 0, 0, 0.0)"
        color="white"
        _hover={{ bg: "black" }}
        onClick={() => {
          const container = document.querySelector('.carousel-container');
          container?.scrollBy({ left: 250, behavior: 'smooth' });
        }}
      >
        ◀
      </Button>

      {/* Scrollable Content */}
      <Flex
        gap={6}
        as="div"
        className="carousel-container"
        display="flex"
        justifyContent="start"
        alignItems="center"
        overflowX="auto"
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {selectedStudentEnrollments.map((enrollment, index) => (
          <Box
            key={index}
            p={4}
            minW="250px"
            height="200px"
            borderWidth={1}
            borderRadius="3xl"
            bg={getProgressColor(enrollment.progress!)}
            boxShadow="md"
            transition="transform 0.3s ease-in-out"
            _hover={{
              transform: 'rotateY(10deg) scale(1.05)',
              boxShadow: 'lg',
            }}
            cursor="pointer"
          >
            <Heading size="xl" mb={2} color="white">
              {enrollment.courseName}
            </Heading>

            <Text color="white" fontSize="larger">
             <b>Status:</b>  {enrollment.completionStatus === '1' ? 'Completed' : 'In Progress'}
            </Text>
            <Text color="white" fontSize="sm">
              <b>Progress: </b>{enrollment.progress}%
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Right Scroll Arrow */}
      <Button
        position="absolute"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        bg="rgba(0, 0, 0, 0.0)"
        color="white"
        _hover={{ textColor:"black", fontSize:"3xl" }}
        onClick={() => {
          const container = document.querySelector('.carousel-container');
          container?.scrollBy({ left: 250, behavior: 'smooth' });
        }}
      >
        ▶
      </Button>
    </Box>
  ) : (
    <Text>No enrollments found for this student.</Text>
  )}
  <ModalCloseButton />
</ModalBody>


    {/* Modal Footer */}
  
  </ModalContent>
</Modal>


{/* ending of editing modal  */}


        <Modal
        isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} >
  <ModalOverlay />
  <ModalContent overflowX="auto" borderRadius="lg" boxShadow="dark-lg" maxWidth="600px" maxHeight="700px"  borderWidth="5px" p={5}>
    <ModalHeader textStyle="5xl" fontWeight="bold">
      {selectedCourseDetails?.courseName} Details
    </ModalHeader>
    <ModalCloseButton />
    <ModalBody>

      {selectedCourseDetails ? (
        <Stack spacing={4}>
          {/* Adding an optional image like the card design */}
          <Image src={courseImage} alt="studen_avatar" height="30%px" width="100%"/>
          
          
          <Text fontSize="2xl"><strong>Description:</strong> {selectedCourseDetails.description}</Text>
          <Text fontSize="lg"><strong>Max Seats:</strong> {selectedCourseDetails.maxSeats}</Text>
          <Text fontSize="lg"><strong>Current Seats:</strong> {selectedCourseDetails.currentSeats}</Text>
          <Text fontSize="xl"><strong>Start Date:</strong> {new Date(selectedCourseDetails.startDate).toLocaleDateString()}</Text>
          <Text fontSize="xl"><strong>End Date:</strong> {new Date(selectedCourseDetails.endDate).toLocaleDateString()}</Text>
         
         
          <Button colorScheme="pink" size="md" padding="5px">
            <strong>Update Course</strong>
          </Button>

        </Stack>
      ) : (
        <Text>No details available for this course.</Text>
      )}

    </ModalBody>
    
  </ModalContent>
</Modal>

      </Box>
    </Flex>
  );
};

export default Dashboard;
