import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// تهيئة تطبيق Firebase
const app = !getApps().length ? initializeApp(config) : getApp();

// تهيئة قاعدة بيانات Firestore المحددة في التكوين السحابي
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, config.firestoreDatabaseId);

// تهيئة نظام المصادقة
const auth = getAuth(app);

export { app, db, auth };
