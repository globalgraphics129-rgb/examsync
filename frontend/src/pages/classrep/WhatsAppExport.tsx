import { motion } from 'framer-motion';
import { useExamStore } from '../../store/examStore';
import { WAMessageBuilder } from '../../components/whatsapp/WAMessageBuilder';
import PhoneMockup from '../../components/whatsapp/PhoneMockup';
import Button from '../../components/ui/Button';

const WhatsAppExportPage = () => {
  const { exams } = useExamStore();
  const waMessage = WAMessageBuilder.buildTimetableMessage(exams, '2025/2026 Session');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(waMessage);
    alert('Message copied to clipboard! You can now paste it into your WhatsApp group.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <section className="space-y-1">
        <h1 className="text-display-lg-mobile md:text-headline-lg font-display-lg text-primary tracking-tight">WhatsApp Export</h1>
        <p className="text-on-surface-variant">Generate a formatted message to broadcast the timetable to your classmates.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-surface-variant space-y-6">
            <h3 className="font-bold text-headline-md text-primary">Message Preview</h3>
            <div className="bg-surface-container-low p-6 rounded-2xl font-mono text-xs whitespace-pre-wrap h-[400px] overflow-y-auto border border-surface-variant">
              {waMessage}
            </div>
            <Button variant="primary" icon="content_copy" className="w-full py-5" onClick={copyToClipboard}>
              Copy to Clipboard
            </Button>
          </div>

          <div className="bg-primary-container p-8 rounded-[2rem] text-on-primary-container space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">info</span>
              <h4 className="font-bold">Formatting Tips</h4>
            </div>
            <ul className="space-y-2 text-body-sm opacity-80 list-disc ml-6">
              <li>Bold text (*word*) is used for course codes and titles.</li>
              <li>Italics (_word_) are used for the footer.</li>
              <li>Type icons help distinguish between CBT and Written exams.</li>
            </ul>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center">
          <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-8">Live Mobile Preview</p>
          <PhoneMockup message={waMessage} />
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppExportPage;
