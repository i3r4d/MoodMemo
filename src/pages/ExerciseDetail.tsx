
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Exercise } from '@/components/ExerciseCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  SkipBack, 
  Volume2, 
  Volume1,
  VolumeX,
  ChevronLeft, 
  BookmarkIcon,
  CheckCircle,
  Timer
} from 'lucide-react';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
  const progressInterval = useRef<number | null>(null);
  
  // Sample exercises data
  const exercises: Exercise[] = [
    {
      id: '1',
      title: 'Deep Breathing',
      description: 'A simple breathing exercise to help reduce stress and anxiety.',
      duration: 5,
      category: 'breathing',
      isPremium: false
    },
    {
      id: '2',
      title: 'Body Scan Meditation',
      description: 'Gradually scan your body for sensations, tension, and relaxation.',
      duration: 10,
      category: 'meditation',
      isPremium: false
    },
    {
      id: '3',
      title: 'Sleep Story: Ocean Waves',
      description: 'Gentle narration with ocean sounds to help you fall asleep.',
      duration: 20,
      category: 'sleep',
      isPremium: true
    },
    {
      id: '4',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and relax different muscle groups to release physical tension.',
      duration: 15,
      category: 'relaxation',
      isPremium: false
    },
    {
      id: '5',
      title: 'Mindful Walking',
      description: 'A guided meditation to practice mindfulness while walking.',
      duration: 10,
      category: 'meditation',
      isPremium: false
    },
    {
      id: '6',
      title: 'Anxiety Relief',
      description: 'Quick techniques to help manage moments of high anxiety.',
      duration: 8,
      category: 'breathing',
      isPremium: true
    },
    {
      id: '7',
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate feelings of goodwill, kindness, and warmth towards others.',
      duration: 12,
      category: 'meditation',
      isPremium: true
    },
    {
      id: '8',
      title: 'Morning Energizer',
      description: 'Start your day with positive energy and mindfulness.',
      duration: 7,
      category: 'meditation',
      isPremium: true
    },
    {
      id: '9',
      title: 'Stress Relief Visualization',
      description: 'Guided visualization to help you reduce stress and find calm.',
      duration: 15,
      category: 'relaxation',
      isPremium: true
    },
    {
      id: '10',
      title: '4-7-8 Breathing Technique',
      description: 'A breathing pattern that promotes relaxation and better sleep.',
      duration: 5,
      category: 'breathing',
      isPremium: false
    }
  ];
  
  // Exercise scripts for each exercise
  const exerciseScripts: Record<string, string[]> = {
    '1': [
      "Find a comfortable position where you can relax fully.",
      "Close your eyes and begin to focus on your breath.",
      "Breathe in slowly through your nose for a count of 4.",
      "Hold your breath for a count of 2.",
      "Exhale slowly through your mouth for a count of 6.",
      "Notice the sensation of your breath entering and leaving your body.",
      "With each exhale, feel yourself becoming more relaxed.",
      "Continue this pattern: inhale for 4, hold for 2, exhale for 6.",
      "If your mind wanders, gently bring your attention back to your breathing.",
      "Allow your breathing to become deeper and more rhythmic."
    ],
    '2': [
      "Find a comfortable position lying down or sitting.",
      "Close your eyes and take a few deep breaths to center yourself.",
      "Begin by bringing your awareness to your feet.",
      "Notice any sensations: warmth, coolness, tingling, or pressure.",
      "Gradually move your attention upward to your calves and knees.",
      "Continue up through your thighs, hips, and lower back.",
      "Bring awareness to your abdomen, chest, and upper back.",
      "Notice your shoulders, arms, and hands.",
      "Finally, bring awareness to your neck, face, and head.",
      "Take a moment to feel your entire body as a whole."
    ],
    '4': [
      "Find a comfortable position where you won't be disturbed.",
      "Take a few deep breaths to center yourself.",
      "Start with your hands. Make tight fists, hold for 5 seconds, then release.",
      "Notice the difference between tension and relaxation.",
      "Move to your arms. Tense your biceps, hold, then release.",
      "Continue with your shoulders. Pull them up to your ears, hold, then release.",
      "Tense your face by squeezing your eyes shut and clenching your jaw.",
      "Move down to your chest and abdomen, tightening these muscles.",
      "Now your legs: tense your thighs, calves, and feet in sequence.",
      "Finally, take a moment to notice how your entire body feels relaxed."
    ],
    '5': [
      "Begin by standing comfortably with your weight balanced on both feet.",
      "Take a few deep breaths and center your awareness.",
      "Start walking slowly, paying attention to each step.",
      "Notice the sensation of your feet touching the ground.",
      "Feel the movement of your legs and the shifting of your weight.",
      "Be aware of your posture and the rhythm of your walking.",
      "If your mind wanders, gently bring it back to the physical sensations.",
      "Notice your surroundings without judgment or detailed analysis.",
      "Feel the air on your skin as you move through space.",
      "Continue walking mindfully, fully present in each step."
    ],
    '10': [
      "Sit or lie in a comfortable position.",
      "Place the tip of your tongue against the roof of your mouth, just behind your front teeth.",
      "Exhale completely through your mouth, making a whoosh sound.",
      "Close your mouth and inhale quietly through your nose to a count of 4.",
      "Hold your breath for a count of 7.",
      "Exhale completely through your mouth, making a whoosh sound, to a count of 8.",
      "This completes one breath cycle. Repeat for a total of 4 breath cycles.",
      "Focus on the counting and the rhythm of your breath.",
      "If your mind wanders, gently bring your focus back to the counting.",
      "Notice how your body feels more relaxed with each cycle."
    ],
    'default': [
      "Find a comfortable position where you can fully relax.",
      "Take a few deep breaths to center yourself.",
      "Focus on the present moment, letting go of any distractions.",
      "Bring your awareness to your body and how it feels right now.",
      "Notice any areas of tension and consciously release them.",
      "Allow your thoughts to come and go without judgment.",
      "Return your focus to your breath whenever your mind wanders.",
      "Feel a sense of peace and calm spreading throughout your body.",
      "Take your time with this practice, there's no rush.",
      "When you're ready, slowly bring your awareness back to your surroundings."
    ]
  };
  
  useEffect(() => {
    // Find the exercise by ID
    const foundExercise = exercises.find(ex => ex.id === id);
    if (foundExercise) {
      setExercise(foundExercise);
    } else {
      toast({
        title: "Exercise Not Found",
        description: "The requested exercise could not be found.",
        variant: "destructive",
      });
      navigate('/exercises');
    }
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [id, navigate, toast]);
  
  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } else {
      // Play
      const totalDuration = exercise ? exercise.duration * 60 : 300; // in seconds
      const step = 100 / totalDuration; // percentage per second
      
      progressInterval.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressInterval.current) {
              window.clearInterval(progressInterval.current);
              progressInterval.current = null;
            }
            setShowCompleted(true);
            return 100;
          }
          const newProgress = prev + step;
          setTimeElapsed(prev => prev + 1);
          return newProgress;
        });
      }, 1000);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
    setShowCompleted(false);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    if (isMuted) {
      setVolume(80);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getCurrentStepIndex = () => {
    if (!exercise) return 0;
    
    const totalDuration = exercise.duration * 60; // in seconds
    const script = exerciseScripts[exercise.id] || exerciseScripts.default;
    const stepDuration = totalDuration / script.length;
    
    return Math.min(Math.floor(timeElapsed / stepDuration), script.length - 1);
  };
  
  const getCurrentStep = () => {
    if (!exercise) return "";
    
    const script = exerciseScripts[exercise.id] || exerciseScripts.default;
    const stepIndex = getCurrentStepIndex();
    
    return script[stepIndex];
  };
  
  return (
    <AnimatedTransition keyValue={`exercise-${id}`}>
      <div className="max-w-4xl mx-auto py-4 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/exercises')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Exercises
        </Button>
        
        {exercise && (
          <>
            <div className="glass-morphism mood-journal-card mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{exercise.title}</h1>
                  <p className="text-muted-foreground mt-1">{exercise.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium flex items-center">
                    <Timer className="h-4 w-4 mr-1" />
                    {exercise.duration} min
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast({
                      title: "Saved",
                      description: "Exercise saved to your favorites.",
                    })}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {showCompleted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg text-center"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Exercise Completed</h2>
                  <p className="text-muted-foreground mb-6">
                    Great job! You've completed the {exercise.title} exercise.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleReset}>
                      Restart Exercise
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/exercises')}
                    >
                      Back to Exercises
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="bg-secondary/10 dark:bg-secondary/5 p-6 rounded-lg mb-6">
                    <p className="text-lg leading-relaxed">{getCurrentStep()}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>{formatTime(timeElapsed)}</span>
                      <span>{formatTime(exercise.duration * 60)}</span>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleReset}
                          disabled={progress === 0}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="lg"
                          className="h-12 w-12 rounded-full p-0"
                          onClick={handlePlay}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-1" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : volume < 50 ? (
                            <Volume1 className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <div className="w-24">
                          <Slider
                            value={[volume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Benefits</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>
                    {exercise.category === 'breathing' ? 
                      'Reduces anxiety and stress levels' : 
                    exercise.category === 'meditation' ?
                      'Improves focus and mental clarity' :
                    exercise.category === 'relaxation' ?
                      'Relieves physical tension and promotes better sleep' :
                      'Helps with insomnia and improves sleep quality'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>
                    {exercise.category === 'breathing' ? 
                      'Activates your parasympathetic nervous system' : 
                    exercise.category === 'meditation' ?
                      'Reduces rumination and negative thought patterns' :
                    exercise.category === 'relaxation' ?
                      'Lowers cortisol levels in the body' :
                      'Regulates your circadian rhythm'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>
                    {exercise.category === 'breathing' ? 
                      'Can be practiced anywhere, anytime' : 
                    exercise.category === 'meditation' ?
                      'Builds emotional resilience over time' :
                    exercise.category === 'relaxation' ?
                      'Improves overall mood and emotional wellbeing' :
                      'Reduces nighttime anxiety'
                    }
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">When to Practice</h2>
              <p className="text-muted-foreground">
                {exercise.category === 'breathing' ? 
                  'This breathing exercise is ideal when feeling stressed, anxious, or overwhelmed. It can be practiced before stressful events, during moments of anxiety, or as part of your daily routine.' : 
                exercise.category === 'meditation' ?
                  'This meditation works well in the morning to set a positive tone for the day, or whenever you need to restore focus and mental clarity. Try to practice in a quiet space where you won\'t be disturbed.' :
                exercise.category === 'relaxation' ?
                  'This relaxation exercise is perfect for evenings to help transition from the busy day or whenever you feel physically tense. It\'s especially effective before bed to promote better sleep.' :
                  'This sleep exercise should be practiced in bed as part of your bedtime routine. Make sure your bedroom is cool, dark, and quiet for optimal results.'
                }
              </p>
            </div>
          </>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default ExerciseDetail;
