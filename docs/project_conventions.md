# Project conventions

Here are listed the main conventions followed in this project.

## File and folder organization

### `/components`

Components files should be wrapper in a folder. Corresponding `.test.ts` and `.scss` files should be placed next to the component file and use the same name.

Component files follow this structure :

- imports
- types and interfaces declarations
- utils / helper functions that are not needed in component cycle :
  - small `const` functions at the top
  - bigger `functions` are place after `const`
- Actual react component
  - state
  - hooks
  - functions

Functions should be named `on<Action>` if they trigger an action when passed as prop. For example `onClick`. The equivalent handler function should be called `handle<Action>`, for example `handleClick`.

I try to organize the props so that the `on<Action>` props are allow at the bottom. For example :

```ts
<MyComponent
  prop1={prop1}
  prop2={prop2}
  onAction={handleAction} // on<Action> is last
></MyComponent>
```

### `/utils`

In `/utils` I placed only functions that are actually re-used in multiple files. As long as the function is needed in a single file it should stay here even if that makes the file very big. As soon as the function becomes needed elsewhere it becomes eligible to be moved to `/utils`

Another controversial choice was made on how to declare functions...

If they are very small/simple they should be placed at the top of the file and should be declared using a `const`. This is to take advantage of the super lean fat-arrow functions, for example when the function is used to do a small calculation and return a value. For example :

```ts
const <nameFunction> = () => ...
```

Otherwise, if the function is big, they will be declared as :

```ts
function <nameFunction> {
    ...
}
```

### `/types`

The same rule as the `/utils` apply here: I only place types that are shared across components into the `/types` folder, otherwise they are place in the file where they are needed, always at the top.

## Variables names

### Const

Constants should be uppercase.

### SCSS

For CSS/SCSS naming I follow the [BEM convention](http://getbem.com/naming/).

### Types

Types and Interfaces should use `PascalCase`.

## Conventional commits

I follow (or try to) follow this [convention](https://www.conventionalcommits.org/en/v1.0.0/).

This is enforced by [commitlint](https://github.com/conventional-changelog/commitlint) so if an attempt to do a commit without the proper format is made, the commit will be rejected.
