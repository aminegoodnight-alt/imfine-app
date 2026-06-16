import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── OneSignal (CDN) ───────────────────────────────────────────────────────────
declare global {
  interface Window {
    OneSignal?: {
      init: (config: { appId: string; notifyButton?: { enable: boolean } }) => Promise<void>;
      Notifications: { requestPermission: () => Promise<void> };
    };
    emailjs?: {
      send: (serviceId: string, templateId: string, params: Record<string, string>) => Promise<void>;
      init: (publicKey: string) => void;
    };
  }
}

// ─── Design constants ─────────────────────────────────────────────────────────
const C = {
  pageBg:            '#f0fdf4',
  topBarStart:       '#166534',
  topBarEnd:         '#16a34a',
  imFineStart:       '#ef4444',
  imFineEnd:         '#dc2626',
  green:             '#16a34a',
  white:             '#ffffff',
  cardBg:            '#ffffff',
  cardShadow:        '0 2px 8px rgba(0,0,0,0.08)',
  cardBorder:        '1px solid #e5e7eb',
  titleText:         '#111827',
  subtitleText:      '#6b7280',
  tableHeaderBg:     '#dcfce7',
  tableHeaderText:   '#166534',
  tableRowAlt:       '#f9fafb',
  deleteBtn:         '#ef4444',
  premiumGold:       '#fbbf24',
};

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'YOUR_AUTH_DOMAIN',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'YOUR_APP_ID',
};

const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID';

// EmailJS config — user fills in their own IDs
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_EMAILJS_TEMPLATE_ID';

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase: SupabaseClient | null =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    : null;

