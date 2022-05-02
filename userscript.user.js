// ==UserScript==
// @name         Youtube autoplay mutex
// @namespace    icosferu
// @version      1.0
// @description  no autoplay when another tab is playing
// @author       icosferu
// @updateURL    https://github.com/icosferu/youtube-autoplay-mutex/raw/main/userscript.user.js
// @match        https://*.youtube.com/*
// @run-at       document-end
// ==/UserScript==

(async function() {
    'use strict';

    const id = '' + Date.now() + Math.random();

    const channel = new BroadcastChannel('extension-icosferu');
    let playing = new Map();
    let playing_self;

    channel.addEventListener('message', (e) => {

        if (e.data === 'new') {
            channel.postMessage({id, playing: playing_self, title: document.title});
        } else {

            let {id, title} = e.data;

            if (e.data.playing) {
                playing.set(id, title);
            } else {
                playing.delete(id);
            }
        }
    });

    channel.postMessage('new');


    let video = document.querySelector('.html5-main-video');

    video.addEventListener('playing', () => {

        clearTimeout(stalled);
        channel.postMessage({id, playing: true});
        playing_self = true;
    }, true);

    let stalled;

    video.addEventListener('stalled', () => {
        stalled = setTimeout(stop, 5000);
    });


    function stop () {

        channel.postMessage({id, playing: false});
        playing_self = false;
    }

    video.addEventListener('pause', stop);
    video.addEventListener('ended', stop);
    addEventListener('beforeunload', stop);

    let check = () => !playing.size || history.length > 1 || performance.getEntriesByType('navigation').at(-1).type === 'reload'
                   || [...playing.values(), document.title].every(v => v.toLowerCase().includes('asmr'));

    function checker () {
        if (!check()) {
            video.pause();
        }
    }

    video.addEventListener('playing', checker);

    function unblock () {
        video.removeEventListener('playing', checker);
    }

    document.addEventListener('keydown', unblock, true);
    document.addEventListener('mousedown', unblock, true);
})();
