import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BiHeart, BiSearch, BiShoppingBag, BiCheck } from 'react-icons/bi';
import { FaStar, FaRegStar } from 'react-icons/fa';
import styles from './ProductDetail.module.css';
import { products, colors, sizes, services, reviews } from '../../data/mockData';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState('descriptions');

    // Load product data (Mock logic)
    useEffect(() => {
        // Find product by ID or default to first product
        const foundProduct = products.find(p => p.id === parseInt(id)) || products[0];
        setProduct(foundProduct);
        setActiveImage(foundProduct.image);
        // Determine default color/size from product data or valid options
        if (foundProduct.color) setSelectedColor(foundProduct.color);
        if (foundProduct.size) setSelectedSize(foundProduct.size);
    }, [id]);

    if (!product) return <div>Loading...</div>;

    // Use the detailed "images" array if available, otherwise fallback to single image
    const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image];

    // Mock colors/sizes for the selector (in reality, each product would have its own available options)
    const availableColors = colors.slice(0, 5);
    const availableSizes = sizes.map(s => s.name);

    return (
        <div className={styles.detailContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                Home &gt; Shop &gt; <span>{product.name}</span>
            </div>

            <div className={styles.productWrapper}>
                {/* --- Gallery --- */}
                <div className={styles.gallerySection}>
                    <div className={styles.mainImageWrapper}>
                        <img src={activeImage} alt={product.name} className={styles.mainImage} />
                    </div>
                    <div className={styles.thumbnailGrid}>
                        {galleryImages.map((img, idx) => (
                            <div
                                key={idx}
                                className={`${styles.thumbnail} ${activeImage === img ? styles.active : ''}`}
                                onClick={() => setActiveImage(img)}
                            >
                                <img src={img} alt="thumb" className={styles.thumbImg} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Info --- */}
                <div className={styles.productInfo}>
                    <div className={styles.headerRow}>
                        <h2 className={styles.brand}>{product.brand}</h2>
                        <div className={styles.stockBadge}>In Stock</div>
                    </div>

                    <h1 className={styles.productTitle}>{product.name}</h1>

                    <div className={styles.ratingRow}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color={i < Math.floor(product.rating || 5) ? "#ffac1c" : "#e0e0e0"} />
                            ))}
                        </div>
                        <span>{product.rating} ({product.reviews || 0} reviews)</span>
                    </div>

                    <div className={styles.priceRow}>
                        <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                        <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                    </div>

                    <p className={styles.description}>
                        {product.description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
                    </p>

                    {/* Selectors */}
                    <div className={styles.selectorGroup}>
                        <div className={styles.selectorTitle}>Color</div>
                        <div className={styles.colorOptions}>
                            {availableColors.map((col, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.colorCircle} ${selectedColor === col.name ? styles.selected : ''}`}
                                    style={{ backgroundColor: col.hex }}
                                    onClick={() => setSelectedColor(col.name)}
                                    title={col.name}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.selectorGroup}>
                        <div className={styles.selectorTitle}>Size</div>
                        <div className={styles.sizeOptions}>
                            {availableSizes.slice(0, 4).map((size, idx) => ( // Show S M L XL
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
                            <div className={styles.qtyValue}>{quantity}</div>
                            <button className={styles.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>

                        <button className={styles.addToCartBtn}>Add to Cart</button>

                        <button className={styles.wishlistBtn}>
                            <BiHeart />
                        </button>
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
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews
                    </button>
                </div>
                <div className={styles.tabContent}>

                    {activeTab === 'descriptions' && (
                        <p>{product.description} It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
                    )}

                    {activeTab === 'additional' && (
                        <div className={styles.additionalInfo}>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Color</div>
                                <div className={styles.infoValue}>
                                    {availableColors.map(c => c.name).join(', ')}
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Size</div>
                                <div className={styles.infoValue}>
                                    {availableSizes.join(', ')}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsContainer}>
                            {/* Customer Reviews List */}
                            <div className={styles.customerReviews}>
                                <h3>Customer Reviews</h3>
                                {reviews.map(review => (
                                    <div key={review.id} className={styles.reviewItem}>
                                        <div className={styles.reviewAvatar}>
                                            <img src={review.image} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div className={styles.reviewContent}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewName}>{review.name}</div>
                                                <div className={styles.stars}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} color={i < review.rating ? "#ffac1c" : "#e0e0e0"} size={14} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={styles.reviewTitle}>{review.title}</div>
                                            <p style={{ color: '#666', fontSize: '0.95rem' }}>{review.comment}</p>
                                            <div className={styles.reviewMeta}>Review by {review.name} Posted on {review.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Review Form */}
                            <div className={styles.addReviewForm}>
                                <h3>Add your Review</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div className={styles.formLabel}>Your Rating</div>
                                    <div className={styles.stars} style={{ cursor: 'pointer' }}>
                                        <FaRegStar size={20} color="#888" /> <FaRegStar size={20} color="#888" /> <FaRegStar size={20} color="#888" /> <FaRegStar size={20} color="#888" /> <FaRegStar size={20} color="#888" />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Name *</label>
                                    <input type="text" className={styles.formInput} placeholder="Enter Your Name" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email Address *</label>
                                    <input type="email" className={styles.formInput} placeholder="Enter Your Email" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Your Review *</label>
                                    <textarea className={styles.formTextarea} rows="5" placeholder="Enter Your Review"></textarea>
                                </div>
                                <button className={styles.submitBtn}>Submit</button>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* --- Related Products --- */}
            <section className={styles.relatedSection}>
                <h2 className={styles.sectionTitle}>Related Products</h2>
                <div className={styles.productGrid}>
                    {products.slice(1, 5).map(item => (
                        <Link to={`/products/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div key={item.id} style={{ background: '#fff', cursor: 'pointer' }}>
                                <div className={styles.mainImageWrapper} style={{ height: '300px', marginBottom: '1rem' }}>
                                    <img src={item.image} alt={item.name} className={styles.mainImage} />
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{item.brand}</h4>
                                    <p style={{ color: '#555', fontSize: '0.9rem' }}>{item.name}</p>
                                    <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>${item.price.toFixed(2)}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- Services --- */}
            <section className={styles.featuresSection}>
                {services.map(service => (
                    <div key={service.id} className={styles.featureItem}>
                        <service.icon className={styles.featureIcon} />
                        <div>
                            <h4 className={styles.featureTitle}>{service.title}</h4>
                            <p className={styles.featureDesc}>{service.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

        </div>
    );
}

export default ProductDetail;
