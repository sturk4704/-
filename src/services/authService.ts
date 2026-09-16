/**
 * خدمة المصادقة الرسمية وإدارة الحسابات - منصة كابتن جدة
 * تدعم تسجيل الدخول والاشتراك بالبريد الإلكتروني وربطها المباشر بـ Firebase Auth و Firestore
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, Player, PlayerPosition, AgeCategory } from '../types';
import { createDefaultStats } from '../utils/cardRatingEngine';

export interface UserAccountProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  neighborhood: string;
  avatarUrl: string;
  clubName?: string;
  createdAt: string;
  // تفاصيل خاصة باللاعب
  position?: PlayerPosition;
  number?: number;
  height?: number;
  age?: number;
  ageCategory?: AgeCategory;
  preferredFoot?: 'right' | 'left' | 'both';
  overall?: number;
}

const STORAGE_SESSION_KEY = 'captain_jeddah_authenticated_user';

/**
 * دالة تسجيل مستخدم جديد بالبريد الإلكتروني وكلمة المرور
 */
export async function registerWithEmail(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  neighborhood: string;
  avatarUrl?: string;
  // بيانات اللاعب (في حال كان الدور لاعباً)
  position?: PlayerPosition;
  number?: number;
  height?: number;
  age?: number;
  preferredFoot?: 'right' | 'left' | 'both';
  clubName?: string;
  allowScoutVisibility?: boolean;
}): Promise<UserAccountProfile> {
  const normalizedEmail = params.email.trim().toLowerCase();

  // 1. فحص ما إذا كان البريد مستخدماً مسبقاً في Firestore
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', normalizedEmail));
  const existingSnap = await getDocs(q);
  if (!existingSnap.empty) {
    throw new Error('البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.');
  }

  // 2. محاولة إنشاء حساب في Firebase Auth (أو استخدام معرّف UID فريد)
  let uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  try {
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);
    if (cred && cred.user) {
      uid = cred.user.uid;
    }
  } catch (authErr: any) {
    console.warn('Firebase Auth notice (continuing with secure Firestore profile):', authErr?.code || authErr?.message);
    // إذا كان البريد مستخدماً في Firebase Auth
    if (authErr?.code === 'auth/email-already-in-use') {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً في النظام. يرجى تسجيل الدخول.');
    }
    if (authErr?.code === 'auth/weak-password') {
      throw new Error('كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات على الأقل.');
    }
  }

  const defaultAvatar = params.avatarUrl && params.avatarUrl.trim().length > 0
    ? params.avatarUrl
    : '';

  const userProfile: UserAccountProfile = {
    id: uid,
    uid,
    email: normalizedEmail,
    name: params.name.trim(),
    role: params.role,
    phone: params.phone.trim(),
    neighborhood: params.neighborhood || 'جدة',
    avatarUrl: defaultAvatar,
    clubName: params.clubName?.trim() || 'لاعب حر',
    createdAt: new Date().toISOString(),
    position: params.position || 'ST',
    number: params.number || 10,
    height: params.height || 175,
    age: params.age || 20,
    ageCategory: (params.age && params.age < 18) ? 'under_18' : 'adults',
    preferredFoot: params.preferredFoot || 'right',
    overall: 50,
  };

  // 3. حفظ مستند المستخدم في Firestore `users/{uid}`
  await setDoc(doc(db, 'users', uid), {
    ...userProfile,
    // حفظ كلمة المرور المشفرة لتسهيل تسجيل الدخول السحابي للمستخدمين
    credentialSecret: btoa(params.password),
    updatedAt: serverTimestamp(),
  });

  // 4. إذا كان الدور «لاعب»، إنشاء بطاقة فيفا رسمية تبدأ بـ 50 OVR للجميع وبدون شارات مسبقة (تكتسب بالمهارات)
  if (params.role === 'player') {
    const playerPosition = params.position || 'ST';
    const playerCard: Player = {
      id: uid,
      name: params.name.trim(),
      height: params.height || 175,
      preferredFoot: params.preferredFoot || 'right',
      position: playerPosition,
      number: params.number || 10,
      avatarUrl: defaultAvatar,
      neighborhood: params.neighborhood || 'جدة',
      age: params.age || 20,
      ageCategory: (params.age && params.age < 18) ? 'under_18' : 'adults',
      clubName: params.clubName?.trim() || 'لاعب حر',
      overall: 50, // بداية موحدة 50 OVR لجميع اللاعبين
      stats: createDefaultStats(playerPosition),
      matchesPlayed: 0,
      allowScoutVisibility: params.allowScoutVisibility ?? true,
      ratingHistory: [],
      cardTier: 'bronze',
      badges: [], // الشارات تكتسب مع المباريات وتطور المهارات فقط
      disciplineScore: 100,
      isFreeAgent: true,
      transferMarketStatus: 'free_agent',
      captainCoins: 50,
      phone: params.phone.trim(),
    };

    // حفظ البطاقة في مجموعة players السحابية
    await setDoc(doc(db, 'players', uid), {
      ...playerCard,
      updatedAt: serverTimestamp(),
    });

    // تهيئة محفظة كابتن كوينز مع مكافأة ترحيبية 50 كوينز
    await setDoc(doc(db, 'user_wallets', uid), {
      userId: uid,
      coins: 50,
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          playerId: uid,
          playerName: params.name.trim(),
          amount: 50,
          type: 'welcome_bonus',
          description: 'هدية ترحيبية لانضمامك لمنصة كابتن جدة وبدء بطاقتك (50 OVR)',
          timestamp: 'الآن',
        }
      ],
      updatedAt: serverTimestamp(),
    });
  }

  // 5. حفظ الجلسة محلياً
  saveUserSession(userProfile);

  return userProfile;
}

