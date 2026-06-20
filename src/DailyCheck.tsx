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

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// EmailJS config (env vars)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// OneSignal config (env vars)
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

// ============ TRANSLATIONS (7 languages) ============
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
    cancel: "Cancel",
    upgradePremium: "Upgrade to Premium",
    premiumFeature: "Premium Feature",
    premiumMessage: "Upgrade to add up to 3 emergency contacts",
    sportsTracker: "Sports Tracker",
    offlineMode: "Offline Mode",
    offlineMessage: "Your data is saved locally and will sync when online",
    language: "Language",
    freeContactLimit: "Free: 1 contact",
    premiumContactLimit: "Premium: 3 contacts",
    dayMonday: "Mon",
    dayTuesday: "Tue",
    dayWednesday: "Wed",
    dayThursday: "Thu",
    dayFriday: "Fri",
    daySaturday: "Sat",
    daySunday: "Sun",
    addActivity: "Add Activity",
    activity: "Activity",
    time: "Time",
    checkInSent: "Check-in sent!",
    contactSaved: "Contact saved!",
    contactDeleted: "Contact deleted!",
    upgradeTitle: "Upgrade to Premium",
    upgradeDesc: "Unlock all features and keep your loved ones safe",
    signIn: "Sign in with Google",
    signOut: "Sign Out",
    welcome: "Welcome",
    lastCheckIn: "Last Check-in",
    never: "Never",
    notificationsEnabled: "Notifications enabled",
    enableNotifications: "Enable Notifications",
    notifications: "Notifications",
    dataSaved: "Data saved locally",
    locationEnabled: "Location sharing enabled",
    locationDisabled: "Location sharing disabled",
    shareLocation: "Share location on emergency",
    featureContacts: "3 Emergency Contacts",
    featureTracker: "Full 7-Day Sports Tracker",
    featureNoAds: "No Ads",
    featureLocation: "Location Sharing",
    featureEmail: "Email Alerts",
    payPalBtn: "Subscribe with PayPal",
    close: "Close",
    settings: "Settings",
    exercisePlan: "Exercise Plan",
    workoutTime: "Workout Time",
    sendAlert: "Send Emergency Alert",
    alertSent: "Emergency alert sent to contacts!",
    premiumOnly: "Premium only",
    contactLimitReached: "Contact limit reached. Upgrade to Premium for 3 contacts.",
    noContacts: "No contacts added yet",
    addFirstContact: "Add your first emergency contact",
    emailAlert: "Send email alert",
    smsAlert: "Send SMS alert",
    alertLocation: "Include location in alert",
    confirmDelete: "Are you sure you want to delete this contact?",
    yes: "Yes",
    no: "No",
    premiumBadge: "PREMIUM",
    freeBadge: "FREE",
    offlineBanner: "You are offline. Data is being saved locally.",
    onlineBanner: "You are online.",
    checkIn: "Check In",
    emergency: "Emergency",
    send: "Send",
    back: "Back",
    edit: "Edit",
    update: "Update",
    remove: "Remove",
    done: "Done",
    premiumFeatures: "Premium Features",
    subscribeNow: "Subscribe Now",
    monthlyPrice: "$2.50 / 2 month",
    yearlyPrice: "$17.99 / year",
    saveYearly: "Save 17% with yearly",
    securePayment: "Secure payment via PayPal",
    oneSignalError: "Push notifications not available. Using browser notifications instead.",
    emailSent: "Email sent successfully!",
    emailError: "Failed to send email.",
    locationUnknown: "Location unknown",
    mapLink: "View on map",
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
    cancel: "إلغاء",
    upgradePremium: "الترقية إلى المميز",
    premiumFeature: "ميزة مميزة",
    premiumMessage: "قم بالترقية لإضافة ما يصل إلى 3 جهات اتصال للطوارئ",
    sportsTracker: "متتبع الرياضة",
    offlineMode: "وضع عدم الاتصال",
    offlineMessage: "يتم حفظ بياناتك محليًا وستتزامن عند الاتصال",
    language: "اللغة",
    freeContactLimit: "مجاني: جهة اتصال واحدة",
    premiumContactLimit: "مميز: 3 جهات اتصال",
    dayMonday: "الإثنين",
    dayTuesday: "الثلاثاء",
    dayWednesday: "الأربعاء",
    dayThursday: "الخميس",
    dayFriday: "الجمعة",
    daySaturday: "السبت",
    daySunday: "الأحد",
    addActivity: "إضافة نشاط",
    activity: "النشاط",
    time: "الوقت",
    checkInSent: "تم إرسال التحقق!",
    contactSaved: "تم حفظ جهة الاتصال!",
    contactDeleted: "تم حذف جهة الاتصال!",
    upgradeTitle: "الترقية إلى المميز",
    upgradeDesc: "فتح جميع الميزات والحفاظ على سلامة أحبائك",
    signIn: "تسجيل الدخول عبر جوجل",
    signOut: "تسجيل الخروج",
    welcome: "مرحبا",
    lastCheckIn: "آخر تحقق",
    never: "أبدًا",
    notificationsEnabled: "تم تفعيل الإشعارات",
    enableNotifications: "تفعيل الإشعارات",
    notifications: "الإشعارات",
    dataSaved: "تم حفظ البيانات محليًا",
    locationEnabled: "مشاركة الموقع مفعلة",
    locationDisabled: "مشاركة الموقع معطلة",
    shareLocation: "مشاركة الموقع في حالات الطوارئ",
    featureContacts: "3 جهات اتصال للطوارئ",
    featureTracker: "متتبع رياضي لمدة 7 أيام",
    featureNoAds: "بدون إعلانات",
    featureLocation: "مشاركة الموقع",
    featureEmail: "تنبيهات البريد الإلكتروني",
    payPalBtn: "اشترك عبر PayPal",
    close: "إغلاق",
    settings: "الإعدادات",
    exercisePlan: "خطة التمرين",
    workoutTime: "وقت التمرين",
    sendAlert: "إرسال تنبيه الطوارئ",
    alertSent: "تم إرسال تنبيه الطوارئ إلى جهات الاتصال!",
    premiumOnly: "مميز فقط",
    contactLimitReached: "تم الوصول إلى الحد الأقصى. قم بالترقية للمميز للحصول على 3 جهات اتصال.",
    noContacts: "لم تتم إضافة جهات اتصال بعد",
    addFirstContact: "أضف جهة اتصال طوارئ الأولى",
    emailAlert: "إرسال تنبيه بالبريد",
    smsAlert: "إرسال تنبيه بالرسائل",
    alertLocation: "تضمين الموقع في التنبيه",
    confirmDelete: "هل أنت متأكد أنك تريد حذف جهة الاتصال هذه؟",
    yes: "نعم",
    no: "لا",
    premiumBadge: "مميز",
    freeBadge: "مجاني",
    offlineBanner: "أنت غير متصل. يتم حفظ البيانات محليًا.",
    onlineBanner: "أنت متصل.",
    checkIn: "تحقق",
    emergency: "طوارئ",
    send: "إرسال",
    back: "رجوع",
    edit: "تعديل",
    update: "تحديث",
    remove: "إزالة",
    done: "تم",
    premiumFeatures: "ميزات المميز",
    subscribeNow: "اشترك الآن",
    monthlyPrice: "2.50 دولار / شهرين",
    yearlyPrice: "17.99 دولار / سنة",
    saveYearly: "وفر 17% مع الاشتراك السنوي",
    securePayment: "دفع آمن عبر PayPal",
    oneSignalError: "الإشعارات الفورية غير متوفرة. استخدام إشعارات المتصفح بدلاً من ذلك.",
    emailSent: "تم إرسال البريد الإلكتروني بنجاح!",
    emailError: "فشل إرسال البريد الإلكتروني.",
    locationUnknown: "الموقع غير معروف",
    mapLink: "عرض على الخريطة",
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
    cancel: "Annuler",
    upgradePremium: "Passer à Premium",
    premiumFeature: "Fonctionnalité Premium",
    premiumMessage: "Passez à Premium pour ajouter jusqu'à 3 contacts d'urgence",
    sportsTracker: "Suivi sportif",
    offlineMode: "Mode hors ligne",
    offlineMessage: "Vos données sont enregistrées localement et se synchroniseront en ligne",
    language: "Langue",
    freeContactLimit: "Gratuit: 1 contact",
    premiumContactLimit: "Premium: 3 contacts",
    dayMonday: "Lun",
    dayTuesday: "Mar",
    dayWednesday: "Mer",
    dayThursday: "Jeu",
    dayFriday: "Ven",
    daySaturday: "Sam",
    daySunday: "Dim",
    addActivity: "Ajouter une activité",
    activity: "Activité",
    time: "Heure",
    checkInSent: "Check-in envoyé!",
    contactSaved: "Contact enregistré!",
    contactDeleted: "Contact supprimé!",
    upgradeTitle: "Passer à Premium",
    upgradeDesc: "Débloquez toutes les fonctionnalités et protégez vos proches",
    signIn: "Se connecter avec Google",
    signOut: "Se déconnecter",
    welcome: "Bienvenue",
    lastCheckIn: "Dernier check-in",
    never: "Jamais",
    notificationsEnabled: "Notifications activées",
    enableNotifications: "Activer les notifications",
    notifications: "Notifications",
    dataSaved: "Données enregistrées localement",
    locationEnabled: "Partage de localisation activé",
    locationDisabled: "Partage de localisation désactivé",
    shareLocation: "Partager la localisation en cas d'urgence",
    featureContacts: "3 contacts d'urgence",
    featureTracker: "Suivi sportif complet sur 7 jours",
    featureNoAds: "Sans publicité",
    featureLocation: "Partage de localisation",
    featureEmail: "Alertes par email",
    payPalBtn: "S'abonner avec PayPal",
    close: "Fermer",
    settings: "Paramètres",
    exercisePlan: "Plan d'exercice",
    workoutTime: "Heure d'entraînement",
    sendAlert: "Envoyer une alerte d'urgence",
    alertSent: "Alerte d'urgence envoyée aux contacts!",
    premiumOnly: "Premium uniquement",
    contactLimitReached: "Limite de contacts atteinte. Passez à Premium pour 3 contacts.",
    noContacts: "Aucun contact ajouté",
    addFirstContact: "Ajoutez votre premier contact d'urgence",
    emailAlert: "Envoyer une alerte par email",
    smsAlert: "Envoyer une alerte SMS",
    alertLocation: "Inclure la localisation dans l'alerte",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce contact?",
    yes: "Oui",
    no: "Non",
    premiumBadge: "PREMIUM",
    freeBadge: "GRATUIT",
    offlineBanner: "Vous êtes hors ligne. Les données sont enregistrées localement.",
    onlineBanner: "Vous êtes en ligne.",
    checkIn: "Check-in",
    emergency: "Urgence",
    send: "Envoyer",
    back: "Retour",
    edit: "Modifier",
    update: "Mettre à jour",
    remove: "Retirer",
    done: "Terminé",
    premiumFeatures: "Fonctionnalités Premium",
    subscribeNow: "S'abonner maintenant",
    monthlyPrice: "2,50 € / 2 mois",
    yearlyPrice: "17,99 € / an",
    saveYearly: "Économisez 17% avec l'abonnement annuel",
    securePayment: "Paiement sécurisé via PayPal",
    oneSignalError: "Les notifications push ne sont pas disponibles. Utilisation des notifications du navigateur.",
    emailSent: "Email envoyé avec succès!",
    emailError: "Échec de l'envoi de l'email.",
    locationUnknown: "Localisation inconnue",
    mapLink: "Voir sur la carte",
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
    cancel: "Cancelar",
    upgradePremium: "Actualizar a Premium",
    premiumFeature: "Función Premium",
    premiumMessage: "Actualiza para agregar hasta 3 contactos de emergencia",
    sportsTracker: "Seguimiento deportivo",
    offlineMode: "Modo sin conexión",
    offlineMessage: "Tus datos se guardan localmente y se sincronizarán cuando esté en línea",
    language: "Idioma",
    freeContactLimit: "Gratis: 1 contacto",
    premiumContactLimit: "Premium: 3 contactos",
    dayMonday: "Lun",
    dayTuesday: "Mar",
    dayWednesday: "Mié",
    dayThursday: "Jue",
    dayFriday: "Vie",
    daySaturday: "Sáb",
    daySunday: "Dom",
    addActivity: "Agregar actividad",
    activity: "Actividad",
    time: "Hora",
    checkInSent: "¡Check-in enviado!",
    contactSaved: "¡Contacto guardado!",
    contactDeleted: "¡Contacto eliminado!",
    upgradeTitle: "Actualizar a Premium",
    upgradeDesc: "Desbloquea todas las funciones y mantén seguros a tus seres queridos",
    signIn: "Iniciar sesión con Google",
    signOut: "Cerrar sesión",
    welcome: "Bienvenido",
    lastCheckIn: "Último check-in",
    never: "Nunca",
    notificationsEnabled: "Notificaciones activadas",
    enableNotifications: "Activar notificaciones",
    notifications: "Notificaciones",
    dataSaved: "Datos guardados localmente",
    locationEnabled: "Compartir ubicación activado",
    locationDisabled: "Compartir ubicación desactivado",
    shareLocation: "Compartir ubicación en emergencia",
    featureContacts: "3 contactos de emergencia",
    featureTracker: "Seguimiento deportivo completo de 7 días",
    featureNoAds: "Sin anuncios",
    featureLocation: "Compartir ubicación",
    featureEmail: "Alertas por correo",
    payPalBtn: "Suscribirse con PayPal",
    close: "Cerrar",
    settings: "Configuración",
    exercisePlan: "Plan de ejercicios",
    workoutTime: "Hora de entrenamiento",
    sendAlert: "Enviar alerta de emergencia",
    alertSent: "¡Alerta de emergencia enviada a los contactos!",
    premiumOnly: "Solo Premium",
    contactLimitReached: "Límite de contactos alcanzado. Actualiza a Premium para 3 contactos.",
    noContacts: "No hay contactos agregados",
    addFirstContact: "Agrega tu primer contacto de emergencia",
    emailAlert: "Enviar alerta por correo",
    smsAlert: "Enviar alerta por SMS",
    alertLocation: "Incluir ubicación en la alerta",
    confirmDelete: "¿Estás seguro de que quieres eliminar este contacto?",
    yes: "Sí",
    no: "No",
    premiumBadge: "PREMIUM",
    freeBadge: "GRATIS",
    offlineBanner: "Estás sin conexión. Los datos se guardan localmente.",
    onlineBanner: "Estás en línea.",
    checkIn: "Check-in",
    emergency: "Emergencia",
    send: "Enviar",
    back: "Atrás",
    edit: "Editar",
    update: "Actualizar",
    remove: "Eliminar",
    done: "Hecho",
    premiumFeatures: "Funciones Premium",
    subscribeNow: "Suscribirse ahora",
    monthlyPrice: "$2.50 / 2 mes",
    yearlyPrice: "$17.99 / año",
    saveYearly: "Ahorra 17% con el plan anual",
    securePayment: "Pago seguro via PayPal",
    oneSignalError: "Las notificaciones push no están disponibles. Usando notificaciones del navegador.",
    emailSent: "¡Correo enviado con éxito!",
    emailError: "Error al enviar el correo.",
    locationUnknown: "Ubicación desconocida",
    mapLink: "Ver en el mapa",
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
    cancel: "Annulla",
    upgradePremium: "Passa a Premium",
    premiumFeature: "Funzionalità Premium",
    premiumMessage: "Passa a Premium per aggiungere fino a 3 contatti di emergenza",
    sportsTracker: "Tracciatore sportivo",
    offlineMode: "Modalità offline",
    offlineMessage: "I tuoi dati sono salvati localmente e si sincronizzeranno online",
    language: "Lingua",
    freeContactLimit: "Gratuito: 1 contatto",
    premiumContactLimit: "Premium: 3 contatti",
    dayMonday: "Lun",
    dayTuesday: "Mar",
    dayWednesday: "Mer",
    dayThursday: "Gio",
    dayFriday: "Ven",
    daySaturday: "Sab",
    daySunday: "Dom",
    addActivity: "Aggiungi attività",
    activity: "Attività",
    time: "Ora",
    checkInSent: "Check-in inviato!",
    contactSaved: "Contatto salvato!",
    contactDeleted: "Contatto eliminato!",
    upgradeTitle: "Passa a Premium",
    upgradeDesc: "Sblocca tutte le funzionalità e tieni al sicuro i tuoi cari",
    signIn: "Accedi con Google",
    signOut: "Esci",
    welcome: "Benvenuto",
    lastCheckIn: "Ultimo check-in",
    never: "Mai",
    notificationsEnabled: "Notifiche attivate",
    enableNotifications: "Attiva notifiche",
    notifications: "Notifiche",
    dataSaved: "Dati salvati localmente",
    locationEnabled: "Condivisione posizione attivata",
    locationDisabled: "Condivisione posizione disattivata",
    shareLocation: "Condividi posizione in emergenza",
    featureContacts: "3 contatti di emergenza",
    featureTracker: "Tracciatore sportivo completo di 7 giorni",
    featureNoAds: "Senza pubblicità",
    featureLocation: "Condivisione posizione",
    featureEmail: "Avvisi via email",
    payPalBtn: "Iscriviti con PayPal",
    close: "Chiudi",
    settings: "Impostazioni",
    exercisePlan: "Piano di esercizi",
    workoutTime: "Orario allenamento",
    sendAlert: "Invia avviso di emergenza",
    alertSent: "Avviso di emergenza inviato ai contatti!",
    premiumOnly: "Solo Premium",
    contactLimitReached: "Limite contatti raggiunto. Passa a Premium per 3 contatti.",
    noContacts: "Nessun contatto aggiunto",
    addFirstContact: "Aggiungi il tuo primo contatto di emergenza",
    emailAlert: "Invia avviso via email",
    smsAlert: "Invia avviso SMS",
    alertLocation: "Includi posizione nell'avviso",
    confirmDelete: "Sei sicuro di voler eliminare questo contatto?",
    yes: "Sì",
    no: "No",
    premiumBadge: "PREMIUM",
    freeBadge: "GRATIS",
    offlineBanner: "Sei offline. I dati vengono salvati localmente.",
    onlineBanner: "Sei online.",
    checkIn: "Check-in",
    emergency: "Emergenza",
    send: "Invia",
    back: "Indietro",
    edit: "Modifica",
    update: "Aggiorna",
    remove: "Rimuovi",
    done: "Fatto",
    premiumFeatures: "Funzionalità Premium",
    subscribeNow: "Iscriviti ora",
    monthlyPrice: "€2.50 / 2 mese",
    yearlyPrice: "€17.99 / anno",
    saveYearly: "Risparmia il 17% con il piano annuale",
    securePayment: "Pagamento sicuro via PayPal",
    oneSignalError: "Le notifiche push non sono disponibili. Utilizzo delle notifiche del browser.",
    emailSent: "Email inviata con successo!",
    emailError: "Impossibile inviare l'email.",
    locationUnknown: "Posizione sconosciuta",
    mapLink: "Visualizza sulla mappa",
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
    cancel: "取消",
    upgradePremium: "升级到高级版",
    premiumFeature: "高级功能",
    premiumMessage: "升级后可添加最多3个紧急联系人",
    sportsTracker: "运动追踪器",
    offlineMode: "离线模式",
    offlineMessage: "您的数据保存在本地，联网后会同步",
    language: "语言",
    freeContactLimit: "免费：1个联系人",
    premiumContactLimit: "高级：3个联系人",
    dayMonday: "周一",
    dayTuesday: "周二",
    dayWednesday: "周三",
    dayThursday: "周四",
    dayFriday: "周五",
    daySaturday: "周六",
    daySunday: "周日",
    addActivity: "添加活动",
    activity: "活动",
    time: "时间",
    checkInSent: "签到已发送！",
    contactSaved: "联系人已保存！",
    contactDeleted: "联系人已删除！",
    upgradeTitle: "升级到高级版",
    upgradeDesc: "解锁所有功能，保护您所爱的人",
    signIn: "使用Google登录",
    signOut: "退出",
    welcome: "欢迎",
    lastCheckIn: "上次签到",
    never: "从未",
    notificationsEnabled: "通知已启用",
    enableNotifications: "启用通知",
    notifications: "通知",
    dataSaved: "数据已本地保存",
    locationEnabled: "位置共享已启用",
    locationDisabled: "位置共享已禁用",
    shareLocation: "紧急情况下分享位置",
    featureContacts: "3个紧急联系人",
    featureTracker: "完整的7天运动追踪器",
    featureNoAds: "无广告",
    featureLocation: "位置共享",
    featureEmail: "邮件提醒",
    payPalBtn: "通过PayPal订阅",
    close: "关闭",
    settings: "设置",
    exercisePlan: "锻炼计划",
    workoutTime: "锻炼时间",
    sendAlert: "发送紧急警报",
    alertSent: "紧急警报已发送给联系人！",
    premiumOnly: "仅高级版",
    contactLimitReached: "已达到联系人上限。升级到高级版以获得3个联系人。",
    noContacts: "尚未添加联系人",
    addFirstContact: "添加您的第一个紧急联系人",
    emailAlert: "发送邮件警报",
    smsAlert: "发送短信警报",
    alertLocation: "在警报中包含位置",
    confirmDelete: "确定要删除此联系人吗？",
    yes: "是",
    no: "否",
    premiumBadge: "高级版",
    freeBadge: "免费版",
    offlineBanner: "您处于离线状态。数据正在本地保存。",
    onlineBanner: "您已在线。",
    checkIn: "签到",
    emergency: "紧急",
    send: "发送",
    back: "返回",
    edit: "编辑",
    update: "更新",
    remove: "移除",
    done: "完成",
    premiumFeatures: "高级功能",
    subscribeNow: "立即订阅",
    monthlyPrice: "¥4.99 / 月",
    yearlyPrice: "¥49.99 / 年",
    saveYearly: "年付节省17%",
    securePayment: "通过PayPal安全支付",
    oneSignalError: "推送通知不可用。使用浏览器通知代替。",
    emailSent: "邮件发送成功！",
    emailError: "邮件发送失败。",
    locationUnknown: "位置未知",
    mapLink: "在地图上查看",
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
    cancel: "Отмена",
    upgradePremium: "Обновить до Premium",
    premiumFeature: "Премиум функция",
    premiumMessage: "Обновите до Premium, чтобы добавить до 3 экстренных контактов",
    sportsTracker: "Трекер спорта",
    offlineMode: "Автономный режим",
    offlineMessage: "Ваши данные сохраняются локально и синхронизируются при подключении",
    language: "Язык",
    freeContactLimit: "Бесплатно: 1 контакт",
    premiumContactLimit: "Premium: 3 контакта",
    dayMonday: "Пн",
    dayTuesday: "Вт",
    dayWednesday: "Ср",
    dayThursday: "Чт",
    dayFriday: "Пт",
    daySaturday: "Сб",
    daySunday: "Вс",
    addActivity: "Добавить активность",
    activity: "Активность",
    time: "Время",
    checkInSent: "Чек-ин отправлен!",
    contactSaved: "Контакт сохранен!",
    contactDeleted: "Контакт удален!",
    upgradeTitle: "Обновить до Premium",
    upgradeDesc: "Разблокируйте все функции и защитите своих близких",
    signIn: "Войти через Google",
    signOut: "Выйти",
    welcome: "Добро пожаловать",
    lastCheckIn: "Последний чек-ин",
    never: "Никогда",
    notificationsEnabled: "Уведомления включены",
    enableNotifications: "Включить уведомления",
    notifications: "Уведомления",
    dataSaved: "Данные сохранены локально",
    locationEnabled: "Обмен местоположением включен",
    locationDisabled: "Обмен местоположением отключен",
    shareLocation: "Поделиться местоположением в экстренной ситуации",
    featureContacts: "3 экстренных контакта",
    featureTracker: "Полный 7-дневный спортивный трекер",
    featureNoAds: "Без рекламы",
    featureLocation: "Обмен местоположением",
    featureEmail: "Email-уведомления",
    payPalBtn: "Подписаться через PayPal",
    close: "Закрыть",
    settings: "Настройки",
    exercisePlan: "План упражнений",
    workoutTime: "Время тренировки",
    sendAlert: "Отправить экстренное оповещение",
    alertSent: "Экстренное оповещение отправлено контактам!",
    premiumOnly: "Только Premium",
    contactLimitReached: "Достигнут лимит контактов. Обновите до Premium для 3 контактов.",
    noContacts: "Контакты не добавлены",
    addFirstContact: "Добавьте свой первый экстренный контакт",
    emailAlert: "Отправить email-оповещение",
    smsAlert: "Отправить SMS-оповещение",
    alertLocation: "Включить местоположение в оповещение",
    confirmDelete: "Вы уверены, что хотите удалить этот контакт?",
    yes: "Да",
    no: "Нет",
    premiumBadge: "PREMIUM",
    freeBadge: "БЕСПЛАТНО",
    offlineBanner: "Вы офлайн. Данные сохраняются локально.",
    onlineBanner: "Вы онлайн.",
    checkIn: "Чек-ин",
    emergency: "Экстренный",
    send: "Отправить",
    back: "Назад",
    edit: "Редактировать",
    update: "Обновить",
    remove: "Удалить",
    done: "Готово",
    premiumFeatures: "Premium функции",
    subscribeNow: "Подписаться сейчас",
    monthlyPrice: "$2.50 / 2 месяц",
    yearlyPrice: "$17.99 / год",
    saveYearly: "Экономия 17% с годовым планом",
    securePayment: "Безопасная оплата через PayPal",
    oneSignalError: "Push-уведомления недоступны. Использование браузерных уведомлений.",
    emailSent: "Email отправлен успешно!",
    emailError: "Не удалось отправить email.",
    locationUnknown: "Местоположение неизвестно",
    mapLink: "Посмотреть на карте",
  }
};

