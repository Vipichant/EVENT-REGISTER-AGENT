export interface Registration {
  registration_id: number;
  student_name: string;
  student_photo: string;
  year: string;
  department: string;
  college_name: string;
  register_number: string;
  mobile_number: string;
  email: string;
  event_name: string;
  amount_paid: number;
  payment_method: string;
  transaction_id: string;
  payment_screenshot: string;
  registration_date: string;
}

export const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Post Graduate'
];

export const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Artificial Intelligence & Data Science (AI&DS)'
];

export const EVENTS = [
  { name: 'WebCraft (Web Design & Development)', fee: 150 },
  { name: 'CodeForge (Speed Competitive Coding)', fee: 200 },
  { name: 'TechQuiz (General & IT Quiz)', fee: 100 },
  { name: 'Paper Presentation (Research Paper)', fee: 250 },
  { name: 'UI/UX Odyssey (Interface Design)', fee: 150 },
  { name: 'RoboWars (Sumo Robotics)', fee: 300 }
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];
