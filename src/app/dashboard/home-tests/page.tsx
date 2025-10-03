
'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Wind, Scale, GlassWater, Brain, Play, Pause, RotateCw, HelpCircle, BrainCircuit, MousePointerClick, Bed } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const tests = [
  { id: 'bmi', name: 'BMI Calculator', icon: Scale },
  { id: 'breathing', name: 'Breathing Exercise', icon: Wind },
  { id: 'heartRate', name: 'Resting Heart Rate', icon: Heart },
  { id: 'waterIntake', name: 'Water Intake Calculator', icon: GlassWater },
  { id: 'mindfulMinute', name: 'Mindful Minute', icon: Brain },
  { id: 'stress', name: 'Stress Level Quiz', icon: BrainCircuit },
  { id: 'reaction', name: 'Reaction Time Test', icon: MousePointerClick },
  { id: 'sleep', name: 'Sleep Quality Calculator', icon: Bed },
];

const saveTestResult = (testId: string, result: any) => {
    try {
        const existingResults = JSON.parse(localStorage.getItem('homeTestResults') || '{}');
        const updatedResults = { ...existingResults, [testId]: result };
        localStorage.setItem('homeTestResults', JSON.stringify(updatedResults));
        window.dispatchEvent(new Event('testResultUpdated'));
    } catch (error) {
        console.error("Failed to save test result", error);
    }
}

export default function HomeTestsPage() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const renderTestContent = () => {
    switch (selectedTest) {
      case 'bmi':
        return <BMICalculator />;
      case 'breathing':
        return <BreathingExercise />;
      case 'heartRate':
        return <HeartRateTest />;
      case 'waterIntake':
        return <WaterIntakeCalculator />;
      case 'mindfulMinute':
        return <MindfulMinute />;
      case 'stress':
        return <StressLevelQuiz />;
      case 'reaction':
        return <ReactionTimeTest />;
      case 'sleep':
        return <SleepQualityCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Home Health Tests</h1>
        <p className="text-muted-foreground">Monitor your wellness with these simple guided tests.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const Icon = test.icon;
          return (
            <Card 
              key={test.id} 
              className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setSelectedTest(test.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{test.name}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      
        {selectedTest && (
          <div>
            <Card className="mt-8 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tests.find(t => t.id === selectedTest)?.name}
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTest(null)}><RotateCw className="w-4 h-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTestContent()}
              </CardContent>
            </Card>
          </div>
        )}
      
    </div>
  );
}

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<{ value: number; category: string } | null>(null);

  const calculateBmi = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      setBmi(null);
      return;
    }

    let bmiValue;
    if (unitSystem === 'metric') {
      // height in cm, weight in kg
      bmiValue = w / ((h / 100) * (h / 100));
    } else {
      // height in inches, weight in lbs
      bmiValue = (w / (h * h)) * 703;
    }

    let category = '';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue < 25) category = 'Normal weight';
    else if (bmiValue < 30) category = 'Overweight';
    else category = 'Obesity';
    
    const result = { value: parseFloat(bmiValue.toFixed(1)), category };
    setBmi(result);
    saveTestResult('bmi', result);
  };

  return (
    <div className="space-y-4">
      <Select value={unitSystem} onValueChange={(val: 'metric' | 'imperial') => setUnitSystem(val)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="metric">Metric (cm, kg)</SelectItem>
          <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
        </SelectContent>
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">Height ({unitSystem === 'metric' ? 'cm' : 'in'})</Label>
          <Input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="weight">Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculateBmi} className="w-full">Calculate BMI</Button>
      {bmi && (
        <CardFooter className="mt-4 p-4 bg-muted rounded-lg flex flex-col items-center">
          <p className="text-sm text-muted-foreground">Your BMI</p>
          <p className="text-4xl font-bold">{bmi.value}</p>
          <p className="text-lg font-semibold">{bmi.category}</p>
        </CardFooter>
      )}
    </div>
  );
}

