
const bcrypt = require("bcrypt")
const passport = require("passport");
const { Strategy } = require("passport-local");
const hashedpwd = bcrypt.hashSync("w", 10)
const methodOverride = require("method-override")


const users = []

users.push({
    id: Date.now().toString(),
    email: "w@w",
    password: hashedpwd,
    name: "wffdddssdd"
})

passport.use(
    new Strategy({ usernameField: "email", passwordField: "password" },
        function (email, password, done) {

            const user = users.find(function (element) { return element.email === email })


            if (user == null) {
                console.log("--------- no user ----------");
                return done(null, false, { message: "no user with that email" })
            }

            bcrypt.compare(password, user.password).then(function (isMatch) {
                console.log(password, user.password)

                if (isMatch) {
                    console.log("------------- pwd     match -----------")
                    return done(null, user)
                }
                else {
                    console.log("------------- pwd not match -----------")
                    return done(null, false, { message: "password incorrect" })
                }

            })
        }
    )
)





const express = require("express")
const flash = require("express-flash")
const session = require("express-session")
const app = express()


app.set("view engine", "ejs")
app.use(express.static("./views"))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(flash())


app.use(session({ secret: "secreta", resave: false, saveUninitialized: false,/*cookie: { secure: false,maxAge:  3600000}*/ }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))


passport.serializeUser(
    function (user, passToSession) {
        console.log("///// In serializeUser //////");

        passToSession(null, user)
    })

// deserializze user out from the req.session, hence can get req.user
passport.deserializeUser(
    function (user, getFromSession) {
        console.log("///// In deserializeUser //////");


        getFromSession(null, user)
    })

function checkAuthenticated(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    req.isAuthenticated() ? res.redirect("/") : next()
}





app.get("/login", checkNotAuthenticated,function (req, res) { res.render("login") })
app.delete("/logout", function (req, res) {  req.logOut();res.redirect("/login")})

  
    


app.post("/login",
    [
        checkNotAuthenticated,
        passport.authenticate(
            "local",
            { successRedirect: "/", failureRedirect: "/login", failureFlash: true },

        )
    ]
)

app.post("/aa", checkNotAuthenticated,function(req,res){
    
})

app.get("/", checkAuthenticated,function (req, res) {


    res.render("index", { name: req.user.name, email: req.user.email, pass: req.user.password, session: JSON.stringify(req.session, null, 4) })

  
    console.log(req.user)
})





app.get("/register", checkNotAuthenticated,function (req, res) {

    res.render("register")

})
app.post("/register", checkNotAuthenticated,function (req, res) {


    bcrypt.hash(req.body.password, 10).then(function (hashedPassword) {

        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword

        })

        const user = users.find(element => { return element.email === req.body.email })
       
        
       req.login(user,function(err){

            res.redirect("/")

       })

       console.log(users)
       
        //res.send(user)
        

    })

})
app.listen(80)