const fs = require('fs');
var express = require('express');
var router = express.Router();
// const mysql = require('mysql');
const adminDatabase = require('../adminlogin.json');
// const app = require('app');
const requestIp = require('request-ip');
const ipFile = require('../ip.json');
const http = require('http');
const postman = require('postman-request');
const loginTracker = require('./loginTracker.json');

const APIKEY = 'gAmHaCk2020&fOrEvErKEY';

//contains user thats logged in
const ADMINUSERLOGGEDIN = [];

//TODO: INTEGRATION WITH MYSQL LATER
// var CONFIG = {
//   host: "gam-hacker-space.mysql.database.azure.com",
//   user: 'gamHackerSam@gam-hacker-space',
//   password: "Samboulkinteh1",
//   database: "adminDatabase",
//   port: 3306,
//   ssl: true
// }

// const mySqlcon = mysql.createConnection(CONFIG);

// mySqlcon.connect((err) => {
//   if (err) {
//       console.log("!!! CANNOT CONNECT !!! Error !!");
//       //throw err;
//   } else {
//       console.log("Connected!");
//       mySqlcon.query('USE adminDatabase;', (err, result, fields) => {
//       if (err) throw err;
//         else console.log(result)
//       })
//   }
// });

/*TODO: END POINT FOR THE API

** '/'            DESCRIPTION: renders home page             =>           METHODS: GET,
** '/register'    DESCRIPTION: register new users            =>           METHODS: POST AND GET,
** '/Contacts'    DESCRIPTION: users to send feed to admin   =>           METHODS: POST AND GET,
** '/aboutus'     DESCRIPTION: users see what we about       =>           METHODS: GET,
** '/ambitions'   DESCRIPTION: users see our aim:to change to Departments METHODS: GET:POST(SHOULD),
** 'admins/dev_chats'   DESCRIPTION: admins can chat about important stuff      METHODS: POST, GET,
** '/adminLogin'  DESCRIPTION: admins to login               =>           METHODS: POST, GET,
** '/adminSignup' DESCRIPTION: signs up admins               =>           METHODS: POST, GET

*/

//quotes to display in index
quoteArr = ['Tech Geek our personality', 'Implicit is always better than explicit', 'Write once, Run anywhere', 
            'Coding is our hobby', 'Design is our tool']

/*TODO: GET REQUESTS FOR API */

//GET home page 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The HackGam Project', quoteSeq: quoteArr[ Math.round(Math.random() * 4) ] });
  console.log('Getting main site');
});

//register endpoint is for new users and users generally
router.get('/register', (req, res) => {
  res.render('userlogin_signup', {title: 'Register'});
});

//contacts page get renderer
router.get('/Contacts', (req, res) => {
  res.render('contacts', { title: 'Contacts' });
});

//aboutus page get renderer
router.get('/aboutus', (req, res) => {
  // TODO: WORKING 
  // res.render('aboutus', { title: 'About Us' });
  res.send('Working on it :)');
});

//ambitions get renderer
router.get('/departments', (req, res) => {
  // TODO: WORKING
  // res.render('goals', { title: 'Ambitions' });
  res.send('Working on it :)');
});

// router.get('/dev_chats', (req, res) => {
  //   res.render('dev_chats', { title: 'Dev Chat' });
  // });
  
//admin login
router.get('/adminLogin', (req, res) => {
  var RequestingPerson = loginTracker.find(f => f.userName == ADMINUSERLOGGEDIN[0]);

  if (RequestingPerson == undefined && loginTracker.length < 1){
    res.render('login_signup', { title: 'Login / Signup', error_data: 'none', notFoundData: 'none'});
  }else{
    res.redirect('/admins/dev_chats');
  }
  
});
  

/*TODO: POST REQUESTS FOR API */

//admin login request post
router.post('/adminLogin', (req, res) => {
  const { userName, passWord } = req.body;

  var RequestingPerson = adminDatabase.find(f => f.userName == userName);

  if (adminDatabase.length < 1) {
    res.render('login_signup', {title: 'SignUP', error_data: 'none', notFoundData: 'Please Sign UP'});
  }
  else{
    var notloggedIn = RequestingPerson.notLoggedin;
  }

  if(notloggedIn == 'false' && passWord == RequestingPerson.passWord){
    console.log('if user in database and logged in');
    // TODO: WORKING
    // res.render('dev_chats', {title: 'Welcome Back'});
    res.redirect('/admins/dev_chats');
    res.end();
    
    ADMINUSERLOGGEDIN.push(userName);
    console.log(ADMINUSERLOGGEDIN);
    const newLogData = {
      userName
    }
    //concat the old and new
    const newLogDataConcat = loginTracker.concat(newLogData);
    fs.writeFile('./routes/loginTracker.json', JSON.stringify(newLogDataConcat), err => console.log(err));

  }else if (userName == RequestingPerson.userName && passWord == RequestingPerson.passWord && (notloggedIn == "true")){
    console.log('if user in database but not logged in');
    var lastLoginNow = Date();
    //fields to add in adminDatabase, logggin and loastlogin
    RequestingPerson.notLoggedin = 'false';
    console.log(RequestingPerson.notLoggedin);
    RequestingPerson.lastLogin = lastLoginNow;

    ADMINUSERLOGGEDIN.push(userName);
    //write to the json file
    fs.writeFile("./adminlogin.json", JSON.stringify(adminDatabase), err => console.log(err));
    console.log('writed to Json file');
    // TODO: WORKING
    res.render('dev_chats', {title: 'Dev Chats'}); 
    // res.send('Working on it :)')
    const newLogData = {
      userName
    }
    //concat the old and new
    const newLogDataConcat = loginTracker.concat(newLogData);
    fs.writeFile('./routes/loginTracker.json', JSON.stringify(newLogDataConcat), err => console.log(err));
    
    
  }else{
    //prompt if username or password is incorrect
    res.render('login_signup', {notFoundData: 'Username or Password Incorrect', error_data: 'none'});
    console.log('if username or pass incorrect');
  }
  
});