function BreathingExercise() {
  const STAGES = {
    INHALE: { duration: 4, label: "Breathe In..." },
    HOLD: { duration: 7, label: "Hold" },
    EXHALE: { duration: 8, label: "Breathe Out..." },
  };
  
  const [isRunning, setIsRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STAGES.INHALE.duration);

  const stages = [STAGES.INHALE, STAGES.HOLD, STAGES.EXHALE];
  const currentStage = stages[stageIndex];

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      const nextStageIndex = (stageIndex + 1) % stages.length;
      setStageIndex(nextStageIndex);
      setTimeLeft(stages[nextStageIndex].duration);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, stageIndex, stages]);

  const reset = () => {
    setIsRunning(false);
    setStageIndex(0);
    setTimeLeft(STAGES.INHALE.duration);
  };
  
  const scale = isRunning ? (currentStage.label === STAGES.INHALE.label ? 1.5 : (currentStage.label === STAGES.EXHALE.label ? 0.8 : 1.5) ) : 1;
  const transitionDuration = currentStage.duration;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div 
          className="w-full h-full rounded-full bg-primary/20 transition-transform"
          style={{ transform: `scale(${scale})`, transitionDuration: `${transitionDuration}s`, transitionTimingFunction: 'ease-in-out' }}
        />
        <div className="absolute flex flex-col items-center text-center">
          <p className="text-2xl font-semibold">{currentStage.label}</p>
          <p className="text-5xl font-bold">{timeLeft}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setIsRunning(!isRunning)} size="lg">
          {isRunning ? <Pause className="mr-2"/> : <Play className="mr-2"/>}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={reset} size="lg" variant="outline">
          <RotateCw className="mr-2"/>
          Reset
        </Button>
      </div>
    </div>
  );
}

function HeartRateTest() {
  const DURATION = 15;
  const [beats, setBeats] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      if (isRunning && timeLeft === 0) {
        setIsRunning(false);
        setResult(beats * 4); // 15 seconds * 4 = 60 seconds
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, beats]);

  const startTest = () => {
    setBeats(0);
    setTimeLeft(DURATION);
    setResult(null);
    setIsRunning(true);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-center text-muted-foreground">Place two fingers on your wrist or neck to find your pulse. When ready, press start and count the beats until the timer stops.</p>
      <div className="text-6xl font-bold">{timeLeft}</div>
      <Button onClick={startTest} disabled={isRunning} className="w-full">Start Timer</Button>
      <div className="w-full">
        <Label htmlFor="beats">Number of Beats Counted</Label>
        <Input id="beats" type="number" value={beats} onChange={e => setBeats(parseInt(e.target.value, 10) || 0)} disabled={!isRunning && result === null} />
      </div>
      {result !== null && (
        <CardFooter className="mt-4 p-4 bg-muted rounded-lg flex flex-col items-center">
          <p className="text-sm text-muted-foreground">Your Resting Heart Rate</p>
          <p className="text-4xl font-bold">{result} BPM</p>
        </CardFooter>
      )}
    </div>
  );
}

function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculateWaterIntake = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      setResult(null);
      return;
    }
    // A common recommendation is 30-35 ml of water per kg of body weight.
    const waterInMl = w * 33;
    const waterInLiters = waterInMl / 1000;
    setResult(`${waterInLiters.toFixed(1)} liters (${waterInMl.toFixed(0)} ml)`);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Enter your weight to get a general recommendation for daily water intake.</p>
      <div>
        <Label htmlFor="weight-water">Weight (kg)</Label>
        <Input id="weight-water" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
      </div>
      <Button onClick={calculateWaterIntake} className="w-full">Calculate</Button>
       {result && (
        <CardFooter className="mt-4 p-4 bg-muted rounded-lg flex flex-col items-center">
          <p className="text-sm text-muted-foreground">Recommended Daily Water Intake</p>
          <p className="text-3xl font-bold">{result}</p>
        </CardFooter>
      )}
    </div>
  );
}

