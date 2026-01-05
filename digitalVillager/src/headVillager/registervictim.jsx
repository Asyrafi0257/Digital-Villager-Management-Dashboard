import React, { useState, useContext } from "react";
import api from "../backend/api/apiClient";
import { AuthContext } from "../auth/authContext";

export default function RegisterVictim() {
  const { role, kampung } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    victim_name: "",
    ic_number: "",
    phone_number: "",
    address: "",
    marital_status: "single",
    disaster_type: "",
    notes: "",
    household_members: []
  });

  const disasterTypes = [
    "Flood",
    "Fire",
    "Landslide",
    "Storm",
    "Earthquake",
    "Other"
  ];

  const relationships = [
    "Spouse",
    "Child",
    "Parent",
    "Sibling",
    "Grandparent",
    "Grandchild",
    "Other"
  ];

  // Protect: Only Ketua Kampung and admin can access
  if (role !== "ketua kampung" && role !== "kplbHQ") {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        <h2>Access Denied</h2>
        <p>Only Ketua Kampung can register disaster victims.</p>
      </div>
    );
  }

  const handleAddMember = () => {
    setFormData({
      ...formData,
      household_members: [
        ...formData.household_members,
        { member_name: "", relationship: "", ic_number: "", age: "" }
      ]
    });
  };

  const handleRemoveMember = (index) => {
    const newMembers = formData.household_members.filter((_, i) => i !== index);
    setFormData({ ...formData, household_members: newMembers });
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.household_members];
    newMembers[index][field] = value;
    setFormData({ ...formData, household_members: newMembers });
  };

  const handleMaritalStatusChange = (status) => {
    setFormData({
      ...formData,
      marital_status: status,
      household_members: status === "married" ? formData.household_members : []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.victim_name || !formData.disaster_type) {
      setError("Victim name and disaster type are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("Submitting victim data:", formData);
      const { data } = await api.post("/register_victim.php", formData);
      
      if (data.success) {
        setSuccess("Disaster victim registered successfully!");
        // Reset form
        setFormData({
          victim_name: "",
          ic_number: "",
          phone_number: "",
          address: "",
          marital_status: "single",
          disaster_type: "",
          notes: "",
          household_members: []
        });
      }
    } catch (err) {
      console.error("Error registering victim:", err);
      setError(err.response?.data?.error || "Failed to register victim");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: 20,
    width:1280,
    margin: "0 auto"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: 20
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "10px 20px",
    marginRight: 10,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500"
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  const successButton = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white"
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white"
  };

  return (
    <div style={containerStyle}>
      <h1>Register Disaster Victim</h1>
      
      {kampung && (
        <div style={{
          padding: "10px 15px",
          backgroundColor: "#e7f3ff",
          borderRadius: 6,
          marginBottom: 20,
          fontSize: "14px",
          color: "#1976d2"
        }}>
          🏘️ Registering for: <strong>{kampung}</strong>
        </div>
      )}

      {error && (
        <div style={{
          ...cardStyle,
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderLeft: "4px solid #f5c6cb"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          ...cardStyle,
          backgroundColor: "#d4edda",
          color: "#155724",
          borderLeft: "4px solid #c3e6cb"
        }}>
          ✓ {success}
        </div>
      )}

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          {/* Victim Information */}
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>Victim Information</h2>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              Victim Name *
            </label>
            <input
              type="text"
              value={formData.victim_name}
              onChange={(e) => setFormData({ ...formData, victim_name: e.target.value })}
              placeholder="Enter full name"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                IC Number
              </label>
              <input
                type="text"
                value={formData.ic_number}
                onChange={(e) => setFormData({ ...formData, ic_number: e.target.value })}
                placeholder="e.g., 990101-01-1234"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="e.g., 012-3456789"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              rows={3}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Marital Status *
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => handleMaritalStatusChange(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Disaster Type *
              </label>
              <select
                value={formData.disaster_type}
                onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">-- Select Disaster Type --</option>
                {disasterTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              Notes / Additional Information
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              rows={3}
            />
          </div>

          {/* Household Members Section - Only for Married */}
          {formData.marital_status === "married" && (
            <div style={{
              padding: 20,
              backgroundColor: "#f8f9fa",
              borderRadius: 6,
              marginBottom: 20
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15
              }}>
                <h3 style={{ margin: 0, color: "#333" }}>
                  Household Members ({formData.household_members.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddMember}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#17a2b8",
                    color: "white"
                  }}
                >
                  + Add Member
                </button>
              </div>

              {formData.household_members.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#666",
                  fontSize: "14px"
                }}>
                  No household members added yet. Click "Add Member" to add family members.
                </div>
              ) : (
                <div>
                  {formData.household_members.map((member, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "white",
                        padding: 15,
                        borderRadius: 6,
                        marginBottom: 10,
                        border: "1px solid #ddd"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10
                      }}>
                        <strong style={{ fontSize: "14px", color: "#333" }}>
                          Member #{index + 1}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          style={{
                            ...buttonStyle,
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "5px 10px",
                            fontSize: "12px"
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 3, fontSize: "13px", fontWeight: "500" }}>
                            Name *
                          </label>
                          <input
                            type="text"
                            value={member.member_name}
                            onChange={(e) => handleMemberChange(index, "member_name", e.target.value)}
                            placeholder="Member name"
                            style={inputStyle}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: 3, fontSize: "13px", fontWeight: "500" }}>
                            Relationship *
                          </label>
                          <select
                            value={member.relationship}
                            onChange={(e) => handleMemberChange(index, "relationship", e.target.value)}
                            style={inputStyle}
                            required
                          >
                            <option value="">-- Select --</option>
                            {relationships.map(rel => (
                              <option key={rel} value={rel}>{rel}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 3, fontSize: "13px", fontWeight: "500" }}>
                            IC Number
                          </label>
                          <input
                            type="text"
                            value={member.ic_number}
                            onChange={(e) => handleMemberChange(index, "ic_number", e.target.value)}
                            placeholder="e.g., 990101-01-1234"
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: 3, fontSize: "13px", fontWeight: "500" }}>
                            Age
                          </label>
                          <input
                            type="number"
                            value={member.age}
                            onChange={(e) => handleMemberChange(index, "age", e.target.value)}
                            placeholder="Age"
                            style={inputStyle}
                            min="0"
                            max="150"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...successButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                padding: "12px 30px"
              }}
            >
              {loading ? "Registering..." : "✓ Register Victim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}