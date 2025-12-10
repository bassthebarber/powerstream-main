// frontend/src/config/permissions.config.jsx
const permissions = {
  admin: ["manageUsers", "overrideSystem", "viewAllLogs"],
  user: ["post", "comment", "upload"],
  guest: ["view"],
};

export default permissions;
