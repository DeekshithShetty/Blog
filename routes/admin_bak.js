var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var	urlencodedParser = bodyParser.urlencoded({ extended : false });
var MongoClient = require('mongodb').MongoClient;
var path = require('path')
var templatesDir   = path.resolve(__dirname, '..', 'template')
var emailTemplates = require('email-templates')
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

var cloudinary = require('cloudinary');
var path = require('path');

var multer = require('multer');

cloudinary.config({ 
  cloud_name: 'codejitsu', 
  api_key: '818719648838795', 
  api_secret: 'YTa5Ul_bzlJ4g0jL9ORMUGjxGYs' 
});

var PostsDAO = require('../posts').PostsDAO;


var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/admin');
}

module.exports = function(passport,urlencodedParser){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('admin/index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/admin/home',
		failureRedirect: '/admin',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('admin/register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/admin/home',
		failureRedirect: '/admin/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		//res.render('home', { user: req.user });
		res.render('admin/admin_home',{title : 'suraj'});
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/admin');
	});

	router.get('/add_post',isAuthenticated,function(req, res){
		res.render('admin/admin_add_post',{title : 'suraj'});
	});

	router.post('/html_preview',isAuthenticated,function(req, res){
		res.render('admin/admin_preview',{ html_code : req.body.post_descr });
	});

	router.post('/add_post', urlencodedParser, function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var tags = req.body.post_tags;
			tags = tags.split(',');

			var post = {
				title : req.body.post_title,
				body : req.body.post_descr,
				author_name : req.body.post_author,
				tags : tags,
				category : req.body.post_category,
				published : "false"
			};
			db.collection('articles').insert(post,function(err,inserted){
				if(err) {
					console.log("Alert");
					return db.close();
					
				}
				res.render('admin/admin_add_post',{title : 'suraj', post_added : true });
				console.log("Data inserted successfully");
				return db.close();
			});		
		});

	});

	router.get('/mod_post',isAuthenticated,function(req, res){
		res.render('admin/admin_modify_post',{title : 'suraj'});
	});


	//deleting the post
	router.post('/del_post',function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var post = {
				title : req.body.post_title
			};	

			db.collection('articles').remove(post, function(err,removed){
				if(err) {
					console.log("Alert");
					return db.close();
				}

				res.render('admin/admin_modify_post',{title : 'suraj', post_deleted : true });
				console.log("Data removed successfully");
				return db.close();
			});


		});	

	});

	//updating the posts
	router.post('/upd_post',function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var post = {
				title : req.body.post_title
			};

			var operator = {
				'$set' : {
					body : req.body.post_descr
				}
			};	

			db.collection('articles').update(post, operator, function(err,removed){
				if(err) {
					console.log("Alert");
					return db.close();
				}

				console.log("Data updated successfully");
				res.render('admin/admin_modify_post',{title : 'suraj', post_updated : true });
				return db.close();
			});

		});	

	});


	router.get('/add_editor',isAuthenticated,function(req, res){
		res.render('admin/admin_add_editor',{title : 'suraj'});
	});



	router.post('/add_editor', urlencodedParser, function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var editor = {
				name : req.body.editor_name,
				description : req.body.editor_descr,
				social : { twitter: req.body.editor_twitter }
			};
			db.collection('editors').insert(editor,function(err,inserted){
				if(err) {
					console.log("Alert");
					return db.close();
					
				}
				res.render('admin/admin_add_editor',{title : 'suraj', editor_added : true });
				console.log("Data inserted successfully");
				return db.close();
			});		
		});

	});

	router.get('/mod_editor',isAuthenticated,function(req, res){
		res.render('admin/admin_modify_editor',{title : 'suraj'});
	});


	//deleting the editor
	router.post('/del_editor',function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var editor = {
				name : req.body.editor_name
			};	

			db.collection('editors').remove(editor, function(err,removed){
				if(err) {
					console.log("Alert");
					return db.close();
				}

				res.render('admin/admin_modify_editor',{title : 'suraj', editor_deleted : true});
				console.log("Data removed successfully");
				return db.close();
			});


		});	

	});

	//updating the editor
	router.post('/upd_editor',function(req, res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var editor = {
				name : req.body.editor_name
			};

			var operator = {
				'$set' : {
					description : req.body.editor_descr
				}
			};	

			db.collection('editors').update(editor, operator, function(err,removed){
				if(err) {
					console.log("Alert");
					return db.close();
				}

				res.render('admin/admin_modify_editor',{title : 'suraj', editor_updated : true});
				console.log("Data updated successfully");
				return db.close();
			});

		});	

	});

	router.get('/newsletter',isAuthenticated,function(req, res){
		res.render('admin/admin_newsletter',{title : 'suraj'});
	});

	router.get('/newsletter_preveiw',isAuthenticated, function(req, res) {
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

		    var posts = new PostsDAO(db);
		    posts.getHotPosts(5, 1, function(err, hot_results) {
		    	if(err) throw err;
		    	res.render('admin/html_admin', { hot_posts : hot_results });
		    });
		});    	
	
	});	

	router.get('/newsletter_send',isAuthenticated, function(req, res) {
	  	var mailOpts, smtpTrans;

		emailTemplates(templatesDir, function(err, template) {

		  	if (err) {
		    	console.log(err);
		  	} else {
			    // ## Send a single email
			    // Prepare nodemailer transport object
				var transporter = nodemailer.createTransport(smtpTransport({
					  service: 'Mailgun',
					  auth: { 
					  		user: 'postmaster@sandbox0635edeae6f641ebb9abccac5e396f54.mailgun.org', 
					  		//'ravishetty150@gmail.com',
					        pass: 'e2f670eefe44504724a607491d160cb5'
					        //'nmamitsucks' 
					    }
				}));

				MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
				    "use strict";
				    if(err) throw err;

				    var posts = new PostsDAO(db);
				    posts.getHotPosts(5, 1, function(err, hot_results) {


				    	res.render('admin/admin_home', {newsletter_sent : true });
				    	var cursor = db.collection('email_sub').find({});
						cursor.each(function(err,ob){
							if(ob != null){
								var locals = {
							      	name : ob.email,
							      	hot_posts: hot_results
							    };
							    //var EMAIL = "ravishetty150@gmail.com"; // Email to send.
							    var EMAIL = ob.email; // Email to send.
							    // Send a newsletter
							    template('newsletter', locals, function(err, html, text) {
							      	if (err) {
							        	console.log("template error : " +err);
							      	} else {
							        	transporter.sendMail({
								          	from: '忍者コーダー <smtp.mailgun.org>',
								          	to: "<"+ EMAIL +">",
								          	subject: 'Weekly Newsletter',
								          	html: html,
								          	generateTextFromHTML: true,
								          	text: text
							        	}, function(err, responseStatus) {
							          		if (err) {
							            		console.log("some : " + err);
							          		} else {
								            	console.log("SUCCESS Email sent : " + EMAIL);
								            	
							          		}
							        	});
							      	}
							   	});
							}
						});
				    });	
					res.render('admin/admin_home', {newsletter_sent : true });
				});		    
			}
		});
	});


	router.get('/email_manager',function(req,res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

			var posts = new PostsDAO(db);
			posts.getemails(function(err, em) {
		        return res.render('admin/admin_email_manager', { emails : em });
		    });
		});    
	});

	router.post('/del_email',function(req,res){
		MongoClient.connect('mongodb://localhost:27017/nodeblog', function(err, db) {
		    "use strict";
		    if(err) throw err;

		    for (var i=0; i<= req.body.email_checkbox.length; i++){
		    	var query = {
					email : req.body.email_checkbox[i]
				};
		    	db.collection("email_sub").remove(query, function(err, items) {
		            "use strict";

		            if (err) throw err;

		            console.log("Deleted " + req.body.email_checkbox[i] );

		        });;
		    }

		    var posts = new PostsDAO(db);
			posts.getemails(function(err, em) {
		        return res.render('admin/admin_email_manager', { emails : em });
		    });

		});    
	});

	router.use(multer({ dest: './uploads/',
		 rename: function (fieldname, filename) {
		    return filename+Date.now();
		  },
		onFileUploadStart: function (file) {
		  console.log(file.originalname + ' is starting ...')
		},
		onFileUploadComplete: function (file) {
		  console.log(file.fieldname + ' uploaded to  ' + file.path)
		}
	}));

	//cloudinary
	router.post('/image_upload/posts_short',function(req,res){
		//console.log("asdadads");
		//console.log("Req.file ::: " + req.myImage.path);
		//console.log("Req.file ::: " + req.body);
/*
		var image = req.body.image.split('\\');
		var imageName = image[2].split('.');
		var post_title = req.body.post_title;
		var path = "Posts_short/" + post_title + "/" + imageName[0];
		cloudinary.uploader.upload(image[2], function(result) { 
		   console.log(result)
		   console.log(req.body.image);

		   res.end('{"success" : "Uploaded Successfully", "status" : 200}');
		},{ public_id: path });

*/
	});

	router.post('/image_upload/posts_full',function(req,res){

		var image = req.body.image.split('\\');
		var imageName = image[2].split('.');
		var post_title = req.body.post_title;
		var path = "Posts_full/" + post_title + "/" + imageName[0];
		cloudinary.uploader.upload(image[2], function(result) { 
		   console.log(result)
		   //console.log(req.body.image);
		   res.end('{"success" : "Uploaded Successfully", "status" : 200}');
		},{ public_id: path });
	});

	router.post('/image_upload/posts_others',function(req,res){

		var image = req.body.image.split('\\');
		var imageName = image[2].split('.');
		var post_title = req.body.post_title;
		var path = "Posts_full/" + post_title + "/" + imageName[0];
		cloudinary.uploader.upload(image[2], function(result) { 
		   console.log(result)
		   //console.log(req.body.image);
		   	var response = {
			    status  : 200,
			    success : 'Updated Successfully',
			    url_path : result.url
			}
		   res.end(JSON.stringify(response));
		},{ public_id: path });
	});

	router.post('/image_upload/editors',function(req,res){

		var image = req.body.image.split('\\');
		var imageName = image[2].split('.');
		var editor_name = req.body.editor_name;
		var path = "Editors/" + imageName[0];
		cloudinary.uploader.upload(image[2], function(result) { 
		   console.log(result)
		   //console.log(req.body.image);
		   res.end('{"success" : "Uploaded Successfully", "status" : 200}');
		},{ public_id: path });
	});


	router.get('/email_snd',function(req,res){
		res.render('emailer/index');
	});

	return router;
}





