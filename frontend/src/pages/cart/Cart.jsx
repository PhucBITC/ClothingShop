import React, { useState } from 'react';
import { BiTrash, BiCheck } from 'react-icons/bi';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/toast/ToastContext';
import ConfirmModal from '../../components/common/modal/ConfirmModal';
import styles from './Cart.module.css';

function Cart() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        removeMultipleFromCart,
        clearCart,
        calculateTotals
    } = useCart();
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: null });
    const toast = useToast();

    // Calculate totals based on selection
    const selectedCartItems = cartItems.filter(item =>
        selectedItems.includes(`${item.id}-${item.variantId}`)
    );
    const { subtotal, deliveryCharge, total } = calculateTotals(selectedCartItems);

    const handleQuantityChange = (id, variantId, delta) => {
        updateQuantity(id, variantId, delta);
    };

    const handleSelectItem = (id, variantId) => {
        const itemKey = `${id}-${variantId}`;
        setSelectedItems(prev =>
            prev.includes(itemKey)
                ? prev.filter(k => k !== itemKey)
                : [...prev, itemKey]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => `${item.id}-${item.variantId}`));
        } else {
            setSelectedItems([]);
        }
    };

    const handleConfirmAction = () => {
        const { type, data } = modalConfig;

        if (type === 'SINGLE') {
            removeFromCart(data.id, data.variantId);
            setSelectedItems(prev => prev.filter(k => k !== `${data.id}-${data.variantId}`));
            toast.success("Product removed from cart");
        } else if (type === 'MULTIPLE') {
            removeMultipleFromCart(data.items.map(i => ({ id: i.id, variantId: i.variantId })));
            setSelectedItems([]);
            toast.success(`${data.items.length} products removed`);
        } else if (type === 'CLEAR') {
            clearCart();
            setSelectedItems([]);
            toast.success("All products removed from cart");
        }

        setModalConfig({ isOpen: false, type: '', data: null });
    };

    const handleClearCart = () => {
        if (cartItems.length === 0) return;
        setModalConfig({ isOpen: true, type: 'CLEAR', data: null });
    };

    const handleRemoveSelected = () => {
        const toRemove = cartItems.filter(item => selectedItems.includes(`${item.id}-${item.variantId}`));
        if (toRemove.length === 0) return;
        setModalConfig({ isOpen: true, type: 'MULTIPLE', data: { items: toRemove } });
    };

    const handleSingleRemove = (id, variantId, name) => {
        setModalConfig({ isOpen: true, type: 'SINGLE', data: { id, variantId, name } });
    };

    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    return (
        <div className={styles.cartContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                Home &gt; <span>Cart</span>
            </div>

            <h1 className={styles.pageTitle}>Cart</h1>
            {/* Note: The image says "Checkout" so I used that as the title, though functionally this is the Cart view */}

            <div className={styles.contentWrapper}>

                {/* --- Cart Table --- */}
                <div className={styles.cartTableSection}>
                    <div className={styles.tableHeader}>
                        <div className={styles.leftActions}>
                            <div className={styles.selectAllWrapper}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    id="selectAll"
                                />
                                <label htmlFor="selectAll" className={styles.selectionInfo}>
                                    {selectedItems.length > 0 ? `${selectedItems.length} selected` : `Select All (${cartItems.length})`}
                                </label>
                            </div>
                            {selectedItems.length > 0 && (
                                <button className={styles.removeSelectedBtn} onClick={handleRemoveSelected}>
                                    Remove Selected
                                </button>
                            )}
                        </div>
                        <button className={styles.clearAllBtn} onClick={handleClearCart}>
                            Clear All
                        </button>
                    </div>

                    <table className={styles.cartTable}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}></th>
                                <th style={{ width: '40%' }}>Products</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={`${item.id}-${item.variantId}`} className={selectedItems.includes(`${item.id}-${item.variantId}`) ? styles.selectedRow : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(`${item.id}-${item.variantId}`)}
                                            onChange={() => handleSelectItem(item.id, item.variantId)}
                                            className={styles.itemCheckbox}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.imgWrapper}>
                                                <img src={item.image} alt={item.name} className={styles.productImg} />
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => handleSingleRemove(item.id, item.variantId, item.name)}
                                                    title="Remove Item"
                                                >
                                                    <BiTrash />
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
                    {/* Free Shipping Progress (Modern Placement) */}
                    {cartItems.length > 0 && (
                        <div className={`${styles.shippingProgress} ${deliveryCharge === 0 ? styles.unlocked : ''}`}>
                            <div className={styles.progressHeader}>
                                <span className={styles.progressTitle}>Free Shipping</span>
                                <span className={styles.progressValue}>
                                    {Math.min(100, Math.round(Math.max(
                                        (selectedCartItems.reduce((acc, i) => acc + i.quantity, 0) / 3) * 100,
                                        (subtotal / 30) * 100
                                    )))}%
                                </span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${Math.min(100, Math.max(
                                            (selectedCartItems.reduce((acc, i) => acc + i.quantity, 0) / 3) * 100,
                                            (subtotal / 30) * 100
                                        ))}%`
                                    }}
                                ></div>
                            </div>
                            <div className={styles.progressStatus}>
                                {deliveryCharge === 0 ? (
                                    <span>Unlocked! You get <strong>FREE Shipping</strong>! 🎉</span>
                                ) : (
                                    <span>
                                        Add <strong>{Math.max(0, 3 - selectedCartItems.reduce((acc, i) => acc + i.quantity, 0))}</strong> more or spend <strong>${Math.max(0, 30 - subtotal).toFixed(2)}</strong> for Free Ship.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span className={styles.summaryValue}>
                            {deliveryCharge === 0 ? <span style={{ color: '#52c41a' }}>FREE</span> : `$${deliveryCharge.toFixed(2)}`}
                        </span>
                    </div>

                    <div className={styles.discountWrapper}>
                        <h5>Apply Promo Code</h5>
                        <div className={styles.discountGroup}>
                            <input type="text" placeholder="Enter Discount Code" className={styles.discountInput} />
                            <button className={styles.applyBtn}>Apply</button>
                        </div>
                    </div>

                    <div className={styles.grandTotalRow} style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <span className={styles.summaryLabel}>Grand Total</span>
                        <span className={styles.summaryValue}>${total.toFixed(2)}</span>
                    </div>

                    <button
                        className={styles.checkoutBtn}
                        style={selectedItems.length === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        disabled={selectedItems.length === 0}
                    >
                        {selectedItems.length === 0 ? 'Select items to checkout' : 'Proceed to Checkout'}
                    </button>
                </aside>

            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={modalConfig.type === 'CLEAR' ? 'Clear Cart' : modalConfig.type === 'MULTIPLE' ? 'Delete Items' : 'Confirm Delete'}
                message={
                    modalConfig.type === 'SINGLE'
                        ? 'Are you sure you want to delete'
                        : modalConfig.type === 'MULTIPLE'
                            ? `Are you sure you want to delete ${modalConfig.data?.items.length} selected items`
                            : 'Are you sure you want to clear your entire cart'
                }
                itemName={modalConfig.type === 'SINGLE' ? modalConfig.data?.name : ''}
            />
        </div>
    );
}

export default Cart;
