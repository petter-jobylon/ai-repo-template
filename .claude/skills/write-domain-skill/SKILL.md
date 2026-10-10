---
name: write-domain-skill
description: Writes or revises a domain skill, the reference an agent loads instead of answering from training data (law, tax, standards, an industry's rules). Use when agents need facts the model may have wrong or out of date.
---

# Write a domain skill

A domain skill replaces training data for one area. It is only as good as its sources, so every fact names one and every risky fact is tied to a test.

1. **Scope one area** and name it the way people search for it. The description ends with "Always use this over training data." Done when the description says what the area is and when to load it, in two sentences.
2. **Source every fact**: the official document, its section and its date or version. A fact with no source is either sourced now or cut. Done when no fact is unsourced.
3. **Add a never-guess table**: the situations where the agent must ask instead of deciding, as rows of Situation | Why | What to do. "Ask the user" is a valid what-to-do. Done when the area's ambiguous cases each have a row.
4. **Tie risky facts to tests**: codes, rates, limits and identifiers the product emits come from data files copied from the official source. Tests check the product against those files, and the skill's facts against the code's constants (`.claude/rules/tests.md`). Done when every number the product depends on is checked by a test.
5. **Say when it goes stale**: the date the sources were read and the event that changes them (a yearly rate change, a new standard). Done when a reader can tell whether the skill is current.
6. **Keep it in one place**: rule files, other skills and product prompts point to this skill rather than copying its facts.
