import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Input from './Input';

interface RegisterUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterUniversityModal: React.FC<RegisterUniversityModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = React.useState(1);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    type: '',
    email: ''
  });

  const handleNext = async () => {
    setIsProcessing(true);
    // Simulate API registration call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep(2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-headline-lg font-bold text-primary">Register University</h2>
                  <p className="text-on-surface-variant">Get your institution synced with ExamSync AI.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  {isProcessing ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                      <div className="text-center">
                        <p className="text-headline-md font-bold text-primary">Verifying Institution</p>
                        <p className="text-on-surface-variant">Connecting to Nigerian University Database...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="University Name" 
                          placeholder="e.g. University of Lagos" 
                          icon="school" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <Input 
                          label="Institution Type" 
                          placeholder="Federal, State, Private" 
                          icon="account_balance" 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                        />
                      </div>
                      <Input 
                        label="Official Email" 
                        placeholder="exams@university.edu.ng" 
                        icon="mail" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                      <div className="bg-primary-container/10 p-4 rounded-2xl flex gap-3 text-body-sm text-primary border border-primary/10">
                        <span className="material-symbols-outlined">info</span>
                        <p>Registering as an institution allows for centralized master timetable uploads and admin analytics.</p>
                      </div>
                      <Button 
                        variant="primary" 
                        className="w-full py-4" 
                        onClick={handleNext}
                        disabled={!formData.name || !formData.email}
                      >
                        Continue to Verification
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-headline-md font-bold text-primary">Request Sent!</h3>
                    <p className="text-on-surface-variant">Our team will contact your institution's exam office within 24 hours.</p>
                  </div>
                  <Button variant="outline" className="w-full py-4" onClick={onClose}>
                    Close Modal
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterUniversityModal;
