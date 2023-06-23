
/**
 * 
 * @param {number} startAt 
 * @param {number} speed 
 * @param {string} text 
 * @param {HTMLElement} node 
 */
export default function typeWriter(
     startAt = 0,
     speed = 50,
     text = 'Lorem ipsum dummy text blabla.',
     node
) {

     /**
      * @type {number}
      */
     let timeoutId = null;

     /**
      * @type {Array<Function>}
      */
     const onEnd = [];

     /**
      * @type {Array<Function>}
      */
     const onType = [];

     return {

          start() {


               if (startAt < text.length) {

                    onType.forEach(callback => callback());

                    node.innerText += text.charAt(startAt);

                    startAt++;

                    timeoutId = setTimeout(this.start.bind(this), speed);

               } else {

                    onEnd.forEach(callback => callback());

               }
          },

          stop() {

               clearTimeout(timeoutId);
          },

          /**
           * 
           * @param {Function} callback 
           */
          onEnd(callback) {

               onEnd.push(callback);
          },

          /**
          * 
          * @param {Function} callback 
          */
          onType(callback) {

               onType.push(callback);
          },


          /**
           * 
           * @param {number} start 
           */
          setStart(start) {

               startAt = start;
          }


     }
}