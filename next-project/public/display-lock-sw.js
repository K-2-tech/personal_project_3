const CHECK_INTERVAL = 5000;
const ALLOWED_DOMAIN = 'learnlooper.app';

const SNS_DOMAINS = [
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'linkedin.com',
  'youtube.com',
  'line.me',
  'pinterest.com',
  'reddit.com'
];

let isEnabled = false;
let leaveTime = null;
let warningThreshold = 10;
let lastWarningTime = null;

// デバッグ用のログ関数
const log = (message, data = {}) => {
  console.log(`[SW] ${message}`, data);
};

// Service Workerのインストール
self.addEventListener('install', (event) => {
  log('Service Worker installed');
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// メインスレッドからのメッセージを受け取る
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  log('Received message', { type, data });
  
  switch (type) {
    case 'INITIALIZE':
      isEnabled = data.isEnabled;
      warningThreshold = data.warningThreshold;
      log('Initialized with', { isEnabled, warningThreshold });
      break;
      
    case 'UPDATE_STATE':
      isEnabled = data.isEnabled;
      if (!isEnabled) {
        leaveTime = null;
        lastWarningTime = null;
      }
      log('State updated', { isEnabled });
      break;
  }
});

// ドメインチェック関数
function checkDomain(hostname) {
  return SNS_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
}

// メッセージを送信できるかチェック
function canSendWarning() {
  if (!lastWarningTime) return true;
  return Date.now() - lastWarningTime >= 5000; // 最小間隔は5秒
}

// 警告メッセージを送信
async function sendWarning(type, snsUrl = '') {
  if (!canSendWarning()) return;
  
  lastWarningTime = Date.now();
  const clients = await self.clients.matchAll();
  const message = {
    type: 'DISPLAY_LOCK_WARNING',
    warningType: type,
    snsUrl
  };
  
  log('Sending warning', message);
  clients.forEach(client => client.postMessage(message));
}

// アクティブなタブの状態をチェックする関数
async function checkTabState() {
  if (!isEnabled) {
    log('DisplayLock is disabled, skipping check');
    return;
  }

  try {
    const clients = await self.clients.matchAll();
    const currentTime = Date.now();
    
    // アクティブなタブを探す
    let activeClient = null;
    for (const client of clients) {
      if (client.focused) {
        activeClient = client;
        break;
      }
    }

    if (!activeClient) {
      log('No active tab found');
      return;
    }

    const activeUrl = new URL(activeClient.url);
    log('Active tab', { url: activeUrl.hostname, focused: activeClient.focused });

    // LearnLooperがアクティブな場合
    if (activeUrl.hostname === ALLOWED_DOMAIN) {
      log('LearnLooper is active, resetting leave time');
      leaveTime = null;
      return;
    }

    // SNSサイトがアクティブな場合
    if (checkDomain(activeUrl.hostname)) {
      log('SNS site is active, sending warning');
      await sendWarning('sns', activeUrl.hostname);
      return;
    }

    // その他のサイトがアクティブな場合
    if (!leaveTime) {
      log('First time leaving LearnLooper');
      leaveTime = currentTime;
    } else {
      const timeDiff = currentTime - leaveTime;
      const thresholdMs = warningThreshold * 60 * 1000;
      
      if (timeDiff >= thresholdMs) {
        log('Long absence detected', { timeDiff, threshold: thresholdMs });
        await sendWarning('longAbsence');
      }
    }
  } catch (error) {
    console.error('Error in checkTabState:', error);
  }
}

// 定期的なチェックの開始
setInterval(checkTabState, CHECK_INTERVAL);