function MindfulMinute() {
  const DURATION = 60;
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      if(isRunning && timeLeft === 0) setIsRunning(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft]);

  const start = () => {
    setTimeLeft(DURATION);
    setIsRunning(true);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-center text-muted-foreground">Take a minute to focus on your breath and clear your mind. Press start to begin.</p>
      <div className="text-6xl font-bold">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</div>
      <Button onClick={start} disabled={isRunning} className="w-full">Start Minute</Button>
      {timeLeft === 0 && (
         <p className="font-semibold text-primary">Well done!</p>
      )}
    </div>
  );
}

function StressLevelQuiz() {
  const questions = [
    { id: 'q1', text: 'How often have you felt overwhelmed in the last week?', options: [{ label: 'Never', value: 0 }, { label: 'Sometimes', value: 1 }, { label: 'Often', value: 2 }, { label: 'Almost constantly', value: 3 }] },
    { id: 'q2', text: 'How would you rate your sleep quality recently?', options: [{ label: 'Very Good', value: 0 }, { label: 'Good', value: 1 }, { label: 'Poor', value: 2 }, { label: 'Very Poor', value: 3 }] },
    { id: 'q3', text: 'How often have you felt irritable or short-tempered?', options: [{ label: 'Rarely', value: 0 }, { label: 'Occasionally', value: 1 }, { label: 'Frequently', value: 2 }, { label: 'Most of the time', value: 3 }] },
    { id: 'q4', text: 'How well have you been able to concentrate?', options: [{ label: 'Very well', value: 0 }, { label: 'Fairly well', value: 1 }, { label: 'With difficulty', value: 2 }, { label: 'Not at all', value: 3 }] },
  ];
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; level: string } | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value, 10) }));
  };
  
  const calculateResult = () => {
    if (Object.keys(answers).length !== questions.length) return;
    const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
    let level = '';
    if (score <= 3) level = 'Low';
    else if (score <= 6) level = 'Moderate';
    else if (score <= 9) level = 'High';
    else level = 'Very High';
    
    const newResult = { score, level };
    setResult(newResult);
    saveTestResult('stress', newResult);
  };

  if (result) {
    return (
      <CardFooter className="p-4 bg-muted rounded-lg flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Your Stress Score</p>
        <p className="text-4xl font-bold">{result.score}</p>
        <p className="text-lg font-semibold">Level: {result.level}</p>
        <p className="mt-2 text-sm">This is a general guide. For a proper assessment, please consult a healthcare professional.</p>
        <Button onClick={() => { setAnswers({}); setResult(null); }} className="mt-4">Take Again</Button>
      </CardFooter>
    )
  }
  
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Answer the following questions to get a general idea of your current stress level.</p>
      <div className="space-y-4">
        {questions.map(q => (
          <div key={q.id}>
            <Label className="font-semibold">{q.text}</Label>
            <RadioGroup onValueChange={(val) => handleAnswerChange(q.id, val)} className="mt-2">
              {q.options.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value.toString()} id={`${q.id}-${opt.value}`} />
                  <Label htmlFor={`${q.id}-${opt.value}`}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
      <Button onClick={calculateResult} disabled={Object.keys(answers).length !== questions.length} className="w-full">
        See My Results
      </Button>
    </div>
  )
}

function ReactionTimeTest() {
  type TestState = 'waiting' | 'ready' | 'testing' | 'result';
  const [state, setState] = useState<TestState>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setState('ready');
    const randomDelay = Math.random() * 3000 + 1000; // 1-4 seconds
    timerRef.current = setTimeout(() => {
      setState('testing');
      setStartTime(performance.now());
    }, randomDelay);
  };
  
  const handleTestClick = () => {
    if (state === 'ready') {
      // Clicked too early
      if(timerRef.current) clearTimeout(timerRef.current);
      alert("Too soon! Wait for the color to change.");
      setState('waiting');
    } else if (state === 'testing') {
      const endTime = performance.now();
      setReactionTime(endTime - startTime);
      setState('result');
    } else if (state === 'waiting' || state === 'result') {
      startTest();
    }
  };

  const getTestContent = () => {
    switch(state) {
      case 'waiting':
        return { text: 'Click to Start', color: 'bg-primary/20' };
      case 'ready':
        return { text: 'Wait for green...', color: 'bg-amber-500/30' };
      case 'testing':
        return { text: 'Click!', color: 'bg-green-500/30' };
      case 'result':
        return { text: `${Math.round(reactionTime)} ms\nClick to try again`, color: 'bg-primary/20' };
    }
  };
  
  const { text, color } = getTestContent();

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-center text-muted-foreground">When the box turns green, click it as fast as you can.</p>
      <div 
        className={`w-full h-48 rounded-lg flex items-center justify-center text-center text-2xl font-semibold cursor-pointer transition-colors ${color}`}
        onClick={handleTestClick}
      >
        <span className="whitespace-pre-wrap">{text}</span>
      </div>
      {state === 'result' && (
        <CardFooter className="p-4 bg-muted rounded-lg flex flex-col items-center">
            <p className="text-sm text-muted-foreground">Your Reaction Time</p>
            <p className="text-4xl font-bold">{Math.round(reactionTime)} ms</p>
        </CardFooter>
      )}
    </div>
  );
}

