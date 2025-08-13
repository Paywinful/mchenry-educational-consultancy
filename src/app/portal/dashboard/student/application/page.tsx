"use client";
import React, { useState } from "react";

type ApplicationType = "university" | "highschool";

interface Application {
  id: number;
  type: ApplicationType;
  data: Record<string, any>;
}

export default function ApplicationPage() {
  const universityList = [
    "University of Ghana",
    "Kwame Nkrumah University of Science and Technology",
    "University of Cape Coast",
    "University for Development Studies",
    "University of Education, Winneba",
    "University of Mines and Technology",
    "University of Professional Studies, Accra",
    "Ghana Institute of Management and Public Administration",
    "Ashesi University",
    "Central University",
    "Valley View University",
    "University of Health and Allied Sciences",
    "University of Energy and Natural Resources",
    // Add more as needed
  ]; // Based on public sources listing Ghanaian universities :contentReference[oaicite:0]{index=0}

  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [applicationType, setApplicationType] = useState<ApplicationType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreate = () => {
    setShowForm(true);
    setApplicationType(null);
    setFormData({});
    setEditId(null);
  };

  const handleEdit = (app: Application) => {
    setShowForm(true);
    setApplicationType(app.type);
    setFormData(app.data);
    setEditId(app.id);
  };

  const handleTypeSelect = (type: ApplicationType) => {
    setApplicationType(type);
    if (!editId) setFormData({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applicationType) return;

    if (editId) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editId ? { ...app, type: applicationType, data: formData } : app
        )
      );
    } else {
      const newApp: Application = {
        id: Date.now(),
        type: applicationType,
        data: formData,
      };
      setApplications([...applications, newApp]);
    }

    setShowForm(false);
    setApplicationType(null);
    setFormData({});
    setEditId(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
        <button
          onClick={handleCreate}
          className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#500a0a] transition"
        >
          Create Application
        </button>
      </div>

      {/* Application List */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Applications</h2>
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="p-4 bg-white rounded-lg shadow border cursor-pointer hover:bg-gray-50"
                onClick={() => handleEdit(app)}
              >
                <strong className="capitalize">{app.type}</strong> — {app.data.fullName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Type Selector */}
      {showForm && !applicationType && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Select Application Type</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleTypeSelect("university")}
              className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg"
            >
              University
            </button>
            <button
              onClick={() => handleTypeSelect("highschool")}
              className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg"
            >
              High School
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Form */}
      {showForm && applicationType && (
        <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow border space-y-4">
          {applicationType === "university" && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                University Admission Form
              </h2>
              {/* University Dropdown */}
              <select
                name="university"
                value={formData.university || ""}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select University</option>
                {universityList.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>

              {/* Other fields remain controlled as before */}
              <input name="fullName" value={formData.fullName || ""} onChange={handleChange} placeholder="Full Name" className="input" required />
              <input name="dob" type="date" value={formData.dob || ""} onChange={handleChange} className="input" required />
              <select name="gender" value={formData.gender || ""} onChange={handleChange} className="input" required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input name="nationality" value={formData.nationality || ""} onChange={handleChange} placeholder="Nationality" className="input" required />
              <input name="idNumber" value={formData.idNumber || ""} onChange={handleChange} placeholder="National ID / Passport Number" className="input" required />
              <input name="email" type="email" value={formData.email || ""} onChange={handleChange} placeholder="Email Address" className="input" required />
              <input name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="Mobile Number" className="input" required />
              <input name="address" value={formData.address || ""} onChange={handleChange} placeholder="Permanent Address" className="input" required />

              {/* Academic Background */}
              <input name="lastSchool" value={formData.lastSchool || ""} onChange={handleChange} placeholder="Last School Attended" className="input" required />
              <input name="schoolCountry" value={formData.schoolCountry || ""} onChange={handleChange} placeholder="Country of Last School" className="input" required />
              <input name="yearAttended" value={formData.yearAttended || ""} onChange={handleChange} placeholder="Year Attended" className="input" required />
              <input name="qualification" value={formData.qualification || ""} onChange={handleChange} placeholder="Final High School Qualification" className="input" required />
              <input name="gradYear" value={formData.gradYear || ""} onChange={handleChange} placeholder="Year of Graduation" className="input" required />
              <input name="grades" value={formData.grades || ""} onChange={handleChange} placeholder="Final Grades / GPA" className="input" required />

              {/* Program Choice */}
              <input name="firstChoice" value={formData.firstChoice || ""} onChange={handleChange} placeholder="First Choice Program" className="input" required />
              <input name="secondChoice" value={formData.secondChoice || ""} onChange={handleChange} placeholder="Second Choice Program (optional)" className="input" />
              <input name="thirdChoice" value={formData.thirdChoice || ""} onChange={handleChange} placeholder="Third Choice Program (optional)" className="input" />

              {/* Guardian */}
              <input name="guardianName" value={formData.guardianName || ""} onChange={handleChange} placeholder="Guardian Full Name" className="input" required />
              <input name="guardianContact" value={formData.guardianContact || ""} onChange={handleChange} placeholder="Guardian Contact Number" className="input" required />

              {/* Additional */}
              <textarea name="medical" value={formData.medical || ""} onChange={handleChange} placeholder="Medical Conditions (if any)" className="input" />

              {/* Declaration */}
              <label className="flex items-center gap-2">
                <input type="checkbox" name="declaration" checked={formData.declaration || false} onChange={handleChange} required /> I confirm that the information provided is correct
              </label>
            </>
          )}

          {/* High School Section */}
          {applicationType === "highschool" && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                High School Admission Form
              </h2>
              <input name="fullName" value={formData.fullName || ""} onChange={handleChange} placeholder="Full Name" className="input" required />
              <input name="dob" type="date" value={formData.dob || ""} onChange={handleChange} className="input" required />
              <input name="previousSchool" value={formData.previousSchool || ""} onChange={handleChange} placeholder="Previous School" className="input" required />
              <input name="lastGrade" value={formData.lastGrade || ""} onChange={handleChange} placeholder="Last Grade Completed" className="input" required />
              <input name="parentName" value={formData.parentName || ""} onChange={handleChange} placeholder="Parent/Guardian Name" className="input" required />
              <input name="parentContact" value={formData.parentContact || ""} onChange={handleChange} placeholder="Parent/Guardian Contact" className="input" required />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="declaration" checked={formData.declaration || false} onChange={handleChange} required /> I confirm that the information provided is correct
              </label>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setApplicationType(null);
                setFormData({});
                setEditId(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#6A0D0D] text-white px-4 py-2 rounded-lg shadow hover:bg-[#500a0a]"
            >
              {editId ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      )}

      {/* Styles */}
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
