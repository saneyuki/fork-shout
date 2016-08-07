/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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
import * as assert from 'assert';

import {ExIterable, FiniteConsumerMemoizeBuffer} from '../ExIterable';

class HelperIterable<T> implements Iterable<T> {

    private _source: Iterable<T>;
    private _onNext: (v: IteratorResult<T>) => void;
    private _onAfterFinish: (() => void) | void;

    constructor(src: Iterable<T>, onNext: (v: IteratorResult<T>) => void, onAfterFinish: (() => void) | void = undefined) {
        this._source = src;
        this._onNext = onNext;
        this._onAfterFinish = onAfterFinish;
    }

    [Symbol.iterator](): Iterator<T> {
        const src = this._source[Symbol.iterator]();
        const iter = new HelperIterator(src, this._onNext, this._onAfterFinish);
        return iter;
    }
}

class HelperIterator<T> implements Iterator<T> {

    private _source: Iterator<T>;
    private _onNext: (v: IteratorResult<T>) => void;
    private _onAfterFinish: (() => void) | void;

    constructor(src: Iterator<T>, onNext: (v: IteratorResult<T>) => void, onAfterFinish: (() => void) | void = undefined)  {
        this._source = src;
        this._onNext = onNext;
        this._onAfterFinish = onAfterFinish;
    }

    next(): IteratorResult<T> {
        const result: IteratorResult<T> = this._source.next();
        this._onNext(result);

        if (result.done && (this._onAfterFinish !== undefined)) {
            this._onAfterFinish();
        }

        return result;
    }
}

function getIterator<T>(s: Iterable<T>): Iterator<T> {
    return s[Symbol.iterator]();
}

