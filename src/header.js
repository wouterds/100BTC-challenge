//@flow
import fs from 'fs';
import chalk from 'chalk';
import { format } from 'date-fns';

const options = { encoding: 'utf-8', flag: 'r' };
const ascii = fs.readFileSync('resources/ascii.txt', options);

const print = () => {
  const wallet = process.env.BTC_WALLET_ADDRESS;
  const date = format(process.env.START_DATE, 'MMMM Mo, YYYY');

  console.log(chalk.magentaBright(ascii));
  console.log(`Cold storage wallet: ${wallet}, start date: ${date}\n`);
};

export default {
  print,
};
