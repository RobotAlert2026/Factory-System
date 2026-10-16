
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, getFirestore, onSnapshot, runTransaction, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { CATEGORIES, COLORS, localizedDescription, normalizeLinks } from './link-data.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBsyOMRaq3_zeHHQgYcc-dkulkl1yJNrpE',
  authDomain: 'factory-system-eeae9.firebaseapp.com',
  projectId: 'factory-system-eeae9',
  storageBucket: 'factory-system-eeae9.firebasestorage.app',
  messagingSenderId: '921002408710',
  appId: '1:921002408710:web:40f89b3247437709a03c87',
  measurementId: 'G-LNFN021FY3'
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const linksRef = doc(db, 'portal', 'config');

const translations = {
  th: {
    brandTitle:'ศูนย์ควบคุมระบบโรงงาน', pageTitle:'ศูนย์ควบคุมระบบโรงงาน | Factory Systems Hub',
    metaDescription:'ศูนย์ควบคุมระบบโรงงานสำหรับเปิดระบบสำคัญและจัดการลิงก์ระบบได้จากหน้าเดียว',
    language:'ภาษา', settings:'โหมดตั้งค่า', openSettings:'เปิดโหมดตั้งค่า', theme:'สลับโหมดสี',
    signIn:'เข้าสู่ระบบ', signOut:'ออกจากระบบ ({user})', signInAdmin:'เข้าสู่ระบบผู้ดูแล',
    settingsBanner:'โหมดตั้งค่า: แก้ไข เพิ่ม ลบ หรือจัดลำดับลิงก์ระบบได้ที่การ์ดแต่ละใบ',
    export:'Export JSON', import:'Import JSON', reset:'คืนค่าเริ่มต้น', categoryFilter:'กรองตามหมวดหมู่ระบบ', categoryAll:'ทุกหมวดหมู่',
    favoritesOnly:'แสดงเฉพาะรายการโปรด', searchPlaceholder:'ค้นหาระบบ... (ชื่อไทย / อังกฤษ)', searchLabel:'ค้นหาระบบ',
    countAllLabel:'ระบบทั้งหมด:', countPinnedLabel:'รายการโปรด:', online:'ออนไลน์:', offline:'ออฟไลน์:',
    tip:'เคล็ดลับ: กดปุ่มเฟืองเพื่อเปิดโหมดตั้งค่าและจัดการลิงก์ระบบได้ทันที', realtimeSearch:'รองรับการค้นหาแบบเรียลไทม์',
    footer:'FACTORY SYSTEMS HUB · เปิดใช้งานได้ทุกอุปกรณ์ · ข้อมูลลิงก์จัดเก็บบน Firebase',
    backHome:'กลับหน้าหลัก', reload:'รีโหลด', openNewTab:'เปิดแท็บใหม่ ↗', loadingSystem:'กำลังโหลดระบบ...',
    iframeBlocked:'ระบบนี้ไม่อนุญาตให้เปิดแบบฝังในหน้านี้<br>กรุณาเปิดในแท็บใหม่แทน', adminLogin:'เข้าสู่ระบบผู้ดูแล',
    authHint:'ใช้บัญชีที่สร้างไว้ใน Firebase Authentication เท่านั้น', email:'อีเมล', password:'รหัสผ่าน', cancel:'ยกเลิก',
    chooseOpenMethod:'เลือกวิธีเปิดระบบ', openCompact:'เปิดแบบย่อ', noResults:'ไม่พบระบบที่ตรงกับ "{query}"',
    edit:'แก้ไข', delete:'ลบ', moveUp:'เลื่อนขึ้น', moveDown:'เลื่อนลง', pin:'ปักหมุด', launch:'เข้าสู่ระบบ →',
    nameThai:'ชื่อ (ไทย)', nameEnglish:'ชื่อ (อังกฤษ)', descriptionThai:'คำอธิบาย (ไทย)', descriptionEnglish:'คำอธิบาย (อังกฤษ)', descriptionChinese:'คำอธิบาย (จีน)', url:'ลิงก์ URL',
    category:'หมวดหมู่', status:'สถานะ', icon:'ไอคอน', color:'สี', statusOnline:'ออนไลน์', statusOffline:'ออฟไลน์',
    manualStatus:'สถานะนี้กำหนดโดยผู้ดูแลด้วยตนเอง ไม่ได้ตรวจสอบการเชื่อมต่ออัตโนมัติ',
    save:'บันทึก', addSystem:'เพิ่มระบบใหม่', deleteConfirm:'ลบระบบนี้ออกจากรายการ?',
    newSystem:'ระบบใหม่', newSystemDescription:'คำอธิบายระบบ', invalidData:'ข้อมูลไม่ถูกต้อง: {message}',
    badCloudLinks:'ข้อมูลลิงก์จาก Firebase ไม่ถูกต้อง', badLinkFields:'ข้อมูลระบบบางรายการมีรูปแบบไม่ถูกต้อง',
    badUrl:'URL ของระบบต้องเป็น HTTP หรือ HTTPS', duplicateLinkId:'พบรหัสระบบซ้ำกัน', descriptionTooLong:'คำอธิบายต้องไม่เกิน 500 ตัวอักษร',
    badStatus:'สถานะต้องเป็นออนไลน์หรือออฟไลน์', badCategory:'หมวดหมู่ระบบไม่ถูกต้อง', badIcon:'ไอคอนระบบไม่ถูกต้อง',
    noEditPermission:'บัญชีนี้ไม่มีสิทธิ์แก้ไขข้อมูล',
    cloudLoading:'กำลังโหลดข้อมูล Firebase กรุณารอสักครู่แล้วลองใหม่',
    savedCloud:'บันทึกข้อมูลบน Firebase แล้ว', savedCloudNoCache:'บันทึกบน Firebase แล้ว แต่เก็บสำเนาในเบราว์เซอร์นี้ไม่สำเร็จ',
    saveFailed:'บันทึกไม่สำเร็จ: {message}', cloudLive:'เชื่อมต่อ Firebase แล้ว · ข้อมูลอัปเดตแบบเรียลไทม์',
    cloudReadNoCache:'อ่าน Firebase ได้ แต่เก็บสำเนาในเบราว์เซอร์นี้ไม่สำเร็จ',
    cloudReadFailed:'อ่านข้อมูล Firebase ไม่สำเร็จ: {message}', cloudEmpty:'เชื่อมต่อ Firebase แล้ว · ยังไม่มีข้อมูลบนคลาวด์',
    migrating:'กำลังย้ายข้อมูลลิงก์เดิมขึ้น Firebase...', migrated:'ย้ายข้อมูลลิงก์เดิมขึ้น Firebase สำเร็จ {count} รายการ',
    migrationFailed:'ย้ายข้อมูลขึ้น Firebase ไม่สำเร็จ: {message}', cloudFailed:'เชื่อมต่อ Firestore ไม่สำเร็จ: {message}',
    needLogin:'กำลังเชื่อมต่อ Firebase · เข้าสู่ระบบเพื่อจัดการรายการ',
    noAdmin:'ล็อกอินแล้ว แต่ไม่พบสิทธิ์ผู้ดูแลในโปรเจกต์ {project} · ให้ผู้ดูแลสร้าง Firestore document admins/{uid} (Document ID ต้องตรงกับ UID นี้)',
    adminSignedIn:'เข้าสู่ระบบผู้ดูแลแล้ว: {user}', permissionCheckFailed:'ตรวจสอบสิทธิ์ผู้ดูแลไม่สำเร็จ: {message}',
    signOutFailed:'ออกจากระบบไม่สำเร็จ: {message}', badCredentials:'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง',
    tooManyAttempts:'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่',
    authFailed:'เข้าสู่ระบบไม่สำเร็จ: {message}', restoreConfirm:'คืนค่ารายการระบบทั้งหมดกลับเป็นค่าเริ่มต้น?',
    importSuccess:'นำเข้าข้อมูลสำเร็จ', invalidFile:'ไฟล์ไม่ถูกต้อง: {message}',
    lastNever:'ยังไม่เคยเปิด', justNow:'เพิ่งเปิดไป', minutesAgo:'เปิดล่าสุด {count} นาทีที่แล้ว',
    hoursAgo:'เปิดล่าสุด {count} ชม.ที่แล้ว', daysAgo:'เปิดล่าสุด {count} วันที่แล้ว',
    categoryMaintenance:'ซ่อมบำรุง', categoryProduction:'การผลิต', categoryLogistics:'โลจิสติกส์',
    categoryQuality:'คุณภาพ', categoryImprovement:'การปรับปรุง', categoryPlanning:'การวางแผน',
    categorySafety:'ความปลอดภัย', categoryOther:'อื่นๆ'
  },
  en: {
    brandTitle:'Factory Systems Hub', pageTitle:'Factory Systems Hub',
    metaDescription:'A central hub to open and manage important factory system links.',
    language:'Language', settings:'Settings mode', openSettings:'Open settings mode', theme:'Switch color theme',
    signIn:'Sign in', signOut:'Sign out ({user})', signInAdmin:'Admin sign in',
    settingsBanner:'Settings mode: edit, add, delete, or reorder system links using the cards.',
    export:'Export JSON', import:'Import JSON', reset:'Restore defaults', categoryFilter:'Filter by system category', categoryAll:'All categories',
    favoritesOnly:'Show favorites only', searchPlaceholder:'Search systems... (Thai / English name)', searchLabel:'Search systems',
    countAllLabel:'Systems:', countPinnedLabel:'Favorites:', online:'Online:', offline:'Offline:',
    tip:'Tip: Select the gear button to manage system links.', realtimeSearch:'Real-time search supported',
    footer:'FACTORY SYSTEMS HUB · Available on all devices · Links stored in Firebase',
    backHome:'Back to home', reload:'Reload', openNewTab:'Open in new tab ↗', loadingSystem:'Loading system...',
    iframeBlocked:'This system does not allow embedding here.<br>Please open it in a new tab.', adminLogin:'Admin sign in',
    authHint:'Only accounts created in Firebase Authentication can sign in.', email:'Email', password:'Password', cancel:'Cancel',
    chooseOpenMethod:'Choose how to open this system', openCompact:'Open embedded', noResults:'No systems match "{query}"',
    edit:'Edit', delete:'Delete', moveUp:'Move up', moveDown:'Move down', pin:'Pin', launch:'Open system →',
    nameThai:'Name (Thai)', nameEnglish:'Name (English)', descriptionThai:'Description (Thai)', descriptionEnglish:'Description (English)', descriptionChinese:'Description (Chinese)', url:'URL',
    category:'Category', status:'Status', icon:'Icon', color:'Color', statusOnline:'Online', statusOffline:'Offline',
    manualStatus:'This status is set manually by an administrator; connectivity is not checked automatically.',
    save:'Save', addSystem:'Add new system', deleteConfirm:'Remove this system from the list?',
    newSystem:'New system', newSystemDescription:'System description', invalidData:'Invalid data: {message}',
    badCloudLinks:'Invalid link data received from Firebase', badLinkFields:'One or more system entries have invalid fields',
    badUrl:'System URLs must use HTTP or HTTPS', duplicateLinkId:'Duplicate system IDs are not allowed', descriptionTooLong:'Descriptions must be 500 characters or fewer',
    badStatus:'Status must be online or offline', badCategory:'Invalid system category', badIcon:'Invalid system icon',
    noEditPermission:'This account is not allowed to edit data',
    cloudLoading:'Firebase data is still loading. Please wait and try again.',
    savedCloud:'Changes saved to Firebase', savedCloudNoCache:'Saved to Firebase, but could not cache a local copy',
    saveFailed:'Save failed: {message}', cloudLive:'Connected to Firebase · Live updates enabled',
    cloudReadNoCache:'Firebase data loaded, but could not cache a local copy',
    cloudReadFailed:'Could not read Firebase data: {message}', cloudEmpty:'Connected to Firebase · No cloud data yet',
    migrating:'Migrating existing links to Firebase...', migrated:'Migrated {count} existing links to Firebase',
    migrationFailed:'Firebase migration failed: {message}', cloudFailed:'Firestore connection failed: {message}',
    needLogin:'Connecting to Firebase · Sign in to manage links',
    noAdmin:'Signed in, but this account is not an admin in project {project}. Create Firestore document admins/{uid} (document ID must match this UID).',
    adminSignedIn:'Admin signed in: {user}', permissionCheckFailed:'Could not verify admin access: {message}',
    signOutFailed:'Sign-out failed: {message}', badCredentials:'Incorrect email or password. Check your details and try again.',
    tooManyAttempts:'Too many sign-in attempts. Please wait a moment and try again.',
    authFailed:'Sign-in failed: {message}', restoreConfirm:'Restore all systems to their default settings?',
    importSuccess:'Data imported successfully', invalidFile:'Invalid file: {message}',
    lastNever:'Never opened', justNow:'Opened just now', minutesAgo:'Last opened {count} min ago',
    hoursAgo:'Last opened {count} hr ago', daysAgo:'Last opened {count} days ago',
    categoryMaintenance:'Maintenance', categoryProduction:'Production', categoryLogistics:'Logistics',
    categoryQuality:'Quality', categoryImprovement:'Improvement', categoryPlanning:'Planning',
    categorySafety:'Safety', categoryOther:'Other'
  },
  zh: {
    brandTitle:'工厂系统中心', pageTitle:'工厂系统中心 | Factory Systems Hub',
    metaDescription:'集中打开和管理重要工厂系统链接的平台。',
    language:'语言', settings:'设置模式', openSettings:'打开设置模式', theme:'切换主题',
    signIn:'登录', signOut:'退出登录（{user}）', signInAdmin:'管理员登录',
    settingsBanner:'设置模式：可通过卡片编辑、添加、删除或重新排列系统链接。',
    export:'导出 JSON', import:'导入 JSON', reset:'恢复默认设置', categoryFilter:'按系统类别筛选', categoryAll:'全部类别',
    favoritesOnly:'仅显示收藏', searchPlaceholder:'搜索系统……（泰文/英文名称）', searchLabel:'搜索系统',
    countAllLabel:'系统总数：', countPinnedLabel:'收藏：', online:'在线：', offline:'离线：',
    tip:'提示：点击齿轮按钮即可管理系统链接。', realtimeSearch:'支持实时搜索',
    footer:'FACTORY SYSTEMS HUB · 支持所有设备 · 链接存储于 Firebase',
    backHome:'返回主页', reload:'重新加载', openNewTab:'在新标签页打开 ↗', loadingSystem:'正在加载系统……',
    iframeBlocked:'此系统不允许在此嵌入打开。<br>请在新标签页中打开。', adminLogin:'管理员登录',
    authHint:'仅限在 Firebase Authentication 中创建的账户登录。', email:'电子邮件', password:'密码', cancel:'取消',
    chooseOpenMethod:'选择打开方式', openCompact:'嵌入打开', noResults:'没有符合“{query}”的系统',
    edit:'编辑', delete:'删除', moveUp:'上移', moveDown:'下移', pin:'收藏', launch:'打开系统 →',
    nameThai:'名称（泰文）', nameEnglish:'名称（英文）', descriptionThai:'说明（泰文）', descriptionEnglish:'说明（英文）', descriptionChinese:'说明（中文）', url:'链接 URL',
    category:'类别', status:'状态', icon:'图标', color:'颜色', statusOnline:'在线', statusOffline:'离线',
    manualStatus:'此状态由管理员手动设置，不会自动检测连接情况。',
    save:'保存', addSystem:'添加新系统', deleteConfirm:'确定从列表中删除此系统吗？',
    newSystem:'新系统', newSystemDescription:'系统说明', invalidData:'数据无效：{message}',
    badCloudLinks:'从 Firebase 收到的链接数据无效', badLinkFields:'一个或多个系统条目的字段无效',
    badUrl:'系统链接必须使用 HTTP 或 HTTPS', duplicateLinkId:'系统 ID 不能重复', descriptionTooLong:'说明不能超过 500 个字符',
    badStatus:'状态必须为在线或离线', badCategory:'系统类别无效', badIcon:'系统图标无效',
    noEditPermission:'此账户没有修改数据的权限',
    cloudLoading:'Firebase 数据仍在加载，请稍候重试。',
    savedCloud:'更改已保存到 Firebase', savedCloudNoCache:'已保存到 Firebase，但无法在此浏览器缓存副本',
    saveFailed:'保存失败：{message}', cloudLive:'已连接 Firebase · 实时更新已启用',
    cloudReadNoCache:'已读取 Firebase 数据，但无法在此浏览器缓存副本',
    cloudReadFailed:'无法读取 Firebase 数据：{message}', cloudEmpty:'已连接 Firebase · 云端尚无数据',
    migrating:'正在将现有链接迁移到 Firebase……', migrated:'已将 {count} 个现有链接迁移到 Firebase',
    migrationFailed:'迁移到 Firebase 失败：{message}', cloudFailed:'Firestore 连接失败：{message}',
    needLogin:'正在连接 Firebase · 登录以管理链接',
    noAdmin:'已登录，但此账户不是项目 {project} 的管理员。请创建 Firestore 文档 admins/{uid}（文档 ID 必须与此 UID 相同）。',
    adminSignedIn:'管理员已登录：{user}', permissionCheckFailed:'无法验证管理员权限：{message}',
    signOutFailed:'退出登录失败：{message}', badCredentials:'电子邮件或密码错误，请检查后重试。',
    tooManyAttempts:'登录尝试次数过多，请稍后再试。',
    authFailed:'登录失败：{message}', restoreConfirm:'确定将所有系统恢复为默认设置吗？',
    importSuccess:'数据导入成功', invalidFile:'文件无效：{message}',
    lastNever:'从未打开', justNow:'刚刚打开', minutesAgo:'上次打开于 {count} 分钟前',
    hoursAgo:'上次打开于 {count} 小时前', daysAgo:'上次打开于 {count} 天前',
    categoryMaintenance:'维护', categoryProduction:'生产', categoryLogistics:'物流',
    categoryQuality:'质量', categoryImprovement:'改善', categoryPlanning:'计划',
    categorySafety:'安全', categoryOther:'其他'
  }
};
const LANGUAGE_LOCALES = {th:'th-TH', en:'en-US', zh:'zh-CN'};
let language = localStorage.getItem('factoryPortalLanguage_v1') || 'th';
if(!Object.prototype.hasOwnProperty.call(translations, language)) language = 'th';
function t(key, values = {}){
  const template = translations[language][key] || translations.th[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}
function messageForError(error){
  const message = error?.message || String(error);
  return translations[language][message] || translations.th[message] || message;
}
function categoryName(category){
  return t(`category${category}`);
}
function descriptionForLanguage(link){ return localizedDescription(link, language); }
function applyLanguage(){
  const locale = LANGUAGE_LOCALES[language];
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('metaDescription');
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    element.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-category]').forEach(option => {
    option.textContent = categoryName(option.dataset.category);
  });
  document.getElementById('languageSelect').value = language;
  document.getElementById('authBtn').textContent = currentUser
    ? t('signOut', {user: currentUser.email || 'user'})
    : t('signInAdmin');
  document.getElementById('gearBtn').title = t('settings');
  document.getElementById('gearBtn').setAttribute('aria-label', t('openSettings'));
  document.getElementById('themeBtn').title = t('theme');
  document.getElementById('themeBtn').setAttribute('aria-label', t('theme'));
  document.getElementById('languageSelect').setAttribute('aria-label', t('language'));
  document.getElementById('categoryFilter').value = selectedCategory;
  if(authErrorKey){
    const errorMessage = document.getElementById('authError');
    errorMessage.textContent = t(authErrorKey, authErrorValues);
  }
  const status = document.getElementById('cloudStatus');
  status.textContent = cloudStatusRenderer();
  tickClock();
  render();
}

