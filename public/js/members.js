$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  var UserId;
  var current_balance;

  getUserData();

  function getUserData(){
    $.get("/api/user_data").then(function(data) {
      $(".member-name").text(data.id);
      $(".current-balance").text(data.balance);
      $(".current-balance").val(data.balance);
      UserId = data.id;
      // current_balance = data.balance;

      renderPortfolio(UserId);
    });

  }






//
function createStock(UserId, balance) {

  var stockList = $("tbody");
  var apiKey = "&apikey=MOU4Y0ZQ72U6K0JF";
  var tickerSymbol = $("#stock_name").val().trim();

  //Real Time
  var queryURL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + tickerSymbol + apiKey;
  var object = "Realtime Global Securities Quote";
  var symbol = "01. Symbol";
  var exchange = "02. Exchange Name";
  var latest_price = "03. Latest Price";

  //Time Series
  // var queryURL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=" + tickerSymbol + apiKey;
  // var object = "Meta Data";
  // var symbol = "2. Symbol";
  // var timeSeries = "Weekly Time Series";
  // var week = "2017-06-30";
  // var close = "4. close";

  var quantity = $('#quantity').val().trim();

  $.ajax({
    url: queryURL,
    method: "GET"
  })
  .done(function(response) {

    //Real time
    var price = response[object][latest_price];
    //Time series
    // var price = response[timeSeries][week][close];
    price = parseFloat(price);

    console.log("User ID: "+UserId);

    //create a new stock purchase object to be passed into the database
    var newStock = {
      symbol: response[object][symbol],
      price: price,
      quantity: quantity,
      UserId: UserId
    };


    var new_balance = balance - (newStock.price * newStock.quantity);

    //Check if the purchase order exceeds the funds available
    if(new_balance < 0) {
      alert("You do not have the minimum cash balance required for this purchase.");
      return;
    } else {
      //Create an object to pass into the updateBalance function
      var balance_json_object = {
        balance: new_balance,
        id: UserId
      };
      //AJAX request to update the current balance
      updateBalance(balance_json_object);

      new_balance = JSON.stringify(new_balance);
      $(".current-balance").text(new_balance);
      $(".current-balance").val(new_balance);

      //Send an ajax post request to add stock to portfolio, then render it to the table
      $.post("api/posts", newStock)
        .done(function() {
          //Append the new stock to the portfolio table
          var row = $("<tr>");
          row.append("<td class = 'symbol'>" + newStock.symbol + " </td>");
          row.append("<td>" + newStock.price + "</td>");
          row.append("<td>" + newStock.quantity + "</td>");
          row.append("<td><button type='button' class='btn sell_btn'>Sell</button><td>");
          stockList.prepend(row);
        });

      // Empty each input box by replacing the value with an empty string
          $("#stock_name").val("");
          $("#quantity").val("");
    }

  });


}




//Placing an order for stock
  $("#stock-submit").on("click", function() {

    event.preventDefault();
    current_balance = $(".current-balance").val();
    createStock(UserId, current_balance);


  });




  function renderPortfolio(UserId) {
    var stockList = $("tbody");
    $.get("/api/posts", function(data) {

      if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {
          if(data[i].UserId === UserId) {
            var row = $("<tr>");
            console.log(data[i]);
            row.append("<td class = 'symbol'>" + data[i].symbol + "</td>");
            row.append("<td class = 'price'>" + data[i].price + "</td>");
            row.append("<td class = 'quantity'>" + data[i].quantity + "</td>");
            row.append("<td class = 'hidden id'>" + data[i].id + "</td>");
            row.append("<td><button type='button' class='btn sell_btn'>Sell</button><td>");
            stockList.prepend(row);

          }
        }

      }

    });

  }





  function updateBalance(balance) {
    $.ajax({
      method: "PUT",
      url: "/api/user_data",
      data: balance
    }).done(function() {
      //Update balance on the page
    });
  }


  //Selling the User's stock
    $(function(){
        $('table').on('click', '.sell_btn', function(){
        var stockId = $(this).closest("tr").find('.id').text();
        var price = $(this).closest("tr").find('.price').text();
        var symbol = $(this).closest("tr").find('.symbol').text();
        var quantity = $(this).closest("tr").find('.quantity').text();
        var total_cost = quantity * price;
        alert("Selling "+symbol + " for "+total_cost);
        sellStock(total_cost, stockId);
        $(this).closest('tr').remove();
        });
    });


    function sellStock(sold_value, id) {
      balance = $(".current-balance").val()
      sold_value = parseFloat(sold_value);
      balance = parseFloat(balance);
      balance += sold_value;
      var balance_json_object = {
        balance: balance,
        id: UserId
      };
      updateBalance(balance_json_object);
      $(".current-balance").val(balance);
      balance = JSON.stringify(balance);
      $(".current-balance").text(balance);
      deleteStock(id);
    }



  function deleteStock(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/posts/" + id
    })
    .done(function() {

    });
  }


});
