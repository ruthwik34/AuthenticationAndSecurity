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

/* -------------------------------- mongoose Schemas and Models -------------------------------- */

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex: true});
const userSchema=new mongoose.Schema(
    {
        email:String,
        password:String
    }
);

userSchema.plugin(passportLocalMongoose)
const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ----------------------------------GET AND POST METHODS ---------------------------------- */

// GET REQUESTS 
app.get("/",(req,res)=>{
    res.render("home");
})
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
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/secrets");
          })
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