import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, CheckCircle } from "lucide-react";
import ApiService from '../services/api';  // <-- ADDED ONLY THIS LINE

const RegisterPage = ({ user }) => {  // <-- ADDED user prop
  const [registryType, setRegistryType] = useState('farmer');
  const [activeTab, setActiveTab] = useState('personal');
  const [isHouseholdHead, setIsHouseholdHead] = useState(true);
  const [civilStatus, setCivilStatus] = useState('');
  const [sameAsPermAddress, setSameAsPermAddress] = useState(false);
  const [hasGovId, setHasGovId] = useState(false);
  const [isPwd, setIsPwd] = useState(false);
  const [is4ps, setIs4ps] = useState(false);
  const [isIndigenous, setIsIndigenous] = useState(false);
  const [isMemberCoop, setIsMemberCoop] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [isRiceChecked, setIsRiceChecked] = useState(false);
  const [isCornChecked, setIsCornChecked] = useState(false);
  const [cornType, setCornType] = useState('');
  const [riceValue, setRiceValue] = useState('');
  const [cornValue, setCornValue] = useState('');
  
  // Dynamic form arrays
  // Your farmParcels state should store all the field data
const [farmParcels, setFarmParcels] = useState([{ 
  id: Date.now(),
  farmer_rotation: '',
  farm_location: '',
  total_area: '',
  ownership_doc: '',
  ownership_doc_no: '',
  ownership_type: '',
  ancestral_domain: '',
  agrarian_reform: ''
}]);

const [parcelInfo, setParcelInfo] = useState([{ 
  id: Date.now(),
  crop_commodity: '',
  size: '',
  head_count: '',
  farm_type: '',
  organic: '',
  remarks: ''
}]);
  const [otherCrops, setOtherCrops] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [poultry, setPoultry] = useState([]);
  const [fishingActivities, setFishingActivities] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [involvementTypes, setInvolvementTypes] = useState([]);
  const [religion, setReligion] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedPurok, setSelectedPurok] = useState('');
  const [selectedBarangayPresent, setSelectedBarangayPresent] = useState('');
  const [selectedPurokPresent, setSelectedPurokPresent] = useState('');

// Form data states for preview
const [formInputs, setFormInputs] = useState({
  reference_no: '',
  surname: '',
  first_name: '',
  middle_name: '',
  extension_name: '',
  sex: '',
  mobile_number: '',
  landline_number: '',
  date_of_birth: '',
  place_of_birth: '',
  mother_full_name: '',
  spouse_name: '',
  perm_street: '',
  perm_municipality_city: '',
  perm_province: '',
  perm_region: '',
  pres_street: '',
  pres_municipality_city: '',
  pres_province: '',
  pres_region: '',
  highest_education: '',
  rsbsa_reference_no: '',
  tin_number: '',
  profession: '',
  source_of_funds: '',
  income_farming: '',
  income_non_farming: '',
});

const [fishingCheckboxes, setFishingCheckboxes] = useState({
  fish_capture: false,
  aquaculture: false,
  gleaning: false,
  fish_processing: false,
  fish_vending: false
});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormInputs(prev => ({
    ...prev,
    [name]: value
  }));
};



  // <-- ADDED: Submission states (ONLY 2 LINES)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const getPurokOptions = (barangay) => {
    if (barangay === 'Upper Jasaan') {
      return ['Purok 5', 'Purok 6', 'Purok 7', 'Purok 8', 'Purok 9'];
    } else if (barangay === 'Lower Jasaan') {
      return ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 10', 'Purok 11'];
    }
    return [];
  };

  const addFormItem = (setter, currentArray) => {
    if (currentArray.length < 3) {
      const newId = Math.max(...currentArray.map(item => item.id)) + 1;
      setter([...currentArray, { id: newId }]);
    }
  };

  const removeFormItem = (setter, currentArray, id) => {
    if (currentArray.length > 1) {
      setter(currentArray.filter(item => item.id !== id));
    }
  };

  const addParcelInfo = () => {
    if (parcelInfo.length < 5) {
      setParcelInfo([...parcelInfo, { 
        id: Date.now(),
        crop_commodity: '',
        size: '',
        head_count: '',
        farm_type: '',
        organic: '',
        remarks: ''
      }]);
    }
  };
  

  const removeParcelInfo = (id) => {
    if (parcelInfo.length > 1) {
      setParcelInfo(parcelInfo.filter(item => item.id !== id));
    }
  };

// Load sample data function - for testing


  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      // ❌ REMOVE THIS - Don't query DOM anymore
      // const formData = {};
      // document.querySelectorAll('input, select, textarea').forEach(el => {
      //   if (el.name) formData[el.name] = el.value;
      // });
  
      console.log('Form data:', formInputs); // ✅ Log state instead
  
      // 1. CREATE REGISTRANT - Read from formInputs state
      const registrantData = {
        user_id: null,
        registry: registryType,
        surname: formInputs.surname || null,
        first_name: formInputs.first_name || null,
        middle_name: formInputs.middle_name || null,
        extension_name: formInputs.extension_name || null,
        sex: formInputs.sex || null,
        mobile_number: formInputs.mobile_number || null,
        landline_number: formInputs.landline_number || null,
        date_of_birth: formInputs.date_of_birth || null,
        place_of_birth: formInputs.place_of_birth || null,
        religion: religion || null,
        civil_status: civilStatus || null,
        spouse_name: civilStatus === 'Married' ? formInputs.spouse_name : null,
        mother_full_name: formInputs.mother_full_name || null,
        is_household_head: isHouseholdHead,
        household_members_count: !isHouseholdHead ? parseInt(formInputs.household_members_count) || null : null,
        household_males: !isHouseholdHead ? parseInt(formInputs.household_males) || null : null,
        household_females: !isHouseholdHead ? parseInt(formInputs.household_females) || null : null,
        is_pwd: isPwd,
        is_4ps: is4ps,
        is_indigenous: isIndigenous,
        indigenous_group_name: isIndigenous ? formInputs.indigenous_group_name : null,
        has_government_id: hasGovId,
        government_id_type: hasGovId ? formInputs.government_id_type : null,
        government_id_number: hasGovId ? formInputs.government_id_number : null,
        is_member_coop: isMemberCoop,
        coop_name: isMemberCoop ? formInputs.coop_name : null,
        emergency_contact_name: formInputs.emergency_contact_name || null,
        emergency_contact_phone: formInputs.emergency_contact_phone || null,
        highest_education: formInputs.highest_education || null,
      };
  
      const registrant = await ApiService.createRegistrant(registrantData);
      console.log('✅ Registrant created:', registrant.id);
  
      // 2. CREATE ADDRESSES - Read from state variables
      const addresses = [{
        registrant_id: registrant.id,
        kind: 'permanent',
        barangay: selectedBarangay || null,
        purok: selectedPurok || null,
        municipality_city: formInputs.perm_municipality_city || null,
        street: formInputs.perm_street || null,
        province: formInputs.perm_province || null,
        region: formInputs.perm_region || null,
      }];
  
      if (!sameAsPermAddress) {
        addresses.push({
          registrant_id: registrant.id,
          kind: 'present',
          barangay: selectedBarangayPresent || null,
          purok: selectedPurokPresent || null,
          municipality_city: formInputs.pres_municipality_city || null,
          street: formInputs.pres_street || null,
          province: formInputs.pres_province || null,
          region: formInputs.pres_region || null,
        });
      }
  
      await ApiService.createAddress(addresses);
      console.log('✅ Addresses created');
  
      // 3. CREATE FINANCIAL INFO - Read from formInputs state
      const financialData = {
        registrant_id: registrant.id,
        rsbsa_reference_no: formInputs.rsbsa_reference_no || null,
        tin_number: formInputs.tin_number || null,
        profession: formInputs.profession || null,
        source_of_funds: formInputs.source_of_funds || null,
        income_farming: formInputs.income_farming ? parseFloat(formInputs.income_farming) : null,
        income_non_farming: formInputs.income_non_farming ? parseFloat(formInputs.income_non_farming) : null,
      };
  
      await ApiService.createFinancialInfo(financialData);
      console.log('✅ Financial info created');
  
      // 4. CREATE CROPS (Rice, Corn, Other Crops)
      const cropsToSave = [];
      
      if (isRiceChecked && riceValue) {
        cropsToSave.push({
          registrant_id: registrant.id,
          name: 'Rice',
          value_text: riceValue,
          corn_type: null
        });
      }
      
      if (isCornChecked && cornValue) {
        cropsToSave.push({
          registrant_id: registrant.id,
          name: 'Corn',
          value_text: cornValue,
          corn_type: cornType || null
        });
      }
      
      // ✅ CORRECT
