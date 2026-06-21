import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = req.body;
    const eventType = body.event_type;
    if (eventType === 'PAYMENT.SALE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const email = body?.resource?.payer?.email_address ||
                    body?.resource?.payment_source?.paypal?.email_address;
      if (email) {
        await supabase.from('premium_users')
          .upsert({ email }, { onConflict: 'email' });
      }
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
