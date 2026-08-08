// MEXO Quiz — Robust File Import Parser & Correct Answer Normalizer
// NEVER guesses Option A as default correct answer!

import { Question, QuestionOption } from '../types/quiz';

export interface ImportedQuestionItem extends Question {
  status: 'valid' | 'needs_review';
  detectedAnswerLabel?: string;
  warningMessage?: string;
}

export interface ImportParseResult {
  questions: ImportedQuestionItem[];
  validCount: number;
  needsReviewCount: number;
  optionsCount: number;
  warnings: string[];
}

/**
 * Normalizes user-specified correct answer text/code into a matching option ID.
 * Supports:
 * - "A", "B", "C", "D", "a", "b", "c", "d"
 * - "Option A", "Option B", "Option C", "Option D"
 * - "1", "2", "3", "4" (1=A, 2=B, 3=C, 4=D)
 * - Exact or trimmed matching option text
 */
export function normalizeCorrectAnswer(
  rawAnswer: any,
  options: { id: string; text: string }[]
): string | null {
  if (rawAnswer === undefined || rawAnswer === null) return null;

  const cleanStr = String(rawAnswer)
    .trim()
    .toLowerCase()
    .replace(/^["'\s]+|["'\s]+$/g, '') // remove quotes
    .replace(/[\.\)\:\-\s]+/g, ' ') // remove trailing dots, brackets, colons
    .trim();

  if (!cleanStr) return null;

  // 1. Direct letter matching: "a", "option a", "opt a", "ans a"
  const letterMatch = cleanStr.match(/^(?:option|opt|ans|choice)?\s*([a-e])$/i);
  if (letterMatch) {
    const charCode = letterMatch[1].toLowerCase().charCodeAt(0);
    const index = charCode - 97; // 'a' is 97 -> index 0
    if (index >= 0 && index < options.length) {
      return options[index].id;
    }
  }

  // 2. Direct number matching: "1", "option 1", "opt 1"
  const numberMatch = cleanStr.match(/^(?:option|opt|ans|choice)?\s*([1-9])$/i);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    const index = num - 1; // 1 -> index 0
    if (index >= 0 && index < options.length) {
      return options[index].id;
    }
  }

  // 3. Exact or trimmed text matching against option text
  for (const opt of options) {
    const optTextClean = opt.text.trim().toLowerCase();
    if (optTextClean === cleanStr) {
      return opt.id;
    }
  }

  // 4. Partial substring text matching (if cleanStr is at least 3 characters)
  if (cleanStr.length >= 3) {
    for (const opt of options) {
      const optTextClean = opt.text.trim().toLowerCase();
      if (optTextClean.includes(cleanStr) || cleanStr.includes(optTextClean)) {
        return opt.id;
      }
    }
  }

  return null;
}

// Robust CSV Line Parser splitting strictly on non-quoted commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  if (current || line.endsWith(',')) {
    result.push(current.trim().replace(/^"|"$/g, ''));
  }
  return result;
}