otherCrops.forEach(crop => {
  if (crop.name) {
    cropsToSave.push({
      registrant_id: registrant.id,
      name: crop.name,
      value_text: crop.value || null,
      corn_type: null
    });
  }
});

  
      if (cropsToSave.length > 0) {
        await ApiService.createCrops(cropsToSave);
        console.log('✅ Crops created');
      }
  
      // 5. CREATE LIVESTOCK
      const livestockToSave = livestock.filter(item => item.animal).map(item => ({
        registrant_id: registrant.id,
        animal: item.animal,
        head_count: parseInt(item.head_count) || null
      }));
  
      if (livestockToSave.length > 0) {
        await ApiService.createLivestock(livestockToSave);
        console.log('✅ Livestock created');
      }
  
      // 6. CREATE POULTRY
      const poultryToSave = poultry.filter(item => item.bird).map(item => ({
        registrant_id: registrant.id,
        bird: item.bird,
        head_count: parseInt(item.head_count) || null
      }));
  
      if (poultryToSave.length > 0) {
        await ApiService.createPoultry(poultryToSave);
        console.log('✅ Poultry created');
      }
  
      // 7. CREATE FARM PARCELS & PARCEL INFOS
      for (const parcel of farmParcels) {
        if (parcel.farm_location || parcel.total_area) {
          const parcelData = {
            registrant_id: registrant.id,
            farmers_in_rotation: parcel.farmer_rotation || null,
            farm_location: parcel.farm_location || null,
            total_farm_area_ha: parcel.total_area ? parseFloat(parcel.total_area) : null,
            ownership_document: parcel.ownership_doc || null,
            ownership_document_no: parcel.ownership_doc_no || null,
            ownership: parcel.ownership_type || null,
            within_ancestral_domain: parcel.ancestral_domain === 'yes',
            agrarian_reform_beneficiary: parcel.agrarian_reform === 'yes'
          };
  
          const savedParcel = await ApiService.createFarmParcel(parcelData);
          console.log('✅ Farm parcel created:', savedParcel.id);
  
          // Create parcel infos for this parcel
          const parcelInfosToSave = parcelInfo.filter(info => info.crop_commodity).map(info => ({
            parcel_id: savedParcel.id,
            crop: info.crop_commodity,
            size_ha: info.size ? parseFloat(info.size) : null,
            num_head: info.head_count ? parseInt(info.head_count) : null,
            farm_kind: info.farm_type || null,
            is_organic_practitioner: info.organic === 'yes',
            remarks: info.remarks || null
          }));
  
          if (parcelInfosToSave.length > 0) {
            await ApiService.createParcelInfos(parcelInfosToSave);
            console.log('✅ Parcel infos created');
          }
        }
      }
  
      // 8. CREATE FISHING ACTIVITIES
      const fishingActivitiesToSave = [];
      
      // Add checked fishing activities
      Object.keys(fishingCheckboxes).forEach(key => {
        if (fishingCheckboxes[key]) {
          const activityName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          fishingActivitiesToSave.push({
            registrant_id: registrant.id,
            activity: activityName
          });
        }
      });
      
      // Add custom fishing activities
      fishingActivities.forEach(activity => {
        if (activity.activity) {
          fishingActivitiesToSave.push({
            registrant_id: registrant.id,
            activity: activity.activity
          });
        }
      });
  
      if (fishingActivitiesToSave.length > 0) {
        await ApiService.createFishingActivities(fishingActivitiesToSave);
        console.log('✅ Fishing activities created');
      }
  
      // 9. CREATE WORK TYPES
      if (workTypes.length > 0) {
        const workTypesToSave = workTypes.map(work => ({
          registrant_id: registrant.id,
          work: work
        }));
        
        await ApiService.createWorkTypes(workTypesToSave);
        console.log('✅ Work types created');
      }
  
      // 10. CREATE INVOLVEMENT TYPES
      if (involvementTypes.length > 0) {
        const involvementTypesToSave = involvementTypes.map(involvement => ({
          registrant_id: registrant.id,
          involvement: involvement
        }));
        
        await ApiService.createInvolvementTypes(involvementTypesToSave);
        console.log('✅ Involvement types created');
      }
  
      // ✅ SUCCESS! Clear all form data
    
      
      // Clear formInputs
      setFormInputs({
        reference_no: '', surname: '', first_name: '', middle_name: '', extension_name: '',
        sex: '', mobile_number: '', landline_number: '', date_of_birth: '', place_of_birth: '',
        mother_full_name: '', spouse_name: '', religion_other: '', perm_street: '', perm_municipality_city: '',
        perm_province: '', perm_region: '', pres_street: '', pres_municipality_city: '', pres_province: '',
        pres_region: '', household_head_name: '', household_head_relationship: '', household_members_count: '',
        household_males: '', household_females: '', indigenous_group_name: '', government_id_type: '',
        government_id_number: '', coop_name: '', highest_education: '', emergency_contact_name: '',
        emergency_contact_phone: '', rsbsa_reference_no: '', tin_number: '', profession: '',
        source_of_funds: '', income_farming: '', income_non_farming: '',
      });
      
      // Clear other states
      setReligion('');
      setCivilStatus('');
      setSelectedBarangay('');
      setSelectedPurok('');
      setSelectedBarangayPresent('');
      setSelectedPurokPresent('');
      setSameAsPermAddress(false);
      setIsHouseholdHead(true);
      setHasGovId(false);
      setIsPwd(false);
      setIs4ps(false);
      setIsIndigenous(false);
      setIsMemberCoop(false);
      setRiceValue('');
      setCornValue('');
      setIsRiceChecked(false);
      setIsCornChecked(false);
      setCornType('');
      setOtherCrops([{ id: Date.now(), name: '', value: '' }]);
      setLivestock([{ id: Date.now(), animal: '', head_count: '' }]);
      setPoultry([{ id: Date.now(), bird: '', head_count: '' }]);
      setFarmParcels([{ id: Date.now(), farmer_rotation: '', farm_location: '', total_area: '', ownership_doc: '', ownership_doc_no: '', ownership_type: '', ancestral_domain: '', agrarian_reform: '' }]);
      setParcelInfo([{ id: Date.now(), crop_commodity: '', size: '', head_count: '', farm_type: '', organic: '', remarks: '' }]);
      setFishingActivities([{ id: Date.now(), activity: '' }]);
      setFishingCheckboxes({ fish_capture: false, aquaculture: false, gleaning: false, fish_processing: false, fish_vending: false });
      setActiveTab('personal');
      
      setShowSuccessModal(true);
      setIsSubmitting(false);
  
    } catch (error) {
      console.error('❌ ERROR:', error);
     
    }
  };
  
  
  

  const closeModal = () => {
    setShowSuccessModal(false);
    setActiveTab('personal'); // Reset to first tab after successful submission
  };

  const extensionOptions = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
  const religionOptions = ['Christianity', 'Islam', 'Others'];
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated'];
  const educationOptions = ['Pre-School', 'Elementary', 'High School (non-K12)', 'Junior High School (K-12)', 'Senior High School (K-12)', 'College', 'Vocational', 'Post-Graduate', 'None'];
  const ownershipDocOptions = ['Certificate of Land Transfer', 'Emancipation Patent', 'Individual Certificate of Land Ownership Award (CLOA)', 'Collective CLOA', 'Co-ownership CLOA', 'Agricultural Sales Patent', 'Homestead Patent', 'Free Patent', 'Certificate of Title or Regular Title', 'Certificate of Ancestral Domain Title', 'Certificate of Ancestral Land Title', 'Tax Declaration', 'Others'];
  const ownershipTypeOptions = ['Registered Owner', 'Tenant', 'Lessee', 'Others'];
  const farmTypeOptions = ['Irrigated', 'Rainfed Upland', 'Rainfed Lowland'];
  const cropCommodityOptions = ['Rice', 'Corn', 'HVC', 'Poultry', 'Agri-Fishery', 'Livestock'];

  const renderRegistrySelector = () => (
    
    
    <div className="bg-[#252525] p-4 rounded-md border border-[#3B3B3B] mb-6">
      <h3 className="text-gray-200 font-medium mb-4">Select Registry Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {[
          { value: 'farmer', label: 'Farmer', desc: 'Register as a farmer with crop and animal production details', color: '#3366CC' },
          { value: 'fisherfolk', label: 'Fisherfolk', desc: 'Register as a fisherfolk with fishing activities', color: '#33CC33' },
                  ].map((type) => (
          <div
            key={type.value}
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              registryType === type.value
                ? `border-${type.color} bg-${type.color}/20`
                : 'border-[#3B3B3B] bg-[#252525] hover:bg-[#1A1A1A]'
            }`}
            onClick={() => setRegistryType(type.value)}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                checked={registryType === type.value}
                onChange={() => setRegistryType(type.value)}
                className={`h-4 w-4 text-${type.color}`}
              />
              <label className="ml-2 text-gray-200 font-medium">{type.label}</label>
            </div>
            <p className="text-gray-400 text-sm">{type.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );


  // ========== COMPLETE MODIFIED PERSONAL INFO TAB ==========
// Copy and paste this to replace your renderPersonalInfoTab function

const renderPersonalInfoTab = () => (
  <div className="space-y-6">
    {/* Reference Number */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Reference Number</label>
      <Input 
        name="reference_no"
        value={formInputs.reference_no}
        onChange={handleInputChange}
        className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
        placeholder="00-00-00-000-000000" 
      />
    </div>

    {/* Name Fields */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Surname</label>
        <Input 
          name="surname"
          value={formInputs.surname}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="Surname" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">First Name</label>
        <Input 
          name="first_name"
          value={formInputs.first_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="First Name" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Middle Name</label>
        <Input 
          name="middle_name"
          value={formInputs.middle_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="Middle Name" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Extension Name</label>
        <select 
          name="extension_name"
          value={formInputs.extension_name}
          onChange={handleInputChange}
          className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
        >
          <option value="">Select</option>
          {extensionOptions.map(ext => (
            <option key={ext} value={ext}>{ext}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Sex */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Sex</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="sex" 
            value="male"
            checked={formInputs.sex === 'male'}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Male</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="sex" 
            value="female"
            checked={formInputs.sex === 'female'}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Female</span>
        </label>
      </div>
    </div>

    {/* Contact Numbers */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Mobile Number</label>
        <Input 
          name="mobile_number"
          value={formInputs.mobile_number}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="+63 XXX XXX XXXX" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Landline Number (Optional)</label>
        <Input 
          name="landline_number"
          value={formInputs.landline_number}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="(XXX) XXX-XXXX" 
        />
      </div>
    </div>

    {/* Birth Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Date of Birth</label>
        <Input 
          name="date_of_birth"
          value={formInputs.date_of_birth}
          onChange={handleInputChange}
          type="date"
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Place of Birth</label>
        <Input 
          name="place_of_birth"
          value={formInputs.place_of_birth}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="City/Municipality, Province" 
        />
      </div>
    </div>

    {/* Religion */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Religion</label>
      <select 
        value={religion}
        onChange={(e) => setReligion(e.target.value)}
        className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
      >
        <option value="">Select</option>
        {religionOptions.map(rel => (
          <option key={rel} value={rel}>{rel}</option>
        ))}
      </select>
      {religion === 'Others' && (
        <Input 
          name="religion_other"
          value={formInputs.religion_other}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200 mt-2" 
          placeholder="Specify religion" 
        />
      )}
    </div>

    {/* Civil Status */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Civil Status</label>
      <select 
        value={civilStatus}
        onChange={(e) => setCivilStatus(e.target.value)}
        className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
      >
        <option value="">Select</option>
        {civilStatusOptions.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </div>

    {/* Spouse Name (conditional) */}
    {civilStatus === 'Married' && (
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Name of Spouse</label>
        <Input 
          name="spouse_name"
          value={formInputs.spouse_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="Spouse's full name" 
        />
      </div>
    )}

    {/* Mother's Maiden Name */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Mother's Maiden Full Name</label>
      <Input 
        name="mother_full_name"
        value={formInputs.mother_full_name}
        onChange={handleInputChange}
        className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
        placeholder="Mother's full maiden name" 
      />
    </div>

    {/* Household Head */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Household Head</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="householdHead" 
            checked={isHouseholdHead === true}
            onChange={() => setIsHouseholdHead(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="householdHead" 
            checked={isHouseholdHead === false}
            onChange={() => setIsHouseholdHead(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
    </div>

    {/* Household Head Info (conditional) */}
    {!isHouseholdHead && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Name of Household Head</label>
            <Input 
              name="household_head_name"
              value={formInputs.household_head_name}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="Full name" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Relationship to Household Head</label>
            <Input 
              name="household_head_relationship"
              value={formInputs.household_head_relationship}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="e.g., Son, Daughter" 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">No. of Living Household Members</label>
            <Input 
              name="household_members_count"
              value={formInputs.household_members_count}
              onChange={handleInputChange}
              type="number"
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="0" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">No. of Males</label>
            <Input 
              name="household_males"
              value={formInputs.household_males}
              onChange={handleInputChange}
              type="number"
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="0" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">No. of Females</label>
            <Input 
              name="household_females"
              value={formInputs.household_females}
              onChange={handleInputChange}
              type="number"
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="0" 
            />
          </div>
        </div>
      </>
    )}

    {/* Highest Formal Education */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Highest Formal Education</label>
      <select 
        name="highest_education"
        value={formInputs.highest_education}
        onChange={handleInputChange}
        className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
      >
        <option value="">Select</option>
        {educationOptions.map(edu => (
          <option key={edu} value={edu}>{edu}</option>
        ))}
      </select>
    </div>

    {/* PWD */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Person with Disability (PWD)</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="pwd" 
            checked={isPwd === true}
            onChange={() => setIsPwd(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="pwd" 
            checked={isPwd === false}
            onChange={() => setIsPwd(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
    </div>

    {/* 4Ps */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">4Ps Beneficiary</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="fourps" 
            checked={is4ps === true}
            onChange={() => setIs4ps(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="fourps" 
            checked={is4ps === false}
            onChange={() => setIs4ps(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
    </div>

    {/* Indigenous */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Member of Indigenous Group</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="indigenous" 
            checked={isIndigenous === true}
            onChange={() => setIsIndigenous(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="indigenous" 
            checked={isIndigenous === false}
            onChange={() => setIsIndigenous(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
      {isIndigenous && (
        <Input 
          name="indigenous_group_name"
          value={formInputs.indigenous_group_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200 mt-2" 
          placeholder="Specify indigenous group name" 
        />
      )}
    </div>

    {/* Government ID */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">With Government ID</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="govid" 
            checked={hasGovId === true}
            onChange={() => setHasGovId(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="govid" 
            checked={hasGovId === false}
            onChange={() => setHasGovId(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
      {hasGovId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input 
            name="government_id_type"
            value={formInputs.government_id_type}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="ID Type (e.g., PhilSys, SSS)" 
          />
          <Input 
            name="government_id_number"
            value={formInputs.government_id_number}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="ID Number" 
          />
        </div>
      )}
    </div>

    {/* Member of Coop */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Member of Association/Cooperative</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="coop" 
            checked={isMemberCoop === true}
            onChange={() => setIsMemberCoop(true)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">Yes</span>
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="coop" 
            checked={isMemberCoop === false}
            onChange={() => setIsMemberCoop(false)}
            className="h-4 w-4 text-blue-600" 
          />
          <span className="ml-2 text-gray-400">No</span>
        </label>
      </div>
      {isMemberCoop && (
        <Input 
          name="coop_name"
          value={formInputs.coop_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200 mt-2" 
          placeholder="Specify association/cooperative name" 
        />
      )}
    </div>

    {/* Emergency Contact */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Person to Notify in Case of Emergency</label>
        <Input 
          name="emergency_contact_name"
          value={formInputs.emergency_contact_name}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="Full name" 
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Contact Number</label>
        <Input 
          name="emergency_contact_phone"
          value={formInputs.emergency_contact_phone}
          onChange={handleInputChange}
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="+63 XXX XXX XXXX" 
        />
      </div>
    </div>
  </div>
);

  // ========== COMPLETE MODIFIED ADDRESS TAB ==========
// Copy and paste this to replace your renderAddressTab function

const renderAddressTab = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-200 mb-4">Permanent Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Barangay</label>
          <select 
            value={selectedBarangay}
            onChange={(e) => {
              setSelectedBarangay(e.target.value);
              setSelectedPurok('');
            }}
            className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
          >
            <option value="">Select Barangay</option>
            <option value="Upper Jasaan">Upper Jasaan</option>
            <option value="Lower Jasaan">Lower Jasaan</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Purok/Sitio</label>
          <select 
            value={selectedPurok}
            onChange={(e) => setSelectedPurok(e.target.value)}
            disabled={!selectedBarangay}
            className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
          >
            <option value="">Select Purok</option>
            {getPurokOptions(selectedBarangay).map(purok => (
              <option key={purok} value={purok}>{purok}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Municipality/City</label>
          <Input 
            name="perm_municipality_city"
            value={formInputs.perm_municipality_city}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="Municipality or City" 
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Street/Sitio/Subdivision</label>
          <Input 
            name="perm_street"
            value={formInputs.perm_street}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="Street address" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Province</label>
          <Input 
            name="perm_province"
            value={formInputs.perm_province}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="Province" 
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Region</label>
          <Input 
            name="perm_region"
            value={formInputs.perm_region}
            onChange={handleInputChange}
            className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
            placeholder="Region" 
          />
        </div>
      </div>
    </div>

    {/* Same as Permanent Address Checkbox */}
    <div className="flex items-center">
      <input 
        type="checkbox" 
        checked={sameAsPermAddress}
        onChange={(e) => setSameAsPermAddress(e.target.checked)}
        className="h-4 w-4 text-blue-600" 
      />
      <label className="ml-2 text-gray-400">Same as Permanent Address</label>
    </div>

    {/* Present Address (conditional) */}
    {!sameAsPermAddress && (
      <div>
        <h3 className="text-lg font-medium text-gray-200 mb-4">Present Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Barangay</label>
            <select 
              value={selectedBarangayPresent}
              onChange={(e) => {
                setSelectedBarangayPresent(e.target.value);
                setSelectedPurokPresent('');
              }}
              className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
            >
              <option value="">Select Barangay</option>
              <option value="Upper Jasaan">Upper Jasaan</option>
              <option value="Lower Jasaan">Lower Jasaan</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Purok/Sitio</label>
            <select 
              value={selectedPurokPresent}
              onChange={(e) => setSelectedPurokPresent(e.target.value)}
              disabled={!selectedBarangayPresent}
              className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
            >
              <option value="">Select Purok</option>
              {getPurokOptions(selectedBarangayPresent).map(purok => (
                <option key={purok} value={purok}>{purok}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Municipality/City</label>
            <Input 
              name="pres_municipality_city"
              value={formInputs.pres_municipality_city}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="Municipality or City" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Street/Sitio/Subdivision</label>
            <Input 
              name="pres_street"
              value={formInputs.pres_street}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="Street address" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Province</label>
            <Input 
              name="pres_province"
              value={formInputs.pres_province}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="Province" 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-1 block">Region</label>
            <Input 
              name="pres_region"
              value={formInputs.pres_region}
              onChange={handleInputChange}
              className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
              placeholder="Region" 
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
  // ========== COMPLETE FARM DATA TAB WITH PARCELS CODE ==========

const renderFarmDataTab = () => (
  <div className="space-y-6">
    {/* Farming Activity Form */}
    <div className="bg-[#252525] p-4 rounded-md border border-[#3B3B3B]">
      <h3 className="text-gray-200 font-medium mb-4">Farming Activity</h3>
      
      {/* Main Crops */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div className="flex items-center space-x-3">
    <input 
      type="checkbox" 
      name="rice_checked"
      checked={isRiceChecked}
      onChange={(e) => setIsRiceChecked(e.target.checked)}
      className="h-4 w-4 text-blue-600" 
    />
    <label className="text-gray-400">Rice</label>
    <Input 
      name="rice_value"
      value={riceValue}
      onChange={(e) => setRiceValue(e.target.value)}
      className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 w-24" 
      placeholder="Value" 
    />
  </div>
  
  <div className="space-y-2">
    <div className="flex items-center space-x-3">
      <input 
        type="checkbox" 
        name="corn_checked"
        className="h-4 w-4 text-blue-600"
        checked={isCornChecked}
        onChange={(e) => {
          setIsCornChecked(e.target.checked);
          if (!e.target.checked) {
            setCornType('');
          }
        }}
      />
      <label className="text-gray-400">Corn</label>
      <Input 
        name="corn_value"
        value={cornValue}
        onChange={(e) => setCornValue(e.target.value)}
        className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 w-24" 
        placeholder="Value" 
      />
    </div>
    {isCornChecked && (
      <div className="ml-7 flex items-center space-x-4">
        <div className="flex items-center">
          <input 
            type="radio" 
            name="cornType" 
            value="yellow"
            checked={cornType === 'yellow'}
            onChange={(e) => setCornType(e.target.value)}
            className="h-3 w-3 text-blue-600" 
          />
          <label className="ml-2 text-gray-400 text-sm">Yellow</label>
        </div>
        <div className="flex items-center">
          <input 
            type="radio" 
            name="cornType" 
            value="white"
            checked={cornType === 'white'}
            onChange={(e) => setCornType(e.target.value)}
            className="h-3 w-3 text-blue-600" 
          />
          <label className="ml-2 text-gray-400 text-sm">White</label>
        </div>
      </div>
    )}
  </div>
</div>


      {/* Other Crops */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-400 font-medium">Other Crops</h4>
          <Button 
            type="button"
            onClick={() => addFormItem(setOtherCrops, otherCrops)}
            className="bg-blue-600/20 hover:bg-blue-600/20/80 text-gray-200 px-3 py-1 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Crop
          </Button>
        </div>
        {otherCrops.map((crop) => (
          <div key={crop.id} className="flex items-center gap-3 mb-2">
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 flex-1" 
              placeholder="Specify Crop"
              value={crop.name || ''}
              onChange={(e) => {
                const newCrops = otherCrops.map(c => 
                  c.id === crop.id ? {...c, name: e.target.value} : c
                );
                setOtherCrops(newCrops);
              }}
            />
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 w-24" 
              placeholder="Value"
              value={crop.value || ''}
              onChange={(e) => {
                const newCrops = otherCrops.map(c => 
                  c.id === crop.id ? {...c, value: e.target.value} : c
                );
                setOtherCrops(newCrops);
              }}
            />
            <Button 
              type="button"
              onClick={() => removeFormItem(setOtherCrops, otherCrops, crop.id)}
              className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-2 py-1"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Livestock */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-400 font-medium">Livestock</h4>
          <Button 
            type="button"
            onClick={() => addFormItem(setLivestock, livestock)}
            className="bg-blue-600/20 hover:bg-blue-600/20/80 text-gray-200 px-3 py-1 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Livestock
          </Button>
        </div>
        {livestock.map((animal) => (
          <div key={animal.id} className="flex items-center gap-3 mb-2">
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 flex-1" 
              placeholder="Specify Livestock"
              value={animal.animal || ''}
              onChange={(e) => {
                const newLivestock = livestock.map(a => 
                  a.id === animal.id ? {...a, animal: e.target.value} : a
                );
                setLivestock(newLivestock);
              }}
            />
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 w-32" 
              placeholder="No. of Head" 
              type="number"
              value={animal.head_count || ''}
              onChange={(e) => {
                const newLivestock = livestock.map(a => 
                  a.id === animal.id ? {...a, head_count: e.target.value} : a
                );
                setLivestock(newLivestock);
              }}
            />
            <Button 
              type="button"
              onClick={() => removeFormItem(setLivestock, livestock, animal.id)}
              className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-2 py-1"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Poultry */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-400 font-medium">Poultry</h4>
          <Button 
            type="button"
            onClick={() => addFormItem(setPoultry, poultry)}
            className="bg-blue-600/20 hover:bg-blue-600/20/80 text-gray-200 px-3 py-1 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Poultry
          </Button>
        </div>
        {poultry.map((bird) => (
          <div key={bird.id} className="flex items-center gap-3 mb-2">
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 flex-1" 
              placeholder="Specify Poultry"
              value={bird.bird || ''}
              onChange={(e) => {
                const newPoultry = poultry.map(b => 
                  b.id === bird.id ? {...b, bird: e.target.value} : b
                );
                setPoultry(newPoultry);
              }}
            />
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 w-32" 
              placeholder="No. of Head" 
              type="number"
              value={bird.head_count || ''}
              onChange={(e) => {
                const newPoultry = poultry.map(b => 
                  b.id === bird.id ? {...b, head_count: e.target.value} : b
                );
                setPoultry(newPoultry);
              }}
            />
            <Button 
              type="button"
              onClick={() => removeFormItem(setPoultry, poultry, bird.id)}
              className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-2 py-1"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>

    {/* Farm Parcel Forms - COMPLETE CODE */}
    <div className="bg-[#252525] p-4 rounded-md border border-[#3B3B3B]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-200 font-medium">Farm Parcels (Max 3)</h3>
        <Button 
          type="button"
          onClick={() => addFormItem(setFarmParcels, farmParcels)}
          disabled={farmParcels.length >= 3}
          className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-3 py-1 text-xs disabled:opacity-50"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Parcel
        </Button>
      </div>

      {farmParcels.map((parcel, index) => (
  <div key={parcel.id} className="border border-[#3B3B3B] rounded-md p-4 mb-4 bg-[#1A1A1A]">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-gray-400 font-medium">Farm Parcel {index + 1}</h4>
      {farmParcels.length > 1 && (
        <Button 
          type="button"
          onClick={() => removeFormItem(setFarmParcels, farmParcels, parcel.id)}
          className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-2 py-1 text-xs"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}
    </div>

    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Name of Farmer's in Rotation</label>
        <Input 
          className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200" 
          placeholder="Name of Farmer's in Rotation"
          value={parcel.farmer_rotation || ''}
          onChange={(e) => {
            const newParcels = farmParcels.map(p => 
              p.id === parcel.id ? {...p, farmer_rotation: e.target.value} : p
            );
            setFarmParcels(newParcels);
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Farm Location</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200" 
            placeholder="Barangay, City/Municipality"
            value={parcel.farm_location || ''}
            onChange={(e) => {
              const newParcels = farmParcels.map(p => 
                p.id === parcel.id ? {...p, farm_location: e.target.value} : p
              );
              setFarmParcels(newParcels);
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Total Farm Area (ha)</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200" 
            placeholder="Total Farm Area" 
            type="number" 
            step="0.01"
            value={parcel.total_area || ''}
            onChange={(e) => {
              const newParcels = farmParcels.map(p => 
                p.id === parcel.id ? {...p, total_area: e.target.value} : p
              );
              setFarmParcels(newParcels);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Ownership Document</label>
          <select 
            className="w-full h-10 px-3 py-2 bg-[#1A1A1A] border border-[#3B3B3B] rounded-md text-gray-200"
            value={parcel.ownership_doc || ''}
            onChange={(e) => {
              const newParcels = farmParcels.map(p => 
                p.id === parcel.id ? {...p, ownership_doc: e.target.value} : p
              );
              setFarmParcels(newParcels);
            }}
          >
            <option value="">Select Document</option>
            {ownershipDocOptions.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1 block">Ownership Document No.</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200" 
            placeholder="Document Number"
            value={parcel.ownership_doc_no || ''}
            onChange={(e) => {
              const newParcels = farmParcels.map(p => 
                p.id === parcel.id ? {...p, ownership_doc_no: e.target.value} : p
              );
              setFarmParcels(newParcels);
            }}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Ownership Type</label>
        <select 
          className="w-full h-10 px-3 py-2 bg-[#1A1A1A] border border-[#3B3B3B] rounded-md text-gray-200"
          value={parcel.ownership_type || ''}
          onChange={(e) => {
            const newParcels = farmParcels.map(p => 
              p.id === parcel.id ? {...p, ownership_type: e.target.value} : p
            );
            setFarmParcels(newParcels);
          }}
        >
          <option value="">Select Ownership Type</option>
          {ownershipTypeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Within Ancestral Domain</label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`ancestral_${parcel.id}`} 
                checked={parcel.ancestral_domain === 'yes'}
                onChange={() => {
                  const newParcels = farmParcels.map(p => 
                    p.id === parcel.id ? {...p, ancestral_domain: 'yes'} : p
                  );
                  setFarmParcels(newParcels);
                }}
                className="h-4 w-4 text-blue-600" 
              />
              <label className="ml-2 text-gray-400">Yes</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`ancestral_${parcel.id}`} 
                checked={parcel.ancestral_domain === 'no'}
                onChange={() => {
                  const newParcels = farmParcels.map(p => 
                    p.id === parcel.id ? {...p, ancestral_domain: 'no'} : p
                  );
                  setFarmParcels(newParcels);
                }}
                className="h-4 w-4 text-blue-600" 
              />
              <label className="ml-2 text-gray-400">No</label>
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Agrarian Reform Beneficiary</label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`reform_${parcel.id}`} 
                checked={parcel.agrarian_reform === 'yes'}
                onChange={() => {
                  const newParcels = farmParcels.map(p => 
                    p.id === parcel.id ? {...p, agrarian_reform: 'yes'} : p
                  );
                  setFarmParcels(newParcels);
                }}
                className="h-4 w-4 text-blue-600" 
              />
              <label className="ml-2 text-gray-400">Yes</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`reform_${parcel.id}`} 
                checked={parcel.agrarian_reform === 'no'}
                onChange={() => {
                  const newParcels = farmParcels.map(p => 
                    p.id === parcel.id ? {...p, agrarian_reform: 'no'} : p
                  );
                  setFarmParcels(newParcels);
                }}
                className="h-4 w-4 text-blue-600" 
              />
              <label className="ml-2 text-gray-400">No</label>
            </div>
          </div>
        </div>
      </div>

           {/* Farm Parcel Information - COMPLETE WITH DATA BINDING */}
<div className="border-t border-[#3B3B3B] pt-4">
  <div className="flex items-center justify-between mb-3">
    <h5 className="text-gray-400 font-medium">Farm Parcel Information (Max 5)</h5>
    <Button 
      type="button"
      onClick={addParcelInfo}
      disabled={parcelInfo.length >= 5}
      className="bg-blue-600/20 hover:bg-blue-600/20/80 text-gray-200 px-2 py-1 text-xs disabled:opacity-50"
    >
      <Plus className="h-3 w-3 mr-1" /> Add Info
    </Button>
  </div>

  {parcelInfo.map((info, infoIndex) => (
    <div key={info.id} className="border border-[#3B3B3B] rounded-md p-3 mb-3 bg-[#1A1A1A]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">Parcel Info {infoIndex + 1}</span>
        {parcelInfo.length > 1 && (
          <Button 
            type="button"
            onClick={() => removeParcelInfo(info.id)}
            className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-1 py-1 text-xs"
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Crop/Commodity</label>
          <select 
            className="w-full h-8 px-2 py-1 bg-[#1A1A1A] border border-[#3B3B3B] rounded text-gray-200 text-sm"
            value={info.crop_commodity || ''}
            onChange={(e) => {
              const newParcelInfo = parcelInfo.map(pi => 
                pi.id === info.id ? {...pi, crop_commodity: e.target.value} : pi
              );
              setParcelInfo(newParcelInfo);
            }}
          >
            <option value="">Select</option>
            {cropCommodityOptions.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Size (ha)</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 h-8 text-sm" 
            type="number" 
            step="0.01"
            value={info.size || ''}
            onChange={(e) => {
              const newParcelInfo = parcelInfo.map(pi => 
                pi.id === info.id ? {...pi, size: e.target.value} : pi
              );
              setParcelInfo(newParcelInfo);
            }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">No. of Head</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 h-8 text-sm" 
            type="number"
            value={info.head_count || ''}
            onChange={(e) => {
              const newParcelInfo = parcelInfo.map(pi => 
                pi.id === info.id ? {...pi, head_count: e.target.value} : pi
              );
              setParcelInfo(newParcelInfo);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Farm Type</label>
          <select 
            className="w-full h-8 px-2 py-1 bg-[#1A1A1A] border border-[#3B3B3B] rounded text-gray-200 text-sm"
            value={info.farm_type || ''}
            onChange={(e) => {
              const newParcelInfo = parcelInfo.map(pi => 
                pi.id === info.id ? {...pi, farm_type: e.target.value} : pi
              );
              setParcelInfo(newParcelInfo);
            }}
          >
            <option value="">Select</option>
            {farmTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-2 block">Organic Practitioner</label>
          <div className="flex gap-3">
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`organic_${info.id}`} 
                checked={info.organic === 'yes'}
                onChange={() => {
                  const newParcelInfo = parcelInfo.map(pi => 
                    pi.id === info.id ? {...pi, organic: 'yes'} : pi
                  );
                  setParcelInfo(newParcelInfo);
                }}
                className="h-3 w-3 text-blue-600" 
              />
              <label className="ml-1 text-gray-400 text-sm">Y</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                name={`organic_${info.id}`} 
                checked={info.organic === 'no'}
                onChange={() => {
                  const newParcelInfo = parcelInfo.map(pi => 
                    pi.id === info.id ? {...pi, organic: 'no'} : pi
                  );
                  setParcelInfo(newParcelInfo);
                }}
                className="h-3 w-3 text-blue-600" 
              />
              <label className="ml-1 text-gray-400 text-sm">N</label>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Remarks</label>
          <Input 
            className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 h-8 text-sm" 
            placeholder="Remarks"
            value={info.remarks || ''}
            onChange={(e) => {
              const newParcelInfo = parcelInfo.map(pi => 
                pi.id === info.id ? {...pi, remarks: e.target.value} : pi
              );
              setParcelInfo(newParcelInfo);
            }}
          />
        </div>
      </div>
    </div>
  ))}
</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
 // ========== FISH DATA TAB ==========
 const renderFishDataTab = () => (
  <div className="space-y-6">
    <div className="bg-[#252525] p-4 rounded-md border border-[#3B3B3B]">
      <h3 className="text-gray-200 font-medium mb-4">Type of Fishing Activity</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Fish Capture', key: 'fish_capture' },
          { label: 'Aquaculture', key: 'aquaculture' },
          { label: 'Gleaning', key: 'gleaning' },
          { label: 'Fish Processing', key: 'fish_processing' },
          { label: 'Fish Vending', key: 'fish_vending' }
        ].map((activity) => (
          <div key={activity.key} className="flex items-center">
            <input 
              type="checkbox" 
              name={`fishing_${activity.key}`}
              checked={fishingCheckboxes[activity.key]}
              onChange={(e) => {
                setFishingCheckboxes({
                  ...fishingCheckboxes,
                  [activity.key]: e.target.checked
                });
              }}
              className="h-4 w-4 text-green-600" 
            />
            <label className="ml-2 text-gray-400">{activity.label}</label>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-400 font-medium">Other Activities</h4>
          <Button 
            type="button"
            onClick={() => addFormItem(setFishingActivities, fishingActivities)}
            className="bg-green-600/20 hover:bg-green-600/20/80 text-gray-200 px-3 py-1 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Activity
          </Button>
        </div>
        {fishingActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 mb-2">
            <Input 
              className="bg-[#1A1A1A] border-[#3B3B3B] text-gray-200 flex-1" 
              placeholder="Specify Activity"
              value={activity.activity || ''}
              onChange={(e) => {
                const newActivities = fishingActivities.map(a => 
                  a.id === activity.id ? {...a, activity: e.target.value} : a
                );
                setFishingActivities(newActivities);
              }}
            />
            <Button 
              type="button"
              onClick={() => removeFormItem(setFishingActivities, fishingActivities, activity.id)}
              className="bg-red-600 hover:bg-red-600/80 text-gray-200 px-2 py-1"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  // ========== COMPLETE MODIFIED FINANCIAL TAB ==========
// Copy and paste this to replace your renderFinancialTab function

const renderFinancialTab = () => (
  <div className="space-y-6">
    {/* RSBSA Reference Number */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">RSBSA Reference Number (if applicable)</label>
      <Input 
        name="rsbsa_reference_no"
        value={formInputs.rsbsa_reference_no}
        onChange={handleInputChange}
        className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
        placeholder="RS-YYYY-NNNN" 
      />
    </div>

    {/* TIN Number */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Tax Identification Number (TIN)</label>
      <Input 
        name="tin_number"
        value={formInputs.tin_number}
        onChange={handleInputChange}
        className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
        placeholder="XXX-XXX-XXX-XXX" 
      />
    </div>

    {/* Profession */}
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1 block">Profession</label>
      <select 
        name="profession"
        value={formInputs.profession}
        onChange={handleInputChange}
        className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
      >
        <option value="">Select</option>
        <option value="farmer">Farmer</option>
        <option value="fisherfolk">Fisherfolk</option>
        <option value="farmworker">Farmworker</option>
        <option value="agri-youth">Agri-Youth</option>
        <option value="others">Others</option>
      </select>
    </div>

    {/* Source of Funds */}
<div>
  <label className="text-sm font-medium text-gray-400 mb-1 block">Source of Funds</label>
  <select 
    name="source_of_funds"
    value={formInputs.source_of_funds}
    onChange={handleInputChange}
    className="w-full h-10 px-3 py-2 bg-[#252525] border border-[#3B3B3B] rounded-md text-gray-200"
  >
    <option value="">Select</option>
    <option value="salary">Salary</option>
    <option value="business">Business</option>
    <option value="remittance">Remittance</option>
    <option value="pension">Pension</option>
    <option value="investment">Investment</option>
    <option value="other">Other</option>
  </select>
</div>


    {/* Income */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Farming Income (Annual)</label>
        <Input 
          name="income_farming"
          value={formInputs.income_farming}
          onChange={handleInputChange}
          type="number"
          step="0.01"
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="0.00" 
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-400 mb-1 block">Non-Farming Income (Annual)</label>
        <Input 
          name="income_non_farming"
          value={formInputs.income_non_farming}
          onChange={handleInputChange}
          type="number"
          step="0.01"
          className="bg-[#252525] border-[#3B3B3B] text-gray-200" 
          placeholder="0.00" 
        />
      </div>
    </div>

    {/* Total Annual Income (calculated) */}
    <div className="bg-[#1C1C1C] p-4 rounded-md border border-[#3B3B3B]">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 font-medium">Total Annual Income:</span>
        <span className="text-gray-200 font-semibold text-lg">
          ₱ {(
            (parseFloat(formInputs.income_farming) || 0) + 
            (parseFloat(formInputs.income_non_farming) || 0)
          ).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </span>
      </div>
    </div>
  </div>
);

  // Add this helper function before renderPreviewTab
const getFormValue = (name) => {
  const element = document.querySelector(`[name="${name}"]`);
  return element ? element.value : '';
};

const getRadioValue = (name) => {
  const element = document.querySelector(`input[name="${name}"]:checked`);
  return element ? element.value : '';
};

// Replace your entire renderPreviewTab function with this COMPLETE version:
const renderPreviewTab = () => {
  // Collect all form values from DOM
  const fullName = [
    getFormValue('first_name'), 
    getFormValue('middle_name'), 
    getFormValue('surname'), 
    getFormValue('extension_name')
  ].filter(Boolean).join(' ') || 'Not provided';
  
  const permAddress = [
    getFormValue('perm_street'),
    selectedBarangay,
    selectedPurok,
    getFormValue('perm_municipality_city'),
    getFormValue('perm_province'),
    getFormValue('perm_region')
  ].filter(Boolean).join(', ') || 'Not provided';
  
  const presAddress = sameAsPermAddress ? permAddress : 
    [
      getFormValue('pres_street'),
      selectedBarangayPresent,
      selectedPurokPresent,
      getFormValue('pres_municipality_city'),
      getFormValue('pres_province'),
      getFormValue('pres_region')
    ].filter(Boolean).join(', ') || 'Not provided';

  return (
    <div className="space-y-6">
      <div className="bg-[#252525] p-4 rounded-md border border-[#3B3B3B]">
        <h3 className="text-gray-200 font-medium mb-4">Review Registration Information</h3>
        <div className="space-y-4">
          
          {/* Personal Information - READ FROM formInputs STATE */}
<div>
  <h4 className="text-gray-400 font-medium mb-2">Personal Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div className="flex">
      <span className="text-gray-400 w-36">Registry Type:</span>
      <span className="text-gray-200 capitalize">{registryType}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Reference Number:</span>
      <span className="text-gray-200">{formInputs.reference_no || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Full Name:</span>
      <span className="text-gray-200">
        {[formInputs.surname, formInputs.first_name, formInputs.middle_name, formInputs.extension_name]
          .filter(Boolean).join(' ') || 'Not provided'}
      </span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Sex:</span>
      <span className="text-gray-200 capitalize">{formInputs.sex || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Birthdate:</span>
      <span className="text-gray-200">{formInputs.date_of_birth || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Place of Birth:</span>
      <span className="text-gray-200">{formInputs.place_of_birth || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Mobile Number:</span>
      <span className="text-gray-200">{formInputs.mobile_number || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Landline:</span>
      <span className="text-gray-200">{formInputs.landline_number || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Mother's Name:</span>
      <span className="text-gray-200">{formInputs.mother_full_name || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Civil Status:</span>
      <span className="text-gray-200">{civilStatus || 'Not provided'}</span>
    </div>
    {civilStatus === 'Married' && (
      <div className="flex">
        <span className="text-gray-400 w-36">Spouse Name:</span>
        <span className="text-gray-200">{formInputs.spouse_name || 'Not provided'}</span>
      </div>
    )}
    <div className="flex">
      <span className="text-gray-400 w-36">Religion:</span>
      <span className="text-gray-200">{religion === 'Others' ? formInputs.religion_other : religion || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Education:</span>
      <span className="text-gray-200">{formInputs.highest_education || 'Not provided'}</span>
    </div>
  </div>
</div>

          {/* Address Information - READ FROM STATE */}
<div className="border-t border-[#3B3B3B] pt-4">
  <h4 className="text-gray-400 font-medium mb-2">Address Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div>
      <h5 className="text-gray-400 text-sm mb-1">Permanent Address</h5>
      <p className="text-gray-200">
        {[
          selectedPurok,
          selectedBarangay,
          formInputs.perm_street,
          formInputs.perm_municipality_city,
          formInputs.perm_province,
          formInputs.perm_region
        ].filter(Boolean).join(', ') || 'Not provided'}
      </p>
    </div>
    <div>
      <h5 className="text-gray-400 text-sm mb-1">Present Address</h5>
      <p className="text-gray-200">
        {sameAsPermAddress 
          ? 'Same as permanent address'
          : [
              selectedPurokPresent,
              selectedBarangayPresent,
              formInputs.pres_street,
              formInputs.pres_municipality_city,
              formInputs.pres_province,
              formInputs.pres_region
            ].filter(Boolean).join(', ') || 'Not provided'
        }
      </p>
    </div>
  </div>
</div>

{/* Household Information - READ FROM STATE */}
<div className="border-t border-[#3B3B3B] pt-4">
  <h4 className="text-gray-400 font-medium mb-2">Household Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div className="flex">
      <span className="text-gray-400 w-36">Household Head:</span>
      <span className="text-gray-200">{isHouseholdHead ? 'Yes' : 'No'}</span>
    </div>
    {!isHouseholdHead && (
      <>
        <div className="flex">
          <span className="text-gray-400 w-36">Head's Name:</span>
          <span className="text-gray-200">{formInputs.household_head_name || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-36">Relationship:</span>
          <span className="text-gray-200">{formInputs.household_head_relationship || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-36">Members Count:</span>
          <span className="text-gray-200">{formInputs.household_members_count || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-36">Males:</span>
          <span className="text-gray-200">{formInputs.household_males || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-36">Females:</span>
          <span className="text-gray-200">{formInputs.household_females || 'Not provided'}</span>
        </div>
      </>
    )}
  </div>
</div>

{/* Status Information - READ FROM STATE */}
<div className="border-t border-[#3B3B3B] pt-4">
  <h4 className="text-gray-400 font-medium mb-2">Status Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div className="flex">
      <span className="text-gray-400 w-36">PWD:</span>
      <span className="text-gray-200">{isPwd ? 'Yes' : 'No'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">4Ps Beneficiary:</span>
      <span className="text-gray-200">{is4ps ? 'Yes' : 'No'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Indigenous:</span>
      <span className="text-gray-200">{isIndigenous ? 'Yes' : 'No'}</span>
    </div>
    {isIndigenous && (
      <div className="flex">
        <span className="text-gray-400 w-36">Group Name:</span>
        <span className="text-gray-200">{formInputs.indigenous_group_name || 'Not provided'}</span>
      </div>
    )}
    <div className="flex">
      <span className="text-gray-400 w-36">Has Gov't ID:</span>
      <span className="text-gray-200">{hasGovId ? 'Yes' : 'No'}</span>
    </div>
    {hasGovId && (
      <>
        <div className="flex">
          <span className="text-gray-400 w-36">ID Type:</span>
          <span className="text-gray-200">{formInputs.government_id_type || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-36">ID Number:</span>
          <span className="text-gray-200">{formInputs.government_id_number || 'Not provided'}</span>
        </div>
      </>
    )}
    <div className="flex">
      <span className="text-gray-400 w-36">Coop Member:</span>
      <span className="text-gray-200">{isMemberCoop ? 'Yes' : 'No'}</span>
    </div>
    {isMemberCoop && (
      <div className="flex">
        <span className="text-gray-400 w-36">Coop Name:</span>
        <span className="text-gray-200">{formInputs.coop_name || 'Not provided'}</span>
      </div>
    )}
  </div>
</div>


          {/* Emergency Contact - READ FROM formInputs STATE */}
<div className="border-t border-[#3B3B3B] pt-4">
  <h4 className="text-gray-400 font-medium mb-2">Emergency Contact</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div className="flex">
      <span className="text-gray-400 w-36">Contact Person:</span>
      <span className="text-gray-200">{formInputs.emergency_contact_name || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Contact Number:</span>
      <span className="text-gray-200">{formInputs.emergency_contact_phone || 'Not provided'}</span>
    </div>
  </div>
</div>


        {/* Farm/Registry-Specific Information */}
{(registryType === 'farmer' || registryType === 'farmworker' || registryType === 'agriyouth') && (
  <div className="border-t border-[#3B3B3B] pt-4">
    <h4 className="text-gray-400 font-medium mb-2">Farm Information</h4>
    <div className="space-y-3">
      
      {/* Main Crops - Rice & Corn */}
      {(isRiceChecked || isCornChecked) && (
        <div>
          <h5 className="text-gray-400 text-sm mb-2">Main Crops</h5>
          <div className="flex flex-wrap gap-2">
            {isRiceChecked && riceValue && (
              <Badge className="bg-green-600/20 text-green-400">
                Rice ({riceValue})
              </Badge>
            )}
            {isCornChecked && cornValue && (
              <Badge className="bg-yellow-600/20 text-yellow-400">
                Corn - {cornType} ({cornValue})
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Other Crops */}
      {otherCrops.length > 0 && otherCrops.some(c => c.name) && (
        <div>
          <h5 className="text-gray-400 text-sm mb-2">Other Crops</h5>
          <div className="flex flex-wrap gap-2">
            {otherCrops.map((item, index) => (
              item.name && (
                <Badge key={index} className="bg-blue-600/20 text-blue-400">
                  {item.name} {item.value && `(${item.value})`}
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Livestock */}
      {livestock.length > 0 && livestock.some(l => l.animal) && (
        <div>
          <h5 className="text-gray-400 text-sm mb-2">Livestock</h5>
          <div className="flex flex-wrap gap-2">
            {livestock.map((item, index) => (
              item.animal && (
                <Badge key={index} className="bg-orange-600/20 text-orange-400">
                  {item.animal} ({item.head_count || 0} heads)
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Poultry */}
      {poultry.length > 0 && poultry.some(p => p.bird) && (
        <div>
          <h5 className="text-gray-400 text-sm mb-2">Poultry</h5>
          <div className="flex flex-wrap gap-2">
            {poultry.map((item, index) => (
              item.bird && (
                <Badge key={index} className="bg-purple-600/20 text-purple-400">
                  {item.bird} ({item.head_count || 0} heads)
                </Badge>
              )
            ))}
          </div>
        </div>
      )}

      {/* No farming activity message */}
      {!isRiceChecked && !isCornChecked && 
       !otherCrops.some(c => c.name) && 
       !livestock.some(l => l.animal) && 
       !poultry.some(p => p.bird) && (
        <span className="text-gray-400 text-sm">No crops/livestock added</span>
      )}

      {/* Farm Parcels */}
      {farmParcels.length > 0 && (
        <div>
          <h5 className="text-gray-400 text-sm mb-2">Farm Parcels ({farmParcels.length})</h5>
          <div className="space-y-2">
            {farmParcels.map((parcel, index) => (
              <div key={parcel.id} className="bg-[#1C1C1C] p-3 rounded border border-[#3B3B3B]">
                <div className="text-sm text-gray-300 space-y-1">
                  <div>
                    <span className="font-medium text-gray-200">Parcel {index + 1}:</span>
                  </div>
                  {parcel.farmer_rotation && (
                    <div className="text-xs">
                      <span className="text-gray-400">Farmer:</span> {parcel.farmer_rotation}
                    </div>
                  )}
                  {parcel.farm_location && (
                    <div className="text-xs">
                      <span className="text-gray-400">Location:</span> {parcel.farm_location}
                    </div>
                  )}
                  {parcel.total_area && (
                    <div className="text-xs">
                      <span className="text-gray-400">Area:</span> {parcel.total_area} ha
                    </div>
                  )}
                  {parcel.ownership_type && (
                    <div className="text-xs">
                      <span className="text-gray-400">Ownership:</span> {parcel.ownership_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Fishing Activities (for fisherfolk) */}
{registryType === 'fisherfolk' && (
  <div className="border-t border-[#3B3B3B] pt-4">
    <h4 className="text-gray-400 font-medium mb-2">Fishing Activities</h4>
    <div className="flex flex-wrap gap-2">
      {fishingActivities.length > 0 ? (
        fishingActivities.map((item, index) => (
          item.activity && <Badge key={index} className="bg-blue-600/20 text-blue-400">{item.activity}</Badge>
        ))
      ) : (
        <span className="text-gray-400 text-sm">No activities added</span>
      )}
    </div>
  </div>
)}

{/* Work Types (for farmworker) */}
{registryType === 'farmworker' && (
  <div className="border-t border-[#3B3B3B] pt-4">
    <h4 className="text-gray-400 font-medium mb-2">Kind of Work</h4>
    <div className="flex flex-wrap gap-2">
      {workTypes.length > 0 ? (
        workTypes.map((item, index) => (
          item.work && <Badge key={index} className="bg-yellow-600/20 text-yellow-400">{item.work}</Badge>
        ))
      ) : (
        <span className="text-gray-400 text-sm">No work types added</span>
      )}
    </div>
  </div>
)}

{/* Involvement Types (for agriyouth) */}
{registryType === 'agriyouth' && (
  <div className="border-t border-[#3B3B3B] pt-4">
    <h4 className="text-gray-400 font-medium mb-2">Type of Involvement</h4>
    <div className="flex flex-wrap gap-2">
      {involvementTypes.length > 0 ? (
        involvementTypes.map((item, index) => (
          item.type && <Badge key={index} className="bg-purple-600/20 text-purple-400">{item.type}</Badge>
        ))
      ) : (
        <span className="text-gray-400 text-sm">No involvement types added</span>
      )}
    </div>
  </div>
)}

          {/* Financial Information - READ FROM formInputs STATE */}
<div className="border-t border-[#3B3B3B] pt-4">
  <h4 className="text-gray-400 font-medium mb-2">Financial Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
    <div className="flex">
      <span className="text-gray-400 w-36">RSBSA Number:</span>
      <span className="text-gray-200">{formInputs.rsbsa_reference_no || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">TIN Number:</span>
      <span className="text-gray-200">{formInputs.tin_number || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Profession:</span>
      <span className="text-gray-200 capitalize">{formInputs.profession || registryType}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Source of Funds:</span>
      <span className="text-gray-200 capitalize">{formInputs.source_of_funds || 'Not provided'}</span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Farming Income:</span>
      <span className="text-gray-200">
        {formInputs.income_farming ? `₱ ${parseFloat(formInputs.income_farming).toLocaleString('en-PH', {minimumFractionDigits: 2})}` : 'Not provided'}
      </span>
    </div>
    <div className="flex">
      <span className="text-gray-400 w-36">Non-Farming Income:</span>
      <span className="text-gray-200">
        {formInputs.income_non_farming ? `₱ ${parseFloat(formInputs.income_non_farming).toLocaleString('en-PH', {minimumFractionDigits: 2})}` : 'Not provided'}
      </span>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

  

  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252525] border border-[#3B3B3B] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all duration-300 scale-100">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Registration Successful!</h3>
          <p className="text-gray-400 mb-6">Your registration has been successfully submitted. You will receive a confirmation soon.</p>
          <Button 
            onClick={closeModal}
            className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-6 py-2 rounded-md"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  const getDataTabContent = () => {
    switch (registryType) {
      case 'fisherfolk':
        return renderFishDataTab();
      case 'farmworker':
        return renderFarmWorkerTab();
      case 'agriyouth':
        return renderAgriYouthTab();
      default:
        return renderFarmDataTab();
    }
  };

  const getDataTabLabel = () => {
    switch (registryType) {
      case 'fisherfolk':
        return 'Fish Data';
      case 'farmworker':
        return 'Work Data';
      case 'agriyouth':
        return 'Youth Data';
      default:
        return 'Farm Data';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {renderRegistrySelector()}
      
      <Card className="bg-[#252525] border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-200 text-xl">Register New RSBSA - {registryType.charAt(0).toUpperCase() + registryType.slice(1)}</CardTitle>
          <CardDescription className="text-gray-400">Fill in the details to register a new {registryType}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 bg-[#1A1A1A] mb-6">
              <TabsTrigger value="personal" className="data-[state=active]:bg-[#252525] data-[state=active]:text-gray-200 text-gray-400">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-[#252525] data-[state=active]:text-gray-200 text-gray-400">
                Address
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-[#252525] data-[state=active]:text-gray-200 text-gray-400">
                {getDataTabLabel()}
              </TabsTrigger>
              <TabsTrigger value="financial" className="data-[state=active]:bg-[#252525] data-[state=active]:text-gray-200 text-gray-400">
                Financial
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-[#252525] data-[state=active]:text-gray-200 text-gray-400">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-0">
              {renderPersonalInfoTab()}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setActiveTab('address')}
                  className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-6 py-2 rounded-md"
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="address" className="mt-0">
              {renderAddressTab()}
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => setActiveTab('personal')}
                  variant="outline" 
                  className="border-[#3B3B3B] bg-transparent hover:bg-[#1A1A1A] text-gray-400 px-6 py-2 rounded-md"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Previous
                </Button>
                <Button 
                  onClick={() => setActiveTab('data')}
                  className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-6 py-2 rounded-md"
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              {getDataTabContent()}
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => setActiveTab('address')}
                  variant="outline" 
                  className="border-[#3B3B3B] bg-transparent hover:bg-[#1A1A1A] text-gray-400 px-6 py-2 rounded-md"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Previous
                </Button>
                <Button 
                  onClick={() => setActiveTab('financial')}
                  className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-6 py-2 rounded-md"
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-0">
              {renderFinancialTab()}
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => setActiveTab('data')}
                  variant="outline" 
                  className="border-[#3B3B3B] bg-transparent hover:bg-[#1A1A1A] text-gray-400 px-6 py-2 rounded-md"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Previous
                </Button>
                <Button 
                  onClick={() => setActiveTab('preview')}
                  className="bg-blue-600 hover:bg-blue-600/80 text-blue-600-foreground px-6 py-2 rounded-md"
                >
                  Next <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {renderPreviewTab()}
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => setActiveTab('financial')}
                  variant="outline" 
                  className="border-[#3B3B3B] bg-transparent hover:bg-[#1A1A1A] text-gray-400 px-6 py-2 rounded-md"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Previous
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-blue-600/20 hover:bg-blue-600/20/80 text-gray-200 px-6 py-2 rounded-md"
                >
                  <i className="fas fa-check mr-2"></i> Submit Registration
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showSuccessModal && renderSuccessModal()}
    </div>
  );
};


export default RegisterPage;
