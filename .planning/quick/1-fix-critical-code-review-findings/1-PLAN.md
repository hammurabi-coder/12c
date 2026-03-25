---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/data/caesars.js
  - src/lib/utils/paths.js
  - src/routes/[slug]/+page.js
autonomous: true
requirements: []

must_haves:
  truths:
    - 'Code review identifies no critical security vulnerabilities'
    - 'Code review identifies no critical error handling gaps'
    - 'Code review identifies no critical type safety issues'
  artifacts:
    - path: 'src/lib/utils/paths.js'
      provides: 'Safe URL generation for bust images'
    - path: 'src/routes/[slug]/+page.js'
      provides: 'Safe dynamic page loading with proper error handling'
  key_links:
    - from: 'src/routes/[slug]/+page.js'
      to: 'src/lib/data/caesars.js'
      via: 'slug validation against known caesars'
    - from: 'src/lib/utils/paths.js'
      to: '/content/busts/'
      via: 'getBustUrl() function'
---

<objective>
Perform a code review to identify and fix critical code review findings.
</objective>

<context>
@.planning/PLAN.md (project overview: SvelteKit site for Twelve Caesars with editorial text processing)

Quick review of key files:

- src/lib/data/caesars.js (static emperor data - 94 lines)
- src/lib/utils/paths.js (image URL helper - 11 lines)
- src/routes/[slug]/+page.js (dynamic page loader - 24 lines)
- src/routes/+page.js (redirect to /julius - 7 lines)
- src/routes/+layout.js (prerender setting - 1 line)
  </context>

<tasks>

<task type="auto">
  <name>Code Review: Security and Error Handling</name>
  <files>src/lib/utils/paths.js, src/routes/[slug]/+page.js</files>
  <action>
    Review code for critical issues:

    **Security Check:**
    - paths.js: getBustUrl() should validate name contains only valid characters before using in URL
    - paths.js: Consider adding sanitization to prevent path traversal (e.g., no slashes, dots)
    - Check for any hardcoded secrets or credentials (none observed in quick scan)

    **Error Handling Check:**
    - +page.js: Slug validation is good (checks against known caesars array)
    - +page.js: fetch error handling is proper (throws SvelteKit error with status)
    - Consider: What happens if JSON is malformed? (fetch will throw, which is handled)

    **Type Safety Check:**
    - types.d.ts should define interfaces for Caesar, CaesarData
    - No TypeScript runtime issues observed (all .js files are clean)

    **Fixes to apply if issues found:**
    - Add input sanitization to getBustUrl() if name contains unexpected characters
    - Document any edge cases or known limitations

  </action>
  <verify>
    <automated>npm run lint passes && npm run build succeeds</automated>
  </verify>
  <done>Code review completed. No critical security or error handling issues found. Code follows SvelteKit best practices.</done>
</task>

</tasks>

<verification>
- npm run lint passes without errors
- npm run build succeeds
- Any identified issues documented and addressed (or confirmed as false positives)
</verification>

<success_criteria>
Code review completed. Critical issues (security vulnerabilities, error handling gaps, type safety issues) identified and addressed. If no issues found, this confirms the code is in good shape.
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-critical-code-review-findings/1-SUMMARY.md`
</output>
