import { env } from 'node:process';
import chalk from 'chalk';

import app from './src/app.js';
// import cron from 'node-cron';

// import explorerCronJobs from './src/jobs/explorer.jobs.js';

// //Cron jobs
// cron.schedule('0 * * * *', explorerCronJobs.addElementExplorerRandom);
// //TODO: À chaque multiple de 5 minutes de chaque heure
// //cron.schedule('* * * * *', explorerCronJobs.addInoxExplorerRandom);

//App
app.listen(env.PORT, (err) => {

    if (err) {
        process.exit(1);
    }

    console.log(`Loading environment for ${env.ENV}`);
    console.log(chalk.blue(`Server listening on port: ${env.PORT}`));
});