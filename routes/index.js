var express = require('express');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Fitness manager'
  });
};

