
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Brain, Sparkles, Watch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Link } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2 * i,
      },
    }),
  };

  return (
    <AnimatedTransition keyValue="home">
      {/* Hero Section */}
      <section className="pt-12 pb-20 relative overflow-hidden">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300 text-sm font-medium"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            Your personal wellness companion
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
            variants={itemVariants}
          >
            Track Your Mood, Transform Your Life
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Your personal space for emotional well-being, self-reflection, and growth. Discover patterns, gain
            insights, and build healthier habits.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <Button size="lg" className="relative overflow-hidden group" onClick={() => navigate('/journal')}>
              <span className="relative z-10 flex items-center">
                Go to Journal
                <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>

            <Button size="lg" variant="outline" onClick={() => navigate('/insights')}>
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Tools to support your mental wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mood Tracking */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={featureVariants}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-blue-500" />
                  </div>
                  <CardTitle>Mood Tracking</CardTitle>
                  <CardDescription>Record your moods, thoughts, and feelings with easy-to-use tools.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative h-32 mb-4 rounded-md overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-slate-800/50"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white">
                          <span className="text-xs">😊</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                          <span className="text-xs">😐</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white">
                          <span className="text-xs">😔</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Today</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group" onClick={() => navigate('/journal')}>
                    <span>Start Journaling</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={featureVariants}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Get personalized insights and patterns based on your journal entries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative h-32 mb-4 rounded-md overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-slate-800/50"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-4 w-3/4 bg-purple-200 dark:bg-purple-700/30 rounded-full mb-2"></div>
                      <div className="h-4 w-1/2 bg-purple-200 dark:bg-purple-700/30 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group" onClick={() => navigate('/insights')}>
                    <span>View Insights</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Exercises */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={featureVariants}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-green-500" />
                  </div>
                  <CardTitle>Exercises</CardTitle>
                  <CardDescription>
                    Access guided exercises for mindfulness, reflection, and stress reduction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative h-32 mb-4 rounded-md overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-slate-800/50"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="h-3 w-20 bg-green-200 dark:bg-green-700/30 rounded-full"></div>
                        <div className="h-3 w-16 bg-green-200 dark:bg-green-700/30 rounded-full"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700/30 flex items-center justify-center">
                        <span className="text-xs">▶️</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group" onClick={() => navigate('/exercises')}>
                    <span>Try Exercises</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connect Devices Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Connect Your Devices</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Sync your smartwatch or fitness tracker to gain powerful insights into how your physical health affects
                your mood and emotional wellbeing.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Track sleep patterns and their impact on your mood</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Monitor heart rate variability for stress indicators</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Correlate physical activity with emotional wellbeing</span>
                </li>
              </ul>
              <Button size="lg" className="group" onClick={() => navigate('/settings?tab=devices')}>
                <span className="flex items-center">
                  Connect Device
                  <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative z-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="absolute -top-3 -right-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2 shadow-md">
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200">Heart Rate</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-300">
                    <span>72</span>
                    <span className="text-xs">BPM</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Watch className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Connected Device</div>
                    <div className="font-medium">Apple Watch Series 8</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Sleep Quality</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Activity Level</span>
                      <span className="font-medium">Moderate</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Stress Level</span>
                      <span className="font-medium">Low</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Today's Mood Correlation</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white">
                      <span className="text-xs">😊</span>
                    </div>
                    <div className="text-sm font-medium">Your physical activity is positively affecting your mood</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 dark:bg-blue-500/10 rounded-full filter blur-3xl z-0"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-300/20 dark:bg-purple-500/10 rounded-full filter blur-xl z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedTransition>
  );
};

export default Home;