// ============ INTERFACES ============
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Activity {
  id: string;
  name: string;
  time: string;
  duration?: string;
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
  shareLocation: boolean;
  emailAlertsEnabled: boolean;
}

// ============ CONSTANTS ============
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const STORAGE_KEY = 'imfine-userdata-v2';

// ============ LOCAL STORAGE ============
function loadUserData(): UserData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all fields exist
      return {
        contacts: parsed.contacts || [],
        schedule: parsed.schedule || {
          monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        },
        isPremium: parsed.isPremium || false,
        lastCheckIn: parsed.lastCheckIn || null,
        language: parsed.language || 'en',
        notificationsEnabled: parsed.notificationsEnabled || false,
        shareLocation: parsed.shareLocation || false,
        emailAlertsEnabled: parsed.emailAlertsEnabled || false,
      };
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
  return {
    contacts: [],
    schedule: {
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    },
    isPremium: false,
    lastCheckIn: null,
    language: 'en',
    notificationsEnabled: false,
    shareLocation: false,
    emailAlertsEnabled: false,
  };
}

function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
}

// ============ EMAILJS ============
async function sendEmailAlert(contact: Contact, message: string, location?: string): Promise<boolean> { 
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS not configured');
    return false;
  }
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name: contact.name,
          to_email: contact.email || contact.phone,
          message: message,
          location: location || '',
        }
      })
    });
    const result = await response.json();
