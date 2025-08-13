"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    visaType: "",
    visaExpiry: "",
    email: "",
    phoneInternational: "",
    phoneLocal: "",
    addressHomeCountry: "",
    addressGhana: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    medicalConditions: "",
    allergies: "",
    dietaryPreferences: "",
    accommodationType: "",
    roommatePreference: "",
    guardianName: "",
    guardianContact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? "Edit Personal & Housing Details" : "My Profile"}
      </h1>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow border space-y-4"
        >
          {/* Profile Photo */}
          <div>
            <label className="block mb-2 font-medium">Profile Photo</label>
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full mb-3 border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 hover:cursor-pointer"
            />

          </div>

          {/* Personal Info */}
          <h2 className="text-lg font-semibold text-gray-700">
            Personal Information
          </h2>
          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="input" required />
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input" required />
          <select name="gender" value={formData.gender} onChange={handleChange} className="input" required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nationality" className="input" required />

          {/* Passport / Visa */}
          <h2 className="text-lg font-semibold text-gray-700">Travel Documents</h2>
          <input name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="Passport Number" className="input" required />
          <input type="date" name="passportExpiry" value={formData.passportExpiry} onChange={handleChange} className="input" required />
          <input name="visaType" value={formData.visaType} onChange={handleChange} placeholder="Visa Type" className="input" />
          <input type="date" name="visaExpiry" value={formData.visaExpiry} onChange={handleChange} className="input" />

          {/* Contact Info */}
          <h2 className="text-lg font-semibold text-gray-700">Contact Details</h2>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input" required />
          <input name="phoneInternational" value={formData.phoneInternational} onChange={handleChange} placeholder="International Phone Number" className="input" required />
          <input name="phoneLocal" value={formData.phoneLocal} onChange={handleChange} placeholder="Local Ghana Phone Number" className="input" />
          <input name="addressHomeCountry" value={formData.addressHomeCountry} onChange={handleChange} placeholder="Address in Home Country" className="input" required />
          <input name="addressGhana" value={formData.addressGhana} onChange={handleChange} placeholder="Address in Ghana (if any)" className="input" />

          {/* Emergency Contact */}
          <h2 className="text-lg font-semibold text-gray-700">Emergency Contact</h2>
          <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Emergency Contact Name" className="input" required />
          <input name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} placeholder="Relationship" className="input" required />
          <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Emergency Phone Number" className="input" required />

          {/* Health */}
          <h2 className="text-lg font-semibold text-gray-700">Health & Dietary</h2>
          <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="Medical Conditions" className="input" />
          <textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Allergies" className="input" />
          <textarea name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange} placeholder="Dietary Preferences" className="input" />

          {/* Housing */}
          <h2 className="text-lg font-semibold text-gray-700">Accommodation Preferences</h2>
          <select name="accommodationType" value={formData.accommodationType} onChange={handleChange} className="input">
            <option value="">Select Accommodation Type</option>
            <option>Single Room</option>
            <option>Shared Room</option>
            <option>Apartment</option>
          </select>
          <input name="roommatePreference" value={formData.roommatePreference} onChange={handleChange} placeholder="Preferred Roommate Name (if any)" className="input" />

          {/* Guardian */}
          <h2 className="text-lg font-semibold text-gray-700">Guardian in Ghana</h2>
          <input name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian Full Name" className="input" />
          <input name="guardianContact" value={formData.guardianContact} onChange={handleChange} placeholder="Guardian Contact Number" className="input" />

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#500a0a]"
            >
              Save Details
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow border space-y-4">
          <div className="flex items-center gap-4">
            <Image
                src={photo || "/default-avatar.png"}
                alt="Profile"
                fill
                className="object-cover rounded-full border"
              />
            <div>
              <h2 className="text-xl font-semibold">{formData.fullName}</h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <p><strong>Date of Birth:</strong> {formData.dob}</p>
            <p><strong>Gender:</strong> {formData.gender}</p>
            <p><strong>Nationality:</strong> {formData.nationality}</p>
            <p><strong>Passport Number:</strong> {formData.passportNumber}</p>
            <p><strong>Visa Type:</strong> {formData.visaType}</p>
            <p><strong>Phone (Intl):</strong> {formData.phoneInternational}</p>
            <p><strong>Address (Home):</strong> {formData.addressHomeCountry}</p>
            <p><strong>Accommodation:</strong> {formData.accommodationType}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#500a0a] mt-4"
          >
            Edit Profile
          </button>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
}
