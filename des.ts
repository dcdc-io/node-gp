import { createCipheriv, createDecipheriv } from "crypto"

const getRetailMac = (keystr:string, datastr:string, ivstr:string) => {
    // bit pad
    let datastrpadded = datastr + "8000000000000000"
    datastrpadded = datastrpadded.substring(0, datastrpadded.length - (datastrpadded.length % 8))
    
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


let key = "7962D9ECE03D1ACD4C76089DCE131543"
let data = "72C29C2371CC9BDB65B779B8E8D37B29ECC154AA56A8799FAE2F498F76ED92F2"
let iv = "000000000000"

let mac = getRetailMac(key, data, iv)

