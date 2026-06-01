import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';
import { useNavigate } from 'react-router-dom';

const Shopping = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);

  // Cart & Checkout State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [trxId, setTrxId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'''---------------------------------------'`;

  useEffect(() => {
    fetchProducts();
    if (isLoggedIn && user) {
      const savedCart = localStorage.getItem(`cart_${user.username}`);
      if (savedCart) {
        try { setCartItems(JSON.parse(savedCart)); } catch(e) {}
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem(`cart_${user.username}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Products fetch error:', error);
      setError('পণ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'food': 'খাবার',
      'beverage': 'পানীয়',
      'service': 'সেবা',
      'other': 'অন্যান্য'
    };
    return labels[category] || category;
  };

  const addToCart = (product) => {
    if (!isLoggedIn) {
      alert('কার্টে পণ্য যোগ করতে অনুগ্রহ করে লগইন করুন।');
      navigate('/login');
      return;
    }
    
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item._id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const getCartTotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('অনুগ্রহ করে একটি পেমেন্ট মেথড নির্বাচন করুন');
      return;
    }
    
    // Simulate order placement since no backend API is ready
    setOrderSuccess(true);
    setCartItems([]);
    
    setTimeout(() => {
      setIsCheckoutOpen(false);
      setOrderSuccess(false);
      setPaymentMethod('');
      setTrxId('');
      setShippingAddress('');
    }, 3000);
  };

  const cartIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>';

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-animation"></div>
        <p>পণ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchProducts} className="retry-btn">
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="shopping-page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>রেলওয়ে মার্চেন্ডাইজ</h1>
          {isLoggedIn && (
            <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)}>
              <span dangerouslySetInnerHTML={{ __html: cartIcon }} style={{ fill: 'currentColor', display: 'flex' }}></span>
              <span className="cart-count">{toBengaliDigits(cartItems.length)}</span>
            </button>
          )}
        </div>
        <p>অফিসিয়াল পণ্য সংগ্রহ</p>

        <button onClick={fetchProducts} className="refresh-btn">রিফ্রেশ</button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image-container">
              {product.image ? (
                <img src={getImageUrl(product.image)} alt={product.name} className="product-image" />
              ) : (
                <div 
                  className="product-image-placeholder"
                  dangerouslySetInnerHTML={{ __html: cartIcon }}
                ></div>
              )}
              <div className="product-badge">{getCategoryLabel(product.category)}</div>
            </div>
            
            <div className="product-content">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">
                {product.description?.substring(0, 100) || 'রেলওয়ে অফিসিয়াল পণ্য'}
              </p>
              <div className="product-price">৳ {toBengaliDigits(product.price)}</div>
            </div>
            
            <div className="product-footer">
              <button 
                className="view-details-btn"
                onClick={() => openProductDetail(product)}
              >
                বিস্তারিত
              </button>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                কার্টে যোগ
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="product-detail">
              <div className="product-image-large">
                {selectedProduct.image ? (
                  <img src={getImageUrl(selectedProduct.image)} alt={selectedProduct.name} />
                ) : (
                  <div 
                    className="product-image-placeholder large"
                    dangerouslySetInnerHTML={{ __html: cartIcon }}
                  ></div>
                )}
              </div>
              
              <div className="product-info">
                <h2>{selectedProduct.name}</h2>
                <p className="product-category-badge">{getCategoryLabel(selectedProduct.category)}</p>
                <p className="product-full-description">
                  {selectedProduct.description || 'রেলওয়ে অফিসিয়াল পণ্য'}
                </p>
                
                <div className="product-specs">
                  <div className="spec-item">
                    <span className="spec-label">স্টক:</span>
                    <span className="spec-value">{selectedProduct.stock > 0 ? toBengaliDigits(selectedProduct.stock) : 'স্টক নেই'}</span>
                  </div>
                </div>
                
                <div className="price-section">
                  <span className="price">৳ {toBengaliDigits(selectedProduct.price)}</span>
                </div>
                
                <div className="action-buttons">
                  <button className="buy-now-btn" onClick={() => addToCart(selectedProduct)}>
                    এখনই কিনুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="empty-state">
          <div 
            className="empty-icon"
            dangerouslySetInnerHTML={{ __html: cartIcon }}
          ></div>
          <p>কোন পণ্য পাওয়া যায়নি</p>
          <button onClick={fetchProducts} className="retry-btn">আবার চেষ্টা করুন</button>
        </div>
      )}

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>আপনার কার্ট</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart-msg">আপনার কার্টে কোন পণ্য নেই।</p>
          ) : (
            cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-img-wrap">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-placeholder" dangerouslySetInnerHTML={{ __html: cartIcon }}></div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p>৳ {toBengaliDigits(item.price)}</p>
                  <div className="cart-qty-controls">
                    <button type="button" onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <span>{toBengaliDigits(item.quantity)}</span>
                    <button type="button" onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                </div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item._id)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>মোট মূল্য:</span>
              <span>৳ {toBengaliDigits(getCartTotal())}</span>
            </div>
            <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
              চেকআউট করুন
            </button>
          </div>
        )}
      </div>
      
      {/* Overlay for Cart */}
      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay checkout-modal-overlay" onClick={() => !orderSuccess && setIsCheckoutOpen(false)}>
          <div className="checkout-modal modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            
            {orderSuccess ? (
              <div className="order-success-msg">
                <div className="success-icon">✓</div>
                <h2>অর্ডার সফল হয়েছে!</h2>
                <p>আপনার অর্ডারটি প্রক্রিয়াধীন আছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
              </div>
            ) : (
              <div className="checkout-form-container">
                <h2>চেকআউট</h2>
                <div className="checkout-summary">
                  <p>মোট আইটেম: <strong>{toBengaliDigits(cartItems.length)}</strong></p>
                  <p>মোট মূল্য: <strong style={{ color: 'var(--orange-primary)', fontSize: '1.2rem' }}>৳ {toBengaliDigits(getCartTotal())}</strong></p>
                </div>
                
                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                  <div className="form-group">
                    <label className="form-label">ডেলিভারি ঠিকানা *</label>
                    <textarea 
                      required 
                      rows="3" 
                      value={shippingAddress} 
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="বিস্তারিত ঠিকানা লিখুন"
                      className="form-textarea"
                    />
                  </div>
                  
                  <div className="payment-methods-section">
                    <label className="form-label">পেমেন্ট মেথড নির্বাচন করুন *</label>
                    <div className="payment-options">
                      {['bKash', 'Nagad', 'Rocket', 'Upay'].map(method => (
                        <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value={method} 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                          />
                          <span className="payment-name">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {paymentMethod && (
                    <div className="payment-instructions animate-fade-in">
                      <div className="payment-instruction-box">
                        <p>আপনার <strong>{paymentMethod}</strong> অ্যাপ থেকে <strong>017XXXXXXXX</strong> নম্বরে <strong>৳ {toBengaliDigits(getCartTotal())}</strong> Send Money করুন।</p>
                      </div>
                      <div className="form-group">
                        <label className="form-label">ট্রানজেকশন আইডি (TrxID) *</label>
                        <input 
                          type="text" 
                          required 
                          value={trxId} 
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder={`${paymentMethod} TrxID`}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button type="submit" className="place-order-btn">
                    অর্ডার প্লেস করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shopping;