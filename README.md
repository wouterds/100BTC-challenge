# 1 - 100 Bitcoin Challenge

Simple challenge: start off with 1 BTC and trade your way up to 100 BTC. Obviously you don't need to per se start with 1 Bitcoin and go to 100, [it's configurable](#configuration), whatever you like. This repo keeps track of your wallet balance and Bitmex balance combined over time to help you keep track & visualize progress.

![Screenshot](resources/images/screenshot.jpg?raw=true)

## Requirements

- Nodejs

## Setup

### Dependencies

```shell
npm i
```

### Configuration

Create your `.env` file and change the values with your address, goal, [api keys](https://www.bitmex.com/app/apiKeys) etc.

```shell
cp .env.example .env
```

```text
START_DATE=2018-01-01
BTC_BALANCE_GOAL=100
BTC_WALLET_ADDRESS=1Cj9w6SsJQABFv611RHV728qa4tAWo1TJv
BITMEX_API_KEY_ID=XXXXXXXXXXXXXXXXXXX
BITMEX_API_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Running

```shell
npm start
```

## Bitmex

On Bitmex you can trade crypto derivatives with up to 100x leverage. If you don't have an account yet, register by clicking on the image below to get a 10% discount on fees the first 6 months.

[![Screenshot](resources/images/bitmex-logo.jpg?raw=true)](https://www.bitmex.com/register/L75Mds)
