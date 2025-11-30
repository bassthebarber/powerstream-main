// StaffClockInPanel.jsx
import React from 'react';


export default function StaffClockInPanel() {
return (
<div className="clock-in-panel">
<h2>⏱️ Staff Clock-In</h2>
<form>
<input type="text" placeholder="Employee ID" />
<button>Clock In</button>
</form>
</div>
);
}