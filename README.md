# Jordan Scrapes RealForeclose

This scrapes the [Real Foreclose website for Miami Dade county](https://www.miamidade.realforeclose.com) tracking all waiting and closed foreclosure auctions.

## Getting Started

Clone the repository and run `npm i`. 

After that, you just need to run `npm start` and it'll scrape the games and output the results to auctions.csv.

It is currently targeted at the Miami Dade region. You can change this by changing the `regionDomain` variable at the top of the script in `src/index.ts`.

Denver is the regional domain here:

![denver regional domain](http://prntscr.com/pch56f)

Miami Dade is the regional domain here:

![miami dade regional domain](http://prntscr.com/pch5mk)

Toggle between regions here:

![toggle between regions](http://prntscr.com/pch5zh)

### Prerequisites

Tested on Node v12.4.0 and NPM v6.9.0.

### Installing

After installing [NodeJS](https://nodejs.org/en/) you should be able to just run the following in the terminal.

```
npm i
```

## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Headless Chrome Automation Library
* [NodeJS](https://nodejs.org/en/) - NodeJS

## Authors

* **Jordan Hansen** - *Initial work* - [Jordan Hansen](https://github.com/aarmora)


## License

This project is licensed under the ISC License
