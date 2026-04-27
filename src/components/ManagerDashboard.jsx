import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ManagerDashboard = () => {
    // 1. Initial State: Sabhi arrays ko default empty rakha hai
    const [stats, setStats] = useState({ 
        hourly: [], 
        distribution: [], 
        totalToday: 0, 
        weekly: [] 
    });

    const fetchStats = async () => {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('userPassword');

        if (!username || !password) {
            console.error("Credentials missing! Please login again.");
            return;
        }

        try {
            const authHeader = `Basic ${btoa(username + ":" + password)}`;
            const res = await axios.get('http://localhost:8089/api/tokens/stats', {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                withCredentials: true 
            });
            console.log("Backend Response:", res.data);
            // Check karein ki response data null toh nahi hai
            if (res.data) {
                setStats({
                    hourly: res.data.hourly || [],
                    distribution: res.data.distribution || [],
                    totalToday: res.data.totalToday || 0,
                    weekly: res.data.weekly || [] // Ensure it's an array
                });
            }
        } catch (err) { 
            console.error("Stats fetch error", err); 
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); 
        return () => clearInterval(interval);
    }, []);

    // --- Configurations: Optional Chaining (?.) ka use kiya hai taaki map crash na ho ---
    
    const trafficData = {
        labels: (stats.hourly || []).map(h => `${h[0]}:00`),
        datasets: [{
            label: 'Tokens Generated',
            data: (stats.hourly || []).map(h => h[1]),
            backgroundColor: 'rgba(79, 70, 229, 0.7)',
            borderRadius: 8,
        }]
    };

    const weeklyChartData = {
        labels: (stats.weekly || []).map(w => w[0]), 
        datasets: [{
            label: 'Tokens per Day',
            data: (stats.weekly || []).map(w => w[1]), 
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 8,
        }]
    };

    const distData = {
        labels: (stats.distribution || []).map(d => d[0]),
        datasets: [{
            data: (stats.distribution || []).map(d => d[1]),
            backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
            hoverOffset: 10
        }]
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
            <h1 className="text-4xl font-black mb-8 border-b-4 border-indigo-500 inline-block">
                Manager Analytics
            </h1>
            
            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-indigo-500">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Tokens Today</p>
                    <h2 className="text-5xl font-black">{stats.totalToday}</h2>
                </div>
            </div>

            {/* --- 7-Day History Chart --- */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl mb-10 border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-700">📅 Weekly Traffic (Last 7 Days)</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase italic">Bank Trend Analysis</span>
                </div>
                <div className="h-80">
                    {/* Data check before rendering chart */}
                    {stats.weekly && stats.weekly.length > 0 ? (
                        <Bar 
                            data={weeklyChartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                scales: { y: { beginAtZero: true } }
                            }} 
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">
                            Waiting for weekly data...
                        </div>
                    )}
                </div>
            </div>

            {/* Hourly & Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 italic">Peak Traffic (Hourly)</h3>
                    <Bar data={trafficData} options={{ responsive: true, plugins: { legend: { display: false }}}} />
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 w-full text-left italic">Service Distribution</h3>
                    <div className="w-64">
                        <Doughnut data={distData} options={{ plugins: { legend: { position: 'bottom' }}}} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;