var db = require("../models");
var passport = require("../config/passport");

module.exports = function(app) {

  app.get("/api/posts", function(req, res) {
     db.Stock.findAll().then(function(dbStock) {
       res.json(dbStock);
     });
   });


   app.post("/api/posts", function(req, res) {

     console.log("Stock Data: ");
     console.log(req.body);

     db.Stock.create({
       symbol: req.body.symbol,
       price: req.body.price,
       quantity: req.body.quantity,
       UserId: req.body.UserId
     }).then(function(dbStock) {
       res.json(dbStock);
     });
   });


   // PUT route for updating posts
  //  app.put("/api/posts", function(req, res) {
  //    db.Post.update(
  //      req.body,
  //      {
  //        where: {
  //          id: req.body.id
  //        }
  //      }).then(function(dbPost) {
  //        res.json(dbPost);
  //      });
  //  });

   // PUT route for updating posts
   app.put("/api/user_data", function(req, res) {
     db.User.update(
       req.body,
       {
         where: {
           id: req.body.id
         }
       }).then(function(dbUser) {
         res.json(dbUser);
       });
   });


   // DELETE route for deleting stocks
   app.delete("/api/posts/:id", function(req, res) {
     db.Stock.destroy({
       where: {
         id: req.params.id
       }
     }).then(function(dbStock) {
       res.json(dbStock);
     });
   });

};
