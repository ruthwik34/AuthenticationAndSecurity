//jshint esversion:6
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const alert=require("alert");

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})) ;
app.use(express.static("public")) ;

/* -------------------------------- mongoose Schemas and Models -------------------------------- */

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true,useUnifiedTopology:true});
const userSchema=new mongoose.Schema(
    {
        email:String,
        password:String
    }
);
const User=new mongoose.model("User",userSchema);



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

// POST REQUESTS 
app.post("/register",(req,res)=>{
    User.findOne({email:req.body.username},(err,foundItem)=>{
        if(foundItem)
        {
            alert("An account with the email already exists.Try a different one.");
            res.redirect("/register");
        }
        else
        {
            var newUser=new User({
                email:req.body.username,
                password:req.body.password
            });
            newUser.save((err)=>{
                if(err) console.log(err);
                else
                {
                    alert("Account Created Successfully. Try Logging in using your email and password");
                    res.redirect("/login");
                }
            });
        }
    })
})
app.post("/login",(req,res)=>{
    User.findOne({email:req.body.username},(err,foundItem)=>{
        if(err) console.log(err);
        else{
            if(foundItem)
            {
                if(foundItem.password===req.body.password)
                {
                    res.render("secrets");
                }
                else
                {
                    alert("Wrong Password. Try Again");
                    res.redirect("/login");
                }
            }
            else
            {
                alert("Account does not exist with the email entered , Try with a different one");
                res.redirect("/login");
            }
        }
    })
})
app.get("/logout",(req,res)=>{
    res.redirect("/");
})



/* ----------------------------------LISTENING TO THE PORT ---------------------------------- */
app.listen(3000,()=>{
    console.log("Server started successfully.");
})