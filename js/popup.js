// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');

    // ストレージから現在の状態を読み込む
    chrome.storage.sync.get(['isEnabled'], function(result) {
        toggleSwitch.checked = result.isEnabled || false;
    });

    // トグルスイッチの変更イベント
    toggleSwitch.addEventListener('change', () => {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.sync.set({ isEnabled: isEnabled }, function() {
            console.log('X_block is ' + (isEnabled ? 'enabled' : 'disabled'));
            // コンテンツスクリプトにメッセージを送信して状態を更新
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const activeTab = tabs[0];
                if (activeTab.url.startsWith('https://chrome.google.com/webstore') || activeTab.url.startsWith('chrome://extensions/')) {
                    console.log('Message not sent to webstore tab');
                    return;
                }
                chrome.tabs.sendMessage(activeTab.id, { action: isEnabled ? 'enable' : 'disable' })
                .then(response => {
                    console.log(response.status);
                })
                .catch(error => {
                    console.error('Error sending message to content script:', error);
                });
            });
        });
    });
});