describe('ExIterable', function () {
    describe('create()', function () {
        let isCalledNext = false;

        before(function () {
            const src = new HelperIterable([1, 2, 3], () => {
                isCalledNext = true;
            });
            const iter = ExIterable.create(src);
            iter;
        });

        it('don\'t evaluate immidiately on creating an instance', () => {
            assert.strictEqual(isCalledNext, false);
        });
    });

    describe('forEach()', function () {
        describe('simple iteration', function () {
            const src = [1, 2, 3];
            const result: Array<number> = [];

            before(function () {
                const iter = ExIterable.create(src);
                iter.forEach((v) => {
                    result.push(v);
                });
            });

            it('iterate all values in source', () => {
                assert.deepStrictEqual(result, src);
            });
        });

        describe('iterate from zero per iteration', function () {
            class Helper {
                private _i: number;
                constructor(seed: number) {
                    this._i = seed;
                }
                value() {
                    return this._i;
                }
                increment() {
                    this._i = this._i + 1;
                }
            }

            const firstSeq: Array<number> = [];
            const secondSeq: Array<number> = [];

            before(function(){
                const src = [0, 1, 2].map((i) => new Helper(i));
                const iter = ExIterable.create(src);
                iter.forEach((v) => {
                    v.increment();
                    firstSeq.push( v.value() );
                });
                iter.forEach((v) => {
                    v.increment();
                    secondSeq.push( v.value() );
                });
            });

            it('first iteration', function () {
                assert.deepStrictEqual(firstSeq, [1, 2, 3]);
            });

            it('second iteration', function () {
                assert.deepStrictEqual(secondSeq, [2, 3, 4]);
            });
        });
    });

    describe('for-of statement', function () {
        describe('simple iteration', function () {
            const src = [1, 2, 3];
            const result: Array<number> = [];

            before(function () {
                const iter = ExIterable.create(src);

                for (const v of iter) {
                    result.push(v);
                }
            });

            it('iterate all values in source', () => {
                assert.deepStrictEqual(result, src);
            });
        });

        describe('iterate from zero per iteration', function () {
            class Helper {
                private _i: number;
                constructor(seed: number) {
                    this._i = seed;
                }
                value() {
                    return this._i;
                }
                increment() {
                    this._i = this._i + 1;
                }
            }

            const firstSeq: Array<number> = [];
            const secondSeq: Array<number> = [];

            before(function(){
                const src = [0, 1, 2].map((i) => new Helper(i));
                const iter = ExIterable.create(src);
                for (const v of iter) {
                    v.increment();
                    firstSeq.push( v.value() );
                }

                for (const v of iter) {
                    v.increment();
                    secondSeq.push( v.value() );
                }
            });

            it('first iteration', function () {
                assert.deepStrictEqual(firstSeq, [1, 2, 3]);
            });

            it('second iteration', function () {
                assert.deepStrictEqual(secondSeq, [2, 3, 4]);
            });
        });
    });

    describe('map()', function () {
        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).filter(() => true);
                const iter = getIterator(src);
                result1 = iter.next().done;
                result2 = iter.next().done;
            });

            it('the 1st time should be expected', () => {
                assert.deepStrictEqual(result1, true);
            });

            it('the 2nd time should be expected', () => {
                assert.deepStrictEqual(result2, true);
            });
        });

        describe('iteration', () => {
            const resultSeq: Array<number> = [];
            const indexSeq: Array<number> = [];

            before(function () {
                const iter = ExIterable.create([0, 1, 2])
                    .map((v, i) => {
                        indexSeq.push(i);
                        return v + 1;
                    });
                iter.forEach((v) => {
                    resultSeq.push(v);
                });
            });

            it('expected result sequence', function () {
                assert.deepStrictEqual(resultSeq, [1, 2, 3]);
            });

            it('expected index sequence', function () {
                assert.deepStrictEqual(indexSeq, [0, 1, 2]);
            });
        });
    });

    describe('flatMap()', function () {
        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).flatMap(() => []);
                const iter = getIterator(src);
                result1 = iter.next().done;
                result2 = iter.next().done;
            });

            it('the 1st time should be expected', () => {
                assert.deepStrictEqual(result1, true);
            });

            it('the 2nd time should be expected', () => {
                assert.deepStrictEqual(result2, true);
            });
        });

        describe('basic iteration', function () {
            const resultSeq: Array<number> = [];
            const indexSeq: Array<number> = [];

            class ThreeCount implements IterableIterator<number> {
                private readonly _begin: number;
                private _index: number;

                constructor(begin: number) {
                    this._begin = begin;
                    this._index = 0;
                }

                next(): IteratorResult<number> {
                    if (this._index > 2) {
                        return {
                            done: true,
                            value: -1,
                        };
                    }
                    else {
                        const count = this._index++;
                        const next = this._begin + count;
                        return {
                            done: false,
                            value: next,
                        };
                    }
                }

                [Symbol.iterator](): IterableIterator<number> {
                    return this;
                }
            }

            before(function () {
                const iter = ExIterable.create([1, 4, 7])
                    .flatMap((v, i) => {
                        indexSeq.push(i);
                        return new ThreeCount(v);
                    });
                iter.forEach((v) => {
                    resultSeq.push(v);
                });
            });

            it('expected result sequence', function () {
                assert.deepStrictEqual(resultSeq, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
            });

            it('expected index sequence', function () {
                assert.deepStrictEqual(indexSeq, [0, 1, 2]);
            });
        });
    });

    describe('filter()', function () {
        describe('generic case', function () {
            describe('don\'t re-iterate again after completed', () => {
                let result1: boolean;
                let result2: boolean;

                before(() => {
                    const src = ExIterable.create([]).filter(() => true);
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });
            });

            describe('iteration', () => {
                const resultSeq: Array<number> = [];
                const indexSeq: Array<number> = [];

                before(function () {
                    const iter = ExIterable.create([0, 1, 2, 3, 4])
                        .filter((v, i) => {
                            indexSeq.push(i);
                            return (v % 2 === 0);
                        });
                    iter.forEach((v) => {
                        resultSeq.push(v);
                    });
                });

                it('expected result sequence', function () {
                    assert.deepStrictEqual(resultSeq, [0, 2, 4]);
                });

                it('expected index sequence', function () {
                    assert.deepStrictEqual(indexSeq, [0, 1, 2, 3, 4]);
                });
            });
        });

        describe('specialized map()', function () {
            describe('don\'t re-iterate again after completed', () => {
                let result1: boolean;
                let result2: boolean;

                before(() => {
                    const src = ExIterable.create([])
                        .filter((_) => true)
                        .map((_) => {});
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });
            });

            describe('iteration', () => {
                const resultSeq: Array<number> = [];
                const indexSeqOfFilter: Array<number> = [];
                const mapSeqOfFilter: Array<number> = [];

                before(function () {
                    const iter = ExIterable.create([0, 1, 2, 3, 4])
                        .filter((v, i) => {
                            indexSeqOfFilter.push(i);
                            return (v % 2 === 0);
                        })
                        .map((v, i) => {
                            mapSeqOfFilter.push(i);
                            return v + 1;
                        });

                    iter.forEach((v) => {
                        resultSeq.push(v);
                    });
                });

                it('expected result sequence', function () {
                    assert.deepStrictEqual(resultSeq, [1, 3, 5]);
                });

                it('expected filter()\'s index sequence', function () {
                    assert.deepStrictEqual(indexSeqOfFilter, [0, 1, 2, 3, 4]);
                });

                it('expected the following map()\'s index sequence', function () {
                    assert.deepStrictEqual(mapSeqOfFilter, [0, 1, 2]);
                });
            });
        });
    });

    describe('do()', function () {
        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).do(() => {});
                const iter = getIterator(src);
                result1 = iter.next().done;
                result2 = iter.next().done;
            });

            it('the 1st time should be expected', () => {
                assert.deepStrictEqual(result1, true);
            });

            it('the 2nd time should be expected', () => {
                assert.deepStrictEqual(result2, true);
            });
        });

        describe('simple case', () => {
            const resultSeq: Array<number> = [];
            const indexSeq: Array<number> = [];

            before(function () {
                const iter = ExIterable.create([0, 1, 2])
                    .do((v, i) => {
                        indexSeq.push(i);
                        return String(v);
                    });
                iter.forEach((v) => {
                    resultSeq.push(v);
                });
            });

            it('expected result sequence', function () {
                assert.deepStrictEqual(resultSeq, [0, 1, 2]);
            });

            it('expected index sequence', function () {
                assert.deepStrictEqual(indexSeq, [0, 1, 2]);
            });
        });
    });

    describe('memoize()', function () {
        describe('without consumer limitation', () => {
            describe('don\'t re-iterate again after completed', () => {
                let result1: boolean;
                let result2: boolean;

                before(() => {
                    const src = ExIterable.create([]).memoize();
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });
            });

            describe('simple case', function () {
                const resultSeq1: Array<number> = [];
                const resultSeq2: Array<number> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2])
                        .map(() => Math.random());
                    const iter = ExIterable.create(src).memoize();

                    iter.forEach((v) => {
                        resultSeq1.push(v);
                    });

                    iter.forEach((v) => {
                        resultSeq2.push(v);
                    });
                });

                it('expected result 1 & 2 sequence', function () {
                    assert.deepStrictEqual(resultSeq1, resultSeq2);
                });
            });

            describe('call `next()` from some iterator by turns', function () {
                function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                    return function () {
                        const result = i.next();
                        target.push(result);
                    };
                }

                let iter1: Iterator<number>;
                let iter2: Iterator<number>;
                let iter3: Iterator<number>;

                const seq1: Array<IteratorResult<number>> = [];
                const seq2: Array<IteratorResult<number>> = [];
                const seq3: Array<IteratorResult<number>> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2, 3, 4])
                        .map((v) => v + Math.random());
                    const iterable = ExIterable.create(src).memoize();
                    iter1 = getIterator(iterable);
                    iter2 = getIterator(iterable);
                    iter3 = getIterator(iterable);

                    const pushTo1 = pushToArray(iter1, seq1);
                    const pushTo2 = pushToArray(iter2, seq2);
                    const pushTo3 = pushToArray(iter3, seq3);

                    iter1.next();
                    iter3.next();
                    iter2.next();

                    pushTo1();
                    pushTo2();
                    pushTo3();

                    pushTo3();
                    pushTo2();
                    pushTo1();

                    pushTo1();
                    pushTo3();
                    pushTo2();

                    pushTo2();
                    pushTo1();
                    pushTo3();

                    pushTo2();
                    pushTo3();
                    pushTo1();

                    pushTo3();
                    pushTo1();
                    pushTo2();
                });

                it('iter1 & iter2 are different', function () {
                    assert.notStrictEqual(iter1, iter2);
                });

                it('iter1 & iter3 are different', function () {
                    assert.notStrictEqual(iter1, iter3);
                });

                it('iter2 & iter3 are different', function () {
                    assert.notStrictEqual(iter2, iter3);
                });

                it('seq1 & seq2 are same', function() {
                    assert.deepStrictEqual(seq1, seq2);
                });

                it('seq1 & seq3 are same', function() {
                    assert.deepStrictEqual(seq1, seq3);
                });

                it('seq2 & seq3 are same', function() {
                    assert.deepStrictEqual(seq2, seq3);
                });
            });
        });
        describe('with consumer limitation is larger than actual consumer', () => {
            describe('don\'t re-iterate again after completed', () => {
                const CONSUMER_LIMIT = 3;
                let result1: boolean;
                let result2: boolean;

                before(() => {
                    const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });
            });

            describe('simple case', function () {
                const CONSUMER_LIMIT = 3;
                const resultSeq1: Array<number> = [];
                const resultSeq2: Array<number> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2])
                        .map(() => Math.random());
                    const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                    iter.forEach((v) => {
                        resultSeq1.push(v);
                    });

                    iter.forEach((v) => {
                        resultSeq2.push(v);
                    });
                });

                it('expected result 1 & 2 sequence', function () {
                    assert.deepStrictEqual(resultSeq1, resultSeq2);
                });
            });

            describe('call `next()` from some iterator by turns', function () {
                function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                    return function () {
                        const result = i.next();
                        target.push(result);
                    };
                }

                const CONSUMER_LIMIT = 4;
                let iter1: Iterator<number>;
                let iter2: Iterator<number>;
                let iter3: Iterator<number>;

                const seq1: Array<IteratorResult<number>> = [];
                const seq2: Array<IteratorResult<number>> = [];
                const seq3: Array<IteratorResult<number>> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2, 3, 4])
                        .map((v) => v + Math.random());
                    const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                    iter1 = getIterator(iterable);
                    iter2 = getIterator(iterable);
                    iter3 = getIterator(iterable);

                    const pushTo1 = pushToArray(iter1, seq1);
                    const pushTo2 = pushToArray(iter2, seq2);
                    const pushTo3 = pushToArray(iter3, seq3);

                    iter1.next();
                    iter3.next();
                    iter2.next();

                    pushTo1();
                    pushTo2();
                    pushTo3();

                    pushTo3();
                    pushTo2();
                    pushTo1();

                    pushTo1();
                    pushTo3();
                    pushTo2();

                    pushTo2();
                    pushTo1();
                    pushTo3();

                    pushTo2();
                    pushTo3();
                    pushTo1();

                    pushTo3();
                    pushTo1();
                    pushTo2();
                });

                it('iter1 & iter2 are different', function () {
                    assert.notStrictEqual(iter1, iter2);
                });

                it('iter1 & iter3 are different', function () {
                    assert.notStrictEqual(iter1, iter3);
                });

                it('iter2 & iter3 are different', function () {
                    assert.notStrictEqual(iter2, iter3);
                });

                it('seq1 & seq2 are same', function() {
                    assert.deepStrictEqual(seq1, seq2);
                });

                it('seq1 & seq3 are same', function() {
                    assert.deepStrictEqual(seq1, seq3);
                });

                it('seq2 & seq3 are same', function() {
                    assert.deepStrictEqual(seq2, seq3);
                });
            });
        });
        describe('with consumer limitation is same with actual consumer', () => {
            describe('don\'t re-iterate again after completed', () => {
                const CONSUMER_LIMIT = 2;
                let result1: boolean;
                let result2: boolean;

                before(() => {
                    const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });
            });

            describe('simple case', function () {
                const CONSUMER_LIMIT = 2;
                const resultSeq1: Array<number> = [];
                const resultSeq2: Array<number> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2])
                        .map(() => Math.random());
                    const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                    iter.forEach((v) => {
                        resultSeq1.push(v);
                    });

                    iter.forEach((v) => {
                        resultSeq2.push(v);
                    });
                });

                it('expected result 1 & 2 sequence', function () {
                    assert.deepStrictEqual(resultSeq1, resultSeq2);
                });
            });

            describe('call `next()` from some iterator by turns', function () {
                function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                    return function () {
                        const result = i.next();
                        target.push(result);
                    };
                }

                const CONSUMER_LIMIT = 3;
                let iter1: Iterator<number>;
                let iter2: Iterator<number>;
                let iter3: Iterator<number>;

                const seq1: Array<IteratorResult<number>> = [];
                const seq2: Array<IteratorResult<number>> = [];
                const seq3: Array<IteratorResult<number>> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2, 3, 4])
                        .map((v) => v + Math.random());
                    const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                    iter1 = getIterator(iterable);
                    iter2 = getIterator(iterable);
                    iter3 = getIterator(iterable);

                    const pushTo1 = pushToArray(iter1, seq1);
                    const pushTo2 = pushToArray(iter2, seq2);
                    const pushTo3 = pushToArray(iter3, seq3);

                    iter1.next();
                    iter3.next();
                    iter2.next();

                    pushTo1();
                    pushTo2();
                    pushTo3();

                    pushTo3();
                    pushTo2();
                    pushTo1();

                    pushTo1();
                    pushTo3();
                    pushTo2();

                    pushTo2();
                    pushTo1();
                    pushTo3();

                    pushTo2();
                    pushTo3();
                    pushTo1();

                    pushTo3();
                    pushTo1();
                    pushTo2();
                });

                it('iter1 & iter2 are different', function () {
                    assert.notStrictEqual(iter1, iter2);
                });

                it('iter1 & iter3 are different', function () {
                    assert.notStrictEqual(iter1, iter3);
                });

                it('iter2 & iter3 are different', function () {
                    assert.notStrictEqual(iter2, iter3);
                });

                it('seq1 & seq2 are same', function() {
                    assert.deepStrictEqual(seq1, seq2);
                });

                it('seq1 & seq3 are same', function() {
                    assert.deepStrictEqual(seq1, seq3);
                });

                it('seq2 & seq3 are same', function() {
                    assert.deepStrictEqual(seq2, seq3);
                });
            });
        });
        describe('with consumer limitation is smaller than actual consumer', () => {
            describe('don\'t re-iterate again after completed', () => {
                const CONSUMER_LIMIT = 1;
                let result1: boolean;
                let result2: boolean;
                let error3: Error;

                before(() => {
                    const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
                    const iter = getIterator(src);
                    result1 = iter.next().done;
                    result2 = iter.next().done;

                    try {
                        getIterator(src);
                    }
                    catch (e) {
                        error3 = e;
                    }
                });

                it('the 1st time should be expected', () => {
                    assert.deepStrictEqual(result1, true);
                });

                it('the 2nd time should be expected', () => {
                    assert.deepStrictEqual(result2, true);
                });

                it('expected error3 instance', () => {
                    assert.strictEqual(error3 instanceof RangeError, true);
                });

                it('expected error3 message', () => {
                    assert.strictEqual(error3.message, 'this has been reached the consumer limit');
                });
            });

            describe('simple case', function () {
                const CONSUMER_LIMIT = 2;
                const resultSeq1: Array<number> = [];
                const resultSeq2: Array<number> = [];
                let error3: Error;

                before(function () {
                    const src = ExIterable.create([0, 1, 2])
                        .map(() => Math.random());
                    const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                    iter.forEach((v) => {
                        resultSeq1.push(v);
                    });

                    iter.forEach((v) => {
                        resultSeq2.push(v);
                    });

                    try {
                        iter.forEach((_) => {});
                    }
                    catch (e) {
                        error3 = e;
                    }
                });

                it('expected result 1 & 2 sequence', function () {
                    assert.deepStrictEqual(resultSeq1, resultSeq2);
                });

                it('expected error3 instance', () => {
                    assert.strictEqual(error3 instanceof RangeError, true);
                });

                it('expected error3 message', () => {
                    assert.strictEqual(error3.message, 'this has been reached the consumer limit');
                });
            });

            describe('call `next()` from some iterator by turns', function () {
                function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                    return function () {
                        const result = i.next();
                        target.push(result);
                    };
                }

                const CONSUMER_LIMIT = 3;
                let iter1: Iterator<number>;
                let iter2: Iterator<number>;
                let iter3: Iterator<number>;
                let error4: Error;

                const seq1: Array<IteratorResult<number>> = [];
                const seq2: Array<IteratorResult<number>> = [];
                const seq3: Array<IteratorResult<number>> = [];

                before(function () {
                    const src = ExIterable.create([0, 1, 2, 3, 4])
                        .map((v) => v + Math.random());
                    const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                    iter1 = getIterator(iterable);
                    iter2 = getIterator(iterable);
                    iter3 = getIterator(iterable);

                    try {
                        getIterator(iterable);
                    }
                    catch (e) {
                        error4 = e;
                    }

                    const pushTo1 = pushToArray(iter1, seq1);
                    const pushTo2 = pushToArray(iter2, seq2);
                    const pushTo3 = pushToArray(iter3, seq3);

                    iter1.next();
                    iter3.next();
                    iter2.next();

                    pushTo1();
                    pushTo2();
                    pushTo3();

                    pushTo3();
                    pushTo2();
                    pushTo1();

                    pushTo1();
                    pushTo3();
                    pushTo2();

                    pushTo2();
                    pushTo1();
                    pushTo3();

                    pushTo2();
                    pushTo3();
                    pushTo1();

                    pushTo3();
                    pushTo1();
                    pushTo2();
                });

                it('iter1 & iter2 are different', function () {
                    assert.notStrictEqual(iter1, iter2);
                });

                it('iter1 & iter3 are different', function () {
                    assert.notStrictEqual(iter1, iter3);
                });

                it('iter2 & iter3 are different', function () {
                    assert.notStrictEqual(iter2, iter3);
                });

                it('seq1 & seq2 are same', function() {
                    assert.deepStrictEqual(seq1, seq2);
                });

                it('seq1 & seq3 are same', function() {
                    assert.deepStrictEqual(seq1, seq3);
                });

                it('seq2 & seq3 are same', function() {
                    assert.deepStrictEqual(seq2, seq3);
                });

                it('expected error4 instance', () => {
                    assert.strictEqual(error4 instanceof RangeError, true);
                });

                it('expected error4 message', () => {
                    assert.strictEqual(error4.message, 'this has been reached the consumer limit');
                });
            });
        });
        describe('with consumer limitation is 0', () => {
            describe('to call memoize()', () => {
                let error: RangeError;
                before(() => {
                    try {
                        ExIterable.create([]).memoize(0);
                    }
                    catch (e) {
                        error = e;
                    }
                });

                it('should be expected error', () => {
                    assert.strictEqual(error instanceof RangeError, true);
                });

                it('should be expected message', () => {
                    assert.strictEqual(error.message, 'consumer limit must be larger than 0');
                });
            });
        });

        describe('return() with consumer limitation', () => {
            const CONSUMER_LIMIT = 3;

            const EXPECTED_VAL = 1;
            let iter3: Iterator<number>;
            let result: IteratorResult<number>;

            before(() => {
                const src = ExIterable.create([0, 1, 2])
                    .memoize(CONSUMER_LIMIT);
                src.forEach(() => {}); // consume once.

                const iter2 = getIterator(src);
                result = iter2.return!(EXPECTED_VAL);

                iter3 = getIterator(src);
            });

            it('should be the expected result.done', () => {
                assert.deepStrictEqual(result.done, true);
            });

            it('should be the expected result.value', () => {
                assert.deepStrictEqual(result.value, EXPECTED_VAL);
            });

            it('should clear internal buffer\'s ref count', () => {
                // XXX: for testing to internal resource leak.
                const buffer: FiniteConsumerMemoizeBuffer<number> = (iter3 as any)._buffer; // tslint:disable-line:no-any
                assert.strictEqual(buffer.consumers, 1);
            });

            it('should clear internal list holded by buffer count', () => {
                // XXX: for testing to internal resource leak.
                const buffer: FiniteConsumerMemoizeBuffer<number> = (iter3 as any)._buffer; // tslint:disable-line:no-any
                const internalMap: Map<number, { count: number }> = (buffer as any)._data; // tslint:disable-line:no-any
                const state = Array.from(internalMap.values(), (v) => v.count);

                // in this test, iter3 still alive.
                assert.deepStrictEqual(state, [1, 1, 1]);
            });
        });
    });

    describe('scan()', () => {
        describe('don\'t re-iterate again after completed', () => {
            let result1: IteratorResult<number>;
            let result2: IteratorResult<number>;

            before(() => {
                const src = ExIterable.create([0, 1]).scan((acc: number, current: number) => {
                    return acc + current;
                }, 0);
                const iter = getIterator(src);
                iter.next();
                iter.next();

                result1 = iter.next();
                result2 = iter.next();
            });

            it('the 1st time should be done', () => {
                assert.strictEqual(result1.done, true);
            });

            it('the 1st time should return the final value', () => {
                assert.strictEqual(result1.value, 1);
            });

            it('the 2nd time should be done', () => {
                assert.strictEqual(result2.done, true);
            });

            it('the 2nd time should not return the final value for gc', () => {
                assert.strictEqual(result2.value, undefined);
            });
        });

        describe('simple iteration', () => {
            const valueSeq: Array<number> = [];
            const accSeq: Array<number> = [];
            const indexSeq: Array<number> = [];
            const resultSeq: Array<number> = [];

            before(() => {
                const src = ExIterable.create([0, 1, 2, 3, 4]).scan((acc: number, value: number, index: number) => {
                    valueSeq.push(value);
                    accSeq.push(acc);
                    indexSeq.push(index);

                    return value;
                }, 0);
                src.forEach((v: number) => {
                    resultSeq.push(v);
                });
            });

            it('valueSeq', () => {
                assert.deepStrictEqual(valueSeq, [0, 1, 2, 3, 4]);
            });

            it('accSeq', () => {
                assert.deepStrictEqual(accSeq, [0, 0, 1, 2, 3]);
            });

            it('indexSeq', () => {
                assert.deepStrictEqual(indexSeq, [0, 1, 2, 3, 4]);
            });

            it('resultSeq', () => {
                assert.deepStrictEqual(resultSeq, [0, 1, 2, 3, 4]);
            });
        });
    });

    describe('buffer()', () => {
        describe('buffer size is 0', () => {
            let err: Error;
            before(() => {
                try {
                    ExIterable.create([]).buffer(0);
                }
                catch (e) {
                    err = e;
                }
            });

            it('should be expected instance', () => {
                assert.strictEqual(err instanceof RangeError, true);
            });

            it('should be expected message', () => {
                assert.strictEqual(err.message, 'buffer size must be larger than 0');
            });
        });

        describe('buffer size is larger than the source sequence', () => {
            let result1: IteratorResult<Array<number>>;
            let result2: IteratorResult<Array<number>>;
            before(() => {
                const seed = [0, 1, 2];
                const src = ExIterable.create(seed).buffer(seed.length + 1);
                const iter = getIterator(src);

                result1 = iter.next();
                result2 = iter.next();
            });

            it('1st result should not be completed', () => {
                assert.strictEqual(result1.done, false);
            });

            it('1st result should contains all sequence', () => {
                assert.deepStrictEqual(result1.value, [0, 1, 2]);
            });

            it('2nd result should be completed', () => {
                assert.strictEqual(result2.done, true);
            });

            it('2nd result should be undefined', () => {
                assert.strictEqual(result2.value, undefined);
            });
        });

        describe('buffer size is same with the source sequence', () => {
            let result1: IteratorResult<Array<number>>;
            let result2: IteratorResult<Array<number>>;
            before(() => {
                const seed = [0, 1, 2];
                const src = ExIterable.create(seed).buffer(seed.length);
                const iter = getIterator(src);

                result1 = iter.next();
                result2 = iter.next();
            });

            it('1st result should not be completed', () => {
                assert.strictEqual(result1.done, false);
            });

            it('1st result should contains all sequence', () => {
                assert.deepStrictEqual(result1.value, [0, 1, 2]);
            });

            it('2nd result should be completed', () => {
                assert.strictEqual(result2.done, true);
            });

            it('2nd result should be undefined', () => {
                assert.strictEqual(result2.value, undefined);
            });
        });

        describe('buffer size is smaller than the source sequence', () => {
            describe('without the rest', () => {
                let result1: IteratorResult<Array<number>>;
                let result2: IteratorResult<Array<number>>;
                let result3: IteratorResult<Array<number>>;
                let result4: IteratorResult<Array<number>>;

                before(() => {
                    const seed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    const src = ExIterable.create(seed).buffer(3);
                    const iter = getIterator(src);

                    result1 = iter.next();
                    result2 = iter.next();
                    result3 = iter.next();
                    result4 = iter.next();
                });

                it('1st result should not be completed', () => {
                    assert.strictEqual(result1.done, false);
                });

                it('1st result should contains all sequence', () => {
                    assert.deepStrictEqual(result1.value, [1, 2, 3]);
                });

                it('2nd result should not be completed', () => {
                    assert.strictEqual(result2.done, false);
                });

                it('2nd result should contains all sequence', () => {
                    assert.deepStrictEqual(result2.value, [4, 5, 6]);
                });

                it('3rd result should not be completed', () => {
                    assert.strictEqual(result3.done, false);
                });

                it('3rd result should contains all sequence', () => {
                    assert.deepStrictEqual(result3.value, [7, 8, 9]);
                });

                it('4th result should be completed', () => {
                    assert.strictEqual(result4.done, true);
                });

                it('4th result should be undefined', () => {
                    assert.strictEqual(result4.value, undefined);
                });
            });

            describe('with the rest', () => {
                let result1: IteratorResult<Array<number>>;
                let result2: IteratorResult<Array<number>>;
                let result3: IteratorResult<Array<number>>;
                let result4: IteratorResult<Array<number>>;
                let result5: IteratorResult<Array<number>>;

                before(() => {
                    const seed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                    const src = ExIterable.create(seed).buffer(3);
                    const iter = getIterator(src);

                    result1 = iter.next();
                    result2 = iter.next();
                    result3 = iter.next();
                    result4 = iter.next();
                    result5 = iter.next();
                });

                it('1st result should not be completed', () => {
                    assert.strictEqual(result1.done, false);
                });

                it('1st result should contains all sequence', () => {
                    assert.deepStrictEqual(result1.value, [1, 2, 3]);
                });

                it('2nd result should not be completed', () => {
                    assert.strictEqual(result2.done, false);
                });

                it('2nd result should contains all sequence', () => {
                    assert.deepStrictEqual(result2.value, [4, 5, 6]);
                });

                it('3rd result should not be completed', () => {
                    assert.strictEqual(result3.done, false);
                });

                it('3rd result should contains all sequence', () => {
                    assert.deepStrictEqual(result3.value, [7, 8, 9]);
                });

                it('4th result should be completed', () => {
                    assert.strictEqual(result4.done, false);
                });

                it('4th result should be undefined', () => {
                    assert.deepStrictEqual(result4.value, [10]);
                });

                it('5th result should be completed', () => {
                    assert.strictEqual(result5.done, true);
                });

                it('5th result should be undefined', () => {
                    assert.deepStrictEqual(result5.value, undefined);
                });
            });
        });

        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).buffer(3);
                const iter = getIterator(src);
                result1 = iter.next().done;
                result2 = iter.next().done;
            });

            it('the 1st time should be expected', () => {
                assert.strictEqual(result1, true);
            });

            it('the 2nd time should be expected', () => {
                assert.strictEqual(result2, true);
            });
        });
    });
});
