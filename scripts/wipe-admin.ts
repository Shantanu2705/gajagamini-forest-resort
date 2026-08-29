import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function deleteCollection(collectionPath: string, batchSize: number = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query: any, resolve: any) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function wipeDatabase() {
  console.log('🚀 Starting wipe of live Firestore Database...');
  const collections = [
    'vehicles', 'drivers', 'corporate', 'enquiries', 
    'bookings', 'quotations', 'routes', 'destinations', 
    'permits', 'sightseeings', 'inclusions', 'exclusions', 
    'notifications', 'invoices', 'receipts'
  ];

  for (const coll of collections) {
    console.log(`Wiping collection: ${coll}...`);
    await deleteCollection(coll);
  }

  console.log('✅ Successfully wiped all dummy data collections from live Firestore!');
  process.exit(0);
}

wipeDatabase().catch((e) => {
  console.error('❌ Wipe error:', e);
  process.exit(1);
});
