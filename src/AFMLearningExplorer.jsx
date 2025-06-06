import { useState, useEffect } from "react";
import AFMSimulator from "./AFMSimulator";
import { Link } from 'react-router-dom';

const AFMLearningExplorer = () => {
  const [currentTask, setCurrentTask] = useState(0);
  const [studentAbility, setStudentAbility] = useState(0.0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [answered, setAnswered] = useState(false);

  const [concepts, setConcepts] = useState({
    variables: { difficulty: -0.3, learningRate: 0.4, opportunities: 0 },
    loops: { difficulty: -0.8, learningRate: 0.2, opportunities: 0 },
    functions: { difficulty: -1.2, learningRate: 0.3, opportunities: 0 },
    data_structures: { difficulty: -1.5, learningRate: 0.1, opportunities: 0 },
    algorithms: { difficulty: -1.8, learningRate: 0.15, opportunities: 0 },
    zpd_demo: { difficulty: -0.6, learningRate: 0.25, opportunities: 0 },
    too_hard: { difficulty: -2.5, learningRate: 0.1, opportunities: 0 },
  });

  const tasks = [
    {
      id: 1,
      concept: "variables",
      title: "Python Variables Basics",
      description: "Learn about variable assignment in Python",
      code: 'x = 10\ny = "Hello"\nprint(x, y)',
      question: "What will this code output?",
      options: ["10 Hello", "10Hello", "x y", "Error"],
      correct: 0,
      focus: "opportunities",
      explanation:
        "This introduces basic variable concepts. Notice how your first attempt affects the model.",
    },
    {
      id: 2,
      concept: "variables",
      title: "Variable Operations",
      description: "Practice with variable calculations",
      code: "a = 5\nb = 3\nresult = a * b + 2\nprint(result)",
      question: "What value will be printed?",
      options: ["17", "15", "13", "20"],
      correct: 0,
      focus: "learning_rate",
      explanation:
        "Repeated practice with similar concepts increases your predicted success rate.",
    },
    {
      id: 3,
      concept: "loops",
      title: "For Loop Introduction",
      description: "Understanding basic for loops",
      code: "for i in range(3):\n    print(i)",
      question: "How many numbers will be printed?",
      options: ["2", "3", "4", "1"],
      correct: 1,
      focus: "difficulty",
      explanation:
        "New concepts have different difficulty levels, affecting your initial success probability.",
    },
    {
      id: 4,
      concept: "loops",
      title: "Loop with Variables",
      description: "Combining loops with variable concepts",
      code: "total = 0\nfor i in range(4):\n    total += i\nprint(total)",
      question: "What will be the final value of total?",
      options: ["6", "10", "4", "0"],
      correct: 0,
      focus: "transfer",
      explanation:
        "This combines multiple concepts. See how knowledge transfers between related skills.",
    },
    {
      id: 5,
      concept: "functions",
      title: "Function Definition",
      description: "Creating your first function",
      code: 'def greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("Alice")\nprint(result)',
      question: "What will this code print?",
      options: ["Hello, Alice!", "Hello, name!", "greet(Alice)", "Error"],
      correct: 0,
      focus: "ability",
      explanation:
        "Functions are more complex. Your growing ability helps with harder concepts.",
    },
    {
      id: 6,
      concept: "zpd_demo",
      title: "ZPD Demonstration Task",
      description: "A task designed to be in your Zone of Proximal Development",
      code: "numbers = [1, 2, 3]\nfor num in numbers:\n    print(num * 2)",
      question: "What will this code print?",
      options: ["1 2 3", "2 4 6", "6", "Error"],
      correct: 1,
      focus: "zpd",
      explanation:
        "This task is designed to be in your Zone of Proximal Development - challenging but achievable with your current skill level.",
    },
    {
      id: 7,
      concept: "too_hard",
      title: "Complex Algorithm Challenge",
      description: "A very challenging task that may require assistance",
      code: "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\nprint(len(quicksort([3, 6, 8, 10, 1, 2, 1])))",
      question: "What will this recursive quicksort function output?",
      options: ["6", "7", "8", "Error"],
      correct: 1,
      focus: "too_hard",
      explanation:
        "This task is above your current ZPD - you would likely benefit from scaffolding or assistance before attempting such complex algorithms.",
    },
    {
      id: 8,
      concept: "data_structures",
      title: "Lists in Python",
      description: "Working with Python lists",
      code: "numbers = [1, 2, 3, 4]\nnumbers.append(5)\nprint(len(numbers))",
      question: "What will be printed?",
      options: ["4", "5", "6", "Error"],
      correct: 1,
      focus: "limitation",
      explanation:
        "Model limitation: It may overestimate success for completely new concept types.",
    },
  ];

  const calculateProbability = (concept) => {
    const c = concepts[concept];
    const logit =
      studentAbility + c.difficulty + c.learningRate * c.opportunities;
    return 1 / (1 + Math.exp(-logit));
  };

  const selectAnswer = (selectedIndex) => {
    if (answered) return;

    const task = tasks[currentTask];
    const isCorrect = selectedIndex === task.correct;

    setSelectedAnswer(selectedIndex);
    setAnswered(true);
    setShowExplanation(true);
    setShowInsight(true);

    // Update concepts and ability
    setConcepts((prev) => ({
      ...prev,
      [task.concept]: {
        ...prev[task.concept],
        opportunities: prev[task.concept].opportunities + 1,
      },
    }));

    if (isCorrect) {
      setStudentAbility((prev) => prev + 0.1);
    }
  };

  const nextTask = () => {
    setCurrentTask((prev) => prev + 1);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    setShowInsight(false);
  };

  const resetTask = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    setShowInsight(false);
  };

  useEffect(() => {
    resetTask();
  }, [currentTask]);

  const getInsightText = (task, isCorrect) => {
    const insights = {
      opportunities: `Notice how your opportunities increased from ${
        concepts[task.concept].opportunities - 1
      } to ${
        concepts[task.concept].opportunities
      }. This directly affects your predicted success on similar tasks.`,
      learning_rate: `The learning rate (${
        concepts[task.concept].learningRate
      }) determines how much each practice opportunity improves your performance. Higher rates mean faster learning.`,
      difficulty: `This concept has difficulty ${
        concepts[task.concept].difficulty
      }. More negative values mean harder tasks, which start with lower success probabilities.`,
      transfer: `This task combines multiple concepts. The AFM considers each concept separately, which may not capture how skills truly interact.`,
      ability: `Your general ability (θ) ${
        isCorrect ? "increased" : "stayed the same"
      }. This affects ALL future predictions, regardless of the specific concept.`,
      zpd: `🎯 Perfect! You're in the Zone of Proximal Development (40-80% success probability). This is where optimal learning happens - challenging but achievable!`,
      too_hard: `⚠️ This task is above your ZPD (below 40% success probability). In a real learning system, you would benefit from scaffolding, hints, or prerequisite practice before attempting this level.`,
      limitation: `⚠️ Model Limitation: The AFM may not accurately predict performance on completely new concept types, as it only considers past performance on similar concepts.`,
    };
    return insights[task.focus];
  };

  const ProgressIndicator = () => (
    <div className="flex justify-center gap-3 mb-6">
      {tasks.map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < currentTask
              ? "bg-cyan-400"
              : i === currentTask
              ? "bg-indigo-500 scale-125"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const Tooltip = ({ children, content }) => (
    <div className="relative inline-block group">
      {children}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-80 bg-slate-800 text-white text-sm rounded-lg p-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity duration-300 pointer-events-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );

  if (currentTask >= tasks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 text-white p-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              🧠 AFM Learning Explorer
            </h1>
            <p className="text-lg opacity-90">
              Discover how the Additive Factor Model predicts your learning
              success
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-gray-800">
            <h2 className="text-3xl font-bold text-center mb-6">
              🎉 Congratulations!
            </h2>
            <p className="text-center text-xl mb-8">
              You've completed the AFM Learning Explorer!
            </p>

            <div className="bg-cyan-50 p-6 rounded-lg border-l-4 border-cyan-400 mb-6">
              <strong className="text-lg">What you experienced:</strong>
              <ul className="mt-3 space-y-2 pl-5">
                <li>
                  <strong>Zone of Proximal Development:</strong> Tasks with
                  40-80% success probability are optimal for learning
                </li>
                <li>
                  <strong>Too Hard (&lt; 40%):</strong> Students need
                  scaffolding or prerequisites
                </li>
                <li>
                  <strong>Too Easy (&gt; 80%):</strong> Students may become
                  bored or disengaged
                </li>
                <li>
                  <strong>Parameter Transparency:</strong> Understanding how θ,
                  β, γ, and T are calculated in real systems
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-pink-200 to-orange-200 p-6 rounded-lg mb-6">
              <strong className="text-lg">
                Key AFM Limitations Discovered:
              </strong>
              <ul className="mt-3 space-y-2 pl-5">
                <li>
                  <strong>Independence Assumption:</strong> Assumes skills don't
                  interact or transfer knowledge
                </li>
                <li>
                  <strong>Cold Start Problem:</strong> Poor predictions for
                  completely new concept types
                </li>
                <li>
                  <strong>No Forgetting:</strong> Doesn't account for knowledge
                  decay over time
                </li>
                <li>
                  <strong>One-Size-Fits-All:</strong> Uses same learning rates
                  for all students
                </li>
                <li>
                  <strong>Context Blind:</strong> Ignores motivation, mood, or
                  environmental factors
                </li>
                <li>
                  <strong>Binary Skills:</strong> Treats skills as either known
                  or unknown, not partially mastered
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-lg mb-6">
              <strong className="text-lg">
                Real-World Implementation Notes:
              </strong>
              <p className="mt-2">
                In actual educational systems like Khan Academy or Carnegie
                Learning, AFM parameters are estimated from massive datasets
                using sophisticated statistical methods. Student ability (θ)
                comes from cross-skill performance analysis, task difficulty (β)
                from population-wide success rates, and learning rates (γ) from
                longitudinal progression data. The model is continuously updated
                as new interaction data becomes available.
              </p>
            </div>

            <div className="bg-cyan-50 p-6 rounded-lg border-l-4 border-cyan-400 mb-6">
              <strong className="text-lg">Beyond AFM:</strong>
              <p className="mt-2">
                Modern adaptive learning systems often combine AFM with other
                approaches like Bayesian Knowledge Tracing, Deep Knowledge
                Tracing, or multi-dimensional IRT models to address some of
                these limitations and provide more nuanced predictions of
                student learning.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <Link to="/afm-simulator">
                <button
                  className="px-8 py-3 rounded-lg font-bold transition-all duration-300 bg-cyan-400 text-white hover:transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Go to AFMSimulator
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const task = tasks[currentTask];
  const currentConcept = concepts[task.concept];
  const probability = calculateProbability(task.concept);
  const isCorrect = selectedAnswer === task.correct;

  const getZPDStatus = () => {
    if (probability >= 0.4 && probability <= 0.8) {
      return (
        <span className="bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-bold ml-3">
          IN ZPD
        </span>
      );
    } else if (probability < 0.4) {
      return (
        <span className="bg-red-500/80 text-white px-3 py-1 rounded-full text-sm font-bold ml-3">
          TOO HARD
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm font-bold ml-3">
          TOO EASY
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 text-white p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🧠 AFM Learning Explorer</h1>
          <p className="text-lg opacity-90">
            Discover how the Additive Factor Model predicts your learning
            success
          </p>
        </div>

        {/* Probability Bar */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 mb-8 text-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            Probability of Answering Next Task Correctly
            {getZPDStatus()}
          </h3>

          <div className="relative w-full h-10 bg-gradient-to-r from-red-400 via-yellow-400 to-cyan-400 rounded-full mb-4 overflow-hidden">
            {/* ZPD Zone */}
            <div
              className="absolute top-0 h-full bg-gray-400/30 rounded-full transition-all duration-500"
              style={{ left: "40%", width: "40%" }}
            />
            {/* Probability Indicator */}
            <div
              className="absolute top-0 w-1 h-full bg-slate-800 rounded transition-all duration-500"
              style={{ left: `${probability * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm font-bold mb-2">
            <span>0% (Very Unlikely)</span>
            <span>50% (Uncertain)</span>
            <span>100% (Very Likely)</span>
          </div>

          <p className="font-semibold">
            Current success probability: {(probability * 100).toFixed(1)}%
          </p>
          <small className="text-gray-600">
            Grey area shows your Zone of Proximal Development (optimal learning
            zone: 40-80%)
          </small>
        </div>

        <ProgressIndicator />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Task Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-gray-800 shadow-lg">
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-indigo-500">
                <div className="mb-4">
                  <span className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">
                    {task.concept.replace("_", " ").toUpperCase()}
                  </span>

                  <div className="flex gap-1 mb-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < Math.abs(currentConcept.difficulty * 2)
                              ? "bg-red-400"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
                <p className="text-gray-600 mb-4">{task.description}</p>

                <div className="bg-slate-800 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{task.code}</pre>
                </div>

                <p className="font-bold text-lg mb-4">{task.question}</p>

                <div className="space-y-3 mb-6">
                  {task.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      disabled={answered}
                      className={`w-full p-3 border-2 rounded-lg font-medium transition-all duration-300 ${
                        answered
                          ? i === task.correct
                            ? "bg-cyan-400 border-cyan-400 text-white"
                            : i === selectedAnswer
                            ? "bg-red-400 border-red-400 text-white"
                            : "bg-gray-100 border-gray-300 text-gray-500"
                          : "bg-white border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:transform hover:-translate-y-1 hover:shadow-lg"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextTask}
                  disabled={!answered}
                  className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
                    answered
                      ? "bg-cyan-400 text-white hover:transform hover:-translate-y-1 hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next Task
                </button>

                {showExplanation && (
                  <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-400 mt-6">
                    {task.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AFM Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-gray-800 shadow-lg h-fit">
            <h3 className="text-xl font-bold mb-4">🔬 AFM Model Insights</h3>

            <div className="bg-gray-100 p-4 rounded-lg text-center mb-6 font-serif text-sm">
              ln(p<sub>ij</sub>/(1-p<sub>ij</sub>)) = θ<sub>i</sub> + Σq
              <sub>jk</sub>β<sub>k</sub> + Σq<sub>jk</sub>γ<sub>k</sub>T
              <sub>ik</sub>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3 relative">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  Student Ability (θ):
                  <div className="relative group ml-2">
                    <span className="inline-block w-4 h-4 bg-indigo-500 text-white rounded-full text-xs leading-4 text-center cursor-help">
                      ?
                    </span>
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-80 bg-slate-800 text-white text-sm rounded-lg p-3 bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 pointer-events-none">
                      <div>
                        <strong>Student Ability (θ)</strong>
                        <br />
                        Represents the learner's general cognitive ability. In
                        real AFM implementations, this is estimated from
                        historical performance data across multiple skills using
                        statistical methods like Expectation-Maximization or
                        Bayesian inference. Here, it starts at 0.0 and increases
                        by 0.1 for each correct answer to simulate ability
                        growth.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </span>
                <span className="font-bold text-indigo-500">
                  {studentAbility.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  Task Difficulty (β):
                  <div className="relative group ml-2">
                    <span className="inline-block w-4 h-4 bg-indigo-500 text-white rounded-full text-xs leading-4 text-center cursor-help">
                      ?
                    </span>
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-80 bg-slate-800 text-white text-sm rounded-lg p-3 bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 pointer-events-none">
                      <div>
                        <strong>Task Difficulty (β)</strong>
                        <br />
                        Represents how hard a specific skill is to master. In
                        practice, this is estimated from aggregated student
                        performance data - skills that most students find
                        difficult have more negative β values. These values are
                        typically calibrated using Item Response Theory
                        techniques on large datasets of student responses.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </span>
                <span className="font-bold text-indigo-500">
                  {currentConcept.difficulty.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  Learning Rate (γ):
                  <div className="relative group ml-2">
                    <span className="inline-block w-4 h-4 bg-indigo-500 text-white rounded-full text-xs leading-4 text-center cursor-help">
                      ?
                    </span>
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-80 bg-slate-800 text-white text-sm rounded-lg p-3 bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 pointer-events-none">
                      <div>
                        <strong>Learning Rate (γ)</strong>
                        <br />
                        Indicates how much each practice opportunity improves
                        performance for this skill. In real systems, this is
                        estimated from longitudinal data showing how student
                        performance changes with practice. Skills with higher γ
                        values are learned faster. These rates are often
                        skill-specific and derived from analyzing thousands of
                        learning interactions.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </span>
                <span className="font-bold text-indigo-500">
                  {currentConcept.learningRate.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  Opportunities (T):
                  <div className="relative group ml-2">
                    <span className="inline-block w-4 h-4 bg-indigo-500 text-white rounded-full text-xs leading-4 text-center cursor-help">
                      ?
                    </span>
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-80 bg-slate-800 text-white text-sm rounded-lg p-3 bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 pointer-events-none">
                      <div>
                        <strong>Opportunities (T)</strong>
                        <br />
                        The number of times a student has practiced this
                        specific skill. This is directly tracked from the
                        learning system's logs. Each attempt at a task involving
                        this skill increments the opportunity count, regardless
                        of whether the student answered correctly or
                        incorrectly.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </span>
                <span className="font-bold text-indigo-500">
                  {currentConcept.opportunities}
                </span>
              </div>
            </div>

            <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-400 mb-4">
              The model predicts{" "}
              <strong>{(probability * 100).toFixed(1)}%</strong> success
              probability for the next {task.concept.replace("_", " ")} task.
              <br />
              <small className="text-gray-600">
                Formula: ln(p/(1-p)) = {studentAbility.toFixed(2)} +{" "}
                {currentConcept.difficulty.toFixed(2)} + (
                {currentConcept.learningRate.toFixed(2)} ×{" "}
                {currentConcept.opportunities})
              </small>
            </div>

            {showInsight && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
                <strong>🔍 Model Insight:</strong>
                <p className="mt-2 text-sm">
                  {getInsightText(task, isCorrect)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AFMLearningExplorer;
