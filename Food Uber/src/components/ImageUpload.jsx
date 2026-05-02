import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ImageUpload({ onUpload, label, previewUrl }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        onUpload(data.url);
        toast.success('Image uploaded!');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload error. Check server.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="img-upload-box" style={{ marginBottom: 16 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 12, background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {previewUrl ? (
            <img src={previewUrl.startsWith('http') ? previewUrl : `http://localhost:8000${previewUrl}`} 
                 alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.5rem', opacity: 0.2 }}>🖼️</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            id={`file-${label}`} 
            style={{ display: 'none' }} 
          />
          <label htmlFor={`file-${label}`} style={{
            padding: '8px 16px', background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            display: 'inline-block'
          }}>
            {uploading ? 'Uploading...' : 'Choose Photo'}
          </label>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
            Recommended: Square for Logo, Wide for Banner.
          </p>
        </div>
      </div>
    </div>
  );
}
