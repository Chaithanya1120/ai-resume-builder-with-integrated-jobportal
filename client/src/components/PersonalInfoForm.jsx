import { BriefcaseBusiness, Globe, Linkedin, Mail, MapPin, Phone, User } from 'lucide-react';
import React from 'react';

const PersonalInfoForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    handleChange("image", file);
  };

  const fields = [
    { key: "full_name", label: "Full Name", icon: User, type: "text", required: true },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
    { key: "location", label: "Location", icon: MapPin, type: "text" },
    { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
    { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
    { key: "website", label: "Personal Website", icon: Globe, type: "url" }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      <p className="text-sm text-gray-600">Get Started with the personal information</p>
      
      <div className="flex items-center gap-4 my-4">
        <label className="relative cursor-pointer group">
          {data.image ? (
            <div className="relative">
              <img
                src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)}
                alt="user-image"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-300 group-hover:opacity-80 transition-all"
              />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 cursor-pointer">
              <User className="size-12 p-3 border border-slate-300 rounded-full bg-slate-50" />
              <span className="text-sm font-medium">Upload user photo</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
        </label>
      </div>

      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.key} className="space-y-1 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icon className="size-4 text-indigo-500" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={data[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              required={field.required}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PersonalInfoForm;
