import {} from "mocha";
import {assert} from 'chai';
import * as mm from '../src';

import * as path from 'path';
import {SourceStream} from "./util";

const t = assert;

describe("MPEG parsing", () => {

  it("sync efficiency, using stream", function() {

    this.skip(); // ToDo

    this.timeout(15000); // It takes a log time to parse, due to sync errors and assumption it is VBR (which is caused by the funny 224 kbps frame)

    const emptyStreamSize = 5 * 1024 * 1024;

    const buf = new Buffer(emptyStreamSize).fill(0);
    const streamReader = new SourceStream(buf);

    return mm.parseStream(streamReader, 'audio/mpeg', {duration: true, native: true}).then((result) => {
      throw new Error('Should fail');
    }).catch((err) => {
      t.isDefined(err);
      t.strictEqual(err.message, "expected file identifier 'ID3' not found");
    });

  });

  it("sync efficiency, using file", function() {

    this.skip(); // ToDo

    this.timeout(15000); // It takes a log time to parse, due to sync errors and assumption it is VBR (which is caused by the funny 224 kbps frame)

    const filePath = path.join(__dirname, "samples", "issue#26", "13 - Zillertaler Schürzenjäger - Die Welt is koa Glashaus.mp3");

    return mm.parseFile(filePath, {duration: true, native: true}).then((result) => {
      throw new Error('Should fail');
    }).catch((err) => {
      t.isDefined(err);
      t.strictEqual(err.message, "expected file identifier 'ID3' not found");
    });

  });

  describe("mpeg parsing fails for irrelevant attributes #14", () => {

    // tslint:disable:only-arrow-functions
    it("should decode 04 - You Don't Know.mp3", function() {

      this.skip(); // ToDo

      /**
       * File has id3v2.3 & id3v1 tags
       * First frame is 224 kbps, rest 320 kbps
       * After id3v2.3, lots of 0 padding
       */
      this.timeout(15000); // It takes a log time to parse, due to sync errors and assumption it is VBR (which is caused by the funny 224 kbps frame)

      const filePath = path.join(__dirname, 'samples', "04 - You Don't Know.mp3");

      function checkFormat(format) {
        t.strictEqual(format.headerType, 'ID3v2.4', 'format.type');
        t.strictEqual(format.sampleRate, 44100, 'format.sampleRate = 44.1 kHz');
        t.strictEqual(format.numberOfSamples, 9099648, 'format.numberOfSamples'); // FooBar says 3:26.329 seconds (9.099.119 samples)
        t.strictEqual(format.duration, 206.3412244897959, 'format.duration'); // FooBar says 3:26.329 seconds (9.099.119 samples)
        t.strictEqual(format.bitrate, 320000, 'format.bitrate = 128 kbit/sec');
        t.strictEqual(format.numberOfChannels, 2, 'format.numberOfChannels 2 (stereo)');

        // t.strictEqual(format.encoder, 'LAME3.91', 'format.encoder');
        // t.strictEqual(format.codecProfile, 'CBR', 'format.codecProfile');
      }

      function checkCommon(common) {
        t.strictEqual(common.title, "You Don't Know", 'common.title');
        t.deepEqual(common.artists, ['Reel Big Fish'], 'common.artists');
        t.strictEqual(common.albumartist, 'Reel Big Fish', 'common.albumartist');
        t.strictEqual(common.album, 'Why Do They Rock So Hard?', 'common.album');
        t.strictEqual(common.year, 1998, 'common.year');
        t.strictEqual(common.track.no, 4, 'common.track.no');
        t.strictEqual(common.track.of, null, 'common.track.of');
        t.strictEqual(common.disk.no, null, 'common.disk.no');
        t.strictEqual(common.disk.of, null, 'common.disk.of');
        t.strictEqual(common.genre[0], 'Ska-Punk', 'common.genre');
      }

      function checkNative(native: mm.INativeTagDict) {

        t.deepEqual(native.TPE2, ['Reel Big Fish'], 'native: TPE2');
        t.deepEqual(native.TIT2, ["You Don't Know"], 'native: TIT2');
        t.deepEqual(native.TALB, ['Why Do They Rock So Hard?'], 'native: TALB');
        t.deepEqual(native.TPE1, ['Reel Big Fish'], 'native: TPE1');
        t.deepEqual(native.TCON, ['Ska-Punk'], 'native: TCON');
        t.deepEqual(native.TYER, ['1998'], 'native: TYER');
        t.deepEqual(native.TCOM, ['CA'], 'native: TCOM'); // ToDo: common property?
        t.deepEqual(native.TRCK, ['04'], 'native: TRCK');
        t.deepEqual(native.COMM, [{description: "", language: "eng", text: "Jive"}], 'native: COMM');
      }

      return mm.parseFile(filePath, {duration: true, native: true}).then((result) => {

        checkFormat(result.format);
        checkCommon(result.common);
        checkNative(mm.orderTags(result.native['ID3v2.4']));
      });

    });

    it("should decode 07 - I'm Cool.mp3", function() {
      // 'LAME3.91' found on position 81BCF=531407

      this.skip(); // ToDo

      const filePath = path.join(__dirname, 'samples', "07 - I'm Cool.mp3");

      function checkFormat(format) {
        t.strictEqual(format.headerType, 'ID3v2.4', 'format.type');
        t.strictEqual(format.sampleRate, 44100, 'format.sampleRate = 44.1 kHz');
        // t.strictEqual(format.numberOfSamples, 8040655, 'format.numberOfSamples'); // FooBar says 8.040.655 samples
        t.strictEqual(format.duration, 200.9606, 'format.duration'); // FooBar says 3:26.329 seconds
        t.strictEqual(format.bitrate, 320000, 'format.bitrate = 128 kbit/sec');
        t.strictEqual(format.numberOfChannels, 2, 'format.numberOfChannels 2 (stereo)');
        // t.strictEqual(format.encoder, 'LAME3.98r', 'format.encoder'); // 'LAME3.91' found on position 81BCF=531407// 'LAME3.91' found on position 81BCF=531407
        // t.strictEqual(format.codecProfile, 'CBR', 'format.codecProfile');
      }

      function checkCommon(common) {
        t.strictEqual(common.title, "I'm Cool", 'common.title');
        t.deepEqual(common.artists, ['Reel Big Fish'], 'common.artists');
        t.strictEqual(common.albumartist, 'Reel Big Fish', 'common.albumartist');
        t.strictEqual(common.album, 'Why Do They Rock So Hard?', 'common.album');
        t.strictEqual(common.year, 1998, 'common.year');
        t.strictEqual(common.track.no, 7, 'common.track.no');
        t.strictEqual(common.track.of, null, 'common.track.of');
        t.strictEqual(common.disk.no, null, 'common.disk.no');
        t.strictEqual(common.disk.of, null, 'common.disk.of');
        t.strictEqual(common.genre[0], 'Ska-Punk', 'common.genre');
      }

      function checkNative(native: mm.INativeTagDict) {
        t.deepEqual(native.TPE2, ['Reel Big Fish'], 'native: TPE2');
        t.deepEqual(native.TIT2, ["I'm Cool"], 'native: TIT2');
        t.deepEqual(native.TALB, ['Why Do They Rock So Hard?'], 'native: TALB');
        t.deepEqual(native.TPE1, ['Reel Big Fish'], 'native: TPE1');
        t.deepEqual(native.TCON, ['Ska-Punk'], 'native: TCON');
        t.deepEqual(native.TYER, ['1998'], 'native: TYER');
        t.deepEqual(native.TCOM, ['CA'], 'native: TCOM'); // ToDo: common property?
        t.deepEqual(native.TRCK, ['07'], 'native: TRCK');
        t.deepEqual(native.COMM, [{description: "", language: "eng", text: "Jive"}], 'native: COMM');
      }

      return mm.parseFile(filePath, {duration: true, native: true}).then((result) => {

        checkFormat(result.format);
        checkCommon(result.common);
        checkNative(mm.orderTags(result.native['ID3v2.4']));
      });
    });
  });

});
