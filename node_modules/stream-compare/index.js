/**
 * @copyright Copyright 2016 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

'use strict';

const {EventEmitter} = require('events');
const util = require('util');

const debug = util.debuglog('stream-compare');

/** Comparison type.
 * @enum {string}
 * @private
 */
const CompareType = {
  /** A full (non-incremental) comparison. */
  checkpoint: 'checkpoint',
  /** An incremental comparison. */
  incremental: 'incremental',
  /** A full comparison followed by <code>'end'</code>. */
  last: 'last'
};

/** Defines the available read policies.
 * @enum {string}
 */
const ReadPolicy = {
  /** Reads are done concurrently using <code>'data'</code> events. */
  flowing: 'flowing',
  /** Reads from the stream which has output the least data, measured in
   * bytes/chars for non-<code>objectMode</code> or values for
   * <code>objectMode</code>. */
  least: 'least',
  /** No reads are done.  When using this readPolicy, be sure to either add
   * <code>'data'</code> to events, add other <code>'data'</code> listeners,
   * <code>.read()</code> the data elsewhere, or call <code>.resume()</code> on
   * the streams so that the data will be read and <code>'end'</code> can be
   * reached. */
  none: 'none'
};

/** Default option values.
 * @const
 * @private
 */
const DEFAULT_OPTIONS = {
  abortOnError: false,
  delay: 0,
  endEvents: ['end', 'error'],
  // Observe Readable events other than 'data' by default
  events: ['close', 'end', 'error'],
  objectMode: false,
  /** @type {!ReadPolicy} */
  readPolicy: 'least'
};

/** Caller-visible stream state for comparison.
 *
 * Guarantees/Invariants:
 *
 * <ul>
 * <li>Equivalent states are {@link assert.deepStrictEqual}.</li>
 * <li>States can be round-tripped to JSON at any point.</li>
 * <li>States are owned by the caller, so any additional properties (which are
 *   permitted to violate the above guarantees) are preserved and the same
 *   state object is always returned.</li>
 * </ul>
 *
 * <p>As a result, objects of this class have no methods and do not contain any
 * non-state information (e.g. the stream itself or the comparison options)
 * and their prototype is never used.</p>
 *
 * @constructor
 */
function StreamState() {
  /** Has the stream emitted <code>'end'</code> or <code>'error'</code>. */
  this.ended = false;
  /** Events emitted by the stream.
   * @type !Array.<!{name: string, args: !Array}> */
  this.events = [];
  /** Data returned/emitted by the stream (as an <code>Array</code> if in
   * <code>objectMode</code>).
   * @type Array|Buffer|string */
  this.data = undefined;
  /** Count of total objects read in <code>objectMode</code>, bytes/chars read
   * otherwise. */
  this.totalDataLen = 0;
}

/** Options for {@link streamCompare}.
 *
 * @ template CompareResult
 * @typedef {{
 *   abortOnError: boolean|undefined,
 *   compare: ((function(!StreamState,!StreamState): CompareResult)|undefined),
 *   delay: number|undefined,
 *   endEvents: Array<string>|undefined,
 *   events: Array<string>|undefined,
 *   incremental:
 *     ((function(!StreamState,!StreamState): CompareResult)|undefined),
 *   objectMode: boolean|undefined,
 *   readPolicy: ReadPolicy|undefined
 * }} StreamCompareOptions
 * @property {boolean=} abortOnError Abort comparison and return error emitted
 * by either stream.  (default: <code>false</code>)
 * @property {function(!StreamState,!StreamState)=} compare Comparison function
 * which will be called with a StreamState object for each stream, after both
 * streams have ended.  The value returned by this function will resolve the
 * returned promise and be passed to the callback as its second argument.  A
 * value thrown by this function will reject the promise and be passed to the
 * callback as its first argument.  This function is required if incremental is
 * not specified.
 * @property {number=} delay Additional delay (in ms) after streams end before
 * comparing.  (default: <code>0</code>)
 * @property {Array<string>=} endEvents Names of events which signal the end of
 * a stream.  Final compare is performed once both streams have emitted an end
 * event.  (default: <code>['end', 'error']</code>)
 * @property {Array<string>=} events Names of events to compare.
 * (default: <code>['close', 'end', 'error']</code>)
 * @property {function(!StreamState,!StreamState)=} incremental Incremental
 * comparison function which will be called periodically with a StreamState
 * object for each stream.  This function may modify the StreamState objects to
 * remove data not required for later comparisons (e.g. common output) and may
 * perform the comparison before the streams have ended (e.g. due to early
 * differences).  Any non-null, non-undefined value returned by this function
 * will finish the comparison, resolve the returned promise, and be passed to
 * the callback as its second argument. A value thrown by this function will
 * finish the comparison, reject the promise and be passed to the callback as
 * its first argument.  If compare is not specified, this function will also be
 * called for the final comparison.
 * @property {boolean=} objectMode Collect values read into an Array.  This
 * allows comparison of read values without concatenation and comparison of
 * non-string/Buffer types.
 * @property {ReadPolicy=} readPolicy Scheduling discipline for reads from th
 * streams.  (default: <code>'least'</code>)
 */