export function parseImportFile(
  content: string,
  format: 'csv' | 'json' | 'mexo_forms' | 'txt'
): ImportParseResult {
  const questions: ImportedQuestionItem[] = [];
  const warnings: string[] = [];
  let totalOptionsCount = 0;

  if (!content || !content.trim()) {
    return { questions: [], validCount: 0, needsReviewCount: 0, optionsCount: 0, warnings: ['File content is empty.'] };
  }

  if (format === 'json' || format === 'mexo_forms') {
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e: any) {
      return { questions: [], validCount: 0, needsReviewCount: 0, optionsCount: 0, warnings: [`JSON Syntax Error: ${e.message}`] };
    }

    const items = Array.isArray(parsed) ? parsed : parsed.questions || parsed.fields || [];

    items.forEach((item: any, i: number) => {
      const qTitle = item.title || item.label || item.question || `Imported Question ${i + 1}`;
      const rawOpts = item.options || item.choices || ['Option A', 'Option B'];

      const optionsList: QuestionOption[] = rawOpts.map((opt: any, idx: number) => ({
        id: `opt-imp-${Date.now()}-${i}-${idx}`,
        text: typeof opt === 'string' ? opt : opt.text || opt.label || `Option ${idx + 1}`,
        isCorrect: typeof opt === 'object' && opt.isCorrect !== undefined ? !!opt.isCorrect : false,
      }));

      totalOptionsCount += optionsList.length;

      // Check if correct answer is explicitly marked in options array
      let correctOptionId: string | null = optionsList.find(o => o.isCorrect)?.id || null;

      // If not marked in options array, check top-level correct_answer or answer key field
      if (!correctOptionId && (item.correctAnswer || item.correct_answer || item.answerKey || item.correctOption)) {
        const rawAns = item.correctAnswer || item.correct_answer || item.answerKey || item.correctOption;
        correctOptionId = normalizeCorrectAnswer(rawAns, optionsList);
      }

      let status: 'valid' | 'needs_review' = 'valid';
      let warningMsg: string | undefined;

      if (!correctOptionId) {
        status = 'needs_review';
        warningMsg = `Question ${i + 1}: Correct answer field is missing or invalid. Please select a correct answer.`;
        warnings.push(warningMsg);
      } else {
        // Ensure only matched option is marked correct
        optionsList.forEach(o => {
          o.isCorrect = o.id === correctOptionId;
        });
      }

      questions.push({
        id: `q-imp-${Date.now()}-${i}`,
        type: item.type || 'multiple_choice',
        title: qTitle,
        points: item.points || 10,
        options: optionsList,
        explanation: item.explanation || '',
        isRequired: true,
        status,
        detectedAnswerLabel: correctOptionId
          ? optionsList.find(o => o.id === correctOptionId)?.text
          : 'Not Found',
        warningMessage: warningMsg,
      });
    });
  } else {
    // CSV / TXT Parsing
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const startIndex = lines[0]?.toLowerCase().includes('question text') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cleanParts = parseCSVLine(line);

      if (cleanParts.length === 0 || !cleanParts[0]) continue;

      const title = cleanParts[0];
      const qType = cleanParts[1] === 'true_false' ? 'true_false' : 'multiple_choice';

      const optA = cleanParts[2] || '';
      const optB = cleanParts[3] || '';
      const optC = cleanParts[4] || '';
      const optD = cleanParts[5] || '';
      const rawCorrectKey = cleanParts[6];
      const points = parseInt(cleanParts[7], 10) || 10;
      const explanation = cleanParts[8] || '';

      const optionsList: QuestionOption[] = [];

      if (optA) optionsList.push({ id: `opt-${i}-a`, text: optA, isCorrect: false });
      if (optB) optionsList.push({ id: `opt-${i}-b`, text: optB, isCorrect: false });
      if (optC) optionsList.push({ id: `opt-${i}-c`, text: optC, isCorrect: false });
      if (optD) optionsList.push({ id: `opt-${i}-d`, text: optD, isCorrect: false });

      if (optionsList.length === 0) {
        optionsList.push(
          { id: `opt-${i}-a`, text: 'Option A', isCorrect: false },
          { id: `opt-${i}-b`, text: 'Option B', isCorrect: false }
        );
      }

      totalOptionsCount += optionsList.length;

      // Normalize correct answer against choices
      const matchedOptionId = normalizeCorrectAnswer(rawCorrectKey, optionsList);

      let status: 'valid' | 'needs_review' = 'valid';
      let warningMsg: string | undefined;

      if (!matchedOptionId) {
        status = 'needs_review';
        warningMsg = `Question ${i + 1}: Correct answer "${rawCorrectKey || 'missing'}" could not be matched.`;
        warnings.push(warningMsg);
      } else {
        optionsList.forEach(o => {
          o.isCorrect = o.id === matchedOptionId;
        });
      }

      const matchedOption = optionsList.find(o => o.id === matchedOptionId);

      questions.push({
        id: `q-imp-${Date.now()}-${i}`,
        type: qType,
        title,
        points,
        options: optionsList,
        explanation,
        isRequired: true,
        status,
        detectedAnswerLabel: matchedOption ? matchedOption.text : 'Not Found',
        warningMessage: warningMsg,
      });
    }
  }

  const validCount = questions.filter(q => q.status === 'valid').length;
  const needsReviewCount = questions.filter(q => q.status === 'needs_review').length;

  return {
    questions,
    validCount,
    needsReviewCount,
    optionsCount: totalOptionsCount,
    warnings,
  };
}
