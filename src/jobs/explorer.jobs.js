import Random from 'random';
import chalk from 'chalk';

import explorerRepository from '../repositories/explorer.repository.js';

class explorerCronJobs {
    async addElementExplorerRandom() {
        try {
            console.log(
                chalk.greenBright('Start') +
                ' of ' +
                chalk.bold('addElementExplorerRandom') +
                ' cron job function!'
            );
            explorerRepository.updateMany(
                {
                    $inc : {'vault.elements.$[].quantity': Random.int(1, 3)}
                }
            );

        } catch (err) {
            console.log(
                chalk.redBright('Error') +
                ' on ' +
                chalk.bold('addElementExplorerRandom') +
                ' cron job function! Desc :' +
                chalk.yellow(err)
            );
        }
    }

    async addInoxExplorerRandom() {
        try {
            console.log(
                chalk.greenBright('Start') +
                ' of ' +
                chalk.bold('addInoxExplorerRandom') +
                ' cron job function!'
            );
            explorerRepository.updateMany(
                {
                    $inc : {'vault.inox': 2}
                }
            );

        } catch (err) {
            console.log(
                chalk.redBright('Error') +
                ' on ' +
                chalk.bold('addInoxExplorerRandom') +
                ' cron job function! Desc :' +
                chalk.yellow(err)
            );
        }
    }
}

export default new explorerCronJobs();