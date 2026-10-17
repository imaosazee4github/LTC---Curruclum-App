export const ADVISORY_GUIDE_VERSION = "ltc-advisory-8-week-v1";

export const CORE_CHECKIN_QUESTIONS = [
  {
    id: "core-1",
    question: "How have you been feeling since our last conversation?",
  },
  {
    id: "core-2",
    question: "What has been the best part of your week?",
  },
  {
    id: "core-3",
    question: "What has been the most difficult part of your week?",
  },
  {
    id: "core-4",
    question: "Is there anything you need help or support with right now?",
  },
  {
    id: "core-5",
    question:
      "Is there anything we discussed last week that needs follow-up?",
  },
];

export const WELLBEING_RATINGS = [
  {
    value: 1,
    label: "Very Difficult",
    description: "The student is struggling significantly.",
  },
  {
    value: 2,
    label: "Difficult",
    description: "The student is experiencing several challenges.",
  },
  {
    value: 3,
    label: "Fair",
    description: "The student is managing but has some concerns.",
  },
  {
    value: 4,
    label: "Good",
    description: "The student is doing well overall.",
  },
  {
    value: 5,
    label: "Very Good",
    description: "The student feels positive and is adjusting well.",
  },
];

const weeklyGuides = [
  {
    week: 1,
    title: "Welcome and Adjustment",
    theme: "Settling into Campus Life",
    objective:
      "Understand how students feel about arriving on campus, adjusting to a new environment, and beginning the LTC experience.",
    questions: [
      "How are you feeling about being on campus so far?",
      "What has been your best experience since arriving?",
      "What has been the most challenging part of settling in?",
      "Are you comfortable with your accommodation and the campus environment?",
      "Have you started getting to know other students and staff?",
      "Is there anything making you feel worried, lonely, or uncomfortable?",
      "What support would help you settle in better?",
    ],
    advisorFocus:
      "Look for signs of homesickness, anxiety, isolation, difficulty adjusting, or discomfort with accommodation.",
    followUp:
      "Help the student identify one or two practical steps that could make settling in easier.",
  },
  {
    week: 2,
    title: "Emotional Well-Being",
    theme: "Understanding Feelings and Managing Stress",
    objective:
      "Help students recognize their emotions and discuss how they are coping with the demands of campus life.",
    questions: [
      "How have you been feeling emotionally this week?",
      "What has caused you the most stress this week?",
      "When you feel worried or overwhelmed, what do you usually do?",
      "Have you had enough time to rest and relax?",
      "Have you experienced moments when you felt sad, discouraged, or anxious?",
      "Is there anything on your mind that you would like to talk about?",
      "What has helped you feel better this week?",
    ],
    advisorFocus:
      "Identify stress, emotional difficulties, difficulty coping, and the student's existing support strategies.",
    followUp:
      "Encourage healthy coping strategies, such as talking with someone trusted, taking breaks, getting enough sleep, and participating in enjoyable activities.",
  },
  {
    week: 3,
    title: "Social Connection and Belonging",
    theme: "Building Healthy Relationships",
    objective:
      "Assess how well students are connecting with others and whether they feel accepted and included.",
    questions: [
      "How would you describe your relationships with other students?",
      "Do you feel accepted and included in the campus community?",
      "Have you made friends or found people you feel comfortable talking to?",
      "Have you experienced any disagreements, misunderstandings, or conflicts?",
      "Do you feel safe and respected by the people around you?",
      "Is there anyone you are finding it difficult to relate to?",
      "What activities or opportunities would help you feel more connected to the community?",
    ],
    advisorFocus:
      "Loneliness, social isolation, conflict, bullying, exclusion, and difficulties forming relationships.",
    followUp:
      "Help the student find opportunities to connect with others and address any concerns about safety or mistreatment.",
  },
  {
    week: 4,
    title: "Physical Well-Being and Daily Routines",
    theme: "Taking Care of the Body and Mind",
    objective:
      "Explore how students' physical health and daily habits are affecting their mental well-being.",
    questions: [
      "How have you been sleeping this week?",
      "Are you eating regularly and getting enough food?",
      "Have you been feeling unusually tired or lacking energy?",
      "Have you had time for exercise, recreation, or other activities you enjoy?",
      "Are you able to balance your daily responsibilities with rest?",
      "Have you experienced any physical health concerns that are affecting your well-being?",
      "What change could help you feel healthier and more energetic?",
    ],
    advisorFocus:
      "Sleep difficulties, poor eating habits, exhaustion, physical illness, and unhealthy daily routines.",
    followUp:
      "Help the student develop a realistic routine and connect them with appropriate medical support when needed.",
  },
  {
    week: 5,
    title: "Academic and Personal Development",
    theme: "Managing Responsibilities and Expectations",
    objective:
      "Understand how students are coping with their learning, personal goals, and daily responsibilities.",
    questions: [
      "How are you coping with your learning activities and assignments?",
      "Do you feel you understand what is expected of you?",
      "What has been your biggest challenge with your responsibilities this week?",
      "Do you feel you have enough time to complete your tasks?",
      "Have you felt discouraged or frustrated about your progress?",
      "Do you feel comfortable asking for help when you need it?",
      "What is one thing you would like to improve before next week's check-in?",
    ],
    advisorFocus:
      "Academic pressure, frustration, low confidence, difficulty managing time, and uncertainty about expectations.",
    followUp:
      "Help students identify practical solutions and refer academic concerns to the appropriate person.",
  },
  {
    week: 6,
    title: "Spiritual Well-Being and Personal Values",
    theme: "Finding Meaning, Hope, and Direction",
    objective:
      "Give students an opportunity to reflect on their values, sources of strength, and sense of purpose.",
    note:
      "Ask these questions respectfully and without pressure to disclose personal beliefs.",
    questions: [
      "What has been giving you strength or encouragement lately?",
      "Have you had time for the personal or spiritual practices that are important to you?",
      "What helps you remain hopeful when things become difficult?",
      "Do you feel your current experiences are helping you grow as a person?",
      "Have you been struggling with any questions about your purpose, values, or direction?",
      "What helps you feel peaceful and grounded?",
      "Is there anything you would like to do differently to support your personal growth?",
    ],
    advisorFocus:
      "Loss of motivation, discouragement, difficulty finding purpose, or a need for meaningful support.",
    followUp:
      "Encourage students to draw on their own values, beliefs, trusted relationships, and other healthy sources of strength.",
  },
  {
    week: 7,
    title: "Personal Challenges and Support Systems",
    theme: "Recognizing Challenges and Asking for Help",
    objective:
      "Determine whether students have unresolved concerns and know where to find appropriate support.",
    questions: [
      "Looking back at the past few weeks, what has been the hardest experience for you?",
      "Is there a problem you have been trying to manage on your own?",
      "Do you feel comfortable approaching your advisor when you need help?",
      "Do you know whom to contact if you experience emotional distress or a personal crisis?",
      "Is there anything affecting your sense of safety or peace on campus?",
      "What kind of support would be most helpful to you right now?",
      "Is there anything we discussed previously that you would like us to follow up on?",
    ],
    advisorFocus:
      "Unresolved concerns, reluctance to ask for help, safety concerns, and the need for additional support.",
    followUp:
      "Agree on specific next steps, make appropriate referrals, and follow up on outstanding concerns.",
  },
  {
    week: 8,
    title: "Review, Progress, and Transition",
    theme: "Reflecting on Growth and Preparing for What Comes Next",
    objective:
      "Review students' well-being over the two months, celebrate progress, and identify any continuing support needs.",
    questions: [
      "How do you feel now compared with your first week on campus?",
      "What has been your most positive experience during your stay?",
      "What have you learned about yourself over these eight weeks?",
      "What challenges are you still experiencing?",
      "Which strategies have helped you manage stress or difficult situations?",
      "Do you feel you have people you can turn to when you need support?",
      "What have you learned about maintaining your mental and emotional well-being?",
      "What support might you need after this campus experience?",
      "What advice would you give to students arriving for the next cohort?",
    ],
    advisorFocus:
      "Progress, continuing challenges, resilience, support networks, and preparation for the next stage.",
    followUp:
      "Summarize progress, identify any unresolved concerns, and agree on a plan for continuing support where necessary.",
  },
];

export const ADVISORY_WEEKLY_GUIDES = weeklyGuides.map((guide) => ({
  ...guide,
  questions: guide.questions.map((question, index) => ({
    id: `week-${guide.week}-${index + 1}`,
    question,
  })),
}));

export const FOLLOW_UP_QUESTIONS = [
  {
    id: "follow-up-1",
    question: "What progress has been made since our last conversation?",
  },
  {
    id: "follow-up-2",
    question: "Were the agreed actions or referred support helpful?",
  },
  {
    id: "follow-up-3",
    question: "What concerns or needs remain unresolved?",
  },
  {
    id: "follow-up-4",
    question: "What further support or action is needed?",
  },
];

export function getAdvisoryWeekGuide(week) {
  return ADVISORY_WEEKLY_GUIDES.find(
    (guide) => guide.week === Number(week),
  ) || null;
}