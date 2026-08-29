import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
} from '../lib/firebase/seed-data';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://quotation-software-3.firebaseio.com',
  });
}

const db = getFirestore();

async function runSeed() {
  console.log('🚀 Starting Admin SDK live database seed for quotation-software-3...');
  let count = 0;

  for (const v of initialGuests) { await db.collection('guests').doc(v.id).set(v); count++; }
  for (const d of initialRoomTypes) { await db.collection('roomTypes').doc(d.id).set(d); count++; }
  for (const c of initialMealPlans) { await db.collection('mealPlans').doc(c.id).set(c); count++; }
  for (const e of initialAdditionalServices) { await db.collection('additionalServices').doc(e.id).set(e); count++; }
  for (const b of initialEnquiries) { await db.collection('enquiries').doc(b.id).set(b); count++; }
  for (const q of initialBookings) { await db.collection('bookings').doc(q.id).set(q); count++; }
  for (const r of initialQuotations) { await db.collection('hotelQuotations').doc(r.id).set(r); count++; }
  for (const dest of initialInvoices) { await db.collection('invoices').doc(dest.id).set(dest); count++; }
  for (const p of initialReceipts) { await db.collection('receipts').doc(p.id).set(p); count++; }

  await db.collection('settings').doc('company').set(initialSettings); count++;

  console.log(`✅ Successfully uploaded ${count} enterprise documents to live Firestore!`);
  process.exit(0);
}

runSeed().catch((e) => {
  console.error('❌ Seeding error:', e);
  process.exit(1);
});
