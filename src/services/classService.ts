import { ClassRoom, HomeworkAssignment, ClassroomStudent } from '../types/quiz';
import { supabase } from '../lib/supabase';

const CLASSES_KEY = 'mexo_quiz_classes_v3';
const ASSIGNMENTS_KEY = 'mexo_quiz_assignments_v3';
const ENROLLED_KEY = 'mexo_enrolled_classes_v2';

export const classService = {
  getClasses(): ClassRoom[] {
    try {
      const stored = localStorage.getItem(CLASSES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  async fetchClassesFromSupabase(): Promise<ClassRoom[]> {
    try {
      const { data, error } = await supabase.from('classrooms').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        localStorage.setItem(CLASSES_KEY, JSON.stringify(data));
        return data as ClassRoom[];
      }
    } catch (e) {}
    return this.getClasses();
  },

  getClassById(id: string): ClassRoom | null {
    return this.getClasses().find(c => c.id === id) || null;
  },

  getClassByCode(code: string): ClassRoom | null {
    const formatted = code.trim().toUpperCase();
    return this.getClasses().find(c => c.code.toUpperCase() === formatted) || null;
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

    (async () => {
      try {
        await supabase.from('classrooms').insert({
          id: newClass.id,
          code: newClass.code,
          name: newClass.name,
          subject: newClass.subject,
          teacher_id: newClass.teacher_id,
          teacher_name: newClass.teacher_name,
          students_count: newClass.students_count,
        });
      } catch (e) {}
    })();

    return newClass;
  },

  joinClassByCode(code: string, userId: string, userName: string): { success: boolean; message: string; classObj?: ClassRoom } {
    const cls = this.getClassByCode(code);
    if (!cls) {
      return { success: false, message: 'Invalid class code. Please check and try again.' };
    }

    try {
      const enrolledRaw = localStorage.getItem(ENROLLED_KEY);
      const enrolled: string[] = enrolledRaw ? JSON.parse(enrolledRaw) : [];
      if (!enrolled.includes(cls.id)) {
        enrolled.push(cls.id);
        localStorage.setItem(ENROLLED_KEY, JSON.stringify(enrolled));
      }
    } catch (e) {}

    (async () => {
      try {
        await supabase.from('classroom_students').upsert({
          class_id: cls.id,
          student_id: userId,
          joined_at: new Date().toISOString(),
        });
      } catch (e) {}
    })();

    return { success: true, message: `Successfully joined ${cls.name}!`, classObj: cls };
  },

  getAssignments(): HomeworkAssignment[] {
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  async fetchAssignmentsFromSupabase(): Promise<HomeworkAssignment[]> {
    try {
      const { data, error } = await supabase.from('homework_assignments').select('*').order('assigned_at', { ascending: false });
      if (data && !error) {
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(data));
        return data as HomeworkAssignment[];
      }
    } catch (e) {}
    return this.getAssignments();
  },

  addAssignment(asg: Omit<HomeworkAssignment, 'id' | 'assigned_at' | 'status'>): HomeworkAssignment {
    const list = this.getAssignments();
    const newAsg: HomeworkAssignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      assigned_at: new Date().toISOString(),
      status: 'active',
    };
    list.unshift(newAsg);
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
    } catch (e) {}

    (async () => {
      try {
        await supabase.from('homework_assignments').insert({
          id: newAsg.id,
          quiz_id: newAsg.quiz_id,
          quiz_title: newAsg.quiz_title,
          class_id: newAsg.class_id,
          class_name: newAsg.class_name,
          teacher_id: newAsg.teacher_id,
          due_date: newAsg.due_date,
          attempts_allowed: newAsg.attempts_allowed,
          allow_late_submission: newAsg.allow_late_submission,
          auto_remind: newAsg.auto_remind,
        });
      } catch (e) {}
    })();

    return newAsg;
  },
};
