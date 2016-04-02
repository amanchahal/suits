var mongoose = require('mongoose')
var stu = require('../models/users');
var Userprofile = require('../models/userprofiles');
var trainerClient = require('../models/trainer_clients');
var bcrypt = require('bcrypt');

module.exports.controller = function(app) {
     
     function authChecker(req, res, next) {
        if (req.session.uid) {
            next();
        }else {
            res.redirect('/admin/login');
        }
    }
     
     app.post('/login',function(req,res){
          var user = req.body.username;
          mongoose.model('User').findOne({username:user},function(err,users){
            if (err) {
                res.send("Wrong username pass");
            }else{
                if (users) {
                    if (bcrypt.compareSync(req.body.password, users.password)) {
                            req.session.uid = users._id;
                            req.session.username = users.username;
                            req.session.type = users.type;
                            if (users.type == 2) {
                                   res.redirect('/trainer/dashboard');
                            }else if (users.type == 3) {
                                   res.redirect('/client/dashboard');
                            }
                            
                    }else{
                        res.render('index',{
                            flash: "username/password incorrect"
                        });
                    }
                }else{
                    res.render('index',{
                            flash: "username/password incorrect"
                        });
                }
            }
          });
     });
     
     app.get('/logout',function(req,res){
        req.session.destroy();
        res.redirect('/');
    });
    
    // to show data
     app.get('/users',function(req,res){
        mongoose.model('User').find(function(err,students){
          if (err) {
            console.log(err);
          }
          var str = students;
          res.render("users/index",{
               sdata : str,
               title: 'show student'
          });
        });
      });
     
     app.get('/users/add',function(req,res){
       res.render('users/add');
     });
     
     app.post('/users/add',function(req,res){
          var objDb = {
               fname :req.body.fname,
               lname : req.body.lname
          };
          mongoose.model('User').create(objDb);
          res.render('users/adddetails');
     });
     
     app.get('/users/addse',function(req,res){
          req.session.myid = "my Id";
          res.send("Session added successfully");
     });
     
     app.get('/users/showse',function(req,res){
          res.send(req.session.myid);
     });
     app.get('/logout',function(req,res){
          req.session.destroy;
          res.redirect('/');
     });
}