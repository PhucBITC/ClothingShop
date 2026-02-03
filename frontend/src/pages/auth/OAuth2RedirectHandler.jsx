import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Helper to parse query params
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');
        const error = getUrlParameter('error');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/');
        } else {
            navigate('/login', { state: { error: error } });
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Redirecting...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