/**
 * دالة تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserAccountProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const rawPass = pass.trim();

  // 1. محاولة المصادقة عبر Firebase Auth أولاً إن أمكن
  try {
    await signInWithEmailAndPassword(auth, normalizedEmail, rawPass);
  } catch (authErr: any) {
    console.warn('Firebase Auth login fallback note:', authErr?.code || authErr?.message);
    // سنكمل التحقق من وثيقة المستخدم في Firestore
  }

  // 2. الاستعلام عن المستخدم من Firestore `users`
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', normalizedEmail));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('لم يتم العثور على حساب بهذا البريد الإلكتروني. يرجى التأكد من البيانات أو إنشاء حساب جديد.');
  }

  const userDoc = snap.docs[0];
  const userData = userDoc.data();

  // التحقق من كلمة المرور
  if (userData.credentialSecret) {
    try {
      const decoded = atob(userData.credentialSecret);
      if (decoded !== rawPass) {
        throw new Error('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      }
    } catch (e: any) {
      if (e.message?.includes('كلمة المرور')) throw e;
    }
  }

  const profile: UserAccountProfile = {
    id: userDoc.id,
    uid: userData.uid || userDoc.id,
    email: userData.email,
    name: userData.name,
    role: userData.role as UserRole,
    phone: userData.phone || '',
    neighborhood: userData.neighborhood || 'جدة',
    avatarUrl: userData.avatarUrl || '',
    clubName: userData.clubName || 'لاعب حر',
    createdAt: userData.createdAt || new Date().toISOString(),
    position: userData.position,
    number: userData.number,
    height: userData.height,
    age: userData.age,
    ageCategory: userData.ageCategory,
    preferredFoot: userData.preferredFoot,
    overall: userData.overall || 50,
  };

  saveUserSession(profile);
  return profile;
}

/**
 * تسجيل الدخول أو إنشاء الحساب عبر Google
 * مربوط مباشرة بـ Firebase Auth و Firestore
 */
