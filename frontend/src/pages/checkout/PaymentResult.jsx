import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BiCheckCircle, BiXCircle, BiLoaderAlt } from 'react-icons/bi';
import { useCart } from '../../context/CartContext';
import styles from './PaymentResult.module.css';

function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('loading'); // loading, success, fail
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const method = searchParams.get('method');
        const responseCode = searchParams.get('vnp_ResponseCode');
        const token = searchParams.get('token'); // PayPal token
        const cancel = searchParams.get('status') === 'cancel';

        if (cancel) {
            setStatus('fail');
            setMessage('Payment was cancelled.');
            return;
        }

        if (responseCode === '00' || token) {
            setStatus('success');
            setMessage('Your payment has been successfully processed!');
            clearCart();
        } else if (responseCode) {
            setStatus('fail');
            setMessage('Payment failed. Please try again.');
        } else {
            // Fallback or generic success from COD
            setStatus('success');
        }
    }, [searchParams, clearCart]);

    return (
        <div className={styles.container}>
            <div className={styles.resultCard}>
                {status === 'loading' && <BiLoaderAlt className={styles.loadingIcon} />}
                {status === 'success' && <BiCheckCircle className={styles.successIcon} />}
                {status === 'fail' && <BiXCircle className={styles.errorIcon} />}

                <h2 className={styles.title}>
                    {status === 'success' ? 'Payment Successful!' : status === 'fail' ? 'Payment Failed' : 'Processing...'}
                </h2>
                <p className={styles.message}>{message}</p>

                <div className={styles.buttonGroup}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/user/orders')}>View Orders</button>
                    <button className={styles.secondaryBtn} onClick={() => navigate('/')}>Back to Shop</button>
                </div>
            </div>
        </div>
    );
}

export default PaymentResult;
