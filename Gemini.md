# AI Developer Guidelines - Gemini

> [!IMPORTANT]
> **ALWAYS WRITE TESTS**

When you fix a bug or implement a new feature:

1.  **Regression Testing**: Create a specific test case that reproduces the bug (or covers the new logic) *before* marking the task as complete.
2.  **Verification**: Run the test suite to ensure your changes didn't break existing functionality.
3.  **Validation**: If the user confirms a fix works manually, capture that in a test to prevent it from breaking again.

> **Rule of Thumb**: "If it's worth fixing, it's worth testing."

**Example Workflow:**
1.  Receive bug report (e.g., "UI draws at wrong coordinates").
2.  Reproduce/Analyze.
3.  Create/Update Test (e.g., `Renderer.test.ts`).
4.  Implement Fix.
5.  Verify Test Passes.
6.  Notify User.

> [!TIP]
> **Commit Protocol**
> Whenever the user confirms that the code is "working fine" or the task is complete:
> 1.  Run **ALL** tests to ensure system stability.
> 2.  Commit **ALL** changes to the current active branch with a descriptive message.
