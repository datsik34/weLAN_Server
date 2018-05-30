// const router = require('express').Router();
// const mongoose = require('mongoose');
//
// const options = {
//   server: {
//     socketOptions: {
//       connectTimeoutMS: 5000
//     }
//   }
// };
//
// mongoose.connect('mongodb://roem:azerty@ds237610.mlab.com:37610/welan', options, err => {
//   if (err) {
//     console.log(err);
//   }
// });
//
// let eventSchema = mongoose.Schema({
//     "author": { // informations relatives à l'organisateur
//       "id": String, // id de l'organisateur
//       "username": String, // username de l'organisateur
//       "email": String, // email de l'organisateur
//       "phone": String // numéro de téléphone de l'organisateur
//     },
//     "platforms": String, // pc ou console
//     "games": [String], // jeux sélectionnés
//     "dates": { // dates de l'event
//       "start": Date, // date début
//       "end": Date // date fin
//     },
//     "location": Map, // localisation de l'event (type incertain)
//     "info": { // info relatives à l'event
//       "event_name": String, // nom de l'event
//       "description": String, // description de l'event
//       "participants": { // infos relatives aux participants
//         "quantity": { // nombre de participants
//           "current": Number, // nombre actuel
//           "max": Number, // nombre maximum
//         },
//         "members": [
//           {
//             id: String,
//             username: String,
//             description: String,
//             phone: String
//           }
//         ] // liste des membres
//       },
//       "age": { // age de participation à l'event
//         "min": Number, // age minimum
//         "max": Number // age maximum
//       },
//       "skill": String, // niveau de jeu
//       "smoking": Boolean // event fumeur ou non fumeur
//     }
//   }),
//   eventsModel = mongoose.model('event', eventSchema);
//
// router.post('/organize', (req, res, next) => {
//   let event = new eventsModel({
//     "author": {
//       // informations relatives à l'organisateur
//       "id": req.body.id
//         ? req.body.id
//         : null, // id de l'organisateur
//       "username": req.body.username
//         ? req.body.username
//         : null, // username de l'organisateur
//       "email": req.body.email
//         ? req.body.email
//         : null, // email de l'organisateur
//       "phone": req.body.phone
//         ? req.body.phone
//         : null // numéro de téléphone de l'organisateur
//     },
//     "platforms": req.body.platforms
//       ? req.body.platforms
//       : null, // pc ou console
//     "games": [req.body.games]
//       ? [req.body.games]
//       : [null], // jeux sélectionnés
//     "dates": {
//       // dates de l'event
//       "start": req.body.dates.start
//         ? req.body.dates.start
//         : null, // date début
//       "end": req.body.dates.end
//         ? req.body.dates.end
//         : null // date fin
//     },
//     "location": req.body.location
//       ? req.body.location
//       : null, // localisation de l'event (type incertain)
//     "info": {
//       // info relatives à l'event
//       "event_name": req.body.info.event_name
//         ? req.body.info.event_name
//         : null, // nom de l'event
//       "description": req.body.info.description
//         ? req.body.info.description
//         : null, // description de l'event
//       "participants": { // infos relatives aux participants
//         "quantity": {
//           // nombre de participants
//           "current": req.body.info.participants.quantity.current
//             ? req.body.info.participants.quantity.current
//             : null, // nombre actuel
//           "max": req.body.info.participants.quantity.max
//             ? req.body.info.participants.quantity.max
//             : null, // nombre maximum
//         },
//         "members": [
//           {
//             id: null,
//             username: null,
//             description: null,
//             phone: null
//           }
//         ] // liste des membres
//       },
//       "age": {
//         // age de participation à l'event
//         "min": req.body.info.age.min
//           ? req.body.info.age.min
//           : null, // age minimum
//         "max": req.body.info.age.max
//           ? req.body.info.age.max
//           : null // age maximum
//       },
//       "skill": req.body.info.skill
//         ? req.body.info.skill
//         : null, // niveau de jeu
//       "smoking": req.body.info.smoking
//         ? req.body.info.smoking
//         : null // event fumeur ou non fumeur
//     }
//   });
//
//   event.save((err, event) => {
//     if (err) {
//       return res.json({success: false, err: err});
//     }
//     return res.json({success: true, user});
//   });
// });
//
// router.post('/participate', (req, res, next) => {
//   let user = {},
//     propsArray = ['username', 'description', 'phone'];
//
//   propsArray.map(e => {
//     if (req.body[e]) {
//       return user[e] = req.body[e];
//     }
//   });
//
//   usersModel.find({
//     _id: req.body.id
//   }, user, err => res.json({success: true, user}));
// });
