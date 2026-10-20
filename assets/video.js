(function () {
  const wrap = document.getElementById("video-wrap");
  const pin = document.getElementById("video-pin");
  if (!wrap || !pin) return;
  const apply = () => {
    wrap.classList.toggle("pinned", pin.checked);
    localStorage.setItem("videoPinned", pin.checked ? "1" : "0");
  };
  pin.checked = localStorage.getItem("videoPinned") === "1";
  pin.onchange = apply;
  apply();
})();
