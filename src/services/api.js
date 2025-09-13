// Note: Project is under http://localhost/doancuoinam, so API lives at /doancuoinam/api
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/doancuoinam/api";

export async function fetchUsers() {
  let res;
  try {
    res = await fetch(`${API_BASE}/users.php`);
  } catch (e) {
    throw new Error(`Failed to fetch users: ${e.message}`);
  }
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function createUser(payload) {
  // payload: { username, password, full_name, phone, role }
  let res;
  try {
    res = await fetch(`${API_BASE}/create_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    throw new Error(`Failed to create user: ${e.message}`);
  }
  if (!res.ok) throw new Error(`Failed to create user: ${res.status} ${res.statusText}`);
  return res.json();
}