const STORAGE_KEY = 'factoryPortalLinks_v1';
const PIN_KEY = 'factoryPortalPins_v1';
const LASTUSED_KEY = 'factoryPortalLastUsed_v1';

const ICONS = {
  hanger: '<path d="M12 4a2 2 0 100-.001M12 4v3M6 21l6-6 6 6M4 21h16M12 7c-3 2-8 4-8 8h16c0-4-5-6-8-8z"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a6 6 0 00-3.6 10.8c.6.5 1 1.2 1.1 2h5c.1-.8.5-1.5 1.1-2A6 6 0 0012 2z"/>',
  robot: '<path d="M12 2v3M8 9h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/><path d="M4 12v3M20 12v3"/>',
  agv: '<path d="M3 16V9a1 1 0 011-1h9l4 4h3a1 1 0 011 1v3"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/><path d="M9 16h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gear: '<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82 2 2 0 11-2.83 2.83 1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51 2 2 0 01-4 0 1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33 2 2 0 11-2.83-2.83 1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1 2 2 0 010-4 1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82 2 2 0 112.83-2.83 1.65 1.65 0 001.82.33 1.65 1.65 0 001-1.51 2 2 0 014 0 1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33 2 2 0 112.83 2.83 1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1 2 2 0 010 4 1.65 1.65 0 00-1.51 1z"/>',
  box: '<path d="M21 8L12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'
};

