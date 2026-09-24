// Hook: when an Impeccable task starts, tell the agent how ponytail and Impeccable share it.
// PostToolUse on the Skill tool covers the agent invoking Impeccable itself; UserPromptSubmit
// covers a typed /impeccable, which doesn't go through the Skill tool.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let e = {};
  try { e = JSON.parse(raw); } catch { return; }
  const hit =
    (e.hook_event_name === 'PostToolUse' && (e.tool_input?.skill || '') === 'impeccable') ||
    (e.hook_event_name === 'UserPromptSubmit' && /^\s*\/impeccable\b/.test(e.prompt || ''));
  if (!hit) return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: e.hook_event_name,
      additionalContext:
        "Impeccable task: DESIGN.md and Impeccable's craft floor set the bar for design completeness " +
        '(states, motion, polish, browser surfaces). Ponytail still governs code structure only: no ' +
        'needless abstractions, dependencies or files.',
    },
  }));
});
