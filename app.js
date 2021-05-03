//jshint esversion:6
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const alert=require("alert");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy=require('passport-facebook').Strategy;
const findOrCreate=require("mongoose-findorcreate");

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})) ;
app.use(express.static("public")) ;
app.use(session({
    secret:"Thisisasecret.",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
/* -------------------------------- mongoose Schemas and Models -------------------------------- */

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex: true});
const userSchema=new mongoose.Schema(
    {
        email:String,
        password:String,
        googleId:String,
        facebookId:String
    }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});

/* ----------------------------------GET AND POST METHODS ---------------------------------- */

// GET REQUESTS 
app.get("/",(req,res)=>{
    res.render("home");
})
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook')
  );
  app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated())
    {
        res.render("secrets");
    }
    else
    {
        res.redirect("/login");
    }
})

// POST REQUESTS 
app.post("/register",(req,res)=>{
  User.register({username:req.body.username},req.body.password,(err,user)=>{
      if(err)
      {
          console.log(err);
          res.redirect("/register");
      }
      else
      {
         res.redirect("/login");
      }
  })
})
app.post("/login",(req,res)=>{
   const user=new User({
       username:req.body.username,
       password:req.body.password
   });
   req.login(user,(err)=>{
       if(err)
       {
           console.log(err);
       }
       else
       {
           passport.authenticate("local")(req,res,()=>{
               res.redirect("/secrets");
           })
       }
   });
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
})



/* ----------------------------------LISTENING TO THE PORT ---------------------------------- */
app.listen(3000,()=>{
    console.log("Server started successfully.");
})