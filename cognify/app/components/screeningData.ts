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
    { 
      id: "mh_1", 
      text: "Little interest or pleasure in doing things?" 
    },
    { 
      id: "mh_2", 
      text: "Feeling down, depressed, or hopeless?" 
    },
    { 
      id: "mh_3", 
      text: "Trouble falling or staying asleep, or sleeping too much?" 
    },
    { 
      id: "mh_4", 
      text: "Feeling tired or having little energy?" 
    },
    { 
      id: "mh_5", 
      text: "Poor appetite or overeating?" 
    },
    { 
      id: "mh_6", 
      text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?" 
    },
    { 
      id: "mh_7", 
      text: "Trouble concentrating on things, such as reading the newspaper or watching television?" 
    },
    { 
      id: "mh_8", 
      text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?" 
    },
    { 
      id: "mh_9", 
      text: "Thoughts that you would be better off dead or of hurting yourself in some way?" 
    }
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