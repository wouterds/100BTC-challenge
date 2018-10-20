//@flow
import fs from 'fs';
import chalk from 'chalk';

const options = { encoding: 'utf-8', flag: 'r' };
const ascii = fs.readFileSync('resources/ascii.txt', options);

const print = () => {
  const wallet = process.env.BTC_COLD_STORAGE_ADDRESS;
  const date = process.env.START_DATE;

  console.log(chalk.magentaBright(ascii));
  console.log(`Cold storage wallet: ${wallet}, start date: ${date}\n`);
};

export default {
  print,
};
