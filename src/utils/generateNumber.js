const mongoose = require('mongoose');

/**
 * Generates an auto-incrementing number with a prefix.
 * Uses a counters collection to maintain sequence state.
 */
const getNextSequence = async (counterName) => {
  const Counter = mongoose.connection.collection('counters');
  const result = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result.seq;
};

const generateNumber = async (prefix) => {
  const seq = await getNextSequence(prefix);
  const padded = String(seq).padStart(6, '0');
  return `${prefix}-${padded}`;
};

module.exports = { generateNumber, getNextSequence };