alert('Error: ' + EMAILJS_SERVICE_ID + ' / ' + EMAILJS_PUBLIC_KEY);
return response.ok;
  } catch (e) {
    console.error('EmailJS error:', e);
    return false;
  }
}

// ============ ONESIGNAL ============
function initOneSignal() {
  if (!ONESIGNAL_APP_ID) return;
  try {
    // OneSignal initialization via script tag
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.OneSignal) {
        // @ts-ignore
        window.OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });
      }
    };
    document.head.appendChild(script);
  } catch (e) {
    console.warn('OneSignal init failed:', e);
  }
}

function sendOneSignalAlert(title: string, message: string) {
  if (!ONESIGNAL_APP_ID) return;
  try {
    // @ts-ignore
    if (window.OneSignal) {
      // @ts-ignore
      window.OneSignal.sendSelfNotification(title, message);
    }
  } catch (e) {
    console.warn('OneSignal send failed:', e);
  }
}

// ============ COMPONENT ============
// Build: v2.1
export default function DailyCheck() {
  const [userData, setUserData] = useState<UserData>(() => loadUserData());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(false);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);

  const { contacts, schedule, isPremium, lastCheckIn, language, notificationsEnabled, shareLocation, emailAlertsEnabled } = userData;
  const t = translations[language];
  const maxContacts = isPremium ? 3 : 1;
  const isRTL = language === 'ar';

  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setUserData(prev => {
      const newData = { ...prev, ...updates };
      saveUserData(newData);
      return newData;
    });
  }, []);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Network
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

  // OneSignal init
  useEffect(() => {
    initOneSignal();
  }, []);

  // Browser notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setBrowserNotifEnabled(true);
    }
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showNotification('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      showNotification('Sign in failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateUserData({ notificationsEnabled: true });
        setBrowserNotifEnabled(true);
        showNotification(t.notificationsEnabled);
      }
    }
  };

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  // Location
  const fetchLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!isPremium) { resolve(null); return; }
      if (!navigator.geolocation) { showNotification('Geolocation not supported'); resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          resolve(loc);
        },
        () => { setUserLocation(null); resolve(null); }
      );
    });
  }, [isPremium, showNotification]);

  const getLocationText = useCallback((location: { lat: number; lng: number } | null) => {
    if (!isPremium || !shareLocation || !location) return t.locationUnknown;
    return `https://maps.google.com/?q=${location.lat},${location.lng}`;
  }, [isPremium, shareLocation, t]);

  // I'm Fine
  const handleImFine = async () => {
    const now = new Date().toISOString();
    updateUserData({ lastCheckIn: now });
    let currentLocation = null;
    if (isPremium && shareLocation) {
      currentLocation = await fetchLocation();
    }
    const locationText = getLocationText(currentLocation);
    showNotification(t.checkInSent);
    showBrowserNotification(t.appName, `${t.checkInSent} ${locationText}`);
    sendOneSignalAlert(t.appName, `${t.checkInSent} ${locationText}`);
    if (contacts.length > 0) {
      for (const c of contacts) {
        if (c.email) {
          await sendEmailAlert(c, `${t.checkInSent}`, locationText);
        }
      }
    }
  };

  // Emergency Alert
  const handleEmergencyAlert = async () => {
    let currentLocation = null;
    if (isPremium && shareLocation) {
      currentLocation = await fetchLocation();
    }
    const locationText = getLocationText(currentLocation);
    showNotification(t.alertSent);
    showBrowserNotification(`🚨 ${t.emergency}`, `${t.alertSent} ${locationText}`);
    sendOneSignalAlert(`🚨 ${t.emergency}`, `${t.alertSent} ${locationText}`);
    if (contacts.length > 0) {
      for (const c of contacts) {
        if (c.email) {
          await sendEmailAlert(c, `🚨 ${t.emergency}: ${t.alertSent}`, locationText);
        }
      }
    }
    setShowEmergencyModal(false);
  };

  // Contacts
  const handleAddContact = () => {
    if (contacts.length >= maxContacts && !isPremium) {
      setShowUpgradeModal(true); return;
    }
    if (contacts.length >= maxContacts) return;
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail || undefined,
    };
    updateUserData({ contacts: [...contacts, newContact] });
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setShowAddContact(false);
    showNotification(t.contactSaved);
  };

  const handleDeleteContact = (id: string) => {
    updateUserData({ contacts: contacts.filter(c => c.id !== id) });
    setShowDeleteConfirm(null);
    showNotification(t.contactDeleted);
  };

  // Activities
  const handleAddActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: newActivityName,
      time: newActivityTime,
      duration: newActivityDuration || undefined,
    };
    updateUserData({
      schedule: { ...schedule, [selectedDay]: [...schedule[selectedDay], newActivity] }
    });
    setNewActivityName('');
    setNewActivityTime('');
    setNewActivityDuration('');
    setShowAddActivity(false);
    showNotification(t.dataSaved);
  };

  const handleDeleteActivity = (day: string, id: string) => {
    updateUserData({
      schedule: { ...schedule, [day]: schedule[day].filter(a => a.id !== id) }
    });
  };

  const handleToggleLocation = async () => {
    if (!isPremium) { showNotification('🔒 ' + t.premiumOnly); return; }
    const newValue = !shareLocation;
    updateUserData({ shareLocation: newValue });
    if (newValue) { await fetchLocation(); } else { setUserLocation(null); }
    showNotification(newValue ? t.locationEnabled : t.locationDisabled);
  };

  const handleToggleEmailAlerts = () => {
    updateUserData({ emailAlertsEnabled: !emailAlertsEnabled });
    showNotification(!emailAlertsEnabled ? 'Email alerts enabled' : 'Email alerts disabled');
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // ============ STYLES ============
  const bgColor = '#f0fdf4';
  const headerGradient = isOnline
    ? 'linear-gradient(135deg, #166534 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)';
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    border: '1px solid #e5e7eb',
  };
  const titleStyle = {
    color: '#111827',
    marginTop: 0,
    marginBottom: '16px',
    fontSize: '20px',
    fontWeight: 700,
  };
  const subtitleStyle = {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '16px',
  };
  const greenBtnStyle = {
    background: '#16a34a',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  };
  const whiteBtnStyle = {
    background: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#374151',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  };
  const redBtnStyle = {
    background: '#ef4444',
    border: 'none',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  };
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginBottom: '10px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '24px', fontWeight: 600 }}>
        {t.appName}...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", direction: isRTL ? 'rtl' : 'ltr', padding: '0' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#111827', color: 'white', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: 500, fontSize: '14px' }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <header style={{ background: headerGradient, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px' }}>✅</span>
          {t.appName}
          {isPremium && (
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
              {t.premiumBadge}
            </span>
          )}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white' }} />
              )}
              <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                {t.welcome}, {user.displayName?.split(' ')[0] || 'User'}
              </span>
              <button onClick={handleSignOut} style={{ ...whiteBtnStyle, padding: '6px 14px', fontSize: '13px' }}>
                {t.signOut}
              </button>
            </div>
          ) : (
            <button onClick={handleSignIn} style={{ ...whiteBtnStyle, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t.signIn}
            </button>
          )}

          <select
            value={language}
            onChange={(e) => updateUserData({ language: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
            ))}
          </select>

          <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            ⚙️
          </button>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', padding: '10px 24px', textAlign: 'center', fontWeight: 500, fontSize: '14px' }}>
          {t.offlineBanner}
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={titleStyle}>{t.settings}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Location Toggle - Premium only */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>📍 {t.shareLocation}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{isPremium ? t.premiumBadge : t.premiumOnly}</div>
                </div>
                <div onClick={handleToggleLocation} style={{ width: 48, height: 26, borderRadius: 13, background: (isPremium && shareLocation) ? '#16a34a' : '#d1d5db', cursor: isPremium ? 'pointer' : 'not-allowed', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: (isPremium && shareLocation) ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
              {/* Email Alerts Toggle - Premium only */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>📧 {t.emailAlert}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{""}</div>
                </div>
                <div onClick={handleToggleEmailAlerts} style={{ width: 48, height: 26, borderRadius: 13, background: emailAlertsEnabled ? '#16a34a' : '#d1d5db', cursor: 'pointer' , position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left:  emailAlertsEnabled ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
              {/* Notifications Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>🔔 {t.notifications}</div>
                {browserNotifEnabled ? (
                  <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 500 }}>✓ {t.notificationsEnabled}</span>
                ) : (
                  <button onClick={handleEnableNotifications} style={{ ...greenBtnStyle, padding: '6px 14px', fontSize: '13px' }}>{t.enableNotifications}</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* I'm Fine Button Section */}
        <div style={{ ...cardStyle, textAlign: 'center', marginBottom: '20px', padding: '40px' }}>
          <div style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {t.lastCheckIn}: {formatLastCheckIn(lastCheckIn)}
          </div>

          <button
            onClick={handleImFine}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(220, 38, 38, 0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              flexDirection: 'column',
              gap: '4px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(220, 38, 38, 0.35)';
            }}
          >
            <span style={{ fontSize: '36px' }}>✋</span>
            {t.imFineBtn}
          </button>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowEmergencyModal(true)} style={{ ...greenBtnStyle, background: '#dc2626', padding: '10px 24px' }}>
              🚨 {t.sendAlert}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Emergency Contacts */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>{t.emergencyContacts}</h2>
            <p style={subtitleStyle}>
              {isPremium ? (
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{t.premiumContactLimit}</span>
              ) : (
                <span>{t.freeContactLimit}</span>
              )}
            </p>

            {/* Contact List */}
            <div style={{ marginBottom: '16px' }}>
              {contacts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px' }}>
                  {t.noContacts}
                </div>
              )}
              {contacts.map(contact => (
                <div key={contact.id} style={{ background: '#f9fafb', padding: '12px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{contact.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{contact.phone}</div>
                    {contact.email && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{contact.email}</div>}
                  </div>
                  <button onClick={() => setShowDeleteConfirm(contact.id)} style={redBtnStyle}>
                    {t.delete}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Contact */}
            {!showAddContact ? (
              <button
                onClick={() => {
                  if (contacts.length >= maxContacts && !isPremium) {
                    setShowUpgradeModal(true);
                  } else if (contacts.length < maxContacts) {
                    setShowAddContact(true);
                  }
                }}
                style={{ ...greenBtnStyle, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>+</span> {t.addContact}
              </button>
            ) : (
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                <input type="text" placeholder={t.name} value={newContactName} onChange={(e) => setNewContactName(e.target.value)} style={inputStyle} />
                <input type="tel" placeholder={t.phone} value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} style={inputStyle} />
                <input type="email" placeholder="Email (optional)" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddContact} disabled={!newContactName || !newContactPhone} style={{ ...greenBtnStyle, flex: 1, opacity: (!newContactName || !newContactPhone) ? 0.5 : 1 }}>
                    {t.save}
                  </button>
                  <button onClick={() => { setShowAddContact(false); setNewContactName(''); setNewContactPhone(''); setNewContactEmail(''); }} style={{ ...whiteBtnStyle, flex: 1 }}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sports Tracker */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>{t.sportsTracker}</h2>

            {/* Day Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    background: selectedDay === day ? '#16a34a' : '#f3f4f6',
                    border: 'none',
                    color: selectedDay === day ? 'white' : '#374151',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    flex: 1,
                    minWidth: '36px',
                  }}
                >
                  {t[`day${day.charAt(0).toUpperCase() + day.slice(1)}` as keyof typeof t]}
                </button>
              ))}
            </div>

            {/* Activities Table */}
            <div style={{ marginBottom: '16px' }}>
              {schedule[selectedDay]?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px' }}>
                  {t.addFirstContact}
                </div>
              )}
              {schedule[selectedDay]?.map((activity, idx) => (
                <div key={activity.id} style={{
                  background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #f3f4f6',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{activity.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {activity.time} {activity.duration && `• ${activity.duration}`}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteActivity(selectedDay, activity.id)} style={{ ...redBtnStyle, padding: '4px 10px', fontSize: '12px' }}>
                    {t.delete}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Activity */}
            {!showAddActivity ? (
              <button onClick={() => setShowAddActivity(true)} style={{ ...greenBtnStyle, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>+</span> {t.addActivity}
              </button>
            ) : (
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                <input type="text" placeholder={t.activity} value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="time" value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <input type="text" placeholder="Duration" value={newActivityDuration} onChange={(e) => setNewActivityDuration(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddActivity} disabled={!newActivityName || !newActivityTime} style={{ ...greenBtnStyle, flex: 1, opacity: (!newActivityName || !newActivityTime) ? 0.5 : 1 }}>
                    {t.save}
                  </button>
                  <button onClick={() => { setShowAddActivity(false); setNewActivityName(''); setNewActivityTime(''); setNewActivityDuration(''); }} style={{ ...whiteBtnStyle, flex: 1 }}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '30px', textAlign: 'center', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: isOnline ? '#16a34a' : '#ef4444', borderRadius: '50%' }} />
              {isOnline ? t.onlineBanner : t.offlineBanner}
            </span>
            <span>📁 {t.dataSaved}</span>
          </div>
          {!isPremium && (
            <button onClick={() => setShowUpgradeModal(true)} style={{ marginTop: '16px', ...greenBtnStyle, padding: '12px 32px', fontSize: '15px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}>
              ⭐ {t.upgradePremium}
            </button>
          )}
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <p style={{ color: '#111827', marginBottom: '20px', fontSize: '15px' }}>{t.confirmDelete}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleDeleteContact(showDeleteConfirm)} style={{ ...redBtnStyle, flex: 1, padding: '10px' }}>{t.yes}</button>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ ...whiteBtnStyle, flex: 1, padding: '10px' }}>{t.no}</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowEmergencyModal(false); }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚨</div>
            <h3 style={{ color: '#dc2626', marginTop: 0, marginBottom: '12px', fontSize: '22px' }}>{t.emergency}</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              {contacts.length === 0 ? t.noContacts : t.alertSent}
            </p>
            {contacts.length > 0 && (
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                {contacts.map(c => (
                  <div key={c.id} style={{ padding: '8px', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                    <strong>{c.name}</strong> — {c.phone}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleEmergencyAlert} disabled={contacts.length === 0} style={{ ...greenBtnStyle, background: '#dc2626', flex: 1, padding: '12px', opacity: contacts.length === 0 ? 0.5 : 1 }}>
                {t.send}
              </button>
              <button onClick={() => setShowEmergencyModal(false)} style={{ ...whiteBtnStyle, flex: 1, padding: '12px' }}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>⭐</div>
            <h3 style={{ color: '#111827', marginTop: 0, marginBottom: '8px', fontSize: '24px', fontWeight: 700 }}>
              {t.upgradeTitle}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
              {t.upgradeDesc}
            </p>

            {/* Features List */}
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              {[
                { icon: '👥', text: t.featureContacts },
                { icon: '📅', text: t.featureTracker },
                { icon: '🚫', text: t.featureNoAds },
                { icon: '📍', text: t.featureLocation },
                { icon: '📧', text: t.featureEmail },
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '18px' }}>{t.monthlyPrice}</div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{t.yearlyPrice} — {t.saveYearly}</div>
            </div>

            {/* PayPal Button - LIVE */}
            <a
              href="https://www.paypal.com/ncp/payment/KJ5GTRU64EZ3L"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #0070ba, #1546a0)',
                color: 'white',
                textDecoration: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '16px',
                marginBottom: '12px',
                boxShadow: '0 4px 15px rgba(0, 112, 186, 0.35)',
              }}
            >
              {t.payPalBtn}
            </a>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '16px' }}>
              🔒 {t.securePayment}
            </div>

            <button onClick={() => setShowUpgradeModal(false)} style={{ ...whiteBtnStyle, width: '100%' }}>
              {t.close}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 600px) {
          button { font-size: 14px !important; }
          h1 { font-size: 20px !important; }
          h2 { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}
