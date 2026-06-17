import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import * as OneSignal from 'onesignal-web-sdk';

// Firebase Configuration (user should replace with their own config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// OneSignal App ID (user should replace with their own)
const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Translations for 7 languages
const translations: Record<string, Record<string, string>> = {
  en: {
    appName: "I'm Fine",
    imFineBtn: "I'm Fine",
    emergencyContacts: "Emergency Contacts",
    addContact: "Add Contact",
    name: "Name",
    phone: "Phone",
    save: "Save",
    delete: "Delete",
    upgradePremium: "Upgrade to Premium",
    alreadyPaid: "Already paid? Activate Premium",
    premiumFeature: "Premium Feature",
    premiumMessage: "Upgrade to add up to 3 emergency contacts",
    sportsTracker: "Sports Tracker",
    offlineMode: "Offline Emergency Mode",
    offlineMessage: "Your data is saved locally and will sync when online",
    language: "Language",
    freeContactLimit: "Free: 1 contact",
    premiumContactLimit: "Premium: 3 contacts",
    dayMonday: "Monday",
    dayTuesday: "Tuesday",
    dayWednesday: "Wednesday",
    dayThursday: "Thursday",
    dayFriday: "Friday",
    addActivity: "Add Activity",
    activity: "Activity",
    time: "Time",
    checkInSent: "Check-in sent!",
    contactSaved: "Contact saved!",
    contactDeleted: "Contact deleted!",
    upgradeTitle: "Upgrade to Premium",
    upgradeDesc: "Get 3 emergency contacts and advanced features",
    signIn: "Sign in with Google",
    signOut: "Sign Out",
    welcome: "Welcome",
    lastCheckIn: "Last Check-in",
    never: "Never",
    notificationsEnabled: "Notifications enabled",
    enableNotifications: "Enable Notifications",
    notifications: "Notifications",
    dataSaved: "Data saved locally"
  },
  ar: {
    appName: "أنا بخير",
    imFineBtn: "أنا بخير",
    emergencyContacts: "جهات اتصال الطوارئ",
    addContact: "إضافة جهة اتصال",
    name: "الاسم",
    phone: "الهاتف",
    save: "حفظ",
    delete: "حذف",
    upgradePremium: "الترقية إلى المميز",
    alreadyPaid: "دفعت بالفعل؟ تفعيل المميز",
    premiumFeature: "ميزة مميزة",
    premiumMessage: "قم بالترقية لإضافة ما يصل إلى 3 جهات اتصال للطوارئ",
    sportsTracker: "متتبع الرياضة",
    offlineMode: "وضع الطوارئ غير المتصل",
    offlineMessage: "يتم حفظ بياناتك محليًا وستتزامن عند الاتصال",
    language: "اللغة",
    freeContactLimit: "مجاني: جهة اتصال واحدة",
    premiumContactLimit: "مميز: 3 جهات اتصال",
    dayMonday: "الاثنين",
    dayTuesday: "الثلاثاء",
    dayWednesday: "الأربعاء",
    dayThursday: "الخميس",
    dayFriday: "الجمعة",
    addActivity: "إضافة نشاط",
    activity: "النشاط",
    time: "الوقت",
    checkInSent: "تم إرسال التحقق!",
    contactSaved: "تم حفظ جهة الاتصال!",
    contactDeleted: "تم حذف جهة الاتصال!",
    upgradeTitle: "الترقية إلى المميز",
    upgradeDesc: "احصل على 3 جهات اتصال للطوارئ وميزات متقدمة",
    signIn: "تسجيل الدخول عبر جوجل",
    signOut: "تسجيل الخروج",
    welcome: "مرحبا",
    lastCheckIn: "آخر تحقق",
    never: "أبدًا",
    notificationsEnabled: "تم تفعيل الإشعارات",
    enableNotifications: "تفعيل الإشعارات",
    notifications: "الإشعارات",
    dataSaved: "تم حفظ البيانات محليًا"
  },
  fr: {
    appName: "Je vais bien",
    imFineBtn: "Je vais bien",
    emergencyContacts: "Contacts d'urgence",
    addContact: "Ajouter un contact",
    name: "Nom",
    phone: "Téléphone",
    save: "Enregistrer",
    delete: "Supprimer",
    upgradePremium: "Passer à Premium",
    alreadyPaid: "Déjà payé? Activer Premium",
    premiumFeature: "Fonctionnalité Premium",
    premiumMessage: "Passez à Premium pour ajouter jusqu'à 3 contacts d'urgence",
    sportsTracker: "Suivi sportif",
    offlineMode: "Mode hors ligne d'urgence",
    offlineMessage: "Vos données sont enregistrées localement et se synchroniseront en ligne",
    language: "Langue",
    freeContactLimit: "Gratuit: 1 contact",
    premiumContactLimit: "Premium: 3 contacts",
    dayMonday: "Lundi",
    dayTuesday: "Mardi",
    dayWednesday: "Mercredi",
    dayThursday: "Jeudi",
    dayFriday: "Vendredi",
    addActivity: "Ajouter une activité",
    activity: "Activité",
    time: "Heure",
    checkInSent: "Check-in envoyé!",
    contactSaved: "Contact enregistré!",
    contactDeleted: "Contact supprimé!",
    upgradeTitle: "Passer à Premium",
    upgradeDesc: "Obtenez 3 contacts d'urgence et des fonctionnalités avancées",
    signIn: "Se connecter avec Google",
    signOut: "Se déconnecter",
    welcome: "Bienvenue",
    lastCheckIn: "Dernier check-in",
    never: "Jamais",
    notificationsEnabled: "Notifications activées",
    enableNotifications: "Activer les notifications",
    notifications: "Notifications",
    dataSaved: "Données enregistrées localement"
  },
  es: {
    appName: "Estoy bien",
    imFineBtn: "Estoy bien",
    emergencyContacts: "Contactos de emergencia",
    addContact: "Agregar contacto",
    name: "Nombre",
    phone: "Teléfono",
    save: "Guardar",
    delete: "Eliminar",
    upgradePremium: "Actualizar a Premium",
    alreadyPaid: "¿Ya pagaste? Activar Premium",
    premiumFeature: "Función Premium",
    premiumMessage: "Actualiza para agregar hasta 3 contactos de emergencia",
    sportsTracker: "Seguimiento deportivo",
    offlineMode: "Modo sin conexión de emergencia",
    offlineMessage: "Tus datos se guardan localmente y se sincronizarán cuando esté en línea",
    language: "Idioma",
    freeContactLimit: "Gratis: 1 contacto",
    premiumContactLimit: "Premium: 3 contactos",
    dayMonday: "Lunes",
    dayTuesday: "Martes",
    dayWednesday: "Miércoles",
    dayThursday: "Jueves",
    dayFriday: "Viernes",
    addActivity: "Agregar actividad",
    activity: "Actividad",
    time: "Hora",
    checkInSent: "¡Check-in enviado!",
    contactSaved: "¡Contacto guardado!",
    contactDeleted: "¡Contacto eliminado!",
    upgradeTitle: "Actualizar a Premium",
    upgradeDesc: "Obtén 3 contactos de emergencia y funciones avanzadas",
    signIn: "Iniciar sesión con Google",
    signOut: "Cerrar sesión",
    welcome: "Bienvenido",
    lastCheckIn: "Último check-in",
    never: "Nunca",
    notificationsEnabled: "Notificaciones activadas",
    enableNotifications: "Activar notificaciones",
    notifications: "Notificaciones",
    dataSaved: "Datos guardados localmente"
  },
  it: {
    appName: "Sto bene",
    imFineBtn: "Sto bene",
    emergencyContacts: "Contatti di emergenza",
    addContact: "Aggiungi contatto",
    name: "Nome",
    phone: "Telefono",
    save: "Salva",
    delete: "Elimina",
    upgradePremium: "Passa a Premium",
    alreadyPaid: "Già pagato? Attiva Premium",
    premiumFeature: "Funzionalità Premium",
    premiumMessage: "Passa a Premium per aggiungere fino a 3 contatti di emergenza",
    sportsTracker: "Tracciatore sportivo",
    offlineMode: "Modalità offline di emergenza",
    offlineMessage: "I tuoi dati sono salvati localmente e si sincronizzeranno online",
    language: "Lingua",
    freeContactLimit: "Gratuito: 1 contatto",
    premiumContactLimit: "Premium: 3 contatti",
    dayMonday: "Lunedì",
    dayTuesday: "Martedì",
    dayWednesday: "Mercoledì",
    dayThursday: "Giovedì",
    dayFriday: "Venerdì",
    addActivity: "Aggiungi attività",
    activity: "Attività",
    time: "Ora",
    checkInSent: "Check-in inviato!",
    contactSaved: "Contatto salvato!",
    contactDeleted: "Contatto eliminato!",
    upgradeTitle: "Passa a Premium",
    upgradeDesc: "Ottieni 3 contatti di emergenza e funzionalità avanzate",
    signIn: "Accedi con Google",
    signOut: "Esci",
    welcome: "Benvenuto",
    lastCheckIn: "Ultimo check-in",
    never: "Mai",
    notificationsEnabled: "Notifiche attivate",
    enableNotifications: "Attiva notifiche",
    notifications: "Notifiche",
    dataSaved: "Dati salvati localmente"
  },
  zh: {
    appName: "我很好",
    imFineBtn: "我很好",
    emergencyContacts: "紧急联系人",
    addContact: "添加联系人",
    name: "姓名",
    phone: "电话",
    save: "保存",
    delete: "删除",
    upgradePremium: "升级到高级版",
    alreadyPaid: "已付款？激活高级版",
    premiumFeature: "高级功能",
    premiumMessage: "升级后可添加最多3个紧急联系人",
    sportsTracker: "运动追踪器",
    offlineMode: "离线紧急模式",
    offlineMessage: "您的数据保存在本地，联网后会同步",
    language: "语言",
    freeContactLimit: "免费：1个联系人",
    premiumContactLimit: "高级：3个联系人",
    dayMonday: "周一",
    dayTuesday: "周二",
    dayWednesday: "周三",
    dayThursday: "周四",
    dayFriday: "周五",
    addActivity: "添加活动",
    activity: "活动",
    time: "时间",
    checkInSent: "签到已发送！",
    contactSaved: "联系人已保存！",
    contactDeleted: "联系人已删除！",
    upgradeTitle: "升级到高级版",
    upgradeDesc: "获得3个紧急联系人和高级功能",
    signIn: "使用Google登录",
    signOut: "退出",
    welcome: "欢迎",
    lastCheckIn: "上次签到",
    never: "从未",
    notificationsEnabled: "通知已启用",
    enableNotifications: "启用通知",
    notifications: "通知",
    dataSaved: "数据已本地保存"
  },
  ru: {
    appName: "Я в порядке",
    imFineBtn: "Я в порядке",
    emergencyContacts: "Экстренные контакты",
    addContact: "Добавить контакт",
    name: "Имя",
    phone: "Телефон",
    save: "Сохранить",
    delete: "Удалить",
    upgradePremium: "Обновить до Premium",
    alreadyPaid: "Уже оплатили? Активировать Premium",
    premiumFeature: "Премиум функция",
    premiumMessage: "Обновите до Premium, чтобы добавить до 3 экстренных контактов",
    sportsTracker: "Трекер спорта",
    offlineMode: "Автономный режим экстренной помощи",
    offlineMessage: "Ваши данные сохраняются локально и синхронизируются при подключении",
    language: "Язык",
    freeContactLimit: "Бесплатно: 1 контакт",
    premiumContactLimit: "Premium: 3 контакта",
    dayMonday: "Понедельник",
    dayTuesday: "Вторник",
    dayWednesday: "Среда",
    dayThursday: "Четверг",
    dayFriday: "Пятница",
    addActivity: "Добавить активность",
    activity: "Активность",
    time: "Время",
    checkInSent: "Чек-ин отправлен!",
    contactSaved: "Контакт сохранен!",
    contactDeleted: "Контакт удален!",
    upgradeTitle: "Обновить до Premium",
    upgradeDesc: "Получите 3 экстренных контакта и расширенные функции",
    signIn: "Войти через Google",
    signOut: "Выйти",
    welcome: "Добро пожаловать",
    lastCheckIn: "Последний чек-ин",
    never: "Никогда",
    notificationsEnabled: "Уведомления включены",
    enableNotifications: "Включить уведомления",
    notifications: "Уведомления",
    dataSaved: "Данные сохранены локально"
  }
};

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface Activity {
  id: string;
  name: string;
  time: string;
}

