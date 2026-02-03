import React from 'react';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { FaCcMastercard, FaCcVisa } from 'react-icons/fa'; // Using FontAwesome icons for cards
import UserSidebar from './UserSidebar';
import styles from './SavedCards.module.css';

function SavedCards() {
    const cards = [
        {
            id: 1,
            type: 'Master Card',
            number: '3456 XX78 9800 55X3',
            icon: <FaCcMastercard size={32} color="#eb001b" /> // Example icon color
        },
        {
            id: 2,
            type: 'Visa Card',
            number: '5677 3490 XX90 XX23',
            icon: <FaCcVisa size={32} color="#1a1f71" />
        }
    ];

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Saved Cards */}
                <div className={styles.mainContent}>

                    <button className={styles.addNewBtn}>
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

                                <button className={styles.deleteBtn}>
                                    <BiTrash /> Delete
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SavedCards;
