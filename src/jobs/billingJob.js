const cron = require('node-cron');
const billingService = require('../services/billingService');

let task = null;
let isProcessing = false;

const runBillingCycle = async () => {
  if (isProcessing) {
    console.log('⏳ Previous billing cycle still executing, skipping this tick.');
    return;
  }

  isProcessing = true;
  try {
    await billingService.processDueSubscriptions();
  } catch (err) {
    console.error('❌ Error during recurring billing cycle:', err);
  } finally {
    isProcessing = false;
  }
};

const start = (cronExpression = '* * * * *') => {
  if (task) {
    console.log('⚠️  Billing cron job is already scheduled.');
    return task;
  }

  console.log(`⏰ Initializing billing scheduler with schedule: "${cronExpression}"`);
  task = cron.schedule(cronExpression, runBillingCycle, {
    scheduled: true,
  });

  return task;
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
    console.log('⏹️  Billing scheduler stopped.');
  }
};

module.exports = {
  start,
  stop,
  runBillingCycle,
};
