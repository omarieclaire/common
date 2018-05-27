# common

Common is a play experience for communities. 

Common begins with a single player, a node floating around on a website (commonplay.ca). They exist in a vast nothingness. The first thing they notice is that their life-force is decreasing, they are slowly eroding into the nothingness.

There is an enemy, the “unmaker”; a force that deteriorates the life-force of players and the life-force of the connections between them. 

The only way to fight against this erosion is by inviting people to join Common: building connections with new players. Players are sources of energy, and strong connections allow life-energy to regenerate and flow. 


## Getting Started

```shell
npm install firebase-tools
./node_modules/.bin/firebase login
```

## Deploying

Run

```shell
./node_modules/.bin/firebase deploy --project common-d2ecf
```

You may need the following to deploy the cloud functions:

* `functions/gmail.json` containing a `json` object like `{ "email": "", "password": ""}`
* `functions/serviceAccountKey.json` which you need to get from `firebase`.
* ensure the `functions/node_modules` has all the right dependencies, i.e. `nodemailer`

## Developing

Run

```shell
./node_modules/.bin/firebase serve --project common-d2ecf
```

This will allow you to access common at [http://localhost:5000](http://localhost:5000). You need to work this way so we can access `firebase` and allow it to vendor credentials.

## Blowing away the authenticated user database

Make sure you've got `firebase-admin` installed:

```shell
npm install firebase-admin --save
```

Then run the script:

```shell
node deleteAuthUsers.js
```

Note that you will need the `serviceAccount.json` credentials, which you can download from the firebase admin and then cp them into `node_modules`.
