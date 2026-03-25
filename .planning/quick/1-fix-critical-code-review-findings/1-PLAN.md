---
phase: quick/1-fix-critical-code-review-findings
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/Biography.svelte
  - src/lib/data/caesars.js
  - static/content/augustus.json
  - static/content/caligula.json
  - static/content/galba.json
  - static/content/julius.json
  - static/content/titus.json
  - static/content/vespasian.json
  - docs/content/augustus.json
  - docs/content/caligula.json
  - docs/content/galba.json
  - docs/content/julius.json
  - docs/content/titus.json
  - docs/content/vespasian.json
autonomous: true
requirements: []
must_haves:
  truths:
    - 'Biography component handles null caesarData gracefully'
    - "Domitian's reign dates show AD 81–96"
    - 'Empty Latin text fields show fallback message'
  artifacts:
    - path: 'src/lib/components/Biography.svelte'
      provides: 'Null-safe biography rendering'
    - path: 'src/lib/data/caesars.js'
      provides: 'Correct Domitian reign dates'
    - path: 'static/content/*.json'
      provides: 'Fallback Latin text message'
---

<objective>
Fix 3 critical code review findings: null guard in Biography.svelte, Domitian's reign dates in caesars.js, and empty Latin text fallbacks in JSON data files.
</objective>

<tasks>

<task type="auto">
  <name>Add null guard for caesarData iteration</name>
  <files>src/lib/components/Biography.svelte</files>
  <action>
    In Biography.svelte line 55, the component accepts caesarData = null but iterates caesarData.sections unconditionally.
    
    Wrap the {#each} block at line 54-55 with a conditional check: add `caesarData` guard before iterating.
    
    Current (line 54-55):
    ```
    <!-- Paginae Chapters -->
    <div class="space-y-24">
      {#each caesarData.sections as section}
    ```
    
    Change to:
    ```
    <!-- Paginae Chapters -->
    {#if caesarData}
    <div class="space-y-24">
      {#each caesarData.sections as section}
    ```
    
    And add `{/if}` before the closing &lt;/div&gt; at the end of the sections div (line 100 area).
  </action>
  <verify>npm run build 2>&1 | head -50</verify>
  <done>Biography.svelte renders nothing when caesarData is null, renders sections when caesarData is provided</done>
</task>

<task type="auto">
  <name>Fix Domitian reign dates</name>
  <files>src/lib/data/caesars.js</files>
  <action>
    In caesars.js line 85, Domitian's reign is incorrectly set to 'AD 81–91'. 
    
    Domitian reigned from AD 81 until his assassination in AD 96 - a total of 15 years.
    
    Change line 85 from:
      reign: 'AD 81–91',
    to:
      reign: 'AD 81–96',
  </action>
  <verify>grep -n "Domitian" src/lib/data/caesars.js</verify>
  <done>Domitian entry shows reign: 'AD 81–96'</done>
</task>

<task type="auto">
  <name>Add Latin text fallback in JSON files</name>
  <files>
    static/content/augustus.json
    static/content/caligula.json
    static/content/galba.json
    static/content/julius.json
    static/content/titus.json
    static/content/vespasian.json
    docs/content/augustus.json
    docs/content/caligula.json
    docs/content/galba.json
    docs/content/julius.json
    docs/content/titus.json
    docs/content/vespasian.json
  </files>
  <action>
    In each JSON file, find all instances where "la": "" appears and replace with "la": "Latin text not yet available for this chapter."
    
    Use replaceAll to change all occurrences of "la": "" to "la": "Latin text not yet available for this chapter." in each file.
  </action>
  <verify>grep -l '"la": ""' static/content/*.json docs/content/*.json | wc -l returns 0</verify>
  <done>All JSON files have non-empty Latin text fallback</done>
</task>

</tasks>

<verification>
- npm run build passes without errors
- grep "AD 81–96" src/lib/data/caesars.js returns Domitian's reign line
- No JSON files contain empty "la" fields
</verification>

<success_criteria>

1. Biography.svelte compiles without null reference errors when caesarData is null
2. caesars.js shows Domitian with correct reign dates (AD 81–96)
3. All 12 JSON files have fallback Latin text message instead of empty strings
   </success_criteria>

<output>
After completion, create `.planning/quick/1-fix-critical-code-review-findings/1-SUMMARY.md`
</output>
