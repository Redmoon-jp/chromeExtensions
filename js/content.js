// content.js

// スクリプトの読み込み確認
console.log('content.js loaded');

// ストレージから現在の状態を取得し、適用する
chrome.storage.sync.get(['isEnabled'], function(result) {
    if (result.isEnabled) {
        enableXBlock();
    } else {
        disableXBlock();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.isEnabled) {
        if (changes.isEnabled.newValue) {
            enableXBlock();
        } else {
            disableXBlock();
        }
    }
});

function enableXBlock() {
    console.log('X_block enabled');
    // ページの変更を監視する MutationObserver を設定
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                removeNonJapaneseReplies();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 初回実行
    removeNonJapaneseReplies();

    // observer を保持
    window.xBlockObserver = observer;
}

function disableXBlock() {
    console.log('X_block disabled');
    if (window.xBlockObserver) {
        window.xBlockObserver.disconnect();
        window.xBlockObserver = null;
    }
    // 無効化された要素を再表示
    const hiddenDivs = document.querySelectorAll('div[data-hidden-by-xblock="true"]');
    hiddenDivs.forEach(div => {
        div.style.display = '';
        div.removeAttribute('data-hidden-by-xblock');
    });
}

function removeNonJapaneseReplies() {
    console.log('Running removeNonJapaneseReplies');
    // すべての div[dir="auto"] 要素を取得
    const autoDivs = document.querySelectorAll('div[dir="auto"]');
    console.log(`Found ${autoDivs.length} div[dir="auto"] elements`);

    autoDivs.forEach(autoDiv => {
        const lang = autoDiv.getAttribute('lang');
        console.log('Checking div:', autoDiv, 'lang:', lang);
        // lang属性が 'ja' 以外であるか確認
        if (lang && lang !== 'ja') {
            console.log('Found non-Japanese div:', autoDiv);
            // 親の div.css-175oi2r.r-1igl3o0.r-qklmqi.r-1adg3ll.r-1ny4l3l を取得
            const parentDiv = autoDiv.closest('div.css-175oi2r.r-1igl3o0.r-qklmqi.r-1adg3ll.r-1ny4l3l');
            if (parentDiv) {
                // 親の div を無効化（非表示）
                console.log('Hiding parent div:', parentDiv);
                parentDiv.style.display = 'none';
                parentDiv.setAttribute('data-hidden-by-xblock', 'true');
            } else {
                console.log('Parent div not found for:', autoDiv);
            }
        }
    });
}

// メッセージを受け取ってON/OFFを切り替える
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'enable') {
        enableXBlock();
    } else if (request.action === 'disable') {
        disableXBlock();
    }
    sendResponse({ status: 'done' });
});