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

/// <reference path="../../../../node_modules/rx/ts/rx.all.es6.d.ts" />
/// <reference path="../../../../tsd/third_party/react/react.d.ts" />

import * as React from 'react';
import * as Rx from 'rx';

import {ChatWindowItem} from './ChatWindowItem';

import {ChannelDomain} from '../../domain/ChannelDomain';

export class MessageContentViewController {

    private _element: Element;
    private _disposer: Rx.IDisposable;

    constructor(domain: ChannelDomain) {
        const fragment: Node = <Node>createChannelFragment(domain);
        this._element = <Element>fragment.firstChild;

        const disposer: Rx.CompositeDisposable = new Rx.CompositeDisposable();
        this._disposer = disposer;
    }

    dispose(): void {
        this._disposer.dispose();
        this._disposer = null;
        this._element = null;
    }

    getElement(): Element {
        return this._element;
    }
}

function createChannelFragment(domain: ChannelDomain): DocumentFragment {
    const reactTree = React.createElement(ChatWindowItem, {
        channel: domain.getValue(),
    });
    const html = React.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    return fragment;
}