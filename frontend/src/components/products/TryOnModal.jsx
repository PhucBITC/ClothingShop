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
                toast.error("File quá lớn", "Vui lòng chọn ảnh dưới 5MB.");
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
                toast.success("Thành công!", "AI đã xử lý xong bộ đồ của bạn.");
            } else {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Lỗi xử lý AI.";

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
        { name: 'Gói Miễn phí', price: '$0', features: ['5 lượt thử/ngày', 'Chất lượng tiêu chuẩn', 'Hỗ trợ cộng đồng'], recommended: false },
        { name: 'Gói Premium', price: '$19', features: ['Không giới hạn lượt thử', 'Xử lý ưu tiên (Hàng đợi riêng)', 'Ảnh 4K cực sắc nét', 'Tải ảnh không watermark'], recommended: true },
        { name: 'Gói Doanh nghiệp', price: '$99', features: ['API riêng cho Website', 'Thương hiệu riêng (White label)', 'Xử lý tốc độ cao < 10s', 'Hỗ trợ 24/7'], recommended: false }
    ];

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
                    <p>Khám phá phong cách của bạn với AI hàng đầu thế giới</p>
                </div>

                <div className={styles.content}>
                    {/* STEP: UPLOAD */}
                    {step === 'upload' && (
                        <div className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            <BiUpload className={styles.uploadIcon} />
                            <h3>Tải ảnh chân dung của bạn</h3>
                            <p>Định dạng JPG, PNG (Tối đa 5MB)</p>
                            <span className={styles.browseBtn}>Chọn ảnh ngay</span>
                        </div>
                    )}

                    {/* STEP: PREVIEW */}
                    {step === 'preview' && (
                        <div className={styles.previewContainer}>
                            <div className={styles.comparisonBody}>
                                <div className={styles.imageBox}>
                                    <label>Bạn nè</label>
                                    <img src={previewUrl} alt="User" />
                                </div>
                                <div className={styles.imageBox}>
                                    <label>Bộ đồ này</label>
                                    <img src={product.images?.[0]?.imageUrl} alt="Product" />
                                </div>
                            </div>

                            <div className={styles.modeSection}>
                                <button type="button" className={styles.realBtn} onClick={handleTryOn} disabled={loading}>
                                    <HiLightningBolt /> {loading ? 'Đang chuẩn bị dữ liệu...' : 'Bắt đầu ghép bằng AI thật'}
                                </button>
                            </div>
                            <button type="button" className={styles.changePhoto} onClick={reset}>Chọn ảnh khác</button>
                        </div>
                    )}

                    {/* STEP: PROCESSING */}
                    {step === 'processing' && (
                        <div className={styles.processingState}>
                            <div className={styles.magicLoader}>
                                <HiSparkles className={styles.wandIcon} />
                            </div>
                            <h3>AI đang thực hiện ghép đồ thực tế...</h3>
                            <p>Quá trình này thường mất khoảng 20-30 giây.</p>
                            <p>Vui lòng không đóng cửa sổ này.</p>
                        </div>
                    )}

                    {/* STEP: PREMIUM UPGRADE */}
                    {step === 'premium' && (
                        <div className={styles.premiumContainer}>
                            <div className={styles.upgradeHeader}>
                                <div className={styles.sparkleIcon}><HiLightningBolt /></div>
                                <h3>Hết lượt thử miễn phí!</h3>
                                <p>Bạn đã dùng hết 5 lượt thử hôm nay. Hãy nâng cấp để tiếp tục trải nghiệm không giới hạn.</p>
                            </div>

                            <div className={styles.pricingGrid}>
                                {pricingPlans.map((plan, idx) => (
                                    <div key={idx} className={`${styles.pricingCard} ${plan.recommended ? styles.recommended : ''}`}>
                                        {plan.recommended && <div className={styles.badge}>Phổ biến nhất</div>}
                                        <h4>{plan.name}</h4>
                                        <div className={styles.price}>{plan.price}<span>/tháng</span></div>
                                        <ul className={styles.featureList}>
                                            {plan.features.map((f, i) => (
                                                <li key={i}><BiCheckCircle /> {f}</li>
                                            ))}
                                        </ul>
                                        <button className={plan.recommended ? styles.subsBtnActive : styles.subsBtn}>
                                            {idx === 0 ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className={styles.backBtn} onClick={reset}>Quay lại sau</button>
                        </div>
                    )}

                    {/* STEP: RESULT */}
                    {step === 'result' && (
                        <div className={styles.resultContainer}>
                            <h3 className={styles.resultHeader}>KẾT QUẢ AI PRO</h3>
                            <div className={styles.resultImageWrapper}
                                onMouseDown={() => setShowOriginal(true)}
                                onMouseUp={() => setShowOriginal(false)}
                                onMouseLeave={() => setShowOriginal(false)}
                                onTouchStart={() => setShowOriginal(true)}
                                onTouchEnd={() => setShowOriginal(false)}
                            >
                                <img src={showOriginal ? previewUrl : resultUrl} alt="Result" className={styles.resultImage} />
                                <div className={styles.comparisonLabel}>
                                    {showOriginal ? 'ẢNH GỐC (Nhấn giữ)' : 'KẾT QUẢ PHỤC HỒI'}
                                </div>
                                <div className={styles.hintText}>Nhấn giữ vào ảnh để so sánh kết quả</div>
                            </div>
                            <div className={styles.resultActions}>
                                <button type="button" onClick={async () => {
                                    const response = await fetch(resultUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `shirt-result.png`;
                                    a.click();
                                }} className={styles.downloadBtn}>
                                    <BiDownload /> Tải ảnh về
                                </button>
                                <button type="button" className={styles.retryBtn} onClick={reset}>
                                    <BiRefresh /> Thử bộ khác
                                </button>
                            </div>
                            {remainingTries !== null && (
                                <div className={styles.remainingInfo}>
                                    <BiInfoCircle /> Bạn còn {remainingTries} lượt thử miễn phí hôm nay.
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
