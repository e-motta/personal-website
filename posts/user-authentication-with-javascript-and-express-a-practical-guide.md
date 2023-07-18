---
title: "User Authentication with JavaScript and Express: A Practical Guide"
date: "2023-07-18"
---

<img src="https://miro.medium.com/v2/resize:fit:1400/0*eUXv1_yEOoEiyR9S" width="612"/>
<small>Photo by <a href='https://unsplash.com/@flyd2069?utm_source=medium&utm_medium=referral'>FLY:D</a></small>

Authentication is a critical aspect of building secure web applications that require user identification and access control. It ensures that users can securely access their accounts and protect sensitive information.

There are many ways to achieve that.

In this post we’re going to go through a practical example using Javascript and the popular Express framework, using a simple username/password mechanism (aka Local Strategy).

We’ll delve into practical examples and cover essential concepts, including user verification, session management, and authentication strategies

The examples use EJS, which is a templating package, but the same logic can be used in an API.

## What is authentication

Authentication is the process of verifying the identity of a user, usually involving a few common steps:

(1) the user provides their credentials;

(2) the credentials are verified by comparing them against stored information;

(3) if the credentials are valid, a session or token is created to allow access to protected resources; and

(4) once authenticated, the application can determine the user’s access privileges and permissions.

Using a username and a password is the most common mechanism of authentication. There are alternatives like [Single Sign-on (SSO)](https://en.wikipedia.org/wiki/Single_sign-on), [Multi-factor Authentication (MFA)](https://en.wikipedia.org/wiki/Multi-factor_authentication), and [OAuth](https://en.wikipedia.org/wiki/OAuth), which we won’t go into in this post.

## Spinning up an application

To better understand the concepts above, we’re going to be building a simple app using Express.

We’ll begin by spinning up the a project called “member-only” with [express-generator](https://expressjs.com/en/starter/generator.html) using [EJS](https://ejs.co/) to create templates:

```shell
$ npm install -g express-generator
$ express members-only --view ejs
```

Next we can install the packages we’re going to use. We’re also installing apps that are not related to authentication, but that are necessary in the app. I’ll explain what each one does as we use them.

```shell
$ npm i bcrypt compression connect-mongo cookie-parser dotenv express-asyn-handler express-session express-validator helmet mongoose nodemon passport passport-local
```

To run the app in dev mode and have it reload every time any changes are saved, add these scripts to package.json:

```json
"scripts": {
    "start": "node ./bin/www",
    "watch": "nodemon ./bin/www",
    "dev": "DEBUG=inventory-app:* npm run watch"
},
```

We’ll be using environment variables, so create a `.env` file in the root folder where you can save them in the format of `VARIABLE_NAME=value`.

### Database and models

We’ll use MongoDB to store app and sessions data. You can create one on the cloud for free on [Atlas Database](https://www.mongodb.com/atlas/database). Just follow the instructions they provide, as they’re pretty straight forward.

Once you create the database, you can create a collection called “members_only”. In the main Database page, click on “Connect” and you’ll be presented with a few options. Choose “Drivers” and select Node.js 5.5 or later.

Copy the Connection String and paste it to your .env file on a variable called `MONGO_DB`, adding the name of the collection after the domain:

```
MONGO_DB=mongodb+srv://<username>:<password>@top-test.yu3rgpr.mongodb.net/members_only?retryWrites=true&w=majority
```

In your project, create a file called `database.js` and add the following code:

```javascript
// database.js

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_DB;

async function main() {
  await mongoose.connect(mongoDB);
}

module.exports = main;
```

`require(“dotenv”).config()` is required to use the environment variables using `process.env.[VARIABLE_NAME]`. The rest of the code is for connecting to the database. We export it so it can be called in `app.js`:

```javascript
// app.js

const useDatabase = require("./database");
useDatabase().catch((err) => console.error(err));
```

We can then define our models like so:

```javascript
// models/users.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  hashed_password: { type: String, required: true },
  roles: [{ type: String, enum: ["admin", "member"] }],
  created_at: { type: Date, required: true },
});

UserSchema.virtual("full_name").get(function () {
  return this.first_name + " " + this.last_name;
});

module.exports = mongoose.model("User", UserSchema);
```

Notice we’re not storing the user’s actual password, but a hashed password. We’ll talk more about this in the next part.

### Routes and controllers

We'll define the routes in a separate file, and then call controller functions that will handle the logic for each of them:

```javascript
// routes/index.js

const express = require("express");
const router = express.Router();

const controller = require("../controller");

router.get("/", controller.index_get);
```

```javascript
// controller.js

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("./auth");

const logger = require("./logger");
const MessageSchema = require("./models/messages");

exports.index_get = asyncHandler(async function (req, res, next) {
  logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}}`);

  const messages = await MessageSchema.find({ deleted: false })
    .sort({ created_at: -1 })
    .populate("user")
    .exec();

  res.render("index", {
    title: "Members Only",
    user: res.locals.currentUser,
    isUserLoggedIn: !!res.locals.currentUser,
    messages,
  });
});
```

In short, we're defining a function `index_get` that queries the database to get all the messages, then renders an EJS view with the data. We’re using `asyncHandler` because it simplifies error handling.

To see how the other endpoints are handled, see the [Github repo](https://github.com/e-motta/members-only).

## Authentication

We’ll use [Passport](https://www.passportjs.org/) to handle authentication and sessions, and [bcrypt](https://www.npmjs.com/package/bcrypt) to handle password encryption.

### Creating a user

We’ll create users when they submit a form with the appropriate information. In order to do that, we need to add the following middleware function in `app.js`, as it will allow us to access the form data in `req.body`:

```javascript
// app.js