// ─── Translations ─────────────────────────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  en: {
    appName: "I'm Fine", imFineBtn: "I'm Fine",
    emergencyContacts: 'Emergency Contacts', addContact: 'Add Contact',
    name: 'Name', phone: 'Phone', email: 'Email (for alerts)',
    save: 'Save', delete: 'Delete', cancel: 'Cancel', close: 'Close',
    upgradePremium: 'Upgrade to Premium',
    premiumFeature: 'Premium Feature',
    premiumMessage: 'Upgrade to add up to 3 emergency contacts',
    sportsTracker: 'Sports Tracker',
    offlineMode: 'Offline Mode',
    offlineMessage: 'Data saved locally, will sync when online',
    language: 'Language',
    freeContactLimit: 'Free: 1 contact', premiumContactLimit: 'Premium: 3 contacts',
    dayMonday: 'Mon', dayTuesday: 'Tue', dayWednesday: 'Wed',
    dayThursday: 'Thu', dayFriday: 'Fri', daySaturday: 'Sat', daySunday: 'Sun',
    addActivity: 'Add Activity', activity: 'Activity', time: 'Time',
    checkInSent: 'Check-in sent!', contactSaved: 'Contact saved!',
    contactDeleted: 'Contact deleted!',
    upgradeTitle: 'Upgrade to Premium',
    upgradeDesc: 'Get up to 3 emergency contacts and advanced features',
    premiumFeature1: 'Up to 3 Emergency Contacts',
    premiumFeature2: 'Full 7-Day Sports Tracker',
    premiumFeature3: 'Email Alerts to All Contacts',
    premiumFeature4: 'Smart Workout Notifications',
    premiumFeature5: 'Priority Support',
    signIn: 'Sign in with Google', signOut: 'Sign Out',
    welcome: 'Welcome', lastCheckIn: 'Last Check-in', never: 'Never',
    notificationsEnabled: 'Notifications enabled',
    enableNotifications: 'Enable Notifications',
    dataSaved: 'Data saved locally',
    noActivities: 'No activities planned',
    subscribe: 'Subscribe — $2.50 every 2 months',
    emailAlertSent: 'Emergency email alert sent!',
    missedCheckin: 'has not checked in for 2 days. Please check on them.',
  },
  ar: {
    appName: 'أنا بخير', imFineBtn: 'أنا بخير',
    emergencyContacts: 'جهات اتصال الطوارئ', addContact: 'إضافة جهة اتصال',
    name: 'الاسم', phone: 'الهاتف', email: 'البريد الإلكتروني (للتنبيهات)',
    save: 'حفظ', delete: 'حذف', cancel: 'إلغاء', close: 'إغلاق',
    upgradePremium: 'الترقية إلى المميز',
    premiumFeature: 'ميزة مميزة',
    premiumMessage: 'قم بالترقية لإضافة ما يصل إلى 3 جهات اتصال للطوارئ',
    sportsTracker: 'متتبع الرياضة',
    offlineMode: 'وضع غير متصل', offlineMessage: 'البيانات محفوظة محليًا',
    language: 'اللغة',
    freeContactLimit: 'مجاني: جهة اتصال واحدة', premiumContactLimit: 'مميز: 3 جهات اتصال',
    dayMonday: 'الاثنين', dayTuesday: 'الثلاثاء', dayWednesday: 'الأربعاء',
    dayThursday: 'الخميس', dayFriday: 'الجمعة', daySaturday: 'السبت', daySunday: 'الأحد',
    addActivity: 'إضافة نشاط', activity: 'النشاط', time: 'الوقت',
    checkInSent: 'تم إرسال التحقق!', contactSaved: 'تم حفظ جهة الاتصال!',
    contactDeleted: 'تم حذف جهة الاتصال!',
    upgradeTitle: 'الترقية إلى المميز',
    upgradeDesc: 'احصل على 3 جهات اتصال للطوارئ وميزات متقدمة',
    premiumFeature1: 'حتى 3 جهات اتصال للطوارئ', premiumFeature2: 'متتبع رياضي 7 أيام',
    premiumFeature3: 'تنبيهات بريد إلكتروني لجميع جهات الاتصال',
    premiumFeature4: 'إشعارات تمرين ذكية', premiumFeature5: 'دعم ذو أولوية',
    signIn: 'تسجيل الدخول بـ Google', signOut: 'تسجيل الخروج',
    welcome: 'مرحباً', lastCheckIn: 'آخر تحقق', never: 'أبدًا',
    notificationsEnabled: 'الإشعارات مفعلة', enableNotifications: 'تفعيل الإشعارات',
    dataSaved: 'البيانات محفوظة محليًا', noActivities: 'لا توجد أنشطة مخططة',
    subscribe: 'اشتراك — 2.50 دولار كل شهرين',
    emailAlertSent: 'تم إرسال تنبيه الطوارئ!',
    missedCheckin: 'لم يتحقق منذ يومين. يرجى التحقق منه.',
  },
  fr: {
    appName: 'Je vais bien', imFineBtn: 'Je vais bien',
    emergencyContacts: "Contacts d'urgence", addContact: 'Ajouter un contact',
    name: 'Nom', phone: 'Téléphone', email: 'Email (pour alertes)',
    save: 'Enregistrer', delete: 'Supprimer', cancel: 'Annuler', close: 'Fermer',
    upgradePremium: 'Passer à Premium',
    premiumFeature: 'Fonctionnalité Premium',
    premiumMessage: "Passez à Premium pour ajouter jusqu'à 3 contacts d'urgence",
    sportsTracker: 'Suivi sportif',
    offlineMode: 'Mode hors ligne', offlineMessage: 'Données enregistrées localement',
    language: 'Langue',
    freeContactLimit: 'Gratuit: 1 contact', premiumContactLimit: 'Premium: 3 contacts',
    dayMonday: 'Lun', dayTuesday: 'Mar', dayWednesday: 'Mer',
    dayThursday: 'Jeu', dayFriday: 'Ven', daySaturday: 'Sam', daySunday: 'Dim',
    addActivity: 'Ajouter une activité', activity: 'Activité', time: 'Heure',
    checkInSent: 'Check-in envoyé!', contactSaved: 'Contact enregistré!',
    contactDeleted: 'Contact supprimé!',
    upgradeTitle: 'Passer à Premium',
    upgradeDesc: "Obtenez 3 contacts d'urgence et des fonctionnalités avancées",
    premiumFeature1: "Jusqu'à 3 contacts d'urgence", premiumFeature2: 'Suivi sportif 7 jours',
    premiumFeature3: 'Alertes email à tous les contacts',
    premiumFeature4: "Rappels d'entraînement intelligents", premiumFeature5: 'Support prioritaire',
    signIn: 'Se connecter avec Google', signOut: 'Se déconnecter',
    welcome: 'Bienvenue', lastCheckIn: 'Dernier check-in', never: 'Jamais',
    notificationsEnabled: 'Notifications activées', enableNotifications: 'Activer les notifications',
    dataSaved: 'Données enregistrées localement', noActivities: 'Aucune activité prévue',
    subscribe: "S'abonner — 2,50$ tous les 2 mois",
    emailAlertSent: "Alerte d'urgence envoyée!",
    missedCheckin: "n'a pas effectué de check-in depuis 2 jours.",
  },
  es: {
    appName: 'Estoy bien', imFineBtn: 'Estoy bien',
    emergencyContacts: 'Contactos de emergencia', addContact: 'Agregar contacto',
    name: 'Nombre', phone: 'Teléfono', email: 'Email (para alertas)',
    save: 'Guardar', delete: 'Eliminar', cancel: 'Cancelar', close: 'Cerrar',
    upgradePremium: 'Actualizar a Premium',
    premiumFeature: 'Función Premium',
    premiumMessage: 'Actualiza para agregar hasta 3 contactos de emergencia',
    sportsTracker: 'Seguimiento deportivo',
    offlineMode: 'Modo sin conexión', offlineMessage: 'Datos guardados localmente',
    language: 'Idioma',
    freeContactLimit: 'Gratis: 1 contacto', premiumContactLimit: 'Premium: 3 contactos',
    dayMonday: 'Lun', dayTuesday: 'Mar', dayWednesday: 'Mié',
    dayThursday: 'Jue', dayFriday: 'Vie', daySaturday: 'Sáb', daySunday: 'Dom',
    addActivity: 'Agregar actividad', activity: 'Actividad', time: 'Hora',
    checkInSent: '¡Check-in enviado!', contactSaved: '¡Contacto guardado!',
    contactDeleted: '¡Contacto eliminado!',
    upgradeTitle: 'Actualizar a Premium',
    upgradeDesc: 'Obtén 3 contactos de emergencia y funciones avanzadas',
    premiumFeature1: 'Hasta 3 contactos de emergencia', premiumFeature2: 'Seguimiento deportivo 7 días',
    premiumFeature3: 'Alertas por email a todos los contactos',
    premiumFeature4: 'Notificaciones inteligentes', premiumFeature5: 'Soporte prioritario',
    signIn: 'Iniciar sesión con Google', signOut: 'Cerrar sesión',
    welcome: 'Bienvenido', lastCheckIn: 'Último check-in', never: 'Nunca',
    notificationsEnabled: 'Notificaciones activadas', enableNotifications: 'Activar notificaciones',
    dataSaved: 'Datos guardados localmente', noActivities: 'Sin actividades planificadas',
    subscribe: 'Suscribirse — $2.50 cada 2 meses',
    emailAlertSent: '¡Alerta de emergencia enviada!',
    missedCheckin: 'no ha hecho check-in en 2 días.',
  },
  it: {
    appName: 'Sto bene', imFineBtn: 'Sto bene',
    emergencyContacts: 'Contatti di emergenza', addContact: 'Aggiungi contatto',
    name: 'Nome', phone: 'Telefono', email: 'Email (per avvisi)',
    save: 'Salva', delete: 'Elimina', cancel: 'Annulla', close: 'Chiudi',
    upgradePremium: 'Passa a Premium',
    premiumFeature: 'Funzionalità Premium',
    premiumMessage: 'Passa a Premium per aggiungere fino a 3 contatti di emergenza',
    sportsTracker: 'Tracker sportivo',
    offlineMode: 'Modalità offline', offlineMessage: 'Dati salvati localmente',
    language: 'Lingua',
    freeContactLimit: 'Gratis: 1 contatto', premiumContactLimit: 'Premium: 3 contatti',
    dayMonday: 'Lun', dayTuesday: 'Mar', dayWednesday: 'Mer',
    dayThursday: 'Gio', dayFriday: 'Ven', daySaturday: 'Sab', daySunday: 'Dom',
    addActivity: 'Aggiungi attività', activity: 'Attività', time: 'Orario',
    checkInSent: 'Check-in inviato!', contactSaved: 'Contatto salvato!',
    contactDeleted: 'Contatto eliminato!',
    upgradeTitle: 'Passa a Premium',
    upgradeDesc: 'Ottieni 3 contatti di emergenza e funzionalità avanzate',
    premiumFeature1: 'Fino a 3 contatti di emergenza', premiumFeature2: 'Tracker sportivo 7 giorni',
    premiumFeature3: 'Avvisi email a tutti i contatti',
    premiumFeature4: 'Notifiche intelligenti', premiumFeature5: 'Supporto prioritario',
    signIn: 'Accedi con Google', signOut: 'Esci',
    welcome: 'Benvenuto', lastCheckIn: 'Ultimo check-in', never: 'Mai',
    notificationsEnabled: 'Notifiche attivate', enableNotifications: 'Attiva notifiche',
    dataSaved: 'Dati salvati localmente', noActivities: 'Nessuna attività pianificata',
    subscribe: 'Abbonati — $2.50 ogni 2 mesi',
    emailAlertSent: 'Avviso di emergenza inviato!',
    missedCheckin: 'non ha fatto check-in da 2 giorni.',
  },
  zh: {
    appName: '我很好', imFineBtn: '我很好',
    emergencyContacts: '紧急联系人', addContact: '添加联系人',
    name: '姓名', phone: '电话', email: '邮箱（用于警报）',
    save: '保存', delete: '删除', cancel: '取消', close: '关闭',
    upgradePremium: '升级到高级版',
    premiumFeature: '高级功能',
    premiumMessage: '升级以添加最多3个紧急联系人',
    sportsTracker: '运动追踪',
    offlineMode: '离线模式', offlineMessage: '数据已本地保存',
    language: '语言',
    freeContactLimit: '免费: 1个联系人', premiumContactLimit: '高级: 3个联系人',
    dayMonday: '周一', dayTuesday: '周二', dayWednesday: '周三',
    dayThursday: '周四', dayFriday: '周五', daySaturday: '周六', daySunday: '周日',
    addActivity: '添加活动', activity: '活动', time: '时间',
    checkInSent: '签到已发送！', contactSaved: '联系人已保存！',
    contactDeleted: '联系人已删除！',
    upgradeTitle: '升级到高级版',
    upgradeDesc: '获得3个紧急联系人和高级功能',
    premiumFeature1: '最多3个紧急联系人', premiumFeature2: '完整7天运动追踪',
    premiumFeature3: '向所有联系人发送电子邮件警报',
    premiumFeature4: '智能锻炼通知', premiumFeature5: '优先支持',
    signIn: '使用Google登录', signOut: '退出登录',
    welcome: '欢迎', lastCheckIn: '上次签到', never: '从未',
    notificationsEnabled: '通知已启用', enableNotifications: '启用通知',
    dataSaved: '数据已本地保存', noActivities: '暂无计划活动',
    subscribe: '订阅 — 每2个月$2.50',
    emailAlertSent: '紧急邮件警报已发送！',
    missedCheckin: '已有2天未签到。请检查。',
  },
  ru: {
    appName: 'Я в порядке', imFineBtn: 'Я в порядке',
    emergencyContacts: 'Экстренные контакты', addContact: 'Добавить контакт',
    name: 'Имя', phone: 'Телефон', email: 'Email (для оповещений)',
    save: 'Сохранить', delete: 'Удалить', cancel: 'Отмена', close: 'Закрыть',
    upgradePremium: 'Перейти на Premium',
    premiumFeature: 'Премиум функция',
    premiumMessage: 'Обновите до Premium для добавления до 3 экстренных контактов',
    sportsTracker: 'Спорт-трекер',
    offlineMode: 'Автономный режим', offlineMessage: 'Данные сохранены локально',
    language: 'Язык',
    freeContactLimit: 'Бесплатно: 1 контакт', premiumContactLimit: 'Premium: 3 контакта',
    dayMonday: 'Пн', dayTuesday: 'Вт', dayWednesday: 'Ср',
    dayThursday: 'Чт', dayFriday: 'Пт', daySaturday: 'Сб', daySunday: 'Вс',
    addActivity: 'Добавить активность', activity: 'Активность', time: 'Время',
    checkInSent: 'Чек-ин отправлен!', contactSaved: 'Контакт сохранён!',
    contactDeleted: 'Контакт удалён!',
    upgradeTitle: 'Перейти на Premium',
    upgradeDesc: 'Получите 3 экстренных контакта и расширенные функции',
    premiumFeature1: 'До 3 экстренных контактов', premiumFeature2: 'Полный 7-дневный трекер',
    premiumFeature3: 'Email-оповещения всем контактам',
    premiumFeature4: 'Умные уведомления', premiumFeature5: 'Приоритетная поддержка',
    signIn: 'Войти через Google', signOut: 'Выйти',
    welcome: 'Добро пожаловать', lastCheckIn: 'Последний чек-ин', never: 'Никогда',
    notificationsEnabled: 'Уведомления включены', enableNotifications: 'Включить уведомления',
    dataSaved: 'Данные сохранены локально', noActivities: 'Нет запланированных активностей',
    subscribe: 'Подписка — $2.50 каждые 2 месяца',
    emailAlertSent: 'Экстренное оповещение отправлено!',
    missedCheckin: 'не выполнял чек-ин 2 дня.',
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'ar', name: 'العربية',   flag: '🇸🇦' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'it', name: 'Italiano',  flag: '🇮🇹' },
  { code: 'zh', name: '中文',      flag: '🇨🇳' },
  { code: 'ru', name: 'Русский',   flag: '🇷🇺' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const STORAGE_KEY = 'dailycheck-userdata-v2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
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

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadUserData(): UserData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    contacts: [],
    schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
    isPremium: false,
    lastCheckIn: null,
    language: 'en',
    notificationsEnabled: false,
  };
}

