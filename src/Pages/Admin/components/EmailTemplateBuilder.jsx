import React, { useState } from 'react';
import { Bold, Italic, Type, Image, Phone } from 'lucide-react';

const EmailTemplateBuilder = ({ emailTemplate, setEmailTemplate, showNotification }) => {
  const [view, setView] = useState('compose'); // 'compose' or 'preview'
  const [contentSections, setContentSections] = useState([
    { id: 1, type: 'heading', value: '' },
    { id: 2, type: 'paragraph', value: '' }
  ]);
  const [nextId, setNextId] = useState(3);
  const [headerImage, setHeaderImage] = useState('');

  // Brand colors matching the site
  const brandColors = {
    primary: '#f97316',    // Orange
    secondary: '#16a34a',  // Green
    accent: '#fb923c',     // Light orange
    background: '#f0fdf4', // Light green background
    text: '#1f2937',       // Dark gray
    lightText: '#64748b'   // Medium gray
  };

  // Generate HTML from sections
  const generateHTML = (sections, subject, headerImg) => {
    const sectionHtmls = sections.map(section => {
      switch (section.type) {
        case 'heading':
          return `<h2 style="color: ${brandColors.primary}; font-size: 28px; font-weight: 800; margin-bottom: 20px; margin-top: 0;">${section.value}</h2>`;
        case 'paragraph':
          return `<p style="color: ${brandColors.text}; font-size: 16px; line-height: 1.8; margin-bottom: 20px; margin-top: 0;">${section.value}</p>`;
        case 'divider':
          return `<div style="height: 3px; background: linear-gradient(90deg, ${brandColors.accent} 0%, ${brandColors.primary} 50%, ${brandColors.accent} 100%); margin: 30px 0; border-radius: 2px;"></div>`;
        case 'button':
          return `<div style="text-align: center; margin: 25px 0;"><a href="${section.url || '#'}" style="background: linear-gradient(135deg, ${brandColors.primary} 0%, #ea580c 100%); color: white; padding: 16px 36px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35); font-size: 14px;">${section.value} →</a></div>`;
        case 'tip':
          return `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%); border-left: 5px solid ${brandColors.primary}; padding: 20px; margin-bottom: 20px; border-radius: 8px;"><p style="color: ${brandColors.text}; margin: 0; font-weight: 600; font-size: 15px;">💡 ${section.value}</p></div>`;
        case 'highlight':
          return `<div style="background: ${brandColors.background}; border: 2px solid ${brandColors.secondary}; padding: 20px; border-radius: 12px; margin-bottom: 20px;"><p style="color: ${brandColors.secondary}; margin: 0; font-weight: 600; font-size: 16px;">✨ ${section.value}</p></div>`;
        default:
          return '';
      }
    }).filter(Boolean).join('');

    const headerImageHtml = headerImg ? `<img src="${headerImg}" alt="Header" style="width: 100%; height: auto; display: block; border-radius: 20px 20px 0 0;" />` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: ${brandColors.background}; margin: 0; padding: 20px 0;">
  <div style="background: white; max-width: 600px; margin: 0 auto; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
    
    <!-- Header Accent Bar -->
    <div style="height: 4px; background-color: ${brandColors.accent};"></div>
    
    <!-- Logo & Title Header -->
    <div style="background: white; padding: 40px 20px 30px; text-align: center;">
      <img src="https://dietwithdee.org/LOGO.png" alt="Diet With Dee" style="width: 140px; max-width: 100%; margin: 0 auto 15px; display: block;" />
      <div style="font-size: 18px; font-weight: 700; color: ${brandColors.secondary}; letter-spacing: 0.5px;">From Nana Ama Dwamena</div>
    </div>

    ${headerImageHtml ? `<div style="padding: 0 20px;">${headerImageHtml}</div>` : ''}
    
    <!-- Main Content -->
    <div style="padding: 40px 40px;">
      ${sectionHtmls}
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 40px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: ${brandColors.lightText}; font-size: 15px; margin-bottom: 15px; font-weight: 500;">
        <strong style="color: #334155; font-size: 16px; display: block; margin-bottom: 5px;">Diet With Dee</strong>
        Helping you build healthier habits for life.
      </p>
      <p style="color: ${brandColors.lightText}; font-size: 13px; margin: 15px 0 0;">
        <a href="https://dietwithdee.org" style="color: ${brandColors.secondary}; text-decoration: none; margin: 0 10px;">Visit Website</a> | 
        <a href="https://dietwithdee.org/unsubscribe" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
      </p>
      <p style="color: #cbd5e1; font-size: 12px; margin: 10px 0 0;">© 2026 Diet With Dee. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  // Generate plain text
  const generatePlainText = (sections) => {
    return sections.map(section => {
      switch (section.type) {
        case 'heading':
          return `\n${section.value.toUpperCase()}\n${'='.repeat(section.value.length)}\n`;
        case 'paragraph':
          return section.value + '\n';
        case 'divider':
          return '---\n';
        case 'button':
          return `${section.value}: ${section.url || 'link'}\n`;
        case 'tip':
          return `TIP: ${section.value}\n`;
        case 'highlight':
          return `[IMPORTANT] ${section.value}\n`;
        default:
          return '';
      }
    }).join('\n');
  };

  const handleSectionChange = (id, field, value) => {
    setContentSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
    
    // Auto-update template
    const updated = contentSections.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setEmailTemplate({
      ...emailTemplate,
      htmlContent: generateHTML(updated, emailTemplate.subject, headerImage),
      textContent: generatePlainText(updated)
    });
  };

  const handleHeaderImageChange = (url) => {
    setHeaderImage(url);
    setEmailTemplate({
      ...emailTemplate,
      htmlContent: generateHTML(contentSections, emailTemplate.subject, url)
    });
  };

  const addSection = (type) => {
    const newId = nextId;
    setNextId(newId + 1);
    const newSection = { id: newId, type, value: '', url: '' };
    const updated = [...contentSections, newSection];
    setContentSections(updated);
    setEmailTemplate({
      ...emailTemplate,
      htmlContent: generateHTML(updated, emailTemplate.subject, headerImage),
      textContent: generatePlainText(updated)
    });
  };

  const removeSection = (id) => {
    const updated = contentSections.filter(s => s.id !== id);
    setContentSections(updated);
    setEmailTemplate({
      ...emailTemplate,
      htmlContent: generateHTML(updated, emailTemplate.subject, headerImage),
      textContent: generatePlainText(updated)
    });
  };

  const loadTemplate = (templateType) => {
    let sections = [];
    let headerImg = '';
    
    switch (templateType) {
      case 'newsletter':
        sections = [
          { id: 101, type: 'heading', value: 'New Nutrition Tips This Week' },
          { id: 102, type: 'paragraph', value: 'Hi there! I just shared some practical insights on how to build sustainable eating habits. This week\'s focus is on simple changes that actually stick.' },
          { id: 103, type: 'divider' },
          { id: 104, type: 'tip', value: 'Small, consistent changes lead to the biggest results over time.' },
          { id: 105, type: 'paragraph', value: 'Whether you\'re managing your weight, improving your energy, or handling a health condition, these strategies apply to everyone.' },
          { id: 106, type: 'button', value: 'Read This Week\'s Article', url: 'https://dietwithdee.org/blog' },
          { id: 107, type: 'divider' },
          { id: 108, type: 'paragraph', value: 'If you\'d like personalized guidance tailored to your specific health goals, I offer one-on-one consultations and custom meal plans.' }
        ];
        headerImg = '';
        break;
      case 'announcement':
        sections = [
          { id: 201, type: 'heading', value: 'Exciting News!' },
          { id: 202, type: 'highlight', value: 'We\'re introducing new services to help you reach your health goals' },
          { id: 203, type: 'paragraph', value: 'Based on feedback from our community, we\'ve developed specialized programs for weight loss, diabetes management, and heart health.' },
          { id: 204, type: 'divider' },
          { id: 205, type: 'tip', value: 'Each program includes personalized meal plans and ongoing support.' },
          { id: 206, type: 'button', value: 'Explore Our Programs', url: 'https://dietwithdee.org/services' }
        ];
        headerImg = '';
        break;
      case 'welcome':
        sections = [
          { id: 301, type: 'heading', value: 'Welcome to the Diet With Dee Community!' },
          { id: 302, type: 'paragraph', value: 'I\'m thrilled you\'ve joined us. You\'re now part of a community dedicated to building healthier habits—not complicated diets.' },
          { id: 303, type: 'divider' },
          { id: 304, type: 'tip', value: 'Every week, I share practical nutrition tips, recipes, and lifestyle advice designed to help you feel your best.' },
          { id: 305, type: 'paragraph', value: 'Looking for more personalized support? I offer one-on-one consultations, custom meal plans, and specialized programs for various health conditions.' },
          { id: 306, type: 'button', value: 'Explore What We Offer', url: 'https://dietwithdee.org/services' }
        ];
        headerImg = '';
        break;
    }
    
    setContentSections(sections);
    setNextId(Math.max(...sections.map(s => s.id)) + 1);
    setHeaderImage(headerImg);
    setEmailTemplate({
      ...emailTemplate,
      htmlContent: generateHTML(sections, emailTemplate.subject, headerImg),
      textContent: generatePlainText(sections)
    });
  };

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setView('compose')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            view === 'compose'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ✏️ Compose
        </button>
        <button
          onClick={() => setView('preview')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            view === 'preview'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👁️ Preview
        </button>
      </div>

      {view === 'compose' ? (
        <div className="space-y-4">
          {/* Templates */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-800 mb-2">📋 Start with a branded template:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadTemplate('newsletter')}
                className="px-3 py-1 bg-white border border-orange-300 rounded text-xs hover:bg-orange-50 transition-colors font-medium"
              >
                📰 Newsletter
              </button>
              <button
                onClick={() => loadTemplate('announcement')}
                className="px-3 py-1 bg-white border border-orange-300 rounded text-xs hover:bg-orange-50 transition-colors font-medium"
              >
                📢 Announcement
              </button>
              <button
                onClick={() => loadTemplate('welcome')}
                className="px-3 py-1 bg-white border border-orange-300 rounded text-xs hover:bg-orange-50 transition-colors font-medium"
              >
                👋 Welcome
              </button>
            </div>
          </div>

          {/* Header Image URL */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">🖼️ Header Image URL (optional)</label>
            <input
              type="url"
              placeholder="e.g., https://dietwithdee.org/assets/kitchen.webp"
              value={headerImage}
              onChange={(e) => handleHeaderImageChange(e.target.value)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">Use images from your site assets for brand consistency</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {contentSections.map((section, idx) => (
              <div key={section.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {section.type === 'paragraph' && '📝 Text'}
                    {section.type === 'heading' && '🎯 Heading'}
                    {section.type === 'divider' && '➖ Divider'}
                    {section.type === 'button' && '🔘 Button'}
                    {section.type === 'tip' && '💡 Tip'}
                    {section.type === 'highlight' && '✨ Highlight'}
                  </label>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>

                {section.type === 'divider' ? (
                  <div className="text-xs text-gray-500 py-2">Visual separator with brand colors</div>
                ) : section.type === 'button' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Button text (e.g., 'Learn More')"
                      value={section.value}
                      onChange={(e) => handleSectionChange(section.id, 'value', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="url"
                      placeholder="Button URL"
                      value={section.url || ''}
                      onChange={(e) => handleSectionChange(section.id, 'url', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ) : (
                  <textarea
                    value={section.value}
                    onChange={(e) => handleSectionChange(section.id, 'value', e.target.value)}
                    placeholder={section.type === 'heading' ? 'Enter heading...' : 'Enter text...'}
                    rows={section.type === 'heading' ? 1 : 2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Section Buttons */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Add content:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addSection('heading')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Heading
              </button>
              <button
                onClick={() => addSection('paragraph')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Text
              </button>
              <button
                onClick={() => addSection('button')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Button
              </button>
              <button
                onClick={() => addSection('tip')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Tip
              </button>
              <button
                onClick={() => addSection('highlight')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Highlight
              </button>
              <button
                onClick={() => addSection('divider')}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-orange-50 transition-colors font-medium"
              >
                + Divider
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: emailTemplate.htmlContent
            }}
            className="email-preview"
          />
        </div>
      )}
    </div>
  );
};

export default EmailTemplateBuilder;