interface WeekSchedule {
  [key: string]: Activity[];
}

interface UserData {
  contacts: Contact[];
  schedule: WeekSchedule;
  isPremium: boolean;
  lastCheckIn: string | null;
  language: string;
  notificationsEnabled: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const STORAGE_KEY = 'dailycheck-userdata';

// Local Storage helpers
function loadUserData(): UserData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user data from localStorage:', e);
  }
  return {
    contacts: [],
    schedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    },
    isPremium: false,
    lastCheckIn: null,
    language: 'en',
    notificationsEnabled: false
  };
}

function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data to localStorage:', e);
  }
}

export default function DailyCheck() {
  // Load initial state from localStorage
  const [userData, setUserData] = useState<UserData>(() => loadUserData());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);

  // ===== LOCATION SHARING =====
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [shareLocation, setShareLocation] = useState(false);

  // Destructure userData for convenience
  const { contacts, schedule, isPremium, lastCheckIn, language, notificationsEnabled } = userData;

  const t = translations[language];
  const maxContacts = isPremium ? 3 : 1;
  const isRTL = language === 'ar';

  // Update userData and persist to localStorage
  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setUserData(prev => {
      const newData = { ...prev, ...updates };
      saveUserData(newData);
      return newData;
    });
  }, []);

  // Initialize OneSignal
  useEffect(() => {
    if (oneSignalAppId && oneSignalAppId !== 'YOUR_ONESIGNAL_APP_ID') {
      try {
        OneSignal.init({
          appId: oneSignalAppId,
          notifyButton: {
            enable: true,
          },
        }).then(() => {
          setOneSignalInitialized(true);
          console.log('OneSignal initialized successfully');
        }).catch((error) => {
          console.error('One initialization failed:', error);
        });
      } catch (error) {
        console.warn('OneSignal not available:', error);
      }
    }
  }, []);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Google Sign In
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showNotification('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      showNotification('Sign in failed. Please try again.');
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Enable push notifications
  const handleEnableNotifications = async () => {
    if (oneSignalInitialized) {
      try {
        await OneSignal.Notifications.requestPermission();
        updateUserData({ notificationsEnabled: true });
        showNotification(t.notificationsEnabled);
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    } else {
      // Fallback to browser notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          updateUserData({ notificationsEnabled: true });
          showNotification(t.notificationsEnabled);
        }
      }
    }
  };

  // ===== LOCATION SHARING FUNCTIONS =====
  const getLocation = useCallback(() => {
    if (!isPremium) {
      showNotification('🔒 Premium feature only');
      return;
    }
    if (!navigator.geolocation) {
      showNotification('⚠️ Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        showNotification('📍 Location acquired');
      },
      () => {
        setUserLocation(null);
        showNotification('⚠️ Could not get location');
      }
    );
  }, [isPremium]);

  const getLocationText = useCallback(() => {
    if (!isPremium || !shareLocation || !userLocation) {
      return "Location unknown. Please contact the user directly.";
    }
    return `📍 Last known location: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
  }, [isPremium, shareLocation, userLocation]);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const handleImFine = async () => {
    const now = new Date().toISOString();
    updateUserData({ lastCheckIn: now });

    // إرسال الموقع مع التنبيه إذا كان المستخدم مشتركاً
    if (isPremium && shareLocation) {
      getLocation();
    }

    if (contacts.length > 0) {
      const locationText = getLocationText();
      showNotification(t.checkInSent);
      showBrowserNotification(t.appName, t.checkInSent + ' ' + locationText);

      // In production, this would trigger push notifications to contacts via OneSignal
      if (isOnline) {
        console.log('Sending check-in notification to contacts:', contacts);
        console.log('Location:', locationText);
      }
    } else {
      showNotification('Check-in recorded! Add contacts for notifications.');
    }
  };

  const handleAddContact = () => {
    if (contacts.length >= maxContacts && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    if (contacts.length >= maxContacts) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone
    };
    updateUserData({ contacts: [...contacts, newContact] });
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
    showNotification(t.contactSaved);
  };

  const handleDeleteContact = (id: string) => {
    updateUserData({ contacts: contacts.filter(c => c.id !== id) });
    showNotification(t.contactDeleted);
  };

  const handleAddActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: newActivityName,
      time: newActivityTime
    };
    updateUserData({
      schedule: {
        ...schedule,
        [selectedDay]: [...schedule[selectedDay], newActivity]
      }
    });
    setNewActivityName('');
    setNewActivityTime('');
    setShowAddActivity(false);
    showNotification(t.dataSaved);
  };

  const handleDeleteActivity = (day: string, id: string) => {
    updateUserData({
      schedule: {
        ...schedule,
        [day]: schedule[day].filter(a => a.id !== id)
      }
    });
  };

  const handleActivatePremium = () => {
    updateUserData({ isPremium: true });
    setShowUpgradeModal(false);
    showNotification('Premium activated!');
  };

  const formatLastCheckIn = (dateStr: string | null) => {
    if (!dateStr) return t.never;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        direction: isRTL ? 'rtl' : 'ltr',
        padding: '20px'
      }}
    >
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 24px',
          borderRadius: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: 500,
          color: '#333'
        }}>
          {notification}
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div style={{
          background: '#ff6b6b',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 500
        }}>
          {t.offlineMode}: {t.offlineMessage}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{
          color: 'white',
          margin: 0,
          fontSize: '28px',
          fontWeight: 700
        }}>
          {t.appName}
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }}
                />
              )}
              <span style={{ color: 'white', fontWeight: 500 }}>
                {t.welcome}, {user.displayName?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              style={{
                background: 'white',
                border: 'none',
                color: '#333',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.signIn}
            </button>
          )}

          {isPremium && (
            <span style={{
              background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#333'
            }}>
              Premium
            </span>
          )}

          <select
            value={language}
            onChange={(e) => updateUserData({ language: e.target.value })}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* I'm Fine Button Section */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          color: '#666',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {t.lastCheckIn}: {formatLastCheckIn(lastCheckIn)}
        </div>

        <button
          onClick={handleImFine}
          style={{
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            border: 'none',
            color: 'white',
            fontSize: '32px',
            fontWeight: 700,
            padding: '30px 60px',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(56, 239, 125, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(56, 239, 125, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(56, 239, 125, 0.4)';
          }}
        >
          {t.imFineBtn}
        </button>

        {/* Notification toggle */}
        <div style={{ marginTop: '20px' }}>
          {notificationsEnabled ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#e8f5e9',
              padding: '8px 16px',
              borderRadius: '20px',
              color: '#38a169',
              fontSize: '14px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {t.notificationsEnabled}
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              style={{
                background: 'transparent',
                border: '1px solid #764ba2',
                color: '#764ba2',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {t.enableNotifications}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Emergency Contacts */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{
            color: '#764ba2',
            marginTop: 0,
            marginBottom: '15px',
            fontSize: '22px'
          }}>
            {t.emergencyContacts}
          </h2>

          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            {isPremium ? t.premiumContactLimit : t.freeContactLimit}
          </p>

          {/* Contact List */}
          <div style={{ marginBottom: '15px' }}>
            {contacts.map(contact => (
              <div key={contact.id} style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{contact.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{contact.phone}</div>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  style={{
                    background: '#ff6b6b',
                    border: 'none',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>

          {/* Add Contact Button */}
          {!showAddContact ? (
            <button
              onClick={() => {
                if (contacts.length >= maxContacts && !isPremium) {
                  setShowUpgradeModal(true);
                } else if (contacts.length < maxContacts) {
                  setShowAddContact(true);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                width: '100%'
              }}
            >
              {t.addContact}
            </button>
          ) : (
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '10px'
            }}>
              <input
                type="text"
                placeholder={t.name}
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                style={{
                  width: 'calc(100% - 16px)',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}
              />
              <input
                type="tel"
                placeholder={t.phone}
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                style={{
                  width: 'calc(100% - 16px)',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleAddContact}
                  disabled={!newContactName || !newContactPhone}
                  style={{
                    background: newContactName && newContactPhone ? '#38ef7d' : '#ccc',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: newContactName && newContactPhone ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  style={{
                    background: '#ddd',
                    border: 'none',
                    color: '#333',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sports Tracker */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{
            color: '#764ba2',
            marginTop: 0,
            marginBottom: '15px',
            fontSize: '22px'
          }}>
            {t.sportsTracker}
          </h2>

          {/* Location Sharing Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#374151' }}>📍 Share location on emergency</span>
            <div 
              onClick={() => {
                if (isPremium) {
                  setShareLocation(!shareLocation);
                  if (!shareLocation) getLocation();
                } else {
                  showNotification('🔒 Premium feature only');
                }
              }}
              style={{ 
                width: 46, 
                height: 26, 
                borderRadius: 13, 
                background: (isPremium && shareLocation) ? '#ea580c' : '#d1d5db', 
                cursor: isPremium ? 'pointer' : 'not-allowed',
                position: 'relative', 
                transition: 'background 0.2s' 
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: 3, 
                left: (isPremium && shareLocation) ? 22 : 3, 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                background: 'white', 
                transition: 'left 0.2s' 
              }} />
            </div>
            {!isPremium && <span style={{ fontSize: 11, color: '#6b7280' }}>(Premium only)</span>}
          </div>

          {/* Day Tabs */}
          <div style={{
            display: 'flex',
            gap: '5px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  background: selectedDay === day ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
                  border: 'none',
                  color: selectedDay === day ? 'white' : '#333',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                {t[`day${day.charAt(0).toUpperCase() + day.slice(1)}` as keyof typeof t]}
              </button>
            ))}
          </div>

          {/* Activities for selected day */}
          <div style={{ minHeight: '100px' }}>
            {schedule[selectedDay]?.map(activity => (
              <div key={activity.id} style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{activity.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{activity.time}</div>
                </div>
                <button
                  onClick={() => handleDeleteActivity(selectedDay, activity.id)}
                  style={{
                    background: '#ff6b6b',
                    border: 'none',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {t.delete}
                </button>
              </div>
            ))}

            {schedule[selectedDay]?.length === 0 && (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                No activities
              </p>
            )}
          </div>

          {/* Add Activity */}
          {!showAddActivity ? (
            <button
              onClick={() => setShowAddActivity(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                width: '100%',
                marginTop: '10px'
              }}
            >
              {t.addActivity}
            </button>
          ) : (
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              <input
                type="text"
                placeholder={t.activity}
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                style={{
                  width: 'calc(100% - 16px)',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}
              />
              <input
                type="time"
                value={newActivityTime}
                onChange={(e) => setNewActivityTime(e.target.value)}
                style={{
                  width: 'calc(100% - 16px)',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivityName || !newActivityTime}
                  style={{
                    background: newActivityName && newActivityTime ? '#38ef7d' : '#ccc',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: newActivityName && newActivityTime ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setShowAddActivity(false)}
                  style={{
                    background: '#ddd',
                    border: 'none',
                    color: '#333',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpgradeModal(false);
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#764ba2',
              marginTop: 0,
              marginBottom: '15px',
              fontSize: '24px'
            }}>
              {t.upgradeTitle}
            </h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              {t.upgradeDesc}
            </p>

            {/* PayPal Button */}
            <a
              href="https://www.paypal.com/ncp/payment/KJ5GTRU64EZ3L"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #0070ba, #1546a0)',
                color: 'white',
                textDecoration: 'none',
                padding: '16px 32px',
                borderRadius: '25px',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(0, 112, 186, 0.4)'
              }}
            >
              {t.upgradePremium}
            </a>

            {/* Already Paid Button */}
            <button
              onClick={handleActivatePremium}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: '2px solid #38ef7d',
                color: '#38ef7d',
                padding: '14px 32px',
                borderRadius: '25px',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              {t.alreadyPaid}
            </button>

            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                background: '#f0f0f0',
                border: 'none',
                color: '#666',
                padding: '10px 30px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '30px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {!isOnline && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px'
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                background: '#ff6b6b',
                borderRadius: '50%'
              }} />
              {t.offlineMode}
            </span>
          )}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            {t.dataSaved}
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 600px) {
          button {
            font-size: 14px !important;
            padding: 12px 20px !important;
          }

          h1 {
            font-size: 22px !important;
          }

          h2 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
  
    
  
      
          
                
          
                  
          
            
        
