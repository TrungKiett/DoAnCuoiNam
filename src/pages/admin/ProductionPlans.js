import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    ListItemText,
} from "@mui/material";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RoomIcon from "@mui/icons-material/Room";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import CategoryIcon from "@mui/icons-material/Category";
import EventIcon from "@mui/icons-material/Event";
import axios from "axios";
import {
    createPlan,
    ensureLoTrong,
    listPlans,
    deletePlan,
    createTask,
    deleteTasksByPlan,
    listTasks,
    fetchFarmers,
    updatePlan,
    updateTask,
    listProcesses,
    listProcessTasks,
    upsertProcess,
    deleteProcess,
    upsertProcessTask,
    deleteProcessTask,
    deleteLot,
    autoCreateLot,
} from "../../services/api";

export default function ProductionPlans() {
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lots, setLots] = useState([]);
    const [giongs, setGiongs] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [savedFilter, setSavedFilter] = useState("all"); // all | chuan_bi | dang_trong | da_thu_hoach
    const [savedFrom, setSavedFrom] = useState(""); // YYYY-MM-DD
    const [savedTo, setSavedTo] = useState("");
    const [form, setForm] = useState({
        ma_lo_trong: "",
        ngay_bat_dau: "",
        ngay_du_kien_thu_hoach: "",
        ma_giong: "",
        dien_tich_trong: "10",
        so_luong_nhan_cong: "",
        ma_quy_trinh: "",
        thoi_gian_canh_tac: "",
        don_vi_thoi_gian: "ngay", // "ngay", "thang" hoặc "nam"
    });
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openMap, setOpenMap] = useState(false);
    const [selectedLotForMap, setSelectedLotForMap] = useState(null);
    const [minStartDate, setMinStartDate] = useState(""); // YYYY-MM-DD khi lô đã có KH: ngày bắt đầu mới phải >= ngày thu hoạch cũ + 10
    const [dateError, setDateError] = useState("");
    const [openCreateLot, setOpenCreateLot] = useState(false);
    const [newLotArea, setNewLotArea] = useState("10");
    const [openEdit, setOpenEdit] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [editingTasks, setEditingTasks] = useState([]);
    const [addingTask, setAddingTask] = useState({
        ten_cong_viec: "",
        mo_ta: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        thoi_gian_bat_dau: "07:00",
        thoi_gian_ket_thuc: "17:00",
        ma_nguoi_dung: "",
    });
    const [schedulePreview, setSchedulePreview] = useState([]);
    const [openProcessMgr, setOpenProcessMgr] = useState(false);

    // tạo giống cây
    const [OpenCreateTree, setOpenCreateTree] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [list, setList] = useState([]);
    useEffect(() => {
        fetch(
                "http://localhost/doancuoinam/src/be_management/acotor/admin/list_giong_cay.php", {
                    credentials: "include",
                }
            )
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setList(data.data);
                } else {
                    console.error("Lỗi:", data.message);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    }, []);
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        ten_giong: "",
        hinh_anh: "",
        so_luong_ton: "",
        ngay_mua: "",
        nha_cung_cap: "",
    });

    // Thông báo hiển thị trong modal
    const [message, setMessage] = useState("");

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "hinh_anh") {
            setFormData({
                ...formData,
                hinh_anh: files[0],
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Gửi dữ liệu về backend PHP
    const handleSaveTree = async() => {
        if (!formData.ten_giong ||
            !formData.hinh_anh ||
            !formData.so_luong_ton ||
            !formData.ngay_mua ||
            !formData.nha_cung_cap
        ) {
            setMessage("⚠️ Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (Number(formData.so_luong_ton) <= 0) {
            setMessage("⚠️ Số lượng tồn phải lớn hơn 0!");
            return;
        }

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            const res = await axios.post(
                "http://localhost/doancuoinam/src/be_management/acotor/admin/tao_giong_cay.php",
                data, {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.data.success) {
                alert("✅ Tạo giống cây thành công!");

                // 👉 Cập nhật danh sách giống cây ngay

                // Reset form sau 1.5s và đóng modal
                setTimeout(() => {
                    setOpenCreateTree(false);
                    setMessage("");
                    setFormData({
                        ten_giong: "",
                        hinh_anh: "",
                        so_luong_ton: "",
                        ngay_mua: "",
                        nha_cung_cap: "",
                    });
                }, 1500);
            } else {
                setMessage("⚠️ " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Lỗi kết nối đến máy chủ!");
        }
    };
    const handleUpdateTree = async() => {
        if (!formData.ten_giong ||
            !formData.so_luong_ton ||
            !formData.ngay_mua ||
            !formData.nha_cung_cap
        ) {
            setMessage("⚠️ Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        try {
            const data = new FormData();
            data.append("id", selectedId);
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            const res = await axios.post(
                "http://localhost/doancuoinam/src/be_management/acotor/admin/update_giong_cay.php",
                data, { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.data.success) {
                alert("✅ Cập nhật giống cây thành công!");
                // Cập nhật lại danh sách ngay
                fetch(
                        "http://localhost/doancuoinam/src/be_management/acotor/admin/list_giong_cay.php", { credentials: "include" }
                    )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) setList(data.data);
                    });

                setTimeout(() => {
                    setIsEdit(false);
                    setSelectedId(null);
                    setFormData({
                        ten_giong: "",
                        hinh_anh: "",
                        so_luong_ton: "",
                        ngay_mua: "",
                        nha_cung_cap: "",
                    });
                    setMessage("");
                }, 1500);
            } else {
                setMessage("⚠️ " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Lỗi kết nối đến máy chủ!");
        }
    };

    const [selectedProcess, setSelectedProcess] = useState(null);
    const [processForm, setProcessForm] = useState({
        ma_quy_trinh: null,
        ten_quy_trinh: "",
        ma_giong: "",
        mo_ta: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        ghi_chu: "",
    });
    const [processTasks, setProcessTasks] = useState([]);

    // Khuyến nghị offset (ngày +offset tính từ ngày bắt đầu kế hoạch) cho Ngô/Đậu theo chuẩn hệ thống
    function recommendOffsets(ma_giong, title) {
        const t = (title || "").toLowerCase();
        // Suy ra nhóm giống theo tên trong danh mục
        const g = Array.isArray(giongs) ?
            giongs.find((x) => String(x.id) === String(ma_giong)) :
            null;
        const name = (g ?.ten_giong || "").toLowerCase();
        const isSoy = name.includes("đậu") || name.includes("dau");
        const isCorn =
            name.includes("ngô") || name.includes("ngo") || name.includes("lvn10");

        // Mặc định 0
        let start = 0,
            end = 0;
        if (isCorn) {
            // Ngô LVN10 (đã chuẩn hóa):
            if (t.includes("làm đất")) {
                start = 0;
                end = 0;
            } else if (t.includes("gieo")) {
                start = 5;
                end = 5;
            } else if (t.includes("nảy mầm")) {
                start = 9;
                end = 9;
            } // 5 (gieo) + 4
            else if (t.includes("tỉa") || t.includes(" tia ") || t.includes("dặm")) {
                start = 16;
                end = 16;
            } // 9 + 7
            else if (t.includes("bón thúc") && t.includes("lần 1")) {
                start = 30;
                end = 30;
            } // 16 + 14
            else if (t.includes("bón thúc") && t.includes("lần 2")) {
                start = 34;
                end = 34;
            } // 30 + 4
            else if (t.includes("tưới") || t.includes("phòng")) {
                start = 41;
                end = 41;
            } // 34 + 7 đầu tiên
        } else if (isSoy) {
            // Đậu tương ĐT2000 (chuẩn hóa theo yêu cầu):
            if (t.includes("làm đất")) {
                start = 0;
                end = 2;
            } // 3 ngày làm đất
            else if (t.includes("gieo")) {
                start = 3;
                end = 3;
            } else if (t.includes("nảy mầm")) {
                start = 8;
                end = 9;
            } // 5-6 sau gieo -> 3+5..3+6
            else if (t.includes("tỉa") || t.includes("dặm")) {
                start = 12;
                end = 12;
            } // ~9 sau gieo -> 12
            else if (t.includes("bón thúc") && t.includes("lần 1")) {
                start = 23;
                end = 23;
            } // 12 + 11
            else if (t.includes("bón thúc") && t.includes("lần 2")) {
                start = 39;
                end = 39;
            } // 23 + 16
            else if (t.includes("tưới") || t.includes("phòng")) {
                start = 12;
                end = 12;
            } // ~9 sau gieo -> 12 từ start
        }
        return { start, end };
    }

    useEffect(() => {
        (async() => {
            try {
                setLoading(true);
                const API_BASE = "http://localhost/doancuoinam/src/be_management/api";
                const [plansRes, lotsRes, giongRes, farmersRes, processesRes] =
                await Promise.all([
                    listPlans(),
                    fetch(`${API_BASE}/lo_trong_list.php`)
                    .then((r) => r.json())
                    .catch(() => ({})),
                    fetch(`${API_BASE}/giong_cay_list.php`)
                    .then((r) => r.json())
                    .catch(() => ({})),
                    fetchFarmers(),
                    listProcesses(),
                ]);
                if (plansRes ?.success) setPlans(plansRes.data || []);
                // Bảo đảm luôn hiển thị tối thiểu 6 lô (1..6)
                {
                    const apiLots =
                        lotsRes ?.success && Array.isArray(lotsRes.data) ? lotsRes.data : [];
                    // Only show actual existing lots, then pad with placeholders to keep 6 tiles minimum
                    // Loại bỏ duplicate dựa trên ma_lo_trong hoặc id
                    const lotMap = new Map();
                    apiLots
                        .filter(Boolean)
                        .forEach((x) => {
                            const lotId = String(x.ma_lo_trong ?? x.id);
                            if (lotId && lotId !== "undefined" && lotId !== "null") {
                                // Chỉ lưu lần đầu tiên gặp, bỏ qua duplicate
                                if (!lotMap.has(lotId)) {
                                    lotMap.set(lotId, { ...x, id: lotId });
                                }
                            }
                        });
                    
                    const existing = Array.from(lotMap.values())
                        .sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
                    
                    const taken = new Set(existing.map((x) => String(x.id)));
                    const display = [...existing];
                    let nextId = 1;
                    while (display.length < 6) {
                        while (taken.has(String(nextId))) nextId++;
                        display.push({ id: String(nextId) });
                        nextId++;
                    }
                    setLots(display);
                }
                if (giongRes ?.success) setGiongs(giongRes.data || []);
                if (farmersRes ?.success) setFarmers(farmersRes.data || []);
                if (processesRes ?.success) setProcesses(processesRes.data || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Load schedule preview when selectedPlan changes
    useEffect(() => {
        if (selectedPlan) {
            console.log('🔄 Loading schedule preview for plan:', {
                ma_ke_hoach: selectedPlan.ma_ke_hoach,
                ma_quy_trinh: selectedPlan.ma_quy_trinh,
                ma_giong: selectedPlan.ma_giong,
                ngay_bat_dau: selectedPlan.ngay_bat_dau
            });
            
            if (processes.length > 0) {
                generateScheduleFromDB(selectedPlan)
                    .then((result) => {
                        console.log('📊 Schedule generation result:', result);
                        // result có thể là object { error, schedule } hoặc array (backward compatibility)
                        if (result && typeof result === 'object' && 'schedule' in result) {
                            setSchedulePreview(result.schedule || []);
                            if (result.fallbackToDefault) {
                                console.warn('⚠️ Đang sử dụng công thức chuẩn thay vì quy trình từ database');
                            }
                        } else if (Array.isArray(result)) {
                            setSchedulePreview(result);
                        } else {
                            setSchedulePreview([]);
                        }
                    })
                    .catch((error) => {
                        console.error('❌ Error generating schedule:', error);
                    });
            } else {
                console.warn('⚠️ Chưa load danh sách quy trình, đợi...');
            }
        } else {
            setSchedulePreview([]);
        }
    }, [selectedPlan, processes]);

    const DEFAULT_AREA_PER_LOT_HA = 10; // Mặc định mỗi lô = 10ha

    function toYmd(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function addDays(dateStr, days) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return "";
        d.setDate(d.getDate() + days);
        return toYmd(d);
    }

    function normalizeText(input) {
        const s = (input || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return s.replace(/đ/gi, "d").toLowerCase();
    }

    // Hàm sinh lịch trình từ database
    async function generateScheduleFromDB(plan) {
        try {
            // Kiểm tra ngày bắt đầu trước
            const start = plan?.ngay_bat_dau ?
                String(plan.ngay_bat_dau).slice(0, 10) :
                "";
            if (!start) {
                console.warn('generateScheduleFromDB - Thiếu ngày bắt đầu');
                return { error: 'missing_start_date', schedule: [] };
            }
            
            const cropName = (() => {
                const g = Array.isArray(giongs) ?
                    giongs.find((x) => String(x.id) === String(plan.ma_giong)) :
                    null;
                return g?.ten_giong || "";
            })();

            const norm = normalizeText(cropName);
            const isSoy = norm.includes("dau");
            const isDT2000 = isSoy && norm.includes("dt2000");
            const isMango = norm.includes("xoai") || norm.includes("mango");

            // Ưu tiên dùng quy trình từ DB nếu có; nếu không có thì fallback công thức mặc định
            let process = null;
            
            // Kiểm tra ma_quy_trinh có giá trị hợp lệ
            const hasQuyTrinh = plan && plan.ma_quy_trinh != null && 
                               plan.ma_quy_trinh !== "" && 
                               plan.ma_quy_trinh !== undefined &&
                               plan.ma_quy_trinh !== 0;
            
            // Debug log
            if (plan) {
                console.log('🔍 generateScheduleFromDB - plan.ma_quy_trinh:', plan.ma_quy_trinh);
                console.log('🔍 generateScheduleFromDB - hasQuyTrinh:', hasQuyTrinh);
                console.log('🔍 generateScheduleFromDB - processes.length:', processes?.length || 0);
                console.log('🔍 generateScheduleFromDB - available processes:', processes?.map(p => ({ id: p.ma_quy_trinh, name: p.ten_quy_trinh, ma_giong: p.ma_giong })) || []);
            }
            
            if (hasQuyTrinh && Array.isArray(processes) && processes.length > 0) {
                // So sánh cả string và number để đảm bảo tìm thấy
                process = processes.find(
                    (p) => String(p.ma_quy_trinh) === String(plan.ma_quy_trinh) || 
                           Number(p.ma_quy_trinh) === Number(plan.ma_quy_trinh)
                );
                if (process) {
                    console.log(`✅ Tìm thấy quy trình: "${process.ten_quy_trinh}" (ID: ${process.ma_quy_trinh}, type: ${typeof process.ma_quy_trinh})`);
                    console.log(`✅ Plan ma_quy_trinh: ${plan.ma_quy_trinh} (type: ${typeof plan.ma_quy_trinh})`);
                } else {
                    console.warn(`❌ KHÔNG tìm thấy quy trình với ma_quy_trinh: ${plan.ma_quy_trinh} (type: ${typeof plan.ma_quy_trinh})`);
                    console.warn('Available processes:', processes.map(p => ({ 
                        id: p.ma_quy_trinh, 
                        name: p.ten_quy_trinh,
                        type: typeof p.ma_quy_trinh 
                    })));
                }
            }
            
            // Nếu không tìm thấy quy trình theo ma_quy_trinh, KHÔNG fallback về ma_giong
            // Vì người dùng đã chọn quy trình cụ thể, nếu không tìm thấy thì trả về rỗng
            // thay vì dùng quy trình khác
            if (!process && hasQuyTrinh) {
                // Có ma_quy_trinh nhưng không tìm thấy process -> có thể process đã bị xóa
                console.warn(`Không tìm thấy quy trình với ma_quy_trinh: ${plan.ma_quy_trinh}`);
                console.warn('Available processes:', processes.map(p => ({ id: p.ma_quy_trinh, name: p.ten_quy_trinh })));
                return { error: 'process_not_found', schedule: [] };
            }
            
            // Chỉ tìm theo ma_giong nếu KHÔNG có ma_quy_trinh
            if (!process && !hasQuyTrinh && Array.isArray(processes) && processes.length > 0) {
                // Tìm quy trình phù hợp dựa trên ma_giong
                process = processes.find(
                    (p) => String(p.ma_giong) === String(plan.ma_giong)
                );
            }

            if (!process) {
                // Không có quy trình: sinh theo công thức chuẩn
                const schedule = isDT2000 ?
                    generateSoySchedule(plan) :
                    (isMango ? generateMangoSchedule(plan) : generateRiceSchedule(plan));
                return { error: null, schedule };
            }

            // Lấy danh sách công việc từ quy trình
            console.log(`📋 Đang lấy công việc từ quy trình "${process.ten_quy_trinh}" (ID: ${process.ma_quy_trinh})...`);
            console.log(`📋 Gọi listProcessTasks với quy_trinh_id: ${process.ma_quy_trinh} (type: ${typeof process.ma_quy_trinh})`);
            
            try {
                const tasksRes = await listProcessTasks(process.ma_quy_trinh);
                console.log('📋 Kết quả listProcessTasks:', tasksRes);
                console.log('📋 tasksRes.success:', tasksRes?.success);
                console.log('📋 tasksRes.data:', tasksRes?.data);
                console.log('📋 tasksRes.data là array?', Array.isArray(tasksRes.data));
                console.log('📋 Số lượng công việc:', tasksRes?.data?.length || 0);
                
                if (!tasksRes?.success) {
                    console.error('❌ API trả về success = false:', tasksRes);
                    throw new Error(tasksRes?.error || 'API trả về success = false');
                }
                
                if (!Array.isArray(tasksRes.data)) {
                    console.error('❌ tasksRes.data không phải array:', tasksRes.data);
                    throw new Error('tasksRes.data không phải array');
                }
                
                if (tasksRes.data.length === 0) {
                    // Không có dữ liệu công việc trong quy trình -> fallback về công thức chuẩn dựa trên giống cây
                    // Nhưng vẫn giữ tên quy trình trong title
                    console.warn(`⚠️ Quy trình "${process.ten_quy_trinh}" (ID: ${process.ma_quy_trinh}) không có công việc nào trong database`);
                    console.warn('⚠️ Vui lòng thêm công việc vào quy trình trong chức năng "Quản lí quy trình"');
                    const schedule = isDT2000 ?
                        generateSoySchedule(plan) :
                        (isMango ? generateMangoSchedule(plan) : generateRiceSchedule(plan));
                    return { error: null, schedule, fallbackToDefault: true, processName: process.ten_quy_trinh };
                }
                
                const tasks = tasksRes.data || [];
                console.log(`✅ Sử dụng quy trình "${process.ten_quy_trinh}" (ID: ${process.ma_quy_trinh}) với ${tasks.length} công việc từ database`);
                console.log('📋 Danh sách công việc từ database:', tasks.map(t => ({ 
                    ma_cong_viec: t.ma_cong_viec,
                    ten: t.ten_cong_viec, 
                    thu_tu: t.thu_tu_thuc_hien,
                    khoang_cach: t.khoang_cach,
                    so_nguoi: t.so_nguoi || t.so_nguoi_can,
                    bat_dau: t.thoi_gian_bat_dau, 
                    ket_thuc: t.thoi_gian_ket_thuc 
                })));
                
                // Tiếp tục xử lý tasks từ đây
                const harvest = plan?.ngay_du_kien_thu_hoach ?
                    String(plan.ngay_du_kien_thu_hoach).slice(0, 10) :
                    "";
                const workforceHint = plan?.so_luong_nhan_cong ?
                    `${plan.so_luong_nhan_cong} người` :
                    "2-3 người";

                const items = [];
                
                // Sắp xếp công việc theo thứ tự thực hiện
                const sortedTasks = [...tasks].sort((a, b) => {
                const orderA = a.thu_tu_thuc_hien != null ? Number(a.thu_tu_thuc_hien) : (a.ma_cong_viec || 0);
                const orderB = b.thu_tu_thuc_hien != null ? Number(b.thu_tu_thuc_hien) : (b.ma_cong_viec || 0);
                return orderA - orderB;
            });
            
                console.log('📋 Sorted tasks by order:', sortedTasks.map(t => ({ 
                    ten: t.ten_cong_viec, 
                    thu_tu: t.thu_tu_thuc_hien, 
                    khoang_cach: t.khoang_cach,
                    thoi_gian_bat_dau: t.thoi_gian_bat_dau 
                })));

                // Tính ngày bắt đầu cho từng công việc dựa trên khoang_cach
                let currentDayOffset = 0;
                
                for (let i = 0; i < sortedTasks.length; i++) {
                const task = sortedTasks[i];
                
                // Nếu có thoi_gian_bat_dau, ưu tiên dùng nó (tính từ ngày bắt đầu kế hoạch)
                // Nếu không, tính dựa trên khoang_cach từ công việc trước đó
                let dayOffset = 0;
                if (task.thoi_gian_bat_dau != null && task.thoi_gian_bat_dau !== "" && task.thoi_gian_bat_dau !== 0) {
                    dayOffset = Number(task.thoi_gian_bat_dau) || 0;
                    console.log(`📅 Task "${task.ten_cong_viec}" sử dụng thoi_gian_bat_dau: ${dayOffset}`);
                } else {
                    // Tính dựa trên khoang_cach từ công việc trước
                    // Công việc đầu tiên bắt đầu từ ngày 0
                    if (i === 0) {
                        dayOffset = 0;
                    } else {
                        // Lấy khoang_cach từ công việc hiện tại (khoảng cách từ công việc trước)
                        const khoangCach = task.khoang_cach != null ? Number(task.khoang_cach) : 5; // Mặc định 5 ngày
                        dayOffset = currentDayOffset + khoangCach;
                        console.log(`📅 Task "${task.ten_cong_viec}" tính từ khoang_cach: ${khoangCach}, dayOffset: ${dayOffset}`);
                    }
                }
                
                const from = addDays(start, dayOffset);
                
                // Tính ngày kết thúc
                let endOffset = dayOffset;
                if (task.thoi_gian_ket_thuc != null && task.thoi_gian_ket_thuc !== "" && task.thoi_gian_ket_thuc !== 0) {
                    endOffset = Number(task.thoi_gian_ket_thuc) || dayOffset;
                } else {
                    // Mặc định: công việc kéo dài 1 ngày
                    endOffset = dayOffset;
                }
                
                const to = addDays(start, endOffset);
                
                // Cập nhật currentDayOffset cho công việc tiếp theo (ngày kết thúc của công việc hiện tại)
                currentDayOffset = endOffset;

                if (task.lap_lai && harvest) {
                    // Công việc lặp lại
                    let currentDate = from;
                    while (currentDate <= harvest) {
                        const soNguoiValue = task.so_nguoi != null ? 
                            (typeof task.so_nguoi === 'number' ? task.so_nguoi : parseInt(task.so_nguoi)) : 
                            (task.so_nguoi_can ? (typeof task.so_nguoi_can === 'number' ? task.so_nguoi_can : parseInt(task.so_nguoi_can)) : null);
                        items.push({
                            title: task.ten_cong_viec,
                            desc: task.mo_ta || "",
                            from: currentDate,
                            to: currentDate,
                            workers: task.so_nguoi || task.so_nguoi_can || workforceHint,
                            so_nguoi: (!isNaN(soNguoiValue) && soNguoiValue > 0) ? soNguoiValue : null,
                        });
                        currentDate = addDays(currentDate, task.khoang_cach_lap_lai || 7);
                    }
                } else {
                    // Công việc một lần
                    const soNguoiValue = task.so_nguoi != null ? 
                        (typeof task.so_nguoi === 'number' ? task.so_nguoi : parseInt(task.so_nguoi)) : 
                        (task.so_nguoi_can ? (typeof task.so_nguoi_can === 'number' ? task.so_nguoi_can : parseInt(task.so_nguoi_can)) : null);
                    items.push({
                        title: task.ten_cong_viec,
                        desc: task.mo_ta || "",
                        from: from,
                        to: to,
                        workers: task.so_nguoi || task.so_nguoi_can || workforceHint,
                        so_nguoi: (!isNaN(soNguoiValue) && soNguoiValue > 0) ? soNguoiValue : null,
                    });
                }
                }
                
                // Sử dụng khoang_cach từ DB để giãn các công việc
                const normYmd = (d) => {
                    const dd =
                        typeof d === "string" ? new Date(d + "T00:00:00") : new Date(d);
                    const y = dd.getFullYear();
                    const m = String(dd.getMonth() + 1).padStart(2, "0");
                    const day = String(dd.getDate()).padStart(2, "0");
                    return `${y}-${m}-${day}`;
                };

                const DEFAULT_SPACING_DAYS = 5;
                const spacedByGap = [];
                let cursorDate = new Date(start + "T00:00:00");

                for (let i = 0; i < items.length; i++) {
                    const it = items[i];
                    const originalFrom =
                        typeof it.from === "string" ?
                        new Date(it.from + "T00:00:00") :
                        new Date(it.from);
                    const originalTo =
                        typeof it.to === "string" ?
                        new Date(it.to + "T00:00:00") :
                        new Date(it.to || it.from);
                    const durationDays = Math.max(
                        0,
                        Math.round((originalTo - originalFrom) / (24 * 60 * 60 * 1000))
                    );

                    const fromDate = new Date(cursorDate);
                    const toDate = new Date(fromDate);
                    toDate.setDate(toDate.getDate() + durationDays);

                    const fromStr = normYmd(fromDate);
                    const toStr = normYmd(toDate);
                    spacedByGap.push({...it, from: fromStr, to: toStr });

                    // Sử dụng khoang_cach của task hiện tại để tính khoảng cách đến task tiếp theo
                    // Nếu không có thì dùng mặc định 5 ngày
                    const currentTask = sortedTasks[i];
                    const gap = currentTask?.khoang_cach ?? DEFAULT_SPACING_DAYS;

                    // move cursor to end + gap
                    cursorDate = new Date(toDate);
                    cursorDate.setDate(cursorDate.getDate() + gap);
                }
                
                // Trả về cùng với tên quy trình để hiển thị đúng title
                return { 
                    error: null, 
                    schedule: spacedByGap,
                    processName: process.ten_quy_trinh,
                    processId: process.ma_quy_trinh
                };
            } catch (error) {
                console.error('❌ Lỗi khi lấy công việc từ quy trình:', error);
                console.error('❌ Error details:', error.message, error.stack);
                // Nếu có lỗi, không fallback mà báo lỗi
                return { error: 'load_tasks_failed', schedule: [], errorMessage: error.message };
            }
        } catch (error) {
            console.error("Lỗi khi sinh lịch trình từ DB:", error);
            // Fallback về logic cũ
            const norm = normalizeText(
                (() => {
                    const g = Array.isArray(giongs) ?
                        giongs.find((x) => String(x.id) === String(plan.ma_giong)) :
                        null;
                    return g?.ten_giong || "";
                })()
            );
            const isDT2000 = norm.includes("dau") && norm.includes("dt2000");
            const isMango = norm.includes("xoai") || norm.includes("mango");
            const schedule = isDT2000 ? 
                generateSoySchedule(plan) : 
                (isMango ? generateMangoSchedule(plan) : generateRiceSchedule(plan));
            return { error: 'fallback', schedule };
        }
    }

    // Sinh lịch trình cho Ngô LVN10 theo công thức khoảng cách ngày do người dùng cung cấp
    function generateRiceSchedule(plan) {
        const start = plan ?.ngay_bat_dau ?
            String(plan.ngay_bat_dau).slice(0, 10) :
            "";
        const harvest = plan ?.ngay_du_kien_thu_hoach ?
            String(plan.ngay_du_kien_thu_hoach).slice(0, 10) :
            "";
        if (!start) return [];
        const workforceHint = plan ?.so_luong_nhan_cong ?
            `${plan.so_luong_nhan_cong} người` :
            "2-3 người";
        const items = [];

        // Công thức khoảng cách ngày cho NGÔ:
        // Làm đất → +0 ngày (1 ngày)
        items.push({
            title: "Làm đất",
            desc: "Cày bừa, làm tơi đất; làm luống, rạch hàng.",
            from: start,
            to: start,
            workers: workforceHint,
        });

        // Gieo → +5 ngày
        const gieo = addDays(start, 5);
        items.push({
            title: "Bón lót & Gieo hạt",
            desc: "Bón lót (phân chuồng/NPK), rải hạt đều; tưới nhẹ phủ vỉ.",
            from: gieo,
            to: gieo,
            workers: "2-3 người",
        });

        // Nảy mầm → +4 ngày sau gieo
        const nayMam = addDays(gieo, 4);
        items.push({
            title: "Nảy mầm – Chăm sóc ban đầu",
            desc: "Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm.",
            from: nayMam,
            to: nayMam,
            workers: "1 người/điểm",
        });

        // Tỉa dặm → +7 ngày sau nảy mầm
        const tiaDam = addDays(nayMam, 7);
        items.push({
            title: "Tỉa dặm & Làm cỏ lần 1",
            desc: "Bổ cây, dặm cây, làm cỏ nhẹ, vun gốc sơ bộ.",
            from: tiaDam,
            to: tiaDam,
            workers: "3-4 người",
        });

        // Bón thúc 1 → +14 ngày sau tỉa dặm
        const bonThuc1 = addDays(tiaDam, 14);
        items.push({
            title: "Bón thúc lần 1",
            desc: "Bón phân thúc, vun gốc, kiểm tra sinh trưởng.",
            from: bonThuc1,
            to: bonThuc1,
            workers: "2-3 người",
        });

        // Bón thúc 2 → +4 ngày sau bón thúc 1
        const bonThuc2 = addDays(bonThuc1, 4);
        items.push({
            title: "Bón thúc lần 2",
            desc: "Bón phân (Urê + Kali), vun gốc cao, làm cỏ nếu cần.",
            from: bonThuc2,
            to: bonThuc2,
            workers: "2-3 người",
        });

        // Tưới/Phòng sâu bệnh: bắt đầu sau bón thúc 2 + 4 ngày, lặp mỗi 7 ngày, 7 lần
        let cur = addDays(bonThuc2, 4);
        for (let i = 1; i <= 7; i++) {
            if (harvest && cur >= harvest) break;
            items.push({
                title: `Tưới nước/Phòng trừ sâu bệnh (lần ${i})`,
                desc: "Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.",
                from: cur,
                to: cur,
                workers: "1-2 người",
            });
            cur = addDays(cur, 7);
        }

        // Thu hoạch
        if (harvest) {
            items.push({
                title: "Thu hoạch",
                desc: "Bẻ bắp/cắt lúa, vận chuyển, tập kết.",
                from: harvest,
                to: harvest,
                workers: workforceHint,
            });
            // Sơ chế & Tách hạt: 1 ngày sau thu hoạch (có thể điều chỉnh 1–3 ngày)
            items.push({
                title: "Sơ chế & Tách hạt",
                desc: "Phơi/sấy, tách hạt (nếu cần), bảo quản khô.",
                from: addDays(harvest, 1),
                to: addDays(harvest, 1),
                workers: "4-5 người",
            });
        }
        return items;
    }

    // Sinh lịch trình cho Xoài
    function generateMangoSchedule(plan) {
        const start = plan?.ngay_bat_dau ?
            String(plan.ngay_bat_dau).slice(0, 10) :
            "";
        const harvest = plan?.ngay_du_kien_thu_hoach ?
            String(plan.ngay_du_kien_thu_hoach).slice(0, 10) :
            "";
        if (!start) return [];
        const workforceHint = plan?.so_luong_nhan_cong ?
            `${plan.so_luong_nhan_cong} người` :
            "2-3 người";
        const items = [];

        // Chuẩn bị đất và trồng cây
        items.push({
            title: "Chuẩn bị đất & Đào hố",
            desc: "Làm sạch cỏ, đào hố trồng (60x60x60cm), bón lót phân chuồng hoai mục.",
            from: start,
            to: addDays(start, 2),
            workers: workforceHint,
        });

        // Trồng cây
        const trongCay = addDays(start, 3);
        items.push({
            title: "Trồng cây giống",
            desc: "Đặt cây vào hố, lấp đất, tưới nước đẫm, cắm cọc giữ cây.",
            from: trongCay,
            to: trongCay,
            workers: "3-4 người",
        });

        // Chăm sóc sau trồng (7 ngày)
        const chamSocSauTrong = addDays(trongCay, 7);
        items.push({
            title: "Chăm sóc sau trồng",
            desc: "Tưới nước đều đặn, kiểm tra cây chết để trồng dặm, che nắng nếu cần.",
            from: chamSocSauTrong,
            to: chamSocSauTrong,
            workers: "1-2 người",
        });

        // Bón phân lần 1 (30 ngày sau trồng)
        const bonPhan1 = addDays(trongCay, 30);
        items.push({
            title: "Bón phân lần 1",
            desc: "Bón phân NPK (tỷ lệ 2:1:1), tưới nước sau bón, làm cỏ xung quanh gốc.",
            from: bonPhan1,
            to: bonPhan1,
            workers: "2-3 người",
        });

        // Tỉa cành tạo tán (60 ngày sau trồng)
        const tiaCanh = addDays(trongCay, 60);
        items.push({
            title: "Tỉa cành tạo tán",
            desc: "Tỉa cành yếu, sâu bệnh; tạo tán đều, thông thoáng.",
            from: tiaCanh,
            to: tiaCanh,
            workers: "2 người",
        });

        // Bón phân lần 2 (90 ngày sau trồng)
        const bonPhan2 = addDays(trongCay, 90);
        items.push({
            title: "Bón phân lần 2",
            desc: "Bón phân NPK (tỷ lệ 3:1:2), vun gốc, làm cỏ.",
            from: bonPhan2,
            to: bonPhan2,
            workers: "2-3 người",
        });

        // Phòng trừ sâu bệnh định kỳ (bắt đầu từ 30 ngày, lặp mỗi 30 ngày)
        let cur = addDays(trongCay, 30);
        let idx = 1;
        while (!harvest || cur < harvest) {
            if (idx > 12) break; // Giới hạn 12 lần
            items.push({
                title: `Phòng trừ sâu bệnh (lần ${idx})`,
                desc: "Kiểm tra sâu bệnh, phun thuốc phòng trừ khi cần, tưới nước đều.",
                from: cur,
                to: cur,
                workers: "1-2 người",
            });
            idx += 1;
            cur = addDays(cur, 30);
        }

        // Bón phân thúc hoa (nếu có ngày thu hoạch, bón trước 60 ngày)
        if (harvest) {
            const bonThucHoa = addDays(harvest, -60);
            if (bonThucHoa > bonPhan2) {
                items.push({
                    title: "Bón phân thúc hoa",
                    desc: "Bón phân lân và kali cao, giảm đạm để kích thích ra hoa.",
                    from: bonThucHoa,
                    to: bonThucHoa,
                    workers: "2-3 người",
                });
            }

            // Tỉa hoa, tỉa quả (30 ngày trước thu hoạch)
            const tiaHoaQua = addDays(harvest, -30);
            items.push({
                title: "Tỉa hoa & Tỉa quả",
                desc: "Tỉa bớt hoa, quả non để tập trung dinh dưỡng, tạo quả to đẹp.",
                from: tiaHoaQua,
                to: tiaHoaQua,
                workers: "3-4 người",
            });

            // Thu hoạch
            items.push({
                title: "Thu hoạch",
                desc: "Thu hoạch quả chín, phân loại, đóng gói, vận chuyển.",
                from: harvest,
                to: harvest,
                workers: "6-8 người",
            });

            // Chăm sóc sau thu hoạch (7 ngày sau thu hoạch)
            items.push({
                title: "Chăm sóc sau thu hoạch",
                desc: "Tỉa cành già, bón phân hồi sức, tưới nước, phòng trừ sâu bệnh.",
                from: addDays(harvest, 7),
                to: addDays(harvest, 7),
                workers: "2-3 người",
            });
        }

        return items;
    }

    // Sinh lịch trình cho Đậu tương ĐT2000
    function generateSoySchedule(plan) {
        const start = plan ?.ngay_bat_dau ?
            String(plan.ngay_bat_dau).slice(0, 10) :
            "";
        const harvest = plan ?.ngay_du_kien_thu_hoach ?
            String(plan.ngay_du_kien_thu_hoach).slice(0, 10) :
            "";
        if (!start) return [];
        const workforceHint = plan ?.so_luong_nhan_cong ?
            `${plan.so_luong_nhan_cong} người` :
            "2-3 người";
        const items = [];

        // Làm đất: 2-3 ngày (giữ 3 ngày như tham chiếu), gieo ngay sau 1 ngày nghỉ
        items.push({
            title: "Làm đất",
            desc: "Cày bừa, làm tơi đất; làm luống, rạch hàng.",
            from: start,
            to: addDays(start, 2),
            workers: workforceHint,
        });
        const gieo = addDays(start, 3);
        items.push({
            title: "Bón lót & Gieo hạt",
            desc: "Bón lót (phân chuồng, NPK), gieo hạt đều, tưới nhẹ/phủ vỉ.",
            from: gieo,
            to: gieo,
            workers: "2-5 người",
        });

        // Nảy mầm: 5–6 ngày sau gieo
        const nayMamFrom = addDays(gieo, 5);
        const nayMamTo = addDays(gieo, 6);
        items.push({
            title: "Nảy mầm – Chăm sóc ban đầu",
            desc: "Theo dõi ẩm độ, mọc cây, sâu bệnh sớm.",
            from: nayMamFrom,
            to: nayMamTo,
            workers: "1 người/điểm",
        });

        // Tỉa dặm: 8–10 ngày sau gieo (chọn mốc giữa = +9)
        const tiaDam = addDays(gieo, 9);
        items.push({
            title: "Tỉa dặm & Làm cỏ lần 1",
            desc: "Tỉa cây, dặm cây; làm cỏ nhẹ; vun gốc.",
            from: tiaDam,
            to: tiaDam,
            workers: "3-4 người",
        });

        // Bón thúc 1: 10–12 ngày sau tỉa (chọn +11)
        const bonThuc1 = addDays(tiaDam, 11);
        items.push({
            title: "Bón thúc lần 1 & Vun gốc",
            desc: "Bón thúc, vun gốc; kiểm tra sinh trưởng.",
            from: bonThuc1,
            to: bonThuc1,
            workers: "2-3 người",
        });

        // Bón thúc 2: 15–18 ngày sau bón thúc 1 (chọn +16)
        const bonThuc2 = addDays(bonThuc1, 16);
        items.push({
            title: "Bón thúc lần 2 (nuôi quả)",
            desc: "Bón Urê + Kali, vun cao, kiểm tra sâu bệnh.",
            from: bonThuc2,
            to: bonThuc2,
            workers: "2 người",
        });

        // Tưới/Phòng sâu bệnh: bắt đầu ~9 ngày sau gieo, lặp mỗi 7 ngày tới trước thu hoạch
        let cur = addDays(gieo, 9);
        let idx = 1;
        while (!harvest || cur < harvest) {
            items.push({
                title: `Tưới nước/Phòng trừ sâu bệnh (lần ${idx})`,
                desc: "Tưới, kiểm tra sâu bệnh; mưa ẩm có thể rút ngắn chu kỳ.",
                from: cur,
                to: cur,
                workers: "1-2 người",
            });
            idx += 1;
            if (idx > 7) break;
            cur = addDays(cur, 7);
        }

        // Thu hoạch và Sơ chế (nếu có ngày thu hoạch)
        if (harvest) {
            items.push({
                title: "Thu hoạch",
                desc: "Cắt/nhổ, gom, vận chuyển về nơi tập kết.",
                from: harvest,
                to: harvest,
                workers: "6-8 người",
            });
            items.push({
                title: "Sơ chế & Tách hạt",
                desc: "Phơi/sấy, tách hạt (nếu cần), bảo quản khô.",
                from: addDays(harvest, 1),
                to: addDays(harvest, 2),
                workers: "4-5 người",
            });
        }
        return items;
    }

    function isOverlap(aStart, aEnd, bStart, bEnd) {
        return !(aEnd < bStart || bEnd < aStart);
    }

    async function activatePlan(plan, options = { preferSingleFarmer: false }) {
        // Hiện tại chỉ hỗ trợ giống lúa. Sẽ mở rộng sau cho đậu tương.
        const cropName = (() => {
            const g = Array.isArray(giongs) ?
                giongs.find((x) => String(x.id) === String(plan.ma_giong)) :
                null;
            return g ?.ten_giong || "";
        })();
        const norm = normalizeText(cropName);
        const isSoy = norm.includes("dau");
        const isDT2000 = isSoy && norm.includes("dt2000");
        const isMango = norm.includes("xoai") || norm.includes("mango");
        const result = await generateScheduleFromDB(plan);
        
        // Xử lý kết quả từ generateScheduleFromDB
        let schedule = [];
        if (result && typeof result === 'object' && 'schedule' in result) {
            schedule = result.schedule || [];
            // Kiểm tra các lỗi cụ thể
            if (result.error === 'missing_start_date') {
                alert("Không thể sinh lịch: thiếu ngày bắt đầu.");
                return;
            } else if (result.error === 'process_not_found') {
                alert(`Không tìm thấy quy trình với mã ${plan.ma_quy_trinh}. Vui lòng kiểm tra lại quy trình đã chọn.`);
                return;
            }
            // Lưu ý: Nếu quy trình không có công việc, hệ thống sẽ tự động fallback về công thức chuẩn
            // dựa trên giống cây, vì vậy không cần xử lý lỗi 'no_tasks' ở đây nữa
        } else if (Array.isArray(result)) {
            // Backward compatibility: nếu trả về array trực tiếp
            schedule = result;
        }
        
        if (!schedule || schedule.length === 0) {
            alert("Không thể sinh lịch: không có dữ liệu lịch trình.");
            return;
        }
        if (!window.confirm("Kích hoạt kế hoạch và tạo lịch làm việc tự động?"))
            return;
        try {
            // Smart worker assignment algorithm
            const [farmersRes, tasksRes] = await Promise.all([
                fetchFarmers(),
                listTasks(),
            ]);
            const farmers = farmersRes ?.data || farmersRes || [];
            const existingTasks = tasksRes ?.data || [];
            const farmerIds = farmers
                .map((f) => String(f.ma_nguoi_dung || f.id))
                .filter(Boolean);

            // Function to extract number of workers needed from description
            function extractWorkerCount(workersStr) {
                if (!workersStr) return 1;
                const match = workersStr.match(/(\d+)(-\d+)?\s*người/);
                if (match) {
                    const baseCount = parseInt(match[1]);
                    // Cap extremely high numbers to available farmers
                    return Math.min(baseCount, farmerIds.length);
                }
                // Handle special cases like "1 người/điểm"
                if (workersStr.includes("người/điểm")) return 1;
                return Math.max(1, Math.ceil(farmerIds.length / 10)); // Default fallback
            }

            // Function to check if farmer worked in recent days
            function hasWorkedInRecentDays(
                farmerId,
                targetDate,
                recentTasks,
                maxConsecutiveDays = 2
            ) {
                const targetTime = new Date(targetDate).getTime();
                const oneDayMs = 24 * 60 * 60 * 1000;

                let consecutiveDays = 0;
                for (let i = 1; i <= maxConsecutiveDays; i++) {
                    const checkDate = new Date(targetTime - i * oneDayMs)
                        .toISOString()
                        .split("T")[0];
                    const workedOnDate = recentTasks.some((t) => {
                        if (!t.ma_nguoi_dung) return false;
                        const ids = String(t.ma_nguoi_dung)
                            .split(",")
                            .map((x) => x.trim());
                        return (
                            ids.includes(String(farmerId)) && t.ngay_bat_dau === checkDate
                        );
                    });
                    if (workedOnDate) {
                        consecutiveDays++;
                    } else {
                        break;
                    }
                }
                return consecutiveDays >= maxConsecutiveDays;
            }

            // Function to get available farmers for a time slot
            function getAvailableFarmers(
                startTime,
                endTime,
                allTasks,
                excludeRecentWorkers = true
            ) {
                return farmerIds.filter((fid) => {
                    // Check time conflicts
                    const hasTimeConflict = allTasks.some((t) => {
                        if (!t.ma_nguoi_dung) return false;
                        const ids = String(t.ma_nguoi_dung)
                            .split(",")
                            .map((x) => x.trim());
                        if (!ids.includes(String(fid))) return false;
                        const ts = new Date(
                            `${t.ngay_bat_dau}T${t.thoi_gian_bat_dau || "00:00:00"}`
                        ).getTime();
                        const te = new Date(
                            `${t.ngay_ket_thuc}T${t.thoi_gian_ket_thuc || "23:59:59"}`
                        ).getTime();
                        return isOverlap(startTime, endTime, ts, te);
                    });

                    if (hasTimeConflict) return false;

                    // Check if worked too many consecutive days (optional check)
                    if (excludeRecentWorkers) {
                        const workDate = new Date(startTime).toISOString().split("T")[0];
                        if (hasWorkedInRecentDays(fid, workDate, allTasks)) {
                            return false;
                        }
                    }

                    return true;
                });
            }

            // Enhanced task creation with multiple workers (split into two shifts per day)
            for (const item of schedule) {
                const shifts = [
                    { label: "Ca sáng", start: "07:00", end: "11:00" },
                    { label: "Ca chiều", start: "13:00", end: "17:00" },
                ];

                const startDate = new Date(`${item.from}T00:00:00`);
                const endDate = new Date(`${item.to}T00:00:00`);
                for (
                    let d = new Date(startDate); d.getTime() <= endDate.getTime(); d.setDate(d.getDate() + 1)
                ) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    const dateStr = `${y}-${m}-${day}`;
                    for (const shift of shifts) {
                        const sTime = new Date(`${dateStr}T${shift.start}:00`).getTime();
                        const eTime = new Date(`${dateStr}T${shift.end}:00`).getTime();

                        // Extract required number of workers - ưu tiên lấy từ so_nguoi trong database
                        let requiredWorkers = 1;
                        if (!options.preferSingleFarmer) {
                            // Ưu tiên lấy từ so_nguoi (có thể là số hoặc chuỗi)
                            if (item.so_nguoi != null) {
                                const numWorkers = typeof item.so_nguoi === 'number' ? item.so_nguoi : parseInt(item.so_nguoi);
                                if (!isNaN(numWorkers) && numWorkers > 0) {
                                    requiredWorkers = Math.min(numWorkers, farmerIds.length);
                                } else {
                                    requiredWorkers = extractWorkerCount(item.workers);
                                }
                            } else {
                                requiredWorkers = extractWorkerCount(item.workers);
                            }
                        }

                        // Get available farmers (prefer those who haven't worked recently)
                        let availableFarmers = getAvailableFarmers(
                            sTime,
                            eTime,
                            existingTasks,
                            options.preferSingleFarmer ? false : true
                        );
                        // Fallback: nếu không còn ai rảnh, cho phép gán tối thiểu 1 người để tránh 0 nhân công
                        if (availableFarmers.length === 0) {
                            availableFarmers = farmerIds.slice();
                        }

                        // If not enough farmers available with recent work filter, remove the filter
                        if (!options.preferSingleFarmer &&
                            availableFarmers.length < Math.min(requiredWorkers, 2)
                        ) {
                            availableFarmers = getAvailableFarmers(
                                sTime,
                                eTime,
                                existingTasks,
                                false
                            );
                        }

                        // Ensure at least 2 workers for multi-day tasks or when required
                        const isMultiDay = item.from !== item.to;
                        const minWorkersForTask = options.preferSingleFarmer ?
                            1 :
                            Math.max(
                                isMultiDay ? 2 : 1,
                                requiredWorkers > 10 ?
                                Math.ceil(availableFarmers.length * 0.8) :
                                1
                            );

                        const workersToAssign = Math.max(
                            Math.min(requiredWorkers, availableFarmers.length),
                            minWorkersForTask,
                            1 // Always at least 1 worker
                        );

                        // Select farmers with better distribution
                        const selectedFarmers = [];

                        // Sort farmers by recent work count to balance workload
                        const farmerWorkCounts = availableFarmers.map((fid) => {
                            const recentTaskCount = existingTasks.filter((t) => {
                                if (!t.ma_nguoi_dung) return false;
                                const ids = String(t.ma_nguoi_dung)
                                    .split(",")
                                    .map((x) => x.trim());
                                return ids.includes(String(fid));
                            }).length;
                            return { farmerId: fid, workCount: recentTaskCount };
                        });

                        // Sort by work count (ascending) to prioritize less busy farmers
                        farmerWorkCounts.sort((a, b) => a.workCount - b.workCount);

                        // Select farmers starting with least busy ones
                        for (
                            let i = 0; i < workersToAssign && i < farmerWorkCounts.length; i++
                        ) {
                            selectedFarmers.push(farmerWorkCounts[i].farmerId);
                        }

                        // Create task with assigned farmers per shift
                        if (selectedFarmers.length === 0 && availableFarmers.length > 0) {
                            selectedFarmers.push(availableFarmers[0]);
                        }
                        const assignedIds =
                            selectedFarmers.length > 0 ? selectedFarmers.join(",") : null;
                        await createTask({
                            ma_ke_hoach: plan.ma_ke_hoach,
                            ten_cong_viec: `${item.title} (${shift.label})`,
                            mo_ta: `${item.desc}\n${shift.label}\nNhân công yêu cầu: ${item.workers}\nĐã phân công: ${selectedFarmers.length} người`,
                            loai_cong_viec: "san_xuat",
                            ngay_bat_dau: dateStr,
                            thoi_gian_bat_dau: shift.start,
                            ngay_ket_thuc: dateStr,
                            thoi_gian_ket_thuc: shift.end,
                            thoi_gian_du_kien: 1,
                            trang_thai: "chua_bat_dau",
                            uu_tien: "trung_binh",
                            ma_nguoi_dung: assignedIds,
                            ghi_chu: options.preferSingleFarmer ?
                                `Tự động phân công 1 nông dân xuyên suốt` : `Tự động phân công ${selectedFarmers.length}/${requiredWorkers} nhân công`,
                            ket_qua: null,
                            hinh_anh: null,
                        });

                        // Add to existing tasks to prevent conflicts in same activation
                        selectedFarmers.forEach((farmerId) => {
                            existingTasks.push({
                                ma_nguoi_dung: farmerId,
                                ngay_bat_dau: dateStr,
                                thoi_gian_bat_dau: shift.start,
                                ngay_ket_thuc: dateStr,
                                thoi_gian_ket_thuc: shift.end,
                            });
                        });
                    }
                }
            }
            // Lưu tóm tắt lịch trình vào cột chi_tiet_cong_viec
            // Ưu tiên lấy tên quy trình từ ma_quy_trinh của kế hoạch
            let scheduleTitle = "";
            let usedProcessName = null;
            
            if (plan?.ma_quy_trinh) {
              const process = Array.isArray(processes)
                ? processes.find(
                    (p) => String(p.ma_quy_trinh) === String(plan.ma_quy_trinh) ||
                           Number(p.ma_quy_trinh) === Number(plan.ma_quy_trinh)
                  )
                : null;
              if (process?.ten_quy_trinh) {
                scheduleTitle = `Tóm tắt lịch trình (${process.ten_quy_trinh}):`;
                usedProcessName = process.ten_quy_trinh;
                console.log(`📝 Sử dụng tên quy trình cho title: "${process.ten_quy_trinh}"`);
              }
            }
            
            // Nếu không có quy trình, fallback về logic cũ dựa trên tên giống
            if (!scheduleTitle) {
              if (isDT2000) {
                scheduleTitle = "Tóm tắt lịch trình (Đậu tương ĐT2000):";
              } else if (isMango) {
                scheduleTitle = "Tóm tắt lịch trình (Xoài):";
              } else {
                scheduleTitle = "Tóm tắt lịch trình (Ngô LVN10):";
              }
              console.log(`📝 Fallback về tên giống cho title: "${scheduleTitle}"`);
            }
            
            const summary = [
                    scheduleTitle,
                    ...schedule.map(
                        (it) =>
                        `- ${it.title}: ${it.from}${
              it.to && it.to !== it.from ? ` → ${it.to}` : ""
            } — ${it.desc} (Nhân công: ${it.workers})`
        ),
      ].join("\n");
      try {
        await updatePlan({
          ma_ke_hoach: plan.ma_ke_hoach,
          chi_tiet_cong_viec: summary,
        });
      } catch (_) {}
      
      // Thông báo rõ ràng về quy trình được sử dụng
      let successMessage = "Đã kích hoạt kế hoạch và tạo lịch làm việc tự động với thuật toán phân công thông minh!";
      if (result && typeof result === 'object') {
        if (result.fallbackToDefault && result.processName) {
          successMessage += `\n\nLưu ý: Quy trình "${result.processName}" chưa có công việc, đã sử dụng công thức chuẩn cho giống cây.`;
        } else if (plan?.ma_quy_trinh) {
          const process = Array.isArray(processes) 
            ? processes.find(p => String(p.ma_quy_trinh) === String(plan.ma_quy_trinh))
            : null;
          if (process && schedule.length > 0) {
            successMessage += `\n\n✅ Đã sử dụng quy trình "${process.ten_quy_trinh}" từ chức năng quản lý quy trình với ${schedule.length} công việc.`;
          }
        }
      }
      alert(successMessage);
    } catch (e) {
      alert(e.message || "Không thể kích hoạt kế hoạch");
    }
  }

  async function openEditSchedule(plan) {
    try {
      const r = await listTasks();
      const tasks = (r?.success ? r.data : r) || [];
      const filtered = tasks.filter(
        (t) => String(t.ma_ke_hoach) === String(plan.ma_ke_hoach)
      );
      setEditingTasks(filtered.map((t) => ({ ...t })));
      setEditingPlan(plan);
      setOpenEdit(true);
    } catch (e) {
      alert(e.message || "Không thể tải lịch làm việc");
    }
  }

  async function saveEditedTasks() {
    try {
      for (const t of editingTasks) {
        await updateTask({
          id: t.id,
          ten_cong_viec: t.ten_cong_viec,
          mo_ta: t.mo_ta,
          ngay_bat_dau: t.ngay_bat_dau,
          ngay_ket_thuc: t.ngay_ket_thuc,
          thoi_gian_bat_dau: t.thoi_gian_bat_dau || "07:00",
          thoi_gian_ket_thuc: t.thoi_gian_ket_thuc || "17:00",
          ma_nguoi_dung: t.ma_nguoi_dung || null,
        });
      }
      alert("Đã lưu thay đổi lịch làm việc");
      // Thông báo cho các màn hình lịch làm việc khác làm mới dữ liệu
      try {
        window.dispatchEvent(new Event("tasks-updated"));
        localStorage.setItem("tasks_updated_at", String(Date.now()));
      } catch (_) {}
      setOpenEdit(false);
    } catch (e) {
      alert(e.message || "Không thể lưu lịch");
    }
  }

  async function addManualTask() {
    try {
      if (!editingPlan) return;
      await createTask({
        ma_ke_hoach: editingPlan.ma_ke_hoach,
        ten_cong_viec: addingTask.ten_cong_viec,
        mo_ta: addingTask.mo_ta,
        loai_cong_viec: "san_xuat",
        ngay_bat_dau: addingTask.ngay_bat_dau,
        thoi_gian_bat_dau: addingTask.thoi_gian_bat_dau || "07:00",
        ngay_ket_thuc: addingTask.ngay_ket_thuc || addingTask.ngay_bat_dau,
        thoi_gian_ket_thuc: addingTask.thoi_gian_ket_thuc || "17:00",
        thoi_gian_du_kien: 1,
        trang_thai: "chua_bat_dau",
        uu_tien: "trung_binh",
        ma_nguoi_dung: addingTask.ma_nguoi_dung || null,
        ghi_chu: "Thêm thủ công",
        ket_qua: null,
        hinh_anh: null,
      });
      // refresh list in dialog
      await openEditSchedule(editingPlan);
      // Phát tín hiệu cho các màn hình khác để reload
      try {
        window.dispatchEvent(new Event("tasks-updated"));
        localStorage.setItem("tasks_updated_at", String(Date.now()));
      } catch (_) {}
      setAddingTask({
        ten_cong_viec: "",
        mo_ta: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        thoi_gian_bat_dau: "07:00",
        thoi_gian_ket_thuc: "17:00",
        ma_nguoi_dung: "",
      });
    } catch (e) {
      alert(e.message || "Không thể thêm công việc");
    }
  }

  // Hàm tính ngày thu hoạch dựa trên thời gian canh tác (ngày/tháng/năm)
  function calculateHarvestDateFromDuration(startDateStr, duration, unit) {
    if (!startDateStr || !duration) return "";
    const start = new Date(startDateStr);
    if (Number.isNaN(start.getTime())) return "";
    const numDuration = Number(duration);
    if (Number.isNaN(numDuration) || numDuration <= 0) return "";
    
    const result = new Date(start);
    if (unit === "ngay") {
      // Thêm số ngày
      result.setDate(result.getDate() + numDuration);
    } else if (unit === "thang") {
      // Thêm số tháng
      const m = result.getMonth();
      result.setMonth(m + numDuration);
    } else if (unit === "nam") {
      // Thêm số năm
      const y = result.getFullYear();
      result.setFullYear(y + numDuration);
    }
    return toYmd(result);
  }

  function calculateHarvestDate(startDateStr, cropName) {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    if (Number.isNaN(start.getTime())) return "";
    const name = (cropName || "").toLowerCase();
    const result = new Date(start);
    if (name.includes("ngô") && name.includes("lvn10")) {
      // +3 months
      const m = result.getMonth();
      result.setMonth(m + 3);
    } else if (
      (name.includes("đậu") || name.includes("dau")) &&
      name.includes("dt2000")
    ) {
      // +90 days
      result.setDate(result.getDate() + 90);
    } else {
      // fallback: +60 days nếu chưa khớp giống
      result.setDate(result.getDate() + 60);
    }
    const yyyy = result.getFullYear();
    const mm = String(result.getMonth() + 1).padStart(2, "0");
    const dd = String(result.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function calculateWorkers(cropName, areaHa) {
    const name = (cropName || "").toLowerCase();
    const area = Number(areaHa) || 0;
    if (name.includes("ngô")) return Math.ceil(area * 4);
    if (name.includes("đậu") || name.includes("dau"))
      return Math.ceil(area * 3);
    return Math.ceil(area * 3); // mặc định tương tự đậu
  }

  const handleSave = async () => {
    try {
      if (form.ma_lo_trong) {
        await ensureLoTrong(Number(form.ma_lo_trong));
      }
      // Xác định tên giống để tính toán
      const giongName = (() => {
        const g = Array.isArray(giongs)
          ? giongs.find((x) => String(x.id) === String(form.ma_giong))
          : null;
        return g?.ten_giong || "";
      })();

      // Diện tích mặc định mỗi lô
      const areaHa = DEFAULT_AREA_PER_LOT_HA;

      const payload = {
        ma_lo_trong: form.ma_lo_trong === "" ? null : Number(form.ma_lo_trong),
        dien_tich_trong:
          form.dien_tich_trong === "" ? areaHa : Number(form.dien_tich_trong),
        ngay_bat_dau: form.ngay_bat_dau || null,
        ngay_du_kien_thu_hoach: form.ngay_du_kien_thu_hoach || null,
        trang_thai: "chuan_bi",
        so_luong_nhan_cong:
          form.so_luong_nhan_cong === ""
            ? null
            : Number(form.so_luong_nhan_cong),
        ghi_chu: null,
        ma_giong: form.ma_giong === "" ? null : Number(form.ma_giong),
        ma_quy_trinh: form.ma_quy_trinh === "" || form.ma_quy_trinh === null ? null : Number(form.ma_quy_trinh),
      };
      console.log('💾 Saving plan with payload:', payload);
      console.log('💾 ma_quy_trinh value:', payload.ma_quy_trinh, 'type:', typeof payload.ma_quy_trinh);
      const res = await createPlan(payload);
      if (!res?.success) throw new Error(res?.error || "Tạo kế hoạch thất bại");
      alert("Đã lưu kế hoạch sản xuất thành công!");
      setOpen(false);
      // refresh
      const r = await listPlans();
      if (r?.success) setPlans(r.data || []);
    } catch (e) {
      alert(e.message);
    }
  };

  // Helpers for card view
  const planByLotId = useMemo(() => {
    const map = new Map();
    for (const p of plans) {
      if (p && p.ma_lo_trong != null) map.set(String(p.ma_lo_trong), p);
    }
    return map;
  }, [plans]);

  function findPlanForLot(lot) {
    return planByLotId.get(String(lot.id)) || null;
  }

  const [activatedPlanIds, setActivatedPlanIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const r = await listTasks();
        if (r?.success) {
          const s = new Set();
          (r.data || []).forEach((t) => {
            if (t.ma_ke_hoach != null) s.add(String(t.ma_ke_hoach));
          });
          setActivatedPlanIds(s);
        }
      } catch (_) {}
    })();
  }, [plans.length]);

  function formatLotLabel(id) {
    return `Lô ${id}`;
  }

  function getLotStatus(lot) {
    const p = findPlanForLot(lot);
    if (!p) return "Chưa bắt đầu";
    if (p.trang_thai === "dang_trong") return "Đang canh tác";
    if (p.trang_thai === "da_thu_hoach") return "Hoàn thành";
    if (p.trang_thai === "chuan_bi") return "Đang chuẩn bị";
    return p.trang_thai || "Chưa bắt đầu";
  }

  const STATUS_COLORS = {
    "Đang canh tác": "info",
    "Hoàn thành": "success",
    "Đang chuẩn bị": "warning",
    "Chưa bắt đầu": "default",
  };

  function handleOpenCreateForLot(lot) {
    const existingPlan = findPlanForLot(lot);
    const existingHarvest = existingPlan?.ngay_du_kien_thu_hoach
      ? String(existingPlan.ngay_du_kien_thu_hoach).slice(0, 10)
      : "";
    const minDate = existingHarvest ? addDays(existingHarvest, 10) : "";
    setMinStartDate(minDate);
    setDateError("");
    setForm({
      ma_lo_trong: lot?.id || "",
      ngay_bat_dau: "",
      ngay_du_kien_thu_hoach: "",
      ma_giong: "",
      dien_tich_trong: "10",
      so_luong_nhan_cong: "",
      ma_quy_trinh: "",
      thoi_gian_canh_tac: "",
      don_vi_thoi_gian: "ngay",
    });
    setOpen(true);
  }

  function handleOpenMapWithLot(lot) {
    setSelectedLotForMap(lot);
    setOpenMap(true);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Các lô canh tác
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={async () => {
            try {
              const ping = await fetch(
                "http://localhost/doancuoinam/src/be_management/api/test_connection.php"
              ).then((r) => r.json());
              alert(ping?.message || "Kết nối OK");
            } catch (e) {
              alert("Không thể kết nối: " + e.message);
            }
          }}
        >
          TEST KẾT NỐI
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={async () => {
            const [r, l] = await Promise.all([
              listPlans(),
              fetch(
                "http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php"
              )
                .then((r) => r.json())
                .catch(() => ({})),
            ]);
            if (r?.success) setPlans(r.data || []);
            {
              const apiLots = l?.success && Array.isArray(l.data) ? l.data : [];
              // Loại bỏ duplicate dựa trên ma_lo_trong hoặc id
              const byId = new Map();
              apiLots.forEach((x) => {
                const lotId = String(x.ma_lo_trong ?? x.id);
                if (lotId && lotId !== "undefined" && lotId !== "null") {
                  // Chỉ lưu lần đầu tiên gặp, bỏ qua duplicate
                  if (!byId.has(lotId)) {
                    byId.set(lotId, x);
                  }
                }
              });
              const defaultSix = Array.from({ length: 6 }, (_, i) => {
                const id = String(i + 1);
                const api = byId.get(id) || {};
                return { id, ...api };
              });
              setLots(defaultSix);
            }
          }}
        >
          REFRESH DỮ LIỆU
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={async () => {
            try {
              const l = await fetch(
                "http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php"
              )
                .then((r) => r.json())
                .catch(() => ({}));
              {
                const apiLots =
                  l?.success && Array.isArray(l.data) ? l.data : [];
                // Loại bỏ duplicate dựa trên ma_lo_trong hoặc id
                const byId = new Map();
                apiLots.forEach((x) => {
                  const lotId = String(x.ma_lo_trong ?? x.id);
                  if (lotId && lotId !== "undefined" && lotId !== "null") {
                    // Chỉ lưu lần đầu tiên gặp, bỏ qua duplicate
                    if (!byId.has(lotId)) {
                      byId.set(lotId, x);
                    }
                  }
                });
                const defaultSix = Array.from({ length: 6 }, (_, i) => {
                  const id = String(i + 1);
                  const api = byId.get(id) || {};
                  return { id, ...api };
                });
                setLots(defaultSix);
              }
              alert("Đã reset dữ liệu từ database");
            } catch (e) {
              alert("Lỗi reset: " + e.message);
            }
          }}
        >
          RESET DỮ LIỆU
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setOpenProcessMgr(true)}
        >
          Quản lí quy trình
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateTree(true)}
        >
          Tạo giống cây
        </Button>

        <Button
          size="small"
          variant="contained"
          onClick={() => setOpenCreateLot(true)}
        >
          Thêm lô
        </Button>
      </Box>

      {/* Grid các lô canh tác */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {(Array.isArray(lots) ? lots.filter(Boolean) : []).map((lot) => {
          const plan = findPlanForLot(lot);
          // Status: prefer plan-derived status, fallback to lot.trang_thai_lo
          const status = plan
            ? getLotStatus(lot)
            : lot.trang_thai_lo || "Sẵn sàng";
          // Giống: prefer plan.ma_giong, fallback lot.ma_giong
          const giongName = (() => {
            const idToResolve =
              plan?.ma_giong != null ? plan.ma_giong : lot?.ma_giong;
            if (idToResolve != null && Array.isArray(giongs)) {
              const g = giongs.find(
                (x) => String(x.id) === String(idToResolve)
              );
              return g
                ? g.ten_giong || `Giống #${idToResolve}`
                : `Giống #${idToResolve}`;
            }
            return "Chưa chọn";
          })();
          const imageUrl = plan?.hinh_anh || lot.image || "";
          const resolvedImage =
            imageUrl &&
            (imageUrl.startsWith("http")
              ? imageUrl
              : `http://localhost/doancuoinam/${imageUrl.replace(/^\/+/, "")}`);
          return (
            <Paper
              key={lot.id}
              sx={{
                p: 0,
                border: "1px solid #eaeaea",
                borderRadius: 2,
                overflow: "hidden",
                transition: "box-shadow .2s ease",
                "&:hover": { boxShadow: 3 },
              }}
            >
              <Box
                sx={{ position: "relative", height: 120, bgcolor: "#f5f7fb" }}
              >
                {resolvedImage ? (
                  <img
                    src={resolvedImage}
                    alt={formatLotLabel(lot.id)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#90a4ae",
                      fontSize: 24,
                    }}
                  >
                    🗺️
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {plan && (
                    <Chip label="Đã có KH" color="success" size="small" />
                  )}
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatLotLabel(lot.id)}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Chip
                    label={status}
                    color={STATUS_COLORS[status] || "default"}
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gap: 0.5,
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {" "}
                    <RoomIcon fontSize="small" />{" "}
                    <span>
                      Vị trí: {lot.vi_tri || lot.location || "Khu vực mặc định"}
                    </span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {" "}
                    <AgricultureIcon fontSize="small" />{" "}
                    <span>
                      Diện tích:{" "}
                      {plan?.dien_tich_trong ?? lot?.dien_tich ?? "Chưa có"}{" "}
                      {(plan?.dien_tich_trong ?? lot?.dien_tich) ? "ha" : ""}
                    </span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {" "}
                    <CategoryIcon fontSize="small" />{" "}
                    <span>Loại cây: {giongName}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {" "}
                    <EventIcon fontSize="small" />{" "}
                    <span>
                      Thu hoạch:{" "}
                      {plan?.ngay_du_kien_thu_hoach ??
                        lot?.ngay_thu_hoach ??
                        "Chưa có"}
                    </span>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenCreateForLot(lot)}
                    sx={{ flex: 1, fontWeight: 700 }}
                  >
                    ĐIỀN THÔNG TIN
                  </Button>
                  <Tooltip title="Xóa lô">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        const id = Number(lot.id);
                        if (!id || Number.isNaN(id)) {
                          alert("Mã lô không hợp lệ");
                          return;
                        }
                        if (
                          !window.confirm(
                            `Xóa lô ${id}? Hành động này sẽ không thể hoàn tác.`
                          )
                        )
                          return;
                        try {
                          const r = await deleteLot(id);
                          if (!r?.success)
                            throw new Error(r?.error || "Xóa lô thất bại");
                          // Refresh lots grid from DB: show existing lots, then pad to minimum 6 with next free ids
                          const l = await fetch(
                            "http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php"
                          )
                            .then((r) => r.json())
                            .catch(() => ({}));
                          const apiLots =
                            l?.success && Array.isArray(l.data) ? l.data : [];
                          const existing = apiLots
                            .map((x) => ({
                              ...x,
                              id: String(x.ma_lo_trong ?? x.id),
                            }))
                            .sort(
                              (a, b) =>
                                (parseInt(a.id, 10) || 0) -
                                (parseInt(b.id, 10) || 0)
                            );
                          const taken = new Set(
                            existing.map((x) => String(x.id))
                          );
                          const display = [...existing];
                          let nextId = 1;
                          while (display.length < 6) {
                            while (taken.has(String(nextId))) nextId++;
                            display.push({ id: String(nextId) });
                            nextId++;
                          }
                          setLots(display);
                          // Remove any plan attached to this lot in the local state view
                          setPlans((prev) =>
                            prev.filter(
                              (p) => String(p.ma_lo_trong) !== String(id)
                            )
                          );
                          alert("Đã xóa lô");
                        } catch (e) {
                          alert(e.message || "Không thể xóa lô");
                        }
                      }}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xem bản đồ">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleOpenMapWithLot(lot)}
                    >
                      🗺️
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          );
        })}
        {(!lots || lots.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu lô trồng.
          </Typography>
        )}
      </Box>

      {/* Kế hoạch đã lưu trong hệ thống (lọc theo trạng thái) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Kế hoạch đã lưu trong hệ thống
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            label="Tất cả"
            color={savedFilter === "all" ? "primary" : "default"}
            onClick={() => setSavedFilter("all")}
          />
          <Chip
            label="Chuẩn bị"
            color={savedFilter === "chuan_bi" ? "primary" : "default"}
            onClick={() => setSavedFilter("chuan_bi")}
          />
          <Chip
            label="Đang trồng"
            color={savedFilter === "dang_trong" ? "primary" : "default"}
            onClick={() => setSavedFilter("dang_trong")}
          />
          <Chip
            label="Đã thu hoạch"
            color={savedFilter === "da_thu_hoach" ? "primary" : "default"}
            onClick={() => setSavedFilter("da_thu_hoach")}
          />
          <Box sx={{ display: "flex", gap: 1, ml: { xs: 0, md: 2 } }}>
            <TextField
              type="date"
              size="small"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              value={savedFrom}
              onChange={(e) => setSavedFrom(e.target.value)}
            />
            <TextField
              type="date"
              size="small"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              value={savedTo}
              onChange={(e) => setSavedTo(e.target.value)}
            />
            <Button
              variant="text"
              onClick={() => {
                setSavedFrom("");
                setSavedTo("");
              }}
            >
              Xóa lọc ngày
            </Button>
          </Box>
        </Box>
        {(() => {
          const allPlans = Array.isArray(plans) ? plans : [];
          const byStatus =
            savedFilter === "all"
              ? allPlans
              : allPlans.filter((p) => p?.trang_thai === savedFilter);
          const filtered = byStatus.filter((p) => {
            const d = p?.ngay_du_kien_thu_hoach
              ? String(p.ngay_du_kien_thu_hoach).slice(0, 10)
              : null;
            if (!savedFrom && !savedTo) return true;
            if (!d) return false;
            if (savedFrom && d < savedFrom) return false;
            if (savedTo && d > savedTo) return false;
            return true;
          });
          if (filtered.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                Không có kế hoạch phù hợp bộ lọc.
              </Typography>
            );
          }
          const statusLabel = (t) =>
            t === "da_thu_hoach"
              ? "Đã thu hoạch"
              : t === "dang_trong"
                ? "Đang trồng"
                : "Chuẩn bị";
          const statusColor = (t) =>
            t === "da_thu_hoach"
              ? "success"
              : t === "dang_trong"
                ? "info"
                : "warning";
          const resolveGiongName = (id) => {
            if (!id) return "-";
            const g = Array.isArray(giongs)
              ? giongs.find((x) => String(x.id) === String(id))
              : null;
            return g?.ten_giong || `Giống #${id}`;
          };
          return (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {filtered.map((p) => (
                <Paper
                  key={p.ma_ke_hoach}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    position: "relative",
                  }}
                >
                  {activatedPlanIds.has(String(p.ma_ke_hoach)) && (
                    <Chip
                      label="Đã lên lịch"
                      color="success"
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    />
                  )}
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Kế hoạch #{p.ma_ke_hoach}
                  </Typography>
                  <Box sx={{ display: "grid", gap: 0.5, mt: 1 }}>
                    <span>Mã lô trồng: {p.ma_lo_trong ?? "-"}</span>
                    <span>
                      Diện tích: {p.dien_tich_trong ?? "-"}{" "}
                      {p.dien_tich_trong ? "ha" : ""}
                    </span>
                    <span>Giống cây: {resolveGiongName(p.ma_giong)}</span>
                    <span>Ngày bắt đầu: {p.ngay_bat_dau ?? "-"}</span>
                    <span>
                      Ngày dự kiến thu hoạch: {p.ngay_du_kien_thu_hoach ?? "-"}
                    </span>
                    <Chip
                      label={statusLabel(p.trang_thai)}
                      color={statusColor(p.trang_thai)}
                      size="small"
                      sx={{ mt: 1, width: "fit-content" }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedPlan(p);
                        setOpenDetails(true);
                      }}
                    >
                      Xem
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={async () => {
                        if (!window.confirm(`Xóa kế hoạch #${p.ma_ke_hoach}?`))
                          return;
                        try {
                          await deletePlan(p.ma_ke_hoach);
                          const r = await listPlans();
                          if (r?.success) setPlans(r.data || []);
                        } catch (e) {
                          alert(e.message || "Không thể xóa kế hoạch");
                        }
                      }}
                    >
                      Xóa
                    </Button>
                    {activatedPlanIds.has(String(p.ma_ke_hoach)) ? (
                      <>
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Thu hồi kích hoạt? Tất cả lịch đã tạo sẽ bị xóa."
                              )
                            )
                              return;
                            try {
                              await deleteTasksByPlan(p.ma_ke_hoach);
                              const r = await listTasks();
                              if (r?.success) {
                                const s = new Set();
                                (r.data || []).forEach((t) => {
                                  if (t.ma_ke_hoach != null)
                                    s.add(String(t.ma_ke_hoach));
                                });
                                setActivatedPlanIds(s);
                              }
                            } catch (e) {
                              alert(e.message);
                            }
                          }}
                        >
                          Thu hồi kích hoạt
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEditSchedule(p)}
                        >
                          Sửa lịch
                        </Button>
                      </>
                    ) : (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={async () => {
                            await activatePlan(p, {
                              preferSingleFarmer: false,
                            });
                            const r = await listTasks();
                            if (r?.success) {
                              const s = new Set();
                              (r.data || []).forEach((t) => {
                                if (t.ma_ke_hoach != null)
                                  s.add(String(t.ma_ke_hoach));
                              });
                              setActivatedPlanIds(s);
                            }
                          }}
                        >
                         Chia lịch tự động
                        </Button>
                        {/* <Button
                          size="small"
                          color="secondary"
                          variant="outlined"
                          onClick={async () => {
                            await activatePlan(p, { preferSingleFarmer: true });
                            const r = await listTasks();
                            if (r?.success) {
                              const s = new Set();
                              (r.data || []).forEach((t) => {
                                if (t.ma_ke_hoach != null)
                                  s.add(String(t.ma_ke_hoach));
                              });
                              setActivatedPlanIds(s);
                            }
                          }}
                        >
                          1 ND xuyên suốt
                        </Button> */}
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          );
        })()}
      </Box>

      {/* Chi tiết kế hoạch */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết kế hoạch sản xuất</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPlan ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã kế hoạch:
                </Typography>
                <Typography fontWeight={600}>
                  {selectedPlan.ma_ke_hoach}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã lô trồng:
                </Typography>
                <Typography>{selectedPlan.ma_lo_trong ?? "-"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Diện tích trồng:
                </Typography>
                <Typography>
                  {selectedPlan.dien_tich_trong ?? "-"} ha
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày bắt đầu:
                </Typography>
                <Typography>{selectedPlan.ngay_bat_dau ?? "-"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày dự kiến thu hoạch:
                </Typography>
                <Typography>
                  {selectedPlan.ngay_du_kien_thu_hoach ?? "-"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái:
                </Typography>
                <Typography>{selectedPlan.trang_thai}</Typography>
              </Box>
              {selectedPlan.ghi_chu && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghi chú:
                  </Typography>
                  <Typography>{selectedPlan.ghi_chu}</Typography>
                </Box>
              )}
              {(() => {
                // Ưu tiên lấy tên quy trình từ ma_quy_trinh của kế hoạch
                let scheduleTitle = "";
                // Kiểm tra ma_quy_trinh có giá trị hợp lệ (không null, không undefined, không rỗng)
                const hasQuyTrinh = selectedPlan?.ma_quy_trinh != null && 
                                   selectedPlan?.ma_quy_trinh !== "" && 
                                   selectedPlan?.ma_quy_trinh !== undefined;
                
                if (hasQuyTrinh && Array.isArray(processes) && processes.length > 0) {
                  // So sánh cả string và number để đảm bảo tìm thấy
                  const process = processes.find(
                    (p) => String(p.ma_quy_trinh) === String(selectedPlan.ma_quy_trinh) ||
                           Number(p.ma_quy_trinh) === Number(selectedPlan.ma_quy_trinh)
                  );
                  if (process?.ten_quy_trinh) {
                    scheduleTitle = `Tóm tắt lịch trình (${process.ten_quy_trinh})`;
                    console.log(`📋 Hiển thị quy trình: "${process.ten_quy_trinh}" (ID: ${process.ma_quy_trinh})`);
                  } else {
                    console.warn(`⚠️ Không tìm thấy quy trình với ID: ${selectedPlan.ma_quy_trinh} để hiển thị title`);
                  }
                }
                
                // Nếu không có quy trình hoặc không tìm thấy quy trình, hiển thị tên giống cây thực tế
                if (!scheduleTitle) {
                  const cropName = (() => {
                    const g = Array.isArray(giongs)
                      ? giongs.find(
                          (x) => String(x.id) === String(selectedPlan.ma_giong)
                        )
                      : null;
                    return g?.ten_giong || "";
                  })();
                  
                  // Nếu có tên giống, dùng tên giống; nếu không có thì dùng fallback cũ
                  if (cropName) {
                    scheduleTitle = `Tóm tắt lịch trình (${cropName})`;
                    console.log(`📝 Fallback về tên giống: "${cropName}"`);
                  } else {
                    // Fallback cuối cùng: logic cũ cho các giống đặc biệt
                    const norm = normalizeText(cropName);
                    const isSoy = norm.includes("dau");
                    const isDT2000 = isSoy && norm.includes("dt2000");
                    const isMango = norm.includes("xoai") || norm.includes("mango");
                    if (isDT2000) {
                      scheduleTitle = "Tóm tắt lịch trình (Đậu tương ĐT2000)";
                    } else if (isMango) {
                      scheduleTitle = "Tóm tắt lịch trình (Xoài)";
                    } else {
                      scheduleTitle = "Tóm tắt lịch trình (Ngô LVN10)";
                    }
                    console.log(`📝 Fallback cuối cùng: "${scheduleTitle}"`);
                  }
                }
                
                const preview = schedulePreview;
                if (!preview.length) return null;
                return (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      {scheduleTitle}
                    </Typography>
                    <Box sx={{ display: "grid", gap: 0.75 }}>
                      {preview.map((it, idx) => (
                        <Box
                          key={idx}
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        >
                          <b>{it.title}</b>: {it.from}
                          {it.to && it.to !== it.from
                            ? ` → ${it.to}`
                            : ""} — {it.desc} (Nhân công: {it.workers})
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          ) : (
            <Typography>Không có dữ liệu.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Đóng</Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenDetails(false);
              setOpenMap(true);
            }}
          >
            Xem bản đồ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quản lí quy trình */}
      <Dialog
        open={openProcessMgr}
        onClose={() => {
          setOpenProcessMgr(false);
          setSelectedProcess(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Quản lí quy trình canh tác</Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                setProcessForm({
                  ma_quy_trinh: null,
                  ten_quy_trinh: "",
                  ma_giong: "",
                  mo_ta: "",
                  thoi_gian_du_kien: "",
                  ngay_bat_dau: "",
                  ghi_chu: "",
                });
                setProcessTasks([]);
                setSelectedProcess(null);
              }}
            >
              + Tạo quy trình mới
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr" },
            }}
          >
            <TextField
              label="Tên quy trình"
              value={processForm.ten_quy_trinh}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ten_quy_trinh: e.target.value,
                }))
              }
            />
            <TextField
              select
              label="Giống"
              value={processForm.ma_giong}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ma_giong: e.target.value,
                }))
              }
            >
              <MenuItem value="">Chưa chọn</MenuItem>
              {giongs.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.ten_giong || `Giống #${g.id}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ngày bắt đầu (tùy chọn)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={processForm.ngay_bat_dau}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ngay_bat_dau: e.target.value,
                }))
              }
            />
          </Box>
          <TextField
            label="Mô tả"
            multiline
            minRows={2}
            value={processForm.mo_ta}
            onChange={(e) =>
              setProcessForm((prev) => ({ ...prev, mo_ta: e.target.value }))
            }
          />
          <TextField
            label="Ghi chú"
            multiline
            minRows={1}
            value={processForm.ghi_chu}
            onChange={(e) =>
              setProcessForm((prev) => ({ ...prev, ghi_chu: e.target.value }))
            }
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const payload = { ...processForm };
                  if (!payload.ten_quy_trinh || !payload.ma_giong) {
                    alert("Nhập tên quy trình và chọn giống");
                    return;
                  }
                  const r = await upsertProcess(payload);
                  if (!r?.success)
                    throw new Error(r?.error || "Lưu quy trình thất bại");
                  const lp = await listProcesses();
                  if (lp?.success) setProcesses(lp.data || []);
                  if (r.ma_quy_trinh) {
                    setProcessForm((prev) => ({
                      ...prev,
                      ma_quy_trinh: r.ma_quy_trinh,
                    }));
                    // Set selectedProcess để có thể thêm công việc ngay
                    const newProcess = lp?.data?.find(p => String(p.ma_quy_trinh) === String(r.ma_quy_trinh));
                    if (newProcess) {
                      setSelectedProcess(newProcess);
                    }
                  }
                  alert("Đã lưu quy trình");
                } catch (e) {
                  alert(e.message);
                }
              }}
            >
              Lưu quy trình
            </Button>
            {processForm?.ma_quy_trinh && (
              <Button
                color="error"
                variant="outlined"
                onClick={async () => {
                  if (!window.confirm("Xóa quy trình và toàn bộ công việc?"))
                    return;
                  try {
                    await deleteProcess(processForm.ma_quy_trinh);
                    const lp = await listProcesses();
                    if (lp?.success) setProcesses(lp.data || []);
                    setProcessForm({
                      ma_quy_trinh: null,
                      ten_quy_trinh: "",
                      ma_giong: "",
                      mo_ta: "",
                      thoi_gian_du_kien: "",
                    });
                    setProcessTasks([]);
                  } catch (e) {
                    alert(e.message);
                  }
                }}
              >
                Xóa quy trình
              </Button>
            )}
          </Box>

          <Divider />
          <Typography variant="subtitle2">
            Danh sách quy trình hiện có
          </Typography>
          <Box sx={{ display: "grid", gap: 1 }}>
            {processes.map((p) => (
              <Paper
                key={p.ma_quy_trinh}
                sx={{
                  p: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "grid" }}>
                  <Typography fontWeight={600}>
                    #{p.ma_quy_trinh} — {p.ten_quy_trinh}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Giống:{" "}
                    {(() => {
                      const g = giongs.find(
                        (x) => String(x.id) === String(p.ma_giong)
                      );
                      return g?.ten_giong || p.ma_giong;
                    })()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={async () => {
                      setSelectedProcess(p);
                      setProcessForm({
                        ma_quy_trinh: p.ma_quy_trinh,
                        ten_quy_trinh: p.ten_quy_trinh,
                        ma_giong: p.ma_giong,
                        mo_ta: p.mo_ta || "",
                        ngay_bat_dau: p.ngay_bat_dau || "",
                        ngay_ket_thuc: p.ngay_ket_thuc || "",
                        ghi_chu: p.ghi_chu || "",
                      });
                      try {
                        const r = await listProcessTasks(p.ma_quy_trinh);
                        const raw = Array.isArray(r?.data) ? r.data : [];
                        // Preserve khoang_cach_truoc values from DB, use default 5 if not set
                        const DEFAULT_GAP_DAYS = 5;
                        const normalized = [];
                        for (let i = 0; i < raw.length; i++) {
                          const t = { ...raw[i] };
                          if (i === 0) {
                            const start = Number(t.thoi_gian_bat_dau ?? 0) || 0;
                            const end =
                              t.thoi_gian_ket_thuc ??
                              t.thoi_gian_bat_dau ??
                              start;
                            t.thoi_gian_bat_dau = start;
                            t.thoi_gian_ket_thuc = end;
                            normalized.push(t);
                          } else {
                            const prev = normalized[i - 1];
                            const prevEnd =
                              Number(
                                prev.thoi_gian_ket_thuc ??
                                  prev.thoi_gian_bat_dau ??
                                  0
                              ) || 0;
                            // Use saved khoang_cach if available, otherwise calculate from offsets
                            const savedGap = t.khoang_cach;
                            const nextStart = Number(
                              t.thoi_gian_bat_dau ??
                                prevEnd + (savedGap || DEFAULT_GAP_DAYS)
                            );
                            const gap = savedGap || nextStart - prevEnd;
                            const useGap =
                              Number.isFinite(gap) && gap > 0
                                ? gap
                                : DEFAULT_GAP_DAYS;
                            t.khoang_cach = savedGap || DEFAULT_GAP_DAYS; // Preserve saved value
                            const start = prevEnd + useGap;
                            const duration =
                              Number(
                                t.thoi_gian_ket_thuc ??
                                  t.thoi_gian_bat_dau ??
                                  start
                              ) - Number(t.thoi_gian_bat_dau ?? start);
                            const end =
                              start +
                              (Number.isFinite(duration)
                                ? Math.max(0, duration)
                                : 0);
                            t.thoi_gian_bat_dau = start;
                            t.thoi_gian_ket_thuc = end;
                            // Preserve the saved gap value
                            t.khoang_cach = savedGap || useGap;
                            normalized.push(t);
                          }
                        }
                        // Sắp xếp theo thu_tu_thuc_hien nếu có, nếu không thì giữ nguyên thứ tự
                        normalized.sort((a, b) => {
                          const orderA = a.thu_tu_thuc_hien ?? 999;
                          const orderB = b.thu_tu_thuc_hien ?? 999;
                          return orderA - orderB;
                        });
                        // Đảm bảo tất cả có thu_tu_thuc_hien (set theo index nếu null)
                        normalized.forEach((task, i) => {
                          if (!task.thu_tu_thuc_hien || task.thu_tu_thuc_hien === null) {
                            task.thu_tu_thuc_hien = i + 1;
                          }
                        });
                        setProcessTasks(normalized);
                      } catch (e) {
                        console.warn(
                          "Could not load process tasks:",
                          e.message
                        );
                        setProcessTasks([]);
                      }
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={async () => {
                      if (!window.confirm(`Bạn có chắc chắn muốn xóa quy trình "${p.ten_quy_trinh}"?`)) {
                        return;
                      }
                      try {
                        const res = await deleteProcess(p.ma_quy_trinh);
                        if (!res?.success) {
                          throw new Error(res?.error || "Xóa quy trình thất bại");
                        }
                        // Reload danh sách quy trình
                        const lp = await listProcesses();
                        if (lp?.success) setProcesses(lp.data || []);
                        // Reset form nếu đang chỉnh sửa quy trình bị xóa
                        if (selectedProcess?.ma_quy_trinh === p.ma_quy_trinh) {
                          setSelectedProcess(null);
                          setProcessForm({
                            ma_quy_trinh: "",
                            ten_quy_trinh: "",
                            ma_giong: "",
                            mo_ta: "",
                            thoi_gian_du_kien: "",
                            ngay_bat_dau: "",
                            ghi_chu: "",
                          });
                          setProcessTasks([]);
                        }
                        alert("Đã xóa quy trình thành công!");
                      } catch (e) {
                        alert(e.message || "Không thể xóa quy trình");
                      }
                    }}
                  >
                    Xóa
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>

          {(selectedProcess || processForm?.ma_quy_trinh) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">
                Công việc của quy trình #{selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh}
              </Typography>
              <Box sx={{ display: "grid", gap: 1 }}>
                {processTasks.map((t, idx) => (
                  <React.Fragment key={`task-${t.ma_cong_viec || idx}`}>
                  <Paper sx={{ p: 1 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "1.4fr 1fr 1fr 1fr",
                        },
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Tên công việc"
                        value={t.ten_cong_viec || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = { ...cp[idx], ten_cong_viec: v };
                            return cp;
                          });
                        }}
                      />
                      <TextField
                        label="Số người cần"
                        value={t.so_nguoi || t.so_nguoi_can || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = { ...cp[idx], so_nguoi: v, so_nguoi_can: v };
                            return cp;
                          });
                        }}
                      />
                      <TextField
                        label="Thứ tự"
                        type="number"
                        value={t.thu_tu_thuc_hien ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = {
                              ...cp[idx],
                              thu_tu_thuc_hien: v === "" ? null : Number(v),
                            };
                            return cp;
                          });
                        }}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = {
                              ...cp[idx],
                              _editDates: !cp[idx]._editDates,
                            };
                            return cp;
                          });
                        }}
                      >
                        {t._editDates ? "Ẩn sửa ngày" : "Sửa ngày"}
                      </Button>
                    </Box>
                    {t._editDates && (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          mt: 1,
                        }}
                      >
                        <TextField
                          label="Bắt đầu (ngày +offset)"
                          type="number"
                          value={t.thoi_gian_bat_dau ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProcessTasks((prev) => {
                              const cp = [...prev];
                              cp[idx] = {
                                ...cp[idx],
                                thoi_gian_bat_dau: v === "" ? null : Number(v),
                              };
                              return cp;
                            });
                          }}
                        />
                        <TextField
                          label="Kết thúc (ngày +offset)"
                          type="number"
                          value={t.thoi_gian_ket_thuc ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProcessTasks((prev) => {
                              const cp = [...prev];
                              cp[idx] = {
                                ...cp[idx],
                                thoi_gian_ket_thuc: v === "" ? null : Number(v),
                              };
                              return cp;
                            });
                          }}
                        />
                      </Box>
                    )}
                    {/* Khoảng cách giữa công việc hiện tại và công việc tiếp theo */}
                    {processTasks[idx + 1] && (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          mt: 1,
                        }}
                      >
                        {(() => {
                          // Hiển thị khoang_cach của task hiện tại
                          const currentTask = processTasks[idx];
                          const savedGap = currentTask?.khoang_cach;
                          const displayGap =
                            savedGap !== undefined && savedGap !== null
                              ? savedGap
                              : 5;

                          return (
                            <TextField
                              label={`Khoảng cách so với công việc trước đó (ngày)`}
                              type="number"
                              value={displayGap > 0 ? String(displayGap) : ""}
                              onChange={(e) => {
                                const newGap =
                                  e.target.value === ""
                                    ? 5
                                    : Number(e.target.value);
                                if (Number.isNaN(newGap) || newGap < 0) return;

                                // Lưu gap vào task hiện tại (khoang_cach)
                                setProcessTasks((prev) => {
                                  const cp = [...prev];
                                  const n = { ...cp[idx] };
                                  n.khoang_cach = Number(newGap);
                                  cp[idx] = n;
                                  return cp;
                                });
                              }}
                              helperText={`Đang cách nhau: ${displayGap} ngày`}
                            />
                          );
                        })()}
                      </Box>
                    )}
                    <TextField
                      sx={{ mt: 1 }}
                      multiline
                      minRows={2}
                      label="Mô tả"
                      value={t.mo_ta || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setProcessTasks((prev) => {
                          const cp = [...prev];
                          cp[idx] = { ...cp[idx], mo_ta: v };
                          return cp;
                        });
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          console.log("=== SAVE BUTTON CLICKED ===");
                          console.log("Current task state:", t);
                          console.log("khoang_cach from state:", t.khoang_cach);
                          console.log(
                            "Input field value:",
                            document.querySelector(
                              `input[value="${t.khoang_cach}"]`
                            )?.value
                          );
                          console.log(
                            "All input fields:",
                            document.querySelectorAll('input[type="number"]')
                          );

                          // Tìm input field khoang_cach cụ thể
                          const khoangCachInput =
                            document.querySelector(
                              'input[placeholder*="Khoảng cách"]'
                            ) ||
                            document.querySelector(
                              'input[value="' + t.khoang_cach + '"]'
                            );
                          console.log(
                            "Khoang cach input found:",
                            khoangCachInput
                          );
                          console.log(
                            "Khoang cach input value:",
                            khoangCachInput?.value
                          );

                          // Lấy quy_trinh_id từ selectedProcess hoặc processForm
                          const quyTrinhId = selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh;
                          if (!quyTrinhId) {
                            alert("Vui lòng lưu quy trình trước khi thêm công việc");
                            return;
                          }
                          
                          // Convert so_nguoi_can to number or null
                          // Get value from state - prioritize so_nguoi_can, fallback to so_nguoi
                          const rawValue = t.so_nguoi_can ?? t.so_nguoi ?? null;
                          
                          // Parse to number - simple and direct
                          let finalSoNguoi = null;
                          if (rawValue != null && rawValue !== "") {
                            const numValue = typeof rawValue === 'number' 
                              ? rawValue 
                              : parseInt(String(rawValue).trim(), 10);
                            
                            if (!isNaN(numValue) && numValue > 0) {
                              finalSoNguoi = numValue;
                            }
                          }
                          
                          const payload = {
                            ...t,
                            ma_cong_viec: t.ma_cong_viec || null,
                            quy_trinh_id: quyTrinhId,
                            khoang_cach: t.khoang_cach ?? 5,
                            // Explicitly set both fields AFTER spread to override any existing values
                            so_nguoi_can: finalSoNguoi,
                            so_nguoi: finalSoNguoi,
                          };
                          console.log("Sending payload:", payload);
                          console.log("DEBUG - t.so_nguoi_can:", t.so_nguoi_can, typeof t.so_nguoi_can);
                          console.log("DEBUG - t.so_nguoi:", t.so_nguoi, typeof t.so_nguoi);
                          console.log("DEBUG - rawValue:", rawValue, typeof rawValue);
                          console.log("DEBUG - finalSoNguoi:", finalSoNguoi);
                          console.log("DEBUG - payload.so_nguoi_can:", payload.so_nguoi_can);
                          console.log("DEBUG - payload.so_nguoi:", payload.so_nguoi);
                          console.log(
                            "khoang_cach value being sent:",
                            payload.khoang_cach
                          );
                          console.log("selectedProcess:", selectedProcess);
                          console.log("processForm:", processForm);
                          console.log("quyTrinhId:", quyTrinhId);

                          try {
                            const r = await upsertProcessTask(payload);
                            console.log("API response:", r);
                            if (!r?.success) {
                              console.error("API failed:", r);
                              alert(r?.error || "Lưu thất bại");
                              return;
                            }
                            console.log("API call successful!");
                            
                            // Cập nhật công việc vừa lưu với ma_cong_viec mới (nếu là tạo mới)
                            const savedTaskId = r.ma_cong_viec || t.ma_cong_viec;
                            
                            // Cập nhật state với ma_cong_viec mới và cập nhật lại thứ tự cho TẤT CẢ
                            setProcessTasks((prev) => {
                              const updated = prev.map((task, i) => {
                                if (i === idx) {
                                  // Cập nhật công việc vừa lưu
                                  return {
                                    ...task,
                                    ma_cong_viec: savedTaskId,
                                    thu_tu_thuc_hien: idx + 1,
                                  };
                                }
                                // Giữ nguyên các công việc khác, chỉ cập nhật thứ tự nếu cần
                                return {
                                  ...task,
                                  thu_tu_thuc_hien: i + 1,
                                };
                              });
                              
                              // Lưu lại thứ tự cho tất cả các công việc đã có trong DB
                              const saveOrderPromises = updated
                                .filter((task) => task.ma_cong_viec)
                                .map((task, i) => {
                                  // Chỉ cập nhật nếu thứ tự thay đổi
                                  return upsertProcessTask({
                                    ...task,
                                    ma_cong_viec: task.ma_cong_viec,
                                    quy_trinh_id: quyTrinhId,
                                    thu_tu_thuc_hien: i + 1,
                                  }).catch((err) => {
                                    console.warn(`Failed to update order for task ${task.ma_cong_viec}:`, err);
                                  });
                                });
                              
                              // Chạy song song để cập nhật thứ tự
                              Promise.all(saveOrderPromises).then(() => {
                                console.log("All task orders updated");
                              });
                              
                              return updated;
                            });
                            
                            // Reload từ DB để đồng bộ, nhưng merge với các công việc mới chưa lưu
                            const re = await listProcessTasks(
                              quyTrinhId
                            );
                            const freshData = Array.isArray(re?.data)
                              ? re.data
                              : [];
                            
                            // Giữ lại các công việc mới chưa được lưu (không có ma_cong_viec)
                            setProcessTasks((prev) => {
                              const unsavedTasks = prev.filter(
                                (task) => !task.ma_cong_viec
                              );
                              
                              // Merge: công việc từ DB + các công việc mới chưa lưu
                              const mergedData = [...freshData];
                              
                              // Merge khoang_cach và thứ tự từ state hiện tại
                              mergedData.forEach((item, i) => {
                                const currentItem = prev.find(
                                  (pt) => pt.ma_cong_viec && String(pt.ma_cong_viec) === String(item.ma_cong_viec)
                                );
                                if (currentItem) {
                                  if (currentItem.khoang_cach !== undefined) {
                                    item.khoang_cach = currentItem.khoang_cach;
                                  }
                                  if (currentItem.thu_tu_thuc_hien !== undefined) {
                                    item.thu_tu_thuc_hien = currentItem.thu_tu_thuc_hien;
                                  }
                                }
                              });
                              
                              // Thêm các công việc mới chưa lưu vào đúng vị trí
                              unsavedTasks.forEach((unsavedTask) => {
                                const insertIndex = (unsavedTask.thu_tu_thuc_hien || mergedData.length + 1) - 1;
                                mergedData.splice(insertIndex, 0, {
                                  ...unsavedTask,
                                  thu_tu_thuc_hien: insertIndex + 1,
                                });
                              });
                              
                              // Cập nhật lại thứ tự cho tất cả theo vị trí trong mảng
                              mergedData.forEach((task, i) => {
                                task.thu_tu_thuc_hien = i + 1;
                              });
                              
                              // Sắp xếp lại theo thu_tu_thuc_hien để đảm bảo
                              mergedData.sort((a, b) => {
                                const orderA = a.thu_tu_thuc_hien ?? 999;
                                const orderB = b.thu_tu_thuc_hien ?? 999;
                                return orderA - orderB;
                              });
                              
                              return mergedData;
                            });
                          } catch (error) {
                            console.error("API call failed:", error);
                            console.error("Error details:", error.response);
                            const errorMsg = error.response?.error || error.message || "Lỗi không xác định";
                            const debugInfo = error.response?.debug ? `\n\nChi tiết: ${JSON.stringify(error.response.debug)}` : "";
                            alert("Lỗi gọi API: " + errorMsg + debugInfo);
                            return;
                          }
                        }}
                      >
                        Lưu
                      </Button>
                      {t.ma_cong_viec && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={async () => {
                            if (!window.confirm("Xóa công việc?")) return;
                            await deleteProcessTask(t.ma_cong_viec);
                            const quyTrinhId = selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh;
                            if (quyTrinhId) {
                              const re = await listProcessTasks(quyTrinhId);
                              setProcessTasks(re?.data || []);
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      )}
                    </Box>
                  </Paper>
                  {/* Nút thêm bước giữa các công việc */}
                  {idx < processTasks.length - 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setProcessTasks((prev) => {
                            const newTask = {
                              ten_cong_viec: "",
                              mo_ta: "",
                              thoi_gian_bat_dau: 0,
                              thoi_gian_ket_thuc: 0,
                              so_nguoi: "",
                              so_nguoi_can: "",
                              thu_tu_thuc_hien: idx + 2,
                              lap_lai: 0,
                              khoang_cach_lap_lai: null,
                            };
                            const newList = [...prev];
                            newList.splice(idx + 1, 0, newTask);
                            // Cập nhật lại thứ tự cho TẤT CẢ các công việc (theo vị trí trong mảng)
                            newList.forEach((task, i) => {
                              task.thu_tu_thuc_hien = i + 1;
                            });
                            return newList;
                          });
                        }}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        + Thêm bước ở đây
                      </Button>
                    </Box>
                  )}
                </React.Fragment>
                ))}
                {/* Nút thêm bước ở cuối */}
                <Button
                  variant="outlined"
                  onClick={() =>
                    setProcessTasks((prev) => [
                      ...prev,
                      {
                        ten_cong_viec: "",
                        mo_ta: "",
                        thoi_gian_bat_dau: 0,
                        thoi_gian_ket_thuc: 0,
                        so_nguoi: "",
                        so_nguoi_can: "",
                        thu_tu_thuc_hien: prev.length + 1,
                        lap_lai: 0,
                        khoang_cach_lap_lai: null,
                      },
                    ])
                  }
                >
                  + Thêm bước
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenProcessMgr(false);
              setSelectedProcess(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tạo lô mới: tự động tạo với mã lô tăng dần */}
      <Dialog
        open={openCreateLot}
        onClose={() => setOpenCreateLot(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Thêm lô canh tác</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Diện tích (ha)"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            value={newLotArea}
            onChange={(e) => setNewLotArea(e.target.value)}
            helperText="Hệ thống sẽ tự động tạo mã lô mới"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateLot(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const dien_tich = newLotArea === "" ? 10.0 : Number(newLotArea);
                if (dien_tich < 0) {
                  alert("Diện tích phải >= 0");
                  return;
                }

                const r = await autoCreateLot(dien_tich);
                if (!r?.success)
                  throw new Error(r?.error || "Không thể tạo lô");

                // Refresh lots from database
                const l = await fetch(
                  "http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php",
                  { cache: "no-store" }
                )
                  .then((r) => r.json())
                  .catch(() => ({}));
                const apiLots =
                  l?.success && Array.isArray(l.data) ? l.data : [];

                // Show all existing lots
                const existing = apiLots
                  .map((x) => ({ ...x, id: String(x.ma_lo_trong ?? x.id) }))
                  .sort(
                    (a, b) =>
                      (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0)
                  );

                setLots(existing);
                setOpenCreateLot(false);
                setNewLotArea("10");
                alert(`Đã tạo lô mới với mã lô: ${r.ma_lo_trong}`);
              } catch (e) {
                alert("Lỗi: " + e.message);
              }
            }}
          >
            Tạo lô tự động
          </Button>
        </DialogActions>
      </Dialog>
      {/* Quản lí quy trình */}
      <Dialog
        open={openProcessMgr}
        onClose={() => {
          setOpenProcessMgr(false);
          setSelectedProcess(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Quản lí quy trình canh tác</Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                setProcessForm({
                  ma_quy_trinh: null,
                  ten_quy_trinh: "",
                  ma_giong: "",
                  mo_ta: "",
                  thoi_gian_du_kien: "",
                  ngay_bat_dau: "",
                  ghi_chu: "",
                });
                setProcessTasks([]);
                setSelectedProcess(null);
              }}
            >
              + Tạo quy trình mới
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr" },
            }}
          >
            <TextField
              label="Tên quy trình"
              value={processForm.ten_quy_trinh}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ten_quy_trinh: e.target.value,
                }))
              }
            />
            <TextField
              select
              label="Giống"
              value={processForm.ma_giong}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ma_giong: e.target.value,
                }))
              }
            >
              <MenuItem value="">Chưa chọn</MenuItem>
              {giongs.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.ten_giong || `Giống #${g.id}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ngày bắt đầu (tùy chọn)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={processForm.ngay_bat_dau}
              onChange={(e) =>
                setProcessForm((prev) => ({
                  ...prev,
                  ngay_bat_dau: e.target.value,
                }))
              }
            />
          </Box>
          <TextField
            label="Mô tả"
            multiline
            minRows={2}
            value={processForm.mo_ta}
            onChange={(e) =>
              setProcessForm((prev) => ({ ...prev, mo_ta: e.target.value }))
            }
          />
          <TextField
            label="Ghi chú"
            multiline
            minRows={1}
            value={processForm.ghi_chu}
            onChange={(e) =>
              setProcessForm((prev) => ({ ...prev, ghi_chu: e.target.value }))
            }
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const payload = { ...processForm };
                  if (!payload.ten_quy_trinh || !payload.ma_giong) {
                    alert("Nhập tên quy trình và chọn giống");
                    return;
                  }
                  const r = await upsertProcess(payload);
                  if (!r?.success)
                    throw new Error(r?.error || "Lưu quy trình thất bại");
                  const lp = await listProcesses();
                  if (lp?.success) setProcesses(lp.data || []);
                  if (r.ma_quy_trinh) {
                    setProcessForm((prev) => ({
                      ...prev,
                      ma_quy_trinh: r.ma_quy_trinh,
                    }));
                    // Set selectedProcess để có thể thêm công việc ngay
                    const newProcess = lp?.data?.find(p => String(p.ma_quy_trinh) === String(r.ma_quy_trinh));
                    if (newProcess) {
                      setSelectedProcess(newProcess);
                    }
                  }
                  alert("Đã lưu quy trình");
                } catch (e) {
                  alert(e.message);
                }
              }}
            >
              Lưu quy trình
            </Button>
            {processForm?.ma_quy_trinh && (
              <Button
                color="error"
                variant="outlined"
                onClick={async () => {
                  if (!window.confirm("Xóa quy trình và toàn bộ công việc?"))
                    return;
                  try {
                    await deleteProcess(processForm.ma_quy_trinh);
                    const lp = await listProcesses();
                    if (lp?.success) setProcesses(lp.data || []);
                    setProcessForm({
                      ma_quy_trinh: null,
                      ten_quy_trinh: "",
                      ma_giong: "",
                      mo_ta: "",
                      thoi_gian_du_kien: "",
                    });
                    setProcessTasks([]);
                  } catch (e) {
                    alert(e.message);
                  }
                }}
              >
                Xóa quy trình
              </Button>
            )}
          </Box>

          <Divider />
          <Typography variant="subtitle2">
            Danh sách quy trình hiện có
          </Typography>
          <Box sx={{ display: "grid", gap: 1 }}>
            {processes.map((p) => (
              <Paper
                key={p.ma_quy_trinh}
                sx={{
                  p: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "grid" }}>
                  <Typography fontWeight={600}>
                    #{p.ma_quy_trinh} — {p.ten_quy_trinh}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Giống:{" "}
                    {(() => {
                      const g = giongs.find(
                        (x) => String(x.id) === String(p.ma_giong)
                      );
                      return g?.ten_giong || p.ma_giong;
                    })()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={async () => {
                      setSelectedProcess(p);
                      setProcessForm({
                        ma_quy_trinh: p.ma_quy_trinh,
                        ten_quy_trinh: p.ten_quy_trinh,
                        ma_giong: p.ma_giong,
                        mo_ta: p.mo_ta || "",
                        ngay_bat_dau: p.ngay_bat_dau || "",
                        ngay_ket_thuc: p.ngay_ket_thuc || "",
                        ghi_chu: p.ghi_chu || "",
                      });
                      try {
                        const r = await listProcessTasks(p.ma_quy_trinh);
                        const raw = Array.isArray(r?.data) ? r.data : [];
                        // Preserve khoang_cach_truoc values from DB, use default 5 if not set
                        const DEFAULT_GAP_DAYS = 5;
                        const normalized = [];
                        for (let i = 0; i < raw.length; i++) {
                          const t = { ...raw[i] };
                          if (i === 0) {
                            const start = Number(t.thoi_gian_bat_dau ?? 0) || 0;
                            const end =
                              t.thoi_gian_ket_thuc ??
                              t.thoi_gian_bat_dau ??
                              start;
                            t.thoi_gian_bat_dau = start;
                            t.thoi_gian_ket_thuc = end;
                            normalized.push(t);
                          } else {
                            const prev = normalized[i - 1];
                            const prevEnd =
                              Number(
                                prev.thoi_gian_ket_thuc ??
                                  prev.thoi_gian_bat_dau ??
                                  0
                              ) || 0;
                            // Use saved khoang_cach if available, otherwise calculate from offsets
                            const savedGap = t.khoang_cach;
                            const nextStart = Number(
                              t.thoi_gian_bat_dau ??
                                prevEnd + (savedGap || DEFAULT_GAP_DAYS)
                            );
                            const gap = savedGap || nextStart - prevEnd;
                            const useGap =
                              Number.isFinite(gap) && gap > 0
                                ? gap
                                : DEFAULT_GAP_DAYS;
                            t.khoang_cach = savedGap || DEFAULT_GAP_DAYS; // Preserve saved value
                            const start = prevEnd + useGap;
                            const duration =
                              Number(
                                t.thoi_gian_ket_thuc ??
                                  t.thoi_gian_bat_dau ??
                                  start
                              ) - Number(t.thoi_gian_bat_dau ?? start);
                            const end =
                              start +
                              (Number.isFinite(duration)
                                ? Math.max(0, duration)
                                : 0);
                            t.thoi_gian_bat_dau = start;
                            t.thoi_gian_ket_thuc = end;
                            // Preserve the saved gap value
                            t.khoang_cach = savedGap || useGap;
                            normalized.push(t);
                          }
                        }
                        // Sắp xếp theo thu_tu_thuc_hien nếu có, nếu không thì giữ nguyên thứ tự
                        normalized.sort((a, b) => {
                          const orderA = a.thu_tu_thuc_hien ?? 999;
                          const orderB = b.thu_tu_thuc_hien ?? 999;
                          return orderA - orderB;
                        });
                        // Đảm bảo tất cả có thu_tu_thuc_hien (set theo index nếu null)
                        normalized.forEach((task, i) => {
                          if (!task.thu_tu_thuc_hien || task.thu_tu_thuc_hien === null) {
                            task.thu_tu_thuc_hien = i + 1;
                          }
                        });
                        setProcessTasks(normalized);
                      } catch (e) {
                        console.warn(
                          "Could not load process tasks:",
                          e.message
                        );
                        setProcessTasks([]);
                      }
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={async () => {
                      if (!window.confirm(`Bạn có chắc chắn muốn xóa quy trình "${p.ten_quy_trinh}"?`)) {
                        return;
                      }
                      try {
                        const res = await deleteProcess(p.ma_quy_trinh);
                        if (!res?.success) {
                          throw new Error(res?.error || "Xóa quy trình thất bại");
                        }
                        // Reload danh sách quy trình
                        const lp = await listProcesses();
                        if (lp?.success) setProcesses(lp.data || []);
                        // Reset form nếu đang chỉnh sửa quy trình bị xóa
                        if (selectedProcess?.ma_quy_trinh === p.ma_quy_trinh) {
                          setSelectedProcess(null);
                          setProcessForm({
                            ma_quy_trinh: "",
                            ten_quy_trinh: "",
                            ma_giong: "",
                            mo_ta: "",
                            thoi_gian_du_kien: "",
                            ngay_bat_dau: "",
                            ghi_chu: "",
                          });
                          setProcessTasks([]);
                        }
                        alert("Đã xóa quy trình thành công!");
                      } catch (e) {
                        alert(e.message || "Không thể xóa quy trình");
                      }
                    }}
                  >
                    Xóa
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>

          {(selectedProcess || processForm?.ma_quy_trinh) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">
                Công việc của quy trình #{selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh}
              </Typography>
              <Box sx={{ display: "grid", gap: 1 }}>
                {processTasks.map((t, idx) => (
                  <React.Fragment key={`task-${t.ma_cong_viec || idx}`}>
                  <Paper sx={{ p: 1 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "1.4fr 1fr 1fr 1fr",
                        },
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Tên công việc"
                        value={t.ten_cong_viec || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = { ...cp[idx], ten_cong_viec: v };
                            return cp;
                          });
                        }}
                      />
                      <TextField
                        label="Số người cần"
                        value={t.so_nguoi || t.so_nguoi_can || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = { ...cp[idx], so_nguoi: v, so_nguoi_can: v };
                            return cp;
                          });
                        }}
                      />
                      <TextField
                        label="Thứ tự"
                        type="number"
                        value={t.thu_tu_thuc_hien ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = {
                              ...cp[idx],
                              thu_tu_thuc_hien: v === "" ? null : Number(v),
                            };
                            return cp;
                          });
                        }}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setProcessTasks((prev) => {
                            const cp = [...prev];
                            cp[idx] = {
                              ...cp[idx],
                              _editDates: !cp[idx]._editDates,
                            };
                            return cp;
                          });
                        }}
                      >
                        {t._editDates ? "Ẩn sửa ngày" : "Sửa ngày"}
                      </Button>
                    </Box>
                    {t._editDates && (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          mt: 1,
                        }}
                      >
                        <TextField
                          label="Bắt đầu (ngày +offset)"
                          type="number"
                          value={t.thoi_gian_bat_dau ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProcessTasks((prev) => {
                              const cp = [...prev];
                              cp[idx] = {
                                ...cp[idx],
                                thoi_gian_bat_dau: v === "" ? null : Number(v),
                              };
                              return cp;
                            });
                          }}
                        />
                        <TextField
                          label="Kết thúc (ngày +offset)"
                          type="number"
                          value={t.thoi_gian_ket_thuc ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProcessTasks((prev) => {
                              const cp = [...prev];
                              cp[idx] = {
                                ...cp[idx],
                                thoi_gian_ket_thuc: v === "" ? null : Number(v),
                              };
                              return cp;
                            });
                          }}
                        />
                      </Box>
                    )}
                    {/* Khoảng cách giữa công việc hiện tại và công việc tiếp theo */}
                    {processTasks[idx + 1] && (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          mt: 1,
                        }}
                      >
                        {(() => {
                          // Hiển thị khoang_cach của task hiện tại
                          const currentTask = processTasks[idx];
                          const savedGap = currentTask?.khoang_cach;
                          const displayGap =
                            savedGap !== undefined && savedGap !== null
                              ? savedGap
                              : 5;

                          return (
                            <TextField
                              label={`Khoảng cách so với công việc trước đó (ngày)`}
                              type="number"
                              value={displayGap > 0 ? String(displayGap) : ""}
                              onChange={(e) => {
                                const newGap =
                                  e.target.value === ""
                                    ? 5
                                    : Number(e.target.value);
                                if (Number.isNaN(newGap) || newGap < 0) return;

                                // Lưu gap vào task hiện tại (khoang_cach)
                                setProcessTasks((prev) => {
                                  const cp = [...prev];
                                  const n = { ...cp[idx] };
                                  n.khoang_cach = Number(newGap);
                                  cp[idx] = n;
                                  return cp;
                                });
                              }}
                              helperText={`Đang cách nhau: ${displayGap} ngày`}
                            />
                          );
                        })()}
                      </Box>
                    )}
                    <TextField
                      sx={{ mt: 1 }}
                      multiline
                      minRows={2}
                      label="Mô tả"
                      value={t.mo_ta || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setProcessTasks((prev) => {
                          const cp = [...prev];
                          cp[idx] = { ...cp[idx], mo_ta: v };
                          return cp;
                        });
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          console.log("=== SAVE BUTTON CLICKED ===");
                          console.log("Current task state:", t);
                          console.log("khoang_cach from state:", t.khoang_cach);
                          console.log(
                            "Input field value:",
                            document.querySelector(
                              `input[value="${t.khoang_cach}"]`
                            )?.value
                          );
                          console.log(
                            "All input fields:",
                            document.querySelectorAll('input[type="number"]')
                          );

                          // Tìm input field khoang_cach cụ thể
                          const khoangCachInput =
                            document.querySelector(
                              'input[placeholder*="Khoảng cách"]'
                            ) ||
                            document.querySelector(
                              'input[value="' + t.khoang_cach + '"]'
                            );
                          console.log(
                            "Khoang cach input found:",
                            khoangCachInput
                          );
                          console.log(
                            "Khoang cach input value:",
                            khoangCachInput?.value
                          );

                          // Lấy quy_trinh_id từ selectedProcess hoặc processForm
                          const quyTrinhId = selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh;
                          if (!quyTrinhId) {
                            alert("Vui lòng lưu quy trình trước khi thêm công việc");
                            return;
                          }
                          
                          // Convert so_nguoi_can to number or null
                          // Get value from state - prioritize so_nguoi_can, fallback to so_nguoi
                          const rawValue = t.so_nguoi_can ?? t.so_nguoi ?? null;
                          
                          // Parse to number - simple and direct
                          let finalSoNguoi = null;
                          if (rawValue != null && rawValue !== "") {
                            const numValue = typeof rawValue === 'number' 
                              ? rawValue 
                              : parseInt(String(rawValue).trim(), 10);
                            
                            if (!isNaN(numValue) && numValue > 0) {
                              finalSoNguoi = numValue;
                            }
                          }
                          
                          const payload = {
                            ...t,
                            ma_cong_viec: t.ma_cong_viec || null,
                            quy_trinh_id: quyTrinhId,
                            khoang_cach: t.khoang_cach ?? 5,
                            // Explicitly set both fields AFTER spread to override any existing values
                            so_nguoi_can: finalSoNguoi,
                            so_nguoi: finalSoNguoi,
                          };
                          console.log("Sending payload:", payload);
                          console.log("DEBUG - t.so_nguoi_can:", t.so_nguoi_can, typeof t.so_nguoi_can);
                          console.log("DEBUG - t.so_nguoi:", t.so_nguoi, typeof t.so_nguoi);
                          console.log("DEBUG - rawValue:", rawValue, typeof rawValue);
                          console.log("DEBUG - finalSoNguoi:", finalSoNguoi);
                          console.log("DEBUG - payload.so_nguoi_can:", payload.so_nguoi_can);
                          console.log("DEBUG - payload.so_nguoi:", payload.so_nguoi);
                          console.log(
                            "khoang_cach value being sent:",
                            payload.khoang_cach
                          );
                          console.log("selectedProcess:", selectedProcess);
                          console.log("processForm:", processForm);
                          console.log("quyTrinhId:", quyTrinhId);

                          try {
                            const r = await upsertProcessTask(payload);
                            console.log("API response:", r);
                            if (!r?.success) {
                              console.error("API failed:", r);
                              alert(r?.error || "Lưu thất bại");
                              return;
                            }
                            console.log("API call successful!");
                            
                            // Cập nhật công việc vừa lưu với ma_cong_viec mới (nếu là tạo mới)
                            const savedTaskId = r.ma_cong_viec || t.ma_cong_viec;
                            
                            // Cập nhật state với ma_cong_viec mới và cập nhật lại thứ tự cho TẤT CẢ
                            setProcessTasks((prev) => {
                              const updated = prev.map((task, i) => {
                                if (i === idx) {
                                  // Cập nhật công việc vừa lưu
                                  return {
                                    ...task,
                                    ma_cong_viec: savedTaskId,
                                    thu_tu_thuc_hien: idx + 1,
                                  };
                                }
                                // Giữ nguyên các công việc khác, chỉ cập nhật thứ tự nếu cần
                                return {
                                  ...task,
                                  thu_tu_thuc_hien: i + 1,
                                };
                              });
                              
                              // Lưu lại thứ tự cho tất cả các công việc đã có trong DB
                              const saveOrderPromises = updated
                                .filter((task) => task.ma_cong_viec)
                                .map((task, i) => {
                                  // Chỉ cập nhật nếu thứ tự thay đổi
                                  return upsertProcessTask({
                                    ...task,
                                    ma_cong_viec: task.ma_cong_viec,
                                    quy_trinh_id: quyTrinhId,
                                    thu_tu_thuc_hien: i + 1,
                                  }).catch((err) => {
                                    console.warn(`Failed to update order for task ${task.ma_cong_viec}:`, err);
                                  });
                                });
                              
                              // Chạy song song để cập nhật thứ tự
                              Promise.all(saveOrderPromises).then(() => {
                                console.log("All task orders updated");
                              });
                              
                              return updated;
                            });
                            
                            // Reload từ DB để đồng bộ, nhưng merge với các công việc mới chưa lưu
                            const re = await listProcessTasks(
                              quyTrinhId
                            );
                            const freshData = Array.isArray(re?.data)
                              ? re.data
                              : [];
                            
                            // Giữ lại các công việc mới chưa được lưu (không có ma_cong_viec)
                            setProcessTasks((prev) => {
                              const unsavedTasks = prev.filter(
                                (task) => !task.ma_cong_viec
                              );
                              
                              // Merge: công việc từ DB + các công việc mới chưa lưu
                              const mergedData = [...freshData];
                              
                              // Merge khoang_cach và thứ tự từ state hiện tại
                              mergedData.forEach((item, i) => {
                                const currentItem = prev.find(
                                  (pt) => pt.ma_cong_viec && String(pt.ma_cong_viec) === String(item.ma_cong_viec)
                                );
                                if (currentItem) {
                                  if (currentItem.khoang_cach !== undefined) {
                                    item.khoang_cach = currentItem.khoang_cach;
                                  }
                                  if (currentItem.thu_tu_thuc_hien !== undefined) {
                                    item.thu_tu_thuc_hien = currentItem.thu_tu_thuc_hien;
                                  }
                                }
                              });
                              
                              // Thêm các công việc mới chưa lưu vào đúng vị trí
                              unsavedTasks.forEach((unsavedTask) => {
                                const insertIndex = (unsavedTask.thu_tu_thuc_hien || mergedData.length + 1) - 1;
                                mergedData.splice(insertIndex, 0, {
                                  ...unsavedTask,
                                  thu_tu_thuc_hien: insertIndex + 1,
                                });
                              });
                              
                              // Cập nhật lại thứ tự cho tất cả theo vị trí trong mảng
                              mergedData.forEach((task, i) => {
                                task.thu_tu_thuc_hien = i + 1;
                              });
                              
                              // Sắp xếp lại theo thu_tu_thuc_hien để đảm bảo
                              mergedData.sort((a, b) => {
                                const orderA = a.thu_tu_thuc_hien ?? 999;
                                const orderB = b.thu_tu_thuc_hien ?? 999;
                                return orderA - orderB;
                              });
                              
                              return mergedData;
                            });
                          } catch (error) {
                            console.error("API call failed:", error);
                            console.error("Error details:", error.response);
                            const errorMsg = error.response?.error || error.message || "Lỗi không xác định";
                            const debugInfo = error.response?.debug ? `\n\nChi tiết: ${JSON.stringify(error.response.debug)}` : "";
                            alert("Lỗi gọi API: " + errorMsg + debugInfo);
                            return;
                          }
                        }}
                      >
                        Lưu
                      </Button>
                      {t.ma_cong_viec && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={async () => {
                            if (!window.confirm("Xóa công việc?")) return;
                            await deleteProcessTask(t.ma_cong_viec);
                            const quyTrinhId = selectedProcess?.ma_quy_trinh || processForm?.ma_quy_trinh;
                            if (quyTrinhId) {
                              const re = await listProcessTasks(quyTrinhId);
                              setProcessTasks(re?.data || []);
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      )}
                    </Box>
                  </Paper>
                  {/* Nút thêm bước giữa các công việc */}
                  {idx < processTasks.length - 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setProcessTasks((prev) => {
                            const newTask = {
                              ten_cong_viec: "",
                              mo_ta: "",
                              thoi_gian_bat_dau: 0,
                              thoi_gian_ket_thuc: 0,
                              so_nguoi: "",
                              so_nguoi_can: "",
                              thu_tu_thuc_hien: idx + 2,
                              lap_lai: 0,
                              khoang_cach_lap_lai: null,
                            };
                            const newList = [...prev];
                            newList.splice(idx + 1, 0, newTask);
                            // Cập nhật lại thứ tự cho TẤT CẢ các công việc (theo vị trí trong mảng)
                            newList.forEach((task, i) => {
                              task.thu_tu_thuc_hien = i + 1;
                            });
                            return newList;
                          });
                        }}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        + Thêm bước ở đây
                      </Button>
                    </Box>
                  )}
                </React.Fragment>
                ))}
                {/* Nút thêm bước ở cuối */}
                <Button
                  variant="outlined"
                  onClick={() =>
                    setProcessTasks((prev) => [
                      ...prev,
                      {
                        ten_cong_viec: "",
                        mo_ta: "",
                        thoi_gian_bat_dau: 0,
                        thoi_gian_ket_thuc: 0,
                        so_nguoi: "",
                        so_nguoi_can: "",
                        thu_tu_thuc_hien: prev.length + 1,
                        lap_lai: 0,
                        khoang_cach_lap_lai: null,
                      },
                    ])
                  }
                >
                  + Thêm bước
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenProcessMgr(false);
              setSelectedProcess(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* tạo mới giống cây */}
      <Dialog
        open={OpenCreateTree}
        onClose={() => setOpenCreateTree(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo giống cây (mới)</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Divider />

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr 1fr 1fr" },
              }}
            >
              {/* Tên giống */}
              <TextField
                label="Tên giống"
                name="ten_giong"
                value={formData.ten_giong}
                onChange={handleChange}
                required
              />

              {/* Hình ảnh */}
              <Button
                variant="outlined"
                component="label"
                sx={{ textTransform: "none" }}
              >
                Chọn hình ảnh
                <input
                  type="file"
                  name="hinh_anh"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file)
                      setFormData((prev) => ({ ...prev, hinh_anh: file }));
                  }}
                />
              </Button>

              {formData.hinh_anh && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Đã chọn: {formData.hinh_anh.name}
                </Typography>
              )}

              {/* Số lượng */}
              <TextField
                label="Số lượng"
                name="so_luong_ton"
                type="number"
                value={formData.so_luong_ton}
                onChange={handleChange}
              />

              {/* Ngày mua */}
              <TextField
                type="date"
                label="Ngày mua"
                name="ngay_mua"
                InputLabelProps={{ shrink: true }}
                value={formData.ngay_mua}
                onChange={handleChange}
              />
            </Box>

            {/* Nhà cung cấp */}
            <TextField
              multiline
              minRows={2}
              label="Nhà cung cấp"
              name="nha_cung_cap"
              value={formData.nha_cung_cap}
              onChange={handleChange}
              fullWidth
            />

            {/* Thông báo */}
            {message && (
              <Typography
                sx={{
                  mt: 1,
                  color: message.includes("✅")
                    ? "green"
                    : message.includes("❌")
                      ? "red"
                      : "#e67e22",
                  fontWeight: 500,
                }}
              >
                {message}
              </Typography>
            )}
          </Box>

          {/* Danh sách hiển thị trong modal */}

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom className="text-xs">
              Danh sách giống cây hiện có
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>STT</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tên giống cây</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nhà cung cấp</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Số lượng</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Ngày mua</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length > 0 ? (
                  list.map((item, index) => (
                    <TableRow
                      key={item.id}
                      hover
                      onClick={() => {
                        setFormData({
                          ten_giong: item.ten_giong,
                           so_luong_ton: item.so_luong_ton,
                          ngay_mua: item.ngay_mua,
                          nha_cung_cap: item.nha_cung_cap,
                        });
                        setIsEdit(true);
                        setSelectedId(item.ma_giong);
                        setMessage(
                          "🟡 Đang chỉnh sửa giống cây: " + item.ten_giong
                        );
                      }}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.ten_giong}</TableCell>
                      <TableCell>{item.nha_cung_cap}</TableCell>
                      <TableCell>{item.so_luong_ton}</TableCell>
                      <TableCell>{item.ngay_mua}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreateTree(false)}>Đóng</Button>
          <Button
            variant="contained"
            onClick={isEdit ? handleUpdateTree : handleSaveTree}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sửa lịch làm việc cho kế hoạch */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sửa lịch làm việc cho kế hoạch #{editingPlan?.ma_ke_hoach}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            {editingTasks.map((t, idx) => (
              <Paper key={t.id || idx} sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr 1fr" },
                    alignItems: "center",
                  }}
                >
                  <TextField
                    label="Tên công việc"
                    value={t.ten_cong_viec || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditingTasks((prev) => {
                        const cp = [...prev];
                        cp[idx] = { ...cp[idx], ten_cong_viec: v };
                        return cp;
                      });
                    }}
                  />
                  <TextField
                    type="date"
                    label="Bắt đầu"
                    InputLabelProps={{ shrink: true }}
                    value={t.ngay_bat_dau || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditingTasks((prev) => {
                        const cp = [...prev];
                        cp[idx] = { ...cp[idx], ngay_bat_dau: v };
                        return cp;
                      });
                    }}
                  />
                  <TextField
                    type="date"
                    label="Kết thúc"
                    InputLabelProps={{ shrink: true }}
                    value={t.ngay_ket_thuc || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditingTasks((prev) => {
                        const cp = [...prev];
                        cp[idx] = { ...cp[idx], ngay_ket_thuc: v };
                        return cp;
                      });
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Nhân công</InputLabel>
                    <Select
                      label="Nhân công"
                      value={
                        t.ma_nguoi_dung
                          ? String(t.ma_nguoi_dung)
                              .split(",")
                              .map((id) => id.trim())
                              .filter(Boolean)
                          : []
                      }
                      onChange={(e) => {
                        const selectedIds = e.target.value;
                        const idsString = Array.isArray(selectedIds)
                          ? selectedIds.join(",")
                          : "";
                        setEditingTasks((prev) => {
                          const cp = [...prev];
                          cp[idx] = { ...cp[idx], ma_nguoi_dung: idsString };
                          return cp;
                        });
                      }}
                      multiple
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) return "";
                        return selected
                          .map((id) => {
                            const farmer = farmers.find(
                              (f) => String(f.id) === String(id)
                            );
                            return farmer
                              ? farmer.full_name || farmer.ho_ten || `ND#${id}`
                              : `ND#${id}`;
                          })
                          .join(", ");
                      }}
                    >
                      {farmers.map((farmer) => (
                        <MenuItem key={farmer.id} value={String(farmer.id)}>
                          <Checkbox
                            checked={
                              t.ma_nguoi_dung
                                ? String(t.ma_nguoi_dung)
                                    .split(",")
                                    .map((id) => id.trim())
                                    .filter(Boolean)
                                    .includes(String(farmer.id))
                                : false
                            }
                          />
                          <ListItemText
                            primary={
                              farmer.full_name ||
                              farmer.ho_ten ||
                              `Nông dân #${farmer.id}`
                            }
                            secondary={
                              farmer.phone ? `SĐT: ${farmer.phone}` : ""
                            }
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  multiline
                  minRows={2}
                  sx={{ mt: 1 }}
                  label="Mô tả"
                  value={t.mo_ta || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingTasks((prev) => {
                      const cp = [...prev];
                      cp[idx] = { ...cp[idx], mo_ta: v };
                      return cp;
                    });
                  }}
                  fullWidth
                />
              </Paper>
            ))}

            <Divider />
            <Typography variant="subtitle2">Thêm công việc mới</Typography>
            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr 1fr 1fr" },
              }}
            >
              <TextField
                label="Tên công việc"
                value={addingTask.ten_cong_viec}
                onChange={(e) =>
                  setAddingTask((prev) => ({
                    ...prev,
                    ten_cong_viec: e.target.value,
                  }))
                }
              />
              <TextField
                type="date"
                label="Bắt đầu"
                InputLabelProps={{ shrink: true }}
                value={addingTask.ngay_bat_dau}
                onChange={(e) =>
                  setAddingTask((prev) => ({
                    ...prev,
                    ngay_bat_dau: e.target.value,
                  }))
                }
              />
              <TextField
                type="date"
                label="Kết thúc"
                InputLabelProps={{ shrink: true }}
                value={addingTask.ngay_ket_thuc}
                onChange={(e) =>
                  setAddingTask((prev) => ({
                    ...prev,
                    ngay_ket_thuc: e.target.value,
                  }))
                }
              />
              <TextField
                label="Mã ND (tùy chọn)"
                value={addingTask.ma_nguoi_dung}
                onChange={(e) =>
                  setAddingTask((prev) => ({
                    ...prev,
                    ma_nguoi_dung: e.target.value,
                  }))
                }
              />
              <Button variant="outlined" onClick={addManualTask}>
                Thêm
              </Button>
            </Box>
            <TextField
              multiline
              minRows={2}
              label="Mô tả"
              value={addingTask.mo_ta}
              onChange={(e) =>
                setAddingTask((prev) => ({ ...prev, mo_ta: e.target.value }))
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Đóng</Button>
          <Button variant="contained" onClick={saveEditedTasks}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bản đồ lô trồng (OpenStreetMap) */}
      <Dialog
        open={openMap}
        onClose={() => {
          setOpenMap(false);
          setSelectedLotForMap(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedLotForMap
            ? `Vị trí ${formatLotLabel(selectedLotForMap.id)}`
            : "Bản đồ khu vực canh tác"}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: "relative", width: "100%", height: 500 }}>
            <iframe
              title="farm-map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=106.6280%2C10.8220%2C106.6320%2C10.8250&layer=mapnik&marker=10.8235%2C106.6300`}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Ghi chú: Chưa có tọa độ thực của lô, đang hiển thị khu vực mặc định.
            Khi API trả về lat/lng theo mã lô, bản đồ sẽ định vị chính xác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenMap(false);
              setSelectedLotForMap(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo kế hoạch</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Mã lô trồng"
            value={form.ma_lo_trong}
            fullWidth
            disabled
          />
          <TextField
            label="Diện tích (ha)"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            value={form.dien_tich_trong}
            onChange={(e) => {
              const newArea = e.target.value;
              // Recalculate workers with current crop selection
              const g = Array.isArray(giongs)
                ? giongs.find((x) => String(x.id) === String(form.ma_giong))
                : null;
              const cropName = g?.ten_giong || "";
              const workers = calculateWorkers(
                cropName,
                newArea === "" ? DEFAULT_AREA_PER_LOT_HA : Number(newArea)
              );
              setForm((prev) => ({
                ...prev,
                dien_tich_trong: newArea,
                so_luong_nhan_cong: String(workers),
              }));
            }}
            fullWidth
          />
          <TextField
            label="Ngày bắt đầu"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.ngay_bat_dau}
            inputProps={{ min: minStartDate || undefined }}
            error={Boolean(dateError)}
            helperText={
              dateError ||
              (minStartDate ? `Yêu cầu: không sớm hơn ${minStartDate}` : "")
            }
            onChange={(e) => {
              const newStart = e.target.value;
              if (minStartDate && newStart && newStart < minStartDate) {
                setDateError(
                  `Ngày bắt đầu phải sau ngày thu hoạch trước 10 ngày (${minStartDate}).`
                );
              } else {
                setDateError("");
              }
              
              // Tính ngày thu hoạch: ưu tiên thời gian canh tác, nếu không có thì dùng công thức cũ
              let harvestDate = "";
              if (form.thoi_gian_canh_tac && form.don_vi_thoi_gian) {
                harvestDate = calculateHarvestDateFromDuration(
                  newStart,
                  form.thoi_gian_canh_tac,
                  form.don_vi_thoi_gian
                );
              } else {
                const cropName = (() => {
                  const g = Array.isArray(giongs)
                    ? giongs.find((x) => String(x.id) === String(form.ma_giong))
                    : null;
                  return g?.ten_giong || "";
                })();
                harvestDate = calculateHarvestDate(newStart, cropName);
              }
              
              setForm((prev) => ({
                ...prev,
                ngay_bat_dau: newStart,
                ngay_du_kien_thu_hoach: harvestDate,
              }));
            }}
            fullWidth
          />
          {/* Loại cây: chọn từ danh sách giống nếu có */}
          <TextField
            select
            label="Loại cây (giống)"
            value={form.ma_giong}
            onChange={(e) => {
              const value = e.target.value;
              const g = Array.isArray(giongs)
                ? giongs.find((x) => String(x.id) === String(value))
                : null;
              const cropName = g?.ten_giong || "";
              
              // Tính ngày thu hoạch: ưu tiên thời gian canh tác, nếu không có thì dùng công thức cũ
              let harvest = "";
              if (form.thoi_gian_canh_tac && form.ngay_bat_dau && form.don_vi_thoi_gian) {
                harvest = calculateHarvestDateFromDuration(
                  form.ngay_bat_dau,
                  form.thoi_gian_canh_tac,
                  form.don_vi_thoi_gian
                );
              } else {
                harvest = calculateHarvestDate(form.ngay_bat_dau, cropName);
              }
              const areaForCalc =
                form.dien_tich_trong === ""
                  ? DEFAULT_AREA_PER_LOT_HA
                  : Number(form.dien_tich_trong);
              const workers = calculateWorkers(cropName, areaForCalc);
              
              // Kiểm tra quy trình đã chọn có phù hợp với giống mới không
              let ma_quy_trinh = form.ma_quy_trinh;
              if (form.ma_quy_trinh && value) {
                const selectedProcess = Array.isArray(processes)
                  ? processes.find(
                      (p) => String(p.ma_quy_trinh) === String(form.ma_quy_trinh)
                    )
                  : null;
                // Nếu quy trình đã chọn không khớp với giống mới, reset quy trình
                if (selectedProcess && String(selectedProcess.ma_giong) !== String(value)) {
                  ma_quy_trinh = "";
                }
              } else if (!value) {
                // Nếu không chọn giống, reset quy trình
                ma_quy_trinh = "";
              }
              
              setForm((prev) => ({
                ...prev,
                ma_giong: value,
                ngay_du_kien_thu_hoach: harvest,
                so_luong_nhan_cong: String(workers),
                ma_quy_trinh: ma_quy_trinh,
              }));
            }}
            fullWidth
          >
            <MenuItem value="">Chưa chọn</MenuItem>
            {Array.isArray(giongs) &&
              giongs.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.ten_giong || `Giống #${g.id}`}
                </MenuItem>
              ))}
          </TextField>
          {/* Thời gian canh tác */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Thời gian canh tác"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              value={form.thoi_gian_canh_tac}
              onChange={(e) => {
                const newDuration = e.target.value;
                let harvestDate = "";
                if (newDuration && form.ngay_bat_dau && form.don_vi_thoi_gian) {
                  harvestDate = calculateHarvestDateFromDuration(
                    form.ngay_bat_dau,
                    newDuration,
                    form.don_vi_thoi_gian
                  );
                } else if (form.ngay_bat_dau) {
                  // Nếu không có thời gian canh tác, dùng công thức cũ
                  const cropName = (() => {
                    const g = Array.isArray(giongs)
                      ? giongs.find((x) => String(x.id) === String(form.ma_giong))
                      : null;
                    return g?.ten_giong || "";
                  })();
                  harvestDate = calculateHarvestDate(form.ngay_bat_dau, cropName);
                }
                setForm((prev) => ({
                  ...prev,
                  thoi_gian_canh_tac: newDuration,
                  ngay_du_kien_thu_hoach: harvestDate,
                }));
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Đơn vị"
              value={form.don_vi_thoi_gian}
              onChange={(e) => {
                const newUnit = e.target.value;
                let harvestDate = "";
                if (form.thoi_gian_canh_tac && form.ngay_bat_dau && newUnit) {
                  harvestDate = calculateHarvestDateFromDuration(
                    form.ngay_bat_dau,
                    form.thoi_gian_canh_tac,
                    newUnit
                  );
                } else if (form.ngay_bat_dau) {
                  // Nếu không có thời gian canh tác, dùng công thức cũ
                  const cropName = (() => {
                    const g = Array.isArray(giongs)
                      ? giongs.find((x) => String(x.id) === String(form.ma_giong))
                      : null;
                    return g?.ten_giong || "";
                  })();
                  harvestDate = calculateHarvestDate(form.ngay_bat_dau, cropName);
                }
                setForm((prev) => ({
                  ...prev,
                  don_vi_thoi_gian: newUnit,
                  ngay_du_kien_thu_hoach: harvestDate,
                }));
              }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="ngay">Ngày</MenuItem>
              <MenuItem value="thang">Tháng</MenuItem>
              <MenuItem value="nam">Năm</MenuItem>
            </TextField>
          </Box>
          <TextField
            label="Ngày dự kiến thu hoạch"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.ngay_du_kien_thu_hoach}
            fullWidth
            disabled
            helperText="Tự động tính từ ngày bắt đầu + thời gian canh tác"
          />
          <TextField
            label="Số lượng nhân công (tự tính)"
            type="number"
            value={form.so_luong_nhan_cong}
            fullWidth
            disabled
          />
          {/* Chọn quy trình áp dụng cho kế hoạch (tùy chọn) */}
          <TextField
            select
            label="Kế hoạch sản xuất (quy trình)"
            value={form.ma_quy_trinh || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, ma_quy_trinh: e.target.value }))
            }
            fullWidth
          >
            <MenuItem value="">Mặc định theo giống</MenuItem>
            {Array.isArray(processes) &&
              processes
                .filter(
                  (p) =>
                    !form.ma_giong ||
                    String(p.ma_giong) === String(form.ma_giong)
                )
                .map((p) => (
                  <MenuItem key={p.ma_quy_trinh} value={p.ma_quy_trinh}>
                    #{p.ma_quy_trinh} — {p.ten_quy_trinh}
                  </MenuItem>
                ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              // Kiểm tra các trường bắt buộc
              if (!form.ma_lo_trong) {
                alert("Vui lòng chọn lô trồng");
                return;
              }
              if (!form.ma_giong) {
                alert("Vui lòng chọn loại cây (giống)");
                return;
              }
              if (!form.ngay_bat_dau) {
                alert("Vui lòng chọn ngày bắt đầu");
                return;
              }
              if (!form.ngay_du_kien_thu_hoach) {
                alert("Vui lòng chọn ngày dự kiến thu hoạch (hoặc chọn lại ngày bắt đầu để tự động tính)");
                return;
              }
              // Kiểm tra ràng buộc 10 ngày nếu lô đã có KH
              if (minStartDate) {
                if (form.ngay_bat_dau < minStartDate) {
                  alert(
                    `Ngày bắt đầu phải sau ngày thu hoạch trước 10 ngày (${minStartDate}).`
                  );
                  return;
                }
              }
              await handleSave();
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}