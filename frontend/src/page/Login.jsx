import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', credentials);
            const token = response.data.token;
            localStorage.setItem('token', token); // Lưu token vào trình duyệt
            alert('Đăng nhập thành công!');
            navigate('/'); // Chuyển về trang chủ
        } catch (error) {
            alert('Sai email hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={e => setCredentials({...credentials, email: e.target.value})} required /><br/>
                <input type="password" placeholder="Mật khẩu" onChange={e => setCredentials({...credentials, password: e.target.value})} required /><br/>
                <button type="submit">Đăng nhập</button>
            </form>
        </div>
    );
};

export default Login;