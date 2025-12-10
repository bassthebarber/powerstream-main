// pages/admin/index.js
import React from 'react';
import AdminDashboard from '../../components/Admin/AdminDashboard';
import styles from '../../styles/AdminDashboard.module.css';

const AdminHomePage = () => {
  return (
    <div className={styles.container}>
      <h1>Admin Control Center</h1>
      <AdminDashboard />
    </div>
  );
};

export default AdminHomePage;
