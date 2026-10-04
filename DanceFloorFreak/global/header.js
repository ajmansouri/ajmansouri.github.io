document.addEventListener("DOMContentLoaded", function() {
    const leftTT = document.getElementById("turntable-left");
    const rightTT = document.getElementById("turntable-right");

    // Drop in left turntable
    setTimeout(() => {
        if (leftTT) leftTT.classList.remove("turntable-hidden");
    }, 200);

    // Drop in right turntable
    setTimeout(() => {
        if (rightTT) rightTT.classList.remove("turntable-hidden");
    }, 450);
});
function toggleMainSound() {
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('sound-btn');

    if (!audio) return;

    if (audio.paused) {
        audio.play().then(() => {
            btn.textContent = '🔇 Mute Sound';
        }).catch(err => {
            console.log("Audio play blocked by browser:", err);
        });
    } else {
        audio.pause();
        btn.textContent = '🔊 Enable Sound';
    }
}