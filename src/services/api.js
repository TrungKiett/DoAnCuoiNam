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

export async function updateUser(payload) {
    let res;
    try {
        res = await fetch(`${API_BASE}/update_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        throw new Error(`Failed to update user: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function deleteUser(id) {
    let res;
    try {
        res = await fetch(`${API_BASE}/delete_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {
        throw new Error(`Failed to delete user: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
    return res.json();
}


// Production Plans (ke_hoach_san_xuat)
export async function listPlans() {
    const res = await fetch(`${API_BASE}/ke_hoach_san_xuat_list.php`);
    if (!res.ok) throw new Error(`Failed to list plans: ${res.status}`);
    return res.json();
}

export async function createPlan(payload) {
    try {
        const res = await fetch(`${API_BASE}/ke_hoach_san_xuat_create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            const errorMsg = data?.error || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`Failed to create plan: ${errorMsg}`);
        }

        if (!data?.success) {
            throw new Error(data?.error || 'Unknown error occurred');
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra XAMPP có đang chạy không.');
        }
        throw error;
    }
}

export async function updatePlan(payload) {
    const res = await fetch(`${API_BASE}/ke_hoach_san_xuat_update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update plan: ${res.status}`);
    return res.json();
}

export async function deletePlan(ma_ke_hoach) {
    const res = await fetch(`${API_BASE}/ke_hoach_san_xuat_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_ke_hoach })
    });
    if (!res.ok) throw new Error(`Failed to delete plan: ${res.status}`);
    return res.json();
}

// Farmers (nong_dan from nguoi_dung table)
export async function fetchFarmers() {
    const res = await fetch(`${API_BASE}/farmers.php`);
    if (!res.ok) throw new Error(`Failed to fetch farmers: ${res.status}`);
    return res.json();
}

// Test connection
export async function testConnection() {
    try {
        const res = await fetch(`${API_BASE}/test_connection.php`);
        if (!res.ok) throw new Error(`Connection test failed: ${res.status}`);
        return res.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra XAMPP có đang chạy không.');
        }
        throw error;
    }
}

// Ensure lo_trong exists
export async function ensureLoTrong(ma_lo_trong) {
    const res = await fetch(`${API_BASE}/ensure_lo_trong.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_lo_trong })
    });
    if (!res.ok) throw new Error(`Failed to ensure lo_trong: ${res.status}`);
    return res.json();
}

// Lịch làm việc (lich_lam_viec)
export async function listTasks() {
    const res = await fetch(`${API_BASE}/lich_lam_viec_list.php`);
    if (!res.ok) throw new Error(`Failed to list tasks: ${res.status}`);
    return res.json();
}

export async function createTask(payload) {
    try {
        const res = await fetch(`${API_BASE}/lich_lam_viec_create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            const errorMsg = data?.error || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`Failed to create task: ${errorMsg}`);
        }

        if (!data?.success) {
            throw new Error(data?.error || 'Unknown error occurred');
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra XAMPP có đang chạy không.');
        }
        throw error;
    }
}

export async function updateTask(payload) {
    const res = await fetch(`${API_BASE}/lich_lam_viec_update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
    return res.json();
}