import typeWriter from './typeWriter.js';
import { Display } from './Display.js';

const title = document.querySelector('.title');
const blinker = document.querySelector('.blinker');
const viewport = document.querySelector('.viewport');

const display = new Display(viewport);

display.load().then(() => {

     const writer = typeWriter(0, 150, 'Sicaro.io', title);

     writer.start();

     writer.onEnd(() => {

          blinker.classList.add('active');
     });

     display.update();
}); 