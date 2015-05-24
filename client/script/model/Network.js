/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import Channel from './Channel';
import {Some, None} from 'option-t';

export default class Network {
    /**
     *  @constructor
     *  @param  {Object}    raw
     */
    constructor(raw) {
        /** @type   {string}    */
        this.id = String(raw.id);

        /** @type   {string}    */
        this.nickname = raw.nick;

        const channelList = raw.channels.map(function(item){
            const channel = new Channel(item);
            return channel;
        });

        /** @type   {Array<Channel>} */
        this._channelList = channelList;
    }

    /**
     *  @deprecated
     *  @return {string}
     */
    get nick() {
        return this.nickname;
    }

    /**
     *  @deprecated
     *  @return {Array<Channel>}
     */
    get channels() {
        return this.getChannelList();
    }

    /**
     *  @return {Array<Channel>}
     */
    getChannelList() {
        return this._channelList;
    }

    /**
     *  @param  {number}    channelId
     *  @return {!OptionT<Channel>}
     */
    getChannelById(channelId) {
        let result = new None();
        for (const channel of this._channelList) {
            // XXX: babel transforms this for-of to try-catch-finally.
            // So we returns here, it start to do 'finally' block
            // and supress to return a value in for-of block.
            if (channel.id === channelId) {
                result = new Some(channel);
                break;
            }
        }

        return result;
    }

    /**
     *  @return {void}
     */
    quit() {
    }
}
