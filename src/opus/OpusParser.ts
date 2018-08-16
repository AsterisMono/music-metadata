'use strict';
import * as Opus from './Opus';
import {IPageHeader} from "../ogg/Ogg";
import * as Token from "token-types";
import {VorbisParser} from "../vorbis/VorbisParser";
import {IOptions} from "../index";
import {INativeMetadataCollector} from "../common/MetadataCollector";

/**
 * Opus parser
 * Internet Engineering Task Force (IETF) - RFC 6716
 * Used by OggParser
 */
export class OpusParser extends VorbisParser {

  private idHeader: Opus.IIdHeader;

  constructor(metadata: INativeMetadataCollector, options: IOptions) {
    super(metadata, options);
  }

  /**
   * Parse first Opus Ogg page
   * @param {IPageHeader} header
   * @param {Buffer} pageData
   */
  protected parseFirstPage(header: IPageHeader, pageData: Buffer) {
    // Parse Opus ID Header
    this.idHeader = new Opus.IdHeader(pageData.length).get(pageData, 0);
    if (this.idHeader.magicSignature !== "OpusHead")
      throw new Error("Illegal ogg/Opus magic-signature");
    this.metadata.setFormat('dataformat', 'Ogg/Opus');
    this.metadata.setFormat('sampleRate', this.idHeader.inputSampleRate);
    this.metadata.setFormat('numberOfChannels', this.idHeader.channelCount);
  }

  protected parseFullPage(pageData: Buffer) {
    const magicSignature = new Token.StringType(8, 'ascii').get(pageData, 0);
    switch (magicSignature) {
      case 'OpusTags':
        this.parseUserCommentList(pageData, 8);
        break;
      default:
        break;
    }
  }

  protected calculateDuration(header: IPageHeader) {
    if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
      // Calculate duration
      this.metadata.setFormat('numberOfSamples', header.absoluteGranulePosition - this.idHeader.preSkip);
      this.metadata.setFormat('duration', this.metadata.format.numberOfSamples / this.idHeader.inputSampleRate);
    }
  }

}
