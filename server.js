const express=require('express');const mysql=require('mysql');const bodyParser=require('body-parser');const bcrypt=require('bcrypt');
const expressSession=require('express-session');const jwt=require('jsonwebtoken');const app=express();const PORT=process.env.PORT||3000;
const serverrun=`serverisrunning${PORT}`;app.use(express.json());app.use(express.urlencoded({extended: true}));
app.use(expressSession({secret:'secretkey',resave: false,saveUninitialized: true,}));const db=mysql.createConnection({host:process.env.DB_HOST='localhost',user:process.env.DB_USER='root',password: '',database:process.env.DB_NAME='login_register',});
db.connect((err)=>{if(err){console.error('Errorconnectiontodatabase');}else{console.log('Connectedtodatabase');}});app.set('view engine','ejs');app.get('/',(req, res)=>{res.render('index');});
app.get('/login',(req, res)=>{res.render('login');});app.post('/login',(req, res)=>{const { username,password }=req.body;const sql=`SELECT * FROM users WHERE username = ? AND password = ?`;
db.query(sql,[username,password],(err,results)=>{if(err){console.log(err);res.status(500);return;}if(results.length === 0){res.status(401);return;}
const token=jwt.sign({id:results[0].id},'secretkey',{expiresIn:'1h'});req.session.token=token;res.redirect('/');});});app.get('/register',(req, res)=>{res.render('register');});
app.post('/register',(req, res)=>{const {username,email,password}=req.body;const sqlCh=`SELECT * FROM users WHERE username = ? OR email = ?`;
db.query(sqlCh,[username, email],(err, results)=>{if(err){console.log(err);res.status(500);return;}if(results.length>0){
res.status(409);return;}const hashedPassword=bcrypt.hashSync(password,10);const sql=`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
db.query(sql,[username,email,hashedPassword],(err)=>{if(err){console.log(err);res.status(500);return;}res.send('Registration successful');});});});
app.listen(PORT,()=>{console.log(serverrun);});