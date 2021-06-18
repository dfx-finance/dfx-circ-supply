import { VercelRequest, VercelResponse } from "@vercel/node";

// request -> ?id={your_id}
export default async (req: VercelRequest, res: VercelResponse) => {
  const { query } = req;
  const { id } = query;
  res.json({ id });
};
