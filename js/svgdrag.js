// const mapImage = document.getElementById("map-image"); // jpegの場合？
const mapImage = document.querySelector("#map-image"); /* svgの場合：querySelector では "map-image" をタグ名として扱ってしまうため、#が必要*/

// const mapContainer = document.getElementById("map-container"); // jpegの場合？
const mapContainer = document.querySelector("#map-container"); // 表示エリアのコンテナ svgの場合：

let isDragging = false;
// let startX, startY, initialX, initialY;
let startX, startY;
let viewWidth, viewHeight;  // 画面表示域の幅と高さ
let viewBoxX, viewBoxY;     // svg画像のどの位置を画面表示域の左上にするか
let svgWidth, svgHeight;    // svg画像全体の幅と高さ
let scale = 1; // 拡大縮小用のスケール変数 数字の倍率で画像サイズが*拡大*される

// **viewBox 更新関数**
function updateViewBox() {  //SVGにおけるViewBoxのWidth/Heightは、ViewPort右下の座標の表示位置を指す？（超わかりにくい）
    // console.log("X",viewBoxX," Y",viewBoxY," W/s",Math.floor(svgWidth/scale)," H/s",Math.floor(svgHeight/scale)," s",Math.floor(scale*10)/10);
    mapImage.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${svgWidth / scale} ${svgHeight / scale}`);
}

// **初回表示時に中央配置**
window.addEventListener("load", () => {
    const rect = mapImage.getBoundingClientRect();
    svgWidth = rect.width;
    svgHeight = rect.height;

    // 画面表示領域の幅と高さを取得
    updateViewBoxSize();

    // **中央位置を計算**
    viewBoxX = (svgWidth - viewWidth) / 2;
    viewBoxY = (svgHeight - viewHeight) / 2;
    // viewBoxX = 0;
    // viewBoxY = 0;
    if (viewBoxX < 0) viewBoxX = 0; // 左端が切れるまでドラッグしたらそれ以上いかないようにする
    if (viewBoxY < 0) viewBoxY = 0; // 上端が切れるまでドラッグしたらそれ以上いかないようにする

    updateViewBox();
});

// 画面表示領域の幅と高さを取得
function updateViewBoxSize() {
    const containerRect = mapContainer.getBoundingClientRect();
    viewWidth = containerRect.width;
    viewHeight = containerRect.height;
}
// 画面表示領域の幅と高さを取得
function updateViewBoxXY() {
    if (svgWidth > viewWidth) {
        if (viewBoxX > svgWidth - viewWidth) viewBoxX = svgWidth - viewWidth; // 右端制限
    } else {
        if (viewBoxX > 0) viewBoxX = 0; // 左端が切れるまでドラッグしたらそれ以上いかないようにする
    }
    if (svgHeight > viewHeight) {
        if (viewBoxY > svgHeight - viewHeight) viewBoxY = svgHeight - viewHeight; // 下端制限
    } else {
        if (viewBoxY > 0) viewBoxY = 0; // 上端が切れるまでドラッグしたらそれ以上いかないようにする
    }
    // Math.sqrt(scale)は正確ではなく、表示がおかしくなるのだが、正しい計算がわからない。近似値として利用している
    // if (viewBoxX > svgWidth * Math.sqrt(scale) - viewWidth) viewBoxX = svgWidth * Math.sqrt(scale) - viewWidth; // 右端制限
    // if (viewBoxY > svgHeight * Math.sqrt(scale) - viewHeight) viewBoxY = svgHeight * Math.sqrt(scale) - viewHeight; // 下端制限
}
// ブラウザリサイズ時に `viewBox` を更新
window.addEventListener("resize", () => {
    updateViewBoxSize(); 
    updateViewBoxXY();
    updateViewBox();
});
// ブラウザのデフォルト機能である画像のドラッグ禁止の解除を設定
mapImage.addEventListener("dragstart", (event) => event.preventDefault());

// mapImage.addEventListener("mousedown", (e) => { // PC専用であってスマホでは効かない
mapImage.addEventListener("pointerdown", (e) => { // PC・スマホ両方に効く
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    mapImage.style.cursor = "grabbing";
});

// document.addEventListener("mousemove", (e) => {
document.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    viewBoxX -= dx;
    viewBoxY -= dy;
    if (viewBoxX < 0) viewBoxX = 0; // 左端が切れるまでドラッグしたらそれ以上いかないようにする
    if (viewBoxY < 0) viewBoxY = 0; // 上端が切れるまでドラッグしたらそれ以上いかないようにする
    updateViewBoxXY();

    // updateViewBoxSize(); // `viewBox` の幅と高さを反映しつつスクロール
    updateViewBox();

    startX = e.clientX;
    startY = e.clientY;
});

// document.addEventListener("mouseup", () => {
document.addEventListener("pointerup", () => {
    isDragging = false;
    mapImage.style.cursor = "grab";
});

// **マウスホイールで拡大縮小**
mapImage.addEventListener("wheel", (e) => { e.preventDefault();
    const zoomFactor = 0.1; // ズーム倍率
    if (e.deltaY < 0) {
        scale *= 1 + zoomFactor;        // 拡大 (1+ZF)倍にする
    } else {
        scale *= 1 - zoomFactor;        // 縮小
    }

    // 最小・最大制限
    scale = Math.min(Math.max(scale, 0.5), 3);

    updateViewBox();
});

// **スマホのピンチイン・ピンチアウト**
let lastTouchDistance = null;

mapImage.addEventListener("touchmove", (e) => {
    if (e.touches.length < 2) return; // 2本指以上のタッチが必要
    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    // 2点間の距離を計算
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

    if (lastTouchDistance != null) {
        const zoomFactor = 0.05;
        if (distance > lastTouchDistance) {
            scale *= 1 + zoomFactor;            // 拡大
        } else {
            scale *= 1 - zoomFactor;            // 縮小
        }

        // 最小・最大制限
        scale = Math.min(Math.max(scale, 0.5), 3);

        updateViewBox();
    }

    lastTouchDistance = distance;
});

mapImage.addEventListener("touchend", () => {
    lastTouchDistance = null;
});
