
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Calendar, SearchIcon, XCircleIcon, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useJournalEntries from '@/hooks/useJournalEntries';
import { useToast } from '@/hooks/use-toast';

const JournalEntryList = () => {
  const navigate = useNavigate();
  const { entries, deleteEntry } = useJournalEntries();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  const handleEntryClick = (id: string) => {
    navigate(`/journal/${id}`);
  };
  
  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    toast({
      title: "Entry deleted",
      description: "Your journal entry has been deleted successfully.",
    });
    setEntryToDelete(null);
  };
  
  const filteredEntries = entries.filter(entry => 
    entry.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const getMoodEmoji = (mood: string | null | undefined) => {
    if (!mood) return null;
    
    switch(mood) {
      case 'joy': return '😊';
      case 'calm': return '😌';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'stress': return '😰';
      default: return null;
    }
  };
  
  const getMoodColor = (mood: string | null | undefined) => {
    if (!mood) return 'bg-gray-100 text-gray-700';
    
    switch(mood) {
      case 'joy': return 'bg-green-100 text-green-700';
      case 'calm': return 'bg-blue-100 text-blue-700';
      case 'neutral': return 'bg-gray-100 text-gray-700';
      case 'sad': return 'bg-amber-100 text-amber-700';
      case 'stress': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div>
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search journal entries..." 
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setSearchTerm('')}
          >
            <XCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}
      </div>
      
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">No entries found for "{searchTerm}"</p>
              <Button variant="link" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">You haven't created any journal entries yet.</p>
              <Button onClick={() => navigate('/journal/new')}>Create your first entry</Button>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredEntries
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry) => (
              <motion.div 
                key={entry.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="hover:shadow-md transition-shadow border-primary/10 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary/20"></div>
                  <CardContent className="p-4 cursor-pointer" onClick={() => handleEntryClick(entry.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-base">{entry.text.split('\n')[0]}</h3>
                      <div className="flex items-center space-x-2">
                        {entry.mood && (
                          <Badge variant="outline" className={cn("text-xs font-normal", getMoodColor(entry.mood))}>
                            {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{entry.text}</p>
                  </CardContent>
                  <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(entry.timestamp), 'PPP')}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 gap-1"
                        onClick={() => handleEntryClick(entry.id)}
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setEntryToDelete(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
        </motion.div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => entryToDelete && handleDeleteEntry(entryToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JournalEntryList;
