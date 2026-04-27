import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const counterConfig = [
        { id: 1, service: "CASH", color: "border-emerald-600" },
        { id: 2, service: "CASH", color: "border-emerald-600" },
        { id: 3, service: "LOAN", color: "border-amber-600" }
    ];

    const [loadingMap, setLoadingMap] = useState({});

    const handleNext = async (id, service) => {
        const username = localStorage.getItem('username');
        // LOGIN PAGE PAR: localStorage.setItem('userPassword', password) hona chahiye
        const password = localStorage.getItem('userPassword'); 

        if (!username || !password) {
            alert("Credentials missing! Please Login again.");
            return;
        }

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        
        try {
            // Standard Basic Auth Header
            const authHeader = `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`;

            const res = await axios.post(
                `http://localhost:8089/api/tokens/call-next/${id}?service=${service}`,
                {}, 
                {
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.status === 204 || !res.data) {
                alert(`${service} queue khali hai!`);
            } else {
                alert(`SUCCESS: Token ${res.data.tokenNumber} called at Counter ${id}`);
            }
        } catch (err) {
            console.error("API Error:", err.response);
            if (err.response?.status === 401) {
                alert("401 Unauthorized: Username/Password galat hai.");
            } else if (err.response?.status === 403) {
                alert("403 Forbidden: Aapke paas STAFF role nahi hai.");
            } else {
                alert("Server Error! Check if Backend is running on 8089.");
            }
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">
                        Bank Staff Control Panel
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {counterConfig.map(c => (
                        <div key={c.id} className={`bg-white p-10 rounded-3xl shadow-xl border-b-8 ${c.color} text-center transition-all hover:shadow-2xl`}>
                            <h2 className="text-2xl font-bold text-slate-800 mb-8">Counter {c.id}</h2>
                            <button 
                                onClick={() => handleNext(c.id, c.service)}
                                disabled={loadingMap[c.id]}
                                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loadingMap[c.id] ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                            >
                                {loadingMap[c.id] ? 'Calling...' : `CALL NEXT ${c.service}`}
                            </button>
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;