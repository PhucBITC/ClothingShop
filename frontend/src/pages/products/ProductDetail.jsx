import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BiHeart, BiCheck, BiChevronLeft, BiChevronRight, BiBox, BiDollarCircle, BiHeadphone, BiCreditCard } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import axios from '../../api/axios';
import { useToast } from '../../components/common/toast/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
    const { id } = useParams();
    const toast = useToast();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState('descriptions');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [zoomStyle, setZoomStyle] = useState({});
    const [thumbIndex, setThumbIndex] = useState(0);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;

        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2.5)' // Scale factor for zoom
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({
            transformOrigin: 'center center',
            transform: 'scale(1)'
        });
    };

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/products/${id}`);
                const data = response.data;
                setProduct(data);

                // Set initial images
                if (data.images && data.images.length > 0) {
                    const primary = data.images.find(img => img.primary) || data.images[0];
                    setActiveImage(primary.imageUrl);
                }

                // Set initial variants if available
                if (data.variants && data.variants.length > 0) {
                    setSelectedColor(data.variants[0].color);
                    setSelectedSize(data.variants[0].size);
                }

                // Fetch related products (same category)
                if (data.category?.id) {
                    const relatedRes = await axios.get('/products/search', {
                        params: { categoryId: data.category.id, status: 'ACTIVE', size: 4 }
                    });
                    setRelatedProducts(relatedRes.data.content.filter(p => p.id !== parseInt(id)));
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                toast.error("Error", "Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id, toast]);

    if (loading) return <div className={styles.loadingContainer}>Loading product details...</div>;
    if (!product) return <div className={styles.errorContainer}>Product not found.</div>;

    // Derived Data
    const availableColors = [...new Set(product.variants?.map(v => v.color))];
    const availableSizes = [...new Set(product.variants?.filter(v => v.color === selectedColor).map(v => v.size))];

    // Find current selected variant
    const currentVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
    const displayPrice = currentVariant?.price || product.basePrice;
    const salePrice = currentVariant?.salePrice;
    const stockCount = currentVariant?.stock || 0;

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setQuantity('');
            return;
        }

        const num = parseInt(val);
        if (isNaN(num) || num < 1) {
            return;
        }

        if (num > stockCount) {
            toast.warning("Stock Limit", `The requested quantity exceeds stock. Only ${stockCount} items available.`);
            setQuantity(stockCount);
            return;
        }

        setQuantity(num);
    };

    const handleBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        }
    };

    const handleAddToCart = () => {
        const finalQty = parseInt(quantity);
        if (isNaN(finalQty) || finalQty < 1) {
            toast.error("Invalid Quantity", "Please enter a valid quantity.");
            return;
        }

        if (!selectedColor || !selectedSize) {
            toast.error("Selection Required", "Please select color and size.");
            return;
        }

        if (finalQty > stockCount) {
            toast.error("Stock Error", `Requested quantity exceeds stock. Only ${stockCount} items left.`);
            setQuantity(stockCount);
            return;
        }

        if (stockCount <= 0) {
            toast.error("Out of Stock", "This variant is currently unavailable.");
            return;
        }

        addToCart(product, currentVariant, finalQty);
        toast.success("Added to Cart", `${product.name} (${selectedSize}, ${selectedColor}) added to your cart.`);
    };


    return (
        <div className={styles.detailContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <Link to="/">Home</Link> &gt; <Link to="/products">Shop</Link> &gt; <span>{product.name}</span>
            </div>

            <div className={styles.productWrapper}>
                {/* --- Gallery --- */}
                <div className={styles.gallerySection}>
                    <div
                        className={styles.mainImageWrapper}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img
                            src={activeImage}
                            alt={product.name}
                            className={styles.mainImage}
                            style={zoomStyle}
                        />
                    </div>
                    <div className={styles.thumbnailCarousel}>
                        {product.images?.length > 4 && (
                            <button
                                className={`${styles.thumbArrow} ${styles.prevArrow}`}
                                onClick={() => setThumbIndex(prev => Math.max(0, prev - 1))}
                                disabled={thumbIndex === 0}
                            >
                                <BiChevronLeft />
                            </button>
                        )}

                        <div className={styles.thumbnailGrid}>
                            {product.images?.slice(thumbIndex, thumbIndex + 4).map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.thumbnail} ${activeImage === img.imageUrl ? styles.active : ''}`}
                                    onClick={() => setActiveImage(img.imageUrl)}
                                >
                                    <img src={img.imageUrl} alt="thumb" className={styles.thumbImg} />
                                </div>
                            ))}
                        </div>

                        {product.images?.length > 4 && (
                            <button
                                className={`${styles.thumbArrow} ${styles.nextArrow}`}
                                onClick={() => setThumbIndex(prev => Math.min(product.images.length - 4, prev + 1))}
                                disabled={thumbIndex >= product.images.length - 4}
                            >
                                <BiChevronRight />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Info --- */}
                <div className={styles.productInfo}>
                    <div className={styles.headerRow}>
                        <h2 className={styles.categoryName}>{product.category?.name || 'Uncategorized'}</h2>
                        <div className={
                            stockCount <= 0 ? styles.outOfStockBadge : 
                            stockCount < 10 ? styles.lowStockBadge : 
                            styles.stockBadge
                        }>
                            {stockCount <= 0 ? 'Out of Stock' : 
                             stockCount < 10 ? `Only ${stockCount} left` : 
                             `${stockCount} in stock`}
                        </div>
                    </div>

                    <h1 className={styles.productTitle}>{product.name}</h1>

                    <div className={styles.ratingRow}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color={i < 4 ? "#ffac1c" : "#e0e0e0"} />
                            ))}
                        </div>
                        <span>4.0 (24 reviews)</span>
                    </div>

                    <div className={styles.priceRow}>
                        {salePrice ? (
                            <>
                                <span className={styles.currentPrice}>${salePrice.toFixed(2)}</span>
                                <span className={styles.originalPrice}>${displayPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className={styles.currentPrice}>${displayPrice.toFixed(2)}</span>
                        )}
                    </div>

                    <p className={styles.description}>
                        {product.description || 'No description available for this product.'}
                    </p>

                    {/* Color Selector */}
                    <div className={styles.selectorGroup}>
                        <div className={styles.selectorTitle}>Color: {selectedColor}</div>
                        <div className={styles.colorOptions}>
                            {availableColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.colorBtn} ${selectedColor === color ? styles.selected : ''}`}
                                    onClick={() => {
                                        setSelectedColor(color);
                                        // Reset size if current size not available in new color
                                        const sizesForColor = product.variants.filter(v => v.color === color).map(v => v.size);
                                        if (!sizesForColor.includes(selectedSize)) {
                                            setSelectedSize(sizesForColor[0]);
                                        }
                                    }}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className={styles.selectorGroup}>
                        <div className={styles.selectorTitle}>Size: {selectedSize}</div>
                        <div className={styles.sizeOptions}>
                            {availableSizes.map((size, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actionRow}>
                        <div className={styles.quantityControl}>
                            <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input 
                                type="text" 
                                className={styles.qtyInput} 
                                value={quantity} 
                                onChange={handleQuantityChange}
                                onBlur={handleBlur}
                            />
                            <button className={styles.qtyBtn} onClick={() => setQuantity(q => (q === '' ? 1 : Math.min(stockCount, q + 1)))}>+</button>
                        </div>

                        <button
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart}
                            disabled={stockCount <= 0}
                        >
                            {stockCount > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>

                        <button
                            className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.active : ''}`}
                            onClick={() => toggleWishlist(product)}
                        >
                            <BiHeart />
                        </button>
                    </div>

                    {/* Meta Info */}
                    <div className={styles.metaInfo}>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>SKU:</span>
                            <span className={styles.metaValue}>{currentVariant?.sku || 'N/A'}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Tags:</span>
                            <span className={styles.metaValue}>{product.tags || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Tabs --- */}
            <section className={styles.tabsSection}>
                <div className={styles.tabHeader}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'descriptions' ? styles.active : ''}`}
                        onClick={() => setActiveTab('descriptions')}
                    >
                        Descriptions
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'additional' ? styles.active : ''}`}
                        onClick={() => setActiveTab('additional')}
                    >
                        Additional Information
                    </button>
                </div>
                <div className={styles.tabContent}>
                    {activeTab === 'descriptions' && (
                        <div className={styles.tabDescription}>
                            <p>{product.description}</p>
                            <p style={{ marginTop: '1rem' }}>{product.metaDescription}</p>
                        </div>
                    )}

                    {activeTab === 'additional' && (
                        <div className={styles.additionalInfo}>
                            {product.weight && (
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabel}>Weight</div>
                                    <div className={styles.infoValue}>{product.weight} g</div>
                                </div>
                            )}
                            {(product.length || product.width || product.height) && (
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabel}>Dimensions</div>
                                    <div className={styles.infoValue}>
                                        {product.length || 0} x {product.width || 0} x {product.height || 0} cm
                                    </div>
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Variants</div>
                                <div className={styles.infoValue}>
                                    Available in {availableColors.length} colors and {availableSizes.length} sizes
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* --- Related Products --- */}
            {relatedProducts.length > 0 && (
                <section className={styles.relatedSection}>
                    <h2 className={styles.sectionTitle}>Related Products</h2>
                    <div className={styles.productGrid}>
                        {relatedProducts.map(item => (
                            <Link to={`/products/${item.id}`} key={item.id} className={styles.relatedCard}>
                                <div className={styles.relatedImgWrapper}>
                                    <img
                                        src={item.images?.find(img => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || '/placeholder.png'}
                                        alt={item.name}
                                        className={styles.relatedImg}
                                    />
                                </div>
                                <div className={styles.relatedInfo}>
                                    <h4 className={styles.relatedBrand}>{item.brand || 'Krist'}</h4>
                                    <p className={styles.relatedName}>{item.name}</p>
                                    <div className={styles.relatedPriceRow}>
                                        <span className={styles.relatedPrice}>${item.basePrice.toFixed(2)}</span>
                                        {/* Simplified: showing strike price if it were available in search response */}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* --- Services Section --- */}
            <section className={styles.servicesSection}>
                <div className={styles.serviceItem}>
                    <div className={styles.serviceIcon}><BiBox /></div>
                    <div className={styles.serviceText}>
                        <h4 className={styles.serviceTitle}>Free Shipping</h4>
                        <p className={styles.serviceDesc}>Free shipping for order above $150</p>
                    </div>
                </div>
                <div className={styles.serviceItem}>
                    <div className={styles.serviceIcon}><BiDollarCircle /></div>
                    <div className={styles.serviceText}>
                        <h4 className={styles.serviceTitle}>Money Guarantee</h4>
                        <p className={styles.serviceDesc}>Within 30 days for an exchange</p>
                    </div>
                </div>
                <div className={styles.serviceItem}>
                    <div className={styles.serviceIcon}><BiHeadphone /></div>
                    <div className={styles.serviceText}>
                        <h4 className={styles.serviceTitle}>Online Support</h4>
                        <p className={styles.serviceDesc}>24 hours a day, 7 days a week</p>
                    </div>
                </div>
                <div className={styles.serviceItem}>
                    <div className={styles.serviceIcon}><BiCreditCard /></div>
                    <div className={styles.serviceText}>
                        <h4 className={styles.serviceTitle}>Flexible Payment</h4>
                        <p className={styles.serviceDesc}>Pay with multiple credit cards</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetail;
