/**
 * @author: Anmol Chanana
 * @description: script to handel admin functions
 */

var mongoose = require('mongoose')
var stu = require('../models/users');
var Userprofile = require('../models/userprofiles');
var trainerClient = require('../models/trainer_clients');
var bcrypt = require('bcrypt');
var _ = require('underscore');
module.exports.controller = function(app) {
    
    function trainerauthChecker(req, res, next) {
        if (req.session.type == 2) {
            next();
        }else {
            res.redirect('/logout');
        }
    }
    
    
    //<---------------admin dashboard get function --------------->
    app.get('/trainer/dashboard',trainerauthChecker,function(req,res){
        mongoose.model('TrainerClient').find({_trainerid:req.session.uid},function(err,users){
            mongoose.model('TrainerClient').populate(users,{
                path:'_trainerid',
                match:{'type':2},
                select:'_id username'
                },function(err,users){
                    
                    mongoose.model('TrainerClient').populate(users,{
                       'path': '_clientid',
                       select: '_id username'
                    },function(err,users){
                        //res.send(req.session.uid);
                        res.render('trainers/dashboard',{
                            title : "My Dashboard",
                            layout : 'layoutafterlogin',
                            trainers : users
                        });
                    });
                    
                });
        });
    });
    //<--------------- View All client --------------->
    
    app.get('/trainer/listclients',trainerauthChecker,function(req,res){
        mongoose.model('TrainerClient').find({_trainerid:req.session.uid},function(err,users){
            mongoose.model('TrainerClient').populate(users,{
                path:'_trainerid',
                match:{'type':2},
                select:'_id username'
                },function(err,users){
                    
                    mongoose.model('TrainerClient').populate(users,{
                       'path': '_clientid',
                       select: '_id username'
                    },function(err,users){
                        //res.send(users);
                        res.render('trainers/listclients',{
                            title : "My client",
                            layout : 'layoutafterlogin',
                            users : users
                        });
                    });
                    
                });
        });
    });
    //<--------------- view client details ----------->
    
    app.get('/trainer/viewclient/:userid',trainerauthChecker,function(req,res){
        mongoose.model('Userprofile').findOne({"_user":req.params.userid},function(err,userprofile){
            mongoose.model('Userprofile').populate(userprofile,{
                path:'_user',
                },function(err,userprofile){
                    //res.send(userprofile);
                    res.render('trainers/clientdetail',{
                        title : "Client Detail",
                        layout : 'layoutafterlogin',
                        userprofile : userprofile
                    });
                });
            
        });
    });
    
    //<--------------- Add new client --------------->
    
    app.get('/trainer/addnewclient',trainerauthChecker,function(req,res){
        res.render('trainers/addnewclient',{
            title : "Add new client",
            layout : "layoutafterlogin"
        });
    });
    
    //<--------------- Add new client --------------->
    
    app.post('/trainer/addnewclient',trainerauthChecker,function(req,res){
        var username = req.body.username;
        var pass = bcrypt.hashSync(req.body.pass, 10);
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var phone = req.body.phone;
        var trainerId = req.session.uid;
        var objstu = {
            'username' : username,
            'password' : pass,
            'type' : 3
        }
        mongoose.model('User').findOne({username:username},function(err,usr){
            if (usr) {
                res.render('trainers/addnewclient',{
                    title : "Add New Client",
                    layout : 'layoutafterlogin',
                    errflash: "Username already exists"
                });
                return false;
            }
            
            mongoose.model('User').create(objstu,function(err,users){
                if (err) {
                    res.render('trainers/addnewclient',{
                        title : "Add New Client",
                        layout : 'layoutafterlogin',
                        errflash: "Something went wrong"
                    });
                    return false;
                }
                
                var objstuprof = {
                    fname : fname,
                    lname : lname,
                    email : email,
                    phone : phone,
                    _user : users._id
                }
                mongoose.model('Userprofile').create(objstuprof,function(err,userprofile){
                    if (err) {
                        res.render('trainers/addnewclient',{
                            title : "Add New Client",
                            layout : 'layoutafterlogin',
                            errflash: "Something went wrong after",
                        });
                        return false;
                    }
                    var tcObj = {
                        _trainerid : req.session.uid,
                        _clientid : userprofile._user
                    }
                    mongoose.model('TrainerClient').create(tcObj,function(err,userprofile){
                        res.render('trainers/addnewclient',{
                            title : "Add New Client",
                            layout : 'layoutafterlogin',
                            flash: "New Client added"
                        });
                    });
                });
            });
        });
    });
    //<--------------- Edit client Details--------------->
    
    app.get('/trainer/editclient/:clientid',trainerauthChecker,function(req,res){
        res.render('trainers/addnewclient',{
            title : "Add new client",
            layout : "layoutafterlogin"
        });
    });
    
    //<--------------- Delete client Details--------------->
    
    app.get('/trainer/deleteclient/:clientid',trainerauthChecker,function(req,res){
        mongoose.model('User').remove({"_id":req.params.clientid},function(err,users){
            if (!err) {
                mongoose.model('Userprofile').remove({"_user":req.params.clientid},function(err,users){
                    if (!err) {
                        mongoose.model('TrainerClient').remove({"_clientid":req.params.clientid},function(err,users){
                            res.redirect('/trainer/listclients');
                        });
                    }
                });
            }
        });
        
    });
    
    
    //<--------------- Trainer signup --------------->
    app.get('/trainer/signup',function(req,res){
        res.render('trainers/signup',{
            title : "Sign up trainer"
        });
    });
    
    app.post('/trainer/signup',function(req,res){
        var username = req.body.username;
        var pass = bcrypt.hashSync(req.body.pass, 10);
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var phone = req.body.phone;
        var objstu = {
            'username' : username,
            'password' : pass,
            'type' : 2
        }
        mongoose.model('User').findOne({username:username},function(err,usr){
            if (usr) {
                res.render('trainers/signup',{
                    title : "signup trainer",
                    errflash: "Username already exists"
                });
                return false;
            }
            
            mongoose.model('User').create(objstu,function(err,users){
                if (err) {
                    res.render('trainers/signup',{
                        title : "signup trainer",
                        errflash: "Something went wrong"
                    });
                    return false;
                }
                
                var objstuprof = {
                    fname : fname,
                    lname : lname,
                    email : email,
                    phone : phone,
                    _user : users._id
                }
                mongoose.model('Userprofile').create(objstuprof,function(err,userprofile){
                    if (err) {
                        res.render('trainers/signup',{
                            title : "signup trainer",
                            errflash: "Something went wrong after"
                        });
                        return false;
                    }
                    res.render('trainers/signup',{
                        title : "signup trainer",
                        flash: "Sign up successfully"
                    });
                });
            });
        });
    });
    
}