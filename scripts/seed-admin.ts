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
