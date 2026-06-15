import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = 'June 14, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      icon: 'handshake',
      content: [
        {
          subtitle: 'Agreement',
          text: 'By accessing or using ExamSync ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. These Terms apply to all users of ExamSync, including students, class representatives, and any other users.'
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 13 years old and a currently enrolled or recently graduated university student to use ExamSync. By using the Service, you represent and warrant that you meet these eligibility requirements.'
        }
      ]
    },
    {
      title: '2. Description of Service',
      icon: 'description',
      content: [
        {
          subtitle: 'What ExamSync Provides',
          text: 'ExamSync is an academic scheduling platform that helps university students manage their lecture and exam timetables. The Service includes AI-powered PDF timetable extraction, personalized schedule management, course filtering, and smart notifications.'
        },
        {
          subtitle: 'Service Availability',
          text: 'We strive to provide 24/7 availability but do not guarantee uninterrupted access. We may perform scheduled maintenance, updates, or experience unexpected outages. We will make reasonable efforts to notify users of planned downtime.'
        },
        {
          subtitle: 'Free Tier',
          text: 'ExamSync is currently provided free of charge to university students. We reserve the right to introduce premium features or subscription tiers in the future, with adequate notice to existing users.'
        }
      ]
    },
    {
      title: '3. User Accounts',
      icon: 'manage_accounts',
      content: [
        {
          subtitle: 'Account Responsibility',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at examsyncuni@gmail.com if you suspect any unauthorized use of your account.'
        },
        {
          subtitle: 'Accurate Information',
          text: 'You agree to provide accurate, current, and complete information during registration and to update such information as necessary. ExamSync reserves the right to suspend accounts with false or misleading information.'
        },
        {
          subtitle: 'One Account Per Person',
          text: 'Each person may only maintain one active ExamSync account. Creating multiple accounts to circumvent restrictions or bans is prohibited and may result in permanent suspension.'
        }
      ]
    },
    {
      title: '4. Acceptable Use',
      icon: 'verified_user',
      content: [
        {
          subtitle: 'Permitted Use',
          text: 'ExamSync is intended solely for personal, non-commercial academic use. You may use the Service to manage your own academic schedule, upload your legitimate university timetables, and collaborate with classmates through approved features.'
        },
        {
          subtitle: 'Prohibited Activities',
          text: 'You agree not to: (a) upload content you do not have the right to share; (b) attempt to reverse-engineer or tamper with the platform; (c) use automated scripts to access the Service; (d) harass, abuse, or harm other users; (e) use the Service for any unlawful purpose; (f) attempt to gain unauthorized administrative access.'
        },
        {
          subtitle: 'Content Standards',
          text: 'Any content you submit (including course names, corrections, or comments) must be accurate, relevant, and respectful. Submitting false academic data that misleads other students is a serious violation of these Terms.'
        }
      ]
    },
    {
      title: '5. AI Features & Accuracy',
      icon: 'smart_toy',
      content: [
        {
          subtitle: 'AI-Powered Extraction',
          text: 'ExamSync uses Google Gemini AI to parse PDF timetables. While we strive for accuracy, AI-extracted data may contain errors. You are responsible for verifying the accuracy of your extracted schedule and not relying solely on AI-generated data for critical academic decisions.'
        },
        {
          subtitle: 'No Academic Guarantee',
          text: 'ExamSync does not guarantee the accuracy of timetable information. Always cross-reference your schedule with your institution\'s official academic calendar and direct communications from your lecturers.'
        }
      ]
    },
    {
      title: '6. Intellectual Property',
      icon: 'copyright',
      content: [
        {
          subtitle: 'Our Rights',
          text: 'ExamSync and all its original content, features, and functionality are owned by Glory Adeniran and are protected by applicable intellectual property laws. The ExamSync name, logo, and design are proprietary and may not be used without express written permission.'
        },
        {
          subtitle: 'Your Content',
          text: 'You retain all rights to your personal academic data. By using ExamSync, you grant us a limited, non-exclusive license to process and store your data solely for the purpose of providing the Service to you.'
        },
        {
          subtitle: 'University Timetables',
          text: 'Academic timetables you upload may be the intellectual property of your institution. You represent that you have the right to use such materials for personal academic scheduling purposes.'
        }
      ]
    },
    {
      title: '7. Termination',
      icon: 'block',
      content: [
        {
          subtitle: 'Termination by You',
          text: 'You may delete your account at any time through Settings → Delete Account. Upon deletion, all your personal data will be permanently removed from our systems within 30 days.'
        },
        {
          subtitle: 'Termination by Us',
          text: 'We reserve the right to suspend or terminate your account without prior notice if you violate these Terms, engage in fraudulent activity, or if continued access poses a risk to other users or the platform.'
        },
        {
          subtitle: 'Effect of Termination',
          text: 'Upon termination, your right to use the Service immediately ceases. All data associated with your account will be deleted. Provisions of these Terms that by their nature should survive termination shall remain in effect.'
        }
      ]
    },
    {
      title: '8. Disclaimers & Limitation of Liability',
      icon: 'info',
      content: [
        {
          subtitle: 'Disclaimer of Warranties',
          text: 'ExamSync is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be error-free, secure, or available at all times.'
        },
        {
          subtitle: 'Limitation of Liability',
          text: 'To the maximum extent permitted by law, ExamSync shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Service — including missed exams or academic deadlines due to inaccurate schedule data.'
        }
      ]
    },
    {
      title: '9. Changes to Terms',
      icon: 'update',
      content: [
        {
          subtitle: 'Modifications',
          text: 'We reserve the right to modify these Terms at any time. When we make significant changes, we will notify users via email or a prominent in-app notice at least 7 days before the changes take effect. Your continued use after the effective date constitutes acceptance of the updated Terms.'
        }
      ]
    },
    {
      title: '10. Governing Law',
      icon: 'balance',
      content: [
        {
          subtitle: 'Jurisdiction',
          text: 'These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of ExamSync shall be resolved in the courts of Nigeria.'
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
            <div className="w-7 h-7 rounded-lg bg-secondary-container/30 border border-secondary-container/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container text-[14px]">gavel</span>
            </div>
            <span className="font-bold text-on-surface">Terms of Service</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/30 px-3 py-1 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary-container" />
            <span className="text-xs font-bold text-secondary-container uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface mb-3">Terms of Service</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            Please read these terms carefully before using ExamSync. They govern your use of the platform and our obligations to you.
          </p>
          <p className="text-sm text-on-surface-variant/60 mt-3">Last updated: {lastUpdated} · Effective immediately</p>
        </motion.div>

        {/* Quick summary card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-card border border-outline/10 rounded-2xl p-6 mb-10">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            TL;DR — The Short Version
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', title: 'You can', items: ['Use ExamSync for free', 'Upload your timetables', 'Share schedules with classmates', 'Delete your account anytime'] },
              { icon: 'cancel', color: 'text-error', bg: 'bg-error/10', border: 'border-error/20', title: "You can't", items: ['Sell or resell the service', 'Create multiple accounts', 'Submit false academic data', 'Attempt to hack the platform'] },
              { icon: 'info', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', title: 'We promise', items: ['Never sell your data', 'Keep your info secure', 'Notify you of big changes', 'Respond to issues within 48h'] },
            ].map((col, i) => (
              <div key={i} className={`${col.bg} border ${col.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-symbols-outlined ${col.color} text-[18px]`}>{col.icon}</span>
                  <span className={`font-bold text-sm ${col.color}`}>{col.title}</span>
                </div>
                <ul className="space-y-1.5">
                  {col.items.map((item, j) => (
                    <li key={j} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Full sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="bg-surface-card border border-outline/10 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 p-6 border-b border-outline/10 bg-outline/5">
                <div className="w-9 h-9 rounded-lg bg-secondary-container/20 border border-secondary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-container text-[18px]">{section.icon}</span>
                </div>
                <h2 className="font-bold text-on-surface text-lg">{section.title}</h2>
              </div>
              <div className="p-6 space-y-5">
                {section.content.map((item, j) => (
                  <div key={j}>
                    <h3 className="font-bold text-on-surface text-sm mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-10 bg-surface-card border border-outline/10 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-on-surface mb-2">Questions about these Terms?</h3>
          <p className="text-sm text-on-surface-variant mb-4">We're happy to clarify anything. Reach out and we'll get back to you within 48 hours.</p>
          <a href="mailto:examsyncuni@gmail.com"
            className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
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

export default TermsOfService;
