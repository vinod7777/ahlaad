// Server configuration for self-hosted backend
// Use VITE_API_BASE_URL environment variable to set the API endpoint
// Production: https://pandiitacademy.org/backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pandiitacademy.org/backend';

// API endpoints (relative to API_BASE_URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login.php',
    SIGNUP: '/signup.php',
    REGISTER_EVENT: '/register_event.php',
  },
  ADMIN: {
    GET_ALL_DATA: '/admin_get_all_data.php',
    GET_USERS: '/admin_get_users.php',
    GET_ANALYTICS: '/admin_get_analytics.php',
    APPROVE_REGISTRATION: '/admin_approve_registration.php',
    DECLINE_REGISTRATION: '/admin_decline_registration.php',
    UPDATE_USER: '/admin_update_user.php',
    DELETE_USER: '/admin_delete_user.php',
    GET_VOLUNTEERS_TASKS: '/admin_get_volunteers_tasks.php',
    ASSIGN_TASK: '/admin_assign_task.php',
    IMPORT_VOLUNTEERS: '/admin_import_volunteers.php',
  },
  CHECKIN: {
    SCAN: '/checkin_scan.php',
    GET_ALL: '/checkin_get_all.php',
    REVERT: '/admin_revert_checkin.php',
  },
  DATA: {
    GET_DASHBOARD: '/get_user_dashboard_data.php',
    GET_TIMELINE: '/get_timeline.php',
    UPDATE_TIMELINE: '/update_timeline.php',
  },
};

