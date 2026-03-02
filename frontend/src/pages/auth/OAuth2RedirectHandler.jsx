import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    useEffect(() => {
        // Helper to parse query params
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');
        const role = getUrlParameter('role');
        const error = getUrlParameter('error');

        if (token) {
            login(token, role);
            if (role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            navigate('/login', { state: { error: error } });
        }
    }, [location, navigate, login]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Redirecting...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
