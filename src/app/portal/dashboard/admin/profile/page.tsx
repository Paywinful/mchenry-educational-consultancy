"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    role: "Administrator",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        {isEditing ? "Edit Admin Profile" : "My Profile"}
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
              <div className="relative w-24 h-24 mb-3">
                <Image
                  src={photo}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 hover:cursor-pointer"
            />
          </div>

          {/* Personal Info */}
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="input"
            required
          />
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="input"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {/* Contact Info */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="input"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="input"
            required
          />

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
            <div className="relative w-24 h-24">
              <Image
                src={photo || "/default-avatar.png"}
                alt="Profile"
                fill
                className="object-cover rounded-full border"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.fullName}</h2>
              <p className="text-gray-500">{formData.role}</p>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <p>
              <strong>Date of Birth:</strong> {formData.dob}
            </p>
            <p>
              <strong>Gender:</strong> {formData.gender}
            </p>
            <p>
              <strong>Phone:</strong> {formData.phone}
            </p>
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
