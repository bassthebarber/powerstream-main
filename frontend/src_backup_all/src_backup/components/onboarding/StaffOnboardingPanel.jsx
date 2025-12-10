// StaffOnboardingPanel.jsx
import React from 'react';

export default function StaffOnboardingPanel() {
  return (
    <div className="staff-onboarding">
      <h2>👥 Staff Onboarding</h2>
      <form>
        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email Address" />
        <input type="text" placeholder="Role/Department" />
        <input type="text" placeholder="Bank Account Routing" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
