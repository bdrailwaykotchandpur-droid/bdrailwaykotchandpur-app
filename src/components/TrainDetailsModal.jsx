import React, { useState, useEffect } from 'react';
import { toBengaliDigits, formatToBengaliTime } from '../utils/banglaTimeFormatter';

const TrainDetailsModal = ({ train, onClose }) => {
  // ALL HOOKS FIRST
  const [comments, setComments] = useState([]);
  const [nickname, setNickname] = useState('');
  const [commentText, setCommentText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState(null); // comment ID
  const [replyNickname, setReplyNickname] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyPhoto, setReplyPhoto] = useState(null);
  const [replyPhotoPreview, setReplyPhotoPreview] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (train && train._id) {
      fetchComments();
    }
  }, [train]);

  const fetchComments = async () => {
    if (!train || !train._id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/train/${train._id}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Safety check AFTER hooks
  if (!train || !train._id) {
    return null;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReplyPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComment = async () => {
    if (!nickname.trim() || !commentText.trim()) {
      alert('নিকনেম এবং কমেন্ট লিখুন');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('trainId', train._id);
    formData.append('nickname', nickname);
    formData.append('comment', commentText);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setCommentText('');
        setNickname('');
        setPhoto(null);
        setPhotoPreview(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (commentId) => {
    if (!replyNickname.trim() || !replyText.trim()) {
      alert('নিকনেম এবং রিপ্লাই লিখুন');
      return;
    }

    setReplyLoading(true);
    const formData = new FormData();
    formData.append('nickname', replyNickname);
    formData.append('reply', replyText);
    if (replyPhoto) {
      formData.append('photo', replyPhoto);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/${commentId}/reply`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setReplyText('');
        setReplyNickname('');
        setReplyPhoto(null);
        setReplyPhotoPreview(null);
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#f14f29' }}>{train.name || 'ট্রেন'}</h2>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>ট্রেন নং: {toBengaliDigits(train.number) || '—'}</p>
          <p style={{ fontSize: '0.8rem', color: '#999' }}>{train.from || '—'} → {train.to || '—'}</p>
        </div>

        <div className="train-detail-tabs" style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e9ecef', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('comments')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'comments' ? '#f14f29' : 'transparent',
              color: activeTab === 'comments' ? 'white' : '#666',
              border: 'none',
              borderRadius: '25px 25px 0 0',
              cursor: 'pointer'
            }}
          >
            মন্তব্য ({comments.length})
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'schedule' ? '#f14f29' : 'transparent',
              color: activeTab === 'schedule' ? 'white' : '#666',
              border: 'none',
              borderRadius: '25px 25px 0 0',
              cursor: 'pointer'
            }}
          >
            সময়সূচী
          </button>
        </div>

        {activeTab === 'comments' && (
          <div>
            {/* 1. Show comments list first (Facebook style) */}
            <div style={{ marginBottom: '20px' }}>
              {comments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>কোন মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} style={{ borderBottom: '1px solid #e9ecef', padding: '12px 0', background: comment.isSystemUpdate ? '#fff5f2' : 'transparent', borderRadius: comment.isSystemUpdate ? '10px' : '0', padding: comment.isSystemUpdate ? '15px' : '12px 0', position: 'relative' }}>
                    {comment.isSystemUpdate && comment.badge && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: comment.badge === 'Late' ? '#dc3545' : comment.badge === 'On-Time' ? '#28a745' : '#f14f29', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transform: 'rotate(5deg)' }}>
                        📌 {comment.badge}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <strong style={{ color: comment.isSystemUpdate ? '#d84321' : '#f14f29' }}>
                        {comment.isSystemUpdate ? '🚆 ' : ''}{comment.nickname}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>
                        {new Date(comment.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <p style={{ marginBottom: '8px', fontWeight: comment.isSystemUpdate ? 'bold' : 'normal', color: comment.isSystemUpdate ? '#333' : 'inherit' }}>{comment.comment}</p>
                    {comment.photo && (
                      <img 
                        src={comment.photo} 
                        alt="User uploaded" 
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                        onClick={() => window.open(comment.photo, '_blank')}
                      />
                    )}
                    
                    {/* Reply Action */}
                    {!comment.isSystemUpdate && (
                      <button 
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.85rem', cursor: 'pointer', padding: '5px 0', marginTop: '5px', fontWeight: 'bold' }}
                      >
                        রিপ্লাই দিন
                      </button>
                    )}

                    {/* Replies List */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginLeft: '30px', marginTop: '10px', borderLeft: '2px solid #eee', paddingLeft: '15px' }}>
                        {comment.replies.map((reply, idx) => (
                          <div key={idx} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ color: '#333', fontSize: '0.9rem' }}>{reply.nickname}</strong>
                              <span style={{ fontSize: '0.7rem', color: '#999' }}>
                                {new Date(reply.createdAt).toLocaleString('bn-BD')}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{reply.comment}</p>
                            {reply.photo && (
                              <img 
                                src={reply.photo} 
                                alt="Reply photo" 
                                style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => window.open(reply.photo, '_blank')}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div style={{ marginLeft: '30px', marginTop: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="আপনার নিকনেম"
                          value={replyNickname}
                          onChange={(e) => setReplyNickname(e.target.value)}
                          style={{ marginBottom: '8px', padding: '8px', fontSize: '0.85rem' }}
                        />
                        <textarea
                          className="form-textarea"
                          placeholder="রিপ্লাই লিখুন..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows="2"
                          style={{ marginBottom: '8px', padding: '8px', fontSize: '0.85rem' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <label style={{ background: '#e9ecef', color: '#333', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            ছবি
                            <input type="file" accept="image/*" onChange={handleReplyPhotoChange} style={{ display: 'none' }} />
                          </label>
                          <button
                            onClick={() => submitReply(comment._id)}
                            disabled={replyLoading}
                            style={{ background: '#f14f29', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            {replyLoading ? '...' : 'পোস্ট'}
                          </button>
                        </div>
                        {replyPhotoPreview && (
                          <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                            <img src={replyPhotoPreview} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            <button onClick={() => { setReplyPhoto(null); setReplyPhotoPreview(null); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '15px', height: '15px', cursor: 'pointer', fontSize: '10px', lineHeight: '1' }}>×</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 2. Show Add Comment box after comments */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>নতুন মন্তব্য দিন</h4>
              <input
                type="text"
                className="form-input"
                placeholder="আপনার নিকনেম (যেমন: রেল ভক্ত)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <textarea
                className="form-textarea"
                placeholder="আপনার মন্তব্য লিখুন..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows="3"
                style={{ marginBottom: '10px' }}
              />
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ background: '#6c757d', color: 'white', padding: '8px 16px', borderRadius: '25px', cursor: 'pointer', display: 'inline-block' }}>
                  ছবি সংযুক্ত করুন
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
                {photoPreview && (
                  <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                    <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </div>
              
              <button
                onClick={submitComment}
                disabled={loading}
                className="submit-btn"
                style={{ marginTop: '0' }}
              >
                {loading ? 'পোস্ট করা হচ্ছে...' : 'মন্তব্য পোস্ট করুন'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            {train.scheduleText ? (
              <div 
                className="ql-editor"
                style={{ 
                  background: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}
                dangerouslySetInnerHTML={{ __html: train.scheduleText }}
              />
            ) : (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center',
                color: '#999'
              }}>
                <p>কোন সময়সূচী তথ্য নেই।</p>
                <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>এডমিন এই ট্রেনের সময়সূচী যুক্ত করবেন।</p>
              </div>
            )}
          </div>
        )}

        <style>{`
          .train-detail-tabs button:hover {
            background: ${activeTab === 'comments' ? '#f14f29' : '#f0f0f0'};
          }
        `}</style>
      </div>
    </div>
  );
};

export default TrainDetailsModal;
