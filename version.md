# コマンド
バージョンアップしてパッチ（バグ修正）バージョンに＋１してください。0.0.1→0.0.2
@version.md  に更新内容を追記
githubにpush



# バージョン履歴

## v1.0.9 (2025-01-18)
- 2本指タップでぶくぶく機能が動作しない問題を修正
- 2本指タップ用フラグ（isTwoFingerTapping）を追加
- updateBubblingState()に2本指タップを反映
- 2本指タップでspace長押しと同じようにぶくぶく状態になるように修正

## v1.0.8 (2025-01-18)
- デバッグ用アラートをconsole.logに変更（2本指タップ検知時のアラート削除）

## v1.0.7 (2025-01-18)
- 2本指タップ機能の修正（iOS対応）
- CSSによるタッチ干渉の排除（body, #webcam-container, canvasにtouch-action: none等を追加）
- NodoguroGameクラスの初期化確認処理を追加（init()関数内）
- デバッグ用アラートを追加（2本指タップ検知時に表示）

## v1.0.6 (2025-01-18)
- index.htmlの完全書き直し（HTML構造の簡素化）
- webcam-containerとlabel-containerを確実に配置
- JavaScriptを</body>の直前に配置（DOM読み込み後に実行）
- init関数の処理順序を修正（カメラ起動をAIモデル読み込みより先に実行）
- webcam-containerの存在確認を最初に実行（nullなら即座に停止）
- エラーハンドリングを統一（alert("Error: " + error.message)）
- iOS/Androidでの「カメラ要素が見つからない」エラーの根本修正

## v1.0.5 (2025-01-18)
- init関数のグローバルスコープ定義（window.init）で確実に参照可能に
- label-containerの動的作成機能を追加（自己修復ロジック）
- すべてのlabelContainer.appendChild()呼び出しを安全化（null参照エラー防止）
- 重複するcatchブロックを削除して構造を整理
- カメラ要素が見つからないエラーとinit関数未定義エラーの修正

## v1.0.4 (2025-01-18)
- スタートボタンの確実な動作（複数イベントタイプ対応：click/touchend/touchstart）
- init()関数冒頭にアラート追加（「カメラ起動プロセス開始」）
- vConsoleの条件付き表示（URLパラメータ?dev=trueで制御）
- デバッグモードでのみ詳細ログを表示するように改善

## v1.0.3 (2025-01-18)
- ID不一致と早期リターンの修正
- webcam-containerの動的作成機能を追加
- ボタンイベントの改善（デバッグ用alert追加）
- camera.jsのスキップロジックを修正

## v1.0.2 (2025-01-18)
- vConsole（デバッグツール）の導入
- エラーハンドリングの強化（Alert表示）
- ライブラリ読み込み待機チェックの追加

## v1.0.1 (2025-01-18)
- タイトルから「統合画面」を削除

## v1.0.0
- 初回リリース


