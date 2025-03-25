
import React from 'react';
import { useNavigate } from 'react-router-dom';
import JournalEntryList from '@/components/JournalEntryList';
import AnimatedTransition from '@/components/AnimatedTransition';
import JournalStorageNotice from '@/components/JournalStorageNotice';
import { Button } from '@/components/ui/button';
import { Edit, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Journal = () => {
  const navigate = useNavigate();
  
  const handleNewEntry = () => {
    navigate('/journal/new');
  };

  return (
    <AnimatedTransition keyValue="journal">
      <div className="max-w-4xl mx-auto py-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Journal</h1>
            <p className="text-muted-foreground mt-1">
              Record your thoughts, feelings, and experiences
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button onClick={handleNewEntry} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </motion.div>
        </div>
        
        <JournalStorageNotice className="mb-6" />
        
        <JournalEntryList />
      </div>
    </AnimatedTransition>
  );
};

export default Journal;