app.use(express.urlencoded({ extended: false }));
```

After that we can define controller functions `user_create_get` and `user_create_post` that will be called by the appropriate routes.

`user_create_get` will render the form using EJS, if the user is not already logged in:

```javascript
exports.user_create_get = asyncHandler(function (req, res, next) {
  logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}}`);

  if (res.locals.currentUser) {
    res.redirect("/");
    return;
  }

  logger.info("Rendering signup form");

  res.render("signup", {
    title: "Sign Up",
    user: null,
    isUserLoggedIn: false,
    newUser: {
      first_name: "",
      last_name: "",
      email: "",
    },
    errors: [],
  });
});
```

`user_create_post will` handle the data sent by the form, use this data to create a user with a hashed password, then redirect the user to the login page. You can do something similar with minor adjustments if you’re building an API.

Let’s take a look at the the code and then break it down:

```javascript
exports.user_create_post = [
  body("first_name", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "Last name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email").custom(async (value) => {
    value = value.toLowerCase();
    const emailExists = await UserSchema.exists({ email: value });
    if (emailExists) {
      throw new Error("Email already in use.");
    }
    return true;
  }),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmPassword", "Confirm password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password.");
    }
    return true;
  }),

  asyncHandler(async function (req, res, next) {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}}`);

    const errors = validationResult(req);

    const { first_name, last_name, email, password } = req.body;

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign Up",
        user: null,
        isUserLoggedIn: false,
        newUser: {
          first_name,
          last_name,
          email,
        },
        errors: errors.array(),
      });
      return;
    }

    try {
      bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
          return next(err);
        }

        const user = new UserSchema({
          first_name,
          last_name,
          email,
          hashed_password,
          roles: [],
          created_at: new Date(),
        });

        await user.save();
        res.redirect("/login?signup=success");
      });
    } catch (err) {
      next(err);
    }
  }),
];
```

We need to somehow validate the data we’re getting from the user. We can do that by using the `express-validator` package, which provides us the functions `body` and `validationResult`.

`body` is used for the fields validation with requirements such as minimum length and options like trimming and escaping the input. It is a callback function itself, so we pass it in an array to the router, along with the endpoint controller (inside the `asyncHandler`).

We can then get any errors inside the endpoint function using `validationResult(req)`. If there are any errors, we’ll just render the sign up page again.

When the inputs are valid, we can actually create the user. We’re using `bcrpyt` for that, as it allows us to create a hashed password with the user inputted password. This ensures that we never need to store the actual password, increasing security.

We need to call `bcrypt.hash` with a callback function that will take as arguments the actual password, a cost factor, and a callback function.

The cost factor indicates the computational cost of the hashing algorithm (the higher the number, the slower the process is, but the safer the encryption becomes). This process also involves [salting](<https://en.wikipedia.org/wiki/Salt_(cryptography)>), making the hashes unique even if two users have the same password.

The callback function takes a possible error and a `hashed_password` which we can then use to create the user in the database.

### Authentication strategies

Passport uses modules called “strategies” that encapsulate logic and configuration required to authenticate users. Each strategy corresponds to a different authentication method, such as local username/password, OAuth, OIDC, or JWT.

For this example, we’ll be using the **Local Strategy**.

Setting it up is as simple as passing a callback function to passport. We’re doing this in a separate file `auth.js`:

```javascript
// auth.js

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const UserSchema = require("./models/users");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await UserSchema.findOne({ email: username });

        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.hashed_password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
