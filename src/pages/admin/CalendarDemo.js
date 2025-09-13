import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import CalendarWeeklyView from '../../components/admin/CalendarWeeklyView';
import { listTasks, fetchFarmers } from '../../services/api';

export default function CalendarDemo() {
    const [tasks, setTasks] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load tasks
            const tasksResponse = await listTasks();
            if (tasksResponse?.success) {
                setTasks(tasksResponse.data || []);
            }

            // Load farmers
            const farmersResponse = await fetchFarmers();
            if (farmersResponse?.success) {
                setFarmers(farmersResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            console.log('Creating task:', taskData);
            // Here you would call your create task API
            // For demo purposes, we'll just log it
            alert('Tạo công việc thành công! (Demo mode)');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Lỗi khi tạo công việc: ' + error.message);
        }
    };

    const handleUpdateTask = async (taskData) => {
        try {
            console.log('Updating task:', taskData);
            // Here you would call your update task API
            alert('Cập nhật công việc thành công! (Demo mode)');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Lỗi khi cập nhật công việc: ' + error.message);
        }
    };

    const handleViewTask = (task) => {
        console.log('Viewing task:', task);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Đang tải dữ liệu...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', overflow: 'hidden' }}>
            <CalendarWeeklyView
                tasks={tasks}
                farmers={farmers}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onViewTask={handleViewTask}
            />
        </Box>
    );
}
