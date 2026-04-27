import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF' });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            // Role ko "ROLE_" prefix ke saath bhejna Spring Security ke liye best hai
            const finalData = { 
                ...formData, 
                role: `ROLE_${formData.role.toUpperCase()}` 
            };
            
            await axios.post('http://localhost:8089/api/auth/signup', finalData);
            alert("Registration Successful! Ab Login karein.");
            navigate('/login');
        } catch (err) {
            alert("Signup Fail ho gaya! Check karein agar username pehle se exist karta hai.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black text-center text-indigo-700 mb-2 uppercase italic">Join SmartBank</h2>
                <p className="text-center text-slate-400 mb-8 text-sm">Create an internal staff/manager account</p>
                
                <form onSubmit={handleSignup} className="space-y-5">
                    <input 
                        type="text" placeholder="Choose Username" required
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    />
                    <input 
                        type="password" placeholder="Set Password" required
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <select 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="STAFF">Staff (Counter Operations)</option>
                        <option value="MANAGER">Manager (Admin & Stats)</option>
                    </select>

                    <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition transform active:scale-95">
                        CREATE ACCOUNT
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-500">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;