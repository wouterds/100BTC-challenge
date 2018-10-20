//@flow
import chalk from 'chalk';
import Table from 'cli-table3';
import { maxBy } from 'lodash';
import { differenceInDays } from 'date-fns';
import Header from './header';
import Wallet from './wallet';
import Bitmex from './bitmex';

class App {
  _walletBalance: number = 0;
  _bitmexBalance: number = 0;

  constructor() {
    Header.print();

    this.fetch(() => this.printData());
  }

  get day(): number {
    return differenceInDays(new Date(), process.env.START_DATE);
  }

  get progress(): number {
    return (this.totalBalance / process.env.BTC_BALANCE_GOAL) * 100;
  }

  get bitmexHistory(): { [key: string]: number } {
    return this._bitmexHistory;
  }

  get totalBalance(): number {
    return this.bitmexBalance + this.walletBalance;
  }

  get walletBalance(): number {
    return this._walletBalance;
  }

  get bitmexBalance(): number {
    return this._bitmexBalance;
  }

  fetch = async (callback: Function) => {
    this._bitmexBalance = await Bitmex.balance;
    this._walletBalance = await Wallet.balance;
    this._bitmexHistory = await Bitmex.getBalanceHistory(
      process.env.START_DATE,
    );

    callback();
  };

  printData() {
    const overviewTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Total Balance'),
        chalk.whiteBright('Wallet balance'),
        chalk.whiteBright('Bitmex balance'),
      ],
      colWidths: [6, 18, 20, 20, 20],
    });
    overviewTable.push([
      chalk.blueBright(this.day),
      chalk.blueBright(`${this.progress.toFixed(2)}%`),
      chalk.blueBright(`${this.totalBalance.toFixed(2)} BTC`),
      chalk.blueBright(`${this.walletBalance.toFixed(8)} BTC`),
      chalk.blueBright(`${this.bitmexBalance.toFixed(8)} BTC`),
    ]);

    const dataTable = new Table({
      head: [
        chalk.whiteBright('Day'),
        chalk.whiteBright('Progress'),
        chalk.whiteBright('Balance'),
        chalk.whiteBright('Change'),
        chalk.whiteBright('Date'),
      ],
      colWidths: [6, 18, 20, 20, 20],
    });

    let previousProgress = null;
    let history = this.bitmexHistory
      .reverse()
      .map(({ date, value, change }) => {
        const progress =
          Math.round((value / process.env.BTC_BALANCE_GOAL) * 10000) / 100;
        let progressChange =
          previousProgress !== null ? progress - previousProgress : 0;
        previousProgress = progress;

        progressChange = !progressChange
          ? ''
          : progressChange > 0
            ? chalk.green(`+${progressChange.toFixed(2)}%`)
            : progressChange < 0
              ? chalk.red(`${progressChange.toFixed(2)}%`)
              : `+${progressChange.toFixed(2)}%`;

        return { date, value, change, progress, progressChange };
      });

    const bestDay = maxBy(history, 'value');

    history
      .reverse()
      .forEach(({ date, value, change, progress, progressChange }, index) =>
        dataTable.push([
          bestDay.date === date
            ? chalk.yellowBright(differenceInDays(date, process.env.START_DATE))
            : differenceInDays(date, process.env.START_DATE),
          `${progress.toFixed(2)}% ${progressChange}`,
          `${value.toFixed(8)} BTC`,
          change === null || index === this.bitmexHistory.length - 1
            ? '--'
            : change > 0
              ? chalk.green(`+${change.toFixed(8)} BTC`)
              : change < 0
                ? chalk.red(`${change.toFixed(8)} BTC`)
                : `${change.toFixed(8)} BTC`,
          date,
        ]),
      );

    console.log(overviewTable.toString());
    console.log(dataTable.toString());
  }
}

export default App;
