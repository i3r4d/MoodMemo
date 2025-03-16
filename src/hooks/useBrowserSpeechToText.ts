// src/hooks/useBrowserSpeechToText.ts  
import { useState, useEffect } from 'react';  

const useBrowserSpeechToText = () => {  
  const [transcript, setTranscript] = useState('');  
  const [isListening, setIsListening] = useState(false);  

  const startListening = () => {  
    // Add speech-to-text logic here (e.g., using Web Speech API).  
  };  

  const stopListening = () => {  
    // Add logic to stop speech recognition.  
  };  

  return { transcript, isListening, startListening, stopListening };  
};  

export default useBrowserSpeechToText;  
