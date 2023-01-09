---
title: "How to use Firestore with Redux in a React application"
date: "2023-01-09"
---

![Photo by [Lautaro Andreani](https://unsplash.com/@lautaroandreani?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)](https://cdn-images-1.medium.com/max/9012/0*WNb40yO0ma4mKbC3)

You’re using **Firebase** as your backend-as-a-service platform, with **Firestore** holding your data. You’re building the frontend with **React** and you want to use **Redux** to manage the app’s state.

If you’re still wondering **how to efficiently fetch data from Firestore and seamlessly add it to your Redux state**, you’ve come to the right place.

In this post I’m going to explain how to do it using some of the recommended approaches when using Redux today, in 2023.

TL;DR: use RTK Query, with _queryFn_ functions that call the Firebase SDK.

## Some background

### Firebase and Redux

[Firebase](https://firebase.google.com/) is a backend-as-a-service platform. One of their products is [Firestore](https://firebase.google.com/docs/firestore), which is a noSQL database. To use it in your app, the recommended approach is to use the [Firebase SDK](https://firebase.google.com/docs/web/setup).

[Redux](https://redux.js.org/) is a state management library. It’s useful when your app’s state is too large, or the logic to update it too complex, [among other scenarios](https://redux.js.org/faq/general).

### You should be using Redux Toolkit

If you’re trying to build an app using Firestore and Redux, you may have come across resources explaining how to the fetch data, and in a separate process add it to Redux state. You may have read about writing your fetching logic using “[thunks](https://redux.js.org/usage/writing-logic-thunks)” explicitly. There’s even a package you may have found called [react-redux-firebase](http://react-redux-firebase.com/) that provides React bindings.

While these solutions certainly work, they’re not the most efficient or up-do-date in 2023. The main reason for this being — since most of the resources I found were written more than a few years ago — they do not make use of a library that will make your life using Redux 100% easier and more efficient: **Redux Toolkit (or “RTK”)**.

As of today, the Redux documentation recommends always using RTK. In their own words, “RTK includes utilities that help simplify many common use cases, including [store setup](https://redux-toolkit.js.org/api/configureStore), [creating reducers and writing immutable update logic](https://redux-toolkit.js.org/api/createreducer), and even [creating entire ‘slices’ of state at once](https://redux-toolkit.js.org/api/createslice).”

### Using RTK Query to fetch data

If you’re using RTK, you should probably also be using **RTK Query** to fetch your data from the backend. It eliminates the need to write data fetching and caching logic yourself.

The **createApi** function is the core of [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)’s functionality. From their documentation: “It allows you to define a set of ‘endpoints’ that describe how to retrieve data from backend APIs and other async sources, including the configuration of how to fetch and transform that data. It generates an ‘API slice’; structure that contains Redux logic (and optionally React hooks) that encapsulate the data fetching and caching process for you”.

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

Firebase, though, works through its SDK, not through an API. If we still want to keep the benefits of fetching and mutating data using RTK Query (more on this below), we need a slightly different approach, as we’ll see.

### Where to get the final code of the app shown here

The final version of the code shown in this post is part of a project that can be found in [this repository](https://github.com/e-motta/top-project-photo-tagging). In my previous post I went through the design process and some insights I had while implementing it.

## Implementing it

Before anything else, we need to install the necessary libraries (**@reduxjs/toolkit** and **firebase**), [configure the Firebase project](https://firebase.google.com/docs/web/setup) and [set up the Redux store using RTK](https://redux-toolkit.js.org/tutorials/quick-start).

The first thing we’ll do after that is create a “slice” of the state, where we will write the code related to a specific part of the state. As mentioned, we’ll be using the **_createApi_** function for that.

We can do that by creating **a single slice** containing all of the logic pertaining to our API, or we can split it in **more than one slice**. In either case, it is recommended to define **a single central slice**. If we need more than one slice, we can inject the different endpoints in the central slice later.

For this post we’ll implement one slice that will fetch and update data related to a high-scores table from the Firestore database. In the [repo](https://github.com/e-motta/top-project-photo-tagging) and in [this link](https://redux-toolkit.js.org/rtk-query/usage/code-splitting) you can see what would need to be changed if you need more than one slice when using RTK Query.

In this example, we’re creating a file called **scoresSlice.ts**:

    // src/features/scores/scoresSlice.ts
    import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
    import {
      arrayUnion,
      collection,
      doc,
      updateDoc,
      getDocs,
    } from 'firebase/firestore';
    import { firestoreApi } from '../../app/firestoreApi';
    import { firestore } from '../../firebase';
    import { ScoresTable, ScoresTables } from '../../types';

    export const firestoreApi = createApi({
      baseQuery: fakeBaseQuery(),
      tagTypes: ['Score'],
      endpoints: (builder) => ({
        fetchHighScoresTables: builder.query<ScoresTables, void>({
          async queryFn() {
            try {
              const ref = collection(firestore, 'scoresTables');
              const querySnapshot = await getDocs(ref);
              let scoresTables: ScoresTables = [];
              querySnapshot?.forEach((doc) => {
                scoresTables.push({ id: doc.id, ...doc.data() } as ScoresTable);
              });
              return { data: scoresTables };
            } catch (error: any) {
              console.error(error.message);
              return { error: error.message };
            }
          },
          providesTags: ['Score'],
        }),
        setNewHighScore: builder.mutation({
          async queryFn({ scoresTableId, newHighScore }) {
            try {
              await updateDoc(doc(firestore, 'scoresTables', scoresTableId), {
                scores: arrayUnion(newHighScore),
              });
              return { data: null };
            } catch (error: any) {
              console.error(error.message);
              return { error: error.message };
            }
          },
          invalidatesTags: ['Score'],
        }),
      }),
    });

    export const {
      useFetchHighScoresTablesQuery,
      useSetNewHighScoreMutation,
    } = scoresApi;

\*_A note: The way things are set up here, Firestore rules need to be open for read and write by everyone, which is not recommended for production. A better a approach would be calling Firebase Functions to perform operations on Firestore, but since they don’t offer a free version for that, for the sake of this example project I chose to leave things as they are shown here._

The createApi function takes an object with **_baseQuery_** and **_endpoints_**. In this example we’re also adding optional **_tagTypes_**. RTK Query will automatically generate **React** **hooks** so that we can use the queries and mutations.

### **baseQuery**

This is normally used to define the base URL of the API (see the Pokémon example above, under the “Using RTK Query to fetch data” section).

Nevertheless, since we’re using the Firebase SDK, we don’t have a base URL. We can instead use a **_fakeBaseQuery()_**, imported from the RTK Query library.

### **tagTypes**

Tag types are used for caching and invalidation.

When specifying them, you will be able to provide tags when data is fetched from the database. Afterwards, you can invalidate the cache of specific tags, meaning the data will need to be fetched again. This can be useful when you need to ensure that you’re using the most up-to-date data.

In our example, we’re specifying the tag “Score”.

We provide this tag when fetching data from the _fetchHighScoresTables_ endpoint (notice the _providesTags: [‘Score’]_ after the endpoint object).

When setting a new high score with the **_setNewHighScore_** endpoint, we’re invalidating the same tag (_invalidatesTags: [‘Score’]_ after the endpoint object). This means that the cached data fetched with **_fetchHighScoresTables_** (without the new high score) will be invalidated and the data will need to be fetched again (this time with the new high score).

### **endpoints**

This is a function that takes a _builder_ as argument and returns an object with the expected API endpoints.

Normally the endpoints would look like in the Pokémon example above (under the “Using RTK Query to fetch data” section).

To fetch data from Firestore, though, considering we’re not actually querying it from an API, we need to use the **_queryFn_** function. This allows us to define any arbitrary logic inside it, as long as we return the data in the shape expected by RTK Query (i.e. _{ data: ResultType }_).

In the example above, we’re importing and using the Firebase SDK functions to query and update Firestore, just like we would if not using RTK Query. After querying the data, we return _{ data: scoresTables }_; when updating the database, no data needs to be returned, but RTK Query still expects the same shape of return, so we simply return _{ data: null }_.

### React hooks

After defining **_firestoreApi_** with the **_createApi_** function, RTK Query will automatically generate React hooks to query/mutate the data.

As per the documentation: “A React hook that automatically triggers fetches of data from an endpoint, ‘subscribes’ the component to the cached data, and reads the request status and cached data from the Redux store. The component will re-render as the loading status changes and the data becomes available.”

In the example above, it generated the **_useFetchHighScoresTablesQuery_** and **_useSetNewHighScoreMutation _**hooks. We can use them just like any other React hook (inside function components, or inside other custom hooks).

The _use…Query_ hook will return an object with the data and the query properties.

    // src/features/scores/HighScores.tsx
    import { useFetchHighScoresTablesQuery } from './scoresSlice';

    const HighScores = () => {
      const {
        data,
        isLoading,
        isSuccess,
        isError,
        error,
      } = useFetchHighScoresTablesQuery();

    return (
      ...
    )
    }

The _use…Mutation_ hook will return a tuple with a mutation trigger and the mutation result. The mutation trigger is called to fire off the mutation request. The mutation result is an object with the mutation properties.

    // src/features/scores/components/EnterName.tsx
    import { useSetNewHighScoreMutation } from '../scoresSlice';

    const EnterName = () => {
      const [setNewHighScore, result] = useSetNewHighScoreMutation();

      // assume we set the variable 'id' with the table id
      // and the variable 'newHighScore' with a valid high score

      return (
        <button onClick={() => setNewHighScore(id, newHighScore)}></button>
      )
    }

And this is it! You’re all set to use Firestore while keeping the benefits of Redux and RTK Query.

## Final words

In summary:

- To use Firestore with Redux in a React application, it is recommended to use Redux Toolkit (RTK) and RTK Query.

- RTK Query’s _createApi_ function can be used to define endpoints for specific queries and mutations.

- However, since the Firebase SDK is not an API, a different approach is needed to use _createApi_ with Firestore.

- By using RTK Query with _queryFn_ functions that call the Firebase SDK, you can add data from Firestore to your Redux state and take advantage of the benefits of Redux and RTK Query.

I hope this can be useful to you, or at least be a source of inspiration!
