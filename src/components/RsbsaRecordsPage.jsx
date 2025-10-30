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
  const itemsPerPage = 30;

  // State for database data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrants();
  }, []);

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
      
      setRecords(formattedRecords);
    } catch (err) {
      console.error('❌ Error fetching registrants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function - Only show Purok and Barangay
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
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleDeleteRecords = () => {
    setRecords(records.filter(record => !selectedRecords.includes(record.id)));
    setSelectedRecords([]);
    setShowDeleteModal(false);
    setShowDeleteMode(false);
    setDeleteReason('');
  };

  const handleViewRecord = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Created': return 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70';
      case 'Updating': return 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70';
      case 'Updated': return 'bg-green-900/50 text-green-300 hover:bg-green-900/70';
      default: return 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Farmer': return 'bg-green-900/50 text-green-300 hover:bg-green-900/70';
      case 'Fisherfolk': return 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70';
      case 'Farm Worker/Laborer': return 'bg-orange-900/50 text-orange-300 hover:bg-orange-900/70';
      case 'Agri-Youth': return 'bg-red-900/50 text-red-300 hover:bg-red-900/70';
      default: return 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70';
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-[#252525] rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}>
          <div className="flex items-center justify-between p-4 border-b border-[#3B3B3B]">
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-[#252525] border-[#3B3B3B]">
        {/* Header with Title, Search, and Buttons */}
        <CardHeader className="border-b border-[#3B3B3B]">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-gray-200">RSBSA Records</CardTitle>
            
            {/* Search and Action Buttons */}
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by Name, RSBSA No., or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 bg-[#1A1A1A] border-[#3B3B3B] text-gray-200"
              />
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-gray-200"
              >
                <i className="fas fa-filter mr-2"></i>
                Filters
              </Button>
              <Button
                onClick={() => setShowDeleteMode(!showDeleteMode)}
                className={`${showDeleteMode ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3B3B3B] hover:bg-[#4B4B4B]'} text-gray-200`}
              >
                <i className="fas fa-trash mr-2"></i>
                {showDeleteMode ? 'Cancel' : 'Delete'}
              </Button>
              <Button
                onClick={fetchRegistrants}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                title="Refresh"
              >
                <i className="fas fa-sync"></i>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400 text-lg">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading records from database...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-md mb-4">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Error loading records: {error}
              <button 
                onClick={fetchRegistrants}
                className="ml-4 underline hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Filters - Collapsible */}
              {showFilters && (
                <div className="bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-[#252525] border border-[#3B3B3B] rounded px-3 py-2 text-gray-200"
                      >
                        <option value="all">All Types</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Fisherfolk">Fisherfolk</option>
                        <option value="Agri-Youth">Agri-Youth</option>
                        <option value="Farm Worker/Laborer">Farm Worker/Laborer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-[#252525] border border-[#3B3B3B] rounded px-3 py-2 text-gray-200"
                      >
                        <option value="all">All Status</option>
                        <option value="Created">Created</option>
                        <option value="Updating">Updating</option>
                        <option value="Updated">Updated</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Mode Actions */}
              {showDeleteMode && selectedRecords.length > 0 && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">
                      {selectedRecords.length} record(s) selected
                    </span>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Records Table with Bold Headers and Thicker Border */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-3 border-[#FFFFFF]">
                      {showDeleteMode && (
                        <TableHead className="text-gray-400 font-bold">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                            className="w-4 h-4"
                          />
                        </TableHead>
                      )}
                      <TableHead className="text-gray-200 font-bold">RSBSA No.</TableHead>
                      <TableHead className="text-gray-200 font-bold">Name</TableHead>
                      <TableHead className="text-gray-200 font-bold">Address</TableHead>
                      <TableHead className="text-gray-200 font-bold">Type</TableHead>
                      <TableHead className="text-gray-200 font-bold">Registered On</TableHead>
                      <TableHead className="text-gray-200 font-bold">Modified On</TableHead>
                      <TableHead className="text-gray-200 font-bold">Modified By</TableHead>
                      <TableHead className="text-gray-200 font-bold">Status</TableHead>
                      <TableHead className="text-gray-200 font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow 
                        key={record.id} 
                        className="border-[#3B3B3B] hover:bg-white/5 transition-colors duration-150"
                      >
                        {showDeleteMode && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => handleSelectRecord(record.id)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                        )}
                        <TableCell className="text-gray-300 font-mono text-sm">{record.id}</TableCell>
                        <TableCell className="text-gray-200 font-medium">{record.name}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{record.address}</TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(record.type)}>
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">{record.registeredOn}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{record.modifiedOn}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{record.modifiedBy}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewRecord(record)}
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 text-sm"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </Button>
                            <Button
                              className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1 text-sm"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-gray-200 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-[#3B3B3B] text-gray-200'} hover:bg-blue-700`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-gray-200 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete {selectedRecords.length} selected record(s)? This action cannot be undone.
          </p>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Reason for deletion:</label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3B3B3B] rounded px-3 py-2 text-gray-200"
              rows="3"
              placeholder="Enter reason..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRecords}
              disabled={!deleteReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Record Modal */}
      {viewingRecord && (
        <Modal
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Record Details"
          size="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">RSBSA No.</label>
                <p className="text-gray-200 font-mono">{viewingRecord.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-gray-200">{viewingRecord.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Address</label>
                <p className="text-gray-200">{viewingRecord.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Phone</label>
                <p className="text-gray-200">{viewingRecord.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <Badge className={getTypeBadgeColor(viewingRecord.type)}>{viewingRecord.type}</Badge>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <Badge className={getStatusBadgeColor(viewingRecord.status)}>{viewingRecord.status}</Badge>
              </div>
              {viewingRecord.crops && viewingRecord.crops !== 'N/A' && (
                <div>
                  <label className="text-sm text-gray-400">Crops</label>
                  <p className="text-gray-200">{viewingRecord.crops}</p>
                </div>
              )}
              {viewingRecord.farmSize && viewingRecord.farmSize !== 'N/A' && (
                <div>
                  <label className="text-sm text-gray-400">Farm Size</label>
                  <p className="text-gray-200">{viewingRecord.farmSize}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400">Registered On</label>
                <p className="text-gray-200">{viewingRecord.registeredOn}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Modified On</label>
                <p className="text-gray-200">{viewingRecord.modifiedOn}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RsbsaRecordsPage;
