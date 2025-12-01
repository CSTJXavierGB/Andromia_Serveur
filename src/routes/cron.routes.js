import express from 'express';
import explorerCronJobs from '../jobs/explorer.jobs.js';

const router = express.Router();

// Verify the request is from Vercel Cron
const verifyCronRequest = (req, res, next) => {
    // Optional: Add authorization header check for security
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.post('/add-element-explorer', verifyCronRequest, async (req, res) => {
    try {
        await explorerCronJobs.addElementExplorerRandom();
        res.status(200).json({ success: true, message: 'addElementExplorerRandom executed' });
    } catch (error) {
        console.error('Cron job error (addElementExplorerRandom):', error);
        res.status(500).json({ error: error.message });
    }
});

// router.post('/add-inox-explorer', verifyCronRequest, async (req, res) => {
//     try {
//         await explorerCronJobs.addInoxExplorerRandom();
//         res.status(200).json({ success: true, message: 'addInoxExplorerRandom executed' });
//     } catch (error) {
//         console.error('Cron job error (addInoxExplorerRandom):', error);
//         res.status(500).json({ error: error.message });
//     }
// });

export default router;
