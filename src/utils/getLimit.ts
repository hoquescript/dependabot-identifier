import { format, parseISO } from "date-fns";

import { RATE_LIMIT_QUERY } from "../graphql/index.graphql";
import client from "../library/urql";

async function getLimit() {
  try {
    const { data } = await client.query(RATE_LIMIT_QUERY, {});

    const parsedDate = parseISO(data.rateLimit.resetAt);
    const formattedDate = format(parsedDate, "do MMMM yyyy, h:mm a");

    console.log(
      `Remaining: ${data.rateLimit.remaining} | Reset time: ${formattedDate}`,
    );
  } catch (error) {
    console.log(error);
  }
}

export default getLimit;
