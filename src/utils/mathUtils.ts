/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simplifies a radical c * sqrt(n) into c * k * sqrt(m) where m is square-free.
 * Returns [coefficient, radical_base]
 */
export function simplifyRadical(c: number, n: number): [number, number] {
  if (n === 0) return [0, 0];
  if (n < 0) return [c, n]; // Complex not handled here
  let k = 1;
  let m = n;
  for (let i = 2; i * i <= m; i++) {
    while (m % (i * i) === 0) {
      k *= i;
      m /= i * i;
    }
  }
  return [c * k, m];
}

/**
 * Represents a sum of radicals: sum(c_i * sqrt(m_i))
 * Map of square-free base -> coefficient
 */
export type RadicalSum = Map<number, number>;

export function createRadicalSum(): RadicalSum {
  return new Map<number, number>();
}

export function addTermToSum(sum: RadicalSum, c: number, n: number) {
  const [coeff, base] = simplifyRadical(c, n);
  if (coeff === 0) return;
  const current = sum.get(base) || 0;
  const next = current + coeff;
  if (next === 0) {
    sum.delete(base);
  } else {
    sum.set(base, next);
  }
}

export function radicalSumToLatex(sum: RadicalSum): string {
  if (sum.size === 0) return "0";
  const terms: string[] = [];
  // Sort bases for consistent output
  const sortedBases = Array.from(sum.keys()).sort((a, b) => a - b);
  
  for (const base of sortedBases) {
    const coeff = sum.get(base)!;
    let termStr = "";
    
    const absCoeff = Math.abs(coeff);
    const sign = coeff > 0 ? (terms.length > 0 ? "+" : "") : "-";
    
    if (base === 1) {
      termStr = `${sign}${absCoeff}`;
    } else {
      const coeffPart = absCoeff === 1 ? "" : absCoeff.toString();
      termStr = `${sign}${coeffPart}\\sqrt{${base}}`;
    }
    terms.push(termStr);
  }
  
  return terms.join("");
}

export function radicalSumToDisplay(sum: RadicalSum): string {
  if (sum.size === 0) return "0";
  const terms: string[] = [];
  // Sort bases for consistent output
  const sortedBases = Array.from(sum.keys()).sort((a, b) => a - b);
  
  for (const base of sortedBases) {
    const coeff = sum.get(base)!;
    let termStr = "";
    
    const absCoeff = Math.abs(coeff);
    const sign = coeff > 0 ? (terms.length > 0 ? " + " : "") : (terms.length > 0 ? " - " : "-");
    
    if (base === 1) {
      termStr = `${sign}${absCoeff}`;
    } else {
      const coeffPart = absCoeff === 1 ? "" : absCoeff.toString();
      termStr = `${sign}${coeffPart}√${base}`;
    }
    terms.push(termStr);
  }
  
  return terms.join("");
}

export function generateProblem(): { question: string; answer: RadicalSum; questionLatex: string } {
  // Only Addition/Subtraction
  const bases = [2, 3, 5, 6, 7, 10, 11].sort(() => Math.random() - 0.5).slice(0, 2);
  const numTerms = 3 + Math.floor(Math.random() * 2); // 3 or 4 terms
  const terms: { c: number; n: number; actualCoeff: number }[] = [];
  const answer = createRadicalSum();
  
  for (let i = 0; i < numTerms; i++) {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const k = 1 + Math.floor(Math.random() * 4); // multiplier for the base inside sqrt
    const n = base * k * k;
    const c = 1 + Math.floor(Math.random() * 5);
    const isNegative = Math.random() > 0.5;
    const actualCoeff = isNegative ? -c : c;
    
    terms.push({ c, n, actualCoeff });
    addTermToSum(answer, actualCoeff, n);
  }
  
  const questionLatex = terms.map((t, i) => {
    const sign = t.actualCoeff > 0 ? (i === 0 ? "" : "+") : "-";
    const coeff = t.c === 1 ? "" : t.c.toString();
    return `${sign}${coeff}\\sqrt{${t.n}}`;
  }).join("");
  
  return { question: questionLatex, answer, questionLatex };
}

export function parseUserInput(input: string): RadicalSum {
  const sum = createRadicalSum();
  // Simple parser for user input like "2\sqrt{3} + 5\sqrt{2}" or "2√3 + 5"
  // Replace \sqrt{n} and √n with sqrt(n) for easier regex
  let normalized = input.replace(/\\sqrt\{(\d+)\}/g, "sqrt($1)");
  normalized = normalized.replace(/\\sqrt(\d+)/g, "sqrt($1)");
  normalized = normalized.replace(/√\{(\d+)\}/g, "sqrt($1)");
  normalized = normalized.replace(/√(\d+)/g, "sqrt($1)");
  
  // Handle cases like "2√3" where there's no parenthesis
  // Split by + or - but keep the sign
  const terms = normalized.split(/(?=[+-])/);
  
  for (let term of terms) {
    term = term.trim();
    if (!term) continue;
    
    let sign = 1;
    if (term.startsWith("-")) {
      sign = -1;
      term = term.substring(1).trim();
    } else if (term.startsWith("+")) {
      term = term.substring(1).trim();
    }
    
    // Match coefficient and sqrt part
    const match = term.match(/^(\d*)sqrt\((\d+)\)$/);
    if (match) {
      const c = match[1] === "" ? 1 : parseInt(match[1]);
      const n = parseInt(match[2]);
      addTermToSum(sum, sign * c, n);
    } else {
      // Maybe just a number
      const num = parseInt(term);
      if (!isNaN(num)) {
        addTermToSum(sum, sign * num, 1);
      }
    }
  }
  
  return sum;
}

export function compareRadicalSums(a: RadicalSum, b: RadicalSum): boolean {
  if (a.size !== b.size) return false;
  for (const [base, coeff] of a) {
    if (b.get(base) !== coeff) return false;
  }
  return true;
}