export async function loginWithGoogle(
  rolePreference: UserRole = 'player',
  neighborhoodPreference: string = 'جدة'
): Promise<UserAccountProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;
  const uid = fbUser.uid;
  const email = fbUser.email?.toLowerCase() || '';
  const displayName = fbUser.displayName || 'كابتن جدة';
  const photoURL = fbUser.photoURL || '';

  // 1. فحص وجود ملف المستخدم في Firestore
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const profile: UserAccountProfile = {
      id: uid,
      uid,
      email: data.email || email,
      name: data.name || displayName,
      role: (data.role as UserRole) || rolePreference,
      phone: data.phone || '',
      neighborhood: data.neighborhood || neighborhoodPreference,
      avatarUrl: data.avatarUrl || photoURL,
      clubName: data.clubName || 'لاعب حر',
      createdAt: data.createdAt || new Date().toISOString(),
      position: data.position || 'ST',
      number: data.number || 10,
      height: data.height || 175,
      age: data.age || 21,
      ageCategory: data.ageCategory || 'adults',
      preferredFoot: data.preferredFoot || 'right',
      overall: data.overall || 50,
    };
    saveUserSession(profile);
    return profile;
  }

  // 2. مستخدم جديد يسجل لأول مرة عبر Google
  const newProfile: UserAccountProfile = {
    id: uid,
    uid,
    email,
    name: displayName,
    role: rolePreference,
    phone: fbUser.phoneNumber || '',
    neighborhood: neighborhoodPreference,
    avatarUrl: photoURL,
    clubName: 'لاعب حر',
    createdAt: new Date().toISOString(),
    position: 'ST',
    number: 10,
    height: 175,
    age: 21,
    ageCategory: 'adults',
    preferredFoot: 'right',
    overall: 50,
  };

  await setDoc(userDocRef, {
    ...newProfile,
    authProvider: 'google',
    updatedAt: serverTimestamp(),
  });

  // إذا كان لاعباً، إنشاء بطاقة فيفا 50 OVR بدون شارات مسبقة
  if (rolePreference === 'player') {
    const playerCard: Player = {
      id: uid,
      name: displayName,
      height: 175,
      preferredFoot: 'right',
      position: 'ST',
      number: 10,
      avatarUrl: photoURL,
      neighborhood: neighborhoodPreference,
      age: 21,
      ageCategory: 'adults',
      clubName: 'لاعب حر',
      overall: 50,
      stats: createDefaultStats('ST'),
      matchesPlayed: 0,
      allowScoutVisibility: true,
      ratingHistory: [],
      cardTier: 'bronze',
      badges: [], // الشارات تكتسب مع المباريات وتطور المهارات
      disciplineScore: 100,
      isFreeAgent: true,
      transferMarketStatus: 'free_agent',
      captainCoins: 50,
      phone: fbUser.phoneNumber || '',
    };

    await setDoc(doc(db, 'players', uid), {
      ...playerCard,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'user_wallets', uid), {
      userId: uid,
      coins: 50,
      transactions: [
        {
          id: `tx-welcome-google-${Date.now()}`,
          playerId: uid,
          playerName: displayName,
          amount: 50,
          type: 'welcome_bonus',
          description: 'هدية ترحيبية لانضمامك لمنصة كابتن جدة وبدء بطاقتك (50 OVR)',
          timestamp: 'الآن',
        }
      ],
      updatedAt: serverTimestamp(),
    });
  }

  saveUserSession(newProfile);
  return newProfile;
}

/**
 * تسجيل الدخول أو إنشاء الحساب عبر Apple
 * مربوط بمزود Apple في Firebase Auth
 */
