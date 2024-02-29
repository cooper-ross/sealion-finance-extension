# Sealion Finance Extension (CalgaryHacks 2024 First Place Winner)!
Sealion is a chrome extension that rounds up your online purchases and helps you invest them in the stock market!


![thumbnail](https://github.com/cooper-ross/sealion-finance-extension/assets/120236631/e836be7d-0e3b-4cb0-83a8-0ff70f71ec11)
![thumbnail2](https://github.com/cooper-ross/sealion-finance-extension/assets/120236631/499e5dc7-7707-4a36-8be6-70c34c964455)
![thumbnail3](https://github.com/cooper-ross/sealion-finance-extension/assets/120236631/2b78a30a-8669-4c77-abc0-5b163dd32702)

## Inspiration
Have you ever seen the movie One Cent Thief? Neither have I, but I like the concept of it. It’s a guy who works at a bank, and steals a single cent from every account to gain over one million dollars. While stealing just one cent may seem inconsequential, the cumulative impact becomes hugely significant. The idea that inspired me is not the stealing, but that tiny things can lead to a big impact over time!

## What it does
I use amazon (and other online retailers) pretty often, and I'm not alone. In 2024, retail e-commerce sales are estimated to exceed 6.3 trillion U.S. dollars worldwide! When you are purchasing on most online retailers, it does the same thing a lot of department stores do: rounds up the total cost (either to the nearest dollar, or nearest multiple of 5). This extra money is then used to invest in the stock market. When you have time, just open the extension and check your balance that has accumulated over time—this balance can be invested in 5-10 semi-randomly* picked [NASDAQ] stocks. Each stock gets an AI (gpt-4-turbo) powered summary, and the past 3 months are displayed as an interactive graph. You look through the stocks, decide which one you think is best, and it is automatically purchased for you (in the quantities that you have available currently) with a single click.

## How we built it
The base of Sealion is just JavaScript, HTML, and CSS (plus some fancy charts with chart.js). It communicates to 3 different APIs, including a custom made one running gpt-4-turbo to better summarize stock information. The Alpaca API is used to pick stocks, get their historical information, and buy partial stocks the user selects. The Financial Modelling Prep API is used to get a general overview of the stock, but the description is often super long and technical. This is where the custom made API comes in - it summarizes the description in a easy-to-understand manner, and returns the text right back! It also has a fallback where I just trimmed to the first two sentences.

## Challenges we ran into
The alpaca docs were somewhat outdated, so a lot of the API stuff took a while. Especially getting random stocks that fit my requirements in a way that was fast. I'm happy to say I managed to do that, even if the method could be cleaner! The way stocks are dealt in alpaca means they don't have a price per day, so I had to navigate to their closing auctions, which is something I didn't actually understand before beginning this.

## Accomplishments that we're proud of
The logo is maybe my favorite thing I've made as of late in terms of the visual design, and I'm pretty proud of it, since I don't usually do stuff like it! I'm also so happy I was able to experiment with the openai api; it wasn't difficult, but it was fun, and I'd love to use it to power more future projects!

## What we learned
I got to try out a bunch of new things this project! Making a chrome extension is a lot of fun, but it's pretty difficult to learn, especially in terms of getting code to run on injected into websites, or saving user information. Why? Cause google just keeps on changing the code so none of stack overflow works, and solutions online are outdated instantly. However, I managed to do it all with some less than perfect code.

## What's next for Sealion Investment Buddy!
My list of things I'd want to add if I had more time is pretty long! First, I want a real dashboard, aside from just the mini version of it built into the extension. I also would have liked to add the option to donate to charity or save the extra money. Another very important change I'd implement if this ever became a real chrome extension would be a backend API like Aurinko or Auth0 to securely store API access tokens.

*Stocks are picked randomly from a set of filtered stocks so that you don't get picks that cannot be invested in, don't do partial stocks, or are not publicly available.
