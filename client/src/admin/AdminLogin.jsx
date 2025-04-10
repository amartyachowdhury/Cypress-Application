import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5050/api/admin/login", {
                email,
                password,
            });

            localStorage.setItem("adminToken", res.data.token); // ✅ Store admin token
            alert("Admin login successful!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Admin login error:", err);
            alert("Admin login failed. Please check credentials.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleAdminLogin}
                className="bg-white p-6 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
                <input
                    type="email"
                    placeholder="Admin Email"
                    className="input input-bordered w-full mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="input input-bordered w-full mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary w-full">
                    Login
                </button>
            </form>
        </div>
    );
}

export default AdminLogin;