import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = 'June 14, 2026';

  const sections = [
    {
      title: '1. Information We Collect',
      icon: 'database',
      content: [
        {
          subtitle: 'Account Information',
          text: 'When you create an ExamSync account, we collect your full name, email address, password (stored securely as a hash), university, faculty, department, academic level, and semester. This information is essential to provide you with a personalized academic schedule.'
        },
        {
          subtitle: 'Academic Data',
          text: 'We collect information about your courses and academic timetable. When you upload a PDF timetable, our AI processes it to extract structured schedule data. Uploaded files are processed and not permanently stored on our servers.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We may collect anonymized usage data such as features used and session duration to improve the platform. We do not track your browsing activity outside of ExamSync.'
        }
      ]
    },
    {
      title: '2. How We Use Your Information',
      icon: 'settings',
      content: [
        {
          subtitle: 'Core Service Delivery',
          text: 'Your information is used to deliver your personalized academic schedule, send you important notifications about your courses, and provide AI-powered features tailored to your academic profile.'
        },
        {
          subtitle: 'Email Communications',
          text: 'We use your email address to send verification codes for account creation and password resets, and for important platform notifications. We do not send unsolicited marketing emails.'
        },
        {
          subtitle: 'Platform Improvement',
          text: 'Anonymized, aggregated data about course names and faculty structures may be used to improve our crowdsourced academic database, helping other students at your institution.'
        }
      ]
    },
    {
      title: '3. Data Sharing & Disclosure',
      icon: 'share',
      content: [
        {
          subtitle: 'We Do Not Sell Your Data',
          text: 'ExamSync does not sell, rent, or trade your personal information to third parties for commercial purposes. Your data is yours.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We use trusted third-party services: Google Firebase (secure database and authentication), Brevo (email delivery), and Google Gemini AI (PDF parsing and chat). Each provider is bound by strict data processing agreements.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law or in good faith belief that such disclosure is necessary to comply with legal obligations, protect the rights of ExamSync, or protect the safety of users.'
        }
      ]
    },
    {
      title: '4. Data Security',
      icon: 'security',
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data is transmitted over HTTPS/TLS encryption. Passwords are never stored in plain text — they are securely hashed using Firebase Authentication\'s industry-standard protocols.'
        },
        {
          subtitle: 'Access Controls',
          text: 'Access to your personal data is strictly limited. Only you can access your account data. Our admin system requires separate, hardened credentials and is not accessible to regular users.'
        },
        {
          subtitle: 'OTP Verification',
          text: 'All account creation and password reset operations require a 6-digit One-Time Password (OTP) sent to your registered email, providing an additional layer of security.'
        }
      ]
    },
    {
      title: '5. Your Rights',
      icon: 'gavel',
      content: [
        {
          subtitle: 'Access & Portability',
          text: 'You have the right to access all personal data we hold about you. You can view and update your information at any time through your Profile settings page.'
        },
        {
          subtitle: 'Deletion',
          text: 'You have the right to delete your account and all associated data at any time. You can do this from Settings → Delete Account. This action is permanent and irreversible.'
        },
        {
          subtitle: 'Correction',
          text: 'If any of your personal information is inaccurate, you can update it at any time through the Profile settings page.'
        }
      ]
    },
    {
      title: '6. Cookies & Storage',
      icon: 'cookie',
      content: [
        {
          subtitle: 'Local Storage',
          text: 'ExamSync uses browser local storage to remember your authentication session and theme preference (Light, Dark, or Ocean). No third-party advertising cookies are used.'
        },
        {
          subtitle: 'Session Management',
          text: 'Your login session is managed by Firebase Authentication tokens. These expire automatically and are refreshed securely without requiring you to re-enter your password.'
        }
      ]
    },
    {
      title: '7. Children\'s Privacy',
      icon: 'child_care',
      content: [
        {
          subtitle: 'Age Requirement',
          text: 'ExamSync is designed for university students and is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.'
        }
      ]
    },
    {
      title: '8. Changes to This Policy',
      icon: 'update',
      content: [
        {
          subtitle: 'Notification of Changes',
          text: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or by posting a prominent notice on the platform. Your continued use of ExamSync after changes become effective constitutes your acceptance of the updated policy.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* Header */}
      <div className="bg-surface-card border-b border-outline/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-surface-container hover:bg-outline/10 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[14px]">shield</span>
            </div>
            <span className="font-bold text-on-surface">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface mb-3">Privacy Policy</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            Your privacy matters to us. This policy explains what data ExamSync collects, how we use it, and how we protect it.
          </p>
          <p className="text-sm text-on-surface-variant/60 mt-3">Last updated: {lastUpdated}</p>
        </motion.div>

        {/* Intro card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">info</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface mb-1">Our Commitment</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                ExamSync ("we", "us", or "our") is committed to protecting your personal information. We operate under strict data protection principles and only collect what is necessary to provide you with the best academic scheduling experience. By using ExamSync, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-surface-card border border-outline/10 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 p-6 border-b border-outline/10 bg-outline/5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">{section.icon}</span>
                </div>
                <h2 className="font-bold text-on-surface text-lg">{section.title}</h2>
              </div>
              <div className="p-6 space-y-5">
                {section.content.map((item, j) => (
                  <div key={j}>
                    <h3 className="font-bold text-on-surface text-sm mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.subtitle}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed pl-3.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 bg-surface-card border border-outline/10 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-on-surface mb-2">Questions about this policy?</h3>
          <p className="text-sm text-on-surface-variant mb-4">Contact us at any time and we'll respond within 48 hours.</p>
          <a href="mailto:examsyncuni@gmail.com"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            examsyncuni@gmail.com
          </a>
        </motion.div>

        <p className="text-center text-xs text-on-surface-variant/40 mt-8">
          © {new Date().getFullYear()} ExamSync · Built by Glory Adeniran · University of Ilorin
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
