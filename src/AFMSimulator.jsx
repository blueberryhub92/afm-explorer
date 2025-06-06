import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, Cell } from 'recharts';

const AFMSimulator = () => {
  const [theta, setTheta] = useState(0.0);
  const [beta, setBeta] = useState(0.0);
  const [gamma, setGamma] = useState(0.3);
  const [practice, setPractice] = useState(5);
  const [practiceCount, setPracticeCount] = useState(5);
  const [responseLog, setResponseLog] = useState([]);
  const [highlightedParams, setHighlightedParams] = useState({});

  const calcProb = (theta, beta, gamma, practice) => {
    const logit = theta - beta + gamma * practice;
    return 1 / (1 + Math.exp(-logit));
  };

  const logit = theta - beta + gamma * practice;
  const probability = calcProb(theta, beta, gamma, practice);

  const chartData = Array.from({ length: 21 }, (_, i) => ({
    practice: i,
    probability: calcProb(theta, beta, gamma, i) * 100
  }));

  const currentPointData = [{
    practice: practice,
    probability: probability * 100
  }];

  const highlightParam = (paramName, duration = 1000) => {
    setHighlightedParams(prev => ({ ...prev, [paramName]: true }));
    setTimeout(() => {
      setHighlightedParams(prev => ({ ...prev, [paramName]: false }));
    }, duration);
  };

  const updateParam = (setter, paramName, value, precision = 1) => {
    const formattedValue = parseFloat(value).toFixed(precision);
    setter(parseFloat(formattedValue));
    highlightParam(paramName);
  };

  const simulateResponse = (isCorrect) => {
    const currentProb = calcProb(theta, beta, gamma, practiceCount);
    
    setResponseLog(prev => [...prev, {
      practice: practiceCount,
      correct: isCorrect,
      probability: currentProb
    }]);

    let newTheta = theta;
    let newBeta = beta;
    let newGamma = gamma;

    // Adaptive updates
    newTheta = isCorrect ? Math.min(3, theta + 0.1) : Math.max(-3, theta - 0.05);

    // Task difficulty adaptation
    const predictionError = (isCorrect ? 1 : 0) - currentProb;
    if (Math.abs(predictionError) > 0.2) {
      if (isCorrect && currentProb < 0.4) {
        newBeta = Math.max(-2, beta - 0.15);
      } else if (!isCorrect && currentProb > 0.6) {
        newBeta = Math.min(2, beta + 0.15);
      }
    }
    
    if (isCorrect && currentProb < 0.7) {
      newBeta = Math.max(-2, beta - 0.05);
    } else if (!isCorrect && currentProb > 0.3) {
      newBeta = Math.min(2, beta + 0.05);
    }

    // Learning rate adaptation
    const recentResponses = [...responseLog, { correct: isCorrect }].slice(-3);
    if (recentResponses.length >= 3) {
      const recentCorrect = recentResponses.filter(r => r.correct).length;
      if (recentCorrect >= 2) {
        newGamma = Math.min(1, gamma + 0.05);
      } else if (recentCorrect === 0) {
        newGamma = Math.max(0, gamma - 0.05);
      }
    }

    // Update parameters with animations
    if (newTheta !== theta) {
      updateParam(setTheta, 'theta', newTheta, 1);
    }
    if (newBeta !== beta) {
      updateParam(setBeta, 'beta', newBeta, 1);
    }
    if (newGamma !== gamma) {
      updateParam(setGamma, 'gamma', newGamma, 2);
    }

    const newPracticeCount = practiceCount + 1;
    setPracticeCount(newPracticeCount);
    setPractice(newPracticeCount);
    highlightParam('practice');
  };

  const Parameter = ({ children, paramName, className = "" }) => (
    <span 
      className={`inline-block px-2 py-1 mx-1 rounded bg-white/20 transition-all duration-300 relative ${
        highlightedParams[paramName] ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50' : ''
      } ${className}`}
    >
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Additive Factor Model (AFM) Interactive Simulation</h1>
          <p className="text-lg">Watch how student performance parameters affect success probability in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formula Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">AFM Canonical Formula</h2>
            
            <div className="relative bg-black/30 p-8 rounded-xl text-center text-xl font-bold mb-6 overflow-hidden">
              <div className="formula">
                ln(<Parameter paramName="pij">{probability.toFixed(3)}</Parameter> / (1 - <Parameter paramName="pij2">{probability.toFixed(3)}</Parameter>)) = 
                <Parameter paramName="theta">{theta.toFixed(1)}</Parameter> + 
                Σ<sub>k=1</sub><sup>K</sup> <Parameter paramName="qjk">1.0</Parameter> × <Parameter paramName="beta">{beta.toFixed(1)}</Parameter> + 
                Σ<sub>k=1</sub><sup>K</sup> <Parameter paramName="qjk2">1.0</Parameter> × <Parameter paramName="gamma">{gamma.toFixed(2)}</Parameter> × <Parameter paramName="practice">{practice}</Parameter>
              </div>
            </div>

            <div className="bg-black/30 p-6 rounded-xl font-mono text-sm mb-6">
              <h3 className="text-lg font-bold mb-4">Step-by-Step Calculation:</h3>
              <div className="space-y-2">
                <div className="p-2 bg-white/5 rounded border-l-4 border-teal-400">1. Logit = θ - β + γ × T</div>
                <div className="p-2 bg-white/5 rounded border-l-4 border-teal-400">2. Logit = {theta.toFixed(1)} - ({beta.toFixed(1)}) + {gamma.toFixed(2)} × {practice}</div>
                <div className="p-2 bg-white/5 rounded border-l-4 border-teal-400">3. Logit = {logit.toFixed(3)}</div>
                <div className="p-2 bg-white/5 rounded border-l-4 border-teal-400">4. P(success) = 1 / (1 + e<sup>-logit</sup>)</div>
                <div className="p-2 bg-white/5 rounded border-l-4 border-teal-400">5. P(success) = 1 / (1 + e<sup>-{logit.toFixed(3)}</sup>)</div>
                <div className={`text-lg font-bold text-teal-400 text-center p-4 bg-teal-400/20 rounded-lg mt-4 transition-all duration-500 ${highlightedParams.result ? 'animate-pulse' : ''}`}>
                  P(success) = {(probability * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <label className="block mb-2 font-bold">Student Ability (θᵢ)</label>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={theta}
                  onChange={(e) => updateParam(setTheta, 'theta', e.target.value, 1)}
                  className="w-full"
                />
                <span className="text-sm">{theta.toFixed(1)}</span>
              </div>
              
              <div className="bg-white/10 p-4 rounded-xl">
                <label className="block mb-2 font-bold">Task Difficulty (βₖ)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={beta}
                  onChange={(e) => updateParam(setBeta, 'beta', e.target.value, 1)}
                  className="w-full"
                />
                <span className="text-sm">{beta.toFixed(1)}</span>
              </div>
              
              <div className="bg-white/10 p-4 rounded-xl">
                <label className="block mb-2 font-bold">Learning Rate (γₖ)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={gamma}
                  onChange={(e) => updateParam(setGamma, 'gamma', e.target.value, 2)}
                  className="w-full"
                />
                <span className="text-sm">{gamma.toFixed(2)}</span>
              </div>
              
              <div className="bg-white/10 p-4 rounded-xl">
                <label className="block mb-2 font-bold">Practice Opportunities (Tᵢₖ)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={practice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPractice(val);
                    setPracticeCount(val);
                    highlightParam('practice');
                  }}
                  className="w-full"
                />
                <span className="text-sm">{practice}</span>
              </div>
            </div>

            {/* Probability Display */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold mb-2">Success Probability: {(probability * 100).toFixed(1)}%</div>
              <div className="w-full h-8 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${probability * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Success Probability Over Practice</h2>
            
            <div className="h-80 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis 
                    dataKey="practice" 
                    stroke="white"
                    label={{ value: 'Practice Opportunities (T)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'white' } }}
                  />
                  <YAxis 
                    stroke="white"
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    label={{ value: 'Success Probability', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'white' } }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Success Probability']}
                    labelFormatter={(label) => `Practice: ${label}`}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="#4ecdc4" 
                    strokeWidth={3}
                    fill="rgba(78, 205, 196, 0.1)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-teal-400/20 p-4 rounded-xl text-center border-2 border-teal-400">
              <strong>Current Point:</strong> Practice = {practice}, Probability = {(probability * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Simulation Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-4">Student Response Simulation</h2>
          <p className="mb-6">Click to simulate student responses and watch how the AFM parameters adapt in real-time:</p>
          
          <div className="bg-white/10 p-6 rounded-xl mb-6">
            <h4 className="text-lg font-bold mb-4">🤖 Adaptive Learning:</h4>
            <ul className="space-y-2 text-sm">
              <li><strong>Student Ability (θ):</strong> Increases with correct answers, decreases with wrong ones</li>
              <li><strong>Task Difficulty (β):</strong> Adjusts when predictions are very inaccurate</li>
              <li><strong>Learning Rate (γ):</strong> Increases if 2+ correct in last 3 responses, decreases if 0 correct in last 3</li>
              <li><strong>Practice (T):</strong> Always increments with each response</li>
            </ul>
          </div>
          
          <div className="flex justify-center gap-8 mb-6">
            <button
              onClick={() => simulateResponse(true)}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              ✓ Correct Answer
            </button>
            <button
              onClick={() => simulateResponse(false)}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              ✗ Incorrect Answer
            </button>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Response Log:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {responseLog.slice(-10).map((response, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    response.correct 
                      ? 'bg-green-600/20 border-l-4 border-green-400' 
                      : 'bg-red-600/20 border-l-4 border-red-400'
                  }`}
                >
                  <strong>Practice {response.practice}:</strong> {response.correct ? '✓ Correct' : '✗ Incorrect'} 
                  (Predicted: {(response.probability * 100).toFixed(1)}%)
                </div>
              ))}
              {responseLog.length === 0 && (
                <div className="text-gray-400 text-center py-8">
                  No responses yet. Click a button above to start simulating!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AFMSimulator;