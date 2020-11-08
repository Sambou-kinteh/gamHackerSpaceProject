const fs = require('fs');
var express = require('express');
var router = express.Router();
const adminDatabase = require('../adminlogin.json');
const loginTracker = require('./loginTracker.json');
const { setTimeout } = require('timers');
const { ADMINUSERLOGGEDIN } = require('./index');

/* GET admins listing. */
router.get('/', function(req, res, next) {
    res.redirect('/adminLogin');
    console.log('Redirected to admin login page');
});


//dev_chats get renderer
router.get('/dev_chats', (req, res) => {
    // const exportsFromIndex = require('./index');

    res.render('dev_chats', {title: "Welcome Admin"});
    // console.log(exportsFromIndex.ADMINUSERLOGGEDIN);
    console.log('Should print the login data');
    // setTimeout(() => {console.log('after 5 sec')}, 5000);
});


router.post('/LOGOUT', (req, res) => {
    const exportsFromIndex = require('./index');
    // const ADMINUSERLOGGEDIN = exportsFromIndex.export;
    console.log(req.body);
    const ADMINUSERLOGGEDIN = ['sambou.kinteh'];
    if (req.body.LOGOUT == ""){
        console.log('Testing the logout request');
        // res.redirect('/');
        console.log(ADMINUSERLOGGEDIN);
        const REQUESTEDPERSON = adminDatabase.find(f => f.userName == ADMINUSERLOGGEDIN[0]);
        //update the users login status
        REQUESTEDPERSON.notLoggedin = 'true';
        fs.writeFile('./adminlogin.json', JSON.stringify(adminDatabase), err => console.log(err));
        // exportsFromIndex.ADMINUSERLOGGEDIN.pop();

        //delete the person from our log history
        const REQUESTEDPERSONLOG = loginTracker.filter(f => f.userName != ADMINUSERLOGGEDIN[0]);
        fs.writeFile('./routes/loginTracker.json', JSON.stringify(REQUESTEDPERSONLOG), err => {console.log(err)});
        res.send('Working on it');
        console.log(REQUESTEDPERSONLOG);
        // TODO: DRAIN STORM
        //LOGIN KEEPER ALGORITHM
        //create json file for every individual that is logged in and also the file should be
        //global in every scope of the project
        //a folder for keeping user activities in app
        //keeps data temporary then delete when the user logs out
        // time() //try use this if user wants not to be logged in all the time.
    }else{
        console.log('Didn\'t Logout');
    }
  
});











module.exports = router;