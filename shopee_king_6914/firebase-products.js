import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnHpQONClba7a9G0uM36cI1jcfz5jTVEA",
  authDomain: "gen-lang-client-0141234491.firebaseapp.com",
  projectId: "gen-lang-client-0141234491",
  storageBucket: "gen-lang-client-0141234491.firebasestorage.app",
  messagingSenderId: "277444220182",
  appId: "1:277444220182:web:787e8989b557d008152c37",
};

const databaseId = "ai-studio-remixtaithaiapp-75e1f35e-2cc5-45a8-8a42-e4a81ea8cffb";
const shopDocumentId = "king_6914";
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, databaseId);

const shopRef = doc(db, "shops", shopDocumentId);
const productsRef = collection(shopRef, "products");

export async function getShopeeShop() {
  const snapshot = await getDoc(shopRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getShopeeProduct(itemId) {
  const snapshot = await getDoc(doc(productsRef, String(itemId)));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function listShopeeProducts({ pageSize = 20, cursor = null } = {}) {
  const size = Math.max(1, Math.min(Number(pageSize) || 20, 100));
  const constraints = [orderBy("nameLower"), limit(size)];
  if (cursor) constraints.splice(1, 0, startAfter(cursor));
  const snapshot = await getDocs(query(productsRef, ...constraints));
  return {
    products: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
    cursor: snapshot.docs.at(-1) || null,
    hasMore: snapshot.size === size,
  };
}