// var StreamCompareOptions;

/** Promise returned by {@link streamCompare}.
 *
 * @ template CompareResult
 * @constructor
 * @name StreamComparePromise
 * @extends Promise<CompareResult>
 */
// var StreamComparePromise;

/** Compares the output of two Readable streams.
 *
 * @ template CompareResult
 * @param {!stream.Readable} stream1 First stream to compare.
 * @param {!stream.Readable} stream2 Second stream to compare.
 * @param {!StreamCompareOptions<CompareResult>|
 * function(!StreamState,!StreamState): CompareResult}
 * optionsOrCompare Options, or a comparison function (as described in
 * {@link options.compare}).
 * @return {StreamComparePromise<CompareResult>} A <code>Promise</code> with
 * the comparison result or error.
 */
function streamCompare(stream1, stream2, optionsOrCompare) {
  let options;
  if (optionsOrCompare) {
    if (typeof optionsOrCompare === 'function') {
      options = {compare: optionsOrCompare};
    } else if (typeof optionsOrCompare === 'object') {
      options = optionsOrCompare;
    } else {
      throw new TypeError('optionsOrCompare must be an object or function');
    }
  }

  options = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!options.compare) {
    options.compare = options.incremental;
  }

  // Can change this to duck typing if there are non-EventEmitter streams
  if (!(stream1 instanceof EventEmitter)) {
    throw new TypeError('stream1 must be an EventEmitter');
  }
  // Can change this to duck typing if there are non-EventEmitter streams
  if (!(stream2 instanceof EventEmitter)) {
    throw new TypeError('stream2 must be an EventEmitter');
  }
  if (options.readPolicy === 'least'
      && (typeof stream1.read !== 'function'
       || typeof stream2.read !== 'function')) {
    throw new TypeError('streams must have .read() for readPolicy \'least\'');
  }
  if (typeof options.compare !== 'function') {
    throw new TypeError('options.compare must be a function');
  }
  if (!options.endEvents
      || typeof options.endEvents !== 'object'
      || options.endEvents.length !== Math.floor(options.endEvents.length)) {
    throw new TypeError('options.endEvents must be Array-like');
  }
  options.endEvents = Array.prototype.slice.call(options.endEvents);
  if (!options.events
      || typeof options.events !== 'object'
      || options.events.length !== Math.floor(options.events.length)) {
    throw new TypeError('options.events must be Array-like');
  }
  options.events = Array.prototype.slice.call(options.events);
  if (options.incremental && typeof options.incremental !== 'function') {
    throw new TypeError('options.incremental must be a function');
  }
  if (typeof options.readPolicy !== 'string') {
    throw new TypeError('options.readPolicy must be a string');
  }
  if (!hasOwnProperty.call(ReadPolicy, options.readPolicy)) {
    throw new RangeError(`Invalid options.readPolicy '${
      options.readPolicy}'`);
  }

  let reject;
  let resolve;
  const promise = new Promise(((resolveArg, rejectArg) => {
    resolve = resolveArg;
    reject = rejectArg;
  }));
  const state1 = new StreamState();
  const state2 = new StreamState();
  let ended = 0;
  let isDone = false;
  const listeners1 = {};
  const listeners2 = {};
  let postEndImmediate;
  let postEndTimeout;

  /** Gets the name of a stream for logging purposes.
   * @private
   */
  function streamName(stream) {
    return stream === stream1 ? 'stream1'
      : stream === stream2 ? 'stream2'
        : 'unknown stream';
  }

  function done(err, result) {
    isDone = true;

    debug('Unregistering stream event listeners...');

    Object.keys(listeners1).forEach((eventName) => {
      stream1.removeListener(eventName, listeners1[eventName]);
    });
    stream1.removeListener('readable', readNext);
    stream1.removeListener('error', onStreamError);
    stream1.removeListener('end', readNextOnEnd);
    options.endEvents.forEach((eventName) => {
      stream1.removeListener(eventName, endListener1);
    });

    Object.keys(listeners2).forEach((eventName) => {
      stream2.removeListener(eventName, listeners2[eventName]);
    });
    stream2.removeListener('readable', readNext);
    stream2.removeListener('error', onStreamError);
    stream2.removeListener('end', readNextOnEnd);
    options.endEvents.forEach((eventName) => {
      stream2.removeListener(eventName, endListener2);
    });

    clearImmediate(postEndImmediate);
    clearTimeout(postEndTimeout);

    debug('Comparison finished.');
  }

  function onStreamError(err) {
    debug(`${streamName(this)} emitted error`, err);
    reject(err);
    done();
  }

  function doCompare(compareFn, type) {
    debug('Performing %s compare.', type);

    let hasResultOrError = false;
    try {
      const result = compareFn(state1, state2);
      if (result !== undefined && result !== null) {
        debug('Comparison produced a result:', result);
        hasResultOrError = true;
        resolve(result);
      }
    } catch (err) {
      debug('Comparison produced an error:', err);
      hasResultOrError = true;
      reject(err);
    }

    if (hasResultOrError) {
      done();
      return true;
    } if (type === CompareType.last) {
      resolve();
      done();
      return true;
    }

    return false;
  }

  /** Compares the states of the two streams non-incrementally.
   * @function
   * @name StreamComparePromise#checkpoint
   */
  promise.checkpoint = function checkpoint() {
    if (isDone) {
      debug('Ignoring checkpoint() after settling.');
      return;
    }

    doCompare(options.compare, CompareType.checkpoint);
  };

  /** Compares the states of the two streams non-incrementally then ends the
   * comparison whether or not compare produced a result or error.
   * @function
   * @name StreamComparePromise#end
   */
  promise.end = function end() {
    if (isDone) {
      debug('Ignoring end() after settling.');
      return;
    }

    doCompare(options.compare, CompareType.last);
  };

  // Note:  Add event listeners before endListeners so end/error is recorded
  options.events.forEach((eventName) => {
    if (listeners1[eventName]) {
      return;
    }

    if (options.abortOnError && eventName === 'error') {
      // Error event is always immediately fatal.
      return;
    }

    function listener(...args) {
      this.events.push({
        name: eventName,
        args: Array.prototype.slice.call(args)
      });

      if (options.incremental) {
        doCompare(options.incremental, CompareType.incremental);
      }
    }

    listeners1[eventName] = function listener1(...args) {
      debug(`'${eventName}' event from stream1.`);
      listener.apply(state1, args);
    };
    stream1.on(eventName, listeners1[eventName]);

    listeners2[eventName] = function listener2(...args) {
      debug(`'${eventName}' event from stream2.`);
      listener.apply(state2, args);
    };
    stream2.on(eventName, listeners2[eventName]);
  });

  /** Handles stream end events.
   * @this {!Readable}
   * @private
   */
  function endListener(state) {
    // Note:  If incremental is conclusive for 'end' event, this will be called
    // with isDone === true, since removeListener doesn't affect listeners for
    // an event which is already in-progress.
    if (state.ended || isDone) {
      return;
    }

    state.ended = true;
    ended += 1;

    debug(`${streamName(this)} has ended.`);

    if (options.incremental) {
      if (doCompare(options.incremental, CompareType.incremental)) {
        return;
      }
    }

    if (ended === 2) {
      const postEndCompare = function() {
        doCompare(options.compare, CompareType.last);
      };
      if (options.delay) {
        debug(`All streams have ended.  Delaying for ${options.delay
        }ms before final compare.`);
        postEndTimeout = setTimeout(postEndCompare, options.delay);
      } else {
        // Let pending I/O and callbacks complete to catch some errant events
        debug('All streams have ended.  Delaying before final compare.');
        postEndImmediate = setImmediate(postEndCompare);
      }
    }
  }

  function endListener1() {
    endListener.call(this, state1);
  }
  function endListener2() {
    endListener.call(this, state2);
  }
  options.endEvents.forEach((eventName) => {
    if (!options.abortOnError || eventName !== 'error') {
      stream1.on(eventName, endListener1);
      stream2.on(eventName, endListener2);
    }
  });

  if (options.abortOnError) {
    stream1.once('error', onStreamError);
    stream2.once('error', onStreamError);
  }

  /** Adds data to a stream state.
   *
   * This function should be a method of StreamState, but that would violate
   * our guarantees.  We call it as if it were to convey this behavior and to
   * avoid ESLint no-param-reassign.
   *
   * @this {!StreamState}
   * @param {*} data Data read from the stream for this StreamState.
   * @private
   */
  function addData(data) {
    if (options.objectMode) {
      if (!this.data) {
        this.data = [data];
      } else {
        this.data.push(data);
      }
      this.totalDataLen += 1;
    } else if (typeof data !== 'string' && !(data instanceof Buffer)) {
      throw new TypeError(`expected string or Buffer, got ${
        Object.prototype.toString.call(data)}.  Need objectMode?`);
    } else if (this.data === null || this.data === undefined) {
      this.data = data;
      this.totalDataLen += data.length;
    } else if (typeof this.data === 'string' && typeof data === 'string') {
      // perf:  Avoid unnecessary string concatenation
      if (this.data.length === 0) {
        this.data = data;
      } else if (data.length > 0) {
        this.data += data;
      }
      this.totalDataLen += data.length;
    } else if (this.data instanceof Buffer && data instanceof Buffer) {
      // perf:  Avoid unnecessary Buffer concatenation
      if (this.data.length === 0) {
        this.data = data;
      } else if (data.length > 0) {
        // FIXME:  Potential performance issue if data or this.data are large.
        // Should append to a Buffer we control and store a slice in .data
        this.data = Buffer.concat(
          [this.data, data],
          this.data.length + data.length
        );
      }
      this.totalDataLen += data.length;
    } else {
      throw new TypeError(`read returned ${
        Object.prototype.toString.call(data)}, previously ${
        Object.prototype.toString.call(this.data)
      }.  Need objectMode?`);
    }
  }

  /** Handles data read from the stream for a given state.
   * @private
   */
  function handleData(state, data) {
    debug('Read data from ', streamName(this));

    try {
      addData.call(state, data);
    } catch (err) {
      debug(`Error adding data from ${streamName(this)}`, err);
      reject(err);
      done();
      return;
    }

    if (options.incremental) {
      doCompare(options.incremental, CompareType.incremental);
    }
  }

  /** Reads from the non-ended stream which has the smallest totalDataLen.
   * @private
   */
  function readNext() {
    let stream, state;

    while (!isDone) {
      if (!state1.ended
          && (state2.ended || state1.totalDataLen <= state2.totalDataLen)) {
        stream = stream1;
        state = state1;
      } else if (!state2.ended) {
        stream = stream2;
        state = state2;
      } else {
        debug('All streams have ended.  No further reads.');
        return;
      }

      const data = stream.read();
      if (data === null) {
        debug(`Waiting for ${streamName(stream)} to be readable...`);
        stream.once('readable', readNext);
        return;
      }

      handleData.call(stream, state, data);
    }
  }

  /** Reads data when an 'end' event occurs.
   *
   * If 'end' occurs on the stream for which readNext is waiting for
   * 'readable', that event will never occur and it needs to start reading
   * from the other stream.
   *
   * @private
   */
  function readNextOnEnd() {
    // Remove pending 'readable' listener.
    // This is primarily for the case where readNext was listening for
    // 'readable' from the stream which _did_not_ emit 'end', which would
    // cause readNext to be listening twice when .read() returns null.
    // It also handles the case where a broken stream implementation emits
    // 'readable' after 'end'.
    stream1.removeListener('readable', readNext);
    stream2.removeListener('readable', readNext);
    return readNext.call(this);
  }

  switch (options.readPolicy) {
    case 'flowing':
      debug('Will read from streams in flowing mode.');
      stream1.on('data', handleData.bind(stream1, state1));
      stream2.on('data', handleData.bind(stream2, state2));
      break;

    case 'least':
      debug('Will read from stream with least output.');
      stream1.once('end', readNextOnEnd);
      stream2.once('end', readNextOnEnd);
      process.nextTick(readNext);
      break;

    default:
      debug('Not reading from streams.');
      break;
  }

  return promise;
}

streamCompare.makeIncremental = require('./lib/make-incremental');

module.exports = streamCompare;
