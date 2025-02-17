// public/focus-monitor.js

class FocusMonitor {
    constructor() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.warningThreshold = 1; // 1分の猶予時間（分）
      this.channel = new BroadcastChannel('learnlooper_focus');
      this.lastWarningTime = null;
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      // ページ遷移イベント
      window.addEventListener('pageshow', this.handleFocus.bind(this));
      window.addEventListener('pagehide', this.handleBlur.bind(this));
      // visibilitychange イベント
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleFocus();
        } else {
          this.handleBlur();
        }
      });
      // 補助的に focus/blur イベント
      window.addEventListener('focus', this.handleFocus.bind(this));
      window.addEventListener('blur', this.handleBlur.bind(this));
      // ブロードキャストチャンネルからの受信
      this.channel.onmessage = (event) => this.handleChannelMessage(event);
    }
  
    handleFocus() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Focus/pageshow triggered');
      // タブがアクティブになった瞬間、即座にSNS警告を送信
      this.broadcastWarning('sns');
      // 非アクティブ状態が threshold を超えていた場合、longAbsence 警告を送信
      if (this.leaveTime) {
        const timeDiff = Date.now() - this.leaveTime;
        if (timeDiff >= this.warningThreshold * 60 * 1000) {
          this.broadcastWarning('longAbsence');
        }
      }
      this.leaveTime = null;
    }
  
    handleBlur() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Blur/pagehide triggered');
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
  