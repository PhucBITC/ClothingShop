import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiSave, BiArrowBack, BiLoaderAlt, BiImage, BiLink, BiTag, BiUser, BiCheckCircle } from 'react-icons/bi';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './AdminBlogForm.module.css';

const categories = [
    { key: 'TRENDS', label: 'Trends' },
    { key: 'STYLING_TIPS', label: 'Styling Tips' },
    { key: 'NEW_COLLECTION', label: 'New Collection' },
    { key: 'FASHION_GUIDE', label: 'Fashion Guide' }
];

const BlogForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);

    const [post, setPost] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        author: 'Admin',
        category: 'TRENDS',
        status: 'PUBLISHED'
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await axios.get(`/blogs/admin/${id}`);
            setPost(res.data);
        } catch (error) {
            toast.error("Error", "Article not found");
            navigate('/admin/blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPost(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-generate slug from title if it's a new post
            if (name === 'title' && !isEdit) {
                updated.slug = value.toLowerCase()
                                    .normalize("NFD")
                                    .replace(/[\u0300-\u036f]/g, "")
                                    .replace(/[^\w ]+/g, '')
                                    .replace(/ +/g, '-');
            }
            return updated;
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            
            const formData = new FormData();
            
            // Map 'post' to 'BlogRequest' structure
            const blogRequest = {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                author: post.author,
                category: post.category,
                status: post.status,
                existingCoverImage: post.coverImage // Send current URL if no new file
            };

            formData.append('blog', new Blob([JSON.stringify(blogRequest)], { type: 'application/json' }));
            
            if (selectedFile) {
                formData.append('file', selectedFile);
            }


            if (isEdit) {
                await axios.put(`/blogs/admin/${id}`, formData);
                toast.success("Success", "Article updated successfully");
            } else {
                await axios.post('/blogs/admin', formData);
                toast.success("Success", "Article created successfully");
            }
            navigate('/admin/blogs');
        } catch (error) {
            console.error("Save error:", error);
            const message = error.response?.data?.message || "Failed to save article. Check if the slug is unique.";
            toast.error("Error", message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/admin/blogs')}>
                    <BiArrowBack /> Back to List
                </button>
                <h1 className={styles.title}>{isEdit ? 'Edit Article' : 'Create New Article'}</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.mainGrid}>
                    <div className={styles.leftColumn}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Content Details</h2>
                            <div className={styles.group}>
                                <label>Article Title</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={post.title} 
                                    onChange={handleChange} 
                                    placeholder="Enter a catchy title..."
                                    required
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Slug (URL Identifier)</label>
                                <div className={styles.inputWithIcon}>
                                    <BiLink />
                                    <input 
                                        type="text" 
                                        name="slug" 
                                        value={post.slug} 
                                        onChange={handleChange} 
                                        placeholder="article-url-slug"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Excerpt (Short Summary)</label>
                                <textarea 
                                    name="excerpt" 
                                    value={post.excerpt} 
                                    onChange={handleChange} 
                                    placeholder="Briefly describe what this article is about..."
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Article Content (HTML supported)</label>
                                <textarea 
                                    name="content" 
                                    value={post.content} 
                                    onChange={handleChange} 
                                    placeholder="Write your article content here..."
                                    rows="15"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Metadata & Media</h2>
                            <div className={styles.group}>
                                <label>Category</label>
                                <div className={styles.inputWithIcon}>
                                    <BiTag />
                                    <select name="category" value={post.category} onChange={handleChange}>
                                        {categories.map(cat => (
                                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Author</label>
                                <div className={styles.inputWithIcon}>
                                    <BiUser />
                                    <input 
                                        type="text" 
                                        name="author" 
                                        value={post.author} 
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Status</label>
                                <div className={styles.inputWithIcon}>
                                    <BiCheckCircle />
                                    <select name="status" value={post.status} onChange={handleChange}>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="DRAFT">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Cover Image</label>
                                <div className={styles.fileUpload}>
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                        id="coverImageInput"
                                        className={styles.hiddenInput}
                                    />
                                    <label htmlFor="coverImageInput" className={styles.uploadLabel}>
                                        <BiImage /> {selectedFile ? 'Change Image' : 'Upload Cover Image'}
                                    </label>
                                </div>
                            </div>

                            <div className={styles.group}>
                                <label>Or Image URL / Base64</label>
                                <div className={styles.inputWithIcon}>
                                    <BiLink />
                                    <input 
                                        type="text" 
                                        name="coverImage" 
                                        value={post.coverImage} 
                                        onChange={handleChange} 
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                            </div>

                            {(previewUrl || post.coverImage) && (
                                <div className={styles.preview}>
                                    <label>Preview Image</label>
                                    <div className={styles.previewImageContainer}>
                                        <img src={previewUrl || post.coverImage} alt="Preview" />
                                        {previewUrl && <div className={styles.newBadge}>New</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                                {isSaving ? <BiLoaderAlt className={styles.spinner} /> : <BiSave />}
                                {isSaving ? "Saving..." : "Save Article"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BlogForm;
