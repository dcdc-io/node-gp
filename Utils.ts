export const CHECK = (test: boolean, message: string) => { if (!test) throw message }
export const SW = (buffer:Buffer) => buffer.readUInt16BE(buffer.length - 2)
export const SW_OK = (buffer:Buffer) => SW(buffer) === 0x9000