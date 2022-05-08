## Firebase Security Rules

![react-firebase-starter](https://user-images.githubusercontent.com/68360696/129435412-11320287-3afd-4e9d-8595-7194bc358c47.png)

[Firebase Security Rules](https://firebase.google.com/docs/rules/rules-behavior) provide robust, completely customizable protection for your data in Cloud Firestore, Realtime Database, and Cloud Storage.
These rules stand between your data and the users. They decide who is allowed to get access to your data.
Every request for every CRUD operation on your data goes through them and they make final decision if that request should go through or not.
In this chapter to our Firebase Course, we will be writing and adding security rules to our application.

### Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [SetUp Guide](#setup-guide)
- [Firebase SetUp](#firebase-setup)
- [Project Functionality](#project-functionality)
- [Test](#test)
- [Deploy](#deploy)
- [Contribute](#contribute)
- [License](#license)

### Tech Stack

- [Firebase](https://firebase.google.com/) - Firestore database, auth, cloud functions, local emulators
- [React](https://reactjs.org/)
- [Webpack](https://webpack.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/web)
- [react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks/)
- [React Helmet](https://www.npmjs.com/package/react-helmet) - SEO
- [Mocha](https://mochajs.org/) - testing for Firebase
- [ESLint](https://eslint.org/) - based on AirBnB config

### Prerequisites

You will need the following to use this starter:

- [Node](https://nodejs.org/en/)
- [Java DK](https://docs.oracle.com/en/java/javase/16/install/overview-jdk-installation.html#GUID-8677A77F-231A-40F7-98B9-1FD0B48C346A)
- [Firebase CLI](https://github.com/firebase/firebase-tools)

### SetUp Guide

Once you have installed the required package shown on the [Required Installations](#required-installations), follow these [instructions]() to setup the app locally.

Clone this repo:

```Shell
your@pc:~$ git clone https://github.com/adaorachi/codebuster-firebase-course-assessment.git
```

Make sure to checkout to the branch named add-firebase-rules:

```Shell
your@pc:~$ git checkout add-firebase-rules
```

Install the dependencies:

```Shell
your@pc:~$ cd .\codebuster-firebase-course-assessment\ && npm install
```

Also install the dependencies in `/functions` folder to use Firebase cloud functions:

```Shell
your@pc:~$ cd functions && npm install
```

Return to the client side and start the app:

```Shell
your@pc:~$ cd .. && npm start
```

### Firebase Setup

Follow these [instructions](https://github.com/codebusters-ca/firebase-course/blob/mentorship/README.md#setting-up-firebase) to setup and run the firebase tools for your app.

### Project Functionality

In this app, it has multiple users. Each of the users has a profile and a to-do list. There is also a directory of users that allows everyone to view each other's profiles.

The main goal of this project is to add and update the security rules located in `firestore.rules` in the root directory. These rules should control the database access like granting certain access to certain users.

The security rule functionalities should give or deny access in this manner:

- Any authenticated user can create to-do items for themselves.
- Any authenticated user can view and update their to-do items.
- Any authenticated user can create a profile and view others' profiles.
- Any authenticated user can edit their profile.
- Admins can edit any user's profile.
- isAdmin field cannot be updated by anyone.

Kindly view the `firestore.rules` file for full implementation of the above functionalities.

### Test

This uses a TDD approach to test all security rule functionalites for this application and ensure they work as expected.

Start the firebase emulators:

```Shell
your@pc:~$ npm run emulators
```

In another terminal, run:

```Shell
your@pc:~$ npm test
```

You should see a list of 12 test cases that all pass.

### Deploy

```Shell
your@pc:~$ npm run build
```

### Contribute

We ❤️ feedback and help from fellow devs! Check out [open issues](https://github.com/codebusters-ca/react-firebase-starter/issues), create a [new one](https://github.com/codebusters-ca/react-firebase-starter/issues/new?labels=bug), or send us a [pull request](https://github.com/codebusters-ca/react-firebase-starter/compare).

### License

This project is licensed under the [MIT license](https://github.com/codebusters-ca/react-firebase-starter/blob/main/LICENSE).
© 2022 GitHub, Inc.
Terms
Privacy