import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto"
import { CardCrypto } from "./CardCrypto";
import { isArray } from "util";
import { readFile, readFileSync } from "fs"
import { loadAsync as loadZip } from "jszip"
import GlobalPlatform from "./GlobalPlatform";

const smartcard = require('smartcard')
const Devices = smartcard.Devices
const devices = new Devices()

const authkey = "404142434445464748494a4b4c4d4e4f"

const SW = (buffer:Buffer) => buffer.readUInt16BE(buffer.length - 2)
const SW_OK = (buffer:Buffer) => SW(buffer) === 0x9000

const APDU_STATIC = {
    selectGp: "00a4040000",
    lsPackage:"80f22000024f00",
    lsApplet:"80f24000024f00",
}

const check = (test: boolean, message: string) => { if (!test) throw message }

const hbyte = (x:any) => x.toString("16").replace(/(^\d$)/, "0$1")

const readStatus = (response:Buffer) => {
    let mode = 0
    let read = 0
    let output:any[] = []
    response.forEach((e: any) => {
        switch (mode) {
            case 0:
                output.push({aid:[]})
                read = e
                mode = 1
                break
            case 1:
                output[output.length - 1].aid.push(e)    
                read--
                if (read === 0)
                    mode = 2
                break
            case 2:
                mode = 3
                break
            case 3:
                mode = 4
                break
            case 4:
                if (e === 144)
                    mode = 5
                else {
                    output.push({aid:[]})
                    read = e
                    mode = 1
                }
                break
            case 5:
                break                
        }  
    })
    return output
}

devices.on('device-activated', ({ device }:any) => {
    // device.setShareMode(2) // TODO: benbenbenbenbenben/smartcard
    device.on('card-inserted', async ({ card }:any) => {

        let gpcard = new GlobalPlatform(card)
        await gpcard.connect()

        let packages = await gpcard.getPackages()
        let applets = await gpcard.getApplets()
        
        console.log(packages)
        console.log(applets)
        //console.log(appletsraw)

        // delete packages (recursive = 80)
        let r = await Promise.all(packages.map(p => card.issueCommand(`80e40080${hbyte(p.aid.length + 2)}4f${hbyte(p.aid.length)}${Buffer.from(p.aid).toString("hex")}00`)))
        console.log(r)

        // load cap file (e.g. ndef tag)
        // D:\javacard-ndef-full-plain.cap
        const data = readFileSync("d:/javacard-ndef-full-plain.cap")
        const zdata = await loadZip(data)
        zdata.forEach((path,file) => {
            console.log(path)
        })

        const loadresponse = await CardCrypto.installForLoad(card, zdata)
        check(SW_OK(loadresponse), `unexpected response for INSTALL (for load) ${SW(loadresponse).toString(16)}`)

    })
}); 