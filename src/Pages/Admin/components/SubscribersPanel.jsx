import React, { useState, useEffect } from 'react';
import { Trash2, Mail, Copy, Check, X, Loader } from 'lucide-react';
import { getAllEmails } from '../../../firebaseUtils';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebaseConfig';
import EmailTemplateBuilder from './EmailTemplateBuilder';

const INITIAL_PLATFORM_UPDATE_SUBJECT = 'A quick update from Dee — the site feels much smoother now 🌿';

const SubscribersPanel = ({ showNotification }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'knowyourbody' | 'other'
  const [emailTemplate, setEmailTemplate] = useState({
    subject: INITIAL_PLATFORM_UPDATE_SUBJECT,
    htmlContent: '',
    textContent: ''
  });
  const [sendingEmails, setSendingEmails] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Fetch all subscribers
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const result = await getAllEmails();
        if (result.success) {
          setEmails(result.data || []);
        } else {
          showNotification('error', 'Failed to load subscribers');
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
        showNotification('error', 'Error fetching subscribers');
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, [showNotification]);

  const isKybSubscriber = (subscriber) =>
    Boolean(
      subscriber.hasKnowYourBodyCheck ||
      subscriber.source === 'knowyourbody' ||
      (Array.isArray(subscriber.sources) && subscriber.sources.includes('knowyourbody'))
    );

  const kybSubscribersCount = emails.filter(isKybSubscriber).length;

  // Filter emails based on search and source filter
  const filteredEmails = emails.filter((e) => {
    const matchesText =
      (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.lastGoal || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.lastHealthConditions || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesText) return false;
    if (sourceFilter === 'knowyourbody') return isKybSubscriber(e);
    if (sourceFilter === 'other') return !isKybSubscriber(e);
    return true;
  });

  // Handle email selection
  const toggleEmailSelection = (emailId) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      const allIds = new Set(filteredEmails.map(e => e.id));
      setSelectedEmails(allIds);
    }
  };

  // Copy email to clipboard
  const copyToClipboard = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      showNotification('error', 'Failed to copy email');
    }
  };

  // Send emails
  const handleSendEmails = async () => {
    if (selectedEmails.size === 0) {
      showNotification('error', 'Please select at least one subscriber');
      return;
    }

    if (!emailTemplate.subject.trim()) {
      showNotification('error', 'Please enter an email subject');
      return;
    }

    if (!emailTemplate.htmlContent.trim()) {
      showNotification('error', 'Please enter email content');
      return;
    }

    const recipientEmails = Array.from(selectedEmails).map(id => 
      emails.find(e => e.id === id)?.email || ''
    ).filter(Boolean);

    setSendingEmails(true);
    try {
      const sendBulkEmails = httpsCallable(functions, 'sendBulkCustomEmails');
      const response = await sendBulkEmails({
        recipients: recipientEmails,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.htmlContent,
        textContent: emailTemplate.textContent
      });

      if (response.data.success) {
        showNotification('success', response.data.message || `Emails sent successfully to ${response.data.sentCount} subscribers`);
        setShowEmailComposer(false);
        setSelectedEmails(new Set());
        setEmailTemplate({ subject: '', htmlContent: '', textContent: '' });
      } else {
        showNotification('error', response.data.message || 'Failed to send emails');
      }
    } catch (err) {
      console.error('Error sending emails:', err);
      showNotification('error', err.message || 'Failed to send emails');
    } finally {
      setSendingEmails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Newsletter Subscribers</h2>
        <button
          onClick={() => setShowEmailComposer(true)}
          disabled={emails.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          <Mail size={18} />
          Send Email
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-3xl font-bold text-blue-600">{emails.length}</p>
          <p className="text-sm text-blue-600 font-medium">Total Subscribers</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-3xl font-bold text-emerald-700">{kybSubscribersCount}</p>
          <p className="text-sm text-emerald-700 font-medium">KnowYourBody Leads</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-3xl font-bold text-purple-600">{selectedEmails.size}</p>
          <p className="text-sm text-purple-600 font-medium">Selected</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Search email, goal, or condition..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: `All (${emails.length})` },
            { id: 'knowyourbody', label: `KnowYourBody (${kybSubscribersCount})` },
            { id: 'other', label: 'Other Sources' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sourceFilter === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-green-600" size={32} />
            <span className="ml-2 text-gray-600">Loading subscribers...</span>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subscribed</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((subscriber, idx) => (
                  <tr key={subscriber.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(subscriber.id)}
                        onChange={() => toggleEmailSelection(subscriber.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      <div>{subscriber.email}</div>
                      {isKybSubscriber(subscriber) && (
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                          {subscriber.lastBmi && <span>BMI {subscriber.lastBmi}</span>}
                          {subscriber.lastGoal && <span className="capitalize">· Goal: {subscriber.lastGoal}</span>}
                          {subscriber.lastDailyCalories && <span>· {subscriber.lastDailyCalories} kcal</span>}
                          {subscriber.knowYourBodyCount > 1 && <span>({subscriber.knowYourBodyCount} checks)</span>}
                          {subscriber.lastHealthConditions && (
                            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded border border-rose-200">
                              {subscriber.lastHealthConditions}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {subscriber.createdAt ? new Date(subscriber.createdAt.toDate?.() || subscriber.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {subscriber.source || 'newsletter'}
                        </span>
                        {isKybSubscriber(subscriber) && subscriber.source !== 'knowyourbody' && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs">
                            knowyourbody
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => copyToClipboard(subscriber.email)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                        title="Copy email"
                      >
                        {copiedEmail === subscriber.email ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Send Email to Subscribers</h3>
              <button
                onClick={() => setShowEmailComposer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Recipients Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{selectedEmails.size}</span> recipient(s) selected
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailTemplate.subject}
                  onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email Template Builder */}
              <EmailTemplateBuilder 
                emailTemplate={emailTemplate}
                setEmailTemplate={setEmailTemplate}
                showNotification={showNotification}
              />

              {/* Send Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmails}
                  disabled={sendingEmails}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                >
                  {sendingEmails ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send to {selectedEmails.size} Subscriber{selectedEmails.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersPanel;
