// public/display-lock-sw.js
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

// タブの状態をチェックする関数
async function checkTabState() {
  if (!isEnabled) {
    log('DisplayLock is disabled, skipping check');
    return;
  }

  const clients = await self.clients.matchAll();
  log('Found clients', { count: clients.length });

  const currentTime = Date.now();
  let isLearnLooperActive = false;
  let hasSNSTab = false;
  let snsUrl = '';

  for (const client of clients) {
    const url = new URL(client.url);
    log('Checking client', { url: url.hostname, focused: client.focused });
    
    if (url.hostname === ALLOWED_DOMAIN) {
      if (client.focused) {
        isLearnLooperActive = true;
        leaveTime = null;
        log('LearnLooper tab is active');
      }
    } else if (checkDomain(url.hostname)) {
      hasSNSTab = true;
      snsUrl = url.hostname;
      log('SNS tab detected', { snsUrl });
    }
  }

  // 警告メッセージの送信判定
  if (isEnabled) {
    if (hasSNSTab) {
      log('Sending SNS warning', { snsUrl });
      notifyClients('sns', snsUrl);
    } else if (!isLearnLooperActive) {
      if (!leaveTime) {
        leaveTime = currentTime;
        log('First time leaving LearnLooper');
        notifyClients('default');
      } else {
        const timeDiff = currentTime - leaveTime;
        if (timeDiff >= warningThreshold * 60 * 1000) {
          log('Long absence detected', { timeDiff });
          notifyClients('longAbsence');
        }
      }
    }
  }
}

// クライアントに通知を送信する関数
async function notifyClients(warningType, snsUrl = '') {
  const clients = await self.clients.matchAll();
  const message = {
    type: 'DISPLAY_LOCK_WARNING',
    warningType,
    snsUrl
  };
  
  log('Sending notification to clients', { message, clientCount: clients.length });
  
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// 定期的なチェックの開始
setInterval(checkTabState, CHECK_INTERVAL);