import React, { useState, useEffect } from "react";
import { Box, VStack, Heading, Text, SimpleGrid, Badge, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Select, Textarea, useToast, Spinner, Center, HStack, Icon, Flex, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { FaLaptop, FaCar, FaTools, FaPencilAlt, FaSimCard, FaTshirt, FaBox, FaHistory } from "react-icons/fa";
import http from "../apis/http";

const assetIcons = {
  Electronics: FaLaptop,
  Vehicle: FaCar,
  Tools: FaTools,
  Stationery: FaPencilAlt,
  "Sim Card": FaSimCard,
  Uniform: FaTshirt,
  Other: FaBox
};

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchMyAssets();
    fetchEmployees();
  }, []);

  const fetchMyAssets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("managerUser"));
      const userId = user?._id || user?.id;
      
      if (!userId) {
        toast({ title: "Error", description: "User not found", status: "error", duration: 3000 });
        setLoading(false);
        return;
      }
      const { data } = await http.get(`/employee-assets/my-assets/${userId}`);
      setAssets(data.assets);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to fetch assets", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await http.get("/employees");
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const handleReassign = (asset) => {
    setSelectedAsset(asset);
    setNewEmployeeId("");
    setRemarks("");
    onOpen();
  };

  const submitReassign = async () => {
    try {
      await http.post(`/employee-assets/${selectedAsset._id}/reassign`, {
        newEmployeeId: newEmployeeId || null,
        remarks
      });
      toast({ title: "Success", description: newEmployeeId ? "Asset re-assigned successfully" : "Asset returned to admin", status: "success", duration: 3000 });
      fetchMyAssets();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to re-assign", status: "error", duration: 3000 });
    }
  };

  if (loading) {
    return <Center h="50vh"><Spinner size="xl" color="blue.500" /></Center>;
  }

  return (
    <VStack spacing={8} align="stretch" w="full" pb={10}>
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="900" color="gray.800">My Assets</Heading>
          <Text color="gray.500" fontSize="sm">Assets assigned to you</Text>
        </VStack>
        <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="lg">{assets.length} Assets</Badge>
      </Flex>

      {assets.length === 0 ? (
        <Box bg="white" p={10} borderRadius="2xl" textAlign="center" shadow="sm">
          <Text color="gray.500">No assets assigned to you</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {assets.map((asset) => (
            <Box key={asset._id} bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="sm" _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }} transition="all 0.3s">
              <HStack justify="space-between" mb={4}>
                <Icon as={assetIcons[asset.assetType] || FaBox} fontSize="2xl" color="blue.500" />
                <Badge colorScheme={asset.condition === "New" ? "green" : asset.condition === "Good" ? "blue" : "orange"}>{asset.condition}</Badge>
              </HStack>
              <Heading size="md" mb={2} color="gray.800">{asset.assetName}</Heading>
              <Text fontSize="sm" color="gray.500" mb={1}>ID: {asset.uniqueId}</Text>
              <Text fontSize="sm" color="gray.500" mb={1}>Type: {asset.assetType}</Text>
              {asset.modelNumber && <Text fontSize="sm" color="gray.500" mb={3}>Model: {asset.modelNumber}</Text>}
              <HStack spacing={2} mt={4}>
                <Button size="sm" colorScheme="blue" onClick={() => handleReassign(asset)} flex={1}>Re-assign</Button>
                <Button size="sm" colorScheme="purple" variant="outline" onClick={() => { setSelectedAsset(asset); onHistoryOpen(); }} leftIcon={<FaHistory />}>History</Button>
                <Button size="sm" colorScheme="red" variant="outline" onClick={() => { setSelectedAsset(asset); setNewEmployeeId(""); setRemarks(""); onOpen(); }}>Return to Admin</Button>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Re-assign Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Asset: {selectedAsset?.assetName}</Text>
                <Text fontSize="sm" color="gray.500">ID: {selectedAsset?.uniqueId}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>Re-assign to Employee (or leave empty to return to admin)</Text>
                <Select placeholder="Select employee or leave empty for admin" value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)}>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} - {emp.email}</option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>Remarks</Text>
                <Textarea placeholder="Add remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={submitReassign}>{newEmployeeId ? "Re-assign" : "Return to Admin"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Asset History - {selectedAsset?.assetName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Asset Details</Text>
                <HStack spacing={4}>
                  <Text fontSize="sm">ID: {selectedAsset?.uniqueId}</Text>
                  <Text fontSize="sm">Type: {selectedAsset?.assetType}</Text>
                  <Badge colorScheme="blue">{selectedAsset?.condition}</Badge>
                </HStack>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>Assignment History</Text>
                {selectedAsset?.assignmentHistory?.length > 0 ? (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Employee</Th>
                        <Th>Assigned Date</Th>
                        <Th>Return Date</Th>
                        <Th>Condition</Th>
                        <Th>Remarks</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedAsset.assignmentHistory.map((history, idx) => (
                        <Tr key={idx}>
                          <Td>{history.employeeName}</Td>
                          <Td>{new Date(history.assignedDate).toLocaleDateString()}</Td>
                          <Td>{new Date(history.returnDate).toLocaleDateString()}</Td>
                          <Td><Badge colorScheme={history.conditionOnreturn === "Good" ? "green" : "orange"}>{history.conditionOnreturn}</Badge></Td>
                          <Td>{history.remarks || "-"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500" fontSize="sm">No history available</Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onHistoryClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MyAssets;
