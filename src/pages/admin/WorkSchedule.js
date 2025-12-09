import React, { useEffect, useMemo, useState } from "react";
import { listTasks, createTask, updateTask, fetchFarmers, deleteTasksByRange, listPlans } from "../../services/api";
import AdminCalendarView from "../../components/admin/AdminCalendarView";

function formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    d.setDate(diff);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function WorkSchedule() {
    const [tasks, setTasks] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState("");

    const toDisplay = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "string" || typeof v === "number") return v;
        try {
            return String(v);
        } catch {
            return "";
        }
    };

    const sanitizeTasks = (list) => {
        if (!Array.isArray(list)) return [];
        return list.filter(Boolean).map((t) => ({
            ...t,
            ten_cong_viec: toDisplay(t.ten_cong_viec),
            thoi_gian_bat_dau: toDisplay(t.thoi_gian_bat_dau),
            thoi_gian_ket_thuc: toDisplay(t.thoi_gian_ket_thuc),
            ngay_bat_dau: toDisplay(t.ngay_bat_dau),
            ngay_ket_thuc: toDisplay(t.ngay_ket_thuc),
            ghi_chu: toDisplay(t.ghi_chu),
            loai_cong_viec: toDisplay(t.loai_cong_viec),
            trang_thai: toDisplay(t.trang_thai),
            ma_nguoi_dung: toDisplay(t.ma_nguoi_dung),
            uu_tien: toDisplay(t.uu_tien),
            ma_ke_hoach: toDisplay(t.ma_ke_hoach),
        }));
    };

    const sanitizeFarmers = (list) => {
        if (!Array.isArray(list)) return [];
        return list.filter(Boolean).map((f) => ({
            ...f,
            full_name: toDisplay(f.full_name || f.ho_ten),
            ho_ten: toDisplay(f.ho_ten),
        }));
    };

    const sanitizePlans = (list) => {
        if (!Array.isArray(list)) return [];
        return list.filter(Boolean).map((p) => ({
            ...p,
            ma_ke_hoach: toDisplay(p.ma_ke_hoach),
            ma_lo_trong: toDisplay(p.ma_lo_trong),
            ten_giong: toDisplay(p.ten_giong),
            trang_thai: toDisplay(p.trang_thai),
        }));
    };

    async function loadInitial() {
        try {
            const [t, f, p] = await Promise.all([listTasks(), fetchFarmers(), listPlans()]);
            if (t?.success) setTasks(sanitizeTasks(t.data || []));
            if (f?.success) setFarmers(sanitizeFarmers(f.data || []));
            if (p?.success) setPlans(sanitizePlans(p.data || []));
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => {
        loadInitial();
        // Lắng nghe các sự kiện yêu cầu làm mới dữ liệu nhiệm vụ
        function handleUpdated() {
            listTasks().then(t => { if (t?.success) setTasks(sanitizeTasks(t.data || [])); });
        }
        window.addEventListener('tasks-updated', handleUpdated);
        // Hỗ trợ cập nhật chéo tab qua localStorage
        function handleStorage(e) {
            if (e.key === 'tasks_updated_at') handleUpdated();
        }
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('tasks-updated', handleUpdated);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    return ( <
        AdminCalendarView tasks = { tasks }
        farmers = { farmers }
        plans = { plans }
        onCreateTask = {
            async(payload) => {
                const data = {...payload, ma_nguoi_dung: Array.isArray(payload.ma_nguoi_dung) ? payload.ma_nguoi_dung.join(',') : payload.ma_nguoi_dung };
                await createTask(data);
                const t = await listTasks();
                if (t?.success) setTasks(sanitizeTasks(t.data || []));
            }
        }
        onUpdateTask = {
            async(id, changes) => {
                await updateTask({ id, ...changes });
                const t = await listTasks();
                if (t?.success) setTasks(sanitizeTasks(t.data || []));
            }
        }
        onDeleteRange = {
            async(from, to) => {
                await deleteTasksByRange({ from, to });
                const t = await listTasks();
                if (t?.success) setTasks(sanitizeTasks(t.data || []));
            }
        }
        />
    );
}