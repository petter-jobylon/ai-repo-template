---
paths:
  - "__fill-in__/**"  # replace with the globs this rule covers, e.g. "app/api/**" or "*/views.py"
---

# Request handlers

<!-- The pattern every request handler follows: how it authenticates, parses input, calls the domain layer and shapes errors. Name the wrapper or base class to use, and the one file that shows it. -->

- **Parse, don't validate.** A handler parses its input once, at the boundary, into a typed value (a schema, form, DTO or dataclass). Code past the boundary takes that value and never re-checks raw input.

## Enforced by

<!-- The check, test or constraint that fails when a rule above is broken, one line each. "None yet" marks a soft rule; promote it to a check once it has been skipped. -->
