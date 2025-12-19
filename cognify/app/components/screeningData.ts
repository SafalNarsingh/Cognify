export type ScreeningQuestion = { id: string; text: string };
export type ScreeningSection = {
  category: string;
  description: string;
  questions: ScreeningQuestion[];
};

export const screeningData: ScreeningSection[] = [
  {
    category: "Mental Health", // PHQ-9
    description: "Mood and Emotional Well-being",
    questions: [
      { id: "mh_1", text: "Little interest or pleasure in doing things you used to enjoy?" },
      { id: "mh_2", text: "Feeling nervous, anxious, or on edge more often than usual?" },
      { id: "mh_3", text: "Trouble falling or staying asleep, or sleeping too much?" }
    ]
  },
  {
    category: "Elderly & Neuro-degenerative", // GAD-7
    description: "Cognitive Decline and Motor Control",
    questions: [
      { id: "ed_1", text: "Have you noticed increased difficulty in remembering recent events or names?" },
      { id: "ed_2", text: "Do you experience tremors or stiffness that affects your movement?" },
      { id: "ed_3", text: "Have you had trouble navigating familiar routes or judging distances?" }
    ]
  },
  {
    category: "Neuro-developmental", // ASRS
    description: "Attention and Learning Patterns",
    questions: [
      { id: "nd_1", text: "Do you often fail to give close attention to details or make careless mistakes?" },
      { id: "nd_2", text: "Do you find it difficult to stay focused on a single task for a long period?" },
      { id: "nd_3", text: "Do you struggle with reading speed or frequently reversing letters while writing?" }
    ]
  }
];