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

// Delete single task by id
export async function deleteTask(id) {
    const res = await fetch(`${API_BASE}/lich_lam_viec_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
    return res.json();
}

// Timesheet upsert per worker
export async function logTimesheet({ worker_id, date, hours, task_id }) {
    const res = await fetch(`${API_BASE}/timesheet_upsert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id, date, hours, task_id })
    });
    if (!res.ok) throw new Error(`Failed to log timesheet: ${res.status}`);
    return res.json();
}

// Chấm công (cham_cong)
export async function createChamCong({ lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu }) {
    const res = await fetch(`${API_BASE}/cham_cong_create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lich_lam_viec_id, ma_nguoi_dung, ngay, trang_thai, ghi_chu })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Failed to create cham_cong: ${res.status}`);
    }
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

// Nhiệm vụ khẩn cấp
export async function listUrgentTasks() {
    const res = await fetch(`${API_BASE}/nhiem_vu_khan_cap_list.php`);
    if (!res.ok) throw new Error(`Failed to load urgent tasks: ${res.status}`);
    return res.json();
}

export async function deleteUrgentTask(ma_cong_viec) {
    const res = await fetch(`${API_BASE}/nhiem_vu_khan_cap_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_cong_viec })
    });
    if (!res.ok) throw new Error(`Failed to delete urgent task: ${res.status}`);
    return res.json();
}

export async function updateUrgentTask(taskData) {
    const res = await fetch(`${API_BASE}/nhiem_vu_khan_cap_update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error(`Failed to update urgent task: ${res.status}`);
    return res.json();
}

export async function createUrgentTask(taskData) {
    const res = await fetch(`${API_BASE}/create_urgent_task.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error(`Failed to create urgent task: ${res.status}`);
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
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response' }));
    if (!res.ok || !data.success) {
        const errorMsg = data.error || data.message || `Failed to upsert process task: ${res.status}`;
        const error = new Error(errorMsg);
        error.response = data;
        error.status = res.status;
        throw error;
    }
    return data;
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

// Payroll APIs
export async function fetchPayrollData(startDate, endDate, week, year, workerId, approvedOnly = false) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (week) params.append('week', String(week));
    if (year) params.append('year', String(year));
    if (workerId) params.append('worker_id', String(workerId));
    if (approvedOnly) params.append('approved_only', 'true');
    const res = await fetch(`${API_BASE}/payroll_list.php?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch payroll data: ${res.status}`);
    return res.json();
}

export async function updateHourlyRate(workerId, hourlyRate, periodStart, periodEnd) {
    const res = await fetch(`${API_BASE}/update_hourly_rate.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId, hourly_rate: hourlyRate, period_start: periodStart, period_end: periodEnd })
    });
    if (!res.ok) throw new Error(`Failed to update hourly rate: ${res.status}`);
    return res.json();
}

// Upsert payroll record (save approval)
export async function upsertPayrollRecord({ worker_id, total_hours, hourly_rate, status, week, year, period_name }) {
    // Normalize status to backend-friendly format
    const statusNorm = (() => {
        const v = String(status || '').toLowerCase();
        if (v.includes('approved') || v.includes('đã duyệt') || v.includes('da duyet')) return 'approved';
        if (v.includes('paid') || v.includes('đã thanh toán')) return 'paid';
        return 'pending';
    })();
    const payload = {
        worker_id: Number(worker_id),
        total_hours: Number(total_hours),
        hourly_rate: Number(hourly_rate),
        status: statusNorm,
        week: Number(week),
        year: Number(year),
        period_name: period_name || undefined,
    };
    const res = await fetch(`${API_BASE}/payroll_upsert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    let data;
    try {
        data = await res.json();
    } catch (_) {
        // ignore JSON parse to still surface HTTP errors
    }
    if (!res.ok || data?.success === false) {
        const serverMsg = data?.error ? `: ${data.error}` : '';
        throw new Error(`Failed to upsert payroll${serverMsg}`);
    }
    return data;
}