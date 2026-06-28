import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/nodejs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from('user_checkins')
    .select('*')
    .lt('last_checkin', twoDaysAgo);

  for (const user of users || []) {
    for (const contact of user.contacts || []) {
      await emailjs.send(
        process.env.VITE_EMAILJS_SERVICE_ID!,
        process.env.VITE_EMAILJS_TEMPLATE_ID!,
        {
          to_email: contact.email,
          to_name: contact.name,
          user_name: user.name,
          message: `${user.name} has not checked in for 2 days. Please check on them.`
        },
        { publicKey: process.env.VITE_EMAILJS_PUBLIC_KEY! }
      );
    }
  }

  return res.status(200).json({ checked: users?.length || 0 });
}