function SleepQualityCalculator() {
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [timeAwake, setTimeAwake] = useState('15');
  const [result, setResult] = useState<{ category: string; hours: number } | null>(null);

  const getSleepCategory = (hours: number): string => {
    if (hours >= 7) return "Good";
    if (hours >= 6) return "Fair";
    return "Needs Improvement";
  };

  const formatHours = (totalHours: number) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  }

  const calculateSleepQuality = () => {
    if (!bedTime || !wakeTime) return;

    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let bedDate = new Date(0);
    bedDate.setHours(bedH, bedM);

    let wakeDate = new Date(0);
    wakeDate.setHours(wakeH, wakeM);

    if (wakeDate.getTime() <= bedDate.getTime()) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    const timeInBedMs = wakeDate.getTime() - bedDate.getTime();
    if(timeInBedMs <= 0) {
        setResult(null);
        return;
    }

    const timeInBedMinutes = timeInBedMs / (1000 * 60);
    const awakeMinutes = parseInt(timeAwake, 10) || 0;
    
    const timeAsleepMinutes = timeInBedMinutes - awakeMinutes;
     if (timeAsleepMinutes <= 0) {
        setResult(null);
        return;
    }

    const hoursAsleep = timeAsleepMinutes / 60;
    const category = getSleepCategory(hoursAsleep);
    
    const newResult = { 
      category,
      hours: hoursAsleep
    };
    setResult(newResult);
    saveTestResult('sleep', newResult);
  };
  
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Enter your sleep times to calculate your sleep quality.</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bed-time">Bedtime</Label>
          <Input id="bed-time" type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="wake-time">Wake-up Time</Label>
          <Input id="wake-time" type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
        </div>
      </div>
       <div>
          <Label htmlFor="time-awake">Time spent awake during night (minutes)</Label>
          <Input id="time-awake" type="number" value={timeAwake} onChange={e => setTimeAwake(e.target.value)} />
        </div>
      <Button onClick={calculateSleepQuality} className="w-full">Calculate Sleep Quality</Button>
      {result && (
        <CardFooter className="mt-4 p-4 bg-muted rounded-lg flex flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">Your Sleep Quality</p>
          <p className="text-3xl font-bold">{result.category}</p>
          <p className="text-lg text-muted-foreground mt-1">You slept for {formatHours(result.hours)}</p>
        </CardFooter>
      )}
    </div>
  );
}
    

    





