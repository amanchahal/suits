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
    
    function adminauthChecker(req, res, next) {
        if (req.session.type == 1) {
            next();
        }else {
            res.redirect('/logout');
        }
    }
    //<---------------admin login get function --------------->
    app.get('/admin/login',function(req,res){
        if (req.session.username) {
            res.redirect('/admin/dashboard');
        }else{
            res.render('admin/login',{
                title : "Admin Login"
            });
        }
    });
    
    //<----------------admin login post function--------------->
    app.post('/admin/login',function(req,res){
        var user = req.body.username;
        var condition = {
            $and : [
                {username : user},
                {type: 1}
        ]};
        mongoose.model('User').find(condition,function(err,users){
            if (err) {
                res.send("Wrong username pass");
            }else{
                if (users) {
                    var pass="";
                    var uid = "";
                    var type = "";
                    users.forEach(function(item){
                        pass = item.password;
                        uid = item._id;
                        type = item.type;
                    });
                    if (bcrypt.compareSync(req.body.password, pass)) {
                       // user authenticated add data in sessions
                            req.session.uid = uid;
                            req.session.username = user;
                            req.session.type = type
                            res.redirect('/admin/dashboard');
                    }else{
                        res.render('admin/login',{
                            title : "Admin Login",
                            flash: "username/password incorrect",
                        });
                    }
                }else{
                    res.render('admin/login',{
                        title : "Admin Login",
                        flash: "No permission for this account",
                    });
                }
                
            }
        });
    });
    
    //<-------------------- Logout get function-------------------->
    app.get('/admin/logout',function(req,res){
        req.session.destroy();
        res.redirect('/admin/login');
    });
    
    //<-------------------- dashboard get function-------------------->
    app.get('/admin/dashboard',adminauthChecker,function(req,res){
        res.render('admin/dashboard',{
            title : 'Admin Dashboard',
            layout : 'adminlayout'
        })
    });
    
    //<-------------------- Password change get function -------------------->
    app.get('/admin/profile',adminauthChecker,function(req,res){
        res.render('admin/profile',{
            title : 'My Profile',
            layout : 'adminlayout',
            username: req.session.username
        })
    });      
    
    //<-------------------- Password change post function -------------------->
    app.post('/admin/profile',adminauthChecker,function(req,res){
        var user = req.session.username;
        var currentPass = req.body.oldpass;
        var newpass = bcrypt.hashSync(req.body.newpass, 10);
        //res.send(currentPass);
        var condition = {
            $and : [
                {username : user},
                {type: 1}
        ]};
        mongoose.model('User').find(condition,function(err,users){
            users.forEach(function(item){
                    pass = item.password;
                    uid = item._id;
            });
            if (bcrypt.compareSync(currentPass, pass)) {
                var updateObj = {
                    $set: {
                        'password' : newpass
                    }
                }
                mongoose.model('User').update({username:user},updateObj,function(err,users){
                    if(!err){
                        res.render('admin/profile',{
                            title : 'My Profile',
                            layout : 'adminlayout',
                            username: req.session.username,
                            flash: 'Password Updated Successfully'
                        });
                    }
                });
            }else{
                res.render('admin/profile',{
                    title : 'My Profile',
                    layout : 'adminlayout',
                    username: req.session.username,
                    errflash: 'Wrong password'
                });
            }
        });
        
    });  
    
    
    /**
     *  <---------------
     *  CREATE ADMIN ACCOUNT STARTED 
     *  code started to add the admin only used once for
     *  adding the admin, Please delete the code after
     *  added
     */
    app.get('/admin/add',adminauthChecker,function(req,res){
        res.render('admin/add');
    });
    app.post('/admin/add',adminauthChecker,function(req,res){
        var pass = req.body.password;
        var hash = bcrypt.hashSync(pass, 10);
        var obj = {
            'username' : req.body.username,
            'password' : hash,
            'type' : req.body.type
        }
        mongoose.model('User').create(obj);
        res.send("Added");
        //bcrypt.compareSync("my password", hash); // true
    });
    /**
     * CREATE ADMIN ACCOUNT ENDED
     * ----------------------------->
     */
    
    /**
     * Admin Trainer section started
     * <**********************
     */
    
    //<-------------------- view trainers -------------------->
    app.get('/admin/trainer/',adminauthChecker,function(req,res){
        mongoose.model('Userprofile').find(function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':2},
                select:'username type _id'
                },function(err,users){
                //res.send(users);
                if (users) {
                    res.render('admin/viewalltrainers',{
                        title : "List Of Trainers",
                        layout : 'adminlayout',
                        users : users
                    });
                    return false
                }else{
                    res.render('admin/viewalltrainers',{
                        title : "List Of Trainers",
                        layout : 'adminlayout',
                        flash : 'No Trainer Found'
                    });
                }
            })
        });
        
    });
    
    //<-------------------- Add new trainer get -------------------->
    app.get('/admin/trainer/add',adminauthChecker,function(req,res){
        res.render('admin/addtrainer',{
            title : "Add New Trainer",
            layout : 'adminlayout'
        });
    });
    
    //<-------------------- Add new trainer post -------------------->
    app.post('/admin/trainer/add',adminauthChecker,function(req,res){
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
                res.render('admin/addtrainer',{
                    title : "Add New Trainer",
                    layout : 'adminlayout',
                    errflash: "Username already exists"
                });
                return false;
            }
            
            mongoose.model('User').create(objstu,function(err,users){
                if (err) {
                    res.render('admin/addtrainer',{
                        title : "Add New Trainer",
                        layout : 'adminlayout',
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
                        res.render('admin/addtrainer',{
                            title : "Add New Trainer",
                            layout : 'adminlayout',
                            errflash: "Something went wrong after"
                        });
                        return false;
                    }
                    res.render('admin/addtrainer',{
                        title : "Add New Trainer",
                        layout : 'adminlayout',
                        flash: "New Trainer added"
                    });
                });
            });
        });
    });
    
    //<-------------------- Delete trainer post -------------------->
    app.get('/admin/trainer/delete/:userid/:userprofileid',adminauthChecker,function(req,res){
        //res.send(req.params.userid);
        //return false;
        mongoose.model('User').remove({"_id":req.params.userid},function(err,users){
            if (!err) {
                mongoose.model('Userprofile').remove({"_id":req.params.userprofileid},function(err,users){
                    res.redirect('/admin/trainer/');
                });
            }
        });
    });
    //<-------------------- view detail of trainer -------------------->
    app.get('/admin/trainer/view/:userprofileid',adminauthChecker,function(req,res){
        mongoose.model('Userprofile').findOne({"_id":req.params.userprofileid},function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':2},
                select:'username type _id'
                },function(err,users){
                    if (users) {
                            res.render('admin/view',{
                            title : "View Trainer Details",
                            layout : 'adminlayout',
                            users : users
                        });
                    }
            });
        });
    });
    
    //<-------------------- get edit trainer post -------------------->
    app.get('/admin/trainer/update/:userprofileid',adminauthChecker,function(req,res){
        mongoose.model('Userprofile').findOne({"_id":req.params.userprofileid},function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':2},
                select:'username type _id'
                },function(err,users){
                    
                    if (users) {
                        if (req.session.flash) {
                            var fmsg = req.session.flash;
                            delete req.session.flash;
                            res.render('admin/updatetrainer',{
                                title : "View Trainer Details",
                                layout : 'adminlayout',
                                users : users,
                                errflash: fmsg
                            });
                        }else{
                            res.render('admin/updatetrainer',{
                                title : "View Trainer Details",
                                layout : 'adminlayout',
                                users : users
                            });
                            
                        }
                    }else{
                        res.redirect('/admin');
                    }
            });
        });
    });
    
    //<-------------------- post edit trainer post -------------------->
    app.post('/admin/trainer/update/:userprofileid',adminauthChecker,function(req,res){
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var phone = req.body.phone;  
        var objstuprof = {
            fname : fname,
            lname : lname,
            email : email,
            phone : phone
        }
        mongoose.model('Userprofile').update({"_id":req.params.userprofileid},objstuprof,function(err,userprofile){
            if (err) {
                req.session.flash = "Something went wrong";
                res.redirect('/admin/trainer/update/'+req.params.userprofileid);
                return false;
            }else{
                if (req.body.pass != ''){
                    var pass = bcrypt.hashSync(req.body.pass, 10);
                    var updateObj = {
                        $set: {
                            'password' : pass
                        }
                    }
                    mongoose.model('User').update({"_id":req.body.userid},updateObj,function(err,users){
                        if (err) {
                            req.session.flash = "Something went wrong";
                            res.redirect('/admin/trainer/update/'+req.params.userprofileid);
                            return false;
                        }
                    });
                }
                req.session.flash = "Data updated sucessfully";
                res.redirect('/admin/trainer/update/'+req.params.userprofileid);
                return false;
            }
        });
    });
    //<-------------------- get search trainer  -------------------->
    app.post('/admin/trainer/search',adminauthChecker,function(req,res){
        var keyword = req.body.keyword;
        var conditions = {
            $or:[
                {fname : new RegExp('^'+keyword+'$', "i")},
                {lname : new RegExp('^'+keyword+'$', "i")}
            ]
        };
        mongoose.model('Userprofile').find(conditions,function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':2},
                select:'username type _id'
                },function(err,users){
                //res.send(users);
                //return false;
                if (users) {
                    res.render('admin/viewalltrainers',{
                        title : "List Of Trainers for search",
                        layout : 'adminlayout',
                        users : users
                    });
                    return false
                }else{
                    res.render('admin/viewalltrainers',{
                        title : "List Of Trainers for search",
                        layout : 'adminlayout',
                        flash : 'No Trainer Found'
                    });
                }
            })
        });
    });
     /**
     * Admin Trainer section ends
     * 
     * **********************>
     */
     
     
     /**
     * Admin User section ends
     * 
     * **********************>
     */
     //<-------------------- Add new client get -------------------->
    app.get('/admin/client/add',adminauthChecker,findTrainers,function(req,res){
        //res.send(req.usr);
        if (req.usr) {
            res.render('admin/addclient',{
                title : "Add new client",
                layout : 'adminlayout',
                users : req.usr
            });
        }else{
            res.render('admin/addclient',{
                title : "Add new client",
                layout : 'adminlayout',
                users : req.usr,
                errflash: "No Fitness trainer found please add one first"
            });
        }
    });
    
    //<-------------------- Add new client post -------------------->
    app.post('/admin/client/add',adminauthChecker,findTrainers,function(req,res){
        var username = req.body.username;
        var pass = bcrypt.hashSync(req.body.pass, 10);
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var phone = req.body.phone;
        var trainerId = req.body.trainerid;
        var objstu = {
            'username' : username,
            'password' : pass,
            'type' : 3
        }
        mongoose.model('User').findOne({username:username},function(err,usr){
            if (usr) {
                res.render('admin/addclient',{
                    title : "Add New Client",
                    layout : 'adminlayout',
                    errflash: "Username already exists",
                    users : req.usr
                });
                return false;
            }
            
            mongoose.model('User').create(objstu,function(err,users){
                if (err) {
                    res.render('admin/addclient',{
                        title : "Add New Client",
                        layout : 'adminlayout',
                        errflash: "Something went wrong",
                        users : req.usr
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
                        res.render('admin/addclient',{
                            title : "Add New Client",
                            layout : 'adminlayout',
                            errflash: "Something went wrong after",
                            users : req.usr
                        });
                        return false;
                    }
                    var tcObj = {
                        _trainerid : trainerId,
                        _clientid : userprofile._user
                    }
                    mongoose.model('TrainerClient').create(tcObj,function(err,userprofile){
                        res.render('admin/addclient',{
                            title : "Add New Client",
                            layout : 'adminlayout',
                            flash: "New Client added",
                            users : req.usr
                        });
                    });
                });
            });
        });
    });
    
    //<-------------------- Find all trainers -------------------->
    function findTrainers(req, res, next){
        mongoose.model('Userprofile').find(function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':2},
                select:'_id'
                },function(err,users){
                if (users) {
                    req.usr = users;
                    next();
                }else{
                    req.usr = false;
                    next();
                }
            });
        });
    }
    
    //<-------------------- view all clients  -------------------->
    app.get('/admin/client/',adminauthChecker,findTrainers,function(req,res){
        mongoose.model('TrainerClient').find(function(err,users){
            mongoose.model('TrainerClient').populate(users,{
                path:'_trainerid',
                match:{'type':2},
                select:'_id username'
                },function(err,users){
                     mongoose.model('TrainerClient').populate(users,{
                        'path': '_clientid',
                        select: '_id username'
                     },function(err,users){
                        mongoose.model('Userprofile').find({},'fname lname _user',function(err,userprofile){
                            mongoose.model('Userprofile').populate(userprofile,{
                                path:"_user",
                                select:'_id username'
                            },function(err,userprofile){
                                //var profileArray = _.toArray(userprofile);
                                var resultArray = Array();
                                var resultprofileid = Array();
                                userprofile.forEach(function(item){
                                    resultArray[item._user._id.toString()] = item.fname + " " +item.lname;
                                    resultprofileid[item._user._id.toString()] = item._id;
                                });
                                res.render('admin/viewallclients',{
                                    title : "View all Client",
                                    layout : 'adminlayout',
                                    users : users,
                                    usernames : resultArray,
                                    userprofileid : resultprofileid
                                });
                            });
                        });
                    });
                    
                });
        });
    });
    
    //<-------------------- Delete client post -------------------->
    app.get('/admin/client/delete/:userid/:userprofileid/:clienttrainerid',adminauthChecker,function(req,res){
        mongoose.model('User').remove({"_id":req.params.userid},function(err,users){
            if (!err) {
                mongoose.model('Userprofile').remove({"_id":req.params.userprofileid},function(err,users){
                    if (!err) {
                        mongoose.model('TrainerClient').remove({"_id":req.params.clienttrainerid},function(err,users){
                            res.redirect('/admin/client/');
                        });
                    }
                });
            }
        });
    });
    
    //<-------------------- get client view -------------------->
    app.get('/admin/client/view/:userid/:userprofileid/:clienttrainerid',adminauthChecker,findTrainers,function(req,res){
        mongoose.model('User').findOne({"_id":req.params.userid},function(err,users){
            mongoose.model('Userprofile').findOne({"_id":req.params.userprofileid},function(err,userprofile){
                mongoose.model('TrainerClient').findOne({"_id":req.params.clienttrainerid},function(err,usertrainer){
                    var usr = req.usr;
                    var trainerdata;
                    usr.forEach(function(item){
                        if (item._user !== null) {
                            var userId = item._user._id;
                            var trainerId = usertrainer._trainerid;
                            if (userId.toString() == trainerId.toString()) {
                                trainerdata = item;
                            }
                        }
                    });
                    res.render('admin/viewclientdetail',{
                        title : "Client Detail",
                        layout : 'adminlayout',
                        users : users,
                        trainer : trainerdata,
                        userprofile : userprofile
                    });
                });
            });
            
        });
    });
    
    //<-------------------- update client get -------------------->
    app.get('/admin/client/update/:userid/:userprofileid/:clienttrainerid',adminauthChecker,findTrainers,function(req,res){
        mongoose.model('Userprofile').findOne({"_id":req.params.userprofileid},function(err,users){
            mongoose.model('Userprofile').populate(users,{
                path:'_user',
                match:{'type':3},
                select:'username type _id'
                },function(err,users){
                    mongoose.model('TrainerClient').findOne({"_id":req.params.clienttrainerid},function(err,usertrainer){
                        if (users) {
                            if (req.session.flash) {
                                var fmsg = req.session.flash;
                                delete req.session.flash;
                                res.render('admin/updateclient',{
                                    title : "View Trainer Details",
                                    layout : 'adminlayout',
                                    users : users,
                                    errflash: fmsg,
                                    trainers : req.usr,
                                    trainerselectedid : usertrainer._trainerid,
                                    clienttrainerid : req.params.clienttrainerid
                                });
                            }else{
                                res.render('admin/updateclient',{
                                    title : "View Trainer Details",
                                    layout : 'adminlayout',
                                    users : users,
                                    trainers : req.usr,
                                    trainerselectedid : usertrainer._trainerid,
                                    clienttrainerid : req.params.clienttrainerid
                                });
                                
                            }
                        }else{
                            res.redirect('/admin');
                        }
                    });
            });
        });
        
    });
    
     //<-------------------- update client get -------------------->
    app.post('/admin/client/update/:userid/:userprofileid/:clienttrainerid',adminauthChecker,findTrainers,function(req,res){
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var phone = req.body.phone;
        var trainerid = req.body.trainerid;
        var objstuprof = {
            fname : fname,
            lname : lname,
            email : email,
            phone : phone
        }
        mongoose.model('Userprofile').update({"_id":req.params.userprofileid},objstuprof,function(err,userprofile){
            if (err) {
                req.session.flash = "Something went wrong";
                res.redirect('/admin/client/update/'+req.params.userid+'/'+req.params.userprofileid + '/' + req.params.clienttrainerid);
                return false;
            }else{
                if (req.body.pass != ''){
                    var pass = bcrypt.hashSync(req.body.pass, 10);
                    var updateObj = {
                        $set: {
                            'password' : pass
                        }
                    }
                    mongoose.model('User').update({"_id":req.body.userid},updateObj,function(err,users){
                        if (err) {
                            req.session.flash = "Something went wrong";
                            res.redirect('/admin/client/update/'+req.params.userid+'/'+req.params.userprofileid + '/' + req.params.clienttrainerid);
                            return false;
                        }
                    });
                }
                var obj = {
                    _trainerid : trainerid
                }
                mongoose.model('TrainerClient').update({"_id":req.params.clienttrainerid},obj,function(err,usertrainer){
                    req.session.flash = "Data updated sucessfully";
                    res.redirect('/admin/client/update/'+req.params.userid+'/'+req.params.userprofileid + '/' + req.params.clienttrainerid);
                    return false;
                });
            }
        });
    });
    
    //<-------------------- client search -------------------->
    app.post('/admin/client/search',adminauthChecker,findTrainers,function(req,res){
        var keyword = req.body.keyword;
        var conditions = {
            $or:[
                {fname : new RegExp('^'+keyword+'$', "i")},
                {lname : new RegExp('^'+keyword+'$', "i")}
            ]
        };
        mongoose.model('TrainerClient').find(function(err,users){
            mongoose.model('TrainerClient').populate(users,{
                path:'_trainerid',
                match:{'type':2},
                select:'_id username'
                },function(err,users){
                     mongoose.model('TrainerClient').populate(users,{
                        'path': '_clientid',
                        select: '_id username'
                     },function(err,users){
                        mongoose.model('Userprofile').find(conditions,'fname lname _user',function(err,userprofile){
                            mongoose.model('Userprofile').populate(userprofile,{
                                path:"_user",
                                select:'_id username'
                            },function(err,userprofile){
                                //var profileArray = _.toArray(userprofile);
                                if (userprofile) {
                                    var resultArray = Array();
                                    var resultprofileid = Array();
                                    userprofile.forEach(function(item){
                                        resultArray[item._user._id.toString()] = item.fname + " " +item.lname;
                                        resultprofileid[item._user._id.toString()] = item._id;
                                    });
                                    res.render('admin/viewallclients',{
                                        title : "View all Client",
                                        layout : 'adminlayout',
                                        users : users,
                                        usernames : resultArray,
                                        userprofileid : resultprofileid
                                    });
                                }else{
                                    res.render('admin/viewallclients',{
                                        title : "View all Client",
                                        layout : 'adminlayout',
                                        errflash: "No client found"
                                        
                                    });
                                }
                                
                            });
                        });
                    });
                    
                });
        });
    });
    
}