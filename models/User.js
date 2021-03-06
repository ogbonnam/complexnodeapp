const bcrypt = require('bcryptjs')
const validator = require('validator')
const usersCollection = require('../db').db().collection('users')
let User = function(data){
   this.data = data
   this.errors = []
}
User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string"){
        this.data.username = ""
    }
    if(typeof(this.data.email) != "string"){
        this.data.email = ""
    }
    if(typeof(this.data.password) != "string"){
        this.data.password = ""
    }

    //Get rid of bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}
User.prototype.validate = function(){
    if(this.data.username == ""){
        this.errors.push("You must provide a username")
    }
    if(this.data.email == ""){
        this.errors.push("You must provide an email")
    }
    if(this.data.password == ""){
        this.errors.push("You must provide a password")
    }
    if(this.data.password.length > 0 && this.data.password.length < 12){
        this.errors.push("Passwords must be 12 characters long")
    }
    if(this.data.password.length > 50){
        this.errors.push("Passwords cannot exceed 50 characters")
    }
    if(this.data.username.length > 0 && this.data.username.length < 3){
        this.errors.push("Username must have a minimum of 3 characters")
    }
    if(this.data.username.length > 12){
        this.errors.push("Username cannot exceed 12 characters")
    }
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
        this.errors.push("Username must only contain letters and numbers")
    }
    if(!validator.isEmail(this.data.email)){
        this.errors.push("Please input a valid email")
    }
    
}
User.prototype.login = function(){
    return new Promise((resolve, reject) => {
           //Step 1: Validate user data
            this.cleanUp()

            //Connect to database
            usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
                if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                    resolve('congrats')
                }else{
                    reject('invalide username and password')
                }
            }).catch(function(){
                reject('Please try again later')
            })
            })

        }
User.prototype.register = function(){
    //Step 1: Validate user data
    this.validate()
    this.cleanUp()

    //Connect to database
    let salt = bcrypt.genSaltSync(10)
    this.data.password = bcrypt.hashSync(this.data.password, salt)
    usersCollection.insertOne(this.data)
}

module.exports = User