//sigup method ADMIN
router.post('/adminSignup', (req, res) => {
  // console.log(req.body);
  const PASSWORDPATTERN = /[a-z]*/i; //TODO: WORKING
  const USERNAMEPATTERN = /[a-z]*/i; //TODO: WORKING
  const { userName, passWord, reTypePassword, APIKEY_GIVEN} = req.body;

  // console.log(userName, passWord, reTypePassword, APIKEY_GIVEN); TEST PASSED
  console.log('Posting signup data');

  const adminUserNames = adminDatabase.map(f => f.userName);

  //TODO: ALGORITHM ONE
  //if user is in database
  var isFoundStorage = ["false"];

  try {

    //CHECK IF OLD USER
    for (let index = 0; index < adminUserNames.length; index++) {
      const element = adminUserNames[index];

        //while not found a matching user, keep runing the if statement
        if (element == userName && adminUserNames.length != 0) {
          isFoundStorage.push("true");
          break
        }else{
          isFoundStorage.push("false");
        }

      
      //for loop ends
    }

    var userExists = (isFoundStorage[isFoundStorage.length - 1] != "false");

    //NEW USER
    //TODO: ALL TYPE CHECKS SHOULD GO TO LOGIN_SIGNUP.EJS || TRY TO USE (IF DATA IS TRUE) IN EJS
    //if API KEY IS INCORRECT
    if (APIKEY != APIKEY_GIVEN) {
      res.render('login_signup', {error_data: 'Api Key invalid'});
      console.log('API');
      res.end();
      
      //if PASSWORD IS INCORRECT
    }else if (passWord != reTypePassword) {
      res.render('login_signup', {error_data: 'Passwords do not match'});
      console.log('Pass');
      res.end();
      
      //if username already exists
    }else if (userExists) {
      res.render('login_signup', {error_data: 'Username Already Exists'});
      console.log('User');
      res.end();

      //if pass is not strong
    }else if ( !(passWord.match(PASSWORDPATTERN)) ) {
      console.log('inc');
      res.render('login_signup', {error_data: 'Password doesn\'t match standards defined'});
      res.end();

    //if username is not up to standard
    }else if ( !(userName.match(USERNAMEPATTERN)) ) {
      console.log('inc');
      res.render('login_signup', {error_data: 'Username doesn\'t match standards defined'});
      res.end();

    }else {

      const IP = req.clientIp;
      router.get(`https://ip-geolocation.whoisxmlapi.com/api/v1?apiKey=at_yth0IYnfALEKLgz2HOcsb2xKFodBJ&ipAddress=46.223.161.96`, (req, res) => {
        console.log(res);
        console.log('Clap for yourself');
      });
      //get user ip address
      //Ip API
      // const API_SITE_IP = `https://ip-geolocation.whoisxmlapi.com/api/v1?apiKey=at_yth0IYnfALEKLgz2HOcsb2xKFodBJ&ipAddress=${IP}`
      const newIp = {
        userName,
        IP
      }
      //concat with the existing
      var ipConcat = ipFile.concat(newIp);
      //save to ip.json root file
      fs.writeFile('./ip.json', JSON.stringify(ipConcat), err => console.log(err));

      console.log('OK');
      //CREATE NEW USER
      //redundant SHOULD CHANGE
      this.delete = isFoundStorage; 
      //if user not in database and apikey matches then create new user
      const userId = adminDatabase.map(f => f.id);
      var lastLogin = Date();
      var notLoggedin = 'false';
      const newUser = {
        id: (userId.length > 0 ? Math.max(...userId) : 0) + 1,
        userName,
        passWord,
        lastLogin,
        notLoggedin
      }
      //push the users id into array for advanced logic
      
      //add new user to database through concat
      const newAddedUserConcat = adminDatabase.concat(newUser);
      //write to file
      fs.writeFile('./adminlogin.json', JSON.stringify(newAddedUserConcat), err => console.log(err));
      ADMINUSERLOGGEDIN.push(userName);
      
      const newLogData = {
        userName
      }
      
      const newLogDataConcat = loginTracker.concat(newLogData);
      fs.writeFile('./routes/loginTracker.json', JSON.stringify(newLogDataConcat), err => console.log(err));
      
      res.redirect('/admins/dev_chats');    //TODO: WORKING
      res.end();                                        //TODO: WORKING
      // res.send('Working on it :)');
      

    }
    
  }catch (Exception) {
    //if error
    // res.send('Error Occured. Please contact our support for assistance and bug report. Thank you');
    // res.end();
    console.log(Exception);
    console.log('ERROR');
  }
  
  //POST SIGNUP ENDS
});

//TODO:logout method


router.post('/register', (req, res) => {
  res.send('Working');
  
});

/* REQUESTS */
//TODO: END POINT FOR USER REGISTION PAGE
//TODO: END POINT FOR CONTACT POST REQUEST
//TODO: also add put request
//TODO: also add delete request
//TODO: also add if person did sign out




// module.exports.ADMINUSERLOGGEDIN = ADMINUSERLOGGEDIN;
module.exports = router;


