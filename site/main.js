const motionButton = document.querySelector('.motion');
const rain = document.querySelector('.rain');
const pieces = [
  ['apricot', 20, 32, 11, -4], ['raisin', 37, 17, 14, -9], ['kiwi', 90, 39, 13, -2],
  ['apricot', 82, 21, 16, -10], ['raisin', 11, 19, 13, -6], ['kiwi', 65, 23, 18, -12]
];
for (const [fruit, left, size, seconds, delay] of pieces) {
  const image = document.createElement('img');
  image.src = 'assets/rain/' + fruit + '.png';
  image.alt = '';
  image.style.cssText = '--left:'+left+'%;--size:'+size+'px;--time:'+seconds+'s;--delay:'+delay+'s';
  rain.append(image);
}
function setMotion(enabled) {
  document.body.dataset.motion = enabled ? 'on' : 'off';
  motionButton.setAttribute('aria-pressed', String(enabled));
  motionButton.textContent = enabled ? 'Ⅱ  Остановить движение' : '▷  Включить движение';
}
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
setMotion(!motionPreference.matches);
motionPreference.addEventListener('change', event => setMotion(!event.matches));
motionButton.addEventListener('click', () => setMotion(document.body.dataset.motion !== 'on'));

