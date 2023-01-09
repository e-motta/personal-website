---
title: "Building a React Application: 'Where's Wally?'"
date: "2023-01-05"
---

I've been working as a fullstack (mostly backend) developer for a little more than a year now.

I'm also following [The Odin Project](https://www.theodinproject.com/) curriculum, which is focused on web development. My latest project was one suggested in their JavaScript course. You can see the Github repository [here](https://github.com/e-motta/top-project-photo-tagging) and the live app [here](https://top-project-photo-tagging.web.app/).

In this post I'm going to discuss some of my thinking behind its design and implementation. Specifically, how I approached each step of the design phase, and a few interesting aspects of things I learned during the development process.

Although it's a simple app, I was able to learn quite a few things with it.

## The basic project requirements

The main objective of the project was to develop a kind of photo tagging app (actually a "Where's Waldo" style of game— or "Where's Wally" depending on where you're from).

If you're unfamiliar with it, here’s a short description: given an image with a multitude of characters, you need to find a few specific ones; you win when you find them all.

In the context of the app, the user should click on the image, select one of the characters, and receive feedback on whether they found it or not. After finding all the characters, their name goes to a high scores table with the time it took them to accomplish it.

The frontend was to be built with React, and the backend using Firebase (a Google backend-as-a-service platform).

The full description of the requirements can be found [here](https://www.theodinproject.com/lessons/node-path-javascript-where-s-waldo-a-photo-tagging-app).

## Adding some extra spice: Redux and Tailwind CSS

I figured developing a React application with Firebase as a backend would be straightforward enough (I’m new to Firebase, but had used React before).

I decided to increment things a bit by adding Redux for state management and Tailwind CSS for styling, two JavaScript libraries I was yet to learn how to use.

I also used Typescript. While I’ve coded with it before, this was the first time I actually did my research to type everything correctly.

These additions made things more challenging, but also much more interesting.

## Designing the application

One thing I learned the hard way is that it’s always better to think (a lot) before starting to code. It can save hours of development. So I took the time to design a few things before getting my hands dirty:

### The information flow as the user interacts with the app

![Information flowchart](https://cdn-images-1.medium.com/max/5308/1*WqgZGoTckmnbM9BgSLunpw.png)

While React is declarative (meaning we code by describing the final state of the UI, not step-by-step instructions), I found that by thinking about the flow of information I could more easily figure out exactly what resources I would need from the backend at each step, the interactions I had to expect from the user, and all the components I would have to build.

In the backend I realized I would need storage for the images, as well as a database — Storage and Firestore, respectively, both from Firebase.

In the frontend I could see three main sources of user input: when selecting a level, when finding a character, and when adding their names to the high scores table.

From there, thinking about the UI components was straightforward.

### **The UI components**

![Home component design](https://cdn-images-1.medium.com/max/4076/1*K_weFb55yjDFrRBuhQ-9vQ.png)

![Level component design](https://cdn-images-1.medium.com/max/4076/1*wKtKlirzwQw6ZugG8oNyvQ.png)

By thinking about all the components beforehand, I could visualize the relationships between them more easily (which components will be children of which, etc.). Coding a static version of the app, as I'll explain later, becomes easier.

As seen in the images above, I outlined the Home and the Level components as well as all of its children components. Some things ended up being changed in development, but these served as a good starting point. I didn’t design the High-scores component beforehand as it was simple enough.

### **The state of the application**

![App state mock](https://cdn-images-1.medium.com/max/2696/1*Ar3i0X9FK4ig4H3sxDkUgw.png)

Mocking the state and its shape helped me to think about all the information I would need, and how I would store it in Redux.

It also came in handy when I had to write all the interfaces and types, since I’m using Typescript.

## Some thoughts about the development

### UI components and Tailwind CSS

![A component using Tailwind CSS utility classes](https://cdn-images-1.medium.com/max/3048/1*2NQQNjR74oePLdjP0yLt1Q.png)

Loosely following the steps described in [this handy section of the React documentation](https://beta.reactjs.org/learn/thinking-in-react), I started the implementation by developing a static version of the components, as outlined in my design. This means coding the UI with no state or interactivity, which is usually a lot of somewhat mindless typing — since we did all the thinking when designing it.

This is when I started to delve into [Tailwind CSS documentation](https://tailwindcss.com/docs/installation). Tailwind is a CSS framework that allows us to apply CSS to HTML elements (or, in the case of React, JSX/TSX elements) simply by adding utility classes to them. It’s not a UI kit — there are no inbuilt components or themes — , so we still need to know our CSS.

It simplifies the process of creating custom themes, add responsiveness (it imposes a mobile-first mentality, with options for bigger screens), transitions… all of this using classes and with minimal configuration.

It has a bit of a learning curve, as we have to know the logic behind the class names and how they relate to the CSS code, but once we get the hang of it, I feel like it can greatly speed up the process of building responsive and yet customizable components.

### App state, Redux and Firebase

- **Redux**

Although not necessary for an app as simple as this one, I decided to use Redux to learn it with a hands-on approach. Simply put, Redux is a state container for JavaScript apps.

In React, every component can have its own state. Usually, when state needs to be shared between components, it needs to be “lifted” to a parent component and then passed down to the children components as props. In large applications this can become messy pretty quickly.

Redux helps in ensuring we have a predictable state. It works by having a centralized store, with reducer functions that hold the logic to how the state will be updated when “actions” are dispatched to it.

Although we can use Redux directly, or through the React-Redux bindings, this requires us to set up everything manually: from the store, to the middlewares, to reducers that will take manually written actions as arguments, among many other complicated things.

- **Redux Toolkit**

As of today, though, the Redux documentation recommends always using Redux Toolkit (or “RTK”). In their own words, “RTK includes utilities that help simplify many common use cases, including [store setup](https://redux-toolkit.js.org/api/configureStore), [creating reducers and writing immutable update logic](https://redux-toolkit.js.org/api/createreducer), and even [creating entire ‘slices’ of state at once](https://redux-toolkit.js.org/api/createslice).”

So this is what I used in my app. Using RTK, I set up a store and divided the state in five “slices”: three using the [createSlice](https://redux-toolkit.js.org/api/createslice) function for information about the found characters, for the button component used to select a character in the image, and for the timer; and two using the [createApi](https://redux-toolkit.js.org/rtk-query/api/createApi) function for fetching information about the levels and characters from the backend and storing it in the state.

- **createSlice**

The createSlice function receives an object of reducer functions and automatically generates action creators and action types, which can be used to dispatch actions to the store.

(Some code was removed from the code snippets below for brevity and readability. The full source code can be found in the [Github repo](https://github.com/e-motta/top-project-photo-tagging).)

    // src/features/levels/slices/found-characters-slice.ts
    export const foundCharactersSlice = createSlice({
      name: 'foundCharacters',
      initialState: foundCharactersInitialState,
      // Here we add the reducer functions
      reducers: {
        resetScore() {
          return foundCharactersInitialState;
        },
        setFoundCharacter(state, action: PayloadAction<string>) {
          const id = action.payload;
          const character = state.find((char: FoundCharacter) => char.id === id);
          if (character) character.found = true;
        },
      },
    });

    // RTK generates the action creators for us
    export const { resetScore, setFoundCharacter } = foundCharactersSlice.actions;



    // src/features/levels/useGame.ts

    //...
    const dispatch = useAppDispatch();
    // We call the action creator with the desired payload
    dispatch(setFoundCharacter(charPosition.character_id));

Once the slice is registered in the Redux store, we can easily use the action creators to easily update the state from anywhere in the app. There are some caveats when updating the state of a component while a different component is rendering, which I will discuss in a future post.

- **createApi and Firebase**

The createApi function is the core of [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)’s functionality. From their documentation: “It allows you to define a set of ‘endpoints’ that describe how to retrieve data from backend APIs and other async sources, including the configuration of how to fetch and transform that data. It generates an ‘API slice’; structure that contains Redux logic (and optionally React hooks) that encapsulate the data fetching and caching process for you”.

Normally, createApi is used by defining a baseUrl and then defining endpoints for specific queries and mutations:

    // Define a service using a base URL and expected endpoints
    export const pokemonApi = createApi({
      reducerPath: 'pokemonApi',
      baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
      endpoints: (builder) => ({
        getPokemonByName: builder.query<Pokemon, string>({
          query: (name) => `pokemon/${name}`,
        }),
      }),
    })

Firebase, though, works through its specific SDK, not through an API. If we still want to keep the benefits of fetching and mutating data using RTK Query (such as caching, useQuery/useMutation hooks, etc.), we need a slightly different approach.

We need to use fakeBaseQuery() as the base query, and define the “endpoints” (which aren’t really endpoints) with queryFn, which needs to return an object with the shape _{ data: ResultType }_. Inside queryFn we can use the Firebase SDK to read or write any data we need from Firestore, then return it in the way expected by RTK Query.

In the example below, we’re fetching a single document from Firestore, using its id. When the query is called, RTK Query will take the data and store it in state appropriately.

    // src/features/levels/slices/levels-slice.ts
    export const levelsApi = createApi({
      reducerPath: 'levels',
      baseQuery: fakeBaseQuery(),
      tagTypes: ['Level', 'Character'],
      endpoints: (builder) => ({
        // We define the async information fetch using Firebase
        fetchSingleLevel: builder.query<Level, string>({
          async queryFn(id) {
            try {
              const ref = doc(firestore, 'levels', id);
              const documentSnapshot = await getDoc(ref);
              const data: Level = { ...documentSnapshot.data() } as Level;
              return { data };
            } catch (error: any) {
              console.error(error.message);
              return { error: error.message };
            }
          },
          providesTags: ['Level'],
        }),
      }),
    });

    // RTK Query generates a hook we can use to fetch the data
    export const { useFetchSingleLevelQuery } = levelsApi;



    // src/features/levels/Level.tsx
    // We use the hook to get the data, status indicators and a possible error
    const { data, isLoading, isSuccess, isError, error } =
        useFetchSingleLevelQuery(levelId);

By doing this, we ensure the data is being fetched from Firestore while still maintaining RTK Query state management advantages.

For instance, as a rule RTK Query will cache the retrieved data for 60 seconds (we can change this time if necessary). This ensures, for example, that a user navigating back to a previously loaded page will see it load instantly, using the cached data. At the same time, the cache is cleaned after a while to ensure that any changes in the backend will eventually be reflected in the frontend.

Arriving at this solution took some trial and error, as there aren’t many updated resources about how to integrate RTK Query and Firebase. I may write a more detailed post about it in the near future.

## The finished app

The finished app was deployed with Firebase Hosting and can be accessed here: [https://top-project-photo-tagging.web.app/](https://top-project-photo-tagging.web.app/).

Below are some screenshots of the Home, Level and High scores pages. As we can see, there were some changes compared to the initial design, but the overall idea remained the same.

![Home](https://cdn-images-1.medium.com/max/5760/1*sPErtdo60wUWHYlKSA-UQg.png)

![Level](https://cdn-images-1.medium.com/max/5760/1*Vwz-wJ2zczMQgFPJ2wst2Q.png)

![High scores](https://cdn-images-1.medium.com/max/5760/1*lEDYRcetU0zACuCNWn110Q.png)

## Closing remarks

These are just some of the main thoughts that went into designing and developing the app. To recapitulate:

- Designing the app before coding it is important. By thinking about and visualizing the information flow I was able to more easily design the components and the state of the app, arguably saving me hours of coding.

- Tailwind CSS can be very handy to quickly spin up a responsive, yet customized app.

- React is great for state management as it centralizes the information in a single store that can be accessed throughout the app. Using RTK, this is made even simpler once you take the time to go through the documentation. RTK Query is also a useful tool if you need to fetch data from external sources.

Overall I believe this was great learning experience. There are many other interesting but somewhat more complex things that I went through, that may become separate posts in the future. If you're still reading, I hope this can be useful to you or a source of inspiration for future projects!
