import {assert} from 'chai';
import * as mm from '../src';
import * as path from 'path';
import * as fs from "fs-extra";

const t = assert;

describe("Decode Monkey's Audio (.ape)", () => {

  const samplePath = path.join(__dirname, 'samples');

  function checkFormat(format) {
    t.strictEqual(format.bitsPerSample, 16, 'format.bitsPerSample');
    t.strictEqual(format.sampleRate, 44100, 'format.sampleRate = 44.1 [kHz]');
    t.strictEqual(format.numberOfChannels, 2, 'format.numberOfChannels 2 (stereo)');
    t.strictEqual(format.duration, 1.2134240362811792, 'duration [sec]');
  }

  function checkCommon(common) {
    t.strictEqual(common.title, '07. Shadow On The Sun', 'common.title');
    t.strictEqual(common.artist, 'Audioslave', 'common.artist');
    t.deepEqual(common.artists, ['Audioslave', 'Chris Cornell'], 'common.artists');
    // Used to be ['Audioslave'], but 'APEv2/Album Artist'->'albumartist' is not set in actual file!
    t.deepEqual(common.albumartist, undefined, 'common.albumartist');
    t.strictEqual(common.album, 'Audioslave', 'common.album');
    t.strictEqual(common.year, 2002, 'common.year');
    t.deepEqual(common.genre, ['Alternative'], 'common.genre');
    t.deepEqual(common.track, {no: 7, of: null}, 'common.track');
    t.deepEqual(common.disk, {no: 3, of: null}, 'common.disk');
    t.strictEqual(common.picture[0].format, 'image/jpeg', 'common.picture 0 format');
    t.strictEqual(common.picture[0].data.length, 48658, 'common.picture 0 length');
    t.strictEqual(common.picture[1].format, 'image/jpeg', 'common.picture 1 format');
    t.strictEqual(common.picture[1].data.length, 48658, 'common.picture 1 length');
  }

  function checkNative(ape: mm.INativeTagDict) {
    t.deepEqual(ape.ENSEMBLE, ['Audioslave']);
    t.deepEqual(ape.Artist, ['Audioslave', 'Chris Cornell']);
    t.strictEqual(ape['Cover Art (Front)'][0].data.length, 48658, 'raw cover art (front) length');
    t.strictEqual(ape['Cover Art (Back)'][0].data.length, 48658, 'raw cover art (front) length');
  }

  it('from a file', () => {

    return mm.parseFile(path.join(samplePath, 'monkeysaudio.ape'), {native: true}).then(md => {

      checkFormat(md.format);

      checkCommon(md.common);

      t.ok(md.native && md.native.APEv2, 'should include native APEv2 tags');
      checkNative(mm.orderTags(md.native.APEv2));
    });

  });

  it('from a stream', () => {

    const stream = fs.createReadStream(path.join(samplePath, 'monkeysaudio.ape'));
    return mm.parseStream(stream, 'audio/ape', {native: true})
      .then(md => {
        checkFormat(md.format);

        checkCommon(md.common);

        t.ok(md.native && md.native.APEv2, 'should include native APEv2 tags');
        checkNative(mm.orderTags(md.native.APEv2));
      });
  });

});
