import {jsdom} from 'jsdom';
// this adds the ability to change the dom size when testing components that render 
// differently for different dom sizes
const documentHTML = '<!doctype html><html><body><div id="root"></div></body></html>';
global.document = jsdom(documentHTML);
global.window = document.parentWindow;

global.window.resizeTo = (width, height) => {
    global.window.innerWidth = width || global.window.innerWidth;
    global.window.innerHeight = height || global.window.innerHeight;
    global.window.dispatchEvent(new Event('resize'));
};
