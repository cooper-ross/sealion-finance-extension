// Yes these should be hidden I know, but the API keys are for a paper trading account so it's not a big deal
// I will hide these on github though
const apiKey = 'ReplaceThisWithYourOwn'; // This is for alpaca paper trading
const secretKey = 'ReplaceThisWithYourOwn'; // This is for alpaca paper trading also
const finacialApiKey = 'ReplaceThisWithYourOwn'; // This is for financialmodelingprep.com

// We can just switch this to the live API and it should work exactly the same
const baseUrl = 'https://paper-api.alpaca.markets';

$(document).ready(async function () {
  refreshMainPage();
  checkForRoundUp();
});

function refreshMainPage() {
  chrome.storage.sync.get().then((result) => {
    if (result["ownedStocks"]) {
      $("#owned-stocks").html(`${result["ownedStocks"]}`);
    } else {
      $("#owned-stocks").html(`0`);
    }

    if (result["savedMoney"] && result["savedMoney"] > 0) {
      $(".alert").html(`<h2>Investment?</h2><p>Hey! It looks like you have a rounded up $${result["savedMoney"].toFixed(2)} to invest. Do you want to invest it now?</p><button class="btn">Invest</button>`);
      $(".btn").click(async function () {
        selectStocks();
      });
      $("#saved").html(`$${result["savedMoney"].toFixed(2)}`);
    } else {
      $(".alert").html(`<p>Try buying something here to see your balance collect!</p>`);
      $("#saved").html(`$0.00`);
    }

  });
}

function plotData(data, stockSymbol) {
  const dates = data.map(d => d.date);
  const prices = data.map(d => d.price);

  const ctx = document.getElementById(stockSymbol).getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stock Price (CAD)',
        data: prices,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        }
      }
    }
  });
}

async function placeOrder(stockSymbol, qty) {
  const orderPayload = {
    symbol: stockSymbol,
    qty: qty,
    side: 'buy',
    type: 'market',
    time_in_force: 'day'
  };

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${baseUrl}/v2/orders`,
      type: 'POST',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
      },
      data: JSON.stringify(orderPayload),
      success: function (response) {
        console.log(response)
        resolve(response);
      },
      error: function (error) {
        reject(error);
      }
    });
  });
}

async function selectStocks() {
  $("#stock-options-list").append(`<h1> Select a stock to invest in </h1>`);
  displayStocks().then(() => {
    $(".select-stock").click(async function () {
      const stockSymbol = $(this).find('h2').text();
  
      console.log(stockSymbol);
      chrome.storage.sync.get().then((result) => {
        console.log(result["savedMoney"]);
        const qty = Math.floor(result["savedMoney"]);
        placeOrder(stockSymbol, qty);
        chrome.storage.sync.set({ "savedMoney": 0});

        if (result["ownedStocks"]) {
          chrome.storage.sync.set({ "ownedStocks": result["ownedStocks"] + 1 });
        } else {
          chrome.storage.sync.set({ "ownedStocks": 1 });
        }

        $("#stock-options-list").empty();

        refreshMainPage();
      });
    });
  });
}

async function checkForRoundUp() {
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    var activeTab = tabs[0];
    var activeTabUrl = activeTab.url;

    if (activeTabUrl.includes('amazon.ca') || activeTabUrl.includes('amazon.com')) {
      const extraToInvest = await roundUpTotal();
      console.log(extraToInvest);

      chrome.storage.sync.get().then((result) => {
        if (!result["savedMoney"]) {
          chrome.storage.sync.set({ "savedMoney": extraToInvest });
        } else {
          chrome.storage.sync.set({ "savedMoney": result["savedMoney"] + extraToInvest });
        }
        refreshMainPage();
      });
    }
  });
}

async function displayStocks() {
  return new Promise(async (resolve, reject) => {
    const stocks = await getRandomStocks(5);
    stocks.forEach(async stock => {
      console.log(stock.symbol);
      const stockData = await getStockDescription(stock.symbol);

      //const tldr = shortenText(stockData[0].description);
      const shortened = stockData[0].description.split('.');
      const tldr = shortened[0] + '.' + shortened[1] + '.';

      console.log(tldr)

      $("#stock-options-list").append(`<div class="summary-tab card select-stock">
        <h2>${stock.symbol}</h2>
        <p>${tldr}</p>
        <canvas id="${stock.symbol}"></canvas>
      </div>`)

      const formattedData = await getHistoricalData(stock.symbol);

      plotData(formattedData, stock.symbol);
      resolve();
    });
  });
}

async function getRandomStocks(numberOfStocks) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${baseUrl}/v2/assets?status=active`,
      method: "GET",
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
      },
      success: function (data) {
        const stocks = data.filter(stock => stock.fractionable === true && stock.easy_to_borrow === true && stock.tradable === true && stock.exchange === "NASDAQ");

        // Pick numberOfStocks random stocks to investigate further
        const randomStocks = [];
        for (let i = 0; i < numberOfStocks; i++) {
          const randomIndex = Math.floor(Math.random() * stocks.length);
          randomStocks.push(stocks[randomIndex]);
        }

        // Get historical data for each stock
        randomStocks.forEach(stock => {
          getHistoricalData(stock.symbol)
        });

        resolve(randomStocks); // Resolve the promise with the received data
      },
      error: function (error) {
        reject(error); // Reject the promise with the error
      }
    });
  });
}

async function getHistoricalData(stockSymbol) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const formattedStartDate = startDate.toISOString().split('T')[0];
  console.log(formattedStartDate)

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://data.alpaca.markets/v2/stocks/auctions`,
      method: "GET",
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
      },
      data: {
        symbols: stockSymbol,
        start: formattedStartDate,
        limit: 100,
        currency: 'CAD'
      },
      success: function (data) {
        // The data is formatted in a way that is not very useful for plotting, so we just take the last closing price of each auction
        const formattedData = [];
        Object.values(data.auctions[stockSymbol]).forEach(auction => {
          const lastAuction = auction.c[auction.c.length - 1];

          formattedData.push({
            date: auction.d,
            price: lastAuction.p
          });        
        });

        resolve(formattedData); // Resolve the promise with the received data
      }, 
      error: function (error) {
        reject(error); // Reject the promise with the error
      }
    });
  });
}

async function getStockDescription(stockSymbol) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${finacialApiKey}`,
      method: "GET",
      success: function (data) {
        resolve(data); // Resolve the promise with the received data
      },
      error: function (error) {
        reject(error); // Reject the promise with the error
      }
    });
  });
}

async function shortenText(text) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://localhost:3000/shorten-text',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ longText: text }),
      success: function (data) {
        resolve(data); // Resolve the promise with the received data
      },
      error: function (error) {
        reject(error); // Reject the promise with the error
      }
    });
  });
}

async function roundUpTotal() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        const injectionResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: findTotalAndRound,
        });

        const roundedTotal = parseFloat(injectionResults[0].result);
        resolve(roundedTotal);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function findTotalAndRound() {
  // We need to use normal JS here, not jQuery :(
  const totalString = document.querySelector('.subtotal-amount').innerText;
  if (totalString.includes('(')) return "0.00";

  const match = totalString.match(/(\d+\.\d+)/);
  const total = parseFloat(match[0]);

  const roundedTotal = Math.ceil(total);
  const difference = roundedTotal - total;

  document.querySelector('.subtotal-amount').innerText = `${total} (+${difference.toFixed(2)})`;

  return difference.toFixed(2);
};