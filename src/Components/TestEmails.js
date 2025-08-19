// TestEmails.js - Create this as a new component
import React, { useState } from 'react';
import { getAllEmails } from '../firebaseUtils'; // Adjust path as needed

const TestEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGetEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllEmails();
      
      if (result.success) {
        setEmails(result.data);
        console.log('✅ Success! Emails fetched:', result.data);
        console.log('📊 Total emails:', result.data.length);
      } else {
        setError(result.error);
        console.error('❌ Error:', result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Test Get Emails Function</h2>
      
      <button 
        onClick={testGetEmails} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Loading...' : 'Test Get Emails'}
      </button>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#fee2e2', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div>
        <h3>Results ({emails.length} emails found):</h3>
        {emails.length > 0 ? (
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #e5e7eb'
          }}>
            {emails.map((email, index) => (
              <div key={email.id} style={{ 
                marginBottom: '10px', 
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '3px',
                border: '1px solid #d1d5db'
              }}>
                <strong>#{index + 1}</strong> - {email.email}
                <br />
                <small style={{ color: '#6b7280' }}>
                  ID: {email.id} | 
                  Created: {email.createdAt ? new Date(email.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                </small>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>No emails found or test not run yet.</p>
        )}
      </div>
    </div>
  );
};

export default TestEmails;