```

We import `passport` and call the `use` method, passing as its first argument an optional object with custom names for the `usernameField` and `passwordField`. If we don’t pass this object, the field names will default to `username` as `password`.

The second argument is a callback function with the logic for the strategy itself. In it we’re passing the `username` and `password`, which are used to query the database, fetch a user and compare the stored password.

We use `bcrypt` for this last step, as we’re not actually storing the password itself, but a hash value. The idea is `bcrypt` will take the provided password, generate a hash using the same cost factor and salt as before, and compare this hash with the value we have stored in the database. If they’re the same, the authentication is successful.

The callback function also takes a `done` argument, which is a function we need to call once the authentication flow is complete, either with no error and the user object, or with an error.

In this same file we’re also setting up serialization and deserialization, so passport can manage sessions more efficiently by storing only the user id instead of the whole user object.

```javascript
// auth.js

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserSchema.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
```

Finally, we export passport so it can be used in app.js

```javascript
// auth.js

module.exports = passport;
```

```javascript
// app.js

app.use(passport.initialize());
```

Once the user is authenticated, you can access it in the request object. To make your life easier, you can create a custom middleware function to store the user information in the response object, so you can access it in any other subsequent middleware or endpoint functions.

```javascript
// app.js

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
```

This must be called after initializing passport, but before using any routes.

### Sessions

After the authentication process is completed, we need to persist this information so it isn't lost everytime the page is refreshed.

Storing it in the application itself isn't ideal. If eventually we need to distribute processing by running it in more than one server, there would be no way of sharing the session information. If the server crashes, the session data would be lost and the users would be unexpectedly logged out. Lastly, it would consume server memory and disk space.

Instead, we should either send the session data back to the client, or store it in a database.

We'll be using `mongoSession` to store our sessions in a database. Create a file `mongoSession.js` and add the necessary configuration:

```javascript
// mongoSession.js

const MongoStore = require("connect-mongo");

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_DB,
  collectionName: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 60, // In minutes
});

exports.config = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
};
```

`mongoUrl` is the same Connection String we already have in our `.env` file. You may set option like `autoRemove` if you don’t want to persist session data indefinitely.

The secret is a string used to sign session information. It can be any string you want, but it’s recommended that’s a long, randomly generated, unique string. Save it as an environment variable to avoid sharing it.

Import the configuration and add it to `app.js`:

```javascript
// app.js

app.use(session(mongoSession.config));
// ...
app.use(passport.session());
```

Once that’s done, everytime a user is logged in the session information will be saved in your database, looking something like this:

```json
{
  "_id": "8GcyUWw67tb44h9vdWQKSxIcPgypIeUx",
  "expires": "2023-07-21T10:53:21.594+00:00",
  "session": {
    "cookie": {
      "originalMaxAge": null,
      "expires": null,
      "httpOnly": true,
      "path": "/"
    },
    "passport": { "user": "64a4a013cefdc295346ca0c3" }
  }
}
```

## Final words

Understanding authentication is vital for building secure applications with user identification and access control. In this post, we explored a practical example using JavaScript and Express, focusing on the Local Strategy for username/password authentication. Here’s a summary:

- Authentication involves verifying user identity, checking credentials, and granting access privileges.

- We built an Express app, used EJS templates, and implemented routes and controllers.

- `Passport` and `bcrypt` were used for authentication and password hashing.

- Sessions were managed using `mongoSession` and stored in a MongoDB database.

- The app followed a stateless approach, ensuring scalability and security.

By grasping authentication concepts and implementing secure practices, you can create robust applications that protect user data and provide a seamless user experience.
