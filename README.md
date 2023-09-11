# ExpressionStatement node with `expression: null`

This is a reproduction case of a weird interaction between:

- `@typescript-eslint/parser`
- `eslint-plugin-svelte`
- `eslint-plugin-sonarjs`

## Setup

This is a minimal setup of a Svelte project with ESLint configured. There is a single linting rule configured: [sonarjs/no-unused-collection](https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/no-unused-collection.md). There is a single Svelte component, written in TS, that imports and uses a custom action with a parameter.

```svelte
<script lang="ts">
  import { customAction } from "./action.js";
</script>

<p use:customAction={"hello"}>hello world</p>
```

## Reproduction

1. Clone this gist
2. Run `pnpm install`
3. Run `pnpm lint`

## Behavior

This lint rule will crash ESLint if all the following conditions are met:

1. You have a Svelte component
2. Using `lang="ts"`
3. That `import`'s a custom action
4. And attaches that action to an element
5. And passes an argument to that action

```
Oops! Something went wrong! :(

ESLint: 8.49.0

TypeError: Cannot read properties of null (reading 'type')
Occurred while linting /Users/mc/sandbox/no-empty-collection/component.svelte:1
Rule: "sonarjs/no-unused-collection"
    at isElementWrite (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:149:30)
    at isRead (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:118:18)
    at isUnusedCollection (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:84:18)
    at Array.filter (<anonymous>)
    at collectUnusedCollections (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:54:25)
    at /Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:59:9
    at Array.forEach (<anonymous>)
    at collectUnusedCollections (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:58:23)
    at Program:exit (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint-plugin-sonarjs@0.21.0_eslint@8.49.0/node_modules/eslint-plugin-sonarjs/lib/rules/no-unused-collection.js:41:17)
    at ruleErrorHandler (/Users/mc/sandbox/no-empty-collection/node_modules/.pnpm/eslint@8.49.0/node_modules/eslint/lib/linter/linter.js:1051:28)
```

If you follow the stack trace, you find this function in `eslint-plugin-sonarjs`:

```js
/**
 * Detect expression statements like the following:
 *  myArray[1] = 42;
 *  myArray[1] += 42;
 *  myObj.prop1 = 3;
 *  myObj.prop1 += 3;
 */
function isElementWrite(statement, ref) {
  // added for debugging
  console.debug("Statement: %o", statement);

  if (statement.expression.type === "AssignmentExpression") {
    const assignmentExpression = statement.expression;
    const lhs = assignmentExpression.left;
    return isMemberExpressionReference(lhs, ref);
  }
  return false;
}
```

Doing some simple `console.debug` logging, this is the problematic node. It as `type: 'ExpressionStatement', but its `expression`field is`null`. This does not seem valid.

```
Statement: {
  type: 'ExpressionStatement',
  directive: undefined,
  expression: null,
  range: [ 96, 145, [length]: 2 ],
  loc: { start: { line: 5, column: 20 }, end: { line: 6, column: 23 } },
  parent: {
    type: 'Program',
    body: [
      <ref *1> {
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: './action.js',
          raw: '"./action.js"',
          range: [Array],
          loc: [Object],
          parent: [Circular *1]
        },
        specifiers: [ [Object], [length]: 1 ],
        importKind: 'value',
        assertions: [ [length]: 0 ],
        range: [ 21, 64, [length]: 2 ],
        loc: { start: [Object], end: [Object] },
        parent: {
          type: 'SvelteScriptElement',
          name: [Object],
          startTag: [Object],
          body: [Array],
          endTag: [Object],
          parent: [Object],
          range: [Array],
          loc: [Object]
        }
      },
      [length]: 1
    ],
    comments: [ [length]: 0 ],
    range: [ 21, 186, [length]: 2 ],
    sourceType: 'module',
    tokens: [
      {
        type: 'Keyword',
        value: 'import',
        range: [ 21, 27, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Punctuator',
        value: '{',
        range: [ 28, 29, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Identifier',
        value: 'customAction',
        range: [ 30, 42, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Punctuator',
        value: '}',
        range: [ 43, 44, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Identifier',
        value: 'from',
        range: [ 45, 49, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'String',
        value: '"./action.js"',
        range: [ 50, 63, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Punctuator',
        value: ';',
        range: [ 63, 64, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      {
        type: 'Identifier',
        value: 'customAction',
        range: [ 83, 95, [length]: 2 ],
        loc: { start: [Object], end: [Object] }
      },
      [length]: 8
    ],
    loc: { start: { line: 2, column: 2 }, end: { line: 6, column: 64 } },
    parent: null
  }
}
```
