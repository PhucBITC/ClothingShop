import React from 'react';
import styles from './AdminHelp.module.css';
import { BiHelpCircle, BiQuestionMark, BiBook, BiSupport } from 'react-icons/bi';

const AdminHelp = () => {
    const faqs = [
        {
            question: "How do I add a new product?",
            answer: "Go to the 'Products' section in the sidebar and click on 'Add Product'. Fill in the required details including name, price, category, and images."
        },
        {
            question: "How can I manage orders?",
            answer: "All customer orders appear in the 'Orders' section. You can view order details, update status (e.g., from 'PENDING' to 'COMPLETED'), and see shipping information."
        },
        {
            question: "Where can I see sales reports?",
            answer: "The 'Reports' section provides detailed analytics for both Product Performance and Revenue. You can export these reports to Excel or PDF for further analysis."
        },
        {
            question: "How do I create discount codes?",
            answer: "Navigate to 'Discounts' and click 'Add Discount'. You can specify the discount type (Percentage or Fixed), value, and validity dates."
        }
    ];
    const guides = [
        {
            id: 'getting-started',
            title: 'Getting Started Guide',
            content: 'Welcome to your store! To get started, first configure your system settings. Then, add categories and products. Once you have products, you can start receiving orders from customers.'
        },
        {
            id: 'managing-inventory',
            title: 'Managing Inventory',
            content: 'Monitor your stock levels in the Products section. You can update stock counts for individual variants and receive low-stock alerts in the Dashboard.'
        },
        {
            id: 'handling-returns',
            title: 'Handling Returns',
            content: 'When a customer requests a return, locate the order in the Orders section. You can update the status to "RETURNED" and manage the refund process through your payment provider dashboard.'
        },
        {
            id: 'analytics-breakdown',
            title: 'Analytics Breakdown',
            content: 'Use the Reports page to analyze your sales. You can filter by date range, category, and export data to Excel or PDF for deep-dive analysis of your business performance.'
        }
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.helpContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Help Center</h1>
                <p className={styles.subtitle}>Find answers to common questions and learn how to manage your store.</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.faqSection}>
                    <h2 className={styles.sectionTitle}><BiQuestionMark /> Frequently Asked Questions</h2>
                    <div className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <div key={index} className={styles.faqItem}>
                                <h3 className={styles.question}>{faq.question}</h3>
                                <p className={styles.answer}>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><BiBook /> Quick Documentation</h3>
                        <ul className={styles.docList}>
                            {guides.map(guide => (
                                <li key={guide.id} onClick={() => scrollToSection(guide.id)}>
                                    {guide.title}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><BiSupport /> Need More Help?</h3>
                        <p>Contact our support team for technical assistance or custom feature requests.</p>
                        <button className={styles.supportBtn}>Contact Support</button>
                    </div>
                </div>
            </div>

            <div className={styles.guidesSection}>
                <h2 className={styles.sectionTitle}><BiBook /> Detailed Guides</h2>
                <div className={styles.guideGrid}>
                    {guides.map(guide => (
                        <div key={guide.id} id={guide.id} className={styles.guideCard}>
                            <h3 className={styles.guideTitle}>{guide.title}</h3>
                            <p className={styles.guideContent}>{guide.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
