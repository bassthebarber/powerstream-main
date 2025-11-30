// backend/administration/admin.js
export default function setupAdmin(app) {
  console.log("🛡️ Admin module loaded");

  // Add any admin-related middleware or routes here
  app.get('/api/admin/ping', (req, res) => {
    res.json({ status: 'Admin route active' });
  });
}