const DEFAULT_LINKS = [
  { id:'hanger',   nameTh:'HANGER SYSTEM',        nameEn:'HANGER SYSTEM',   desc:'ตรวจสอบและบำรุงรักษาระบบแขวน PC', url:'https://robotalert2026.github.io/Hanger-Sysytem/', icon:'hanger', color:'#f5a623', category:'Maintenance', status:'online' },
  { id:'kaizen',   nameTh:'KAIZEN IMPROVEMENT',      nameEn:'KAIZEN IMPROVEMENT', desc:'ติดตามโครงการปรับปรุงและ ROI', url:'https://robotalert2026.github.io/Kaizen-Improvement/', icon:'bulb', color:'#2dd4e8', category:'Improvement', status:'online' },
  { id:'glue',     nameTh:'ROBOT GLUE',         nameEn:'ROBOT GLUE',      desc:'บันทึก PM ถังกาวและไลน์โรบอท', url:'https://robotalert2026.github.io/PM-Glue-Record-Tank/', icon:'robot', color:'#34d399', category:'Production', status:'online' },
  { id:'agv',      nameTh:'AGV SYSTEM',              nameEn:'AGV SYSTEM',      desc:'ตรวจสอบสถานะและ PM รถ AGV', url:'https://robotalert2026.github.io/AGV-System/', icon:'agv', color:'#a78bfa', category:'Logistics', status:'online' },
  { id:'downtime', nameTh:'DOWNTIME',        nameEn:'DOWNTIME',        desc:'บันทึกและวิเคราะห์ Downtime สายการผลิต', url:'https://robotalert2026.github.io/Downtime-GA/', icon:'clock', color:'#fb923c', category:'Quality', status:'offline' },
  { id:'WareHouse', nameTh:'WareHouse',        nameEn:'WareHouse',        desc:'คลังอะไหล่และระบบเบิกอะไหล่', url:'https://robotalert2026.github.io/Warehouse-System/', icon:'clock', color:'#fb923c', category:'Quality', status:'offline' },
  { id:'Spare Part list', nameTh:'Spare Part list',        nameEn:'Spare part list',        desc:'ข้อมูลเครื่องจักรและอะไหล่', url:'https://robotalert2026.github.io/Spare-Part-List/', icon:'tool', color:'#fb923c', category:'Quality', status:'offline' },

];

