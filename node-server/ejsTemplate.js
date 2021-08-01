const http = require('http')
const fs = require('fs')
const ejs = require('ejs');

const name = 'Louis'
const courses = [
  {name: 'HTML'},
  {name: 'CSS'},
  {name: 'JavaScript'}
]
const server = http.createServer((req, res) => {
  console.log('incoming...');
  console.log(req.headers)
  console.log(req.httpVersion)

  const url = req.url;
  res.setHeader('Content-Type', 'text/html');
  if(url === '/') {    
    ejs.renderFile('./template/index.ejs', {name}).then(data => res.end(data))
  } else if (url == '/courses') {
    ejs.renderFile('./template/courses.ejs',{courses}).then(data => res.end(data))
  } else {
    ejs.renderFile('./template/notfound.ejs',{name}).then(data => res.end(data))
  }  
})


server.listen(8082);