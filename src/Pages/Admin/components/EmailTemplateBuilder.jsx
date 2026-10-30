import React, { useState } from 'react';
import { Bold, Italic, Type, Image, Phone, Plus, Sparkles, Lightbulb, Link as LinkIcon, Minus } from 'lucide-react';

const EmailTemplateBuilder = ({ emailTemplate, setEmailTemplate, showNotification }) => {
  const [view, setView] = useState('compose'); // 'compose' or 'preview'
  const [contentSections, setContentSections] = useState([
    { id: 1, type: 'heading', value: 'Fresh Nutrition Insights This Week' },
    { id: 2, type: 'paragraph', value: 'Welcome to this week\'s edition of DietWithDee. Practical, sustainable tips for living well with Ghanaian foods you actually love.' }
  ]);
  const [nextId, setNextId] = useState(3);
  const [headerImage, setHeaderImage] = useState('');

  // Signature DietWithDee Brand Colors
  const brandColors = {
    primary: '#F6841F',       // Signature Orange
    primaryDark: '#e07312',
    secondary: '#166534',     // Forest Green
    secondaryLight: '#15803d',
    background: '#FAF9F6',    // Warm Alabaster Canvas
    cardBg: '#ffffff',
    text: '#1c1917',          // Stone 900
    subtext: '#44403c',       // Stone 700
    lightText: '#78716c',     // Stone 500
    border: '#e7e5e4',        // Stone 200
    tipBg: '#fffbeb',         // Amber 50
    tipBorder: '#F6841F',
    highlightBg: '#f0fdf4',   // Emerald 50
    highlightBorder: '#166534'
  };

  // Generate Email HTML with brand fonts & pill buttons
  const generateHTML = (sections, subject, headerImg) => {
    const sectionHtmls = sections.map(section => {
      switch (section.type) {
        case 'heading':
          return `
            <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; color: ${brandColors.text}; font-size: 28px; font-weight: 700; line-height: 1.25; margin-bottom: 18px; margin-top: 6px; letter-spacing: -0.02em;">
              ${section.value}
            </h2>
          `;
        case 'paragraph':
          return `
            <p style="font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: ${brandColors.subtext}; font-size: 15px; line-height: 1.75; margin-bottom: 20px; margin-top: 0; font-weight: 400;">
              ${section.value}
            </p>
          `;
        case 'divider':
          return `
            <div style="height: 1px; background-color: ${brandColors.border}; margin: 28px 0;"></div>
          `;
        case 'button':
          return `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto; text-align: center;">
              <tr>
                <td align="center" style="border-radius: 50px; background-color: ${brandColors.primary};">
                  <a href="${section.url || 'https://dietwithdee.org'}" target="_blank" rel="noopener noreferrer" style="font-family: 'Montserrat', Arial, sans-serif; display: inline-block; background-color: ${brandColors.primary}; color: #ffffff !important; padding: 14px 34px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(246, 132, 31, 0.35); text-align: center; border: 1px solid ${brandColors.primary}; mso-padding-alt: 0;">
                    ${section.value || 'Learn More'} &rarr;
                  </a>
                </td>
              </tr>
            </table>
          `;
        case 'tip':
          return `
            <div style="background-color: ${brandColors.tipBg}; border-left: 4px solid ${brandColors.tipBorder}; padding: 18px 22px; margin-bottom: 24px; border-radius: 8px;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; color: #92400e; margin: 0; font-weight: 600; font-size: 14px; line-height: 1.6;">
                <span style="font-size: 16px; margin-right: 6px;">💡</span> ${section.value}
              </p>
            </div>
          `;
        case 'highlight':
          return `
            <div style="background-color: ${brandColors.highlightBg}; border: 1px solid #bbf7d0; border-left: 4px solid ${brandColors.highlightBorder}; padding: 18px 22px; border-radius: 8px; margin-bottom: 24px;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; color: ${brandColors.highlightBorder}; margin: 0; font-weight: 600; font-size: 14px; line-height: 1.6;">
                <span style="margin-right: 6px;">✨</span> ${section.value}
              </p>
            </div>
          `;
        default:
          return '';
      }
    }).filter(Boolean).join('');

    const headerImageHtml = headerImg 
      ? `<div style="padding: 0 24px 16px;"><img src="${headerImg}" alt="Header" style="width: 100%; height: auto; max-height: 280px; object-fit: cover; display: block; border-radius: 16px;" /></div>` 
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject || 'DietWithDee Newsletter'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: ${brandColors.background};
    }
    h1, h2, h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    .cta-btn:hover {
      background-color: ${brandColors.primaryDark} !important;
    }
  </style>
</head>
<body style="font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: ${brandColors.background}; margin: 0; padding: 30px 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${brandColors.background};">
    <tr>
      <td align="center">
        <div style="background: #ffffff; max-width: 600px; width: 100%; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid ${brandColors.border}; text-align: left;">
          
          <!-- Top Accent Bar -->
          <div style="height: 5px; background: linear-gradient(90deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%);"></div>
          
          <!-- Logo & Brand Header -->
          <div style="background: #ffffff; padding: 36px 30px 24px; text-align: center; border-bottom: 1px solid #f5f5f4;">
            <a href="https://dietwithdee.org" style="text-decoration: none; display: inline-block;">
              <img src="https://dietwithdee.org/LOGO.png" alt="DietWithDee" style="width: 120px; max-width: 100%; margin: 0 auto 10px; display: block;" />
              <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 700; color: ${brandColors.secondary}; display: block; letter-spacing: 0.5px;">DietWithDee</span>
            </a>
            <div style="font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${brandColors.lightText}; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px;">
              Clinical Nutrition & Healthy Living • Nana Ama Dwamena, RD
            </div>
          </div>

          <!-- Header Image if present -->
          ${headerImageHtml}
          
          <!-- Main Content -->
          <div style="padding: 36px 36px 20px;">
            ${sectionHtmls}
          </div>
          
          <!-- Footer -->
          <div style="background: #fafaf9; padding: 36px 30px; text-align: center; border-top: 1px solid #f5f5f4;">
            <p style="font-family: 'Cormorant Garamond', Georgia, serif; color: ${brandColors.text}; font-size: 18px; font-weight: 700; margin: 0 0 6px;">DietWithDee</p>
            <p style="font-family: 'Montserrat', Arial, sans-serif; color: ${brandColors.lightText}; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
              Helping you build sustainable health habits and nourish your body with authentic local meals.
            </p>
            <div style="font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; margin: 16px 0;">
              <a href="https://dietwithdee.org/plans" style="color: ${brandColors.secondary}; font-weight: 600; text-decoration: none; margin: 0 8px;">Meal Plans</a> &bull;
              <a href="https://dietwithdee.org/services" style="color: ${brandColors.secondary}; font-weight: 600; text-decoration: none; margin: 0 8px;">Consultations</a> &bull;
              <a href="https://dietwithdee.org/ontrack" style="color: ${brandColors.primary}; font-weight: 600; text-decoration: none; margin: 0 8px;">OnTrack App</a> &bull;
              <a href="https://dietwithdee.org/blog" style="color: ${brandColors.secondary}; font-weight: 600; text-decoration: none; margin: 0 8px;">Blog</a>
            </div>
            <p style="font-family: 'Montserrat', Arial, sans-serif; color: #a8a29e; font-size: 11px; margin: 16px 0 0; line-height: 1.6;">
              &copy; ${new Date().getFullYear()} DietWithDee. All rights reserved. &bull; Accra, Ghana<br>
              <a href="https://dietwithdee.org/unsubscribe" style="color: ${brandColors.lightText}; text-decoration: underline; margin-top: 8px; display: inline-block;">Unsubscribe from newsletter</a>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  // Generate plain text version
  const generatePlainText = (sections) => {
    return sections.map(section => {
      switch (section.type) {
        case 'heading':
          return `\n${section.value.toUpperCase()}\n${'='.repeat(section.value.length)}\n`;
        case 'paragraph':
          return section.value + '\n';
        case 'divider':
          return '\n---\n';
        case 'button':
          return `\n>> ${section.value}: ${section.url || 'https://dietwithdee.org'}\n`;
        case 'tip':
          return `\n[TIP] ${section.value}\n`;
        case 'highlight':
          return `\n[NOTE] ${section.value}\n`;
        default:
          return '';
      }
    }).join('\n');
  };

  const handleSectionChange = (id, field, value) => {
    setContentSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
    
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

  // Pre-built branded templates using our fonts and pill buttons
  const loadTemplate = (templateType) => {
    let sections = [];
    let headerImg = '';
    let subject = emailTemplate.subject;
    
    switch (templateType) {
      case 'newsletter':
        subject = subject || 'Practical Nutrition Tips That Stick • DietWithDee';
        sections = [
          { id: 101, type: 'heading', value: 'Practical Ghanaian Nutrition That Sticks' },
          { id: 102, type: 'paragraph', value: 'Hi there! Eating well shouldn’t mean abandoning the foods that make you feel at home. This week, we explore how simple portion balance with local Ghanaian staples can stabilize your energy throughout the day.' },
          { id: 103, type: 'divider' },
          { id: 104, type: 'tip', value: 'Pairing carbohydrates like plantain or yam with fiber-rich greens and protein slows down digestion and stops energy crashes.' },
          { id: 105, type: 'paragraph', value: 'Whether you’re managing blood sugar, working toward gentle weight loss, or seeking better digestion, these practical principles apply to your every meal.' },
          { id: 106, type: 'button', value: 'Read This Week\'s Article', url: 'https://dietwithdee.org/blog' },
          { id: 107, type: 'divider' },
          { id: 108, type: 'highlight', value: 'Looking for 1-on-1 personalized guidance? Nana Ama Dwamena offers clinical dietitian consultations and custom meal blueprints.' },
          { id: 109, type: 'button', value: 'Explore Nutrition Plans', url: 'https://dietwithdee.org/plans' }
        ];
        break;

      case 'announcement':
        subject = subject || 'Exciting News: DietWithDee × OnTrack Partnership';
        sections = [
          { id: 201, type: 'heading', value: 'Exciting News from DietWithDee!' },
          { id: 202, type: 'highlight', value: 'Official Health & Technology Partnership with OnTrack App' },
          { id: 203, type: 'paragraph', value: 'We are thrilled to officially partner with OnTrack—the leading AI-powered diabetes and blood sugar companion! You can now pair DietWithDee’s culturally-tailored meal blueprints with real-time glucose logging, insulin insights, and direct dietitian sync.' },
          { id: 204, type: 'divider' },
          { id: 205, type: 'tip', value: 'OnTrack is available now on both iOS App Store and Google Play Store for seamless daily tracking.' },
          { id: 206, type: 'button', value: 'Discover the OnTrack Program', url: 'https://dietwithdee.org/ontrack' }
        ];
        break;

      case 'welcome':
        subject = subject || 'Welcome to the DietWithDee Family! 🌿';
        sections = [
          { id: 301, type: 'heading', value: 'Welcome to the DietWithDee Community! 🌿' },
          { id: 302, type: 'paragraph', value: 'I’m so thrilled you’ve joined us! You’re now part of an inspiring community dedicated to building healthier habits with authentic, nourishing meals—never starvation.' },
          { id: 303, type: 'divider' },
          { id: 304, type: 'tip', value: 'Reply directly to this email with your #1 health or nutrition goal right now—I personally read and reply to every message!' },
          { id: 305, type: 'paragraph', value: 'Ready to take the next step on your wellness journey? Explore our structured meal guides designed specifically for Ghanaian staples.' },
          { id: 306, type: 'button', value: 'Explore Our Meal Plans', url: 'https://dietwithdee.org/plans' }
        ];
        break;
    }
    
    setContentSections(sections);
    setNextId(Math.max(...sections.map(s => s.id)) + 1);
    setHeaderImage(headerImg);
    setEmailTemplate({
      ...emailTemplate,
      subject,
      htmlContent: generateHTML(sections, subject, headerImg),
      textContent: generatePlainText(sections)
    });

    if (showNotification) {
      showNotification(`Loaded ${templateType} template with signature fonts and buttons!`, 'success');
    }
  };

  return (
    <div className="space-y-4 font-montserrat">
      {/* View Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setView('compose')}
          className={`px-4 py-2 font-semibold text-sm transition-colors cursor-pointer ${
            view === 'compose'
              ? 'text-[#F6841F] border-b-2 border-[#F6841F]'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          ✍️ Compose
        </button>
        <button
          onClick={() => {
            setView('preview');
            // Ensure HTML is fresh
            setEmailTemplate({
              ...emailTemplate,
              htmlContent: generateHTML(contentSections, emailTemplate.subject, headerImage),
              textContent: generatePlainText(contentSections)
            });
          }}
          className={`px-4 py-2 font-semibold text-sm transition-colors cursor-pointer ${
            view === 'preview'
              ? 'text-[#F6841F] border-b-2 border-[#F6841F]'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          👁️ Preview
        </button>
      </div>

      {view === 'compose' ? (
        <div className="space-y-4">
          {/* Branded Template Selector */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-2.5">
              📋 Start with a signature branded template:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => loadTemplate('newsletter')}
                className="px-4 py-1.5 bg-white border border-orange-300 rounded-full text-xs hover:bg-[#F6841F] hover:text-white hover:border-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer"
              >
                📰 Weekly Newsletter
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('announcement')}
                className="px-4 py-1.5 bg-white border border-orange-300 rounded-full text-xs hover:bg-[#F6841F] hover:text-white hover:border-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer"
              >
                📢 Partnership Announcement
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('welcome')}
                className="px-4 py-1.5 bg-white border border-orange-300 rounded-full text-xs hover:bg-[#F6841F] hover:text-white hover:border-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer"
              >
                🌿 Welcome Community Email
              </button>
            </div>
          </div>

          {/* Header Image URL */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 block">
              🖼️ Optional Header Image URL
            </label>
            <input
              type="url"
              placeholder="e.g., https://dietwithdee.org/assets/salad.webp"
              value={headerImage}
              onChange={(e) => handleHeaderImageChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6841F] focus:border-transparent transition-all placeholder:text-stone-400"
            />
            <p className="text-[11px] text-stone-500 mt-1.5">
              Displays at the top of the email below the brand logo with rounded corners.
            </p>
          </div>

          {/* Content Sections Editor */}
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {contentSections.map((section) => (
              <div key={section.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {section.type === 'heading' && '🎯 Heading (Cormorant Garamond)'}
                    {section.type === 'paragraph' && '📝 Body Text (Montserrat)'}
                    {section.type === 'button' && '🔘 Pill Button (Signature Orange)'}
                    {section.type === 'tip' && '💡 Tip Box (Amber)'}
                    {section.type === 'highlight' && '✨ Highlight Box (Emerald)'}
                    {section.type === 'divider' && '➖ Subtle Divider'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                {section.type === 'divider' ? (
                  <div className="text-xs text-stone-500 py-1">Subtle horizontal line separator</div>
                ) : section.type === 'button' ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Button text (e.g., 'View Our Plans')"
                      value={section.value}
                      onChange={(e) => handleSectionChange(section.id, 'value', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6841F]"
                    />
                    <input
                      type="url"
                      placeholder="Button URL (e.g., 'https://dietwithdee.org/plans')"
                      value={section.url || ''}
                      onChange={(e) => handleSectionChange(section.id, 'url', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6841F]"
                    />
                  </div>
                ) : (
                  <textarea
                    value={section.value}
                    onChange={(e) => handleSectionChange(section.id, 'value', e.target.value)}
                    placeholder={section.type === 'heading' ? 'Enter heading text...' : 'Enter message text...'}
                    rows={section.type === 'heading' ? 1 : 3}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6841F] resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Section Buttons */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              ➕ Add Content Block:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => addSection('heading')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Heading
              </button>
              <button
                type="button"
                onClick={() => addSection('paragraph')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Text
              </button>
              <button
                type="button"
                onClick={() => addSection('button')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Pill Button
              </button>
              <button
                type="button"
                onClick={() => addSection('tip')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Tip Box
              </button>
              <button
                type="button"
                onClick={() => addSection('highlight')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Highlight Box
              </button>
              <button
                type="button"
                onClick={() => addSection('divider')}
                className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-full hover:border-[#F6841F] hover:text-[#F6841F] transition-all font-semibold shadow-xs cursor-pointer text-center"
              >
                + Divider
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Live Preview Pane */
        <div className="bg-stone-100/70 border border-stone-200 rounded-2xl p-4 sm:p-6 max-h-[640px] overflow-auto shadow-inner">
          <div
            dangerouslySetInnerHTML={{
              __html: emailTemplate.htmlContent || generateHTML(contentSections, emailTemplate.subject, headerImage)
            }}
            className="email-preview mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default EmailTemplateBuilder;