function saveUserData(data: UserData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function getOrCreateDbUser(firebaseUser: User): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: existing } = await supabase
      .from('users').select('id').eq('firebase_uid', firebaseUser.uid).single();
    if (existing) return existing.id;

    const { data: created } = await supabase
      .from('users')
      .insert({ firebase_uid: firebaseUser.uid, email: firebaseUser.email, display_name: firebaseUser.displayName, avatar_url: firebaseUser.photoURL })
      .select('id').single();
    return created?.id ?? null;
  } catch { return null; }
}

async function loadSupabaseData(userId: string): Promise<Partial<UserData> | null> {
  if (!supabase) return null;
  try {
    const [{ data: dbUser }, { data: dbContacts }, { data: dbCheckins }] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('emergency_contacts').select('*').eq('user_id', userId),
      supabase.from('check_ins').select('*').eq('user_id', userId).order('check_in_time', { ascending: false }).limit(1),
    ]);
    return {
      contacts: (dbContacts || []).map(c => ({ id: c.id, name: c.name, phone: c.phone, email: c.email || '' })),
      isPremium: dbUser?.is_premium || false,
      lastCheckIn: dbCheckins?.length ? dbCheckins[0].check_in_time : null,
      language: dbUser?.language || 'en',
      notificationsEnabled: dbUser?.notifications_enabled || false,
    };
  } catch { return null; }
}

