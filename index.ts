import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto"
import { CardCrypto } from "./cardcrypto";
import { isArray } from "util";
import { readFile, readFileSync } from "fs"
import { loadAsync as loadZip } from "jszip"

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

const enccbc3des = (data:any, key:any) => {
    let cipher = createCipheriv('des-ede-cbc', key, Buffer.alloc(8))
    //let cipher = crypto.createCipher('des-ede3-cbc', key)
    cipher.setAutoPadding(false)

    let b = cipher.update(data)
    let f = cipher.final()
    return Buffer.concat([b, f], b.length + f.length)
}

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

        // setup
        let hostchallenge = randomBytes(8).toString("hex")

        // 1. select gp
        let selectresponse = await card.issueCommand(APDU_STATIC.selectGp)
        check(SW_OK(selectresponse), `unexpected ${SW(selectresponse).toString(16)}`)

        // 2. init update
        let initresponse = await card.issueCommand("8050000008" + hostchallenge + "28")
        check(SW_OK(initresponse), `unexpected ${SW(selectresponse).toString(16)}`)
        check(initresponse.length === 30, `init response length incorrect`)
        /***
         * key div data     10
         * key info         2
         * seq              2
         * challenge        6
         * cryptogram       8
         */
        let seq = initresponse.slice(12, 14).toString("hex")
        let session = {
            cmac:   enccbc3des(Buffer.from("0101" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
            rmac:   enccbc3des(Buffer.from("0102" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
            dek:    enccbc3des(Buffer.from("0181" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
            enc:    enccbc3des(Buffer.from("0182" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex"))
        }

        let cardchallenge = initresponse.slice(12, 20).toString("hex")
        let cardexpected = initresponse.slice(20, 28).toString("hex")
        let cardactual = enccbc3des(Buffer.from(hostchallenge + cardchallenge + "8000000000000000", "hex"), session.enc).slice(16, 24).toString("hex")
        let hostactual = enccbc3des(Buffer.from(cardchallenge + hostchallenge + "8000000000000000", "hex"), session.enc).slice(16, 24).toString("hex")
        check(cardexpected === cardactual, `card cryptogram failed`)

        let externalauth = "8482000010" + hostactual
        let sig = CardCrypto.getRetailMac(session.cmac.toString("hex"), externalauth, "0000000000000000")
        externalauth += sig.toString("hex")
        let authresponse = await card.issueCommand(externalauth)
        check(SW_OK(authresponse), `unexpected auth response ${SW(authresponse).toString(16)}`)
        
        console.log("gp device authenticated and ready")

        // list packages + applets
        let packagesraw = await card.issueCommand(APDU_STATIC.lsPackage)
        let appletsraw = await card.issueCommand(APDU_STATIC.lsApplet)

        // packages and applets - 1 aid len, n aid, 1 state, 1 privs
        let packages = readStatus(packagesraw)
        let applets = readStatus(appletsraw)

        
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