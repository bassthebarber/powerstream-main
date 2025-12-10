// src/components/NotificationDropdown.jsx
import React from 'react';
import './Notifications.module.css';

const mockNotifications = [
  { id: 1, text: 'Ayana liked your post' },
  { id: 2, text: 'Jairmy commented: 🔥🔥🔥' },
  { id: 3, text: 'Brooklyn followed you' },
];

const NotificationDropdown = () => {
  return (
    <div className="notification-dropdown">
      <h4>Notifications</h4>
      <ul>
        {mockNotifications.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;


