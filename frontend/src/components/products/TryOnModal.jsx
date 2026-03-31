import React, { useState, useRef, useEffect } from 'react';
import { BiX, BiUpload, BiDownload, BiRefresh, BiCheckCircle, BiInfoCircle } from 'react-icons/bi';
import { HiLightningBolt, HiSparkles } from 'react-icons/hi';
import axios from '../../api/axios';
import { useToast } from '../common/toast/ToastContext';
import styles from './TryOnModal.module.css';

const TryOnModal = ({ isOpen, onClose, product }) => {
    const [step, setStep] = useState('upload'); // upload, preview, processing, result
    const [userImage, setUserImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remainingTries, setRemainingTries] = useState(null);
    const [showOriginal, setShowOriginal] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File too large", "Please select an image under 5MB.");
                return;
            }
            setUserImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStep('preview');
        }
    };

    const handleTryOn = async () => {
        setStep('processing');
        setLoading(true);

        const formData = new FormData();
        formData.append('productId', product.id);
        formData.append('mode', 'REAL'); // Luôn dùng REAL
        if (userImage) {
            formData.append('userImage', userImage);
        }

        try {
            const response = await axios.post('/ai/try-on', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.imageUrl) {
                setResultUrl(response.data.imageUrl);
                setRemainingTries(response.data.remainingTries);
                setStep('result');
                toast.success("Success!", "AI has finished processing your outfit.");
            } else {
                throw new Error("Invalid response data.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "AI processing error.";

            if (errorMsg.includes("LIMIT_REACHED")) {
                setStep('premium');
                return;
            }

            toast.error("Lỗi", errorMsg);
            setStep('preview');
        } finally {
            setLoading(false);
        }
    }

    const pricingPlans = [
        { id: 'FREE', name: 'Free Plan', price: '$0', credits: 10, features: ['10 tries/month', 'Standard Quality', 'Community Support'], recommended: false },
        { id: 'STANDARD', name: 'Standard Plan', price: '$16', credits: 200, features: ['200 tries/month', 'Priority Processing', 'High Quality Result', 'No Watermark'], recommended: true },
        { id: 'PRO', name: 'Pro Plan', price: '$29', credits: 1000, features: ['1000 tries/month', 'Fastest Speed < 10s', 'Best AI Quality', 'Priority Support'], recommended: false }
    ];

    const handleRecharge = async (plan) => {
        if (plan.id === 'FREE') return;
        
        setLoading(true);
        try {
            // Default to PayPal for now as it's more international
            const response = await axios.post('/recharge/create', {
                tier: plan.id,
                paymentMethod: 'PAYPAL'
            });
            
            if (response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            }
        } catch (err) {
            toast.error("Payment Error", "Could not initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('upload');
        setUserImage(null);
        setPreviewUrl(null);
        setResultUrl(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button type="button" className={styles.closeBtn} onClick={onClose}><BiX /></button>

                <div className={styles.header}>
                    <div className={styles.iconCircle}><HiSparkles /></div>
                    <h2>AI Virtual Try-On Super Pro</h2>
                    <p>Discover your style with world-class AI</p>
                </div>

                <div className={styles.content}>
                    {/* STEP: UPLOAD */}
                    {step === 'upload' && (
                        <div className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            <BiUpload className={styles.uploadIcon} />
                            <h3>Upload your portrait photo</h3>
                            <p>JPG, PNG format (Max 5MB)</p>
                            <span className={styles.browseBtn}>Choose photo now</span>
                        </div>
                    )}

                    {/* STEP: PREVIEW */}
                    {step === 'preview' && (
                        <div className={styles.previewContainer}>
                            <div className={styles.comparisonBody}>
                                <div className={styles.imageBox}>
                                    <label>You</label>
                                    <img src={previewUrl} alt="User" />
                                </div>
                                <div className={styles.imageBox}>
                                    <label>This outfit</label>
                                    <img src={product.images?.[0]?.imageUrl} alt="Product" />
                                </div>
                            </div>

                            <div className={styles.modeSection}>
                                <button type="button" className={styles.realBtn} onClick={handleTryOn} disabled={loading}>
                                    <HiLightningBolt /> {loading ? 'Preparing data...' : 'Start AI Try-On'}
                                </button>
                            </div>
                            <button type="button" className={styles.changePhoto} onClick={reset}>Choose another photo</button>
                        </div>
                    )}

                    {/* STEP: PROCESSING */}
                    {step === 'processing' && (
                        <div className={styles.processingState}>
                            <div className={styles.magicLoader}>
                                <HiSparkles className={styles.wandIcon} />
                            </div>
                            <h3>AI is performing realistic try-on...</h3>
                            <p>This process usually takes 20-30 seconds.</p>
                            <p>Please do not close this window.</p>
                        </div>
                    )}

                    {/* STEP: PREMIUM UPGRADE */}
                    {step === 'premium' && (
                        <div className={styles.premiumContainer}>
                            <div className={styles.upgradeHeader}>
                                <div className={styles.sparkleIcon}><HiLightningBolt /></div>
                                <h3>No tries remaining!</h3>
                                <p>You have used all your free tries for today. Upgrade your plan to continue exploring.</p>
                            </div>

                            <div className={styles.pricingGrid}>
                                {pricingPlans.map((plan, idx) => (
                                    <div key={idx} className={`${styles.pricingCard} ${plan.recommended ? styles.recommended : ''}`}>
                                        {plan.recommended && <div className={styles.badge}>Most Popular</div>}
                                        <h4>{plan.name}</h4>
                                        <div className={styles.price}>{plan.price}<span>/month</span></div>
                                        <ul className={styles.featureList}>
                                            {plan.features.map((f, i) => (
                                                <li key={i}><BiCheckCircle /> {f}</li>
                                            ))}
                                        </ul>
                                        <button 
                                            className={plan.recommended ? styles.subsBtnActive : styles.subsBtn}
                                            onClick={() => handleRecharge(plan)}
                                            disabled={loading}
                                        >
                                            {idx === 0 ? 'Current Plan' : (loading ? 'Redirecting...' : 'Upgrade Now')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className={styles.backBtn} onClick={reset}>Go back</button>
                        </div>
                    )}

                    {/* STEP: RESULT */}
                    {step === 'result' && (
                        <div className={styles.resultContainer}>
                            <h3 className={styles.resultHeader}>AI PRO RESULT</h3>
                            <div className={styles.resultImageWrapper}
                                onMouseDown={() => setShowOriginal(true)}
                                onMouseUp={() => setShowOriginal(false)}
                                onMouseLeave={() => setShowOriginal(false)}
                                onTouchStart={() => setShowOriginal(true)}
                                onTouchEnd={() => setShowOriginal(false)}
                            >
                                <img src={showOriginal ? previewUrl : resultUrl} alt="Result" className={styles.resultImage} />
                                <div className={styles.comparisonLabel}>
                                    {showOriginal ? 'ORIGINAL (Hold)' : 'AI GENERATED'}
                                </div>
                                <div className={styles.hintText}>Press and hold the image to compare results</div>
                            </div>
                            <div className={styles.resultActions}>
                                <button type="button" onClick={async () => {
                                    const response = await fetch(resultUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `tryon-result.png`;
                                    a.click();
                                }} className={styles.downloadBtn}>
                                    <BiDownload /> Download
                                </button>
                                <button type="button" className={styles.retryBtn} onClick={reset}>
                                    <BiRefresh /> Try another outfit
                                </button>
                            </div>
                            {remainingTries !== null && (
                                <div className={styles.remainingInfo}>
                                    <BiInfoCircle /> You have {remainingTries} tries remaining today.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryOnModal;
