import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
  console.log(`Seeding database: ${firebaseConfig.projectId}...`);
  try {
    console.log('Authenticating as admin...');
    await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
    console.log('Authenticated! Writing data...');

    for (const v of initialGuests) await setDoc(doc(db, 'guests', v.id), v);
    for (const d of initialRoomTypes) await setDoc(doc(db, 'roomTypes', d.id), d);
    for (const c of initialMealPlans) await setDoc(doc(db, 'mealPlans', c.id), c);
    for (const e of initialAdditionalServices) await setDoc(doc(db, 'additionalServices', e.id), e);
    for (const b of initialEnquiries) await setDoc(doc(db, 'enquiries', b.id), b);
    for (const q of initialBookings) await setDoc(doc(db, 'bookings', q.id), q);
    for (const r of initialQuotations) await setDoc(doc(db, 'hotelQuotations', r.id), r);
    for (const dest of initialInvoices) await setDoc(doc(db, 'invoices', dest.id), dest);
    for (const p of initialReceipts) await setDoc(doc(db, 'receipts', p.id), p);
    
    await setDoc(doc(db, 'settings', 'company'), initialSettings);
    
    console.log('✅ Successfully seeded all data to Firestore via client SDK!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to seed:', err.message);
    process.exit(1);
  }
}

seed();
