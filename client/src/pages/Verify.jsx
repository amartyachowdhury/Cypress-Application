import { useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

function Verify() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post(
                'http://localhost:5050/api/auth/verify',
                { code },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            setMessage(res.data.message || 'Account verified successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4 text-center">Verify Your Email</h2>

                <input
                    name="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Verify
                </button>

                {message && <p className="mt-4 text-green-600 text-sm">{message}</p>}
                {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
}

export default Verify;