import { ClassRoom, HomeworkAssignment } from '../types/quiz';

const CLASSES_KEY = 'mexo_quiz_classes_v1';
const ASSIGNMENTS_KEY = 'mexo_quiz_assignments_v1';

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-101',
    code: 'CS-401',
    name: 'Advanced Computer Science 401',
    subject: 'Computer Science',
    teacher_id: 'mexo-dev-guy',
    teacher_name: 'Alex Rivera',
    students_count: 28,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'cls-102',
    code: 'PHY-302',
    name: 'Quantum Physics Honors',
    subject: 'Physics',
    teacher_id: 'mexo-teacher-01',
    teacher_name: 'Dr. Evelyn Vance',
    students_count: 34,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const INITIAL_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: 'asg-1',
    quiz_id: 'quiz-js-mastery',
    quiz_title: 'JavaScript Modern ES6+ & Async Architecture',
    class_id: 'cls-101',
    class_name: 'Advanced Computer Science 401',
    teacher_id: 'mexo-dev-guy',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    attempts_allowed: 2,
    allow_late_submission: true,
    auto_remind: true,
    assigned_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'asg-2',
    quiz_id: 'quiz-quantum-physics',
    quiz_title: 'Quantum Physics & Particle Dynamics',
    class_id: 'cls-102',
    class_name: 'Quantum Physics Honors',
    teacher_id: 'mexo-teacher-01',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    attempts_allowed: 1,
    allow_late_submission: false,
    auto_remind: true,
    assigned_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const classService = {
  getClasses(): ClassRoom[] {
    try {
      const stored = localStorage.getItem(CLASSES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem(CLASSES_KEY, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  },

  addClass(c: Omit<ClassRoom, 'id' | 'code' | 'students_count' | 'created_at'>): ClassRoom {
    const list = this.getClasses();
    const newClass: ClassRoom = {
      ...c,
      id: `cls-${Date.now()}`,
      code: `MX-${Math.floor(1000 + Math.random() * 9000)}`,
      students_count: 1,
      created_at: new Date().toISOString(),
    };
    list.unshift(newClass);
    try {
      localStorage.setItem(CLASSES_KEY, JSON.stringify(list));
    } catch (e) {}
    return newClass;
  },

  getAssignments(): HomeworkAssignment[] {
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
    return INITIAL_ASSIGNMENTS;
  },

  addAssignment(asg: Omit<HomeworkAssignment, 'id' | 'assigned_at'>): HomeworkAssignment {
    const list = this.getAssignments();
    const newAsg: HomeworkAssignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      assigned_at: new Date().toISOString(),
    };
    list.unshift(newAsg);
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
    } catch (e) {}
    return newAsg;
  },
};