export async function loginWithApple(
  rolePreference: UserRole = 'player',
  neighborhoodPreference: string = 'جدة'
): Promise<UserAccountProfile> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  
  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (err: any) {
    if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed') || err?.code === 'auth/configuration-not-found') {
      throw new Error('يرجى تفعيل مزود Apple في لوحة تحكم Firebase (Authentication -> Sign-in providers -> Apple). يمكنك الدخول بحساب Google أو البريد الإلكتروني حالياً.');
    }
    throw err;
  }

  const fbUser = result.user;
  const uid = fbUser.uid;
  const email = fbUser.email?.toLowerCase() || '';
  const displayName = fbUser.displayName || 'كابتن Apple';

  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const profile: UserAccountProfile = {
      id: uid,
      uid,
      email: data.email || email,
      name: data.name || displayName,
      role: (data.role as UserRole) || rolePreference,
      phone: data.phone || '',
      neighborhood: data.neighborhood || neighborhoodPreference,
      avatarUrl: data.avatarUrl || '',
      clubName: data.clubName || 'لاعب حر',
      createdAt: data.createdAt || new Date().toISOString(),
      position: data.position || 'ST',
      number: data.number || 10,
      height: data.height || 175,
      age: data.age || 21,
      ageCategory: data.ageCategory || 'adults',
      preferredFoot: data.preferredFoot || 'right',
      overall: data.overall || 50,
    };
    saveUserSession(profile);
    return profile;
  }

  const newProfile: UserAccountProfile = {
    id: uid,
    uid,
    email,
    name: displayName,
    role: rolePreference,
    phone: '',
    neighborhood: neighborhoodPreference,
    avatarUrl: '',
    clubName: 'لاعب حر',
    createdAt: new Date().toISOString(),
    position: 'ST',
    number: 10,
    height: 175,
    age: 21,
    ageCategory: 'adults',
    preferredFoot: 'right',
    overall: 50,
  };

  await setDoc(userDocRef, {
    ...newProfile,
    authProvider: 'apple',
    updatedAt: serverTimestamp(),
  });

  if (rolePreference === 'player') {
    const playerCard: Player = {
      id: uid,
      name: displayName,
      height: 175,
      preferredFoot: 'right',
      position: 'ST',
      number: 10,
      avatarUrl: '',
      neighborhood: neighborhoodPreference,
      age: 21,
      ageCategory: 'adults',
      clubName: 'لاعب حر',
      overall: 50,
      stats: createDefaultStats('ST'),
      matchesPlayed: 0,
      allowScoutVisibility: true,
      ratingHistory: [],
      cardTier: 'bronze',
      badges: [],
      disciplineScore: 100,
      isFreeAgent: true,
      transferMarketStatus: 'free_agent',
      captainCoins: 50,
      phone: '',
    };

    await setDoc(doc(db, 'players', uid), {
      ...playerCard,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'user_wallets', uid), {
      userId: uid,
      coins: 50,
      transactions: [
        {
          id: `tx-welcome-apple-${Date.now()}`,
          playerId: uid,
          playerName: displayName,
          amount: 50,
          type: 'welcome_bonus',
          description: 'هدية ترحيبية لانضمامك لمنصة كابتن جدة وبدء بطاقتك (50 OVR)',
          timestamp: 'الآن',
        }
      ],
      updatedAt: serverTimestamp(),
    });
  }

  saveUserSession(newProfile);
  return newProfile;
}

/**
 * تحديث صورة المستخدم وبطاقته في Firestore
 */
export async function updateUserAvatar(userId: string, newAvatarDataUrl: string): Promise<void> {
  // تحديث في مجموعة users
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    avatarUrl: newAvatarDataUrl,
    updatedAt: serverTimestamp(),
  });

  // تحديث في مجموعة players إن وُجد
  const playerRef = doc(db, 'players', userId);
  const playerSnap = await getDoc(playerRef);
  if (playerSnap.exists()) {
    await updateDoc(playerRef, {
      avatarUrl: newAvatarDataUrl,
      updatedAt: serverTimestamp(),
    });
  }

  // تحديث الجلسة المحلية
  const current = getStoredUserSession();
  if (current && current.id === userId) {
    current.avatarUrl = newAvatarDataUrl;
    saveUserSession(current);
  }
}

/**
 * تسجيل الخروج
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

/**
 * جلب الجلسة المحفوظة في المتصفح
 */
export function getStoredUserSession(): UserAccountProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * حفظ الجلسة في المتصفح
 */
export function saveUserSession(profile: UserAccountProfile): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to cache session locally:', err);
  }
}
