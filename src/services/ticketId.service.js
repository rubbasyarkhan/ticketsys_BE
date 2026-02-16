import { Counter } from "../models/counter.model.js";

const generateTicketId = async () => {
  const currentYear = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const formattedSequence = counter.sequence.toString().padStart(6, "0");
  return `TCK-${currentYear}-${formattedSequence}`;
};

export { generateTicketId };
