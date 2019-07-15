import { createCipheriv, createDecipheriv } from "crypto"
import JSZip, { JSZipObject } from "jszip"

export class CardCrypto {
    /**
     * Calculates a DES session key as per GP Card Spec 2.1.1 E.4.1.
     * @param data the input data
     * @param key the cipher key
     */
    static tripleDesCbc(data:any, key:any) {        
        const cipher = createCipheriv('des-ede-cbc', key, Buffer.alloc(8))
        cipher.setAutoPadding(false)
        const b = cipher.update(data)
        const f = cipher.final()
        return Buffer.concat([b, f], b.length + f.length)
    }
    static getRetailMac(keystr:string, datastr:string, ivstr:string) {
        // bit pad
        let datastrpadded = datastr + "8000000000000000"
        datastrpadded = datastrpadded.substring(0, datastrpadded.length - (datastrpadded.length % 16))
        
        let key = Buffer.from(keystr, "hex")
        let data = Buffer.from(datastrpadded, "hex")
        let iv = Buffer.from(ivstr, "hex")
    
        let k1 = key.slice(0, 8)
        let k2 = key.slice(8, 16)
    
        let c1 = () => {
            let c = createCipheriv("des-cbc", k1, Buffer.alloc(8))
            c.setAutoPadding(false)
            return c
        }
        let c2 = () => {
            let c = createDecipheriv("des-cbc", k2, Buffer.alloc(8))
            c.setAutoPadding(false)
            return c
        }
        
        let bc = data.length / 8
    
        let transformation1 = c1().update(data.slice(0, 8))
        let buffer = Buffer.alloc(8)
        for (let i = 1; i < bc; i++) {
            let block = data.slice(8 * i, 8 * (i + 1))
            for (let j = 0; j < 8; j++) {
                buffer[j] = transformation1[j] ^ block[j]
            }
            transformation1 = c1().update(buffer)    
        }
    
        let transformation3d = c2().update(transformation1)
        let transformation3 = c1().update(transformation3d)
    
        return transformation3
    }

    static async installForLoad(card:any, zdata:JSZip):Promise<Buffer> {
        const modulenames = ["Header", "Directory", "Import", "Applet", "Class", "Method", "StaticField", "Export", "ConstantPool", "RefLocation"]
        const modules = await modulenames
            .map((mod, o) => [mod, zdata.filter(f => f.endsWith(`${mod}.cap`))[0], o])
            .filter(x => x[1])
            .reduce(async (p, c) => { 
                p[c[2] as number] = { 
                    module: c[0] as string, 
                    data: await (c[1] as JSZipObject).async("nodebuffer") 
                };
                return p 
            }, [] as any)
        
        console.log(modules)


        const aid = modules.find((m:any) => m.module === "Header").data.slice(13, 13 + modules.find((m:any) => m.module === "Header").data[12])

        let sw:any = null
        let apdu = `80e60200${(aid.length + 5 + 256).toString(16).substring(1)}${(aid.length + 256).toString(16).substring(1)}${aid.toString("hex")}0000000001`
        sw = await card.issueCommand(apdu)
        // TODO: check sw == 00 90 00


        return new Buffer(0)
    }
}