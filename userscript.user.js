// ==UserScript==
// @name         Youtube no multiple autoplay
// @namespace    icosferu
// @version      1.0
// @description  try to take over the world!
// @author       icosferu
// @updateURL    https://github.com/icosferu/youtube-autoplay-mutex/raw/main/userscript.user.js
// @match        https://*.youtube.com/*
// @run-at       document-end
// ==/UserScript==

(async function() {
    'use strict';

    const id = '' + Date.now() + Math.random();

    const channel = new BroadcastChannel('extension-icosferu');
    let playing = new Set();
    let playing_self;

    channel.addEventListener('message', (e) => {

        if (e.data === 'new') {
            channel.postMessage({id, playing: playing_self});
        } else {

            let {id} = e.data;

            if (e.data.playing) {
                playing.add(id);
            } else {
                playing.delete(id);
            }
        }
    });

    channel.postMessage('new');


    let video = document.querySelector('.html5-main-video');
    video.addEventListener('playing', block, true);

    video.addEventListener('playing',() => {

        channel.postMessage({id, playing: true});
        playing_self = true;
    }, true);

    video.addEventListener('pause', () => {

        channel.postMessage({id, playing: false});
        playing_self = false;
    });


    async function block (e) {

        if (playing.size) {
            e.target.pause();
        }
    }

    function unblock () {
        video.removeEventListener('playing', block, true);
    }

    document.addEventListener('keydown', unblock, true);
    document.addEventListener('mousedown', unblock, true);
})();
