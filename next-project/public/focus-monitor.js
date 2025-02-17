// public/focus-monitor.js

class FocusMonitor {
    constructor() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.warningThreshold = 1; // 1分の猶予時間
      this.channel = new BroadcastChannel('learnlooper_focus');
      this.lastWarningTime = null;
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      // visibilitychangeでタブの表示状態を監視
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleFocus();
        } else {
          this.handleBlur();
        }
      });
      // 補助的にwindowのfocus/blurも監視
      window.addEventListener('focus', () => this.handleFocus());
      window.addEventListener('blur', () => this.handleBlur());
      // ページロード時は離脱時間をリセット
      window.addEventListener('load', () => {
        this.leaveTime = null;
      });
      // ブロードキャストチャンネルからの受信
      this.channel.onmessage = (event) => this.handleChannelMessage(event);
    }
  
    handleFocus() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab focused');
      // タブに戻った瞬間、即座にSNS警告を送信
      this.broadcastWarning('sns');
      // 非アクティブ時間が１分以上ならlongAbsence警告を送信
      if (this.leaveTime) {
        const timeDiff = Date.now() - this.leaveTime;
        if (timeDiff >= this.warningThreshold * 60 * 1000) {
          this.broadcastWarning('longAbsence');
        }
      }
      // 離脱時刻をリセット
      this.leaveTime = null;
    }
  
    handleBlur() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab blurred');
      this.leaveTime = Date.now();
    }
  
    broadcastWarning(type) {
      if (this.canSendWarning()) {
        console.log('[FocusMonitor] Broadcasting warning:', type);
        this.channel.postMessage({
          type: 'FOCUS_WARNING',
          warningType: type
        });
        this.lastWarningTime = Date.now();
      }
    }
  
    canSendWarning() {
      if (!this.lastWarningTime) return true;
      return Date.now() - this.lastWarningTime >= 5000; // 5秒間隔
    }
  
    handleChannelMessage(event) {
      console.log('[FocusMonitor] Received channel message:', event.data);
    }
  
    enable() {
      this.isEnabled = true;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Enabled');
    }
  
    disable() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Disabled');
    }
  }
  
  // グローバルインスタンスの作成
  window.focusMonitor = new FocusMonitor();
  