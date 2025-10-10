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

    async function loadInitial() {
        try {
            const [t, f, p] = await Promise.all([listTasks(), fetchFarmers(), listPlans()]);
            if (t?.success) setTasks(t.data || []);
            if (f?.success) setFarmers(f.data || []);
            if (p?.success) setPlans(p.data || []);
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => {
        loadInitial();
        // Lắng nghe các sự kiện yêu cầu làm mới dữ liệu nhiệm vụ
        function handleUpdated() {
            listTasks().then(t => { if (t?.success) setTasks(t.data || []); });
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
                if (t?.success) setTasks(t.data || []);
            }
        }
        onUpdateTask = {
            async(id, changes) => {
                await updateTask({ id, ...changes });
                const t = await listTasks();
                if (t?.success) setTasks(t.data || []);
            }
        }
        onDeleteRange = {
            async(from, to) => {
                await deleteTasksByRange({ from, to });
                const t = await listTasks();
                if (t?.success) setTasks(t.data || []);
            }
        }
        />
    );
}