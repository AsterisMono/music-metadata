import * as Token from "token-types";

/**
 * Token for read FourCC
 * Ref: https://en.wikipedia.org/wiki/FourCC
 */
export const FourCcToken: Token.IToken<string> = {
  len: 4,

  get: (buf: Buffer, off: number): string => {
    const id = buf.toString("binary", off, off + FourCcToken.len);
    for (const c of id) {
      if (!((c >= " " && c <= "z") || c === '©')) {
        throw new Error("FourCC contains invalid characters");
      }
    }
    return id;
  },

  put: (buffer: Buffer, offset: number, id: string) => {
    const str = Buffer.from(id, 'binary');
    if (str.length !== 4)
      throw new Error("Invalid length");
    return str.copy(buffer, offset);
  }
};