let links = loadLinks();
let pins = readLocalJson(PIN_KEY, []);
let lastUsed = readLocalJson(LASTUSED_KEY, {});
let settingsMode = false;
let editingId = null;
let showOnlyPinned = false;
let selectedCategory = 'all';
let theme = localStorage.getItem('factoryPortalTheme_v1') || 'dark';
let currentUser = null;
let isAdmin = false;
let cloudReady = false;
let seedAttempt = null;
let cloudStatusRenderer = () => '';
let authErrorKey = null;
let authErrorValues = {};

function loadLinks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)) return normalizeLinks(parsed);
    }
  }catch(error){
    console.warn('Unable to load cached links:', error);
  }
  return normalizeLinks(DEFAULT_LINKS);
}
function readLocalJson(key, fallback){
  try{
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value === null ? fallback : value;
  }catch(error){
    console.warn(`Unable to load local preference "${key}":`, error);
    return fallback;
  }
}
function cacheLinks(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    return true;
  }catch(error){
    console.warn('Unable to cache links in this browser:', error);
    return false;
  }
}
async function saveLinks(nextLinks){
  if(!isAdmin || !currentUser) throw new Error(t('noEditPermission'));
  if(!cloudReady) throw new Error(t('cloudLoading'));
  const validLinks = normalizeLinks(nextLinks);
  await setDoc(linksRef, {
    links: validLinks,
    updatedAt: serverTimestamp(),
    updatedBy: currentUser.uid
  });
  links = validLinks;
  const cached = cacheLinks();
  setCloudStatus(() => t(cached ? 'savedCloud' : 'savedCloudNoCache'), !cached);
  render();
}
async function persistLinks(nextLinks){
  try{
    await saveLinks(nextLinks);
    return true;
  }catch(error){
    setCloudStatus(() => t('saveFailed', {message:messageForError(error)}), true);
    return false;
  }
}
function savePins(){ localStorage.setItem(PIN_KEY, JSON.stringify(pins)); }
function saveLastUsed(){ localStorage.setItem(LASTUSED_KEY, JSON.stringify(lastUsed)); }
function setCloudStatus(message, isError = false){
  const status = document.getElementById('cloudStatus');
  if(!status) return;
  cloudStatusRenderer = typeof message === 'function' ? message : () => message;
  status.textContent = cloudStatusRenderer();
  status.classList.toggle('error', isError);
}
async function seedCloudLinksIfNeeded(){
  if(!isAdmin || !currentUser || !cloudReady || seedAttempt) return;
  const user = currentUser;
  const existingLinks = normalizeLinks(links);
  seedAttempt = runTransaction(db, async transaction => {
    const snapshot = await transaction.get(linksRef);
    if(snapshot.exists()) return false;
    transaction.set(linksRef, {
      links: existingLinks,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    });
    return true;
  });
  try{
    const migrated = await seedAttempt;
    if(migrated){
      setCloudStatus(() => t('migrated', {count:existingLinks.length}));
    }
  }catch(error){
    setCloudStatus(() => t('migrationFailed', {message:error.message}), true);
  }finally{
    seedAttempt = null;
  }
}
function startCloudData(){
  onSnapshot(linksRef, snapshot => {
    if(snapshot.exists()){
      try{
        links = normalizeLinks(snapshot.data().links);
        const cached = cacheLinks();
        cloudReady = true;
        document.getElementById('gearBtn').disabled = false;
        render();
        setCloudStatus(() => t(cached ? 'cloudLive' : 'cloudReadNoCache'), !cached);
      }catch(error){
        setCloudStatus(() => t('cloudReadFailed', {message:messageForError(error)}), true);
      }
    }else{
      cloudReady = true;
      document.getElementById('gearBtn').disabled = false;
      if(isAdmin){
        setCloudStatus(() => t('migrating'));
        seedCloudLinksIfNeeded();
      }else{
        setCloudStatus(() => t('cloudEmpty'));
      }
    }
  }, error => {
    setCloudStatus(() => t('cloudFailed', {message:error.message}), true);
  });
}
onAuthStateChanged(auth, async user => {
  currentUser = user;
  isAdmin = false;
  settingsMode = false;
  editingId = null;
  const authButton = document.getElementById('authBtn');
  const gearButton = document.getElementById('gearBtn');
  authButton.textContent = user ? t('signOut', {user:user.email || user.uid}) : t('signInAdmin');
  gearButton.disabled = !cloudReady;
  document.getElementById('settingsBanner').classList.remove('show');
  gearButton.classList.remove('active');
  if(!user){
    setCloudStatus(() => t('needLogin'));
    render();
    return;
  }
  try{
    const adminSnapshot = await getDoc(doc(db, 'admins', user.uid));
    isAdmin = adminSnapshot.exists();
    gearButton.disabled = !cloudReady;
    if(!isAdmin){
      setCloudStatus(() => t('noAdmin', {project:firebaseConfig.projectId, uid:user.uid}));
    }else{
      setCloudStatus(() => t('adminSignedIn', {user:user.email || user.uid}));
      seedCloudLinksIfNeeded();
    }
    render();
  }catch(error){
    setCloudStatus(() => t('permissionCheckFailed', {message:error.message}), true);
  }
});
startCloudData();

