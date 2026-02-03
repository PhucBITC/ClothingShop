import { FaShippingFast, FaUndoAlt, FaHeadset, FaCreditCard } from 'react-icons/fa';

export const categories = [
    { id: 1, name: 'Casual Wear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', slug: 'casual' },
    { id: 2, name: 'Western Wear', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', slug: 'western' },
    { id: 3, name: 'Ethnic Wear', image: 'https://images.unsplash.com/photo-1518621845118-2afe0fdd923d?w=400&q=80', slug: 'ethnic' },
    { id: 4, name: 'Kids Wear', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&q=80', slug: 'kids' },
];

export const productCategories = [
    'Men', 'Women', 'Kids', 'Bags', 'Belts', 'Wallets', 'Watches', 'Accessories', 'Winter Wear'
];

export const colors = [
    { name: 'Red', hex: '#FF0000', count: 10 },
    { name: 'Blue', hex: '#0000FF', count: 14 },
    { name: 'Orange', hex: '#FFA500', count: 8 },
    { name: 'Black', hex: '#000000', count: 9 },
    { name: 'Green', hex: '#008000', count: 4 },
    { name: 'Yellow', hex: '#FFFF00', count: 2 },
];

export const sizes = [
    { name: 'S', count: 6 },
    { name: 'M', count: 20 },
    { name: 'L', count: 7 },
    { name: 'XL', count: 16 },
    { name: 'XXL', count: 10 },
    { name: 'XXXL', count: 2 }
];

export const products = [
    { id: 1, name: 'Basic Dress Green', brand: 'Zara', price: 236.00, originalPrice: 300.00, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80', color: 'Green', size: 'M' },
    { id: 2, name: 'Nike Sportswear', brand: 'Nike', price: 15.00, originalPrice: 24.00, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80', color: 'Black', size: 'L' },
    { id: 3, name: 'Yellow Casual Dress', brand: 'H&M', price: 19.00, originalPrice: 29.00, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', color: 'Yellow', size: 'S' },
    { id: 4, name: 'Denim Jacket', brand: 'Levis', price: 45.00, originalPrice: 60.00, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80', color: 'Blue', size: 'M' },
    { id: 5, name: 'Black Polka Dot', brand: 'Mango', price: 27.00, originalPrice: 40.00, image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&q=80', color: 'Black', size: 'XL' },
    { id: 6, name: 'Relaxed Trousers', brand: 'Uniqlo', price: 30.00, originalPrice: 45.00, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80', color: 'Blue', size: 'L' },
    { id: 7, name: 'T-Shirt Summer', brand: 'Prada', price: 18.00, originalPrice: 25.00, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', color: 'Red', size: 'M' },
    { id: 8, name: 'Sneakers White', brand: 'Adidas', price: 80.00, originalPrice: 120.00, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', color: 'White', size: '42' },
    /* More mock products to fill grid */
    { id: 9, name: 'Allen Solly Handbag', brand: 'Allen Solly', price: 80.00, originalPrice: 100.00, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', color: 'Brown', size: 'Free' },
    { id: 10, name: 'Louis Philippe Sport', brand: 'Louis Philippe', price: 50.00, originalPrice: 65.00, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80', color: 'Grey', size: 'L' },
    { id: 11, name: 'Adidas Running Shoes', brand: 'Adidas', price: 60.00, originalPrice: 75.00, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', color: 'Grey', size: '42' },
    { id: 12, name: 'Printed Cotton T-Shirt', brand: 'Roadster', price: 38.00, originalPrice: 40.00, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80', color: 'Black', size: 'M' },
];

// Re-export as bestsellers for Home compatibility if needed, or update Home to use 'products.slice(0,8)'
export const bestsellers = products.slice(0, 8);

export const reviews = [
    { id: 1, name: 'Leslie Alexander', role: 'Model', rating: 5, comment: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.', image: 'https://ui-avatars.com/api/?name=Leslie+Alexander&background=random' },
    { id: 2, name: 'Jacob Jones', role: 'Designer', rating: 5, comment: 'The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here.', image: 'https://ui-avatars.com/api/?name=Jacob+Jones&background=random' },
    { id: 3, name: 'Jenny Wilson', role: 'Fashion Blogger', rating: 5, comment: 'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.', image: 'https://ui-avatars.com/api/?name=Jenny+Wilson&background=random' },
];

export const services = [
    { id: 1, icon: FaShippingFast, title: 'Free Shipping', desc: 'Free shipping for orders above $150' },
    { id: 2, icon: FaUndoAlt, title: 'Money Guarantee', desc: 'Within 30 days for an exchange' },
    { id: 3, icon: FaHeadset, title: 'Online Support', desc: '24 hours a day, 7 days a week' },
    { id: 4, icon: FaCreditCard, title: 'Flexible Payment', desc: 'Pay with multiple credit cards' },
];