// ─── EmailJS helper ───────────────────────────────────────────────────────────
async function sendEmergencyEmail(params: {
  to_email: string;
  to_name: string;
  user_name: string;
  last_checkin: string;
  location: string;
}): Promise<void> {
  if (!window.emailjs) return;
  if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return;
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
  await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email:   params.to_email,
    to_name:    params.to_name,
    user_name:  params.user_name,
    last_checkin: params.last_checkin,
    location:   params.location,
    subject:    "🚨 Emergency Alert from I'm Fine",
    message:    `Emergency alert from I'm Fine: ${params.user_name} has not checked in for 2 days. Please check on them immediately. Last known location: ${params.location}. This is an automated safety alert.`,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyCheck() {
  const [userData, setUserData]         = useState<UserData>(() => loadUserData());
  const [user, setUser]                 = useState<User | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [isOnline, setIsOnline]         = useState(navigator.onLine);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName]   = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDay, setSelectedDay]   = useState('monday');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);
  const [alertSentToday, setAlertSentToday] = useState(false);

  const { contacts, schedule, isPremium, lastCheckIn, language, notificationsEnabled } = userData;
  const t = translations[language] ?? translations.en;
  const maxContacts = isPremium ? 3 : 1;
  const isRTL = language === 'ar';

  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setUserData(prev => {
      const next = { ...prev, ...updates };
      saveUserData(next);
      return next;
    });
  }, []);

  // ── Supabase sync ────────────────────────────────────────────────────────────
  const syncSupabase = useCallback(async (firebaseUser: User) => {
    if (!supabase || !isOnline) return;
    const uid = await getOrCreateDbUser(firebaseUser);
    if (!uid) return;
    const serverData = await loadSupabaseData(uid);
    if (serverData) setUserData(prev => { const next = { ...prev, ...serverData }; saveUserData(next); return next; });
  }, [isOnline]);

  // ── OneSignal ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (oneSignalAppId !== 'YOUR_ONESIGNAL_APP_ID' && window.OneSignal) {
      window.OneSignal.init({ appId: oneSignalAppId, notifyButton: { enable: true } })
        .then(() => setOneSignalInitialized(true))
        .catch(console.error);
    }
  }, []);

  // ── Firebase auth ────────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, fbUser => {
      setUser(fbUser);
      setAuthLoading(false);
      if (fbUser) syncSupabase(fbUser);
    });
  }, [syncSupabase]);

  // ── Network ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── 2-day missed check-in email alert ────────────────────────────────────────
  useEffect(() => {
    if (alertSentToday || !isOnline || contacts.length === 0) return;
    if (!lastCheckIn) return;

    const diffMs = Date.now() - new Date(lastCheckIn).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 2) return;

    // Send alert to all contacts that have an email
    const contactsWithEmail = contacts.filter(c => c.email && c.email.includes('@'));
    if (contactsWithEmail.length === 0) return;

    const userName = user?.displayName || 'The user';
    const lastCheckInFormatted = new Date(lastCheckIn).toLocaleString();

    navigator.geolocation.getCurrentPosition(
      pos => {
        const location = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        contactsWithEmail.forEach(c =>
          sendEmergencyEmail({ to_email: c.email, to_name: c.name, user_name: userName, last_checkin: lastCheckInFormatted, location })
        );
      },
      () => {
        contactsWithEmail.forEach(c =>
          sendEmergencyEmail({ to_email: c.email, to_name: c.name, user_name: userName, last_checkin: lastCheckInFormatted, location: 'Unknown' })
        );
      }
    );

    setAlertSentToday(true);
    showToast(t.emailAlertSent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCheckIn, contacts, isOnline, alertSentToday, user]);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSignIn  = async () => { try { await signInWithPopup(auth, googleProvider); } catch { showToast('Sign in failed.'); } };
  const handleSignOut = async () => { try { await signOut(auth); } catch { /* ignore */ } };

  const handleEnableNotifications = async () => {
    if (oneSignalInitialized && window.OneSignal) {
      await window.OneSignal.Notifications.requestPermission();
    } else if ('Notification' in window) {
      await Notification.requestPermission();
    }
    updateUserData({ notificationsEnabled: true });
    showToast(t.notificationsEnabled);
  };

  const handleImFine = async () => {
    const now = new Date().toISOString();
    updateUserData({ lastCheckIn: now });
    setAlertSentToday(false); // reset so alert re-checks if they miss again

    if (supabase && user) {
      const uid = await getOrCreateDbUser(user);
      if (uid) await supabase.from('check_ins').insert({ user_id: uid, status: 'ok', check_in_time: now });
    }
    showToast(t.checkInSent);
  };

  const handleAddContact = async () => {
    if (contacts.length >= maxContacts && !isPremium) { setShowUpgradeModal(true); return; }
    if (contacts.length >= maxContacts) return;

    const newContact: Contact = { id: Date.now().toString(), name: newContactName, phone: newContactPhone, email: newContactEmail };
    updateUserData({ contacts: [...contacts, newContact] });

    if (supabase && user) {
      const uid = await getOrCreateDbUser(user);
      if (uid) await supabase.from('emergency_contacts').insert({ user_id: uid, name: newContactName, phone: newContactPhone, email: newContactEmail });
    }

    setNewContactName(''); setNewContactPhone(''); setNewContactEmail('');
    setShowAddContact(false);
    showToast(t.contactSaved);
  };

  const handleDeleteContact = async (id: string) => {
    updateUserData({ contacts: contacts.filter(c => c.id !== id) });
    if (supabase) await supabase.from('emergency_contacts').delete().eq('id', id);
    showToast(t.contactDeleted);
  };

  const handleAddActivity = () => {
    updateUserData({ schedule: { ...schedule, [selectedDay]: [...schedule[selectedDay], { id: Date.now().toString(), name: newActivityName, time: newActivityTime }] } });
    setNewActivityName(''); setNewActivityTime(''); setShowAddActivity(false);
    showToast(t.dataSaved);
  };

  const handleDeleteActivity = (day: string, id: string) => {
    updateUserData({ schedule: { ...schedule, [day]: schedule[day].filter(a => a.id !== id) } });
  };

  const formatLastCheckIn = (dateStr: string | null) => {
    if (!dateStr) return t.never;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const todayDay = WEEKDAY_NAMES[new Date().getDay()];
  const todayActivities = schedule[todayDay] || [];
  const topBarBg = `linear-gradient(135deg, ${C.topBarStart} 0%, ${C.topBarEnd} 100%)`;

  if (authLoading) {
    return <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.titleText, fontSize: '20px' }}>Loading...</div>;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", direction: isRTL ? 'rtl' : 'ltr', padding: '16px' }}>

      {/* Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: C.cardBg, padding: '12px 24px', borderRadius: '8px', boxShadow: C.cardShadow, border: C.cardBorder, zIndex: 2000, fontWeight: 500, color: C.titleText }}>
          {notification}
        </div>
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '10px', textAlign: 'center', borderRadius: '8px', marginBottom: '12px', fontWeight: 500 }}>
          {t.offlineMode}: {t.offlineMessage}
        </div>
      )}

      {/* Notification banner (when not enabled) */}
      {!notificationsEnabled && (
        <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', color: '#1e40af', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>🔔 {t.enableNotifications}</span>
          <button onClick={handleEnableNotifications} style={{ background: '#3b82f6', border: 'none', color: C.white, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {t.enableNotifications}
          </button>
        </div>
      )}

      {/* Top bar */}
      <header style={{ background: topBarBg, borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 4px 12px rgba(22,101,52,0.2)' }}>
        <h1 style={{ color: C.white, margin: 0, fontSize: '22px', fontWeight: 700 }}>{t.appName}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.photoURL && <img src={user.photoURL} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', border: `2px solid ${C.white}` }} />}
              <span style={{ color: C.white, fontWeight: 500, fontSize: '14px' }}>{t.welcome}, {user.displayName?.split(' ')[0] || 'User'}</span>
              <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: C.white, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>{t.signOut}</button>
            </div>
          ) : (
            <button onClick={handleSignIn} style={{ background: C.white, border: 'none', color: C.green, padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t.signIn}
            </button>
          )}

          {isPremium && (
            <span style={{ background: C.premiumGold, color: C.titleText, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>⭐ Premium</span>
          )}

          <select value={language} onChange={e => updateUserData({ language: e.target.value })} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', cursor: 'pointer' }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag}</option>)}
          </select>
        </div>
      </header>

      {/* I'm Fine section */}
      <div style={{ background: C.cardBg, borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '16px', boxShadow: C.cardShadow, border: C.cardBorder }}>
        <div style={{ color: C.subtitleText, marginBottom: '14px', fontSize: '13px' }}>{t.lastCheckIn}: {formatLastCheckIn(lastCheckIn)}</div>

        <button
          onClick={handleImFine}
          style={{ background: `linear-gradient(135deg, ${C.imFineStart} 0%, ${C.imFineEnd} 100%)`, border: 'none', color: C.white, fontSize: '24px', fontWeight: 700, padding: '26px 52px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239,68,68,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(239,68,68,0.45)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(239,68,68,0.35)'; }}
        >
          {t.imFineBtn}
        </button>

        <div style={{ marginTop: '14px' }}>
          {notificationsEnabled ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '6px 14px', borderRadius: '16px', color: C.green, fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              {t.notificationsEnabled}
            </div>
          ) : (
            <button onClick={handleEnableNotifications} style={{ background: 'transparent', border: `1px solid ${C.green}`, color: C.green, padding: '6px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px' }}>
              {t.enableNotifications}
            </button>
          )}
        </div>
      </div>

      {/* Today's Workout */}
      <div style={{ background: C.cardBg, borderRadius: '12px', padding: '18px', marginBottom: '16px', boxShadow: C.cardShadow, border: C.cardBorder }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ color: C.titleText, margin: 0, fontSize: '17px' }}>📅 Today's Workout</h2>
          <span style={{ background: C.tableHeaderBg, color: C.tableHeaderText, padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
            {t[`day${todayDay.charAt(0).toUpperCase() + todayDay.slice(1)}` as keyof typeof t]}
          </span>
        </div>

        {todayActivities.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: C.tableHeaderBg }}>
                <th style={{ padding: '7px 10px', textAlign: 'left', color: C.tableHeaderText, fontWeight: 600 }}>{t.activity}</th>
                <th style={{ padding: '7px 10px', textAlign: 'left', color: C.tableHeaderText, fontWeight: 600 }}>{t.time}</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {todayActivities.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? C.white : C.tableRowAlt }}>
                  <td style={{ padding: '7px 10px', color: C.titleText }}>{a.name}</td>
                  <td style={{ padding: '7px 10px', color: C.subtitleText }}>{a.time}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteActivity(todayDay, a.id)} style={{ background: C.deleteBtn, border: 'none', color: C.white, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: C.subtitleText, textAlign: 'center', margin: '12px 0', fontSize: '13px' }}>No workout scheduled for today</p>
        )}
        <button onClick={() => { setSelectedDay(todayDay); setShowAddActivity(true); }} style={{ background: C.green, border: 'none', color: C.white, padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%', marginTop: '10px' }}>{t.addActivity}</button>
      </div>

      {/* Upgrade banner (non-premium) */}
      {!isPremium && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', border: '1px solid #f59e0b' }}>
          <div>
            <div style={{ color: C.titleText, fontWeight: 700, fontSize: '14px' }}>⭐ {t.upgradePremium}</div>
            <div style={{ color: '#92400e', fontSize: '12px' }}>{t.premiumFeature1} • {t.premiumFeature3}</div>
          </div>
          <button onClick={() => setShowUpgradeModal(true)} style={{ background: '#f59e0b', border: 'none', color: C.white, padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>{t.upgradePremium}</button>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Emergency Contacts */}
        <div style={{ background: C.cardBg, borderRadius: '12px', padding: '18px', boxShadow: C.cardShadow, border: C.cardBorder }}>
          <h2 style={{ color: C.titleText, marginTop: 0, marginBottom: '10px', fontSize: '17px' }}>{t.emergencyContacts}</h2>
          <p style={{ color: C.subtitleText, fontSize: '12px', marginBottom: '10px' }}>{isPremium ? t.premiumContactLimit : t.freeContactLimit}</p>

          <div style={{ marginBottom: '10px' }}>
            {contacts.map((c, i) => (
              <div key={c.id} style={{ background: i % 2 === 0 ? C.white : C.tableRowAlt, padding: '10px 12px', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.titleText, fontSize: '14px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: C.subtitleText }}>{c.phone}</div>
                  {c.email && <div style={{ fontSize: '11px', color: C.subtitleText }}>{c.email}</div>}
                </div>
                <button onClick={() => handleDeleteContact(c.id)} style={{ background: C.deleteBtn, border: 'none', color: C.white, padding: '5px 11px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>{t.delete}</button>
              </div>
            ))}
          </div>

          {!showAddContact ? (
            <button onClick={() => { if (contacts.length >= maxContacts && !isPremium) { setShowUpgradeModal(true); } else if (contacts.length < maxContacts) { setShowAddContact(true); } }} style={{ background: C.green, border: 'none', color: C.white, padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%' }}>
              {t.addContact}
            </button>
          ) : (
            <div style={{ background: C.tableRowAlt, padding: '12px', borderRadius: '8px' }}>
              {[
                { placeholder: t.name,  value: newContactName,  setter: setNewContactName,  type: 'text' },
                { placeholder: t.phone, value: newContactPhone, setter: setNewContactPhone, type: 'tel' },
                { placeholder: t.email, value: newContactEmail, setter: setNewContactEmail, type: 'email' },
              ].map(field => (
                <input key={field.type} type={field.type} placeholder={field.placeholder} value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  style={{ width: 'calc(100% - 12px)', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}
                />
              ))}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAddContact} disabled={!newContactName || !newContactPhone} style={{ background: newContactName && newContactPhone ? C.green : '#9ca3af', border: 'none', color: C.white, padding: '8px 14px', borderRadius: '6px', cursor: newContactName && newContactPhone ? 'pointer' : 'not-allowed', fontWeight: 600, flex: 1, fontSize: '13px' }}>{t.save}</button>
                <button onClick={() => setShowAddContact(false)} style={{ background: '#e5e7eb', border: 'none', color: C.titleText, padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flex: 1, fontSize: '13px' }}>{t.cancel}</button>
              </div>
            </div>
          )}
        </div>

        {/* Sports Tracker — full 7 days */}
        <div style={{ background: C.cardBg, borderRadius: '12px', padding: '18px', boxShadow: C.cardShadow, border: C.cardBorder }}>
          <h2 style={{ color: C.titleText, marginTop: 0, marginBottom: '10px', fontSize: '17px' }}>{t.sportsTracker}</h2>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => setSelectedDay(day)} style={{ background: selectedDay === day ? C.green : '#e5e7eb', border: 'none', color: selectedDay === day ? C.white : C.titleText, padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 500 }}>
                {t[`day${day.charAt(0).toUpperCase() + day.slice(1)}` as keyof typeof t]}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '70px' }}>
            {schedule[selectedDay]?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ background: C.tableHeaderBg }}>
                    <th style={{ padding: '7px 10px', textAlign: 'left', color: C.tableHeaderText, fontWeight: 600 }}>{t.activity}</th>
                    <th style={{ padding: '7px 10px', textAlign: 'left', color: C.tableHeaderText, fontWeight: 600 }}>{t.time}</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {schedule[selectedDay].map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? C.white : C.tableRowAlt }}>
                      <td style={{ padding: '7px 10px', color: C.titleText }}>{a.name}</td>
                      <td style={{ padding: '7px 10px', color: C.subtitleText }}>{a.time}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteActivity(selectedDay, a.id)} style={{ background: C.deleteBtn, border: 'none', color: C.white, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: C.subtitleText, textAlign: 'center', padding: '14px', fontSize: '13px' }}>{t.noActivities}</p>
            )}
          </div>

          {!showAddActivity ? (
            <button onClick={() => setShowAddActivity(true)} style={{ background: C.green, border: 'none', color: C.white, padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%', marginTop: '10px' }}>{t.addActivity}</button>
          ) : (
            <div style={{ background: C.tableRowAlt, padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
              <div style={{ color: C.subtitleText, fontSize: '12px', marginBottom: '6px' }}>
                {t[`day${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}` as keyof typeof t]}
              </div>
              <input type="text" placeholder={t.activity} value={newActivityName} onChange={e => setNewActivityName(e.target.value)} style={{ width: 'calc(100% - 12px)', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }} />
              <input type="time" value={newActivityTime} onChange={e => setNewActivityTime(e.target.value)} style={{ width: 'calc(100% - 12px)', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAddActivity} disabled={!newActivityName || !newActivityTime} style={{ background: newActivityName && newActivityTime ? C.green : '#9ca3af', border: 'none', color: C.white, padding: '8px 14px', borderRadius: '6px', cursor: newActivityName && newActivityTime ? 'pointer' : 'not-allowed', fontWeight: 600, flex: 1, fontSize: '13px' }}>{t.save}</button>
                <button onClick={() => setShowAddActivity(false)} style={{ background: '#e5e7eb', border: 'none', color: C.titleText, padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flex: 1, fontSize: '13px' }}>{t.cancel}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>

            <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '26px' }}>⭐</div>

            <h3 style={{ color: C.titleText, marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>{t.upgradeTitle}</h3>
            <p style={{ color: C.subtitleText, marginBottom: '16px', fontSize: '13px' }}>{t.upgradeDesc}</p>

            {/* Feature list */}
            <div style={{ textAlign: 'left', marginBottom: '18px', background: C.tableRowAlt, borderRadius: '8px', padding: '14px' }}>
              {(['premiumFeature1', 'premiumFeature2', 'premiumFeature3', 'premiumFeature4', 'premiumFeature5'] as const).map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: C.green, fontSize: '15px', fontWeight: 700 }}>✓</span>
                  <span style={{ color: C.titleText, fontSize: '13px' }}>{t[k]}</span>
                </div>
              ))}
            </div>

            {/* PayPal subscription button — $2.50 every 2 months */}
            <a
              href="https://www.paypal.com/ncp/payment/KJ5GTRU64EZ3L"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: '#0070ba', color: C.white, textDecoration: 'none', padding: '13px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,112,186,0.3)' }}
            >
              {t.subscribe}
            </a>

            <button onClick={() => setShowUpgradeModal(false)} style={{ background: '#e5e7eb', border: 'none', color: C.subtitleText, padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '20px', textAlign: 'center', color: C.subtitleText, fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!isOnline && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', padding: '5px 11px', borderRadius: '14px', color: '#92400e' }}>
              <span style={{ width: '7px', height: '7px', background: '#f59e0b', borderRadius: '50%' }} />
              {t.offlineMode}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dcfce7', padding: '5px 11px', borderRadius: '14px', color: C.green }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            {t.dataSaved}
          </span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          h1 { font-size: 18px !important; }
          h2 { font-size: 15px !important; }
        }
      `}</style>
    </div>
  );
}
