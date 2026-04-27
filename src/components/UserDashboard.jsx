import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const UserDashboard = () => {
    const [phone, setPhone] = useState("");
    const [myToken, setMyToken] = useState(null);
    const [liveInfo, setLiveInfo] = useState({ token: "Waiting...", counter: "-", service: "-" });
    const [isNear, setIsNear] = useState(false);
    const [avgWait, setAvgWait] = useState(0); 
    const stompClientRef = useRef(null);
const [isPriority, setIsPriority] = useState(false);
    // --- TIME FORMATTING: Logic to handle "Your Turn" status ---
    const formatTime = (totalMinutes) => {
       const roundedMins = Math.round(totalMinutes);

    if (roundedMins <= 0 && liveInfo.token === myToken?.tokenNumber) {
        return "It's Your Turn! 🔔";
    }
    
    if (roundedMins <= 0) return "Waiting..."; 
    
    if (roundedMins < 60) return `${roundedMins} Mins`;
    
    const hours = Math.floor(roundedMins / 60);
    const mins = roundedMins % 60;
    return mins > 0 ? `${hours} Hr ${mins} Mins` : `${hours} Hour${hours > 1 ? 's' : ''}`;
    };

    // --- FETCH CATEGORY-SPECIFIC WAIT TIME ---
    useEffect(() => {
        const fetchWaitTime = async () => {
            if (!myToken || !myToken.serviceType) return;
            
            let avgPerPerson = 5; 

            try {
                const res = await axios.get(`http://localhost:8089/api/tokens/avg-wait/${myToken.serviceType}`, {
                    withCredentials: false
                });
                if(res.data) avgPerPerson = res.data;
            } catch (err) {
                console.log("Using local calculation (API 401)");
                avgPerPerson = (myToken.serviceType === "CASH") ? 5 : 8;
            }

            // --- REAL-TIME CALCULATION ---
            if (liveInfo.token && liveInfo.token !== "Waiting...") {
                const myNum = parseInt(myToken.tokenNumber.replace(/\D/g, ""), 10);
                const liveNum = parseInt(liveInfo.token.replace(/\D/g, ""), 10);
                
                if (liveInfo.service === myToken.serviceType) {
                    const peopleAhead = myNum - liveNum;
                    
                    if (peopleAhead > 0) {
                        setAvgWait(peopleAhead * avgPerPerson);
                        setIsNear(peopleAhead <= 3); // Alert if 3 or fewer people ahead
                    } else {
                        setAvgWait(0); 
                        setIsNear(true); // Keep alert visible when turn arrives
                    }
                }
            }
        };
        fetchWaitTime();
    }, [liveInfo, myToken]);

    const playBeep = () => {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain); gain.connect(context.destination);
        osc.start(); osc.stop(context.currentTime + 0.3);
    };
    

    // --- WEBSOCKET CONNECTION ---
    useEffect(() => {
        const socket = new SockJS('http://localhost:8089/ws-bank');
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;
        stompClient.debug = null; 

        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/token-updates', (message) => {
                const data = JSON.parse(message.body);
                setLiveInfo({ 
                    token: data.tokenNumber, 
                    counter: data.counterNumber, 
                    service: data.serviceType 
                });

                if (myToken && data.serviceType === myToken.serviceType) {
                    const myNum = parseInt(myToken.tokenNumber.replace(/\D/g, ""), 10);
                    const liveNum = parseInt(data.tokenNumber.replace(/\D/g, ""), 10);
                    const gap = myNum - liveNum;

                    if (gap <= 3 && gap >= 0) {
                        setIsNear(true);
                        playBeep();
                    }
                }
            });
        });

        return () => { 
            if (stompClientRef.current && stompClientRef.current.connected) {
                try { stompClientRef.current.disconnect(); } catch (e) { }
            }
        };
    }, [myToken]);

    const handleGetToken = async (serviceType) => {
        if (!phone || phone.length < 10) return alert("Sahi mobile number daalein");
        try {
            const res = await axios.post(`http://localhost:8089/api/tokens/generate`, null, {
                params: { phone: phone, type: serviceType }
            });
            setMyToken(res.data);
        } catch (err) { 
            alert("Error generating token!"); 
        }
    };
    

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 font-sans">
            <h2 className="text-3xl font-black text-center text-indigo-700 uppercase tracking-tighter italic mb-8 underline decoration-amber-400">SmartBank Queue</h2>
            
            {!myToken ? (
                <div className="space-y-6">
                    <input type="tel" placeholder="Mobile Number" className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 shadow-inner" onChange={e => setPhone(e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleGetToken("CASH")} className="bg-emerald-600 text-white p-5 rounded-3xl font-bold shadow-lg transform transition hover:scale-105">CASH Services <span className="block text-xl">💵</span></button>
                        <button onClick={() => handleGetToken("LOAN")} className="bg-amber-600 text-white p-5 rounded-3xl font-bold shadow-lg transform transition hover:scale-105">LOAN Services <span className="block text-xl">🏦</span></button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* --- DYNAMIC ALERT BOX --- */}
                    {isNear && (
                        <div className={`p-4 rounded-xl animate-pulse text-center font-bold border-l-4 ${
                            liveInfo.token === myToken.tokenNumber 
                            ? "bg-green-50 text-green-800 border-green-500" 
                            : "bg-red-50 text-red-800 border-red-500"
                        }`}>
                            {liveInfo.token === myToken.tokenNumber 
                                ? `Aapka turn hai! Counter ${liveInfo.counter} par jayein.` 
                                : "Taiyar rahein! Aapka number aane wala hai."}
                        </div>
                    )}
                    
                    <div className="p-8 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200 text-center relative overflow-hidden">
                        <span className="absolute top-0 right-0 p-2 bg-indigo-100 text-indigo-500 text-[10px] font-bold rounded-bl-xl uppercase">{myToken.serviceType}</span>
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-1">My Ticket</p>
                        <h1 className="text-7xl font-black text-indigo-900">{myToken.tokenNumber}</h1>
                    </div>

                    {/* --- WAIT TIME CARD --- */}
                    <div className={`p-5 rounded-3xl text-white flex justify-between items-center shadow-lg transform transition ${
                        avgWait === 0 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-600 to-blue-500"
                    }`}>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Current Status</p>
                            <h3 className="text-2xl font-black">{formatTime(avgWait)}</h3>
                        </div>
                        <div className="text-4xl animate-bounce">
                            {avgWait === 0 ? "✅" : "⏳"}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white grid grid-cols-2 gap-4 divide-x divide-slate-700 shadow-xl">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Serving</p>
                            <h4 className="text-3xl font-bold text-emerald-400">{liveInfo.token}</h4>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Counter</p>
                            <h4 className="text-3xl font-bold text-blue-400">{liveInfo.counter}</h4>
                        </div>
                    </div>
                </div>
            )}
            <br></br>
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-xl border border-amber-200">
    <input 
        type="checkbox" 
        id="priority" 
        checked={isPriority} 
        onChange={(e) => setIsPriority(e.target.checked)} 
        className="w-5 h-5 accent-amber-600"
    />
    <label htmlFor="priority" className="text-sm font-bold text-amber-900 uppercase">Senior Citizen / Priority 👨‍🦳</label>
</div>
        </div>
    );
};

export default UserDashboard;