
import { Predicate, Fact, Rule, ReasoningStep } from '../types';

/**
 * Simplified Unification: Checks if two predicates match.
 * In this app, 'P' is treated as a universal variable for "Patient".
 */
export function unify(p1: Predicate, p2: Predicate): boolean {
  if (p1.name !== p2.name) return false;
  if (p1.args.length !== p2.args.length) return false;
  
  for (let i = 0; i < p1.args.length; i++) {
    const a1 = p1.args[i];
    const a2 = p2.args[i];
    // Simple variable logic: 'P' matches anything
    if (a1 === 'P' || a2 === 'P') continue;
    if (a1 !== a2) return false;
  }
  return true;
}

/**
 * Forward Chaining Inference Engine
 * Data-driven: Starts with symptoms and finds all possible diseases.
 */
export function forwardChain(initialFacts: Fact[], rules: Rule[]): { facts: Fact[], trace: ReasoningStep[] } {
  let facts = [...initialFacts];
  const trace: ReasoningStep[] = [
    { type: 'SUCCESS', message: 'Starting forward chaining (data-driven) inference...', depth: 0 }
  ];
  let changed = true;

  while (changed) {
    changed = false;
    for (const rule of rules) {
      // Check if this rule's consequent is already known
      if (facts.some(f => unify(f, rule.consequent))) continue;

      // Check if all antecedents are met
      const matches = rule.antecedents.every(ant => 
        facts.some(f => unify(f, ant))
      );

      if (matches) {
        const newFact: Fact = { ...rule.consequent, source: 'inference', ruleId: rule.id };
        facts.push(newFact);
        trace.push({
          type: 'INFER',
          message: `Inferred ${newFact.name}(${newFact.args.join(', ')}) from ${rule.name}`,
          predicate: newFact,
          ruleId: rule.id,
          depth: 1
        });
        changed = true;
      }
    }
  }

  return { facts, trace };
}

/**
 * Backward Chaining Inference Engine
 * Goal-driven: Tries to prove a specific disease by checking symptoms.
 */
export function backwardChain(goal: Predicate, initialFacts: Fact[], rules: Rule[], depth = 0): { success: boolean, trace: ReasoningStep[] } {
  const trace: ReasoningStep[] = [];
  
  // 1. Is it already a known fact?
  const factMatch = initialFacts.find(f => unify(f, goal));
  if (factMatch) {
    trace.push({
      type: 'MATCH',
      message: `Confirmed fact: ${goal.name}(${goal.args.join(', ')})`,
      predicate: goal,
      depth
    });
    return { success: true, trace };
  }

  // 2. Can we infer it from rules?
  const potentialRules = rules.filter(r => unify(r.consequent, goal));
  
  for (const rule of potentialRules) {
    trace.push({
      type: 'GOAL',
      message: `Attempting to prove ${goal.name}(${goal.args.join(', ')}) via ${rule.name}`,
      predicate: goal,
      ruleId: rule.id,
      depth
    });

    let allAntecedentsProven = true;
    const ruleTrace: ReasoningStep[] = [];

    for (const ant of rule.antecedents) {
      const subResult = backwardChain(ant, initialFacts, rules, depth + 1);
      ruleTrace.push(...subResult.trace);
      if (!subResult.success) {
        allAntecedentsProven = false;
        break;
      }
    }

    if (allAntecedentsProven) {
      trace.push(...ruleTrace);
      trace.push({
        type: 'SUCCESS',
        message: `Successfully proved ${goal.name}(${goal.args.join(', ')}) using ${rule.name}`,
        predicate: goal,
        ruleId: rule.id,
        depth
      });
      return { success: true, trace };
    } else {
      trace.push({
        type: 'FAIL',
        message: `Failed to prove ${goal.name}(${goal.args.join(', ')}) via ${rule.name}`,
        depth
      });
    }
  }

  return { success: false, trace };
}
