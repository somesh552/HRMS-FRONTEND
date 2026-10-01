import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EmployeeOnboarding.module.css";

import {
  Check,
  ArrowLeft,
  ArrowRight,
  FileText,
  GraduationCap,
  Briefcase,
  File as FileIcon,
  Pencil,
  Download,
} from "lucide-react";

import { departmentApi } from "../../../services/api/department.api";
import { designationApi } from "../../../services/api/designation.api";
import { employeeApi } from "../../../services/api/employee.api";

const formatInputDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).split("T")[0];
  }

  return date.toISOString().split("T")[0];
};
const EmployeeOnboarding = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id)
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  // ==========================================
  // BACKEND OPTIONS
  // ==========================================

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([])

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  // ==========================================
  // SUBMISSION STATE
  // ==========================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [createdEmployeeCode, setCreatedEmployeeCode] = useState("");
  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    // Employee Registration
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "",
    joiningDate: "",

    // Backend IDs
    department: "",
    designation: "",

    reportingManager: "",
    employmentType: "",
    workLocation: "",
    employeeStatus: "",

    // Personal Information
    fatherName: "",
    fatherAadharNumber: "",
    motherName: "",
    MotherAadharNumber: "",
    maritalStatus: "",
    nationality: "",
    bloodGroup: "",
    emergencyName: "",
    emergencyMobile: "",
    emergencyRelation: "",

    // Address
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",

    // Permanent Address
    permanentHouseNo: "",
    permanentStreet: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    permanentCountry: "",
    // permanentAddress: "",

    // Current Address
    currentHouseNo: "",
    currentStreet: "",
    currentCity: "",
    currentState: "",
    currentPincode: "",
    currentCountry: "",
    // currentAddress: "",

    sameAsPermanent: false,

    // Documents
    documents: [],
  });

  // ==========================================
  // LOAD EMPLOYEE FOR EDIT
  // ==========================================
  useEffect(() => {
    if (!id) return;

    const loadEmployeeForEdit = async () => {
      try {
        setSubmitError("");
        const response = await employeeApi.getById(id);
        const employee =
          response.data?.employee ||
          response.data?.data ||
          response.data;

        const personalInfo =
          employee?.personal_info ||
          employee?.personalInfo ||
          {};

        const addresses = employee?.addresses || [];

        const permanentAddress =
          addresses.find(
            (address) =>
              String(address?.address_type || "").toLowerCase() ===
              "permanent"
          ) ||
          employee?.permanent_address ||
          employee?.permanentAddress ||
          {};

        const currentAddress =
          addresses.find(
            (address) =>
              String(address?.address_type || "").toLowerCase() ===
              "current"
          ) ||
          employee?.current_address ||
          employee?.currentAddress ||
          {};

        setFormData((prev) => ({
          ...prev,

          // Employee
          firstName:
            employee?.first_name ??
            employee?.firstName ??
            "",

          lastName:
            employee?.last_name ??
            employee?.lastName ??
            "",

          email:
            employee?.email ??
            "",

          mobileNumber:
            employee?.phone ??
            employee?.mobile_number ??
            employee?.mobileNumber ??
            "",

          gender:
            employee?.gender ??
            "",

          dateOfBirth: formatInputDate(
            employee?.dob ??
            employee?.date_of_birth ??
            employee?.dateOfBirth
          ),

          joiningDate: formatInputDate(
            employee?.joining_date ??
            employee?.joiningDate
          ),

          // IMPORTANT: select fields need IDs
          department: String(
            employee?.department_id ??
            employee?.departmentId ??
            employee?.department?.id ??
            ""
          ),

          designation: String(
            employee?.designation_id ??
            employee?.designationId ??
            employee?.designation?.id ??
            ""
          ),

          reportingManager: String(
            employee?.manager_id ??
            employee?.managerId ??
            employee?.reporting_manager_id ??
            employee?.reportingManagerId ??
            ""
          ),

          employmentType:
            employee?.employment_type ??
            employee?.employmentType ??
            "",

          workLocation:
            employee?.work_location ??
            employee?.workLocation ??
            "",

          employeeStatus:
            employee?.status ??
            employee?.employee_status ??
            "Active",

          // Personal Information
          fatherName:
            personalInfo?.father_name ??
            personalInfo?.fatherName ??
            "",

          fatherAadharNumber:
            personalInfo?.father_aadhaar_number ??
            personalInfo?.fatherAadhaarNumber ??
            personalInfo?.father_aadhar_number ??
            "",

          motherName:
            personalInfo?.mother_name ??
            personalInfo?.motherName ??
            "",

          MotherAadharNumber:
            personalInfo?.mother_aadhaar_number ??
            personalInfo?.motherAadhaarNumber ??
            personalInfo?.mother_aadhar_number ??
            "",

          maritalStatus:
            personalInfo?.marital_status ??
            personalInfo?.maritalStatus ??
            "",

          nationality:
            personalInfo?.nationality ??
            "",

          bloodGroup:
            personalInfo?.blood_group ??
            personalInfo?.bloodGroup ??
            "",

          emergencyName:
            personalInfo?.emergency_contact_name ??
            personalInfo?.emergencyContactName ??
            "",

          emergencyMobile:
            personalInfo?.emergency_contact_number ??
            personalInfo?.emergencyContactNumber ??
            "",

          emergencyRelation:
            personalInfo?.emergency_contact_relation ??
            personalInfo?.emergencyContactRelation ??
            "",

          // Permanent Address
          permanentHouseNo:
            permanentAddress?.house_no ??
            permanentAddress?.houseNo ??
            "",

          permanentStreet:
            permanentAddress?.street ??
            "",

          permanentCity:
            permanentAddress?.city ??
            "",

          permanentState:
            permanentAddress?.state ??
            "",

          permanentPincode:
            permanentAddress?.pincode ??
            permanentAddress?.pin_code ??
            "",

          permanentCountry:
            permanentAddress?.country ??
            "",

          // permanentAddress:
          //   permanentAddress?.address ??
          //   permanentAddress?.full_address ??
          //   "",

          // Current Address
          currentHouseNo:
            currentAddress?.house_no ??
            currentAddress?.houseNo ??
            "",

          currentStreet:
            currentAddress?.street ??
            "",

          currentCity:
            currentAddress?.city ??
            "",

          currentState:
            currentAddress?.state ??
            "",

          currentPincode:
            currentAddress?.pincode ??
            currentAddress?.pin_code ??
            "",

          currentCountry:
            currentAddress?.country ??
            "",

          // currentAddress:
            // currentAddress?.address ??
            // currentAddress?.full_address ??
            // "",

          sameAsPermanent:
            Boolean(
              employee?.same_as_permanent ??
              employee?.sameAsPermanent ??
              false
            ),
        }));
      } catch (error) {
        console.error("Failed to load employee for edit:", error);

        setSubmitError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load employee information."
        );
      }
    };

    loadEmployeeForEdit();
  }, [id]);
  // ==========================================
  // LOAD DEPARTMENTS + DESIGNATIONS
  // ==========================================

  useEffect(() => {
    const loadRegistrationOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setOptionsError("");

        const [
          departmentResponse,
          designationResponse,
          employeeResponse,
        ] = await Promise.all([
          departmentApi.getAll(),
          designationApi.getAll(),
          employeeApi.getAll(),
        ]);

        setDepartments(
          Array.isArray(departmentResponse.data)
            ? departmentResponse.data
            : departmentResponse.data?.data || []
        );

        const designationList = Array.isArray(designationResponse.data)
          ? designationResponse.data
          : designationResponse.data?.data || [];

        const uniqueDesignations = designationList.filter(
          (designation, index, self) =>
            index ===
            self.findIndex(
              (item) =>
                String(item.designation_name || "")
                  .trim()
                  .toLowerCase() ===
                String(designation.designation_name || "")
                  .trim()
                  .toLowerCase()
            )
        );

        setDesignations(uniqueDesignations);

        setManagers(
          Array.isArray(employeeResponse.data)
            ? employeeResponse.data
            : employeeResponse.data?.data || []
        );
      } catch (error) {
        console.error("Failed to load departments/designations:", error);

        setOptionsError(
          "Unable to load departments, designations and reporting managers. Please refresh and try again."
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadRegistrationOptions();
  }, []);

  // ==========================================
  // FORM UPDATE
  // ==========================================

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,

      ...(field === "department" || field === "designation"
        ? { reportingManager: "" }
        : {}),
    }));
  };
  // ==========================================
  // BUILD BACKEND PAYLOAD
  // ==========================================

  const buildEmployeeData = () => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,

      phone: formData.mobileNumber,
      gender: formData.gender,
      dob: formData.dateOfBirth,
      joiningDate: formData.joiningDate,

      departmentId: formData.department ? Number(formData.department) : null,

      designationId: formData.designation ? Number(formData.designation) : null,

      managerId: formData.reportingManager
        ? Number(formData.reportingManager)
        : null,

      employmentType: formData.employmentType,
      workLocation: formData.workLocation,

      status: formData.employeeStatus || "Active",
    };
  };
  const buildPersonalInfo = () => {
    return {
      fatherName: formData.fatherName,
      fatherAadhaarNumber: formData.fatherAadharNumber,
      motherName: formData.motherName,
      motherAadhaarNumber: formData.MotherAadharNumber,
      maritalStatus: formData.maritalStatus,
      nationality: formData.nationality,
      bloodGroup: formData.bloodGroup,
      emergencyContactName: formData.emergencyName,
      emergencyContactNumber: formData.emergencyMobile,
      emergencyContactRelation: formData.emergencyRelation,
    };
  };
  const buildAddresses = () => {
    return {
      sameAsPermanent: formData.sameAsPermanent,

      permanentAddress: {
        houseNo: formData.permanentHouseNo,
        street: formData.permanentStreet,
        city: formData.permanentCity,
        state: formData.permanentState,
        pincode: formData.permanentPincode,
        country: formData.permanentCountry,
      },

      currentAddress: {
        houseNo: formData.currentHouseNo,
        street: formData.currentStreet,
        city: formData.currentCity,
        state: formData.currentState,
        pincode: formData.currentPincode,
        country: formData.currentCountry,
      },
    };
  };

  const buildDocumentsMetadata = () => {
    return formData.documents
      .filter((document) => document.file instanceof globalThis.File)
      .map((document) => ({
        documentKey: document.documentKey,
        fileName: document.file.name,
      }));
  };
  const appendDocumentFiles = (formDataToSend) => {
    formData.documents
      .filter((document) => document.file instanceof globalThis.File)
      .forEach((document) => {
        switch (document.documentKey) {
          case "PROFILE_PHOTO":
            formDataToSend.append("profilePhoto", document.file);
            break;

          case "AADHAAR":
            formDataToSend.append("aadhaar", document.file);
            break;

          case "PAN":
            formDataToSend.append("pan", document.file);
            break;

          case "DRIVING_LICENSE":
            formDataToSend.append("drivingLicense", document.file);
            break;

          case "TENTH":
          case "INTERMEDIATE":
          case "DIPLOMA":
          case "DEGREE":
          case "PG":
            formDataToSend.append("education", document.file);
            break;

          case "EXPERIENCE":
            formDataToSend.append("experience", document.file);
            break;

          case "RESUME":
            formDataToSend.append("resume", document.file);
            break;

          default:
            console.warn(
              `Unsupported document key: ${document.documentKey}`,
            );
        }
      });
  };
  // ==========================================
  // EMPLOYEE SUBMISSION
  // ==========================================

  const submitEmployee = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      const employeeData = buildEmployeeData();
      const personalInfo = buildPersonalInfo();
      const addresses = buildAddresses();
      const documentsMetadata = buildDocumentsMetadata();

      const formDataToSend = new FormData();

      formDataToSend.append(
        "employeeData",
        JSON.stringify(employeeData),
      );

      formDataToSend.append(
        "personalInfo",
        JSON.stringify(personalInfo),
      );

      formDataToSend.append(
        "addresses",
        JSON.stringify(addresses),
      );

      formDataToSend.append(
        "documentsMetadata",
        JSON.stringify(documentsMetadata),
      );

      appendDocumentFiles(formDataToSend);

      // Validate required documents before sending the request.
      const uploadedDocumentKeys = formData.documents.map(
        (document) => document.documentKey,
      );

      if (!isEditMode) {
        const requiredDocumentKeys = [
          "PROFILE_PHOTO",
          "AADHAAR",
          "PAN",
          "TENTH",
          "DEGREE",
          "RESUME",
        ];

        const missingDocument = requiredDocumentKeys.find(
          (key) => !uploadedDocumentKeys.includes(key),
        );

        if (missingDocument) {
          throw new Error(`${missingDocument} document is required`);
        }

        const hasIntermediate = uploadedDocumentKeys.includes("INTERMEDIATE");
        const hasDiploma = uploadedDocumentKeys.includes("DIPLOMA");

        if (!hasIntermediate && !hasDiploma) {
          throw new Error(
            "Either Intermediate or Diploma certificate is required",
          );
        }

        if (hasIntermediate && hasDiploma) {
          throw new Error(
            "Upload either Intermediate or Diploma certificate, not both",
          );
        }
      }
      let response;

      if (isEditMode) {

        response = await employeeApi.update(id, formDataToSend);
      } else {

        response = await employeeApi.create(formDataToSend);
      }

      const employeeCode =
        response.data?.employeeCode ||
        response.data?.employee?.employee_code ||
        response.data?.employee?.employeeCode ||
        "";

      if (isEditMode) {
        navigate(`/hr/employees/${id}`);
        return;
      }

      setCreatedEmployeeCode(employeeCode);
      setRegistrationSuccess(true);

    } catch (error) {
      console.error("Employee registration failed:", error);
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      console.error("Backend message:", error.response?.data?.message);

      setSubmitError(
        error.response?.data?.message ||
        error.message ||
        "Employee registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }

  };
  // ==========================================
  // VALIDATION
  // ==========================================

  const validateStep = (step) => {
    const newErrors = {};

    // Names/text fields:
    // Must START with a letter.
    // Letters, spaces, # and _ are allowed.
    // Numbers and other special characters are NOT allowed.
    const nameRegex = /^[A-Za-z][A-Za-z $_]*$/;

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Mobile: exactly 10 digits and starts with 6-9
    const mobileRegex = /^[6-9][0-9]{9}$/;

    // Aadhaar: exactly 12 digits
    const aadhaarRegex = /^[0-9]{12}$/;

    // Pincode: exactly 6 digits
    const pincodeRegex = /^[0-9]{6}$/;
    //dateOfBirth

    // ==========================================
    // STEP 1 - EMPLOYEE
    // ==========================================

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First Name is required";
      } else if (!nameRegex.test(formData.firstName.trim())) {
        newErrors.firstName =
          "First Name must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last Name is required";
      } else if (!nameRegex.test(formData.lastName.trim())) {
        newErrors.lastName =
          "Last Name must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = "Mobile Number is required";
      } else if (!mobileRegex.test(formData.mobileNumber.trim())) {
        newErrors.mobileNumber =
          "Mobile Number must be exactly 10 digits and start with 6, 7, 8 or 9";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of Birth is required";
      } else {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();

        if (dob > today) {
          newErrors.dateOfBirth =
            "Date of Birth cannot be in the future";
        } else {
          let age = today.getFullYear() - dob.getFullYear();
          const monthDifference = today.getMonth() - dob.getMonth();

          if (
            monthDifference < 0 ||
            (monthDifference === 0 &&
              today.getDate() < dob.getDate())
          ) {
            age--;
          }

          if (age < 18) {
            newErrors.dateOfBirth =
              `Your age is ${age} years. Employee must be at least 18 years old.`;
          }
        }
      }

      if (!formData.joiningDate) {
        newErrors.joiningDate = "Joining Date is required";
      }

      if (!formData.department) {
        newErrors.department = "Department is required";
      }

      if (!formData.designation) {
        newErrors.designation = "Designation is required";
      }

      if (!formData.reportingManager?.trim()) {
        newErrors.reportingManager =
          "Reporting Manager is required";
      }

      if (!formData.employmentType) {
        newErrors.employmentType =
          "Employment Type is required";
      }

      if (!formData.workLocation?.trim()) {
        newErrors.workLocation =
          "Work Location is required";
      }

      if (!formData.employeeStatus) {
        newErrors.employeeStatus =
          "Employee Status is required";
      }
    }
    // ==========================================
    // STEP 2 - PERSONAL INFORMATION
    // ==========================================

    if (step === 2) {
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = "Father Name is required";
      } else if (!nameRegex.test(formData.fatherName.trim())) {
        newErrors.fatherName =
          "Father Name must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.fatherAadharNumber.trim()) {
        newErrors.fatherAadharNumber =
          "Father Aadhar Number is required";
      } else if (!aadhaarRegex.test(formData.fatherAadharNumber.trim())) {
        newErrors.fatherAadharNumber =
          "Father Aadhar Number must be exactly 12 digits";
      }

      if (!formData.motherName.trim()) {
        newErrors.motherName = "Mother Name is required";
      } else if (!nameRegex.test(formData.motherName.trim())) {
        newErrors.motherName =
          "Mother Name must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.MotherAadharNumber.trim()) {
        newErrors.MotherAadharNumber =
          "Mother Aadhar Number is required";
      } else if (!aadhaarRegex.test(formData.MotherAadharNumber.trim())) {
        newErrors.MotherAadharNumber =
          "Mother Aadhar Number must be exactly 12 digits";
      }

      if (!formData.maritalStatus) {
        newErrors.maritalStatus = "Marital Status is required";
      }

      if (!formData.nationality.trim()) {
        newErrors.nationality = "Nationality is required";
      } else if (!nameRegex.test(formData.nationality.trim())) {
        newErrors.nationality =
          "Nationality must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.bloodGroup) {
        newErrors.bloodGroup = "Blood Group is required";
      }

      if (!formData.emergencyName.trim()) {
        newErrors.emergencyName =
          "Emergency Contact Name is required";
      } else if (!nameRegex.test(formData.emergencyName.trim())) {
        newErrors.emergencyName =
          "Emergency Contact Name must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.emergencyMobile.trim()) {
        newErrors.emergencyMobile =
          "Emergency Mobile Number is required";
      } else if (!mobileRegex.test(formData.emergencyMobile.trim())) {
        newErrors.emergencyMobile =
          "Emergency Mobile Number must be exactly 10 digits and start with 6, 7, 8 or 9";
      }

      if (!formData.emergencyRelation.trim()) {
        newErrors.emergencyRelation =
          "Emergency Relation is required";
      } else if (!nameRegex.test(formData.emergencyRelation.trim())) {
        newErrors.emergencyRelation =
          "Emergency Relation must start with a letter. Only letters, spaces, # and _ are allowed";
      }
    }

    // ==========================================
    // STEP 3 - ADDRESS
    // ==========================================

    if (step === 3) {
      // Permanent Address

      if (!formData.permanentHouseNo.trim()) {
        newErrors.permanentHouseNo = "House No is required";
      }

      if (!formData.permanentStreet.trim()) {
        newErrors.permanentStreet = "Street is required";
      } else if (!nameRegex.test(formData.permanentStreet.trim())) {
        newErrors.permanentStreet =
          "Street must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.permanentCity.trim()) {
        newErrors.permanentCity = "City is required";
      } else if (!nameRegex.test(formData.permanentCity.trim())) {
        newErrors.permanentCity =
          "City must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.permanentState.trim()) {
        newErrors.permanentState = "State is required";
      } else if (!nameRegex.test(formData.permanentState.trim())) {
        newErrors.permanentState =
          "State must start with a letter. Only letters, spaces, # and _ are allowed";
      }

      if (!formData.permanentPincode.trim()) {
        newErrors.permanentPincode = "Pincode is required";
      } else if (!pincodeRegex.test(formData.permanentPincode.trim())) {
        newErrors.permanentPincode =
          "Pincode must be exactly 6 digits";
      }

      if (!formData.permanentCountry.trim()) {
        newErrors.permanentCountry = "Country is required";
      }

      // if (!formData.permanentAddress.trim()) {
      //   newErrors.permanentAddress =
      //     "Permanent Address is required";
      // }

      // Current Address
      // If Same as Permanent is checked, copied values are accepted.

      if (!formData.sameAsPermanent) {
        if (!formData.currentHouseNo.trim()) {
          newErrors.currentHouseNo = "House No is required";
        }

        if (!formData.currentStreet.trim()) {
          newErrors.currentStreet = "Street is required";
        } else if (!nameRegex.test(formData.currentStreet.trim())) {
          newErrors.currentStreet =
            "Street must start with a letter. Only letters, spaces, # and _ are allowed";
        }

        if (!formData.currentCity.trim()) {
          newErrors.currentCity = "City is required";
        } else if (!nameRegex.test(formData.currentCity.trim())) {
          newErrors.currentCity =
            "City must start with a letter. Only letters, spaces, # and _ are allowed";
        }

        if (!formData.currentState.trim()) {
          newErrors.currentState = "State is required";
        } else if (!nameRegex.test(formData.currentState.trim())) {
          newErrors.currentState =
            "State must start with a letter. Only letters, spaces, # and _ are allowed";
        }

        if (!formData.currentPincode.trim()) {
          newErrors.currentPincode = "Pincode is required";
        } else if (!pincodeRegex.test(formData.currentPincode.trim())) {
          newErrors.currentPincode =
            "Pincode must be exactly 6 digits";
        }

        if (!formData.currentCountry.trim()) {
          newErrors.currentCountry = "Country is required";
        }

        // if (!formData.currentAddress.trim()) {
        //   newErrors.currentAddress =
        //     "Current Address is required";
        // }
      }
    }

    // ==========================================
    // STEP 4 - DOCUMENT VALIDATION
    // ==========================================

    if (step === 4) {
      const documents = formData.documents || [];
      if (isEditMode) {
        return true;
      }
      const uploadedKeys = new Set(
        documents.map((document) => document.documentKey)
      );

      // Required documents
      const requiredDocuments = [
        ["PROFILE_PHOTO", "Passport Size Photo"],
        ["AADHAAR", "Aadhaar"],
        ["PAN", "PAN"],
        ["TENTH", "10th Certificate"],
        ["DEGREE", "Degree Certificate"],
        ["RESUME", "Resume"],
      ];

      requiredDocuments.forEach(([key, label]) => {
        if (!uploadedKeys.has(key)) {
          newErrors[key] = `${label} is required`;
        }
      });

      // Intermediate OR Diploma
      const hasIntermediate = uploadedKeys.has("INTERMEDIATE");
      const hasDiploma = uploadedKeys.has("DIPLOMA");

      if (!hasIntermediate && !hasDiploma) {
        newErrors.INTERMEDIATE =
          "Either Intermediate or Diploma Certificate is required";

        newErrors.DIPLOMA =
          "Either Intermediate or Diploma Certificate is required";
      }

      // Cannot upload both
      if (hasIntermediate && hasDiploma) {
        newErrors.INTERMEDIATE =
          "Upload either Intermediate or Diploma Certificate, not both";

        newErrors.DIPLOMA =
          "Upload either Intermediate or Diploma Certificate, not both";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };
  // ==========================================
  // STEP NAVIGATION
  // ==========================================
  const nextStep = async () => {

    setSubmitError("");

    // STEP 4 - FINISH
    if (currentStep === 4) {

      const isValid = validateStep(4);

      if (!isValid) {
                return;
      }

      try {
        await submitEmployee();
      } catch (error) {
        console.error("Finish failed:", error);
      }

      return;
    }

    // STEP 1, 2, 3 validation
    const isValid = validateStep(currentStep);

    if (!isValid) {
            return;
    }

    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }

      return prev;
    });

    setCurrentStep((prev) => prev + 1);
  };
  const previousStep = () => {
    if (isSubmitting) {
      return;
    }

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate("/hr/employeemanagement");
    }
  };
  const steps = ["Employee", "Personal", "Address", "Documents"];


  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (registrationSuccess) {
    return (
      <div className={styles["employee-success-page"]}>
        <div className={styles["success-card"]}>

          <div className={styles["success-icon"]}>
            <Check size={40} strokeWidth={3} />
          </div>

          <h1>Registration Completed Successfully!</h1>

          <p>
            Employee registration has been completed successfully.
          </p>

          {createdEmployeeCode && (
            <p className={styles["employee-code"]}>
              Employee Code: <strong>{createdEmployeeCode}</strong>
            </p>
          )}

          <button
            type="button"
            className={styles["success-btn"]}
            onClick={() => navigate("/hr/employeemanagement")}
          >
            Go to Employee Management
          </button>

        </div>
      </div>
    );
  }


  return (

    <div className={styles["employee-onboarding-page"]}>
      <div className={styles["wizard-card"]}>
        {/* Header */}
        <div className={styles["wizard-header"]}>
          <h1>{isEditMode ? "Edit Employee" : "Create Employee"}</h1>
        </div>

        {/* Progress Steps */}
        <div className={styles["progress-container"]}>
          {steps.map((step, index) => {
            const stepNumber = index + 1;

            const isCompleted = completedSteps.includes(stepNumber);

            const isCurrent = currentStep === stepNumber;

            return (
              <React.Fragment key={step}>
                <div className={styles["progress-step"]}>
                  <div
                    className={[styles["step-circle"], (isCompleted ? styles["completed"] : isCurrent ? styles["current"] : "")].filter(Boolean).join(" ")}
                    onClick={() => {
                      if (isCompleted || stepNumber < currentStep) {
                        setCurrentStep(stepNumber);
                      }
                    }}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      stepNumber
                    )}
                  </div>

                  <span
                    className={[styles["step-label"], (isCompleted
                      ? styles["completed-label"]
                      : isCurrent
                        ? styles["current-label"]
                        : "")].filter(Boolean).join(" ")}
                  >
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={[styles["step-line"], (completedSteps.includes(stepNumber)
                      ? styles["completed-line"]
                      : "")].filter(Boolean).join(" ")}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Form Content */}
        <div className={styles["wizard-content"]}>

          {optionsError && (
            <div className="form-error">
              {optionsError}
            </div>
          )}

          {submitError && (
            <div className="form-error">
              {submitError}
            </div>
          )}

          {/* STEP 1 - Employee Registration */}
          {currentStep === 1 && (
            <EmployeeRegistration
              formData={formData}
              updateField={updateField}
              departments={departments}
              designations={designations}
              managers={managers}
              id={id}
              isLoadingOptions={isLoadingOptions}
              errors={errors}
            />
          )}

          {/* STEP 2 - Personal Information */}
          {currentStep === 2 && (
            <PersonalInformation
              formData={formData}
              updateField={updateField}
              errors={errors}
            />
          )}

          {/* STEP 3 - Address Management */}
          {currentStep === 3 && (
            <AddressManagement
              formData={formData}
              updateField={updateField}
              errors={errors}
            />
          )}

          {/* STEP 4 - Document Management */}
          {currentStep === 4 && (
            <DocumentManagement
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          )}

        </div>
        {/*BUttons*/}
        <div className={styles["wizard-buttons"]}>

          {/* Back - LEFT */}
          <button
            type="button"
            className={styles["back-btn"]}
            onClick={previousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Save & Continue / Finish - RIGHT */}
          <button
            type="button"
            className={styles["next-btn"]}
            onClick={nextStep}
            disabled={isSubmitting}
          >
            {currentStep === 4 ? (
              isSubmitting ? "Submitting..." : "Finish"
            ) : (
              <>
                Save & Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

/* =====================================================
   STEP 1 - EMPLOYEE REGISTRATION
===================================================== */
const EmployeeRegistration = ({
  formData,
  updateField,
  departments,
  designations,
  managers,
  id,
  isLoadingOptions,
  errors,
}) => {
  return (
    <div className={styles["step-form"]}>
      <h2>Employee Overview</h2>

      <p>Enter basic employee information</p>

      <div className={styles["form-grid"]}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          error={errors.lastName}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="Mobile Number"
          value={formData.mobileNumber}
          onChange={(e) => updateField("mobileNumber", e.target.value)}
          error={errors.mobileNumber}
        />
        <Select
          label="Gender"
          value={formData.gender}
          onChange={(e) => updateField("gender", e.target.value)}
          options={["Male", "Female", "Other"]}
          error={errors.gender}
        />
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateField("dateOfBirth", e.target.value)}
          error={errors.dateOfBirth}
        />

        <Input
          label="Joining Date"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => updateField("joiningDate", e.target.value)}
          error={errors.joiningDate}
        />

        <Select
          label="Department"
          value={formData.department}
          onChange={(e) => updateField("department", e.target.value)}
          disabled={isLoadingOptions}
          options={departments.map((department) => ({
            value: String(department.id),
            label: department.department_name,
          }))}
          error={errors.department}
        />
        <Select
          label="Designation"
          value={formData.designation}
          onChange={(e) => updateField("designation", e.target.value)}
          disabled={isLoadingOptions}
          options={designations.map((designation) => ({
            value: String(designation.id),
            label: designation.designation_name,
          }))}
          error={errors.designation}
        />
        <Select
          label="Reporting Manager"
          value={formData.reportingManager}
          onChange={(e) =>
            updateField("reportingManager", e.target.value)
          }
          disabled={
            isLoadingOptions ||
            !formData.department ||
            !formData.designation
          }
          options={(managers || [])
            .filter(
              (manager) =>
                String(manager.department_id) === String(formData.department) &&
                String(manager.designation_id) === String(formData.designation) &&
                String(manager.id) !== String(id)
            )
            .map((manager) => ({
              value: String(manager.id),
              label: `${manager.first_name ?? manager.firstName ?? ""} ${manager.last_name ?? manager.lastName ?? ""
                }`.trim(),
            }))}
          error={errors.reportingManager}
        />

        <Select
          label="Employment Type"
          value={formData.employmentType}
          onChange={(e) => updateField("employmentType", e.target.value)}
          options={[
            "Full Time",
            "Part Time",
            "Contract",
            "Intern",
            "Training",
          ]}
          error={errors.employmentType}
        />

        <Input
          label="Work Location"
          value={formData.workLocation}
          onChange={(e) => updateField("workLocation", e.target.value)}
          error={errors.workLocation}
        />

        <Select
          label="Status"
          value={formData.employeeStatus}
          onChange={(e) => updateField("employeeStatus", e.target.value)}
          options={["Active", "Inactive", "Resigned"]}
          error={errors.employeeStatus}
        />
      </div>
    </div>
  );
};

/* =====================================================
   STEP 2 - PERSONAL INFORMATION
===================================================== */

const PersonalInformation = ({ formData, updateField, errors }) => {
  return (
    <div className={styles["step-form"]}>
      <h2>Personal Details</h2>

      <p>Enter family and emergency contact details</p>

      <div className={styles["form-grid"]}>
        <Input
          label="Father Name"
          value={formData.fatherName}
          onChange={(e) => updateField("fatherName", e.target.value)}
          error={errors.fatherName}
        />

        <Input
          label="Father AadharNumber"
          value={formData.fatherAadharNumber}
          onChange={(e) =>
            updateField("fatherAadharNumber", e.target.value)
          }
          error={errors.fatherAadharNumber}
        />

        <Input
          label="Mother Name"
          value={formData.motherName}
          onChange={(e) => updateField("motherName", e.target.value)}
          error={errors.motherName}
        />

        <Input
          label="Mother AadharNumber"
          value={formData.MotherAadharNumber}
          onChange={(e) =>
            updateField("MotherAadharNumber", e.target.value)
          }
          error={errors.MotherAadharNumber}
        />

        <Select
          label="Marital Status"
          value={formData.maritalStatus}
          onChange={(e) =>
            updateField("maritalStatus", e.target.value)
          }
          options={["Single", "Married", "Divorced", "Widowed"]}
          error={errors.maritalStatus}
        />

        <Input
          label="Nationality"
          value={formData.nationality}
          onChange={(e) => updateField("nationality", e.target.value)}
          error={errors.nationality}
        />

        <Select
          label="Blood Group"
          value={formData.bloodGroup}
          onChange={(e) =>
            updateField("bloodGroup", e.target.value)
          }
          options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
          error={errors.bloodGroup}
        />
        <Input
          label="Emergency Contact Name"
          value={formData.emergencyName}
          onChange={(e) =>
            updateField("emergencyName", e.target.value)
          }

        />

        <Input
          label="Emergency Contact Number"
          value={formData.emergencyMobile}
          onChange={(e) =>
            updateField("emergencyMobile", e.target.value)
          }
          error={errors.emergencyMobile}
        />

        <Input
          label="Emergency Contact Relation"
          value={formData.emergencyRelation}
          onChange={(e) =>
            updateField("emergencyRelation", e.target.value)
          }

        />
      </div>
    </div>
  );
};

/* =====================================================
   STEP 3 - ADDRESS
===================================================== */

const AddressManagement = ({ formData, updateField, errors }) => {
  const copyPermanentToCurrent = (checked) => {
    updateField("sameAsPermanent", checked);

    if (checked) {
      updateField("currentHouseNo", formData.permanentHouseNo);
      updateField("currentStreet", formData.permanentStreet);
      updateField("currentCity", formData.permanentCity);
      updateField("currentState", formData.permanentState);
      updateField("currentPincode", formData.permanentPincode);
      updateField("currentCountry", formData.permanentCountry);
      updateField("currentAddress", formData.permanentAddress);
    } else {
      updateField("currentHouseNo", "");
      updateField("currentStreet", "");
      updateField("currentCity", "");
      updateField("currentState", "");
      updateField("currentPincode", "");
      updateField("currentCountry", "");
      updateField("currentAddress", "");
    }
  };

  return (
    <div className={styles["step-form"]}>
      <h2>Address Management</h2>

      <p>Enter employee permanent and current address details</p>

      {/* ================= PERMANENT ADDRESS ================= */}

      <h3 className="address-section-title">
        Permanent Address
      </h3>

      <div className={styles["form-grid"]}>
        <Input
          label="House No"
          value={formData.permanentHouseNo}
          onChange={(e) =>
            updateField("permanentHouseNo", e.target.value)
          }
          error={errors?.permanentHouseNo}
        />

        <Input
          label="Street"
          value={formData.permanentStreet}
          onChange={(e) =>
            updateField("permanentStreet", e.target.value)
          }
          error={errors?.permanentStreet}
        />

        <Input
          label="City"
          value={formData.permanentCity}
          onChange={(e) =>
            updateField("permanentCity", e.target.value)
          }
          error={errors?.permanentCity}
        />

        <Input
          label="State"
          value={formData.permanentState}
          onChange={(e) =>
            updateField("permanentState", e.target.value)
          }
          error={errors?.permanentState}
        />

        <Input
          label="Pincode"
          value={formData.permanentPincode}
          onChange={(e) =>
            updateField("permanentPincode", e.target.value)
          }
          error={errors?.permanentPincode}
        />

        <Input
          label="Country"
          value={formData.permanentCountry}
          onChange={(e) =>
            updateField("permanentCountry", e.target.value)
          }
          error={errors?.permanentCountry}
        />
{/* 
       <Input */}
          {/* label="Permanent Address"
          value={formData.permanentAddress}
          onChange={(e) =>
            updateField("permanentAddress", e.target.value)
          }
          error={errors?.permanentAddress}
        /> */}
      </div>

      {/* ================= SAME ADDRESS ================= */}

      <div className={styles["address-copy-option"]}>
        <label>
          <input
            type="checkbox"
            checked={formData.sameAsPermanent}
            onChange={(e) =>
              copyPermanentToCurrent(e.target.checked)
            }
          />

          <span>Same as Permanent Address</span>
        </label>
      </div>

      {/* ================= CURRENT ADDRESS ================= */}

      <h3 className="address-section-title">
        Current Address
      </h3>

      <div className={styles["form-grid"]}>
        <Input
          label="House No"
          value={formData.currentHouseNo}
          onChange={(e) =>
            updateField("currentHouseNo", e.target.value)
          }
          error={errors?.currentHouseNo}
        />

        <Input
          label="Street"
          value={formData.currentStreet}
          onChange={(e) =>
            updateField("currentStreet", e.target.value)
          }
          error={errors?.currentStreet}
        />

        <Input
          label="City"
          value={formData.currentCity}
          onChange={(e) =>
            updateField("currentCity", e.target.value)
          }
          error={errors?.currentCity}
        />

        <Input
          label="State"
          value={formData.currentState}
          onChange={(e) =>
            updateField("currentState", e.target.value)
          }
          error={errors?.currentState}
        />

        <Input
          label="Pincode"
          value={formData.currentPincode}
          onChange={(e) =>
            updateField("currentPincode", e.target.value)
          }
          error={errors?.currentPincode}
        />

        <Input
          label="Country"
          value={formData.currentCountry}
          onChange={(e) =>
            updateField("currentCountry", e.target.value)
          }
          error={errors?.currentCountry}
        />

        {/* <Input
          label="Current Address"
          value={formData.currentAddress}
          onChange={(e) =>
            updateField("currentAddress", e.target.value)
          }
          error={errors?.currentAddress} 
       /> */}
      </div>
    </div>
  );
};

/* =====================================================
   STEP 4 - DOCUMENT MANAGEMENT
===================================================== */

const DocumentManagement = ({ formData, setFormData, errors }) => {
  const documentOptions = [
    {
      key: "PROFILE_PHOTO",
      label: "Passport Size Photo",
      type: "photo",
    },
    {
      key: "AADHAAR",
      label: "Aadhaar",
      type: "identity",
    },
    {
      key: "PAN",
      label: "PAN",
      type: "identity",
    },
    {
      key: "DRIVING_LICENSE",
      label: "Driving License",
      type: "identity",
    },
    {
      key: "TENTH",
      label: "10th Certificate",
      type: "education",
    },
    {
      key: "INTERMEDIATE",
      label: "Intermediate Certificate",
      type: "education",
    },
    {
      key: "DIPLOMA",
      label: "Diploma Certificate",
      type: "education",
    },
    {
      key: "DEGREE",
      label: "Degree Certificate",
      type: "education",
    },
    {
      key: "EXPERIENCE",
      label: "Experience Certificate",
      type: "experience",
    },
    {
      key: "RESUME",
      label: "Resume",
      type: "career",
    },
  ];

  const addDocument = (documentKey, e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const documentDefinition = documentOptions.find(
      (document) => document.key === documentKey
    );

    if (!documentDefinition) {
      return;
    }

    // ==========================================
    // DOCUMENT VALIDATION
    // ==========================================

    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    const fileSizeMB = file.size / (1024 * 1024);

    // PROFILE PHOTO
    if (documentKey === "PROFILE_PHOTO") {
      const allowedTypes = ["image/jpeg", "image/png"];
      const allowedExtensions = [".jpg", ".jpeg", ".png"];

      const hasValidExtension = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!allowedTypes.includes(fileType) || !hasValidExtension) {
        alert("Profile photo must be JPG, JPEG, or PNG");
        e.target.value = "";
        return;
      }

      if (fileSizeMB > 5) {
        alert("Profile photo must not exceed 5 MB");
        e.target.value = "";
        return;
      }
    }

    // ALL OTHER DOCUMENTS
    else {
      const allowedTypes = ["application/pdf"];
      const hasPdfExtension = fileName.endsWith(".pdf");

      if (!hasPdfExtension || !allowedTypes.includes(fileType)) {
        alert(`${documentDefinition.label} must be a PDF file`);
        e.target.value = "";
        return;
      }

      if (fileSizeMB > 10) {
        alert(`${documentDefinition.label} must not exceed 10 MB`);
        e.target.value = "";
        return;
      }
    }

    // ==========================================
    // SAVE VALID DOCUMENT
    // ==========================================

    const newDocument = {
      documentKey,
      documentName: file.name,
      documentType: documentDefinition.type,
      file,
      fileUrl: URL.createObjectURL(file),
      uploadedDate: new Date().toLocaleDateString(),
    };

    setFormData((prev) => ({
      ...prev,
      documents: [
        ...prev.documents.filter(
          (document) => document.documentKey !== documentKey
        ),
        newDocument,
      ],
    }));

    e.target.value = "";
  };
  const removeDocument = (documentKey) => {
    setFormData((prev) => {
      const documentToRemove = prev.documents.find(
        (document) => document.documentKey === documentKey,
      );

      if (documentToRemove?.fileUrl) {
        URL.revokeObjectURL(documentToRemove.fileUrl);
      }

      return {
        ...prev,
        documents: prev.documents.filter(
          (document) => document.documentKey !== documentKey,
        ),
      };
    });
  };

  const getUploadedDocument = (documentKey) => {
    return formData.documents.find(
      (document) => document.documentKey === documentKey,
    );
  };

  return (
    <div className={styles["step-form"]}>
      <h2>Document Management</h2>

      <p>Upload employee documents</p>

      <div className={styles["document-options"]}>
        {documentOptions.map((document) => {
          const uploadedDocument = getUploadedDocument(document.key);

          return (
            <label className={styles["document-box"]} key={document.key}>
              <span>
                {document.type === "education" ? (
                  <GraduationCap size={24} />
                ) : document.type === "experience" ? (
                  <Briefcase size={24} />
                ) : document.type === "photo" ? (
                  <FileIcon size={24} />
                ) : (
                  <FileText size={24} />
                )}
              </span>

              {document.label}

              <input
                type="file"
                onChange={(e) => addDocument(document.key, e)}
              />
              {errors?.[document.key] && (
                <span className={styles["field-error"]}>
                  {errors[document.key]}
                </span>
              )}

              {uploadedDocument && (
                <small>✓ {uploadedDocument.documentName}</small>
              )}
            </label>
          );
        })}
      </div>

      {formData.documents.length > 0 && (
        <div className={styles["uploaded-documents"]}>
          <h3>Uploaded Documents</h3>

          {formData.documents.map((document) => (
            <div className={styles["uploaded-document"]} key={document.documentKey}>
              <div>
                <span>{document.documentName}</span>
                <small>
                  {document.documentKey} · {document.uploadedDate}
                </small>
              </div>

              <button
                type="button"
                onClick={() => removeDocument(document.documentKey)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
/* =====================================================
   REUSABLE INPUT
===================================================== */
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  error,
}) => {
  return (
    <div className={styles["form-group"]}>
      <label>{label}</label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label}`}
      />

      {error && (
        <span className={styles["field-error"]}>
          {error}
        </span>
      )}
    </div>
  );
};
/* =====================================================
   REUSABLE SELECT
===================================================== */
const Select = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
}) => {
  return (
    <div className={styles["form-group"]}>
      <label>{label}</label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">
          {disabled ? `Loading ${label}...` : `Select ${label}`}
        </option>

        {options.map((option) => {
          const optionValue =
            typeof option === "object" ? option.value : option;

          const optionLabel =
            typeof option === "object" ? option.label : option;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>

      {error && (
        <span className={styles["field-error"]}>
          {error}
        </span>
      )}
    </div>
  );
};


export default EmployeeOnboarding;