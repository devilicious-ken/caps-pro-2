import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ApiService from '../services/api';

const RsbsaRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for database data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrants();
  }, []);

  // ✅ Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  // Fetch function
  const fetchRegistrants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getRegistrants();
      console.log('✅ Fetched registrants:', data);

      // Transform database data to match UI format
      const formattedRecords = data.map(registrant => ({
        id: registrant.reference_no || `RS-${registrant.id.slice(0, 8)}`,
        dbId: registrant.id,
        name: [registrant.first_name, registrant.middle_name, registrant.surname]
          .filter(Boolean)
          .join(' '),
        address: formatAddress(registrant.addresses?.[0]),
        type: formatRegistryType(registrant.registry),
        registeredOn: formatDate(registrant.created_at),
        modifiedOn: formatDate(registrant.updated_at),
        modifiedBy: 'System',
        status: 'Created',
        crops: registrant.crops?.map(c => c.name).join(', ') || 'N/A',
        farmSize: calculateTotalFarmSize(registrant.farm_parcels),
        phone: registrant.mobile_number || 'N/A',
        coordinates: 'N/A',
        fullData: registrant
      }));

      // ✅ Remove duplicates based on dbId (unique database ID)
      const uniqueRecords = formattedRecords.filter((record, index, self) =>
        index === self.findIndex((r) => r.dbId === record.dbId)
      );

      console.log('✅ Total records:', formattedRecords.length);
      console.log('✅ Unique records:', uniqueRecords.length);

      setRecords(uniqueRecords);
    } catch (err) {
      console.error('❌ Error fetching registrants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return [address.purok, address.barangay]
      .filter(Boolean)
      .join(', ');
  };

  const formatRegistryType = (registry) => {
    const types = {
      'farmer': 'Farmer',
      'fisherfolk': 'Fisherfolk',
      'agri_youth': 'Agri-Youth',
      'farm_worker': 'Farm Worker/Laborer'
    };
    return types[registry] || registry;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateTotalFarmSize = (parcels) => {
    if (!parcels || parcels.length === 0) return 'N/A';
    const total = parcels.reduce((sum, p) => sum + (parseFloat(p.total_farm_area_ha) || 0), 0);
    return `${total.toFixed(2)} hectares`;
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecords(paginatedRecords.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (recordId) => {
    if (selectedRecords.includes(recordId)) {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    } else {
      setSelectedRecords([...selectedRecords, recordId]);
    }
  };

  // ✅ FIXED: Delete records with proper checkbox clearing
  const handleDeleteRecords = async () => {
    try {
      setIsDeleting(true);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const ipAddress = await ApiService.getUserIpAddress();
  
      const recordsToDelete = records.filter(r => selectedRecords.includes(r.id));
  
      for (const record of recordsToDelete) {
        await ApiService.softDeleteRegistrant(
          record.dbId,
          currentUser.id,
          deleteReason || 'No reason provided'
        );
  
        await ApiService.createActivityLog(
          currentUser.id,
          `${currentUser.first_name} ${currentUser.last_name}`,
          'Delete',
          `${record.id} (${record.name})`,
          ipAddress
        );
      }
  
      setRecords(records.filter(record => !selectedRecords.includes(record.id)));
      setShowDeleteModal(false);
      setShowDeleteMode(false);
      setDeleteReason('');
      setIsDeleting(false);
  
      setSuccessMessage(`Successfully deleted ${recordsToDelete.length} record(s)`);
      setShowSuccessModal(true);
  
    } catch (error) {
      console.error('Error deleting records:', error);
      setIsDeleting(false);
      
      setErrorMessage(error.message || 'Failed to delete records. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleViewRecord = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Created':
        return 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70';
      case 'Updating':
        return 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70';
      case 'Updated':
        return 'bg-green-900/50 text-green-300 hover:bg-green-900/70';
      default:
        return 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Farmer':
        return 'bg-green-900/50 text-green-300 hover:bg-green-900/70';
      case 'Fisherfolk':
        return 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70';
      case 'Farm Worker/Laborer':
        return 'bg-orange-900/50 text-orange-300 hover:bg-orange-900/70';
      case 'Agri-Youth':
        return 'bg-red-900/50 text-red-300 hover:bg-red-900/70';
      default:
        return 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70';
    }
  };

  const Modal = ({ show, onClose, title, children, size = "md" }) => {
    if (!show) return null;
  
    const sizeClasses = {
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-2xl"
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`bg-[#252525] border border-[#333333] rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 relative`}>
          <div className="flex items-center justify-between p-4 border-b border-[#333333]">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#333333]"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-300">Loading records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-red-300 mb-4">{error}</p>
          <Button onClick={fetchRegistrants} className="bg-blue-600 hover:bg-blue-700">
            <i className="fas fa-sync mr-2"></i> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">RSBSA Records</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#444444] hover:bg-[#555555] text-white"
          >
            <i className="fas fa-filter mr-2"></i> Filters
          </Button>
          {!showDeleteMode ? (
            <Button 
              onClick={() => setShowDeleteMode(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <i className="fas fa-trash mr-2"></i> Delete Records
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setShowDeleteModal(true)}
                disabled={selectedRecords.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                <i className="fas fa-trash mr-2"></i> Delete Selected ({selectedRecords.length})
              </Button>
              <Button 
                onClick={() => {
                  setShowDeleteMode(false);
                  setSelectedRecords([]);
                }}
                className="bg-[#444444] hover:bg-[#555555] text-white"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-[#1e1e1e] border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Fisherfolk">Fisherfolk</option>
                  <option value="Farm Worker/Laborer">Farm Worker/Laborer</option>
                  <option value="Agri-Youth">Agri-Youth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#252525] border border-[#333333] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Created">Created</option>
                  <option value="Updating">Updating</option>
                  <option value="Updated">Updated</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                  className="w-full bg-[#444444] hover:bg-[#555555] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-[#1e1e1e] border-0">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <Input
              type="text"
              placeholder="Search by name, ID, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#252525] border-[#333333] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#1e1e1e] border-0">
        <CardHeader>
          <CardTitle className="text-white">Registrant Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#252525]">
                <TableRow>
                  {showDeleteMode && (
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                        className="w-4 h-4 rounded border-gray-600 bg-[#333333] focus:ring-blue-500"
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-gray-300">Reference ID</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Address</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-300">Registered On</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showDeleteMode ? 9 : 8} className="text-center text-gray-400 py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.dbId} className="border-t border-[#333333] hover:bg-[#252525]">
                      {showDeleteMode && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRecords.includes(record.id)}
                            onChange={() => handleSelectRecord(record.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-[#333333] focus:ring-blue-500"
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-gray-400 font-mono text-sm">{record.id}</TableCell>
                      <TableCell className="text-gray-200">{record.name}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{record.address}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(record.type)}>
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{record.phone}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{record.registeredOn}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <i className="fas fa-eye mr-1"></i> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#333333]">
              <p className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="px-4 py-2 text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
        title="Confirm Deletion"
        size="md"
      >
        <div className="space-y-4">
          {isDeleting && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-white mb-3"></i>
                <p className="text-white font-medium">Deleting records...</p>
              </div>
            </div>
          )}
          
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <p className="text-red-300">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Are you sure you want to delete {selectedRecords.length} selected record(s)? 
              This will move them to the deleted records section.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Deletion (Optional)
            </label>
            <textarea
              placeholder="Enter reason for deletion..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              className="w-full bg-[#333333] border border-[#444444] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
              style={{ height: '120px', resize: 'vertical' }}
              disabled={isDeleting}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteReason('');
              }}
              className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRecords}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash mr-2"></i> Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Record Modal */}
      {showViewModal && viewingRecord && (
        <Modal
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Record Details"
          size="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Reference ID</label>
                <p className="text-white font-mono">{viewingRecord.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <p><Badge className={getTypeBadgeColor(viewingRecord.type)}>{viewingRecord.type}</Badge></p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Full Name</label>
                <p className="text-white">{viewingRecord.name}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Address</label>
                <p className="text-white">{viewingRecord.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Phone</label>
                <p className="text-white">{viewingRecord.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Farm Size</label>
                <p className="text-white">{viewingRecord.farmSize}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Crops</label>
                <p className="text-white">{viewingRecord.crops}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Registered On</label>
                <p className="text-white">{viewingRecord.registeredOn}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Last Modified</label>
                <p className="text-white">{viewingRecord.modifiedOn}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-[#333333]">
              <Button
                onClick={() => setShowViewModal(false)}
                className="bg-[#444444] hover:bg-[#555555] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSelectedRecords([]);
        }}
        title="Success"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-4xl text-green-400"></i>
            </div>
          </div>
          <p className="text-center text-gray-300 text-lg">
            {successMessage}
          </p>
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedRecords([]);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-circle text-4xl text-red-400"></i>
            </div>
          </div>
          <p className="text-center text-gray-300 text-lg">
            {errorMessage}
          </p>
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RsbsaRecordsPage;
