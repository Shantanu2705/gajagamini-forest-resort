import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  type: 'service_account',
  project_id: 'quotation-software-3',
  private_key_id: '54f8596531fce57474c95dd4bf1e979229032283',
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC7hOsscuaSBEWS\no5dH2ez4oqA1zaiA+hZPqzKWht5LbTbhhepvPYZjswd5BGYsVdutkFUrA9Cc3VXc\nOrym1jnyb1N5COUjEiVr6SaWrIaWm0dLxJ2+YAntY2spE3qcWvBiNBzLZVkfEPqC\nVVh3y1vjoaUC2be+dQGnUpdBtko3paTl6+bEUx+Le8UxZDbefpV9Y4IzVkmwnidr\nVoeLHz0pBMLZl5vuq2crPsh+05tgzENTypeKt2gXUk/OW/lGcFcvpYuXQlImOWYR\npzIDh94C4NEe7tDl11Vw6iBeY4yODaVDarXsMxY8T1ihW1DnW42VFZ7c4qwDvFc1\nnKnkji21AgMBAAECggEAAhew9XqwGVUJibdgSsxNxACHP9J0XOwYL6S+GHFCLclM\nNtFjFQFfbIwPkJ7R8mYK4NxJdwTAi9+Ubl62wuMvxlrOWFLBwSsaASLwQUzaO6Ku\noFPTXCUqNzHy0i8wy781YNiABxexxOelmVVmeqppnhgBsA8fPnWDzTWIu+eoMF1t\n85EzmdDTNrFQuu7UXuPmdWM6ArBHCdZoS0N7MHWCW15c5gCSS/wADs7kCIF78pIV\nCfwZZtfDCb2aq5s2/OWiQ60j2EzgniACoYgOlKHe9i9tlrqC8f8cUZOvETT9M5rk\ny66iDlZ6hDWhlG7XzG+sF/aSZdIvyEFFoc20sYzwAQKBgQDfcVDUJiKaEdh0OQcw\nIqsci/9tKvMD15qPPeLIYcCidwzAcGTd9vuzCNXX1m7T95si+xfUO4YITjrvZSv5\nZ5TsdfX+e7HG7F9IaBHSTY4e76A6myAp/DiG0N0OILodDV2aatC8Nw4Km5RTodV7\n+XqKtEcZ9Vwui69/41xfWV6ztQKBgQDW151213KrcuspNiAg9/BndOKK6T/lqV5T\nrww1Q7p/UVZtoWQcSQa7ySqSH5P+O3E0ZG9NXUENHZPZVheFjH7U6feYRYz0lr6M\nNDGwNqJgixCYF/VFbA0T7UsnZgOas0tShUHbB808KPaZ3JqFI0Vn0aN0MrKAWRxI\nXA0CsdHSAQKBgQCGuREuSSwVz2q+cOAnos+fL747uWi7SVVUxtClV2NJ0hQrN9lp\niBCtG0eskwtR3Pp6NgFhIt6mxVx9mXfRMiY2CM3guf4v3bd5td4A+mgVuQ/YJk5X\nYk9G4kpWyV7OQ4/LmlnvEhbySGo/ntVUodDELvyr5yfEnM6dgp3gk8co/QKBgQC4\nXx1BCa/ctqhdG5gC8wQapNJth7JQM0NB6a0+YLtB29miB6jUJU9kBEVGVVc6DGUg\nIzjpWagjy0hAcYOKFoIZ0herU7SdimhIBdrGcHx1AaLiA113kDzA5xlh3EgnkMqJ\nLNbRUyasBDNs40awDw7XA6+UXpWVU+PTrTt1HokEAQKBgQDNhuXpoKKWXPk0nAH5\n/xt3frXPh4ZnvtHkkDFU2Ywv9+Z7h4r29u+S4oFVVBu0J7gSel40dClVzNQPp0d5\nXEVWKvf9fXHmgouDiuOmSUdZLr5kLbXuN/PrQRR8Uy/oVOevcgvitQd1JqYkoU0F\n0mi1sz+eLcOHV8Gawz3/Sky1YQ==\n-----END PRIVATE KEY-----\n",
  client_email: 'firebase-adminsdk-fbsvc@quotation-software-3.iam.gserviceaccount.com',
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    databaseURL: 'https://quotation-software-3.firebaseio.com',
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
