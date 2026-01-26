import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [user, setUser] = useState({ email: '', password: '', fullName: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', user);
            alert('Đăng ký thành công!');
            navigate('/login');
        } catch (error) {
            alert('Đăng ký thất bại: ' + error.response?.data);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Đăng Ký</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Họ tên" onChange={e => setUser({...user, fullName: e.target.value})} required /><br/>
                <input type="email" placeholder="Email" onChange={e => setUser({...user, email: e.target.value})} required /><br/>
                <input type="password" placeholder="Mật khẩu" onChange={e => setUser({...user, password: e.target.value})} required /><br/>
                <button type="submit">Đăng ký</button>
            </form>
        </div>
    );
};

export default Register;