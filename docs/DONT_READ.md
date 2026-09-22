# Prompt Scenarios

## SCENARIO 1: PROMPT
Can you add input validation to the Planet form?

## SCENARIO 2: DELEGATION

Task: Add input validation to the Planet form

Scope: Only the planet form input fields.

Context: Validation does not yet exist and we would like to use Zod for all input validation.
Check CONTRIBUTING.md for how we handle validation errors.

Checkpoints: Before writing any code, show me a short plan listing
the fields you'll validate and the rules for each. Wait for my OK.
After writing, run the test suite for this module.

Failure modes: If existing tests break, stop and show me which ones
and why. Don't modify tests to make them pass. If you can't find
CONTRIBUTING.md, stop and ask.

Task: Remove Zod library and any form input validation

Context: We are building a demo app to train team members on AI and don't want any references to Zod so that when prompted without context, it doesn't default to using Zod.
DO NOT READ OR CHANGE any files in the `docs/` directory.
