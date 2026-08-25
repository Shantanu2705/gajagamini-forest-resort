import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import {
  initialGuests,
  initialRoomTypes,
  initialMealPlans,
  initialAdditionalServices,
  initialEnquiries,
  initialBookings,
  initialQuotations,
  initialInvoices,
  initialReceipts,
  initialSettings,
} from './lib/firebase/seed-data';

dotenv.config({ path: '.env.local' });

const serviceAccount = {
  type: 'service_account',
  project_id: 'quotation-software-3',
  private_key_id: '54f8596531fce57474c95dd4bf1e979229032283',
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

const app = initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: 'https://quotation-software-3.firebaseio.com',
});

const db = getFirestore(app);

async function seed() {
  console.log(`Seeding database: ${serviceAccount.project_id}...`);
  try {
    for (const v of initialGuests) await db.collection('guests').doc(v.id).set(v);
    for (const d of initialRoomTypes) await db.collection('roomTypes').doc(d.id).set(d);
    for (const c of initialMealPlans) await db.collection('mealPlans').doc(c.id).set(c);
    for (const e of initialAdditionalServices) await db.collection('additionalServices').doc(e.id).set(e);
    for (const b of initialEnquiries) await db.collection('enquiries').doc(b.id).set(b);
    for (const q of initialBookings) await db.collection('bookings').doc(q.id).set(q);
    for (const r of initialQuotations) await db.collection('hotelQuotations').doc(r.id).set(r);
    for (const dest of initialInvoices) await db.collection('invoices').doc(dest.id).set(dest);
    for (const p of initialReceipts) await db.collection('receipts').doc(p.id).set(p);
    
    await db.collection('settings').doc('company').set(initialSettings);
    
    console.log('✅ Successfully seeded all data to Firestore via Admin SDK!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to seed:', err.message);
    process.exit(1);
  }
}

seed();
