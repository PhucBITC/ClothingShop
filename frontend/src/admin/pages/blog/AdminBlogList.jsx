import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiPlus, BiEdit, BiTrash, BiSearch, BiFilter, BiChevronLeft, BiChevronRight, BiTime, BiUser, BiCommentDetail } from 'react-icons/bi';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './AdminBlogList.module.css';

const categories = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'TRENDS', label: 'Trends' },
    { key: 'STYLING_TIPS', label: 'Styling Tips' },
    { key: 'NEW_COLLECTION', label: 'New Collection' },
    { key: 'FASHION_GUIDE', label: 'Fashion Guide' }
];

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/blogs/admin');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error("Error", "Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog post?")) return;
        try {
            await axios.delete(`/blogs/admin/${id}`);
            toast.success("Deleted", "Blog post deleted successfully");
            fetchPosts();
        } catch (error) {
            toast.error("Error", "Failed to delete blog post");
        }
    };

    const filteredPosts = posts.filter(post => {
        const titleMatch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || post.category === filterCategory;
        return titleMatch && matchesCategory;
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Blog Management</h1>
                    <p className={styles.subtitle}>Manage your store's fashion journal and articles</p>
                </div>
                <button 
                    className={styles.addBtn}
                    onClick={() => navigate('/admin/blogs/new')}
                >
                    <BiPlus /> Create New Post
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <BiSearch />
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterBox}>
                    <BiFilter />
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading articles...</div>
            ) : (
                <div className={styles.grid}>
                    {filteredPosts.map((post) => (
                        <div key={post.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                <img src={post.coverImage} alt={post.title} />
                                <span className={styles.statusBadge}>
                                    {post.status}
                                </span>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardCategory}>{post.category}</div>
                                <h3 className={styles.cardTitle}>{post.title}</h3>
                                <div className={styles.cardMeta}>
                                    <span><BiUser /> {post.author}</span>
                                    <span><BiTime /> {formatDate(post.createdAt)}</span>
                                </div>
                                <div className={styles.cardActions}>
                                    <button 
                                        onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
                                        className={styles.editBtn}
                                        title="Edit"
                                    >
                                        <BiEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className={styles.deleteBtn}
                                        title="Delete"
                                    >
                                        <BiTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPosts.length === 0 && (
                        <div className={styles.empty}>No articles found matching your criteria.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogList;
