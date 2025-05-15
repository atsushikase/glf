let startX, startY;
let offsetX = 0, offsetY = 0;
let viewWidth, viewHeight;  // 画面表示域の幅と高さ
let viewBoxX, viewBoxY;     // svg画像のどの位置を画面表示域の左上にするか
let svgWidth, svgHeight;    // svg画像全体の幅と高さ
//let scale = 1; // 拡大縮小用のスケール変数 画像サイズ*拡大*倍率
let scaleI = 0; // 拡大縮小用のスケール変数 段階
const scaleIMax = 10; // 拡大の最大
const scaleIMin = -10; // 拡大の最小
const scaleC = 1.1; // 拡大縮小１段階の拡大率
let isDragging = false;
let lastTouchDistance = null; // スマホのピンチイン・ピンチアウト

// const mapImage = document.getElementById("map-image"); // jpegの場合？
const mapImage = document.querySelector("#map-image"); /* svgの場合：querySelector では "map-image" をタグ名として扱ってしまうため、#が必要*/

// const mapContainer = document.getElementById("map-container"); // jpegの場合？
const mapContainer = document.querySelector("#map-container"); // 表示エリアのコンテナ svgの場合：
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");

// SVGのサイズを取得(拡大縮小の適用後のサイズ)
function getSvgSize() {
    const bbox = mapImage.getBoundingClientRect();
    return { width: bbox.width, height: bbox.height };
}

// SVG再描画（ドラッグ時や拡大縮小時に使う）
function updateTransform() {
    mapImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleC**scaleI})`;
}

// ドラッグ開始
function startDrag(e) {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
    svg.style.cursor = "grabbing";
}

// ドラッグ移動
function moveDrag(e) {
    if (!isDragging) return;
    
    e.preventDefault(); // スクロールを防止
    
    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;

    let dx = clientX - startX;
    let dy = clientY - startY;

    let newX = offsetX + dx;
    let newY = offsetY + dy;

    // SVGサイズを取得して境界を計算
    const { width, height } = getSvgSize(); //拡大縮小適用後のサイズ
    // let maxOffsetX = (width * scale - container.clientWidth) / 2;
    // let maxOffsetY = (height * scale - container.clientHeight) / 2;
    // let maxOffsetX = (width * (scaleC**scaleI) - mapContainer.clientWidth) / 2;
    // let maxOffsetY = (height * (scaleC**scaleI) - mapContainer.clientHeight) / 2;
    let maxOffsetX = (width - mapContainer.clientWidth) / 2;
    let maxOffsetY = (height - mapContainer.clientHeight) / 2;

    offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, newX));
    offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, newY));

    startX = clientX;
    startY = clientY;

    updateTransform();
}
// document.addEventListener("pointermove", (e) => {
//     if (!isDragging) return;

//     let dx = e.clientX - startX;
//     let dy = e.clientY - startY;

//     let newX = offsetX + dx;
//     let newY = offsetY + dy;

//     // SVGサイズを取得して境界を計算
//     const { width, height } = getSvgSize();
//     // let maxOffsetX = (width * (scaleC**scaleI) - mapContainer.clientWidth) / 2;
//     // let maxOffsetY = (height * (scaleC**scaleI) - mapContainer.clientHeight) / 2;
//     let maxOffsetX = (width - mapContainer.clientWidth) / 2;
//     let maxOffsetY = (height - mapContainer.clientHeight) / 2;

//     offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, newX));
//     offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, newY));
    
//     startX = e.clientX;
//     startY = e.clientY;
//     updateTransform();
// });

// ドラッグ終了
function endDrag() {
    isDragging = false;
    svg.style.cursor = "grab";
}

// ブラウザのデフォルト機能である画像のドラッグ禁止の解除を設定
mapImage.addEventListener("dragstart", (event) => event.preventDefault());

// mapImage.addEventListener("mousedown", (e) => { // PC専用であってスマホでは効かない
// mapImage.addEventListener("pointerdown", (e) => { // PC・スマホ両方に効く
//     isDragging = true;
//     startX = e.clientX;
//     startY = e.clientY;
//     mapImage.style.cursor = "grabbing";
// });
//mapImage.addEventListener("pointerdown", startDrag);
mapImage.addEventListener("mousedown", startDrag);
mapImage.addEventListener("touchstart", startDrag);

document.addEventListener("mousemove", moveDrag);
document.addEventListener("touchmove", moveDrag, { passive: false }); // スクロール防止
// document.addEventListener("pointermove", moveDrag);
// document.addEventListener("pointermove", moveDrag, { passive: false }); // スクロール防止。{ passive: false }は、スマホにだけ必要な処理。問題があるようならイベントを mousemoveとtouchmoveに分け、touchmoveだけにする。
// 【Copilot解説】通常、touchmove イベントはスマホやタブレットで発生すると、デフォルトで画面のスクロールが行われます。これを防ぐためには event.preventDefault() を実行する必要があります。しかし、多くのモダンブラウザでは、スクロールのパフォーマンスを最適化するために passive イベントリスナーを採用しており、デフォルトでは event.preventDefault() を適用できません。
// そのため、{ passive: false } を指定すると、ブラウザが 「このイベントでは preventDefault() を使用することがある」 と認識し、適用できるようになります。

// document.addEventListener("mouseup", () => {
// document.addEventListener("pointerup", () => {
//     isDragging = false;
//     mapImage.style.cursor = "grab";
// });
//document.addEventListener("pointerup", endDrag);
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);
    
// ズームボタンイベント
zoomInButton.addEventListener("click", () => {
    scaleI += 1;        // 拡大
    scaleI = Math.min(Math.max(scaleI, scaleIMin), scaleIMax);
    updateTransform();
});
zoomOutButton.addEventListener("click", () => {
    scaleI -= 1;        // 拡大
    scaleI = Math.min(Math.max(scaleI, scaleIMin), scaleIMax);
    updateTransform();
});

// **マウスホイールで拡大縮小**
mapImage.addEventListener("wheel", (e) => { e.preventDefault();
    if (e.deltaY < 0) {
        scaleI += 1;        // 拡大
    } else {
        scaleI -= 1;        // 縮小
    }
    // 最小・最大制限
    scaleI = Math.min(Math.max(scaleI, scaleIMin), scaleIMax);
    // updateViewBox();
    updateTransform();
});

mapImage.addEventListener("touchmove", (e) => {
    if (e.touches.length < 2) return; // 2本指以上のタッチが必要
    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    // 2点間の距離を計算
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

    //if (lastTouchDistance != null) {
    //    if (e.deltaY < 0) {
    if (Math.abs(distance - lastTouchDistance) > 2) {
        if (distance - lastTouchDistance > 0) {
            scaleI += 0.2;        // 拡大
        } else {
            scaleI -= 0.2;        // 縮小
        }
        // 最小・最大制限
        scaleI = Math.min(Math.max(scaleI, scaleIMin), scaleIMax);
        // updateViewBox();
        updateTransform();
        
        lastTouchDistance = distance;
    }
});

mapImage.addEventListener("touchend", () => {
    lastTouchDistance = null;
});
