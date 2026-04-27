import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const res = await axios.post('http://localhost:8089/api/auth/login', formData);
            
            if (res.status === 200) {
                // Backend se user details save karna
                localStorage.setItem('username', formData.username);
                localStorage.setItem('userPassword', formData.password); 
                localStorage.setItem('role', res.data.role);

                alert(`Welcome ${formData.username}! Login Successful. 🎉`);

                // Role-based navigation logic
                const userRole = res.data.role;
                if (userRole === 'ROLE_STAFF' || userRole === 'STAFF') {
                    navigate('/admin');
                } else if (userRole === 'ROLE_MANAGER' || userRole === 'MANAGER') {
                    navigate('/manager');
                } else {
                    navigate('/'); // Default dashboard for others
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Invalid credentials. Please check your username/password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans p-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-t-[12px] border-indigo-600 relative">
                
                {/* Visual Role Indicator */}
                <div className="flex justify-center space-x-4 mb-8">
                    <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
                        <div className="bg-slate-100 p-3 rounded-full mb-1">👨‍💻</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Staff</span>
                    </div>
                    <div className="h-10 w-[2px] bg-slate-100 self-center"></div>
                    <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
                        <div className="bg-slate-100 p-3 rounded-full mb-1">📊</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manager</span>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Central Portal</h2>
                    <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Staff & Manager Access</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold text-center border border-rose-100">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Username</label>
                        <input 
                            type="text" name="username" placeholder="Staff/Manager ID"
                            className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                            onChange={handleChange} required 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Password</label>
                        <input 
                            type="password" name="password" placeholder="••••••••"
                            className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                            onChange={handleChange} required 
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-xs mt-6">
                        Secure Login
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">New Member?</p>
                    <Link to="/signup" className="text-indigo-600 font-black hover:text-indigo-800 transition-colors">
                        CREATE AN ACCOUNT →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;