const fs = require('fs');
var express = require('express');
var router = express.Router();
// const mysql = require('mysql');
const adminDatabase = require('../adminlogin.json');
const userDatabase = require('../userlogin.json');
// const app = require('app');
const requestIp = require('request-ip');
const ipFile = require('../ip.json');
const UserIpFile = require('../userIp.json');
const http = require('http');
const postman = require('postman-request');
const loginTracker = require('./loginTracker.json');

const APIKEY = 'gAmHaCk2020&fOrEvErKEY';
//TODO: NOTE : THE IP.JSON FILE IS ONLY FOR ADMINS AND USERIP.JSON IS FOR USERS

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

** '/'            DESCRIPTION: renders home page             =>                     METHODS: GET,
** '/register'    DESCRIPTION: register new users            =>                     METHODS: POST AND GET,
** '/Contacts'    DESCRIPTION: users to send feed to admin   =>                     METHODS: POST AND GET,
** '/aboutus'     DESCRIPTION: users see what we about       =>                     METHODS: GET,
** '/admins/dev_chats'   DESCRIPTION: admins can chat about important stuff !       METHODS: POST, GET,
** '/adminLogin'  DESCRIPTION: admins to login               =>                     METHODS: POST, GET,
** '/adminSignup' DESCRIPTION: signs up admins               =>                     METHODS: POST, GET
** '/users'   DESCRIPTION: redirect to login if not logged in else give departments METHODS: GET,POST(SHOULD),
** '/users/departments'   DESCRIPTION: users see our aim:to change to Departments   METHODS: GET:POST(SHOULD),
others soon
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

//admin login
router.get('/adminLogin', (req, res) => {
  var RequestingPerson = loginTracker.find(f => f.userName == ADMINUSERLOGGEDIN[0]);

  if (RequestingPerson == undefined && loginTracker.length < 1){
    res.render('login_signup', { title: 'Login / Signup', error_data: 'none', notFoundData: 'none'});
  }else{
    res.redirect('/admins/dev_chats');
  }
  
});

router.get('/userLogin', (req, res) => {
  res.render('userlogin_signup', {title: 'Register'});
});
  

/*TODO: POST REQUESTS FOR API */

router.post('/userLogin', (req, res) => {
  var isUserFound = [];
  const IF_LOGIN = req.body.username;
  if (IF_LOGIN) {
    //if user wants to login
    const { userName, passWord } = req.body;
    const requestingPerson = userDatabase.map(f => f.userName == userName);
    var notLoggedIn = requestingPerson.notLoggedin;

    if (notLoggedIn == 'false' && passWord == requestingPerson.passWord){
      res.redirect('/users/departments');
    }else if (userName == requestingPerson.userName && passWord == requestingPerson.passWord && notLoggedIn == 'true') {
      //update the persons login status
      //login the person
      requestingPerson.notLoggedin = 'false';
      fs.writeFile('./userlogin.json', JSON.stringify(userDatabase), err => console.log(err));
      res.redirect('/users/departments');
    }else{
      console.log('Unknown Error');
      res.end('Unknown Error');
    }
  //end of login 
  }else{
    //if user wants to signup
    const { fullname, password, retyped, gender, email, phone} = req.body;
    
    console.log('Posting user signup data');
    const userUsernames = userDatabase.map(f => f.userName);
    const userEmail = userDatabase.map(f => f.email);
    const userPhone = userDatabase.map(f => f.phone);

    if (userDatabase.length != 0) {

      for (let index = 0; index < userUsernames.length; index++) {
        const element = userUsernames[index];
        const elementEmail = userEmail[index];
        const elementPhone = userPhone[index];
        console.log(userDatabase.length);
        if (elementEmail == email && elementPhone == phone || element == fullname){
          isUserFound.push('true');
          console.log('Sorry but username and phone number is taken');
          break
        }else{
          isUserFound.pop();
          isUserFound.push('false');
        }
        
      }
    //loop ends
    }else{console.log('Good')}

    //ALGORITHM LOGIC TWO
    const ifUserExists = isUserFound[isUserFound.length -1] != 'false' && userDatabase.length != 0;
    // console.log(isUserFound);
    //TODO: Check all conditions then sign em up
    if (password != retyped){
      console.log('Incorrect password');
    }
    else if(ifUserExists){
      console.log('User Exists');
    }
    else{
      const userIp = req.clientIp;
      //add person to the database
      const userId = userDatabase.map(f => f.id);

      const newUser = {
        id: (userId.length > 0 ? Math.max(...userId) : 0) + 1,
        fullname,
        password,
        retyped,
        gender,
        email,
        phone
      }
      const newIp = {
        fullname,
        userIp
      }
      const newLoginLog = {
        fullname
      }
      //add the person to json file userlogin.json
      const newUserConcat = userDatabase.concat(newUser);
      fs.writeFile('./userlogin.json', JSON.stringify(newUserConcat), err => console.log(err));
      //add the users ip address
      const newUserIpConcat = UserIpFile.concat(newIp);
      fs.writeFile('./userIp.json', JSON.stringify(newUserIpConcat), err => console.log(err));
      //add the users login log to logintrackeruser.json
      const newUserLogConcat = UserIpFile.concat(newLoginLog);
      fs.writeFile('./routes/loginTrackerUser.json', JSON.stringify(newUserLogConcat), err => console.log(err));

      //redirect to user departments
      res.redirect('/users/departments');
    }

  //end of signup
  }
  // res.render('departments', {title: 'Welcome User'});
});

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
      res.render('login_signup', {error_data: 'Api Key invalid',  notFoundData: 'none'});
      console.log('API');
      res.end();
      
      //if PASSWORD IS INCORRECT
    }else if (passWord != reTypePassword) {
      res.render('login_signup', {error_data: 'Passwords do not match',  notFoundData: 'none'});
      console.log('Pass');
      res.end();
      
      //if username already exists
    }else if (userExists) {
      res.render('login_signup', {error_data: 'Username Already Exists',  notFoundData: 'none'});
      console.log('User');
      res.end();

      //if pass is not strong
    }else if ( !(passWord.match(PASSWORDPATTERN)) ) {
      console.log('inc');
      res.render('login_signup', {error_data: 'Password doesn\'t match standards defined',  notFoundData: 'none'});
      res.end();

    //if username is not up to standard
    }else if ( !(userName.match(USERNAMEPATTERN)) ) {
      console.log('inc');
      res.render('login_signup', {error_data: 'Username doesn\'t match standards defined' ,  notFoundData: 'none'});
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

/* REQUESTS */
//TODO: END POINT FOR USER REGISTION PAGE DONE
//TODO: END POINT FOR CONTACT POST REQUEST DONE
//TODO: also add put request
//TODO: also add delete request
//TODO: also add if person did sign out DONE




// module.exports.ADMINUSERLOGGEDIN = ADMINUSERLOGGEDIN;
module.exports = router;


