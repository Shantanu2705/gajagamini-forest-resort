import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

const firebaseConfig = {
  apiKey: 'AIzaSyAc0kxWdrkHz8GnwJLep475rB9jXaPr8fo',
  authDomain: 'hotel-quotation-340b2.firebaseapp.com',
  projectId: 'hotel-quotation-340b2',
  storageBucket: 'hotel-quotation-340b2.firebasestorage.app',
  messagingSenderId: '1011725600479',
  appId: '1:1011725600479:web:c8ba4aa52ed509e3fa0b6a',
  measurementId: 'G-TV2FHCNX2H'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function runSeed() {
  console.log('🚀 Starting Client SDK live database seed for hotel-quotation-340b2...');
  
  await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
  console.log('🔑 Logged in successfully!');

  let count = 0;

  for (const v of initialGuests) { await setDoc(doc(db, 'guests', v.id), v); count++; }
  for (const d of initialRoomTypes) { await setDoc(doc(db, 'roomTypes', d.id), d); count++; }
  for (const c of initialMealPlans) { await setDoc(doc(db, 'mealPlans', c.id), c); count++; }
  for (const e of initialAdditionalServices) { await setDoc(doc(db, 'additionalServices', e.id), e); count++; }
  for (const b of initialEnquiries) { await setDoc(doc(db, 'enquiries', b.id), b); count++; }
  for (const q of initialBookings) { await setDoc(doc(db, 'bookings', q.id), q); count++; }
  for (const r of initialQuotations) { await setDoc(doc(db, 'hotelQuotations', r.id), r); count++; }
  for (const dest of initialInvoices) { await setDoc(doc(db, 'invoices', dest.id), dest); count++; }
  for (const p of initialReceipts) { await setDoc(doc(db, 'receipts', p.id), p); count++; }

  await setDoc(doc(db, 'settings', 'company'), initialSettings); count++;

  console.log(`✅ Successfully uploaded ${count} enterprise documents to live Firestore via Client SDK!`);
  process.exit(0);
}

runSeed().catch((e) => {
  console.error('❌ Seeding error:', e);
  process.exit(1);
});
