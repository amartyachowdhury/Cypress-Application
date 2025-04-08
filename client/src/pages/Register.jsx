import { useState } from 'react';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5050/api/auth/register', formData);
            setMessage(res.data.message || 'Registered successfully. Please verify your email.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4 text-center">Create an Account</h2>

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border border-gray-300 rounded"
                    required
                />

                <input
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border border-gray-300 rounded"
                    required
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Register
                </button>

                {message && <p className="mt-4 text-green-600 text-sm">{message}</p>}
                {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
}

export default Register;