import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { BiPlus, BiPencil, BiTrash, BiError } from 'react-icons/bi';
import styles from './ProductList.module.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/products');
            console.log("Product Data:", response.data);
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                console.error("API did not return an array:", response.data);
                setProducts([]);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                alert("Failed to delete product");
            }
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', class: styles.outOfStock };
        if (stock < 10) return { label: 'Low Stock', class: styles.lowStock };
        return { label: 'In Stock', class: styles.inStock };
    };

    if (loading) return <div className={styles.loading}>Loading products...</div>;
    if (error) return <div className={styles.error}><BiError /> {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Products</h2>
                <button className={styles.addButton} onClick={() => navigate('/admin/products/add')}>
                    <BiPlus size={20} />
                    Add Product
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                return (
                                    <tr key={product.id}>
                                        <td className={styles.productInfo}>
                                            <img
                                                src={product.image || product.imageUrl || 'https://via.placeholder.com/48'}
                                                alt={product.name}
                                                className={styles.productImage}
                                            />
                                            <span className={styles.productName}>{product.name}</span>
                                        </td>
                                        <td>{product.category?.name || 'N/A'}</td>
                                        <td className={styles.price}>${product.price ? product.price.toLocaleString() : '0'}</td>
                                        <td>
                                            <span className={`${styles.stockBadge} ${stockStatus.class}`}>
                                                {product.stock} - {stockStatus.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.editBtn}`}
                                                    title="Edit"
                                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                >
                                                    <BiPencil size={18} />
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.deleteBtn}`}
                                                    title="Delete"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <BiTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    No products found. Start by adding one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
