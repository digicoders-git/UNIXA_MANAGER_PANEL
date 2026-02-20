import React, { useState, useEffect } from "react";
import { Box, VStack, Heading, Text, Select, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, Center, Icon } from "@chakra-ui/react";
import { FaHistory, FaFilter, FaLaptop, FaCar, FaTools, FaBox } from "react-icons/fa";
import http from "../apis/http";

const assetIcons = {
  Electronics: FaLaptop,
  Vehicle: FaCar,
  Tools: FaTools,
  Other: FaBox
};

const AssetsHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, [period, status]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period !== "All") params.append("period", period);
      if (status !== "All") params.append("status", status);
      
      const { data } = await http.get(`/employee-assets/history?${params.toString()}`);
      setHistory(data.history || []);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Center h="50vh"><Spinner size="xl" color="blue.500" /></Center>;
  }

  return (
    <VStack spacing={8} align="stretch" w="full" pb={10}>
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="900" color="gray.800"><Icon as={FaHistory} mr={2} color="purple.600" />Assets History</Heading>
          <Text color="gray.500" fontSize="sm">Track all asset assignments and returns</Text>
        </VStack>
        <HStack spacing={3}>
          <HStack>
            <Icon as={FaFilter} color="gray.500" />
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} size="sm" w="150px">
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Year">This Year</option>
            </Select>
          </HStack>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} size="sm" w="180px">
            <option value="All">All Status</option>
            <option value="Assigned">Currently Assigned</option>
            <option value="Returned">Returned</option>
          </Select>
        </HStack>
      </HStack>

      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden" shadow="sm">
        {history.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text color="gray.500">No history found</Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Asset Details</Th>
                <Th>Employee</Th>
                <Th>Assigned Date</Th>
                <Th>Return Date</Th>
                <Th>Condition</Th>
                <Th>Status</Th>
                <Th>Remarks</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((item, idx) => (
                <Tr key={idx} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <HStack spacing={2}>
                      <Icon as={assetIcons[item.assetType] || FaBox} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold">{item.assetName}</Text>
                        <Text fontSize="xs" color="gray.500">ID: {item.assetId}</Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td><Text fontWeight="medium">{item.employeeName}</Text></Td>
                  <Td><Text fontSize="sm">{new Date(item.assignedDate).toLocaleDateString()}</Text></Td>
                  <Td>
                    {item.returnDate ? (
                      <Text fontSize="sm">{new Date(item.returnDate).toLocaleDateString()}</Text>
                    ) : (
                      <Text fontSize="sm" color="blue.600" fontWeight="bold">-</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={item.conditionOnreturn === "New" ? "green" : item.conditionOnreturn === "Good" ? "blue" : "orange"}>
                      {item.conditionOnreturn}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={!item.returnDate ? "blue" : "gray"}>
                      {!item.returnDate ? "Assigned" : "Returned"}
                    </Badge>
                  </Td>
                  <Td><Text fontSize="sm" color="gray.600">{item.remarks || "-"}</Text></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </VStack>
  );
};

export default AssetsHistory;
