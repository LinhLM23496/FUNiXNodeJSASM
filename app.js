const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

// đặt thư mục views bên trong có dùng ứng dụng .ejs để thể hiện view 
app.set('view engine', 'ejs');
app.set('views', 'views');

const userRoutes = require('./routes/user');
const workRoutes = require('./routes/work');
const reportRoutes = require('./routes/report');
const covidRoutes = require('./routes/covid');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // truy cập đến thư mục public file tĩnh

app.use((req, res, next) => {
  User.findById('6320bf51c22f8dec66677c5b')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(userRoutes);
app.use(workRoutes);
app.use('/report', reportRoutes);
app.use('/covid', covidRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    'mongodb+srv://dbUser:iUUSPKmOKTXgp94q@cluster0.gffoxwh.mongodb.net/employees?retryWrites=true&w=majority'
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Lê Mạnh Linh',
          email: 'linhlm23496@gmail.com',
          department: 'Developer',
          Dob: '23/04/1996',
          salaryScale: 2.2,
          startDate: '08/08/2022',
          annualLeave: 96,
          statusWork: false,
          statusCovid: false,
          time: 691200,
          imageUrl: 'https://nhakhoagiadinh.com.vn/anh-sieu-nhan-chibi/imager_1_79145_700.jpg',
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
