import express from 'express'

const app = express();

app.get('/',(req, res, next) => {
  console.log('get')
})
app.listen(8082);