// Note: Project is under http://localhost/doancuoinam, so API lives at /doancuoinam/src/be_management/api
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/doancuoinam/src/be_management/api";

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
            const errorMsg = (data?.error) || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`Failed to create plan: ${errorMsg}`);
        }

        if (!data?.success) {
            throw new Error((data?.error) || 'Unknown error occurred');
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
            const errorMsg = (data?.error) || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`Failed to create task: ${errorMsg}`);
        }

        if (!data?.success) {
            throw new Error((data?.error) || 'Unknown error occurred');
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

export async function deleteTasksByPlan(ma_ke_hoach) {
    const res = await fetch(`${API_BASE}/lich_lam_viec_delete_by_plan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_ke_hoach })
    });
    if (!res.ok) throw new Error(`Failed to delete tasks by plan: ${res.status}`);
    return res.json();
}

export async function deleteTasksByRange({ from, to } = {}) {
    const res = await fetch(`${API_BASE}/lich_lam_viec_delete_by_range.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to })
    });
    if (!res.ok) throw new Error(`Failed to delete tasks by range: ${res.status}`);
    return res.json();
}

// Materials usage
export async function materialsList() {
    const res = await fetch(`${API_BASE}/materials_list.php`);
    if (!res.ok) throw new Error(`Failed to list materials: ${res.status}`);
    return res.json();
}

export async function upsertMaterialUsage(payload) {
    const res = await fetch(`${API_BASE}/materials_upsert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error((data?.error) || `Failed to save material`);
    return data;
}

// Crop logs per lot (reuse lich_lam_viec)
export async function cropLogsForLot(ma_lo_trong) {
    const res = await fetch(`${API_BASE}/lich_lam_viec_list.php?ma_lo_trong=${encodeURIComponent(ma_lo_trong)}`);
    if (!res.ok) throw new Error(`Failed to load logs: ${res.status}`);
    return res.json();
}

// Alerts
export async function alertsList() {
    const res = await fetch(`${API_BASE}/alerts_list.php`);
    if (!res.ok) throw new Error(`Failed to load alerts: ${res.status}`);
    return res.json();
}

// Giong cay
export async function listGiongCay() {
    const res = await fetch(`${API_BASE}/giong_cay_list.php`);
    if (!res.ok) throw new Error(`Failed to load giong_cay: ${res.status}`);
    return res.json();
}

// Lo trong (lots)
export async function lotsList() {
    const res = await fetch(`${API_BASE}/lo_trong_list.php`);
    if (!res.ok) throw new Error(`Failed to load lots: ${res.status}`);
    return res.json();
}

// Delete lot
export async function deleteLot(ma_lo_trong) {
    const res = await fetch(`${API_BASE}/lo_trong_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_lo_trong })
    });
    if (!res.ok) throw new Error(`Failed to delete lot: ${res.status}`);
    return res.json();
}

// Auto create lot with auto-generated ID
export async function autoCreateLot(dien_tich = 10.0) {
    const res = await fetch(`${API_BASE}/lo_trong_auto_create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dien_tich })
    });
    if (!res.ok) throw new Error(`Failed to create lot: ${res.status}`);
    return res.json();
}

// Process Management APIs
export async function listProcesses() {
    const res = await fetch(`${API_BASE}/quy_trinh_canh_tac_list.php`);
    if (!res.ok) throw new Error(`Failed to list processes: ${res.status}`);
    return res.json();
}

export async function listProcessTasks(quyTrinhId) {
    const res = await fetch(`${API_BASE}/cong_viec_quy_trinh_list.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quy_trinh_id: quyTrinhId })
    });
    if (!res.ok) throw new Error(`Failed to list process tasks: ${res.status}`);
    return res.json();
}

// CRUD for processes
export async function upsertProcess(payload) {
    const res = await fetch(`${API_BASE}/quy_trinh_canh_tac_upsert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to upsert process: ${res.status}`);
    return res.json();
}

export async function deleteProcess(ma_quy_trinh) {
    const res = await fetch(`${API_BASE}/quy_trinh_canh_tac_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_quy_trinh })
    });
    if (!res.ok) throw new Error(`Failed to delete process: ${res.status}`);
    return res.json();
}

// CRUD for process tasks
export async function upsertProcessTask(payload) {
    const res = await fetch(`${API_BASE}/cong_viec_quy_trinh_upsert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to upsert process task: ${res.status}`);
    return res.json();
}

export async function deleteProcessTask(ma_cong_viec) {
    const res = await fetch(`${API_BASE}/cong_viec_quy_trinh_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_cong_viec })
    });
    if (!res.ok) throw new Error(`Failed to delete process task: ${res.status}`);
    return res.json();
}

// Weather suggestion (stub)
export async function weatherSuggestion(ma_lo_trong) {
    const res = await fetch(`${API_BASE}/weather_suggestion.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_lo_trong })
    });
    if (!res.ok) throw new Error(`Failed to load weather suggestion: ${res.status}`);
    return res.json();
}

// Leave requests API
export async function fetchLeaveRequests() {
    let res;
    try {
        res = await fetch(`${API_BASE}/leave_requests.php`);
    } catch (e) {
        throw new Error(`Failed to fetch leave requests: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to fetch leave requests: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function createLeaveRequest(payload) {
    // payload: { worker_id, start_date, end_date, reason, type, status }
    let res;
    try {
        res = await fetch(`${API_BASE}/leave_requests.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        throw new Error(`Failed to create leave request: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to create leave request: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function updateLeaveRequest(payload) {
    // payload: { id, status }
    let res;
    try {
        res = await fetch(`${API_BASE}/leave_requests.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        throw new Error(`Failed to update leave request: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to update leave request: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function deleteLeaveRequest(id) {
    let res;
    try {
        res = await fetch(`${API_BASE}/leave_requests.php?id=${id}`, {
            method: 'DELETE'
        });
    } catch (e) {
        throw new Error(`Failed to delete leave request: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Failed to delete leave request: ${res.status} ${res.statusText}`);
    return res.json();
}