import { useCart } from '../../context/CartContext';
import styles from './Cart.module.css';

function Cart() {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const deliveryCharge = 5.00;

    const handleQuantityChange = (id, variantId, delta) => {
        updateQuantity(id, variantId, delta);
    };

    const grandTotal = subtotal + deliveryCharge;

    return (
        <div className={styles.cartContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                Home &gt; <span>Cart</span>
            </div>

            <h1 className={styles.pageTitle}>Checkout</h1>
            {/* Note: The image says "Checkout" so I used that as the title, though functionally this is the Cart view */}

            <div className={styles.contentWrapper}>

                {/* --- Cart Table --- */}
                <div className={styles.cartTableSection}>
                    <table className={styles.cartTable}>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Products</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={`${item.id}-${item.variantId}`}>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.imgWrapper}>
                                                <img src={item.image} alt={item.name} className={styles.productImg} />
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeFromCart(item.id, item.variantId)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className={styles.productMeta}>
                                                <h4>{item.name}</h4>
                                                <p>Size: {item.size}</p>
                                                <p>Color: {item.color}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.priceCell}>${item.price.toFixed(2)}</td>
                                    <td>
                                        <div className={styles.quantityControl}>
                                            <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.id, item.variantId, -1)}>−</button>
                                            <div className={styles.qtyValue}>{item.quantity}</div>
                                            <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.id, item.variantId, 1)}>+</button>
                                        </div>
                                    </td>
                                    <td className={styles.subtotalCell}>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Order Summary --- */}
                <aside className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.discountGroup}>
                        <input type="text" placeholder="Enter Discount Code" className={styles.discountInput} />
                        <button className={styles.applyBtn}>Apply</button>
                    </div>

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span className={styles.summaryValue}>${deliveryCharge.toFixed(2)}</span>
                    </div>

                    <div className={styles.grandTotalRow}>
                        <span className={styles.summaryLabel}>Grand Total</span>
                        <span className={styles.summaryValue}>${grandTotal.toFixed(2)}</span>
                    </div>

                    <button className={styles.checkoutBtn}>Proceed to Checkout</button>
                </aside>

            </div>
        </div>
    );
}

export default Cart;