// ---- Clock ----
function tickClock(){
  const now = new Date();
  const locale = LANGUAGE_LOCALES[language];
  const opts = { timeZone:'Asia/Bangkok', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false };
  document.getElementById('clock').textContent = now.toLocaleTimeString(locale, opts);
  const dateOpts = { timeZone:'Asia/Bangkok', day:'2-digit', month:'short', year:'numeric' };
  document.getElementById('dateBox').textContent = now.toLocaleDateString(locale, dateOpts);
}
tickClock(); setInterval(tickClock, 1000);

function fmtLastUsed(ts){
  if(!ts) return t('lastNever');
  const diffMin = Math.round((Date.now() - ts)/60000);
  if(diffMin < 1) return t('justNow');
  if(diffMin < 60) return t('minutesAgo', {count:diffMin});
  const diffH = Math.round(diffMin/60);
  if(diffH < 24) return t('hoursAgo', {count:diffH});
  const diffD = Math.round(diffH/24);
  return t('daysAgo', {count:diffD});
}

function applyTheme(){
  document.body.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  const themeBtn = document.getElementById('themeBtn');
  if(themeBtn){
    themeBtn.classList.toggle('active', theme === 'light');
    themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
  }
}

function render(){
  const grid = document.getElementById('grid');
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter');
  const favsBtn = document.getElementById('favsBtn');

  let items = links.filter(l => !q || l.nameTh.toLowerCase().includes(q) || l.nameEn.toLowerCase().includes(q) ||
    [l.descTh, l.descEn, l.descZh].some(description => description.toLowerCase().includes(q)));
  if(showOnlyPinned) items = items.filter(l => pins.includes(l.id));
  if(selectedCategory !== 'all') items = items.filter(l => (l.category || 'Other') === selectedCategory);
  // pinned first
  items = items.slice().sort((a,b) => (pins.includes(b.id)?1:0) - (pins.includes(a.id)?1:0));

  document.getElementById('countAll').textContent = links.length;
  document.getElementById('countPinned').textContent = pins.length;
  document.getElementById('countOnline').textContent = links.filter(l => l.status === 'online').length;
  document.getElementById('countOffline').textContent = links.filter(l => l.status !== 'online').length;
  if(categoryFilter) categoryFilter.value = selectedCategory;
  if(favsBtn){
    favsBtn.classList.toggle('active', showOnlyPinned);
    favsBtn.setAttribute('aria-pressed', String(showOnlyPinned));
  }

  grid.innerHTML = '';

  if(items.length === 0){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${escapeHtml(t('noResults', {query:q}))}</div>`;
  }

  items.forEach((l, idx) => {
    const card = document.createElement('div');
    card.className = 'card' + (settingsMode ? ' editmode' : '') + (editingId === l.id ? ' editing' : '');
    card.style.setProperty('--accent', l.color);

    const safeId = escapeAttr(l.id);
    const iconSvg = ICONS[l.icon] || ICONS.box;
    const isPinned = pins.includes(l.id);
    const isOnline = l.status === 'online';
    const primaryName = language === 'th' ? l.nameTh : l.nameEn;
    const secondaryName = language === 'th' ? l.nameEn : l.nameTh;

    card.innerHTML = `
      <div class="bolt tl"></div><div class="bolt tr"></div><div class="bolt bl"></div><div class="bolt br"></div>
      ${settingsMode ? `
      <div class="card-controls">
        <button class="icon-btn" data-act="up" data-id="${safeId}" title="${t('moveUp')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>
        <button class="icon-btn" data-act="down" data-id="${safeId}" title="${t('moveDown')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
        <button class="icon-btn" data-act="edit" data-id="${safeId}" title="${t('edit')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>
        <button class="icon-btn del" data-act="del" data-id="${safeId}" title="${t('delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg></button>
      </div>` : ''}

      <div class="view-only">
        <div class="card-top">
          <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${iconSvg}</svg></div>
          <button class="pin-btn ${isPinned?'active':''}" data-act="pin" data-id="${safeId}" title="${t('pin')}">
            <svg viewBox="0 0 24 24" fill="${isPinned?'currentColor':'none'}" stroke="currentColor" stroke-width="1.7"><path d="M12 17v5M5 10l7-7 7 7-2 2H7l-2-2z"/><path d="M7 10v3.5L5 17h14l-2-3.5V10"/></svg>
          </button>
        </div>
        <div class="card-id">MOD-0${idx+1}</div>
        <h3>${escapeHtml(primaryName)}</h3>
        <div class="en">${escapeHtml(secondaryName)}</div>
        <p class="desc">${escapeHtml(descriptionForLanguage(l))}</p>
        <div class="card-foot">
          <a class="launch" href="${escapeAttr(l.url)}" target="_blank" rel="noopener noreferrer" data-act="open" data-id="${safeId}">${t('launch')}</a>
        </div>
        <div class="last-used">${fmtLastUsed(lastUsed[l.id])}</div>
        <div class="category-badge">${escapeHtml(categoryName(l.category || 'Other'))}</div>
        <div class="status" style="margin-top:10px;"><span class="led ${isOnline ? 'online' : 'offline'}"></span> ${isOnline ? t('statusOnline') : t('statusOffline')}</div>
      </div>

      <div class="edit-panel">
        <label>${t('nameThai')}</label>
        <input type="text" data-f="nameTh" value="${escapeAttr(l.nameTh)}">
        <label>${t('nameEnglish')}</label>
        <input type="text" data-f="nameEn" value="${escapeAttr(l.nameEn)}">
        <label>${t('descriptionThai')}</label>
        <textarea data-f="descTh" maxlength="500">${escapeHtml(l.descTh)}</textarea>
        <label>${t('descriptionEnglish')}</label>
        <textarea data-f="descEn" maxlength="500">${escapeHtml(l.descEn)}</textarea>
        <label>${t('descriptionChinese')}</label>
        <textarea data-f="descZh" maxlength="500">${escapeHtml(l.descZh)}</textarea>
        <label>${t('url')}</label>
        <input type="text" data-f="url" value="${escapeAttr(l.url)}">
        <label>${t('category')}</label>
        <select data-f="category">
          ${CATEGORIES.map(c => `<option value="${c}" ${c=== (l.category || 'Other') ?'selected':''}>${categoryName(c)}</option>`).join('')}
        </select>
        <label>${t('status')}</label>
        <select data-f="status">
          <option value="online" ${l.status === 'online' ? 'selected' : ''}>${t('statusOnline')}</option>
          <option value="offline" ${l.status !== 'online' ? 'selected' : ''}>${t('statusOffline')}</option>
        </select>
        <span class="status-note">${escapeHtml(t('manualStatus'))}</span>
        <label>${t('icon')}</label>
        <select data-f="icon">
          ${Object.keys(ICONS).map(k => `<option value="${k}" ${k===l.icon?'selected':''}>${k}</option>`).join('')}
        </select>
        <label>${t('color')}</label>
        <div class="swatches">
          ${COLORS.map(c => `<div class="swatch ${c===l.color?'sel':''}" style="background:${c}" data-f="color" data-val="${c}"></div>`).join('')}
        </div>
        <div class="edit-actions">
          <button class="btn primary sm" type="button" data-act="save" data-id="${safeId}">${t('save')}</button>
          <button class="btn sm" type="button" data-act="cancel" data-id="${safeId}">${t('cancel')}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  if(settingsMode){
    const addCard = document.createElement('div');
    addCard.className = 'card add-card';
    addCard.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg><span>${t('addSystem')}</span>`;
    addCard.addEventListener('click', addNew);
    grid.appendChild(addCard);
  }

  attachHandlers();
}

function attachHandlers(){
  document.querySelectorAll('[data-act]').forEach(el => {
    el.addEventListener('click', (e) => {
      const act = el.dataset.act;
      const id = el.dataset.id;
      if(act === 'pin'){ e.preventDefault(); togglePin(id); }
      else if(act === 'edit'){ editingId = id; render(); }
      else if(act === 'cancel'){ editingId = null; render(); }
      else if(act === 'del'){ deleteLink(id); }
      else if(act === 'up'){ moveLink(id, -1); }
      else if(act === 'down'){ moveLink(id, 1); }
      else if(act === 'save'){ saveEdit(id, el.closest('.card')); }
      else if(act === 'open'){
        // allow ctrl/cmd/middle-click to open a normal new tab as usual
        if(e.ctrlKey || e.metaKey || e.button === 1) return;
        e.preventDefault();
        showLaunchOptions(id);
      }
    });
  });
  document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.parentElement.querySelectorAll('.swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
    });
  });
}

function markUsed(id){ lastUsed[id] = Date.now(); saveLastUsed(); }

// ---- In-page viewer ----
const homeView = document.getElementById('homeView');
const viewer = document.getElementById('viewer');
const viewerFrame = document.getElementById('viewerFrame');
const viewerLoading = document.getElementById('viewerLoading');
const viewerFallback = document.getElementById('viewerFallback');
let viewerTimer = null;
let pendingLaunchId = null;

function showLaunchOptions(id){
  const link = links.find(item => item.id === id);
  if(!link) return;
  pendingLaunchId = id;
  document.getElementById('launchDescription').textContent = `${link.nameTh} · ${link.nameEn}`;
  document.getElementById('launchDialog').showModal();
}

function launchInNewTab(){
  const link = links.find(item => item.id === pendingLaunchId);
  if(!link) return;
  markUsed(link.id);
  render();
  window.open(link.url, '_blank', 'noopener,noreferrer');
  document.getElementById('launchDialog').close();
  pendingLaunchId = null;
}

function openViewer(id){
  const l = links.find(x => x.id === id);
  if(!l) return;
  markUsed(id);

  document.getElementById('viewerTitleTh').textContent = l.nameTh;
  document.getElementById('viewerTitleEn').textContent = l.nameEn;
  document.getElementById('viewerDot').style.setProperty('--vcolor', l.color);
  viewerLoading.style.setProperty('--vcolor', l.color);
  document.getElementById('newTabBtn').href = l.url;
  document.getElementById('fallbackOpenBtn').href = l.url;

  viewerFallback.classList.remove('show');
  viewerLoading.style.display = 'flex';
  viewerLoading.style.opacity = '1';
  viewerFrame.src = l.url;

  homeView.style.display = 'none';
  viewer.classList.add('show');
  window.scrollTo({top:0, behavior:'instant'});

  clearTimeout(viewerTimer);
  // if it hasn't loaded within 6s, most likely blocked by X-Frame-Options/CSP
  viewerTimer = setTimeout(() => {
    if(viewerLoading.style.display !== 'none'){
      viewerFallback.classList.add('show');
      viewerLoading.style.display = 'none';
    }
  }, 6000);
}

function closeViewer(){
  clearTimeout(viewerTimer);
  viewerFrame.src = 'about:blank';
  viewer.classList.remove('show');
  homeView.style.display = 'block';
  render();
}

viewerFrame.addEventListener('load', () => {
  if(viewerFrame.src === 'about:blank' || viewerFrame.src === '') return;
  clearTimeout(viewerTimer);
  viewerLoading.style.opacity = '0';
  setTimeout(() => { viewerLoading.style.display = 'none'; }, 250);
});

document.getElementById('backBtn').addEventListener('click', closeViewer);
document.getElementById('launchNewTabBtn').addEventListener('click', launchInNewTab);
document.getElementById('launchCompactBtn').addEventListener('click', () => {
  const id = pendingLaunchId;
  if(!id) return;
  document.getElementById('launchDialog').close();
  pendingLaunchId = null;
  openViewer(id);
});
document.getElementById('launchCancelBtn').addEventListener('click', () => {
  document.getElementById('launchDialog').close();
  pendingLaunchId = null;
});
document.getElementById('reloadBtn').addEventListener('click', () => {
  viewerFallback.classList.remove('show');
  viewerLoading.style.display = 'flex';
  viewerLoading.style.opacity = '1';
  const src = viewerFrame.src;
  viewerFrame.src = 'about:blank';
  clearTimeout(viewerTimer);
  setTimeout(() => {
    viewerFrame.src = src;
    viewerTimer = setTimeout(() => {
      if(viewerLoading.style.display !== 'none'){
        viewerFallback.classList.add('show');
        viewerLoading.style.display = 'none';
      }
    }, 6000);
  }, 50);
});

// Esc key returns to home from viewer
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && viewer.classList.contains('show')) closeViewer();
});

function togglePin(id){
  if(pins.includes(id)) pins = pins.filter(p => p !== id);
  else pins.push(id);
  savePins(); render();
}
async function deleteLink(id){
  if(!confirm(t('deleteConfirm'))) return;
  const nextLinks = links.filter(l => l.id !== id);
  if(await persistLinks(nextLinks)){
    pins = pins.filter(pin => pin !== id);
    savePins();
    render();
  }
}
async function moveLink(id, dir){
  const i = links.findIndex(l => l.id === id);
  const j = i + dir;
  if(j < 0 || j >= links.length) return;
  const nextLinks = [...links];
  [nextLinks[i], nextLinks[j]] = [nextLinks[j], nextLinks[i]];
  await persistLinks(nextLinks);
}
async function saveEdit(id, cardEl){
  const l = links.find(x => x.id === id);
  if(!l) return;
  const updated = {...l};
  cardEl.querySelectorAll('[data-f]').forEach(f => {
    const field = f.dataset.f;
    if(field === 'color'){
      if(f.classList.contains('sel')) updated.color = f.dataset.val;
    } else {
      updated[field] = f.value.trim();
    }
  });
  try{
    normalizeLinks(links.map(item => item.id === id ? updated : item));
  }catch(error){
    alert(t('invalidData', {message:messageForError(error)}));
    return;
  }
  if(await persistLinks(links.map(item => item.id === id ? updated : item))){
    editingId = null;
    render();
  }
}
async function addNew(){
  const newId = 'sys_' + Date.now();
  const nextLinks = [...links, { id:newId, nameTh:'ระบบใหม่', nameEn:'NEW SYSTEM', desc:'คำอธิบายระบบ', url:'https://example.com/', icon:'box', color: COLORS[links.length % COLORS.length], category:'Other', status:'online' }];
  if(!await persistLinks(nextLinks)) return;
  editingId = newId;
  render();
  document.querySelector('.card.editing')?.scrollIntoView({behavior:'smooth', block:'center'});
}

function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return escapeHtml(s); }

// ---- Settings toggle ----
document.getElementById('gearBtn').addEventListener('click', () => {
  if(!currentUser){
    document.getElementById('authDialog').showModal();
    document.getElementById('authEmail').focus();
    return;
  }
  if(!isAdmin){
    setCloudStatus(() => t('noAdmin', {project:firebaseConfig.projectId, uid:currentUser.uid}), true);
    return;
  }
  settingsMode = !settingsMode;
  editingId = null;
  document.getElementById('gearBtn').classList.toggle('active', settingsMode);
  document.getElementById('settingsBanner').classList.toggle('show', settingsMode);
  render();
});

document.getElementById('authBtn').addEventListener('click', async () => {
  if(currentUser){
    try{
      await signOut(auth);
    }catch(error){
      setCloudStatus(() => t('signOutFailed', {message:error.message}), true);
    }
    return;
  }
  document.getElementById('authDialog').showModal();
  document.getElementById('authEmail').focus();
});
document.getElementById('authCancelBtn').addEventListener('click', () => {
  clearAuthError();
  document.getElementById('authDialog').close();
});
function clearAuthError(){
  authErrorKey = null;
  authErrorValues = {};
  const errorMessage = document.getElementById('authError');
  errorMessage.textContent = '';
  errorMessage.classList.remove('show');
}
document.getElementById('authForm').addEventListener('input', clearAuthError);
document.getElementById('authForm').addEventListener('submit', async event => {
  event.preventDefault();
  clearAuthError();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const submitButton = event.currentTarget.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try{
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('authDialog').close();
    event.currentTarget.reset();
  }catch(error){
    const invalidCredentials = [
      'auth/invalid-credential',
      'auth/invalid-login-credentials',
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-email'
    ].includes(error.code);
    const errorKey = invalidCredentials
      ? 'badCredentials'
      : error.code === 'auth/too-many-requests'
        ? 'tooManyAttempts'
        : 'authFailed';
    const errorValues = errorKey === 'authFailed' ? {message:error.message} : {};
    authErrorKey = errorKey;
    authErrorValues = errorValues;
    const message = t(errorKey, errorValues);
    const errorMessage = document.getElementById('authError');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setCloudStatus(() => t(errorKey, errorValues), true);
  }finally{
    submitButton.disabled = false;
  }
});

document.getElementById('themeBtn').addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('factoryPortalTheme_v1', theme);
  applyTheme();
});

document.getElementById('favsBtn').addEventListener('click', () => {
  showOnlyPinned = !showOnlyPinned;
  render();
});

document.getElementById('categoryFilter').addEventListener('change', (e) => {
  selectedCategory = e.target.value;
  render();
});

document.getElementById('searchBox').addEventListener('input', render);

document.getElementById('resetBtn').addEventListener('click', async () => {
  if(!confirm(t('restoreConfirm'))) return;
  await persistLinks(JSON.parse(JSON.stringify(DEFAULT_LINKS)));
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(links, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'factory-portal-links.json';
  a.click();
});

document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try{
      const parsed = JSON.parse(reader.result);
      const importedLinks = normalizeLinks(parsed);
      if(await persistLinks(importedLinks)) alert(t('importSuccess'));
    }catch(err){
      alert(t('invalidFile', {message:messageForError(err)}));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('languageSelect').addEventListener('change', event => {
  language = event.target.value;
  localStorage.setItem('factoryPortalLanguage_v1', language);
  applyLanguage();
});

applyTheme();
applyLanguage();
