//@flow
import fs from 'fs';
import chalk from 'chalk';
import { format } from 'date-fns';

const options = { encoding: 'utf-8', flag: 'r' };
const ascii = fs.readFileSync('resources/ascii.txt', options);

const print = () => {
  const goal = process.env.BTC_BALANCE_GOAL;
  const wallet = process.env.BTC_WALLET_ADDRESS;
  const date = format(process.env.START_DATE, 'MMMM Do, YYYY');

  console.log(chalk.magentaBright(ascii));
  console.log(
    `${chalk.whiteBright('Goal:')} ${parseInt(goal).toFixed(
      2,
    )} BTC ${chalk.whiteBright('Start:')} ${date} ${chalk.whiteBright(
      'Wallet:',
    )} ${wallet}\n`,
  );
};

export default {
  print,
};
