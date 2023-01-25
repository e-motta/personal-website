---
title: "Maximize Your React Skills: Build a To-Do List App from Start to Finish (with TypeScript + Vite)"
date: "2023-01-25"
---

<img src="https://cdn-images-1.medium.com/max/3200/1*poaGV4iICp06Q-yTlA2g_g.png" width="612" />

In this blog post we’re going to go through everything you need to **understand** and **build** a basic React application. Whether you’re a beginner just getting started with React or a seasoned developer looking to brush up on your skills, this guide is for you.

This guide will take you through the entire process of building a fully-functional to-do list app, including design, layout, state management, and more. We will be using functional components and hooks. We will learn how to use state and props to pass data between components, and how to handle user input and update the state of your app.

By the end of this guide, we will have a solid understanding of how to build a React app from scratch, and you will be able to take your newfound knowledge to build your own React projects.

So, let’s get started!

\*You can find the code of the app we’re going to be building [here](https://github.com/e-motta/my-react-app), and the live version [here](https://e-motta.github.io/my-react-app/).

## A brief intro

We'll be using TypeScript for writing the code and Vite for developing and building the app.

### TypeScript

[TypeScript](https://www.typescriptlang.org/) is a strongly typed programming language that builds on JavaScript. In practical terms, if you already know JavaScript, all you need to learn to use TypeScript is how to use types and interfaces.

Types and interfaces allow us to define the data types we're using in the code. With this, we can catch bugs early on and avoid problems down the line.

For instance, if a function takes a number but we pass it a string, TypeScript will complain immediately:

```typescript
const someFunc = (parameter: number) => {...};

someFunc('1') // Argument of type 'string' is not assignable to parameter of type 'number'.
```

If we were using JavaScript we’d likely only catch the bug later on.

We don’t always need to specify the type, as TypeScript can infer them automatically more often than not.

You can learn the basics of TypeScript [here](https://www.typescriptlang.org/docs/handbook/2/basic-types.html). (Or just ignore the types.)

### Vite

The most common way of spinning up a React application is probably using [create-react-app](https://create-react-app.dev/). We’ll be using [Vite](https://vitejs.dev/) (pronounced like “veet”) instead. But fret not, it’s just as simple — but more efficient.

With tools like [webpack](https://webpack.js.org/) (used by create-react-app under the hood), your entire application needs to be bundled in a single file before it can be served to the browser. Vite, on the other hand, takes advantage of native ES modules in the browser to make bundling more efficient with [Rollup](https://rollupjs.org/), serving parts of the source code as needed.

Vite can also greatly speed up development time with Hot Module Replacement — meaning whenever changes are made to the source code, only the changes are updated, rather than the entire application.

Besides that, Vite offers native support for Typescript, JSX and TSX, CSS and more.

Similarly to create-react-app, Vite offers a tool called create-vite, that allows us to quickly start a new project using basic templates, including options for Vanilla JS, or using libraries like React.

To be clear, we don’t _need_ a tool like Vite or create-react-app to build React applications, but they make our life easier by taking care of setting up the project, bundling the code, using transpilers and much more.

## Diving into React

### JSX / TSX

React allows us to add markup directly in the code which will later be compiled to plain JavaScript. This is called [JSX](https://reactjs.org/docs/introducing-jsx.html). When we’re using JSX we can save our files as .jsx for JavaScript or .tsx for TypeScript.

It looks like this:

```typescript
const element = <h1>Hello, world!</h1>;
```

It’s similar to HTML, but it’s embedded in the JavaScript file, and it allows us to manipulate the markup with programming logic. We can also add JavaScript code inside the JSX, as long as it’s inside curly brackets.

For instance, if we have an array of text we want to render as different paragraph elements, we could do this:

```typescript
const paragraphs = ["First", "Second", "Third"];

paragraphs.map((paragraph) => <p>{paragraph}</p>);
```

And it would be compiled to something like this:

```typescript
<p>First</p>
<p>Second</p>
<p>Third</p>
```

But if we try to do just that, it won’t work. That’s because React works with components, and JSX needs to be rendered inside these components.

### React components

React components can be written using JavaScript **classes** or just plain **functions**. We’ll be focusing on function components, as they are the most up-to-date and the recommended way of writing React components today.

A component is defined by a function that will return the JSX which will be compiled and rendered by the browser. So to extend the example above, if we want to render the paragraph elements, it would look something like this:

```typescript
// Define the component
const Component = () => {
  const paragraphs = ["First", "Second", "Third"];
  return (
    <>
      {paragraphs.map((paragraph) => (
        <p>{paragraph}</p>
      ))}
    </>
  );
};

// Use the component in the same way you use an HTML element in the JSX
const OtherComponent = () => {
  return <Component />;
};
```

### Props

Now maybe we want to reuse this component with different information. We can do that by using props — which is just a JavaScript object holding some data.

In our example, instead of hardcoding the array, we could pass it to the component. The result will be the same, but now the component will be reusable.

If we’re using TypeScript, we need to specify the types of the data inside the props object (there’s no context for what they are, so TypeScript can’t infer them), which in this case is an array of strings (string[]).

```typescript
const Component = (props: { paragraphs: string[] }) => {
  <>
    {props.paragraphs.map((paragraph) => (
      <p>{paragraph}</p>
    ))}
  </>;
};

const OtherComponent = () => {
  const paragraphs = ["First", "Second", "Third"];
  return <Component paragraphs={paragraphs} />;
};
```

### State

If we want to make an interactive component, we’re going to need to store information in the component’s state, so it can “remember” it.

For instance, if we want to define a simple counter that shows the number of times a button is clicked, we need a way of storing and updating this value. React lets us do it with the [useState](https://reactjs.org/docs/hooks-state.html) hook (a [hook](https://reactjs.org/docs/hooks-overview.html) is a function that lets you “hook” into the React [state and lifecycle features](https://reactjs.org/docs/state-and-lifecycle.html)).

We call the useState hook with the initial value, and it returns to us an array with the value itself and a function to update it.

```typescript
import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment count</button>
    </>
  );
};
```

With this knowledge, we’re now ready to start building our React app.

## Creating the project

### Dependencies

To use Vite we’re going to need **node **and a package manager.

To install node just choose one of the options [here](https://nodejs.org/en/download/) depending on your system and configurations. If you’re using Linux or a Mac, you can also install it using [Homebrew](https://formulae.brew.sh/formula/node).

The package manager can be [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) or [yarn](https://yarnpkg.com/getting-started/install). In this post we’re going to using **npm**.

### Creating the project

Next it’s time to create the project. In the terminal, we navigate to the directory where the project will be created, then run the create-vite command.

```bash
$ npm create vite@latest
```

We may be prompted to install additional packages (like create-vite). Type y and press enter to continue.

```bash
Need to install the following packages:
  create-vite@4.0.0
Ok to proceed? (y)
```

Next we’ll be prompted to enter the project information.

Enter the **name** of the project. I chose my-react-project.

```bash
? Project name: › my-react-project
```

Select **React** as the “framework”.

React is technically [a library and not a framework](https://blog.bitsrc.io/why-is-react-a-library-and-next-js-a-framework-and-which-is-better-cee342bdfe8c#:~:text=React%20is%20not%20a%20framework,-You%20may%20have&text=Well%2C%20It%20is%20a%20library,development%20and%20libraries%20do%20not), but don’t worry about it.

```bash
? Select a framework: › - Use arrow-keys. Return to submit.
    Vanilla
    Vue
❯   React
    Preact
    Lit
    Svelte
    Others
```

Select **TypeScript + SWC** as variant.

[SWC](https://swc.rs/) (stands for Speedy Web Compiler ) is a super-fast TypeScript / JavaScript compiler written in Rust. They claim to be “20x faster than Babel on a single thread and 70x faster on four cores”.

```bash
? Select a variant: › - Use arrow-keys. Return to submit.
    JavaScript
    TypeScript
    JavaScript + SWC
❯   TypeScript + SWC
```

It’s done, the project is created. To start it in development mode, we need to change to the project directory, install the dependencies and run the dev script command.

```bash
cd my-react-project
npm install
npm run dev
```

After a few seconds, we will see something similar to this:

```bash
  VITE v4.0.4  ready in 486 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

If we open our browser and navigate to [http://localhost:5173](http://localhost:5173)/ we’ll see the default Vite + React page:

<img src="https://cdn-images-1.medium.com/max/6096/1*udli9F7OjbcyHFbJZ73CjQ.png" width="612" />

This means that everything is as it should be and we can start working on our app.

## Building the app

### File structure and initial setup

If we open the project in our code editor or IDE of choice, we should see a file structure like this:

<img src="https://cdn-images-1.medium.com/max/2000/1*F8o_D_b9s1kkn1dWAb0quQ.png" width="612" />

We can delete some of the boilerplate files, since we won’t be using them (all .svg and .css files).

The code in the App function can be deleted to leave us with this:

```typescript
function App() {
  return (

  )
}

export default App
```

We’ll come back to this file later.

### Styling

Styling isn’t the focus here, but we’ll be using Tailwind CSS, which is a library that lets us style HTML elements by adding classes to them. Follow [these instructions](https://tailwindcss.com/docs/guides/vite) to see the styles reflected in your own project.

Otherwise you can just ignore the classes in the code.

### Thinking about the design: components layout

The design process is an integral part of the development of an app and shouldn’t be overlooked.

To build our to-do list app, we need to first think of the components layout.

We start by mocking a basic UI and outlining a hierarchy of the components involved.

If you’re not a designer, it doesn’t need to be perfect or the final UI in terms of colors and exact placement yet — it’s more important to think of the components structure.

Ideally, our components should be responsible for only one thing, following the [single-responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle).

In the image below, the names in purple are the components we’re going to be building — everything else are native HTML elements. If they’re inside each other, it means there’s likely going to be a parent-child relationship.

<img src="https://cdn-images-1.medium.com/max/2372/1*50d84uxgKDwZWU9OtdFaDA.png" width="612" />

### **Props: building a static version**

After we have a sketch, we can start building a static version of the app. That is to say, just the UI elements, but with no interactivity yet. This part is pretty straightforward and involves a lot of typing and little thinking once you get the hang of it.

You can find the code for the static version in this [GitHub repository](https://github.com/e-motta/my-react-app), in the branch “static-version”. The code for the fully working app is the main branch.

**Container**

As outlined above, we’re going to have a Container that is reused for every section of the app. This Container shows one of the ways of composing different elements: by passing them as children.

```typescript
// src/components/Container.tsx
const Container = ({
  children,
  title,
}: {
  children: JSX.Element | JSX.Element[];
  title?: string;
}) => {
  return (
    <div className="bg-green-600 p-4 border shadow rounded-md">
      {title && <h2 className="text-xl pb-2 text-white">{title}</h2>}
      <div>{children}</div>
    </div>
  );
};

export default Container;
```

It takes a props object with a children parameter of type JSX.Element | JSX.Element[]. This means we can compose it with any other HTML element or any other components we create. It can be rendered wherever we want inside the container — in this case inside the second div.

In our app, it’s going to render each section (defined below) when we use them inside the App component.

The Container also takes an optional string prop named title, which will be rendered inside an h2 whenever it exists.

```typescript
// src/App.tsx
import Container from "./components/Container";
import Input from "./components/Input";
import Summary from "./components/Summary/Summary";
import Tasks from "./components/Tasks/Tasks";

function App() {
  return (
    <div className="flex justify-center m-5">
      <div className="flex flex-col items-center">
        <div className="sm:w-[640px] border shadow p-10 flex flex-col gap-10">
          <Container title={"Summary"}>
            <Summary />
          </Container>
          <Container>
            <Input />
          </Container>
          <Container title={"Tasks"}>
            <Tasks />
          </Container>
        </div>
      </div>
    </div>
  );
}

export default App;
```

**Summary**

The first section is a summary (Summary component) showing three items (SummaryItem): the total number of tasks, the number of pending tasks and the number of completed tasks. This is another way of composing components: just use them in the return statement of another component.

(It’s important to never _define_ a component inside another component, though, as that can lead to unnecessary rerenders and bugs.)

For now we can just use static data in the two components.

```typescript
// src/components/Summary/SummaryItem.tsx
const SummaryItem = ({
  itemName,
  itemValue,
}: {
  itemName: string;
  itemValue: number;
}) => {
  return (
    <article className="bg-green-50 w-36 rounded-sm flex justify-between p-2">
      <h3 className="font-bold">{itemName}</h3>
      <span className="bg-green-900 text-white px-2 rounded-sm">
        {itemValue}
      </span>
    </article>
  );
};

export default SummaryItem;

// src/components/Summary/Summary.tsx
import SummaryItem from "./SummaryItem";

const Summary = () => {
  return (
    <>
      <div className="flex justify-between">
        <SummaryItem itemName={"Total"} itemValue={3} />
        <SummaryItem itemName={"To do"} itemValue={2} />
        <SummaryItem itemName={"Done"} itemValue={1} />
      </div>
    </>
  );
};

export default Summary;
```

You will notice SummaryItem takes two props: itemName, of type string, and itemValue, of type number. These props are passed when the SummaryItem component is used inside the Summary component, and then rendered in the SummaryItem JSX.

**Tasks**

Similarly, for the tasks section (the last one) we have a Tasks component that renders the TaskItem components.

Also with static data for now. We will later need to pass a **task name** and a **status** down as props to the TaskItem component to make it reusable and dynamic.

```typescript
// src/components/Tasks/TaskItem.tsx
const TaskItem = () => {
  return (
    <div className="flex justify-between bg-white p-1 px-3 rounded-sm">
      <div className="flex gap-2 items-center">
        <input type="checkbox" />
        Task name
      </div>
      <button className="bg-green-200 hover:bg-green-300 rounded-lg p-1 px-3">
        Delete
      </button>
    </div>
  );
};

export default TaskItem;

// src/components/Tasks/Tasks.tsx
import TaskItem from "./TaskItem";

const Tasks = () => {
  return (
    <div className="flex flex-col gap-2">
      <TaskItem />
    </div>
  );
};

export default Tasks;
```

**Input**

Finally, the Input component is a form with a label, an input of type text, and a button to “Add task”. For now it doesn’t do anything, but we’ll soon change that.

```typescript
// src/components/Input.tsx
const InputContainer = () => {
  return (
    <form action="" className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label className="text-white">Enter your next task:</label>
        <input className="p-1 rounded-sm" />
      </div>
      <button
        type="button"
        className="bg-green-100 rounded-lg hover:bg-green-200 p-1"
      >
        Add task
      </button>
    </form>
  );
};

export default InputContainer;
```

### **State: adding interactivity**

To add interactivity in React, we need to store information in the component’s state.

But before doing that, we need to think about how we want the data to change over time. We need to identify **a minimal representation** of this data, and identify **which components** we should use to store this state.

**A minimal representation of state**

State should contain every bit of information necessary to make our app interactive — but nothing more. If we can compute a value from a different value, we should keep just one of them in state. This makes our code not only less verbose, but also less prone to bugs involving contradictory state values.

In our example we might think we need to track values for total tasks, pending tasks, and done tasks.

But to track the tasks, it is enough to have a single array with objects representing each task and its status (pending or done).

```typescript
const tasks = [
  {
    name: "task one",
    done: false,
  },
  {
    name: "task two",
    done: true,
  },
];
```

With this data we can always find all of the other information we need at render time using array methods. We also avoid the possibility of contradictions,— like having a total of 4 tasks, but only 1 pending and 1 done task, for example.

We also need state in our form (in the Input component) so we can make it interactive.

**Where the state should live**

Think of it this way: which components need to access the data we’re going to store in state? If it’s a single component, the state can live in this component itself. If it’s more than one component that need the data, then you should find the common parent to these components.

In our example, the state necessary to control the Input component only needs to be accessed there, so it can be local to this component.

```typescript
// src/components/Input.tsx
import { useState } from "react";

const InputContainer = () => {
  const [newTask, setNewTask] = useState(""); // Initialize newTask and setNewTask
  return (
    <form action="" className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label className="text-white">Enter your next task:</label>
        <input
          className="p-1 rounded-sm"
          type="text"
          value={newTask} // Set the input value to newTask
          onChange={(e) => setNewTask(e.target.value)} // Set newTask to the input value whenever the user types something
        />
      </div>
      <button
        type="submit"
        className="bg-green-100 rounded-lg hover:bg-green-200 p-1"
      >
        Add task
      </button>
    </form>
  );
};

export default InputContainer;
```

What this is doing is displaying our newTask value in the input, and calling the setNewTask function whenever the input changes (i.e., when the user types something).

We won’t see any immediate changes in the UI, but this is necessary so we can control the input and have access to its value to use it later.

The state to track the tasks, however, has to be handled differently, as it needs to be accessed in the SummaryItem components (we need to show the number of total, pending and done tasks) as well as in the TaskItem components (we need to display the tasks themselves). And it needs to be the same state because this information must always be in sync.

Let’s take a look at our component tree (you can use the [React dev tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) for this).

<img src="https://cdn-images-1.medium.com/max/2000/1*MJf1OO0v2Fy5YwO6xf659A.png" width="612" />

We can see that the first common parent component is App. So this is where our state for the tasks is going to live.

With the state in place, all that will be left will be to pass the data down as props to the components that need to use it.

(We’re not yet worried about how to make and persist any changes to the parent state, that’s the next part.)

```typescript
// src/App.tsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Container from "./components/Container";
import Input from "./components/Input";
import Summary from "./components/Summary/Summary";
import Tasks from "./components/Tasks/Tasks";

export interface Task {
  name: string;
  done: boolean;
  id: string;
}

const initialTasks = [
  {
    name: "task one",
    done: false,
    id: uuidv4(),
  },
  {
    name: "task two",
    done: true,
    id: uuidv4(),
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  return (
    <div className="flex justify-center m-5">
      <div className="flex flex-col items-center">
        <div className="border shadow p-10 flex flex-col gap-10 sm:w-[640px]">
          <Container title={"Summary"}>
            <Summary tasks={tasks} />
          </Container>
          <Container>
            <Input />
          </Container>
          <Container title={"Tasks"}>
            <Tasks tasks={tasks} />
          </Container>
        </div>
      </div>
    </div>
  );
}

export default App;
```

Here we’re initializing the tasks value with dummy data (initialTasks), just so that we can visualize it before the app is finished. Later we can change it to an empty array, so a new user will not see any tasks when opening the app fresh.

Besides the name and done properties, we’re also adding an id to our task objects, as it will be necessary shortly.

We’re defining an interface with the types of the value in the task objects, and passing it to the useState function. This is necessary in this case, as TypeScript will not be able to infer it when we change the initial value of tasks to an empty array, or when we pass it as props.

Finally, notice we’re passing the tasks down as props to the Summary and Tasks components. These components will need to be changed to accommodate that.

```typescript
// src/components/Summary/Summary.tsx
import { Task } from "../../App";
import SummaryItem from "./SummaryItem";

const Summary = ({ tasks }: { tasks: Task[] }) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.done === false).length;
  const done = tasks.filter((t) => t.done === true).length;
  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
        <SummaryItem itemName={"Total"} itemValue={total} />
        <SummaryItem itemName={"To do"} itemValue={pending} />
        <SummaryItem itemName={"Done"} itemValue={done} />
      </div>
    </>
  );
};

export default Summary;
```

We updated the Summary component so that it now accepts tasks as a prop. We also defined the value total, pending and done, which will be passed down as props to the SummaryItem components in place of the static itemValue’s we had before.

```typescript
// src/components/Tasks/Tasks.tsx
import { Task } from "../../App";
import TaskItem from "./TaskItem";

const Tasks = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <TaskItem key={t.id} name={t.name} />
      ))}
    </div>
  );
};

export default Tasks;

// src/components/Tasks/TaskItem.tsx
import { useState } from "react";

const TaskItem = ({ name }: { name: string }) => {
  const [done, setDone] = useState(false);
  return (
    <div className="flex justify-between bg-white p-1 px-3 rounded-sm gap-4">
      <div className="flex gap-2 items-center">
        <input type="checkbox" checked={done} onChange={() => setDone(!done)} />
        {name}
      </div>
      <button className="bg-green-200 hover:bg-green-300 rounded-lg p-1 px-3">
        Delete
      </button>
    </div>
  );
};

export default TaskItem;
```

For the Tasks component, we also take tasks as a prop, and map its name property to TaskItem components. As a result, we get a TaskItem component for each object inside the tasks array. We also update the TaskItem component to accept name as a prop.

This is where the id comes in handy, as we need to pass a unique key every time we have a list of child components. If we don’t add the key, this could [lead to bugs on rerender](https://beta.reactjs.org/learn/rendering-lists#why-does-react-need-keys). (In a production app, the id would most likely come from the backend.)

The result for now is this:

<img src="https://cdn-images-1.medium.com/max/2592/1*IFHUG-wXtEuajtJLJ0Yi7w.png" width="612" />

We can already see the summary numbers and the task names reflecting our dummy data. But we still lack a way to add or delete tasks.

**Adding inverse data flow**

To finish our app, we need a way to change the App component state (where the tasks data is) from the Input and TaskItem child components.

To do that, we can use the functions generated by the useState hook to define event handlers, and pass them down as props. Once we do that, we simply call them during the appropriate user interaction from the child components.

Be sure to [never mutate state whenever you’re updating it](https://stackoverflow.com/a/40309023/16646078), as this will lead to bugs. Always replace the state object with a new one when updating it.

Below is our final App component with the handlers declared and passed down as props to the Input and Tasks components.

handleSubmit returns a new array with the old tasks plus the new one. toggleDoneTask returns a new array with the opposite done property, for the specified id. handleDeleteTask returns a new array without the task with the specified id.

```typescript
// src/App.tsx
import { FormEvent, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Container from "./components/Container";
import Input from "./components/Input";
import Summary from "./components/Summary/Summary";
import Tasks from "./components/Tasks/Tasks";

export interface Task {
  name: string;
  done: boolean;
  id: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>, value: string) => {
    e.preventDefault();
    const newTask = {
      name: value,
      done: false,
      id: uuidv4(),
    };
    setTasks((tasks) => [...tasks, newTask]);
  };

  const toggleDoneTask = (id: string, done: boolean) => {
    setTasks((tasks) =>
      tasks.map((t) => {
        if (t.id === id) {
          t.done = done;
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((tasks) => tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="flex justify-center m-5">
      <div className="flex flex-col items-center">
        <div className="border shadow p-10 flex flex-col gap-10 sm:w-[640px]">
          <Container title={"Summary"}>
            <Summary tasks={tasks} />
          </Container>
          <Container>
            <Input handleSubmit={handleSubmit} />
          </Container>
          <Container title={"Tasks"}>
            <Tasks
              tasks={tasks}
              toggleDone={toggleDoneTask}
              handleDelete={handleDeleteTask}
            />
          </Container>
        </div>
      </div>
    </div>
  );
}

export default App;
```

This is the final Input component using handleSubmit to update the App component state.

```typescript
// src/components/Input.tsx
import { FormEvent, useState } from "react";

const InputContainer = ({
  handleSubmit,
}: {
  handleSubmit: (e: FormEvent<HTMLFormElement>, value: string) => void;
}) => {
  const [newTaskName, setNewTaskName] = useState("");
  return (
    <form
      action=""
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        handleSubmit(e, newTaskName);
        setNewTaskName("");
      }}
    >
      <div className="flex flex-col">
        <label className="text-white">Enter your next task:</label>
        <input
          className="p-1 rounded-sm"
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-green-100 rounded-lg hover:bg-green-200 p-1"
      >
        Add task
      </button>
    </form>
  );
};

export default InputContainer;
```

This is the final Tasks component, which we updated to pass the props from App down to TaskItem. We also added a ternary operator to return “No tasks yet!” when there are no tasks.

```typescript
// src/components/Tasks/Tasks.tsx
import { Task } from "../../App";
import TaskItem from "./TaskItem";

const Tasks = ({
  tasks,
  toggleDone,
  handleDelete,
}: {
  tasks: Task[];
  toggleDone: (id: string, done: boolean) => void;
  handleDelete: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {tasks.length ? (
        tasks.map((t) => (
          <TaskItem
            key={t.id}
            name={t.name}
            done={t.done}
            id={t.id}
            toggleDone={toggleDone}
            handleDelete={handleDelete}
          />
        ))
      ) : (
        <span className="text-green-100">No tasks yet!</span>
      )}
    </div>
  );
};

export default Tasks;
```

And this is the final TaskItem component, using toggleDone and handleDelete to update the App component state.

```typescript
// src/components/Tasks/TaskItem.tsx
const TaskItem = ({
  name,
  done,
  id,
  toggleDone,
  handleDelete,
}: {
  name: string;
  done: boolean;
  id: string;
  toggleDone: (id: string, done: boolean) => void;
  handleDelete: (id: string) => void;
}) => {
  return (
    <div className="flex justify-between bg-white p-1 px-3 rounded-sm gap-4">
      <div className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={done}
          onChange={() => toggleDone(id, !done)}
        />
        {name}
      </div>
      <button
        className="bg-green-200 hover:bg-green-300 rounded-lg p-1 px-3"
        type="button"
        onClick={() => handleDelete(id)}
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;
```

And here’s our final app after we add a few tasks!

<img src="https://cdn-images-1.medium.com/max/2580/1*o2qabgF-IoBnrwXM0edZpA.png" width="612" />

If you’re coding along, you can deploy your own app by following [these instructions](https://vitejs.dev/guide/static-deploy.html).

You can find the repo with all of the code we went through [here](https://github.com/e-motta/my-react-app), and the live version of the app [here](https://e-motta.github.io/my-react-app/).

## Final words

In conclusion, building a to-do list app can be a great way to learn and solidify our understanding of React and its principles. By breaking down the process into small steps and following best practices, we can create a functional app in a relatively short amount of time.

We’ve covered:

- the key concepts of components, state, and inverse data flow.

- the design and architecture of the app.

- best practices such as the single-responsibility principle

By following the steps outlined in this guide, you should now have a solid understanding of how to build a simple React app and be able to apply it to your own projects.

Happy coding!
