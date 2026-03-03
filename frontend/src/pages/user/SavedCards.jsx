import React, { useState } from 'react';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { FaCcMastercard, FaCcVisa, FaCreditCard } from 'react-icons/fa';
import UserSidebar from './UserSidebar';
import styles from './SavedCards.module.css';

function SavedCards() {
    const [cards, setCards] = useState([
        {
            id: 1,
            type: 'Master Card',
            number: '3456 XX78 9800 55X3',
            icon: <FaCcMastercard size={32} color="#eb001b" />,
            brand: 'mastercard'
        },
        {
            id: 2,
            type: 'Visa Card',
            number: '5677 3490 XX90 XX23',
            icon: <FaCcVisa size={32} color="#1a1f71" />,
            brand: 'visa'
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const detectCardType = (number) => {
        const firstDigit = number.charAt(0);
        if (firstDigit === '4') return 'visa';
        if (['5', '2'].includes(firstDigit)) return 'mastercard';
        return 'unknown';
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = formatCardNumber(value).substring(0, 19);
        } else if (name === 'expiry') {
            formattedValue = value.replace(/[^0-9]/g, '').replace(/^([2-9])/, '0$1').replace(/^(1[3-9])/, '01').replace(/^0{2,}/, '0').replace(/^([0-1][0-9])([0-9])/, '$1/$2').substring(0, 5);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        const brand = detectCardType(formData.number);
        const last4 = formData.number.slice(-4);
        const maskedNumber = `XXXX XXXX XXXX ${last4}`;

        const newCard = {
            id: Date.now(),
            type: brand === 'visa' ? 'Visa Card' : brand === 'mastercard' ? 'Master Card' : 'Credit Card',
            number: maskedNumber,
            brand: brand,
            icon: brand === 'visa' ? <FaCcVisa size={32} color="#1a1f71" /> :
                brand === 'mastercard' ? <FaCcMastercard size={32} color="#eb001b" /> :
                    <FaCreditCard size={32} color="#131118" />
        };

        setCards([...cards, newCard]);
        setShowModal(false);
        setFormData({ number: '', name: '', expiry: '', cvv: '' });
    };

    const handleDeleteCard = (id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            setCards(cards.filter(c => c.id !== id));
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                <UserSidebar />

                <div className={styles.mainContent}>
                    <button className={styles.addNewBtn} onClick={() => setShowModal(true)}>
                        <BiPlus /> Add New Card
                    </button>

                    <div className={styles.cardList}>
                        {cards.map((card) => (
                            <div key={card.id} className={styles.cardItem}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.cardIconWrapper}>
                                        {card.icon}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h4>{card.type}</h4>
                                        <div className={styles.cardNumber}>{card.number}</div>
                                    </div>
                                </div>

                                <button className={styles.deleteBtn} onClick={() => handleDeleteCard(card.id)}>
                                    <BiTrash /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalHeader}>Add New Card</h3>
                        <form className={styles.modalForm} onSubmit={handleAddCard}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Card Number</label>
                                <div className={styles.cardNumberInputWrapper}>
                                    <input
                                        name="number"
                                        type="text"
                                        className={styles.input}
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        value={formData.number}
                                        onChange={handleInputChange}
                                    />
                                    <span className={styles.cardTypeIcon}>
                                        {detectCardType(formData.number) === 'visa' ? <FaCcVisa color="#1a1f71" /> :
                                            detectCardType(formData.number) === 'mastercard' ? <FaCcMastercard color="#eb001b" /> :
                                                <FaCreditCard color="#d1d5db" />}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cardholder Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    className={styles.input}
                                    placeholder="E.g. PHUC VIET"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Expiry Date</label>
                                    <input
                                        name="expiry"
                                        type="text"
                                        className={styles.input}
                                        placeholder="MM/YY"
                                        required
                                        value={formData.expiry}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>CVV</label>
                                    <input
                                        name="cvv"
                                        type="password"
                                        className={styles.input}
                                        placeholder="***"
                                        required
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Add Card</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedCards;
