import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

const hours = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const initialSchedule = {
  "T2-08:00": { task: "Tưới cây", status: "Chờ" },
  "T3-11:00": { task: "Bón phân", status: "Chờ" },
  "T6-08:00": { task: "Nhổ cỏ", status: "Đang làm" },
  "T7-11:00": { task: "Thu hoạch rau", status: "Hoàn thành" },
};

const WorkScheduleFullWeek = () => {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedCell, setSelectedCell] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [filterTask, setFilterTask] = useState("Tất cả");
  const [filterDay, setFilterDay] = useState("Tất cả");

  // Danh sách task từ schedule
  const allTasks = [...new Set(Object.values(schedule).map((s) => s.task))];

  const handleUpdateStatus = (status) => {
    if (selectedCell) {
      setSchedule((prev) => ({
        ...prev,
        [selectedCell]: { ...prev[selectedCell], status },
      }));
    }
    setSelectedCell(null);
  };

  // Hàm kiểm tra filter
  const checkFilter = (cell, day) => {
    if (!cell) return false;
    if (filterStatus !== "Tất cả" && cell.status !== filterStatus) return false;
    if (filterTask !== "Tất cả" && cell.task !== filterTask) return false;
    if (filterDay !== "Tất cả" && day !== filterDay) return false;
    return true;
  };

  return (
    <Box>
      <h2 style={{ textAlign: "center", margin: "20px 0" }}>
        Lịch làm việc (1 tuần)
      </h2>

      {/* Bộ lọc */}
      <Box display="flex" justifyContent="center" gap={3} mb={3}>
        <FormControl>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <MenuItem value="Tất cả">Tất cả</MenuItem>
            <MenuItem value="Chờ">Chờ</MenuItem>
            <MenuItem value="Đang làm">Đang làm</MenuItem>
            <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
            <MenuItem value="Báo lỗi">Báo lỗi</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Công việc</InputLabel>
          <Select
            value={filterTask}
            onChange={(e) => setFilterTask(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <MenuItem value="Tất cả">Tất cả</MenuItem>
            {allTasks.map((task) => (
              <MenuItem key={task} value={task}>
                {task}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Ngày</InputLabel>
          <Select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <MenuItem value="Tất cả">Tất cả</MenuItem>
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Bảng lịch */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giờ</TableCell>
              {days.map((day) => (
                <TableCell key={day} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour}>
                <TableCell>{hour}</TableCell>
                {days.map((day) => {
                  const key = `${day}-${hour}`;
                  const cell = schedule[key];
                  const isVisible = checkFilter(cell, day);

                  return (
                    <TableCell
                      key={key}
                      align="center"
                      style={{
                        cursor: cell ? "pointer" : "default",
                        background: cell
                          ? cell.status === "Hoàn thành"
                            ? "#C8E6C9"
                            : cell.status === "Đang làm"
                              ? "#FFF9C4"
                              : cell.status === "Chờ"
                                ? "#FFCDD2"
                                : "#FFAB91"
                          : "",
                      }}
                      onClick={() => cell && setSelectedCell(key)}
                    >
                      {cell ? (
                        isVisible ? (
                          <>
                            <b>{cell.task}</b> <br />
                            <small>({cell.status})</small>
                          </>
                        ) : (
                          "-"
                        )
                      ) : (
                        "Trống"
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Hộp thoại cập nhật trạng thái */}
      <Dialog open={!!selectedCell} onClose={() => setSelectedCell(null)}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleUpdateStatus("Hoàn thành")} color="success">
            Hoàn thành
          </Button>
          <Button onClick={() => handleUpdateStatus("Đang làm")} color="warning">
            Đang làm
          </Button>
          <Button onClick={() => handleUpdateStatus("Báo lỗi")} color="error">
            Báo lỗi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkScheduleFullWeek;
